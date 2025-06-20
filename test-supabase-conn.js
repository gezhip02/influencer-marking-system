const { PrismaClient } = require('@prisma/client');

async function test() {
  console.log(' 开始测试Supabase连接...');
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: 'postgresql://postgres:20190101Gx%40@db.efzpntcevdiwkaqubrxq.supabase.co:5432/postgres'
      }
    }
  });

  try {
    console.log(' 尝试连接到Supabase...');
    
    await Promise.race([
      prisma.$connect(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('连接超时')), 10000))
    ]);
    
    console.log(' 连接成功！');
    
    const result = await prisma.$queryRaw`SELECT version() as db_version`;
    console.log(' 数据库版本:', result[0].db_version);
    
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `;
    
    console.log(' 数据库表数量:', tables.length);
    console.log(' Supabase连接测试成功！');
    
  } catch (error) {
    console.error(' 连接失败:', error.message);
    
    if (error.message.includes("Can't reach database server")) {
      console.log(' 建议: 检查Supabase项目是否处于活跃状态');
    } else if (error.message.includes('authentication failed')) {
      console.log(' 建议: 在Supabase Dashboard中重置数据库密码');
    }
  } finally {
    await prisma.$disconnect();
  }
}

test();