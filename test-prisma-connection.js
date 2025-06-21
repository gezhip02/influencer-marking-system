require('dotenv').config({ path: '.env.local' });

async function testPrismaConnection() {
  console.log('🧪 测试Prisma连接...\n');

  try {
    // 动态导入Prisma
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    });

    console.log('1️⃣ 环境变量检查:');
    console.log('DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 50) + '...');
    
    console.log('\n2️⃣ 尝试连接数据库...');
    
    // 测试连接
    await prisma.$connect();
    console.log('✅ Prisma连接成功');

    // 测试简单查询
    console.log('\n3️⃣ 测试查询...');
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ 查询成功:', result);

    await prisma.$disconnect();

  } catch (error) {
    console.error('❌ Prisma连接失败:');
    console.error('错误类型:', error.constructor.name);
    console.error('错误信息:', error.message);
    
    if (error.code) {
      console.error('错误代码:', error.code);
    }
    
    console.error('\n🔍 详细错误信息:');
    console.error(error);
  }
}

testPrismaConnection().catch(console.error); 