import { NextRequest, NextResponse } from 'next/server'
import { supabase, db, testSupabaseConnection } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 开始测试Supabase客户端连接...')
    
    // 基本连接测试
    const connectionTest = await testSupabaseConnection()
    
    if (!connectionTest.success) {
      return NextResponse.json({
        success: false,
        message: connectionTest.message,
        error: 'CONNECTION_FAILED'
      }, { status: 500 })
    }
    
    console.log('✅ 基本连接测试成功')
    
    // 获取数据库基本信息
    const { data: version, error: versionError } = await supabase
      .rpc('version')
    
    let dbVersion = 'Unknown'
    if (!versionError && version) {
      dbVersion = version
    }
    
    // 测试表查询
    const tables = ['users', 'platforms', 'influencers', 'tags']
    const tableTests = []
    
    for (const table of tables) {
      try {
        const { data, error, count } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })
          .limit(1)
        
        if (error) {
          tableTests.push({
            table,
            status: 'error',
            error: error.message,
            count: 0
          })
        } else {
          tableTests.push({
            table,
            status: 'success',
            count: count || 0
          })
        }
      } catch (err) {
        tableTests.push({
          table,
          status: 'exception',
          error: err instanceof Error ? err.message : 'Unknown error',
          count: 0
        })
      }
    }
    
    // 返回测试结果
    return NextResponse.json({
      success: true,
      message: 'Supabase客户端连接测试成功',
      data: {
        connectionStatus: 'connected',
        databaseVersion: dbVersion,
        timestamp: new Date().toISOString(),
        tableTests,
        summary: {
          totalTables: tables.length,
          successfulTables: tableTests.filter(t => t.status === 'success').length,
          failedTables: tableTests.filter(t => t.status !== 'success').length
        }
      }
    })
    
  } catch (error) {
    console.error('❌ Supabase连接测试失败:', error)
    
    return NextResponse.json({
      success: false,
      message: `Supabase连接测试失败: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error: 'SUPABASE_ERROR'
    }, { status: 500 })
  }
}

// 测试数据创建
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, table, data } = body
    
    console.log(`🧪 测试 ${action} 操作在表 ${table}`)
    
    if (action === 'create' && table === 'users') {
      const testUser = {
        id: `test_${Date.now()}`,
        email: `test_${Date.now()}@example.com`,
        name: '测试用户',
        role: 'USER',
        language: 'zh-CN',
        status: 1,
        loginCount: 0,
        createdAt: Math.floor(Date.now() / 1000),
        updatedAt: Math.floor(Date.now() / 1000)
      }
      
      const result = await db.users.create(testUser)
      
      return NextResponse.json({
        success: true,
        message: '测试用户创建成功',
        data: result
      })
    }
    
    if (action === 'create' && table === 'platforms') {
      const testPlatform = {
        id: `test_${Date.now()}`,
        name: 'test_platform',
        displayName: '测试平台',
        status: 1,
        createdAt: Math.floor(Date.now() / 1000),
        updatedAt: Math.floor(Date.now() / 1000)
      }
      
      const result = await db.platforms.create(testPlatform)
      
      return NextResponse.json({
        success: true,
        message: '测试平台创建成功',
        data: result
      })
    }
    
    return NextResponse.json({
      success: false,
      message: '不支持的操作或表',
      error: 'UNSUPPORTED_OPERATION'
    }, { status: 400 })
    
  } catch (error) {
    console.error('❌ 数据操作测试失败:', error)
    
    return NextResponse.json({
      success: false,
      message: `数据操作失败: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error: 'OPERATION_ERROR'
    }, { status: 500 })
  }
} 