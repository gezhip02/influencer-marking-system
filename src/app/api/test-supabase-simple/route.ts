import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 测试Supabase客户端连接...')
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({
        success: false,
        message: 'Supabase环境变量未配置'
      }, { status: 500 })
    }
    
    // 创建Supabase客户端
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    // 简单的连接测试
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (error) {
      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        return NextResponse.json({
          success: true,
          message: 'Supabase连接成功，但表不存在',
          data: {
            connectionStatus: 'connected',
            tablesExist: false,
            error: error.message
          }
        })
      }
      
      return NextResponse.json({
        success: false,
        message: `Supabase连接失败: ${error.message}`,
        error: error.code
      }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Supabase连接成功！',
      data: {
        connectionStatus: 'connected',
        tablesExist: true,
        timestamp: new Date().toISOString()
      }
    })
    
  } catch (error) {
    console.error('❌ Supabase连接测试失败:', error)
    
    return NextResponse.json({
      success: false,
      message: `测试异常: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error: 'EXCEPTION'
    }, { status: 500 })
  }
} 