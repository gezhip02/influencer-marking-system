import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateId } from '@/lib/snowflake';
import { serializePagination, serializeEntity, prepareForDatabase, timestampUtils } from '@/lib/bigint-serializer';

export async function GET(request: NextRequest) {
  try {
    // 🔍 调试：查看 Vercel 上实际的 DATABASE_URL 值
    console.log('💡 DATABASE_URL on Vercel =', process.env.DATABASE_URL);
    console.log('💡 DATABASE_URL length =', process.env.DATABASE_URL?.length);
    console.log('💡 DATABASE_URL starts with =', process.env.DATABASE_URL?.substring(0, 20));
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const platformId = searchParams.get('platformId');
    const category = searchParams.get('category');
    const country = searchParams.get('country');
    const minFollowers = searchParams.get('minFollowers');
    const maxFollowers = searchParams.get('maxFollowers');

    const skip = (page - 1) * limit;

    // 构建查询条件
    const where: any = {
      status: 1 // 只查询有效数据
    };

    // 搜索条件
    if (search) {
      where.OR = [
        { username: { contains: search } },
        { displayName: { contains: search } },
        { email: { contains: search } }
      ];
    }

    // 平台筛选
    if (platformId) {
      where.platformId = BigInt(platformId);
    }

    // 分类筛选
    if (category) {
      where.primaryCategory = category;
    }

    // 国家筛选
    if (country) {
      where.country = country;
    }

    // 粉丝数范围筛选
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
      // 获取达人列表，包含平台信息
      prisma.influencer.findMany({
        where,
        orderBy: [
          { qualityScore: 'desc' },
          { followersCount: 'desc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      }).then(async (influencers) => {
        // 手动关联平台信息和标签信息
        const influencerIds = influencers.map(inf => inf.id);
        const platformIds = [...new Set(influencers.map(inf => inf.platformId))];
        
        const [platforms, influencerTags, tags] = await Promise.all([
          prisma.platform.findMany({
            where: {
              id: { in: platformIds },
              status: 1
            }
          }),
          prisma.influencerTag.findMany({
            where: {
              influencerId: { in: influencerIds },
              status: 1
            }
          }),
          prisma.tag.findMany({
            where: { status: 1 }
          })
        ]);
        
        const platformMap = new Map(platforms.map(p => [p.id.toString(), p]));
        const tagMap = new Map(tags.map(t => [t.id.toString(), t]));
        
        // 构建达人-标签映射
        const influencerTagsMap = new Map();
        influencerTags.forEach(it => {
          const influencerId = it.influencerId.toString();
          if (!influencerTagsMap.has(influencerId)) {
            influencerTagsMap.set(influencerId, []);
          }
          const tag = tagMap.get(it.tagId.toString());
          if (tag) {
            influencerTagsMap.get(influencerId).push(tag);
          }
        });
        
        return influencers.map(influencer => ({
          ...influencer,
          platform: platformMap.get(influencer.platformId.toString()) || null,
          tags: influencerTagsMap.get(influencer.id.toString()) || []
        }));
      }),
      // 获取总数
      prisma.influencer.count({ where }),
      // 获取统计信息
      Promise.all([
        prisma.influencer.count({ where: { status: 1 } }), // 总达人数
        prisma.influencer.count({ where: { status: 1 } }), // 活跃达人数
        prisma.communicationLog.count({
          where: {
            status: 1,
            createdAt: {
              gte: timestampUtils.now() - 7 * 24 * 60 * 60 // 最近7天
            }
          }
        }), // 本周联系过的达人数
        prisma.tag.count({ where: { status: 1 } }) // 标签总数
      ])
    ]);

    // 构建统计信息对象
    const statsData = {
      total: stats[0],
      active: stats[1],
      contacted: stats[2],
      totalTags: stats[3]
    };

    // 序列化返回数据
    const result = serializePagination({
      items: influencers,
      total,
      page,
      limit
    });

    return NextResponse.json({
      success: true,
      data: result,
      stats: statsData
    });

  } catch (error) {
    console.error('获取达人列表失败:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal Server Error',
        message: '获取达人列表失败'
      },
      { status: 500 }
    );
  }
}



