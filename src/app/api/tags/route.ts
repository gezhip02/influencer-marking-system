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
    const where: any = {
      status: 1 // 只查询有效数据
    };

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

    if (parentId !== null && parentId !== undefined) {
      if (parentId === 'null' || parentId === '') {
        where.parentId = null;
      } else {
        where.parentId = BigInt(parentId);
      }
    }

    // 并行获取数据和统计信息
    const [tags, total, stats] = await Promise.all([
      // 获取标签列表
      prisma.tag.findMany({
        where,
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
        prisma.tag.count({ where: { status: 1 } }), // 总标签数
        prisma.influencer.count({ where: { status: 1 } }), // 总达人数
        prisma.tag.groupBy({
          by: ['category'],
          where: { status: 1 },
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

    // 序列化返回数据
    const result = serializePagination({
      items: tags,
      total,
      page,
      limit
    });

    return NextResponse.json({
      success: true,
      data: result.items,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        pages: result.pages
      },
      stats: statsData
    });
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch tags', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
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
    const existingTag = await prisma.tag.findFirst({
      where: { 
        name,
        status: 1
      }
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
        status: 1,
        isSystem: false,
        sortOrder: 0,
        createdAt: Math.floor(Date.now() / 1000),
        updatedAt: Math.floor(Date.now() / 1000),
        createdBy: null // 暂时设置为null，待用户系统完善后修改
      }
    });

    return NextResponse.json({
      success: true,
      data: serializeBigInt(tag)
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
    const existingTag = await prisma.tag.findFirst({
      where: { 
        id: BigInt(id),
        status: 1
      }
    });

    if (!existingTag) {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      );
    }

    // 如果名称发生变化，检查新名称是否已存在
    if (name !== existingTag.name) {
      const nameConflict = await prisma.tag.findFirst({
        where: { 
          name,
          status: 1,
          id: { not: BigInt(id) }
        }
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
        updatedAt: Math.floor(Date.now() / 1000)
      }
    });

    return NextResponse.json({
      success: true,
      data: serializeBigInt(updatedTag)
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

    // 检查标签是否存在且有效
    const existingTag = await prisma.tag.findFirst({
      where: { 
        id: BigInt(id),
        status: 1 // 只查找有效的记录
      }
    });

    if (!existingTag) {
      return NextResponse.json(
        { error: 'Tag not found or already deleted' },
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

    // 检查是否有有效的子标签
    const childrenCount = await prisma.tag.count({
      where: {
        parentId: BigInt(id),
        status: 1
      }
    });

    if (childrenCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete tag with child tags. Please delete or reassign child tags first.' },
        { status: 400 }
      );
    }

    // 使用软删除：将status设置为0
    await prisma.tag.update({
      where: { id: BigInt(id) },
      data: {
        status: 0,
        updatedAt: Math.floor(Date.now() / 1000)
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Tag deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting tag:', error);
    return NextResponse.json(
      { error: 'Failed to delete tag', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 