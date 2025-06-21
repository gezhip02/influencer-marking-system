#!/usr/bin/env node

// 最简单的Supabase连接测试
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

console.log('🔍 简单Supabase连接测试\n');

async function simpleTest() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  console.log('环境变量检查:');
  console.log('- URL:', supabaseUrl ? '✅ 已设置' : '❌ 未设置');
  console.log('- Key:', supabaseAnonKey ? '✅ 已设置' : '❌ 未设置');
  console.log('');
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.log('❌ 环境变量缺失，请检查 .env.local 文件');
    return;
  }
  
  // 创建客户端
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  console.log('测试步骤:');
  
  // 1. 测试最基本的连接
  console.log('1. 测试基本连接...');
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('   ❌ 连接失败:', error.message);
      
      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        console.log('   💡 表不存在 - 需要创建数据库表结构');
      } else if (error.message.includes('Invalid API key')) {
        console.log('   💡 API密钥无效');
      } else {
        console.log('   💡 可能的原因: 项目暂停、网络问题或权限不足');
      }
    } else {
      console.log('   ✅ 连接成功！');
      return true;
    }
  } catch (err) {
    console.log('   ❌ 连接异常:', err.message);
  }
  
  // 2. 尝试使用原始SQL
  console.log('2. 测试原始SQL查询...');
  try {
    const { data, error } = await supabase.rpc('current_database');
    
    if (error) {
      console.log('   ❌ SQL查询失败:', error.message);
    } else {
      console.log('   ✅ SQL查询成功:', data);
      return true;
    }
  } catch (err) {
    console.log('   ❌ SQL查询异常:', err.message);
  }
  
  // 3. 检查项目健康状态
  console.log('3. 检查项目健康状态...');
  try {
    // 使用任意表名来测试连接是否可达
    const { error } = await supabase.from('_health_check').select('*').limit(1);
    
    if (error) {
      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        console.log('   ✅ 数据库可达但表不存在（正常）');
        console.log('   💡 需要创建表结构');
        return 'need_tables';
      } else {
        console.log('   ❌ 项目健康检查失败:', error.message);
      }
    }
  } catch (err) {
    console.log('   ❌ 健康检查异常:', err.message);
  }
  
  return false;
}

// 主函数
async function main() {
  const result = await simpleTest();
  
  console.log('\n📋 测试结果总结:');
  
  if (result === true) {
    console.log('🎉 Supabase连接完全正常！');
    console.log('💡 可以开始使用Supabase客户端进行开发');
  } else if (result === 'need_tables') {
    console.log('⚠️ 连接正常但需要创建表结构');
    console.log('💡 解决方案:');
    console.log('   1. 使用Supabase控制台的SQL Editor');
    console.log('   2. 或者运行: npx prisma db push');
  } else {
    console.log('❌ 连接测试失败');
    console.log('🔧 请按以下步骤检查:');
    console.log('   1. 访问 https://app.supabase.com');
    console.log('   2. 检查项目状态是否为 "Active"');
    console.log('   3. 如果项目被暂停，点击 "Resume" 恢复');
    console.log('   4. 在 Settings -> API 中获取最新的URL和Key');
    console.log('   5. 更新 .env.local 文件');
  }
  
  console.log('\n📞 如需帮助:');
  console.log('- Supabase项目地址: https://app.supabase.com/project/efzpntcevdiwkaqubrxq');
  console.log('- 确保项目处于活跃状态');
  console.log('- 检查网络连接（可能需要VPN）');
}

main(); 