export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 验证必填字段
    if (!body.platformId || !body.platformUserId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields',
          message: '缺少必填字段：平台ID和平台用户ID'
        },
        { status: 400 }
      );
    }

    // 检查是否已存在相同的平台用户
    const existingInfluencer = await prisma.influencer.findUnique({
      where: {
        platformId_platformUserId: {
          platformId: BigInt(body.platformId),
          platformUserId: body.platformUserId
        }
      }
    });

    if (existingInfluencer) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Influencer already exists',
          message: '该平台用户已存在'
        },
        { status: 409 }
      );
    }

    // 分离标签数据和其他数据
    const { tagIds, ...influencerData } = body;
    
    // 准备创建数据
    const createData = prepareForDatabase({
      id: generateId(),
      ...influencerData,
      status: 1,
      createdAt: timestampUtils.now(),
      updatedAt: timestampUtils.now(),
      createdBy: influencerData.createdBy ? BigInt(influencerData.createdBy) : null
    });

    // 使用事务来处理达人创建和标签关联
    const result = await prisma.$transaction(async (tx) => {
      // 创建达人
      const influencer = await tx.influencer.create({
        data: createData
      });

      // 处理标签关联
      if (tagIds && Array.isArray(tagIds) && tagIds.length > 0) {
        console.log('创建标签关联:', tagIds);
        
        // 创建标签关联记录
        const tagRelations = tagIds.map((tagId: string) => ({
          id: generateId(),
          influencerId: influencer.id,
          tagId: BigInt(tagId),
          confidence: 1.0,
          source: 'manual',
          status: 1,
          createdAt: timestampUtils.now(),
          createdBy: body.createdBy ? BigInt(body.createdBy) : null
        }));

        await tx.influencerTag.createMany({
          data: tagRelations
        });
      }

      return influencer;
    });

    return NextResponse.json({
      success: true,
      data: serializeEntity(result),
      message: '达人创建成功'
    });

  } catch (error) {
    console.error('创建达人失败:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal Server Error',
        message: '创建达人失败'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing ID',
          message: '缺少达人ID'
        },
        { status: 400 }
      );
    }

    // 检查达人是否存在
    const existingInfluencer = await prisma.influencer.findFirst({
      where: { 
        id: BigInt(body.id),
        status: 1
      }
    });

    if (!existingInfluencer) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Influencer not found',
          message: '达人不存在'
        },
        { status: 404 }
      );
    }

    // 分离标签数据和其他数据
    const { tagIds, ...updateFields } = body;
    
    // 准备更新数据（不包含标签）
    const updateData = prepareForDatabase({
      ...updateFields,
      updatedAt: timestampUtils.now(),
      updatedBy: updateFields.updatedBy ? BigInt(updateFields.updatedBy) : null
    });
    
    // 移除不应该更新的字段
    delete updateData.id;
    delete updateData.createdAt;
    delete updateData.createdBy;
    delete updateData.platformId; // 平台关系不能直接更新

    // 使用事务处理更新和标签关联
    const result = await prisma.$transaction(async (tx) => {
      // 更新达人基本信息
      const influencer = await tx.influencer.update({
        where: { id: BigInt(body.id) },
        data: updateData
      });

      // 处理标签关联更新
      if (tagIds !== undefined) {
        console.log('更新标签关联:', tagIds);
        
        // 删除现有的标签关联（物理删除，避免唯一约束冲突）
        await tx.influencerTag.deleteMany({
          where: { 
            influencerId: BigInt(body.id)
          }
        });

        // 如果有新标签，创建新的关联
        if (Array.isArray(tagIds) && tagIds.length > 0) {
          console.log('新标签关联:', tagIds);
          
          // 获取现有的关联以避免重复
          const existingRelations = await tx.influencerTag.findMany({
            where: {
              influencerId: BigInt(body.id),
              tagId: { in: tagIds.map((tagId: string) => BigInt(tagId)) }
            }
          });
          
          const existingTagIds = new Set(existingRelations.map(rel => rel.tagId.toString()));
          const newTagIds = tagIds.filter((tagId: string) => !existingTagIds.has(tagId));
          
          if (newTagIds.length > 0) {
            const tagRelations = newTagIds.map((tagId: string) => ({
              id: generateId(),
              influencerId: BigInt(body.id),
              tagId: BigInt(tagId),
              confidence: 1.0,
              source: 'manual',
              status: 1,
              createdAt: timestampUtils.now(),
              createdBy: updateFields.updatedBy ? BigInt(updateFields.updatedBy) : null
            }));

            await tx.influencerTag.createMany({
              data: tagRelations
            });
          }
        }
      }

      return influencer;
    });

    return NextResponse.json({
      success: true,
      data: serializeEntity(result),
      message: '达人更新成功'
    });

  } catch (error) {
    console.error('更新达人失败:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal Server Error',
        message: '更新达人失败'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing ID',
          message: '缺少达人ID'
        },
        { status: 400 }
      );
    }

    // 检查达人是否存在且有效
    const existingInfluencer = await prisma.influencer.findFirst({
      where: { 
        id: BigInt(id),
        status: 1 // 只查找有效的记录
      }
    });
    
    if (!existingInfluencer) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Influencer not found',
          message: '达人不存在或已被删除'
        },
        { status: 404 }
      );
    }

    // 使用软删除：只需要将status设置为0
    await prisma.influencer.update({
      where: { id: BigInt(id) },
      data: {
        status: 0,
        updatedAt: Math.floor(Date.now() / 1000)
      }
    });

    return NextResponse.json({
      success: true,
      message: '达人删除成功'
    });

  } catch (error) {
    console.error('删除达人失败:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal Server Error',
        message: '删除达人失败'
      },
      { status: 500 }
    );
  }
} 