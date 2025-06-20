const { PrismaClient } = require('@prisma/client');

// 使用直接的连接字符串，避免URL编码问题
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:20190101Gx@db.efzpntcevdiwkaqubrxq.supabase.co:5432/postgres"
    }
  }
});

async function main() {
  try {
    console.log('🚀 开始连接到Supabase数据库...');
    
    // 测试连接
    await prisma.$connect();
    console.log('✅ 成功连接到Supabase数据库');
    
    // 检查数据库中的表
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `;
    
    console.log('📋 当前数据库中的表：', tables);
    
    // 如果没有表，提示需要推送schema
    if (tables.length === 0) {
      console.log('🔄 数据库为空，需要推送schema');
      console.log('请运行: npx prisma db push');
    } else {
      console.log('✅ 数据库已包含表结构');
    }
    
  } catch (error) {
    console.error('❌ 连接失败:', error.message);
    
    if (error.message.includes("Can't reach database server")) {
      console.log('💡 解决建议:');
      console.log('1. 检查Supabase项目是否处于活跃状态');
      console.log('2. 确认数据库密码是否正确');
      console.log('3. 检查网络连接');
      console.log('4. 在Supabase Dashboard中重置数据库密码');
    }
  } finally {
    await prisma.$disconnect();
  }
}

main(); 