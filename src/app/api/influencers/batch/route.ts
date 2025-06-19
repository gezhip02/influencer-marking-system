import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateId } from '@/lib/snowflake';
import { serializeBigInt } from '@/lib/bigint-serializer';

// 批量添加标签
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action;

    switch (action) {
      case 'addTags':
      case 'add-tags':
        return await handleAddTags(body);
      case 'removeTags':
      case 'remove-tags':
        return await handleRemoveTags(body);
      case 'updateStatus':
      case 'update-status':
        return await handleUpdateStatus(body);
      case 'export':
        return await handleExport(body);
      case 'import':
        return await handleImport(body);
      case 'update':
        return await handleBatchUpdate(body);
      case 'delete':
        return await handleBatchDelete(body);
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in batch operation:', error);
    return NextResponse.json(
      { error: 'Failed to perform batch operation', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// 批量添加标签
async function handleAddTags(body: any) {
  const { influencerIds, tagIds } = body;

  if (!influencerIds || !Array.isArray(influencerIds) || influencerIds.length === 0) {
    return NextResponse.json(
      { error: 'Influencer IDs are required' },
      { status: 400 }
    );
  }

  if (!tagIds || !Array.isArray(tagIds) || tagIds.length === 0) {
    return NextResponse.json(
      { error: 'Tag IDs are required' },
      { status: 400 }
    );
  }

  const result = await prisma.$transaction(async (tx) => {
    const bigIntInfluencerIds = influencerIds.map(id => BigInt(id));
    const bigIntTagIds = tagIds.map(id => BigInt(id));

    // 获取现有的标签关联，避免重复
    const existingRelations = await tx.influencerTag.findMany({
      where: {
        influencerId: { in: bigIntInfluencerIds },
        tagId: { in: bigIntTagIds }
      }
    });

    const existingRelationKeys = new Set(
      existingRelations.map(relation => `${relation.influencerId}-${relation.tagId}`)
    );

    // 创建新的标签关联
    const newRelations = [];
    for (const influencerId of bigIntInfluencerIds) {
      for (const tagId of bigIntTagIds) {
        const key = `${influencerId}-${tagId}`;
        if (!existingRelationKeys.has(key)) {
          newRelations.push({
            id: generateId(),
            influencerId,
            tagId,
            confidence: 1.0,
            source: 'manual',
            createdAt: Math.floor(Date.now() / 1000),
            createdBy: null
          });
        }
      }
    }

    if (newRelations.length > 0) {
      await tx.influencerTag.createMany({
        data: newRelations
      });
    }

    return {
      addedRelations: newRelations.length,
      skippedRelations: (bigIntInfluencerIds.length * bigIntTagIds.length) - newRelations.length
    };
  });

  return NextResponse.json({
    message: `Successfully added tags to influencers`,
    ...result
  });
}

// 批量移除标签
async function handleRemoveTags(body: any) {
  const { influencerIds, tagIds } = body;

  if (!influencerIds || !Array.isArray(influencerIds) || influencerIds.length === 0) {
    return NextResponse.json(
      { error: 'Influencer IDs are required' },
      { status: 400 }
    );
  }

  if (!tagIds || !Array.isArray(tagIds) || tagIds.length === 0) {
    return NextResponse.json(
      { error: 'Tag IDs are required' },
      { status: 400 }
    );
  }

  const result = await prisma.influencerTag.deleteMany({
    where: {
      influencerId: { in: influencerIds.map(id => BigInt(id)) },
      tagId: { in: tagIds.map(id => BigInt(id)) }
    }
  });

  return NextResponse.json({
    message: `Successfully removed tags from influencers`,
    removedRelations: result.count
  });
}

// 批量更新状态
async function handleUpdateStatus(body: any) {
  const { influencerIds, status } = body;

  if (!influencerIds || !Array.isArray(influencerIds) || influencerIds.length === 0) {
    return NextResponse.json(
      { error: 'Influencer IDs are required' },
      { status: 400 }
    );
  }

  if (status === undefined || status === null) {
    return NextResponse.json(
      { error: 'Status is required' },
      { status: 400 }
    );
  }

  const validStatuses = [0, 1]; // 0=禁用, 1=启用
  if (!validStatuses.includes(Number(status))) {
    return NextResponse.json(
      { error: 'Invalid status. Must be 0 (disabled) or 1 (enabled)' },
      { status: 400 }
    );
  }

  const result = await prisma.influencer.updateMany({
    where: {
      id: { in: influencerIds.map(id => BigInt(id)) }
    },
    data: {
      status: Number(status)
    }
  });

  return NextResponse.json({
    message: `Successfully updated status of ${result.count} influencer(s)`,
    updatedCount: result.count
  });
}

// 批量导出
async function handleExport(body: any) {
  const { influencerIds, filters, format = 'json' } = body;
  
  // 支持两种模式：指定IDs或根据filters导出
  let whereClause = {};
  
  if (influencerIds && Array.isArray(influencerIds) && influencerIds.length > 0) {
    whereClause = {
      id: { in: influencerIds.map((id: string) => BigInt(id)) }
    };
  } else if (filters) {
    // 使用filters构建查询条件
    const { page = 1, limit = 1000 } = filters;
    // 这里可以根据需要添加更多过滤条件
  } else {
    // 默认导出前100条数据
    whereClause = {};
  }

  // 获取达人数据、平台数据和标签数据
  const [influencers, platforms, allTags, allTagRelations] = await Promise.all([
    prisma.influencer.findMany({
      where: {
        ...whereClause,
        status: 1 // 只导出有效数据
      }
    }),
    prisma.platform.findMany(),
    prisma.tag.findMany({
      where: { status: 1 }
    }),
    prisma.influencerTag.findMany({
      where: { status: 1 }
    })
  ]);

  // 创建映射表提高性能
  const platformMap = new Map(platforms.map(p => [p.id.toString(), p]));
  const tagMapById = new Map(allTags.map(t => [t.id.toString(), t]));
  const influencerTagMap = new Map();
  
  allTagRelations.forEach(relation => {
    const influencerId = relation.influencerId.toString();
    const tag = tagMapById.get(relation.tagId.toString());
    if (tag) {
      if (!influencerTagMap.has(influencerId)) {
        influencerTagMap.set(influencerId, []);
      }
      influencerTagMap.get(influencerId).push(tag);
    }
  });

  // 处理数据，包含关联数据
  const processedInfluencers = influencers.map(influencer => {
    const platform = platformMap.get(influencer.platformId.toString());
    const tags = influencerTagMap.get(influencer.id.toString()) || [];
    
    return {
      ...influencer,
      platformName: platform?.displayName || platform?.name || '',
      tagNames: tags.map((tag: any) => tag.displayName || tag.name).filter(Boolean).join(', ')
    };
  });

  const serializedInfluencers = serializeBigInt(processedInfluencers);

  if (format === 'csv') {
    // 生成CSV格式 - 包含所有字段
    const csvHeaders = [
      'Platform', 'Platform User ID', 'Username', 'Display Name', 'Avatar URL', 'Bio',
      'WhatsApp Account', 'Email', 'Phone', 'WeChat', 'Telegram',
      'Country', 'Region', 'City', 'Timezone', 'Zip Code', 'Province', 'Street',
      'Address 1', 'Address 2', 'Receiver Phone', 'Receive Name',
      'Gender', 'Age Range', 'Language',
      'Followers Count', 'Following Count', 'Total Likes', 'Total Videos', 'Avg Video Views',
      'Engagement Rate', 'Primary Category', 'Content Style', 'Content Language', 'Tendency Category',
      'Quality Score', 'Risk Level', 'Blacklist Reason',
      'Data Source', 'Last Data Sync', 'Data Accuracy',
      'Cooperate Status', 'Has Sign', 'Last Cooperate Time', 'Cooperate Product Count',
      'Fulfill Count', 'Cooperate Product Name', 'Correspond Score', 'Avg Fulfill Days',
      'Video Style', 'Video Style For Us', 'Content Score', 'Order Score',
      'Ads ROI', 'GMV Total', 'GMV Country Rank', 'GMV Video', 'GMV Live',
      'GPM Video', 'GPM Live', 'Status', 'Notes', 'Tags', 'Created At', 'Updated At'
    ];

    const csvRows = serializedInfluencers.map((influencer: any) => [
      influencer.platformName || influencer.platform?.displayName || '', // 使用平台名称
      String(influencer.platformUserId || '').replace(/^(\d+)$/, '="$1"'), // 只对纯数字ID添加Excel公式避免科学计数法
      influencer.username || '',
      influencer.displayName || '',
      influencer.avatarUrl || '',
      influencer.bio || '',
      influencer.whatsappAccount || '',
      influencer.email || '',
      influencer.phone || '',
      influencer.wechat || '',
      influencer.telegram || '',
      influencer.country || '',
      influencer.region || '',
      influencer.city || '',
      influencer.timezone || '',
      influencer.zipCode || '',
      influencer.province || '',
      influencer.street || '',
      influencer.address1 || '',
      influencer.address2 || '',
      influencer.receiverPhone || '',
      influencer.receiveName || '',
      influencer.gender || '',
      influencer.ageRange || '',
      influencer.language || '',
      influencer.followersCount || 0, // 保持数字格式
      influencer.followingCount || 0,
      influencer.totalLikes || 0,
      influencer.totalVideos || 0,
      influencer.avgVideoViews || 0,
      String(influencer.engagementRate || ''),
      influencer.primaryCategory || '',
      influencer.contentStyle ? JSON.stringify(influencer.contentStyle) : '',
      influencer.contentLanguage || '',
      influencer.tendencyCategory ? JSON.stringify(influencer.tendencyCategory) : '',
      String(influencer.qualityScore || ''),
      influencer.riskLevel || '',
      influencer.blacklistReason || '',
      influencer.dataSource || '',
      String(influencer.lastDataSync || ''),
      String(influencer.dataAccuracy || ''),
      String(influencer.cooperateStatus || ''),
      String(influencer.hasSign || ''),
      String(influencer.lastCooperateTime || ''),
      String(influencer.cooperateProductCount || ''),
      String(influencer.fulfillCount || ''),
      influencer.cooperateProductName || '',
      String(influencer.correspondScore || ''),
      String(influencer.avgFulfillDays || ''),
      influencer.videoStyle ? JSON.stringify(influencer.videoStyle) : '',
      influencer.videoStyleForUs ? JSON.stringify(influencer.videoStyleForUs) : '',
      String(influencer.contentScore || ''),
      String(influencer.orderScore || ''),
      String(influencer.adsRoi || ''),
      influencer.gmvTotal || '',
      String(influencer.gmvCountryRank || ''),
      influencer.gmvVideo || '',
      influencer.gmvLive || '',
      influencer.gpmVideo || '',
      influencer.gpmLive || '',
      String(influencer.status || ''),
      influencer.notes || '',
      influencer.tagNames || '', // 标签字段
      String(influencer.createdAt || ''),
      String(influencer.updatedAt || '')
    ]);

    // 添加BOM以正确显示中文
    const BOM = '\uFEFF';
    const csvContent = BOM + [csvHeaders, ...csvRows]
      .map(row => row.map((field: any) => {
        const strField = String(field);
        // 如果包含逗号、换行符或引号，需要用引号包围
        if (strField.includes(',') || strField.includes('\n') || strField.includes('"')) {
          return `"${strField.replace(/"/g, '""')}"`;
        }
        return strField;
      }).join(','))
      .join('\n');

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="influencers_export_${new Date().toISOString().split('T')[0]}.csv"`
      }
    });
  }

  // 默认返回JSON格式
  return NextResponse.json({
    data: serializedInfluencers,
    exportedCount: serializedInfluencers.length,
    exportedAt: new Date().toISOString()
  });
}

// 批量导入
async function handleImport(body: any) {
  const { data, format = 'json' } = body;

  if (!data) {
    return NextResponse.json(
      { error: 'Import data is required' },
      { status: 400 }
    );
  }

  let influencersData: any[] = [];

  try {
    if (format === 'csv') {
      // 处理CSV格式数据
      // 这里假设前端已经解析了CSV数据并发送JSON格式
      influencersData = Array.isArray(data) ? data : [];
    } else {
      // 处理JSON格式数据
      influencersData = Array.isArray(data) ? data : [data];
    }

    if (influencersData.length === 0) {
      return NextResponse.json(
        { error: 'No valid data to import' },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      let imported = 0;
      let updated = 0;
      let errors = 0;
      const errorDetails: string[] = [];

      for (const influencerData of influencersData) {
        try {
          // 验证必需字段 - 只需要 platformUserId 和平台信息
          const platformUserId = influencerData.platformUserId || influencerData['Platform User ID'];
          const platform = influencerData.platformId || influencerData.Platform;
          
          if (!platformUserId || !platform) {
            errorDetails.push(`Missing required fields (Platform User ID and Platform) for record: ${JSON.stringify(influencerData)}`);
            errors++;
            continue;
          }

          // 查找平台 - 支持通过名称或ID查找
          let platformId = platform;
          if (typeof platformId === 'string' && isNaN(Number(platformId))) {
            // 如果是平台名称，查找对应的ID
            const platformRecord = await tx.platform.findFirst({
              where: { 
                OR: [
                  { name: platformId },
                  { displayName: platformId }
                ]
              }
            });
            
            if (platformRecord) {
              platformId = platformRecord.id.toString();
            } else {
              errorDetails.push(`Platform not found: ${platformId} for record: ${JSON.stringify(influencerData)}`);
              errors++;
              continue;
            }
          }

          // 检查是否已存在 - 通过 platformUserId 和 platformId 组合判断
          const existingInfluencer = await tx.influencer.findFirst({
            where: {
              platformUserId: String(platformUserId),
              platformId: BigInt(platformId)
            }
          });

          // 解析JSON字段
          const parseJsonField = (field: any) => {
            if (!field) return null;
            if (typeof field === 'string') {
              try {
                return JSON.parse(field);
              } catch {
                return null;
              }
            }
            return field;
          };

          // 构建完整的数据载荷
          const influencerPayload = {
            platformId: BigInt(platformId),
            platformUserId: String(platformUserId),
            username: influencerData.username || influencerData.Username || null,
            displayName: influencerData.displayName || influencerData['Display Name'] || null,
            avatarUrl: influencerData.avatarUrl || influencerData['Avatar URL'] || null,
            bio: influencerData.bio || influencerData.Bio || null,
            whatsappAccount: influencerData.whatsappAccount || influencerData['WhatsApp Account'] || null,
            email: influencerData.email || influencerData.Email || null,
            phone: influencerData.phone || influencerData.Phone || null,
            wechat: influencerData.wechat || influencerData.WeChat || null,
            telegram: influencerData.telegram || influencerData.Telegram || null,
            country: influencerData.country || influencerData.Country || null,
            region: influencerData.region || influencerData.Region || null,
            city: influencerData.city || influencerData.City || null,
            timezone: influencerData.timezone || influencerData.Timezone || null,
            zipCode: influencerData.zipCode || influencerData['Zip Code'] || null,
            province: influencerData.province || influencerData.Province || null,
            street: influencerData.street || influencerData.Street || null,
            address1: influencerData.address1 || influencerData['Address 1'] || null,
            address2: influencerData.address2 || influencerData['Address 2'] || null,
            receiverPhone: influencerData.receiverPhone || influencerData['Receiver Phone'] || null,
            receiveName: influencerData.receiveName || influencerData['Receive Name'] || null,
            gender: influencerData.gender || influencerData.Gender || null,
            ageRange: influencerData.ageRange || influencerData['Age Range'] || null,
            language: influencerData.language || influencerData.Language || null,
            followersCount: Number(influencerData.followersCount || influencerData['Followers Count'] || 0),
            followingCount: Number(influencerData.followingCount || influencerData['Following Count'] || 0),
            totalLikes: Number(influencerData.totalLikes || influencerData['Total Likes'] || 0),
            totalVideos: Number(influencerData.totalVideos || influencerData['Total Videos'] || 0),
            avgVideoViews: Number(influencerData.avgVideoViews || influencerData['Avg Video Views'] || 0),
            engagementRate: influencerData.engagementRate || influencerData['Engagement Rate'] ? Number(influencerData.engagementRate || influencerData['Engagement Rate']) : null,
            primaryCategory: influencerData.primaryCategory || influencerData['Primary Category'] || null,
            contentStyle: parseJsonField(influencerData.contentStyle || influencerData['Content Style']),
            contentLanguage: influencerData.contentLanguage || influencerData['Content Language'] || null,
            tendencyCategory: parseJsonField(influencerData.tendencyCategory || influencerData['Tendency Category']),
            qualityScore: influencerData.qualityScore || influencerData['Quality Score'] ? Number(influencerData.qualityScore || influencerData['Quality Score']) : null,
            riskLevel: influencerData.riskLevel || influencerData['Risk Level'] || 'LOW',
            blacklistReason: influencerData.blacklistReason || influencerData['Blacklist Reason'] || null,
            dataSource: influencerData.dataSource || influencerData['Data Source'] || 'import',
            lastDataSync: influencerData.lastDataSync || influencerData['Last Data Sync'] ? Number(influencerData.lastDataSync || influencerData['Last Data Sync']) : null,
            dataAccuracy: influencerData.dataAccuracy || influencerData['Data Accuracy'] ? Number(influencerData.dataAccuracy || influencerData['Data Accuracy']) : null,
            cooperateStatus: influencerData.cooperateStatus || influencerData['Cooperate Status'] ? Number(influencerData.cooperateStatus || influencerData['Cooperate Status']) : null,
            hasSign: influencerData.hasSign || influencerData['Has Sign'] ? Number(influencerData.hasSign || influencerData['Has Sign']) : null,
            lastCooperateTime: influencerData.lastCooperateTime || influencerData['Last Cooperate Time'] ? Number(influencerData.lastCooperateTime || influencerData['Last Cooperate Time']) : null,
            cooperateProductCount: influencerData.cooperateProductCount || influencerData['Cooperate Product Count'] ? Number(influencerData.cooperateProductCount || influencerData['Cooperate Product Count']) : null,
            fulfillCount: influencerData.fulfillCount || influencerData['Fulfill Count'] ? Number(influencerData.fulfillCount || influencerData['Fulfill Count']) : null,
            cooperateProductName: influencerData.cooperateProductName || influencerData['Cooperate Product Name'] || null,
            correspondScore: influencerData.correspondScore || influencerData['Correspond Score'] ? Number(influencerData.correspondScore || influencerData['Correspond Score']) : null,
            avgFulfillDays: influencerData.avgFulfillDays || influencerData['Avg Fulfill Days'] ? Number(influencerData.avgFulfillDays || influencerData['Avg Fulfill Days']) : null,
            videoStyle: parseJsonField(influencerData.videoStyle || influencerData['Video Style']),
            videoStyleForUs: parseJsonField(influencerData.videoStyleForUs || influencerData['Video Style For Us']),
            contentScore: influencerData.contentScore || influencerData['Content Score'] ? Number(influencerData.contentScore || influencerData['Content Score']) : null,
            orderScore: influencerData.orderScore || influencerData['Order Score'] ? Number(influencerData.orderScore || influencerData['Order Score']) : null,
            adsRoi: influencerData.adsRoi || influencerData['Ads ROI'] ? Number(influencerData.adsRoi || influencerData['Ads ROI']) : null,
            gmvTotal: influencerData.gmvTotal || influencerData['GMV Total'] || null,
            gmvCountryRank: influencerData.gmvCountryRank || influencerData['GMV Country Rank'] ? Number(influencerData.gmvCountryRank || influencerData['GMV Country Rank']) : null,
            gmvVideo: influencerData.gmvVideo || influencerData['GMV Video'] || null,
            gmvLive: influencerData.gmvLive || influencerData['GMV Live'] || null,
            gpmVideo: influencerData.gpmVideo || influencerData['GPM Video'] || null,
            gpmLive: influencerData.gpmLive || influencerData['GPM Live'] || null,
            status: influencerData.status || influencerData.Status ? Number(influencerData.status || influencerData.Status) : 1,
            notes: influencerData.notes || influencerData.Notes || null,
            platformSpecificData: parseJsonField(influencerData.platformSpecificData),
            updatedAt: Math.floor(Date.now() / 1000)
          };

          if (existingInfluencer) {
            // 更新现有记录
            await tx.influencer.update({
              where: { id: existingInfluencer.id },
              data: influencerPayload
            });
            updated++;
          } else {
            // 创建新记录
            await tx.influencer.create({
              data: {
                id: generateId(),
                ...influencerPayload,
                createdAt: Math.floor(Date.now() / 1000)
              }
            });
            imported++;
          }
        } catch (error) {
          console.error('Error importing influencer:', error);
          errorDetails.push(`Error processing record: ${error instanceof Error ? error.message : 'Unknown error'}`);
          errors++;
        }
      }

      return {
        imported,
        updated,
        errors,
        errorDetails: errorDetails.slice(0, 10), // 只返回前10个错误详情
        total: influencersData.length
      };
    });

    return NextResponse.json({
      message: `Import completed: ${result.imported} new, ${result.updated} updated, ${result.errors} errors`,
      ...result
    });
  } catch (error) {
    console.error('Error in import operation:', error);
    return NextResponse.json(
      { 
        error: 'Failed to import data', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// 批量更新
async function handleBatchUpdate(body: any) {
  const { ids, updates } = body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json(
      { error: 'Influencer IDs are required' },
      { status: 400 }
    );
  }

  if (!updates || typeof updates !== 'object') {
    return NextResponse.json(
      { error: 'Updates data is required' },
      { status: 400 }
    );
  }

  try {
    const result = await prisma.influencer.updateMany({
      where: {
        id: { in: ids.map((id: string) => BigInt(id)) }
      },
      data: {
        ...updates,
        updatedAt: Math.floor(Date.now() / 1000)
      }
    });

    return NextResponse.json({
      message: `Successfully updated ${result.count} influencer(s)`,
      updatedCount: result.count
    });
  } catch (error) {
    console.error('Error in batch update:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update influencers', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// 批量删除（软删除）
async function handleBatchDelete(body: any) {
  const { influencerIds, ids } = body;
  const targetIds = influencerIds || ids; // 支持两种参数名

  if (!targetIds || !Array.isArray(targetIds) || targetIds.length === 0) {
    return NextResponse.json(
      { error: 'Influencer IDs are required' },
      { status: 400 }
    );
  }

  try {
    // 使用软删除：将status设置为0
    const result = await prisma.influencer.updateMany({
      where: {
        id: { in: targetIds.map((id: string) => BigInt(id)) },
        status: 1 // 只更新当前有效的记录
      },
      data: {
        status: 0,
        updatedAt: Math.floor(Date.now() / 1000)
      }
    });

    return NextResponse.json({
      message: `Successfully deleted ${result.count} influencer(s)`,
      deletedCount: result.count
    });
  } catch (error) {
    console.error('Error in batch delete:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete influencers', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
} 