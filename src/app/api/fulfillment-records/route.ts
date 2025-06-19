import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { serializeBigInt, serializePagination } from '@/lib/bigint-serializer';

// GET /api/fulfillment-records - 获取履约记录列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const [fulfillmentRecords, total] = await Promise.all([
      prisma.fulfillmentRecord.findMany({
        where: {
          status: 1 // 只查询有效数据
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.fulfillmentRecord.count({
        where: {
          status: 1
        }
      })
    ]);

    // 序列化返回数据
    const result = serializePagination({
      items: fulfillmentRecords,
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
      }
    });

  } catch (error) {
    console.error('获取履约记录失败:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal Server Error',
        message: '获取履约记录失败'
      },
      { status: 500 }
    );
  }
} 