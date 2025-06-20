require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  console.log(' 使用环境变量测试Supabase连接...');
  console.log(' DATABASE_URL:', process.env.DATABASE_URL ? 'Found' : 'Not Found');
  
  if (!process.env.DATABASE_URL) {
    console.error(' DATABASE_URL环境变量未找到');
    return false;
  }
  
  const urlMasked = process.env.DATABASE_URL.replace(/:([^:@]+)@/, ':***@');
  console.log(' 连接字符串:', urlMasked);
  
  const prisma = new PrismaClient();
  
  try {
    console.log(' 正在连接到Supabase...');
    
    const timeout = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('连接超时')), 15000);
    });
    
    await Promise.race([prisma.\(), timeout]);
    console.log(' 连接成功！');
    
    const version = await prisma.\\SELECT version() as version\;
    console.log(' PostgreSQL版本:', version[0].version.substring(0, 50) + '...');
    
    const tables = await prisma.\\
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    \;
    
    console.log(' 数据库表数量:', tables.length);
    
    if (tables.length === 0) {
      console.log(' 数据库为空，准备创建表结构...');
      return 'empty_db';
    } else {
      console.log(' 现有表:', tables.slice(0, 5).map(t => t.table_name).join(', '));
      return 'has_tables';
    }
    
  } catch (error) {
    console.error(' 连接失败:', error.message);
    
    if (error.message.includes('Can\\'t reach database server')) {
      console.log(' 可能原因: Supabase项目可能处于暂停状态');
    } else if (error.message.includes('password authentication failed')) {
      console.log(' 密码认证失败');
    }
    
    return false;
  } finally {
    await prisma.\();
  }
}

testConnection();
