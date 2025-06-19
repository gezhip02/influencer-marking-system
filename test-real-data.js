const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testRealData() {
  try {
    console.log('🔍 检查数据库中的真实数据...\n');

    // 检查达人数据
    console.log('📊 达人数据:');
    const influencers = await prisma.influencer.findMany({
      where: { status: 1 },
      select: {
        id: true,
        displayName: true,
        username: true,
        platformId: true,
        followersCount: true,
        engagementRate: true,
        qualityScore: true,
        primaryCategory: true,
        status: true
      },
      orderBy: { displayName: 'asc' }
    });

    console.log(`找到 ${influencers.length} 位活跃达人:`);
    influencers.forEach((influencer, index) => {
      console.log(`${index + 1}. ${influencer.displayName || influencer.username || '未知姓名'}`);
      console.log(`   - 平台ID: ${influencer.platformId}`);
      console.log(`   - 粉丝数: ${influencer.followersCount.toLocaleString()}`);
      console.log(`   - 互动率: ${influencer.engagementRate || 0}%`);
      console.log(`   - 质量评分: ${influencer.qualityScore || 0}/5`);
      console.log(`   - 类别: ${influencer.primaryCategory || '未分类'}`);
      console.log(`   - ID: ${influencer.id}\n`);
    });

    // 检查产品数据 (从CooperationProduct表获取)
    console.log('📦 产品数据:');
    const products = await prisma.cooperationProduct.findMany({
      where: { status: 1 },
      select: {
        id: true,
        name: true,
        description: true,
        brand: true,
        category: true,
        price: true,
        currency: true,
        country: true,
        skuSeries: true,
        priority: true
      },
      orderBy: { name: 'asc' }
    });

    console.log(`找到 ${products.length} 个活跃产品:`);
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name || '未知产品'} (${product.brand || '未知品牌'})`);
      console.log(`   - 价格: ${product.price ? `${product.currency} ${product.price.toLocaleString()}` : '未知'}`);
      console.log(`   - 类别: ${product.category || '未分类'}`);
      console.log(`   - 国家: ${product.country}`);
      console.log(`   - SKU: ${product.skuSeries}`);
      console.log(`   - 优先级: ${product.priority || 'medium'}`);
      console.log(`   - ID: ${product.id}\n`);
    });

    // 检查履约方案数据
    console.log('📋 履约方案数据:');
    const plans = await prisma.fulfillmentPlan.findMany({
      where: { status: 1 },
      select: {
        id: true,
        planCode: true,
        planName: true,
        contentType: true,
        requiresSample: true,
        isInfluencerMade: true
      },
      orderBy: { planName: 'asc' }
    });

    console.log(`找到 ${plans.length} 个活跃履约方案:`);
    plans.forEach((plan, index) => {
      console.log(`${index + 1}. ${plan.planName}`);
      console.log(`   - 代码: ${plan.planCode}`);
      console.log(`   - 内容类型: ${plan.contentType}`);
      console.log(`   - 需要寄样: ${plan.requiresSample ? '是' : '否'}`);
      console.log(`   - 达人自制: ${plan.isInfluencerMade ? '是' : '否'}`);
      console.log(`   - ID: ${plan.id}\n`);
    });

    // 检查平台数据
    console.log('🎯 平台数据:');
    const platforms = await prisma.platform.findMany({
      where: { status: 1 },
      select: {
        id: true,
        name: true,
        displayName: true,
        status: true
      },
      orderBy: { displayName: 'asc' }
    });

    console.log(`找到 ${platforms.length} 个活跃平台:`);
    platforms.forEach((platform, index) => {
      console.log(`${index + 1}. ${platform.displayName} (${platform.name})`);
      console.log(`   - ID: ${platform.id}\n`);
    });

    console.log('✅ 数据检查完成!');

    // 测试API响应格式
    console.log('\n🔧 测试API响应格式...');
    
    // 模拟达人API响应
    const influencerApiData = influencers.map(inf => ({
      id: inf.id.toString(),
      displayName: inf.displayName || inf.username || '未知姓名',
      platformHandle: inf.username,
      primaryPlatform: platforms.find(p => p.id === inf.platformId)?.name || 'unknown',
      followersCount: inf.followersCount,
      engagementRate: inf.engagementRate || 0,
      score: inf.qualityScore ? inf.qualityScore * 20 : 60, // 转换为0-100分制
      status: inf.status
    }));

    console.log('达人API数据样例:');
    console.log(JSON.stringify(influencerApiData.slice(0, 2), null, 2));

    // 模拟产品API响应
    const productApiData = products.map(prod => ({
      id: prod.id.toString(),
      name: prod.name,
      description: prod.description,
      brand: prod.brand,
      category: prod.category,
      price: prod.price || 0,
      currency: prod.currency || 'CNY',
      targetAudience: '目标受众信息',
      priority: prod.priority || 'medium',
      country: prod.country,
      skuSeries: prod.skuSeries,
      status: 1
    }));

    console.log('\n产品API数据样例:');
    console.log(JSON.stringify(productApiData.slice(0, 2), null, 2));

  } catch (error) {
    console.error('❌ 检查数据时出错:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testRealData(); 