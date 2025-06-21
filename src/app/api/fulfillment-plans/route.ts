import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface FulfillmentPlan {
  id: number;
  planCode: string;
  planName: string;
  requiresSample: boolean;
  contentType: string;
  isInfluencerMade: boolean;
  initialStatus: string;
  description: string | null;
  status: number;
  createdAt: number;
  updatedAt: number;
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 获取履约方案列表...');

    // 使用Supabase客户端获取所有活跃的履约方案
    const { data: plans, error } = await supabase
      .from('fulfillment_plans')
      .select('*')
      .eq('status', 1)
      .order('planName', { ascending: true });

    if (error) {
      console.error('获取履约方案列表失败:', error);
      throw error;
    }

    console.log(`✅ 成功获取 ${plans?.length || 0} 个履约方案`);

    return NextResponse.json({
      success: true,
      data: plans || []
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