import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 获取平台列表...');

    // 使用Supabase客户端获取所有活跃的平台
    const { data: platforms, error } = await supabase
      .from('platforms')
      .select('id, name, displayName, status, apiEndpoint, createdAt, updatedAt')
      .eq('status', 1)
      .order('displayName', { ascending: true });

    if (error) {
      console.error('获取平台列表失败:', error);
      throw error;
    }

    console.log(`✅ 成功获取 ${platforms?.length || 0} 个平台`);

    return NextResponse.json({
      success: true,
      platforms: platforms || []
    });

  } catch (error) {
    console.error('Error fetching platforms:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch platforms', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
} 