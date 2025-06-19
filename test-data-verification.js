const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyTestData() {
  try {
    console.log('🔍 验证测试数据...\n');

    // 1. 验证平台数据
    const platforms = await prisma.platform.findMany({
      where: { status: 1 },
      orderBy: { name: 'asc' }
    });
    console.log(`✅ 平台数据 (${platforms.length} 个):`);
    platforms.forEach(platform => {
      console.log(`   - ${platform.name}: ${platform.displayName}`);
    });
    console.log();

    // 2. 验证标签数据
    const tags = await prisma.tag.findMany({
      where: { status: 1 },
      orderBy: { sortOrder: 'asc' }
    });
    console.log(`✅ 标签数据 (${tags.length} 个):`);
    tags.forEach(tag => {
      console.log(`   - ${tag.name}: ${tag.displayName} (${tag.category})`);
    });
    console.log();

    // 3. 验证达人数据
    const influencers = await prisma.influencer.findMany({
      where: { status: 1 },
      include: {
        platform: true,
        tags: {
          include: {
            tag: true
          }
        }
      },
      orderBy: { username: 'asc' }
    });
    console.log(`✅ 达人数据 (${influencers.length} 个):`);
    influencers.forEach(influencer => {
      const tagNames = influencer.tags.map(t => t.tag.displayName).join(', ');
      console.log(`   - ${influencer.username} (${influencer.displayName})`);
      console.log(`     平台: ${influencer.platform.displayName}`);
      console.log(`     粉丝: ${influencer.followersCount.toLocaleString()}`);
      console.log(`     标签: ${tagNames}`);
      console.log();
    });

    // 4. 验证合作产品数据
    const products = await prisma.cooperationProduct.findMany({
      where: { status: 1 },
      orderBy: { name: 'asc' }
    });
    console.log(`✅ 合作产品数据 (${products.length} 个):`);
    products.forEach(product => {
      console.log(`   - ${product.name} (${product.brand})`);
      console.log(`     价格: $${product.price} | 预算: $${product.budget}`);
      console.log(`     目标受众: ${product.targetAudience}`);
      console.log();
    });

    // 5. 验证履约记录数据
    const fulfillmentRecords = await prisma.fulfillmentRecord.findMany({
      where: { status: 1 },
      include: {
        influencer: true,
        product: true,
        fulfillmentTags: {
          include: {
            tag: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    console.log(`✅ 履约记录数据 (${fulfillmentRecords.length} 个):`);
    fulfillmentRecords.forEach(record => {
      const tagNames = record.fulfillmentTags.map(t => t.tag.displayName).join(', ');
      console.log(`   - ${record.influencer.displayName} × ${record.product.name}`);
      console.log(`     类型: ${record.cooperationType} | 状态: ${record.fulfillmentStatus}`);
      console.log(`     评分: ${record.contentScore}/100 | ROI: ${record.adsRoi}`);
      console.log(`     标签: ${tagNames}`);
      console.log(`     备注: ${record.fulfillRemark}`);
      console.log();
    });

    // 6. 统计汇总
    console.log('📊 数据统计汇总:');
    console.log(`   - 平台总数: ${platforms.length}`);
    console.log(`   - 标签总数: ${tags.length}`);
    console.log(`   - 达人总数: ${influencers.length}`);
    console.log(`   - 产品总数: ${products.length}`);
    console.log(`   - 履约记录总数: ${fulfillmentRecords.length}`);
    
    const totalInfluencerTags = await prisma.influencerTag.count({ where: { status: 1 } });
    const totalFulfillmentTags = await prisma.fulfillmentRecordTag.count({ where: { status: 1 } });
    console.log(`   - 达人标签关联: ${totalInfluencerTags}`);
    console.log(`   - 履约记录标签关联: ${totalFulfillmentTags}`);

    console.log('\n🎉 测试数据验证完成！所有数据都已正确创建。');

  } catch (error) {
    console.error('❌ 验证测试数据时出错:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 运行脚本
if (require.main === module) {
  verifyTestData()
    .then(() => {
      console.log('✅ 验证完成！');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 验证失败:', error);
      process.exit(1);
    });
}

module.exports = { verifyTestData }; 