require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  console.log('🧪 使用环境变量测试Supabase连接...');
  console.log('🔗 DATABASE_URL:', process.env.DATABASE_URL ? 'Found' : 'Not Found');
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL环境变量未找到');
    return false;
  }
  
  // 隐藏密码显示连接信息
  const urlMasked = process.env.DATABASE_URL.replace(/:([^:@]+)@/, ':***@');
  console.log('🔗 连接字符串:', urlMasked);
  
  const prisma = new PrismaClient();
  
  try {
    console.log('📡 正在连接到Supabase...');
    
    const timeout = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('连接超时 (15秒)')), 15000);
    });
    
    await Promise.race([prisma.$connect(), timeout]);
    console.log('✅ 连接成功！');
    
    // 测试查询
    const version = await prisma.$queryRaw`SELECT version() as version`;
    console.log('🗃️ PostgreSQL版本:', version[0].version.substring(0, 50) + '...');
    
    // 检查现有表
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;
    
    console.log('📊 数据库表数量:', tables.length);
    
    if (tables.length === 0) {
      console.log('🔄 数据库为空，准备创建表结构...');
      return 'empty_db';
    } else {
      console.log('📋 现有表:', tables.slice(0, 5).map(t => t.table_name).join(', ') + (tables.length > 5 ? '...' : ''));
      return 'has_tables';
    }
    
  } catch (error) {
    console.error('❌ 连接失败:', error.message);
    
    if (error.message.includes("Can't reach database server")) {
      console.log('🔍 可能原因:');
      console.log('  1. Supabase项目可能处于暂停状态');
      console.log('  2. 网络连接问题');
      console.log('💡 建议: 访问 Supabase Dashboard 检查项目状态');
    } else if (error.message.includes('password authentication failed')) {
      console.log('🔍 密码认证失败');
      console.log('💡 建议: 重新设置数据库密码');
    } else if (error.message.includes('连接超时')) {
      console.log('🔍 连接超时');
      console.log('💡 建议: 检查网络或稍后重试');
    }
    
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

testConnection()
  .then(result => {
    if (result === 'empty_db') {
      console.log('\n🎯 下一步: 运行 npx prisma db push 创建表结构');
    } else if (result === 'has_tables') {
      console.log('\n✅ 数据库已准备就绪！');
    } else {
      console.log('\n❌ 连接失败，请先解决连接问题');
    }
  })
  .catch(err => {
    console.error('\n💥 测试脚本错误:', err);
  }); 