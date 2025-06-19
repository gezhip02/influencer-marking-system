import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateId } from '@/lib/snowflake';
import { serializeBigInt } from '@/lib/bigint-serializer';

// GET /api/fulfillment-record-tags - 获取履约记录标签列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fulfillmentRecordId = searchParams.get('fulfillmentRecordId');
    const tagId = searchParams.get('tagId');

    // 构建查询条件
    const where: any = {
      status: 1 // 只查询有效数据
    };

    if (fulfillmentRecordId) {
      where.fulfillmentRecordId = BigInt(fulfillmentRecordId);
    }

    if (tagId) {
      where.tagId = BigInt(tagId);
    }

    // 获取履约记录标签关联
    const fulfillmentRecordTags = await prisma.fulfillmentRecordTag.findMany({
      where,
      orderBy: [
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json({
      success: true,
      data: fulfillmentRecordTags.map(item => serializeBigInt(item))
    });
  } catch (error) {
    console.error('获取履约记录标签关联失败:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal Server Error',
        message: '获取履约记录标签关联失败'
      },
      { status: 500 }
    );
  }
}

// POST /api/fulfillment-record-tags - 创建履约记录标签关联
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fulfillmentRecordId, tagId, confidence, source, createdBy } = body;

    // 验证必填字段
    if (!fulfillmentRecordId || !tagId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required fields',
          message: '缺少必填字段：履约记录ID和标签ID'
        },
        { status: 400 }
      );
    }

    // 检查是否已存在相同的关联
    const existingRelation = await prisma.fulfillmentRecordTag.findFirst({
      where: {
        fulfillmentRecordId: BigInt(fulfillmentRecordId),
        tagId: BigInt(tagId),
        status: 1
      }
    });

    if (existingRelation) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Relation already exists',
          message: '该履约记录和标签的关联已存在'
        },
        { status: 409 }
      );
    }

    // 创建履约记录标签关联
    const fulfillmentRecordTag = await prisma.fulfillmentRecordTag.create({
      data: {
        id: generateId(),
        fulfillmentRecordId: BigInt(fulfillmentRecordId),
        tagId: BigInt(tagId),
        confidence: confidence || 1.0,
        source: source || 'manual',
        status: 1,
        createdAt: Math.floor(Date.now() / 1000),
        createdBy: createdBy ? BigInt(createdBy) : null
      }
    });

    return NextResponse.json({
      success: true,
      data: serializeBigInt(fulfillmentRecordTag),
      message: '履约记录标签关联创建成功'
    });
  } catch (error) {
    console.error('创建履约记录标签关联失败:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal Server Error',
        message: '创建履约记录标签关联失败'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/fulfillment-record-tags - 批量删除履约记录标签关联
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing ID',
          message: '缺少关联ID'
        },
        { status: 400 }
      );
    }

    // 检查关联是否存在且有效
    const existingRelation = await prisma.fulfillmentRecordTag.findUnique({
      where: { 
        id: BigInt(id),
        status: 1
      }
    });

    if (!existingRelation) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Relation not found',
          message: '履约记录标签关联不存在或已被删除'
        },
        { status: 404 }
      );
    }

    // 使用软删除：将status设置为0
    await prisma.fulfillmentRecordTag.update({
      where: { id: BigInt(id) },
      data: {
        status: 0
      }
    });

    return NextResponse.json({
      success: true,
      message: '履约记录标签关联删除成功'
    });
  } catch (error) {
    console.error('删除履约记录标签关联失败:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal Server Error',
        message: '删除履约记录标签关联失败'
      },
      { status: 500 }
    );
  }
} 