import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateId } from '@/lib/snowflake';
import { serializeBigInt } from '@/lib/bigint-serializer';

// 批量添加标签
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const body = await request.json();

    switch (action) {
      case 'add-tags':
        return await handleAddTags(body);
      case 'remove-tags':
        return await handleRemoveTags(body);
      case 'update-status':
        return await handleUpdateStatus(body);
      case 'export':
        return await handleExport(body);
      case 'import':
        return await handleImport(body);
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
            tagId
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

  if (!status) {
    return NextResponse.json(
      { error: 'Status is required' },
      { status: 400 }
    );
  }

  const validStatuses = ['ACTIVE', 'INACTIVE', 'POTENTIAL', 'BLACKLISTED'];
  if (!validStatuses.includes(status)) {
    return NextResponse.json(
      { error: 'Invalid status' },
      { status: 400 }
    );
  }

  const result = await prisma.influencer.updateMany({
    where: {
      id: { in: influencerIds.map(id => BigInt(id)) }
    },
    data: {
      status
    }
  });

  return NextResponse.json({
    message: `Successfully updated status of ${result.count} influencer(s)`,
    updatedCount: result.count
  });
}

// 批量导出
async function handleExport(body: any) {
  const { influencerIds, format = 'json' } = body;

  if (!influencerIds || !Array.isArray(influencerIds) || influencerIds.length === 0) {
    return NextResponse.json(
      { error: 'Influencer IDs are required' },
      { status: 400 }
    );
  }

  const influencers = await prisma.influencer.findMany({
    where: {
      id: { in: influencerIds.map(id => BigInt(id)) }
    },
    include: {
      platform: true,
      tags: {
        include: {
          tag: true
        }
      },
      _count: {
        select: {
          cooperationRecords: true,
          communicationLogs: true
        }
      }
    }
  });

  // 处理标签数据结构
  const processedInfluencers = influencers.map(influencer => ({
    ...influencer,
    tags: influencer.tags.map((tagRelation: any) => tagRelation.tag)
  }));

  const serializedInfluencers = serializeBigInt(processedInfluencers);

  if (format === 'csv') {
    // 生成CSV格式
    const csvHeaders = [
      'ID', 'Username', 'Display Name', 'Platform', 'Followers', 'Engagement Rate',
      'Quality Score', 'Status', 'Email', 'Phone', 'WhatsApp', 'WeChat',
      'Country', 'Region', 'Category', 'Tags', 'Created At'
    ];

    const csvRows = serializedInfluencers.map((influencer: any) => [
      influencer.id,
      influencer.username || '',
      influencer.displayName || '',
      influencer.platform?.displayName || '',
      influencer.followersCount || 0,
      influencer.engagementRate || '',
      influencer.qualityScore || '',
      influencer.status || '',
      influencer.email || '',
      influencer.phone || '',
      influencer.whatsappAccount || '',
      influencer.wechat || '',
      influencer.country || '',
      influencer.region || '',
      influencer.primaryCategory || '',
      influencer.tags?.map((tag: any) => tag.displayName).join(';') || '',
      influencer.createdAt || ''
    ]);

    const csvContent = [csvHeaders, ...csvRows]
      .map(row => row.map((field: any) => `"${String(field).replace(/"/g, '""')}"`).join(','))
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
          // 验证必需字段
          if (!influencerData.platformUserId || !influencerData.platformId) {
            errorDetails.push(`Missing required fields for record: ${JSON.stringify(influencerData)}`);
            errors++;
            continue;
          }

          // 查找平台
          let platformId = influencerData.platformId;
          if (typeof platformId === 'string' && isNaN(Number(platformId))) {
            // 如果是平台名称，查找对应的ID
            const platform = await tx.platform.findFirst({
              where: { name: platformId }
            });
            if (!platform) {
              errorDetails.push(`Platform not found: ${platformId}`);
              errors++;
              continue;
            }
            platformId = platform.id;
          }

          // 检查是否已存在
          const existingInfluencer = await tx.influencer.findFirst({
            where: {
              platformUserId: influencerData.platformUserId,
              platformId: BigInt(platformId)
            }
          });

          const influencerPayload = {
            platformId: BigInt(platformId),
            platformUserId: influencerData.platformUserId,
            username: influencerData.username || null,
            displayName: influencerData.displayName || null,
            avatarUrl: influencerData.avatarUrl || null,
            bio: influencerData.bio || null,
            whatsappAccount: influencerData.whatsappAccount || null,
            email: influencerData.email || null,
            phone: influencerData.phone || null,
            wechat: influencerData.wechat || null,
            telegram: influencerData.telegram || null,
            country: influencerData.country || null,
            region: influencerData.region || null,
            city: influencerData.city || null,
            timezone: influencerData.timezone || null,
            gender: influencerData.gender || null,
            ageRange: influencerData.ageRange || null,
            language: influencerData.language || null,
            followersCount: influencerData.followersCount ? Number(influencerData.followersCount) : 0,
            followingCount: influencerData.followingCount ? Number(influencerData.followingCount) : 0,
            totalLikes: influencerData.totalLikes ? BigInt(influencerData.totalLikes) : BigInt(0),
            totalVideos: influencerData.totalVideos ? Number(influencerData.totalVideos) : 0,
            avgVideoViews: influencerData.avgVideoViews ? Number(influencerData.avgVideoViews) : 0,
            engagementRate: influencerData.engagementRate ? Number(influencerData.engagementRate) : null,
            primaryCategory: influencerData.primaryCategory || null,
            contentStyle: influencerData.contentStyle || null,
            contentLanguage: influencerData.contentLanguage || null,
            cooperationOpenness: influencerData.cooperationOpenness || null,
            baseCooperationFee: influencerData.baseCooperationFee || null,
            cooperationCurrency: influencerData.cooperationCurrency || null,
            cooperationPreferences: influencerData.cooperationPreferences || null,
            qualityScore: influencerData.qualityScore ? Number(influencerData.qualityScore) : null,
            riskLevel: influencerData.riskLevel || null,
            blacklistReason: influencerData.blacklistReason || null,
            dataSource: influencerData.dataSource || 'IMPORT',
            lastDataSync: influencerData.lastDataSync ? new Date(influencerData.lastDataSync) : new Date(),
            dataAccuracy: influencerData.dataAccuracy ? Number(influencerData.dataAccuracy) : null,
            status: influencerData.status || 'POTENTIAL',
            platformSpecificData: influencerData.platformSpecificData || null,
            notes: influencerData.notes || null,
            updatedAt: new Date()
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
                createdAt: new Date()
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