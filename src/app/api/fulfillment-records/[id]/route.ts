import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { serializeBigInt } from '@/lib/bigint-serializer';

// GET /api/fulfillment-records/[id] - 获取单个履约单详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const recordId = BigInt(id);
    
    const record = await prisma.fulfillmentRecord.findFirst({
      where: { 
        id: recordId,
        status: 1 // 只查询有效数据
      }
    });

    if (!record) {
      return NextResponse.json(
        { success: false, error: '履约单不存在' },
        { status: 404 }
      );
    }

    // 获取关联数据
    const [influencer, product, plan, owner] = await Promise.all([
      prisma.influencer.findFirst({
        where: { id: record.influencerId, status: 1 },
        select: { id: true, displayName: true, avatarUrl: true, followersCount: true }
      }),
      prisma.cooperationProduct.findFirst({
        where: { id: record.productId, status: 1 },
        select: { id: true, name: true, description: true, price: true }
      }),
      prisma.fulfillmentPlan.findFirst({
        where: { id: record.planId, status: 1 },
        select: { id: true, planName: true, contentType: true, requiresSample: true }
      }),
      prisma.user.findFirst({
        where: { id: record.ownerId, status: 1 },
        select: { id: true, name: true, email: true }
      })
    ]);

    // 合并数据
    const enrichedRecord = {
      ...record,
      influencer,
      product,
      plan,
      owner
    };

    const serializedRecord = serializeBigInt(enrichedRecord);

    return NextResponse.json({
      success: true,
      data: serializedRecord
    });

  } catch (error) {
    console.error('获取履约单详情失败:', error);
    return NextResponse.json(
      { success: false, error: '获取履约单详情失败' },
      { status: 500 }
    );
  }
}

// DELETE /api/fulfillment-records/[id] - 软删除履约单
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const recordId = BigInt(id);
    
    // 检查履约单是否存在
    const existingRecord = await prisma.fulfillmentRecord.findFirst({
      where: { 
        id: recordId,
        status: 1 
      }
    });

    if (!existingRecord) {
      return NextResponse.json(
        { success: false, error: '履约单不存在' },
        { status: 404 }
      );
    }

    // 执行软删除（设置status为0）
    await prisma.fulfillmentRecord.update({
      where: { id: recordId },
      data: { 
        status: 0,
        updatedAt: Math.floor(Date.now() / 1000)
      }
    });

    return NextResponse.json({
      success: true,
      message: '履约单删除成功'
    });

  } catch (error) {
    console.error('删除履约单失败:', error);
    return NextResponse.json(
      { success: false, error: '删除履约单失败' },
      { status: 500 }
    );
  }
} 