const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// 雪花ID生成器简化版本
function generateId() {
  return BigInt(Date.now()) * 1000000n + BigInt(Math.floor(Math.random() * 1000000));
}

async function fixMissingAccounts() {
  console.log('🔧 修复缺失的账户记录...\n');

  try {
    // 需要修复的用户和密码映射
    const usersToFix = [
      { email: 'admin@example.com', password: 'admin123' },
      { email: 'test@example.com', password: 'test123' }
    ];

    for (const userInfo of usersToFix) {
      console.log(`🔍 检查用户: ${userInfo.email}`);
      
      // 查找用户
      const user = await prisma.user.findUnique({
        where: { email: userInfo.email }
      });

      if (!user) {
        console.log(`  ❌ 用户不存在: ${userInfo.email}`);
        continue;
      }

      // 检查是否已有账户记录
      const existingAccount = await prisma.account.findFirst({
        where: {
          userId: user.id,
          provider: 'credentials',
          type: 'credentials',
          status: 1
        }
      });

      if (existingAccount) {
        console.log(`  ✅ 账户记录已存在: ${userInfo.email}`);
        continue;
      }

      // 创建账户记录
      console.log(`  🔧 创建账户记录: ${userInfo.email}`);
      
      const hashedPassword = await bcrypt.hash(userInfo.password, 12);
      
      await prisma.account.create({
        data: {
          id: generateId(),
          userId: user.id,
          type: 'credentials',
          provider: 'credentials',
          providerAccountId: user.id.toString(),
          access_token: hashedPassword,
          status: 1
        }
      });

      console.log(`  ✅ 账户记录创建成功: ${userInfo.email}`);
    }

    // 验证修复结果
    console.log('\n📋 修复后的状态检查:');
    console.log('='.repeat(40));
    
    for (const userInfo of usersToFix) {
      const user = await prisma.user.findUnique({
        where: { email: userInfo.email }
      });

      if (user) {
        const account = await prisma.account.findFirst({
          where: {
            userId: user.id,
            provider: 'credentials',
            type: 'credentials',
            status: 1
          }
        });

        if (account) {
          console.log(`✅ ${userInfo.email}: 用户和账户记录都正常`);
        } else {
          console.log(`❌ ${userInfo.email}: 用户存在但缺少账户记录`);
        }
      } else {
        console.log(`❌ ${userInfo.email}: 用户不存在`);
      }
    }

    console.log('\n🎉 账户修复完成！');

  } catch (error) {
    console.error('❌ 修复账户时出错:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 运行脚本
fixMissingAccounts()
  .catch((error) => {
    console.error('脚本执行失败:', error);
    process.exit(1);
  }); 