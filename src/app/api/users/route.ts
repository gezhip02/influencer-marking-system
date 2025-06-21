import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 创建Supabase客户端
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 获取用户列表 - 使用Supabase客户端')
    
    // 解析查询参数
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    
    // 计算分页
    const offset = (page - 1) * limit
    
    try {
      let query = supabase
        .from('users')
        .select('*', { count: 'exact' })
        .eq('status', 1)
        .order('createdAt', { ascending: false })
        .range(offset, offset + limit - 1)
      
      // 如果有搜索条件
      if (search) {
        query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,username.ilike.%${search}%`)
      }
      
      const { data: users, error, count } = await query
      
      if (error) {
        console.error('❌ Supabase查询错误:', error)
        
        if (error.message.includes('relation') && error.message.includes('does not exist')) {
          return NextResponse.json({
            success: false,
            message: '表不存在，需要创建数据库结构',
            error: 'TABLE_NOT_FOUND',
            suggestion: '请运行数据库迁移创建表结构'
          }, { status: 404 })
        }
        
        return NextResponse.json({
          success: false,
          message: `数据库查询失败: ${error.message}`,
          error: error.code || 'QUERY_ERROR'
        }, { status: 500 })
      }
      
      // 计算分页信息
      const totalPages = Math.ceil((count || 0) / limit)
      
      console.log(`✅ 成功获取用户列表: ${users?.length || 0} 条记录`)
      
      return NextResponse.json({
        success: true,
        message: 'Supabase用户数据获取成功',
        data: users || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        },
        meta: {
          dataSource: 'supabase',
          timestamp: new Date().toISOString()
        }
      })
      
    } catch (dbError) {
      console.error('❌ 数据库连接异常:', dbError)
      
      return NextResponse.json({
        success: false,
        message: `数据库连接失败: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`,
        error: 'CONNECTION_ERROR'
      }, { status: 500 })
    }
    
  } catch (error) {
    console.error('❌ API处理异常:', error)
    
    return NextResponse.json({
      success: false,
      message: `服务器内部错误: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error: 'INTERNAL_ERROR'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📝 创建用户 - 使用Supabase客户端')
    
    const body = await request.json()
    const { name, email, username, role = 'USER' } = body
    
    if (!email) {
      return NextResponse.json({
        success: false,
        message: '邮箱地址为必填项',
        error: 'VALIDATION_ERROR'
      }, { status: 400 })
    }
    
    // 生成用户ID
    const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
    
    const newUser = {
      id: userId,
      name,
      email,
      username,
      role,
      language: 'zh-CN',
      status: 1,
      loginCount: 0,
      createdAt: Math.floor(Date.now() / 1000),
      updatedAt: Math.floor(Date.now() / 1000)
    }
    
    const { data: user, error } = await supabase
      .from('users')
      .insert(newUser)
      .select()
      .single()
    
    if (error) {
      console.error('❌ 用户创建失败:', error)
      
      if (error.message.includes('duplicate key')) {
        return NextResponse.json({
          success: false,
          message: '邮箱或用户名已存在',
          error: 'DUPLICATE_ERROR'
        }, { status: 409 })
      }
      
      return NextResponse.json({
        success: false,
        message: `用户创建失败: ${error.message}`,
        error: error.code || 'CREATE_ERROR'
      }, { status: 500 })
    }
    
    console.log(`✅ 用户创建成功: ${user.email}`)
    
    return NextResponse.json({
      success: true,
      message: 'Supabase用户创建成功',
      data: user,
      meta: {
        dataSource: 'supabase',
        timestamp: new Date().toISOString()
      }
    })
    
  } catch (error) {
    console.error('❌ 用户创建异常:', error)
    
    return NextResponse.json({
      success: false,
      message: `服务器内部错误: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error: 'INTERNAL_ERROR'
    }, { status: 500 })
  }
} 