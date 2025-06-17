import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateId } from '@/lib/snowflake';
import { serializeBigInt, serializePagination } from '@/lib/bigint-serializer';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const platform = searchParams.get('platform') || '';
    const status = searchParams.get('status') || '';
    const source = searchParams.get('source') || '';
    const tagId = searchParams.get('tagId') || '';
    const dateFrom = searchParams.get('dateFrom') || '';
    const dateTo = searchParams.get('dateTo') || '';
    const category = searchParams.get('category') || '';
    const minFollowers = searchParams.get('minFollowers');
    const maxFollowers = searchParams.get('maxFollowers');

    const skip = (page - 1) * limit;

    // 构建查询条件
    const where: any = {};

    if (search) {
      where.OR = [
        { username: { contains: search } },
        { displayName: { contains: search } },
        { bio: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
        { whatsappAccount: { contains: search } },
        { wechat: { contains: search } }
      ];
    }

    if (platform) {
      where.platform = {
        name: platform
      };
    }

    if (status) {
      where.status = status;
    }

    if (source) {
      where.dataSource = source;
    }

    if (tagId) {
      where.tags = {
        some: {
          tagId: tagId
        }
      };
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        // 设置为日期的结束时间 (23:59:59)
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        where.createdAt.lte = endDate;
      }
    }

    if (category) {
      where.primaryCategory = category;
    }

    if (minFollowers || maxFollowers) {
      where.followersCount = {};
      if (minFollowers) {
        where.followersCount.gte = parseInt(minFollowers);
      }
      if (maxFollowers) {
        where.followersCount.lte = parseInt(maxFollowers);
      }
    }

    // 并行获取数据和统计信息
    const [influencers, total, stats] = await Promise.all([
      // 获取达人列表
      prisma.influencer.findMany({
        where,
        select: {
          id: true,
          platformUserId: true,
          username: true,
          displayName: true,
          avatarUrl: true,
          bio: true,
          email: true,
          phone: true,
          whatsappAccount: true,
          wechat: true,
          telegram: true,
          country: true,
          region: true,
          city: true,
          followersCount: true,
          followingCount: true,
          engagementRate: true,
          qualityScore: true,
          primaryCategory: true,
          cooperationOpenness: true,
          baseCooperationFee: true,
          cooperationCurrency: true,
          riskLevel: true,
          dataSource: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          platform: {
            select: {
              id: true,
              name: true,
              displayName: true
            }
          },
          creator: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          tags: {
            include: {
              tag: {
                select: {
                  id: true,
                  name: true,
                  displayName: true,
                  color: true,
                  category: true
                }
              }
            }
          },
          _count: {
            select: {
              cooperationRecords: true,
              communicationLogs: true
            }
          }
        },
        orderBy: [
          { qualityScore: 'desc' },
          { followersCount: 'desc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      // 获取总数
      prisma.influencer.count({ where }),
      // 获取统计信息
      Promise.all([
        prisma.influencer.count(), // 总达人数
        prisma.influencer.count({ where: { status: 'ACTIVE' } }), // 活跃达人数
        prisma.influencer.count({
          where: {
            communicationLogs: {
              some: {
                createdAt: {
                  gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 最近7天
                }
              }
            }
          }
        }), // 本周联系过的达人数
        prisma.tag.count() // 标签总数
      ])
    ]);

    // 构建统计信息对象
    const statsData = {
      total: stats[0],
      active: stats[1],
      contacted: stats[2],
      totalTags: stats[3]
    };

    // 处理标签数据结构
    const processedInfluencers = influencers.map(influencer => ({
      ...influencer,
      tags: influencer.tags.map((tagRelation: any) => tagRelation.tag)
    }));

    // 序列化返回数据
    const result = serializePagination({
      items: processedInfluencers,
      total,
      page,
      limit
    });

    return NextResponse.json({
      influencers: result.items,
      pagination: result.pagination,
      stats: statsData
    });
  } catch (error) {
    console.error('Error fetching influencers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch influencers', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      platformId,
      platformUserId,
      username,
      displayName,
      avatarUrl,
      bio,
      email,
      phone,
      whatsappAccount,
      wechat,
      telegram,
      country,
      region,
      city,
      gender,
      ageRange,
      language,
      followersCount,
      followingCount,
      totalVideos,
      avgVideoViews,
      engagementRate,
      primaryCategory,
      contentLanguage,
      cooperationOpenness,
      baseCooperationFee,
      cooperationCurrency,
      qualityScore,
      riskLevel,
      notes,
      tagIds
    } = body;

    // 验证必填字段
    if (!platformId || !platformUserId) {
      return NextResponse.json(
        { error: 'Platform ID and Platform User ID are required' },
        { status: 400 }
      );
    }

    // 检查是否已存在
    const existingInfluencer = await prisma.influencer.findUnique({
      where: {
        platformId_platformUserId: {
          platformId: BigInt(platformId),
          platformUserId: platformUserId
        }
      }
    });

    if (existingInfluencer) {
      return NextResponse.json(
        { error: 'Influencer already exists on this platform' },
        { status: 400 }
      );
    }

    // 使用雪花算法生成ID
    const id = generateId();

    // 创建达人数据
    const createData: any = {
      id,
      platformId: BigInt(platformId),
      platformUserId,
      username,
      displayName,
      avatarUrl,
      bio,
      email,
      phone,
      whatsappAccount,
      wechat,
      telegram,
      country,
      region,
      city,
      gender,
      ageRange,
      language,
      followersCount: followersCount || 0,
      followingCount: followingCount || 0,
      totalLikes: BigInt(0),
      totalVideos: totalVideos || 0,
      avgVideoViews: avgVideoViews || 0,
      engagementRate: engagementRate || null,
      primaryCategory,
      contentLanguage,
      cooperationOpenness: cooperationOpenness || 'unknown',
      baseCooperationFee: baseCooperationFee || null,
      cooperationCurrency: cooperationCurrency || 'USD',
      qualityScore: qualityScore || null,
      riskLevel: riskLevel || 'unknown',
      status: 'ACTIVE',
      notes,
      createdBy: null // 暂时设置为null，待用户系统完善后修改
    };

    // 在事务中创建达人和标签关联
    const influencer = await prisma.$transaction(async (tx) => {
      // 创建达人
      const newInfluencer = await tx.influencer.create({
        data: createData,
        include: {
          platform: true,
          creator: {
            select: {
              id: true,
              name: true,
              email: true
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

      // 创建标签关联
      if (tagIds && Array.isArray(tagIds) && tagIds.length > 0) {
        await tx.influencerTag.createMany({
          data: tagIds.map((tagId: string) => ({
            id: generateId(),
            influencerId: newInfluencer.id,
            tagId: BigInt(tagId)
          }))
        });
      }

      // 重新查询包含标签数据
      const influencerWithTags = await tx.influencer.findUnique({
        where: { id: newInfluencer.id },
        include: {
          platform: true,
          creator: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
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

      return influencerWithTags;
    });

    // 序列化返回数据
    const serializedInfluencer = serializeBigInt(influencer);

    return NextResponse.json(serializedInfluencer, { status: 201 });
  } catch (error) {
    console.error('Error creating influencer:', error);
    return NextResponse.json(
      { error: 'Failed to create influencer', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      platformId,
      platformUserId,
      username,
      displayName,
      avatarUrl,
      bio,
      // 联系方式
      whatsappAccount,
      email,
      phone,
      wechat,
      telegram,
      // 地理信息
      country,
      region,
      city,
      timezone,
      // 基础属性
      gender,
      ageRange,
      language,
      // 粉丝数据
      followersCount,
      followingCount,
      totalLikes,
      totalVideos,
      avgVideoViews,
      engagementRate,
      // 内容属性
      primaryCategory,
      contentStyle,
      contentLanguage,
      // 商业合作
      cooperationOpenness,
      baseCooperationFee,
      cooperationCurrency,
      cooperationPreferences,
      // 质量评估
      qualityScore,
      riskLevel,
      blacklistReason,
      // 数据来源
      dataSource,
      lastDataSync,
      dataAccuracy,
      // 扩展字段
      platformSpecificData,
      notes,
      // 标签和状态
      tagIds,
      status
    } = body;

    // 验证必填字段
    if (!id) {
      return NextResponse.json(
        { error: 'Influencer ID is required' },
        { status: 400 }
      );
    }

    // 检查达人是否存在
    const existingInfluencer = await prisma.influencer.findUnique({
      where: { id: BigInt(id) },
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      }
    });

    if (!existingInfluencer) {
      return NextResponse.json(
        { error: 'Influencer not found' },
        { status: 404 }
      );
    }

    // 构建更新数据
    const updateData: any = {};
    
    // 处理platformId - 如果提供了平台ID，需要查找对应的平台
    if (platformId !== undefined && platformId !== '') {
      // 如果platformId是数字字符串，直接转换
      if (/^\d+$/.test(platformId)) {
        updateData.platformId = BigInt(platformId);
      } else {
        // 如果是平台名称，查找对应的平台ID
        const platform = await prisma.platform.findUnique({
          where: { name: platformId }
        });
        if (platform) {
          updateData.platformId = platform.id;
        } else {
          return NextResponse.json(
            { error: `Platform '${platformId}' not found` },
            { status: 400 }
          );
        }
      }
    }
    // 基本信息
    if (platformUserId !== undefined) updateData.platformUserId = platformUserId;
    if (username !== undefined) updateData.username = username;
    if (displayName !== undefined) updateData.displayName = displayName;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
    if (bio !== undefined) updateData.bio = bio;
    
    // 联系方式
    if (whatsappAccount !== undefined) updateData.whatsappAccount = whatsappAccount;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (wechat !== undefined) updateData.wechat = wechat;
    if (telegram !== undefined) updateData.telegram = telegram;
    
    // 地理信息
    if (country !== undefined) updateData.country = country;
    if (region !== undefined) updateData.region = region;
    if (city !== undefined) updateData.city = city;
    if (timezone !== undefined) updateData.timezone = timezone;
    
    // 基础属性
    if (gender !== undefined) updateData.gender = gender;
    if (ageRange !== undefined) updateData.ageRange = ageRange;
    if (language !== undefined) updateData.language = language;
    
    // 粉丝数据
    if (followersCount !== undefined) updateData.followersCount = followersCount;
    if (followingCount !== undefined) updateData.followingCount = followingCount;
    if (totalLikes !== undefined) updateData.totalLikes = BigInt(totalLikes);
    if (totalVideos !== undefined) updateData.totalVideos = totalVideos;
    if (avgVideoViews !== undefined) updateData.avgVideoViews = avgVideoViews;
    if (engagementRate !== undefined) updateData.engagementRate = engagementRate;
    
    // 内容属性
    if (primaryCategory !== undefined) updateData.primaryCategory = primaryCategory;
    if (contentStyle !== undefined) updateData.contentStyle = contentStyle;
    if (contentLanguage !== undefined) updateData.contentLanguage = contentLanguage;
    
    // 商业合作
    if (cooperationOpenness !== undefined) updateData.cooperationOpenness = cooperationOpenness;
    if (baseCooperationFee !== undefined) updateData.baseCooperationFee = baseCooperationFee || null;
    if (cooperationCurrency !== undefined) updateData.cooperationCurrency = cooperationCurrency;
    if (cooperationPreferences !== undefined) updateData.cooperationPreferences = cooperationPreferences;
    
    // 质量评估
    if (qualityScore !== undefined) updateData.qualityScore = qualityScore;
    if (riskLevel !== undefined) updateData.riskLevel = riskLevel;
    if (blacklistReason !== undefined) updateData.blacklistReason = blacklistReason;
    
    // 数据来源
    if (dataSource !== undefined) updateData.dataSource = dataSource;
    if (lastDataSync !== undefined) updateData.lastDataSync = lastDataSync ? new Date(lastDataSync) : null;
    if (dataAccuracy !== undefined) updateData.dataAccuracy = dataAccuracy;
    
    // 扩展字段
    if (platformSpecificData !== undefined) updateData.platformSpecificData = platformSpecificData;
    if (notes !== undefined) updateData.notes = notes;
    
    // 状态
    if (status !== undefined) updateData.status = status;

    // 在事务中更新达人和标签关联
    const updatedInfluencer = await prisma.$transaction(async (tx) => {
      // 更新达人基本信息
      const influencer = await tx.influencer.update({
        where: { id: BigInt(id) },
        data: updateData,
        include: {
          platform: true,
          creator: {
            select: {
              id: true,
              name: true,
              email: true
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

      // 更新标签关联（如果提供了tagIds）
      if (tagIds !== undefined && Array.isArray(tagIds)) {
        // 删除现有标签关联
        await tx.influencerTag.deleteMany({
          where: { influencerId: BigInt(id) }
        });

        // 创建新的标签关联
        if (tagIds.length > 0) {
          await tx.influencerTag.createMany({
            data: tagIds.map((tagId: string) => ({
              id: generateId(),
              influencerId: BigInt(id),
              tagId: BigInt(tagId)
            }))
          });
        }
      }

      // 重新查询包含标签数据
      const influencerWithTags = await tx.influencer.findUnique({
        where: { id: BigInt(id) },
        include: {
          platform: true,
          creator: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
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

      return influencerWithTags;
    });

    // 处理标签数据结构
    const processedInfluencer = {
      ...updatedInfluencer,
      tags: updatedInfluencer?.tags?.map((tagRelation: any) => tagRelation.tag) || []
    };

    // 序列化返回数据
    const serializedInfluencer = serializeBigInt(processedInfluencer);

    return NextResponse.json(serializedInfluencer);
  } catch (error) {
    console.error('Error updating influencer:', error);
    return NextResponse.json(
      { error: 'Failed to update influencer', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const ids = searchParams.get('ids'); // 支持批量删除

    if (!id && !ids) {
      return NextResponse.json(
        { error: 'Influencer ID or IDs are required' },
        { status: 400 }
      );
    }

    let influencerIds: string[] = [];
    
    if (ids) {
      // 批量删除
      influencerIds = ids.split(',').filter(Boolean);
    } else if (id) {
      // 单个删除
      influencerIds = [id];
    }

    if (influencerIds.length === 0) {
      return NextResponse.json(
        { error: 'No valid influencer IDs provided' },
        { status: 400 }
      );
    }

    // 在事务中删除达人及相关数据
    const result = await prisma.$transaction(async (tx) => {
      const bigIntIds = influencerIds.map(id => BigInt(id));

      // 删除相关的标签关联
      await tx.influencerTag.deleteMany({
        where: {
          influencerId: { in: bigIntIds }
        }
      });

      // 删除相关的合作记录（如果有的话）
      await tx.cooperationRecord.deleteMany({
        where: {
          influencerId: { in: bigIntIds }
        }
      });

      // 删除相关的沟通记录（如果有的话）
      await tx.communicationLog.deleteMany({
        where: {
          influencerId: { in: bigIntIds }
        }
      });

      // 删除达人
      const deletedInfluencers = await tx.influencer.deleteMany({
        where: {
          id: { in: bigIntIds }
        }
      });

      return deletedInfluencers;
    });

    return NextResponse.json({
      message: `Successfully deleted ${result.count} influencer(s)`,
      deletedCount: result.count
    });
  } catch (error) {
    console.error('Error deleting influencer(s):', error);
    return NextResponse.json(
      { error: 'Failed to delete influencer(s)', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 