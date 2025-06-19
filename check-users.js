const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// 雪花ID生成器简化版本
function generateId() {
  return BigInt(Date.now()) * 1000000n + BigInt(Math.floor(Math.random() * 1000000));
}

async function checkAndCreateUsers() {
  console.log('🔍 检查用户和账户数据...\n');

  try {
    // 1. 检查现有用户
    const users = await prisma.user.findMany({
      where: { status: 1 }
    });
    
    console.log(`✅ 找到 ${users.length} 个活跃用户:`);
    users.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.email} (${user.role}) - ID: ${user.id}`);
    });
    console.log();

    // 2. 检查账户数据
    const accounts = await prisma.account.findMany({
      where: { status: 1 }
    });
    
    console.log(`✅ 找到 ${accounts.length} 个活跃账户:`);
    accounts.forEach((account, index) => {
      console.log(`  ${index + 1}. 用户ID: ${account.userId}, 提供商: ${account.provider}, 类型: ${account.type}`);
    });
    console.log();

    // 3. 如果没有管理员账户，创建一个
    let adminUser = users.find(user => user.role === 'ADMIN');
    
    if (!adminUser) {
      console.log('❌ 未找到管理员用户，正在创建...');
      
      const hashedPassword = await bcrypt.hash('admin123', 12);
      const currentTime = Math.floor(Date.now() / 1000);
      
      // 创建管理员用户
      adminUser = await prisma.user.create({
        data: {
          id: generateId(),
          email: 'admin@example.com',
          name: '系统管理员',
          username: 'admin',
          displayName: '系统管理员',
          role: 'ADMIN',
          department: 'IT',
          status: 1,
          language: 'zh-CN',
          loginCount: 0,
          createdAt: currentTime,
          updatedAt: currentTime
        }
      });
      
      // 创建对应的账户记录
      await prisma.account.create({
        data: {
          id: generateId(),
          userId: adminUser.id,
          type: 'credentials',
          provider: 'credentials',
          providerAccountId: adminUser.id.toString(),
          access_token: hashedPassword, // 存储加密后的密码
          status: 1
        }
      });
      
      console.log(`✅ 管理员账户创建成功: ${adminUser.email} / admin123`);
    } else {
      console.log(`✅ 管理员账户已存在: ${adminUser.email}`);
      
      // 检查管理员是否有对应的账户记录
      const adminAccount = await prisma.account.findFirst({
        where: {
          userId: adminUser.id,
          provider: 'credentials',
          type: 'credentials',
          status: 1
        }
      });
      
      if (!adminAccount) {
        console.log('⚠️ 管理员用户缺少账户记录，正在创建...');
        
        const hashedPassword = await bcrypt.hash('admin123', 12);
        
        await prisma.account.create({
          data: {
            id: generateId(),
            userId: adminUser.id,
            type: 'credentials',
            provider: 'credentials',
            providerAccountId: adminUser.id.toString(),
            access_token: hashedPassword,
            status: 1
          }
        });
        
        console.log('✅ 管理员账户记录创建成功');
      } else {
        console.log('✅ 管理员账户记录完整');
      }
    }
    
    // 4. 创建普通测试用户
    const testUserEmail = 'test@example.com';
    let testUser = users.find(user => user.email === testUserEmail);
    
    if (!testUser) {
      console.log('\n📝 创建测试用户...');
      
      const hashedPassword = await bcrypt.hash('test123', 12);
      const currentTime = Math.floor(Date.now() / 1000);
      
      testUser = await prisma.user.create({
        data: {
          id: generateId(),
          email: testUserEmail,
          name: '测试用户',
          username: 'testuser',
          displayName: '测试用户',
          role: 'USER',
          department: '测试部门',
          status: 1,
          language: 'zh-CN',
          loginCount: 0,
          createdAt: currentTime,
          updatedAt: currentTime
        }
      });
      
      await prisma.account.create({
        data: {
          id: generateId(),
          userId: testUser.id,
          type: 'credentials',
          provider: 'credentials',
          providerAccountId: testUser.id.toString(),
          access_token: hashedPassword,
          status: 1
        }
      });
      
      console.log(`✅ 测试用户创建成功: ${testUser.email} / test123`);
    } else {
      console.log(`✅ 测试用户已存在: ${testUser.email}`);
    }
    
    console.log('\n📋 可用的登录账户:');
    console.log('='.repeat(50));
    console.log('管理员账户:');
    console.log('  邮箱: admin@example.com');
    console.log('  密码: admin123');
    console.log('  角色: ADMIN');
    console.log('');
    console.log('测试用户账户:');
    console.log('  邮箱: test@example.com');
    console.log('  密码: test123');
    console.log('  角色: USER');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ 检查用户时出错:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 运行脚本
checkAndCreateUsers()
  .catch((error) => {
    console.error('脚本执行失败:', error);
    process.exit(1);
  }); 