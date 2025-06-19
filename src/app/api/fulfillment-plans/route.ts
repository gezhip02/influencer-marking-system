import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { serializeBigInt } from '@/lib/bigint-serializer';

export async function GET(request: NextRequest) {
  try {
    // 获取所有活跃的履约方案
    const plans = await prisma.fulfillmentPlan.findMany({
      where: {
        status: 1
      },
      orderBy: {
        planName: 'asc'
      }
    });

    // 序列化BigInt
    const serializedPlans = serializeBigInt(plans);

    return NextResponse.json({
      success: true,
      data: serializedPlans
    });
  } catch (error) {
    console.error('Error fetching fulfillment plans:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch fulfillment plans', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
} 