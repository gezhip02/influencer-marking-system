import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface Product {
  id: number;
  name: string;
  description: string | null;
  brand: string | null;
  category: string | null;
  price: number | null;
  currency: string | null;
  budget: number | null;
  targetAudience: string | null;
  contentRequirements: string | null;
  deliverables: string | null;
  kpis: string | null;
  startDate: string | null;
  endDate: string | null;
  priority: string | null;
  country: string;
  skuSeries: string;
  status: number;
  createdAt: number | null;
  updatedAt: number | null;
  createdBy: number | null;
}

export async function GET() {
  try {
    console.log('🔍 获取产品列表...');

    // 使用Supabase客户端获取所有活跃的产品
    const { data: products, error } = await supabase
      .from('cooperation_products')
      .select('*')
      .eq('status', 1)
      .order('name', { ascending: true });

    if (error) {
      console.error('获取产品列表失败:', error);
      throw error;
    }

    console.log(`✅ 成功获取 ${products?.length || 0} 个产品`);

    // 转换为前端需要的格式
    const formattedProducts = products?.map((product: Product) => ({
      id: product.id.toString(),
      name: product.name,
      description: product.description || '',
      brand: product.brand || '',
      category: product.category || 'unknown',
      price: product.price || 0,
      currency: product.currency || 'CNY',
      budget: product.budget || 0,
      targetAudience: product.targetAudience || '',
      contentRequirements: product.contentRequirements || '',
      deliverables: product.deliverables || '',
      kpis: product.kpis || '',
      startDate: product.startDate,
      endDate: product.endDate,
      priority: product.priority || 'medium',
      country: product.country,
      skuSeries: product.skuSeries,
      status: product.status,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      createdBy: product.createdBy
    })) || [];

    return NextResponse.json({
      success: true,
      data: formattedProducts
    });

  } catch (error) {
    console.error('获取产品列表失败:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '获取产品列表失败',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 