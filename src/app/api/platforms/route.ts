import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { serializeBigInt } from '@/lib/bigint-serializer';

export async function GET(request: NextRequest) {
  try {
    // 获取所有活跃的平台
    const platforms = await prisma.platform.findMany({
      where: {
        status: 1
      },
      select: {
        id: true,
        name: true,
        displayName: true,
        status: true,
        apiEndpoint: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        displayName: 'asc'
      }
    });

    // 序列化BigInt
    const serializedPlatforms = serializeBigInt(platforms);

    return NextResponse.json({
      success: true,
      platforms: serializedPlatforms
    });
  } catch (error) {
    console.error('Error fetching platforms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch platforms', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 