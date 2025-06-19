const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugAccounts() {
  console.log('🔍 调试用户和账户数据...\n');

  try {
    // 1. 查看所有用户
    const users = await prisma.user.findMany({
      where: { status: 1 }
    });
    
    console.log('👥 用户列表:');
    users.forEach((user, index) => {
      console.log(`  ${index + 1}. ID: ${user.id}, Email: ${user.email}, Role: ${user.role}`);
    });
    console.log();

    // 2. 查看所有账户
    const accounts = await prisma.account.findMany({
      where: { status: 1 }
    });
    
    console.log('🔐 账户列表:');
    accounts.forEach((account, index) => {
      console.log(`  ${index + 1}. ID: ${account.id}, UserID: ${account.userId}, Provider: ${account.provider}, Type: ${account.type}`);
      console.log(`      HasToken: ${!!account.access_token}, TokenLength: ${account.access_token ? account.access_token.length : 0}`);
    });
    console.log();

    // 3. 检查特定用户的账户
    const testEmails = ['admin@example.com', 'test@example.com'];
    
    for (const email of testEmails) {
      console.log(`🔍 检查用户: ${email}`);
      
      const user = await prisma.user.findUnique({
        where: { email }
      });
      
      if (user) {
        console.log(`  ✅ 用户存在: ID ${user.id}, Status ${user.status}`);
        
        const userAccounts = await prisma.account.findMany({
          where: {
            userId: user.id,
            status: 1
          }
        });
        
        console.log(`  📋 找到 ${userAccounts.length} 个账户记录:`);
        userAccounts.forEach((acc, i) => {
          console.log(`    ${i + 1}. Provider: ${acc.provider}, Type: ${acc.type}`);
          console.log(`       Access Token: ${acc.access_token ? '有' : '无'} (长度: ${acc.access_token ? acc.access_token.length : 0})`);
        });
        
        // 查找credentials账户
        const credentialAccount = await prisma.account.findFirst({
          where: {
            userId: user.id,
            provider: 'credentials',
            type: 'credentials',
            status: 1
          }
        });
        
        if (credentialAccount) {
          console.log(`  ✅ 找到credentials账户`);
        } else {
          console.log(`  ❌ 未找到credentials账户`);
        }
      } else {
        console.log(`  ❌ 用户不存在`);
      }
      console.log();
    }

  } catch (error) {
    console.error('❌ 调试时出错:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 运行脚本
debugAccounts()
  .catch((error) => {
    console.error('脚本执行失败:', error);
    process.exit(1);
  }); 