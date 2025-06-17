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
    const category = searchParams.get('category') || '';
    const parentId = searchParams.get('parentId');

    const skip = (page - 1) * limit;

    // 构建查询条件
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { displayName: { contains: search } },
        { description: { contains: search } }
      ];
    }

    if (category) {
      where.category = category;
    }

    if (parentId !== null) {
      if (parentId === '') {
        where.parentId = null; // 查询顶级标签
      } else {
        where.parentId = parentId;
      }
    }

    // 并行获取数据和统计信息
    const [tags, total, stats] = await Promise.all([
      // 获取标签列表
      prisma.tag.findMany({
        where,
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          parent: {
            select: {
              id: true,
              name: true,
              displayName: true
            }
          },
          children: {
            select: {
              id: true,
              name: true,
              displayName: true
            }
          },
          _count: {
            select: {
              influencers: true,
              children: true
            }
          }
        },
        orderBy: [
          { sortOrder: 'asc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      // 获取总数
      prisma.tag.count({ where }),
      // 获取统计信息
      Promise.all([
        prisma.tag.count(), // 总标签数
        prisma.influencer.count(), // 总达人数
        prisma.tag.groupBy({
          by: ['category'],
          _count: {
            category: true
          }
        }) // 按分类统计
      ])
    ]);

    // 构建统计信息对象
    const statsData = {
      total: stats[0],
      totalInfluencers: stats[1],
      categories: stats[2]
    };

    // 处理标签数据，添加达人数量信息
    const tagsWithInfluencerCount = tags.map(tag => ({
      ...tag,
      influencerCount: tag._count.influencers,
      childrenCount: tag._count.children
    }));

    // 序列化返回数据
    const result = serializePagination({
      items: tagsWithInfluencerCount,
      total,
      page,
      limit
    });

    return NextResponse.json({
      tags: result.items,
      pagination: result.pagination,
      stats: statsData
    });
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tags', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, displayName, description, category, color, icon, parentId } = body;

    // 验证必填字段
    if (!name || !displayName || !category) {
      return NextResponse.json(
        { error: 'Name, display name, and category are required' },
        { status: 400 }
      );
    }

    // 检查名称是否已存在
    const existingTag = await prisma.tag.findUnique({
      where: { name }
    });

    if (existingTag) {
      return NextResponse.json(
        { error: 'Tag name already exists' },
        { status: 400 }
      );
    }

    // 使用雪花算法生成ID
    const id = generateId();

    // 创建标签
    const tag = await prisma.tag.create({
      data: {
        id,
        name,
        displayName,
        description,
        category,
        color: color || '#6B7280',
        icon,
        parentId: parentId ? BigInt(parentId) : null,
        status: 'ACTIVE',
        isSystem: false,
        sortOrder: 0,
        createdBy: null // 暂时设置为null，待用户系统完善后修改
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        parent: {
          select: {
            id: true,
            name: true,
            displayName: true
          }
        },
        _count: {
          select: {
            influencers: true,
            children: true
          }
        }
      }
    });

    // 序列化返回数据
    const serializedTag = serializeBigInt({
      ...tag,
      influencerCount: tag._count.influencers,
      childrenCount: tag._count.children
    });

    return NextResponse.json({
      success: true,
      tag: serializedTag
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating tag:', error);
    return NextResponse.json(
      { error: 'Failed to create tag', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, displayName, description, category, color, icon, parentId } = body;

    // 验证必填字段
    if (!id || !name || !displayName || !category) {
      return NextResponse.json(
        { error: 'ID, name, display name, and category are required' },
        { status: 400 }
      );
    }

    // 检查标签是否存在
    const existingTag = await prisma.tag.findUnique({
      where: { id: BigInt(id) }
    });

    if (!existingTag) {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      );
    }

    // 如果名称发生变化，检查新名称是否已存在
    if (name !== existingTag.name) {
      const nameConflict = await prisma.tag.findUnique({
        where: { name }
      });

      if (nameConflict) {
        return NextResponse.json(
          { error: 'Tag name already exists' },
          { status: 400 }
        );
      }
    }

    // 更新标签
    const updatedTag = await prisma.tag.update({
      where: { id: BigInt(id) },
      data: {
        name,
        displayName,
        description,
        category,
        color: color || '#6B7280',
        icon,
        parentId: parentId ? BigInt(parentId) : null,
        updatedAt: new Date()
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        parent: {
          select: {
            id: true,
            name: true,
            displayName: true
          }
        },
        _count: {
          select: {
            influencers: true,
            children: true
          }
        }
      }
    });

    // 序列化返回数据
    const serializedTag = serializeBigInt({
      ...updatedTag,
      influencerCount: updatedTag._count.influencers,
      childrenCount: updatedTag._count.children
    });

    return NextResponse.json({
      success: true,
      tag: serializedTag
    });
  } catch (error) {
    console.error('Error updating tag:', error);
    return NextResponse.json(
      { error: 'Failed to update tag', details: error instanceof Error ? error.message : 'Unknown error' },
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
        { error: 'Tag ID is required' },
        { status: 400 }
      );
    }

    // 检查标签是否存在
    const existingTag = await prisma.tag.findUnique({
      where: { id: BigInt(id) },
      include: {
        _count: {
          select: {
            influencers: true,
            children: true
          }
        }
      }
    });

    if (!existingTag) {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      );
    }

    // 检查是否为系统标签
    if (existingTag.isSystem) {
      return NextResponse.json(
        { error: 'Cannot delete system tag' },
        { status: 403 }
      );
    }

    // 检查是否有子标签
    if (existingTag._count.children > 0) {
      return NextResponse.json(
        { error: 'Cannot delete tag with child tags. Please delete or reassign child tags first.' },
        { status: 400 }
      );
    }

    // 在事务中执行删除操作
    await prisma.$transaction(async (tx) => {
      // 删除所有与该标签相关的达人标签关系
      await tx.influencerTag.deleteMany({
        where: {
          tagId: BigInt(id)
        }
      });

      // 删除标签
      await tx.tag.delete({
        where: { id: BigInt(id) }
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Tag deleted successfully',
      deletedInfluencerConnections: existingTag._count.influencers
    });
  } catch (error) {
    console.error('Error deleting tag:', error);
    return NextResponse.json(
      { error: 'Failed to delete tag', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 