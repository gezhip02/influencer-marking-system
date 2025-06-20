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
    },
    {
      name: '转义特殊字符',
      url: "postgresql://postgres:20190101Gx%2540@db.efzpntcevdiwkaqubrxq.supabase.co:5432/postgres"
    }
  ];

  for (const connConfig of connectionStrings) {
    console.log(`📡 测试: ${connConfig.name}`);
    console.log(`🔗 连接字符串: ${connConfig.url}\n`);
    
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
      await prisma.$disconnect();
      return true;
      
    } catch (error) {
      console.error('❌ 连接失败:', error.message);
      
      // 错误分析
      if (error.message.includes("Can't reach database server")) {
        console.log('🔍 可能原因: 服务器无法访问');
        console.log('💡 建议: 检查Supabase项目是否处于活跃状态');
      } else if (error.message.includes('authentication failed')) {
        console.log('🔍 可能原因: 密码错误');
        console.log('💡 建议: 在Supabase Dashboard中重置数据库密码');
      } else if (error.message.includes('连接超时')) {
        console.log('🔍 可能原因: 网络连接问题或服务器响应慢');
        console.log('💡 建议: 检查网络连接，稍后重试');
      } else {
        console.log('🔍 未知错误，详细信息:', error);
      }
      
      console.log('');
      await prisma.$disconnect();
    }
  }

  // 额外的网络测试
  console.log('🌐 测试DNS解析和网络连接...');
  try {
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);
    
    // 测试DNS解析
    try {
      await execAsync('nslookup db.efzpntcevdiwkaqubrxq.supabase.co');
      console.log('✅ DNS解析成功');
    } catch (dnsError) {
      console.log('❌ DNS解析失败');
    }
    
    // 测试端口连接 (Windows)
    try {
      await execAsync('Test-NetConnection -ComputerName db.efzpntcevdiwkaqubrxq.supabase.co -Port 5432', { shell: 'powershell' });
      console.log('✅ 端口5432可访问');
    } catch (portError) {
      console.log('❌ 端口5432无法访问');
    }
    
  } catch (networkError) {
    console.log('⚠️ 网络测试工具不可用，跳过网络诊断');
  }

  console.log('\n📋 测试完成总结:');
  console.log('1. 如果所有连接都失败，请检查Supabase项目状态');
  console.log('2. 如果是认证错误，请重置数据库密码');
  console.log('3. 如果是网络问题，请检查防火墙和网络设置');
  console.log('4. 项目可能需要从暂停状态恢复');
  
  return false;
}

// 运行测试
testSupabaseConnection()
  .then((success) => {
    if (success) {
      console.log('\n🎊 恭喜！Supabase连接测试成功');
    } else {
      console.log('\n😞 所有连接尝试都失败了，请检查上述建议');
    }
  })
  .catch((error) => {
    console.error('\n💥 测试脚本执行失败:', error);
  }); 