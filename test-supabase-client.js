#!/usr/bin/env node

// Supabase客户端连接测试脚本
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

console.log('🚀 Supabase客户端连接测试开始...\n');

async function testSupabaseClient() {
  // 检查环境变量
  console.log('1️⃣ 检查环境变量...');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl) {
    console.log('❌ NEXT_PUBLIC_SUPABASE_URL 未设置');
    return false;
  }
  
  if (!supabaseAnonKey) {
    console.log('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY 未设置');
    return false;
  }
  
  console.log('✅ Supabase环境变量已设置');
  console.log(`📍 项目URL: ${supabaseUrl}`);
  console.log(`🔑 匿名密钥: ${supabaseAnonKey.substring(0, 20)}...`);
  
  // 创建Supabase客户端
  console.log('\n2️⃣ 创建Supabase客户端...');
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: false,
      detectSessionInUrl: false
    },
    db: {
      schema: 'public'
    },
    global: {
      headers: {
        'X-Client-Info': 'influencer-marking-system-test'
      }
    }
  });
  
  console.log('✅ Supabase客户端创建成功');
  
  // 测试基本连接
  console.log('\n3️⃣ 测试基本连接...');
  
  try {
    // 测试最简单的查询 - 获取PostgreSQL版本
    const { data, error } = await supabase.rpc('version');
    
    if (error) {
      console.log('❌ 基本连接失败:', error.message);
      
      // 尝试其他方式测试连接
      console.log('🔄 尝试表查询测试...');
      
      const { data: tables, error: tableError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .limit(1);
      
      if (tableError) {
        console.log('❌ 表查询也失败:', tableError.message);
        console.log('💡 可能的原因:');
        console.log('   - Supabase项目未激活或被暂停');
        console.log('   - API密钥无效');
        console.log('   - 项目URL错误');
        console.log('   - 网络连接问题');
        return false;
      }
      
      console.log('✅ 通过表查询成功连接');
      console.log('📋 数据库连接正常');
    } else {
      console.log('✅ 基本连接成功');
      if (data) {
        console.log('🗃️ PostgreSQL信息:', data);
      }
    }
  } catch (error) {
    console.log('❌ 连接测试异常:', error.message);
    return false;
  }
  
  // 测试表结构查询
  console.log('\n4️⃣ 测试表结构查询...');
  
  try {
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_table_list');
    
    if (tablesError) {
      // 如果自定义函数不存在，使用标准查询
      console.log('📋 使用标准方式查询表结构...');
      
      const { data: standardTables, error: standardError } = await supabase
        .from('pg_tables')
        .select('tablename')
        .eq('schemaname', 'public');
      
      if (standardError) {
        console.log('⚠️ 无法查询表结构:', standardError.message);
        console.log('💡 这可能是因为缺少必要的权限或表不存在');
      } else {
        console.log('✅ 表结构查询成功');
        console.log('📊 数据库表数量:', standardTables ? standardTables.length : 0);
        if (standardTables && standardTables.length > 0) {
          console.log('📋 数据库表:', standardTables.map(t => t.tablename).join(', '));
        }
      }
    } else {
      console.log('✅ 自定义函数查询成功:', tables);
    }
  } catch (error) {
    console.log('⚠️ 表结构查询异常:', error.message);
  }
  
  // 测试数据操作权限
  console.log('\n5️⃣ 测试数据操作权限...');
  
  const testTables = ['users', 'platforms', 'influencers', 'tags'];
  
  for (const table of testTables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
        .limit(1);
      
      if (error) {
        console.log(`❌ 表 ${table} 查询失败:`, error.message);
        
        if (error.message.includes('relation') && error.message.includes('does not exist')) {
          console.log(`💡 表 ${table} 不存在，需要创建表结构`);
        } else if (error.message.includes('permission denied')) {
          console.log(`💡 表 ${table} 权限不足`);
        }
      } else {
        console.log(`✅ 表 ${table} 查询成功，记录数: ${count || 0}`);
      }
    } catch (error) {
      console.log(`❌ 表 ${table} 查询异常:`, error.message);
    }
  }
  
  return true;
}

// 提供解决方案
function provideSolutions() {
  console.log('\n🔧 Supabase客户端连接解决方案:\n');
  
  console.log('方案1: 检查Supabase项目状态');
  console.log('  1. 访问 https://app.supabase.com');
  console.log('  2. 登录你的账户');
  console.log('  3. 检查项目状态是否为 "Active"');
  console.log('  4. 如果显示 "Paused"，点击 "Resume" 恢复项目\n');
  
  console.log('方案2: 验证API配置');
  console.log('  1. 在Supabase控制台进入 Settings -> API');
  console.log('  2. 复制 Project URL 和 anon public key');
  console.log('  3. 更新 .env.local 文件中的配置\n');
  
  console.log('方案3: 创建数据库表结构');
  console.log('  1. 如果表不存在，需要先创建表结构');
  console.log('  2. 可以使用 Supabase SQL Editor 执行建表语句');
  console.log('  3. 或者使用 Prisma: npx prisma db push\n');
  
  console.log('方案4: 检查RLS(行级安全)策略');
  console.log('  1. 在Supabase控制台进入 Authentication -> Policies');
  console.log('  2. 确保有适当的读写策略');
  console.log('  3. 或者临时禁用RLS进行测试\n');
  
  console.log('方案5: 网络和权限问题');
  console.log('  1. 检查网络连接');
  console.log('  2. 尝试使用VPN（如果在国内）');
  console.log('  3. 确认API密钥权限正确\n');
}

// 主函数
async function main() {
  try {
    const success = await testSupabaseClient();
    
    if (success) {
      console.log('\n🎉 Supabase客户端连接测试完成！');
      console.log('💡 如果某些表查询失败，可能需要创建表结构或配置权限');
      console.log('🚀 可以开始使用Supabase客户端进行开发了');
    } else {
      console.log('\n❌ Supabase客户端连接测试失败');
      provideSolutions();
    }
  } catch (error) {
    console.error('\n💥 测试过程中发生异常:', error.message);
    provideSolutions();
  }
}

main(); 