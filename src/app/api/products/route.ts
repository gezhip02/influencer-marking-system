import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { serializeBigInt } from '@/lib/bigint-serializer';

interface Product {
  id: bigint;
  name: string;
  description: string | null;
  brand: string | null;
  category: string | null;
  price: number | null;
  currency: string | null;
  targetAudience: string | null;
  contentRequirements: string | null;
  priority: string | null;
  country: string;
  skuSeries: string;
  status: number;
  createdAt: number | null;
}

export async function GET() {
  try {
    // 获取所有活跃的产品
    const products: Product[] = await prisma.cooperationProduct.findMany({
      where: { status: 1 },
      orderBy: { name: 'asc' }
    });

    // 转换为前端需要的格式
    const formattedProducts = products.map((product: Product) => ({
      id: product.id.toString(),
      name: product.name,
      description: product.description || '',
      brand: product.brand || '',
      category: product.category || 'unknown',
      price: product.price || 0,
      currency: product.currency || 'CNY',
      targetAudience: product.targetAudience || '',
      contentRequirements: product.contentRequirements || '',
      priority: product.priority || 'medium',
      country: product.country,
      skuSeries: product.skuSeries,
      status: product.status,
      createdAt: product.createdAt
    }));

    const serializedProducts = serializeBigInt(formattedProducts);

    return NextResponse.json({
      success: true,
      data: serializedProducts
    });
  } catch (error) {
    console.error('获取产品列表失败:', error);
    return NextResponse.json(
      { success: false, error: '获取产品列表失败' },
      { status: 500 }
    );
  }
} 