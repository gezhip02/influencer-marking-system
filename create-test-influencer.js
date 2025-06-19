// 创建测试达人数据
const { PrismaClient } = require('@prisma/client');
// 手动生成简单的ID
function generateId() {
  return BigInt(Date.now() * 1000 + Math.floor(Math.random() * 1000));
}

async function createTestInfluencer() {
  const prisma = new PrismaClient();
  
  try {
    console.log('正在创建测试达人...');
    
    // 先获取一个platform ID
    const platform = await prisma.platform.findFirst({
      where: { name: 'tiktok' }
    });
    
    if (!platform) {
      throw new Error('找不到TikTok平台');
    }
    
    // 创建测试达人
    const influencer = await prisma.influencer.create({
      data: {
        id: generateId(),
        username: 'test_influencer_001',
        displayName: '测试达人001',
        platformUserId: 'test_platform_001',
        platformId: platform.id,
        followersCount: 10000,
        country: 'CN',
        status: 1,
        createdAt: Math.floor(Date.now() / 1000),
        updatedAt: Math.floor(Date.now() / 1000)
      }
    });
    
    console.log('✅ 测试达人创建成功:', influencer.id.toString());
    console.log('   用户名:', influencer.username);
    console.log('   显示名:', influencer.displayName);
    
    // 检查其他基础数据
    const [plan, product, user] = await Promise.all([
      prisma.fulfillmentPlan.findFirst(),
      prisma.cooperationProduct.findFirst(),
      prisma.user.findFirst()
    ]);
    
    console.log('\n📋 基础数据检查:');
    console.log('   履约方案:', plan ? plan.id.toString() + ' (' + plan.planName + ')' : '❌ 无数据');
    console.log('   产品:', product ? product.id.toString() + ' (' + product.name + ')' : '❌ 无数据');
    console.log('   用户:', user ? user.id.toString() + ' (' + user.name + ')' : '❌ 无数据');
    
    return {
      influencerId: influencer.id.toString(),
      planId: plan?.id.toString(),
      productId: product?.id.toString(),
      ownerId: user?.id.toString()
    };
    
  } catch (error) {
    console.error('❌ 错误:', error.message);
    return null;
  } finally {
    await prisma.$disconnect();
  }
}

// 运行创建
createTestInfluencer().then(result => {
  if (result) {
    console.log('\n🎯 测试用的ID:');
    console.log('   influencerId:', result.influencerId);
    console.log('   planId:', result.planId);
    console.log('   productId:', result.productId);
    console.log('   ownerId:', result.ownerId);
  }
}); 