const { PrismaClient } = require('@prisma/client');

async function testSupabaseConnection() {
  console.log('🧪 开始测试Supabase数据库连接...\n');
  
  // 测试不同的连接字符串格式
  const connectionStrings = [
    {
      name: '原始连接字符串 (URL编码@)',
      url: "postgresql://postgres:20190101Gx%40@db.efzpntcevdiwkaqubrxq.supabase.co:5432/postgres"
    },
    {
      name: '修正连接字符串 (直接@)',
      url: "postgresql://postgres:20190101Gx@db.efzpntcevdiwkaqubrxq.supabase.co:5432/postgres"
    }
  ];

  let successCount = 0;

  for (const connConfig of connectionStrings) {
    console.log(`📡 测试: ${connConfig.name}`);
    console.log(`🔗 连接字符串: ${connConfig.url.replace(/20190101Gx[^@]*/, '20190101Gx***')}\n`);
    
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: connConfig.url
        }
      }
    });

    try {
      // 设置连接超时
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('连接超时 (10秒)')), 10000);
      });

      // 尝试连接
      await Promise.race([
        prisma.$connect(),
        timeoutPromise
      ]);

      console.log('✅ 连接成功！');
      
      // 测试基本查询
      console.log('📋 测试基本查询...');
      const result = await prisma.$queryRaw`SELECT version() as db_version`;
      console.log('🗃️ 数据库版本:', result[0].db_version);
      
      // 检查现有表
      const tables = await prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
      `;
      
      console.log('📊 数据库中的表数量:', tables.length);
      if (tables.length > 0) {
        console.log('📋 现有表:', tables.map(t => t.table_name).join(', '));
      } else {
        console.log('📋 数据库为空，没有表');
      }
      
      console.log('🎉 数据库测试完全成功！\n');
      successCount++;
      await prisma.$disconnect();
      break; // 一旦成功就停止测试
      
    } catch (error) {
      console.error('❌ 连接失败:', error.message);
      
      // 错误分析
      if (error.message.includes("Can't reach database server")) {
        console.log('🔍 可能原因: 服务器无法访问');
        console.log('💡 建议: 检查Supabase项目是否处于活跃状态');
      } else if (error.message.includes('authentication failed') || error.message.includes('password authentication failed')) {
        console.log('🔍 可能原因: 密码错误');
        console.log('💡 建议: 在Supabase Dashboard中重置数据库密码');
      } else if (error.message.includes('连接超时')) {
        console.log('🔍 可能原因: 网络连接问题或服务器响应慢');
        console.log('💡 建议: 检查网络连接，稍后重试');
      } else {
        console.log('🔍 未知错误类型');
      }
      
      console.log('');
      await prisma.$disconnect();
    }
  }

  if (successCount === 0) {
    console.log('\n📋 所有连接尝试都失败了，可能的解决方案:');
    console.log('1. 🔄 在Supabase Dashboard中检查项目状态');
    console.log('2. 🔐 重置数据库密码');
    console.log('3. 🌐 检查网络连接');
    console.log('4. ⏰ 等待几分钟后重试（项目可能正在启动）');
    console.log('\n🌐 Supabase Dashboard: https://app.supabase.com/project/efzpntcevdiwkaqubrxq');
  }
  
  return successCount > 0;
}

// 运行测试
testSupabaseConnection()
  .then((success) => {
    if (success) {
      console.log('\n🎊 恭喜！Supabase连接测试成功，可以开始迁移数据库了！');
    } else {
      console.log('\n😞 连接测试失败，请先解决连接问题再进行迁移');
    }
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('\n💥 测试脚本执行失败:', error);
    process.exit(1);
  }); 