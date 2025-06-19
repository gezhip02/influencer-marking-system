import { PrismaClient } from '@prisma/client';
import snowflake from '../src/lib/snowflake';

const prisma = new PrismaClient();

async function main() {
  console.log('开始执行数据库种子数据初始化...');

  // 清理现有数据（如果需要）
  console.log('清理现有数据...');
  
  try {
    // 1. 创建默认用户
    console.log('创建默认用户...');
    const defaultUser = await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        id: snowflake.nextId(),
        email: 'admin@example.com',
        name: '系统管理员',
        username: 'admin',
        displayName: '系统管理员',
        role: 'ADMIN',
        department: 'IT',
        status: 1,
        language: 'zh-CN',
        createdAt: Math.floor(Date.now() / 1000),
        updatedAt: Math.floor(Date.now() / 1000),
      },
    });
    console.log(`✅ 默认用户创建完成: ${defaultUser.email}`);

    // 2. 创建默认平台
    console.log('创建默认平台...');
    const platforms = [
      { name: 'tiktok', displayName: 'TikTok' },
      { name: 'instagram', displayName: 'Instagram' },
      { name: 'youtube', displayName: 'YouTube' },
      { name: 'facebook', displayName: 'Facebook' },
      { name: 'twitter', displayName: 'Twitter' },
    ];

    for (const platform of platforms) {
      await prisma.platform.upsert({
        where: { name: platform.name },
        update: {},
        create: {
          id: snowflake.nextId(),
          name: platform.name,
          displayName: platform.displayName,
          status: 1,
          createdAt: Math.floor(Date.now() / 1000),
          updatedAt: Math.floor(Date.now() / 1000),
        },
      });
    }
    console.log(`✅ 默认平台创建完成: ${platforms.length} 个平台`);

    // 3. 创建默认标签
    console.log('创建默认标签...');
    const tags = [
      { name: 'fashion', displayName: '时尚', category: 'CONTENT', color: '#FF6B6B' },
      { name: 'beauty', displayName: '美妆', category: 'CONTENT', color: '#4ECDC4' },
      { name: 'lifestyle', displayName: '生活方式', category: 'CONTENT', color: '#45B7D1' },
      { name: 'technology', displayName: '科技', category: 'CONTENT', color: '#96CEB4' },
      { name: 'food', displayName: '美食', category: 'CONTENT', color: '#FFEAA7' },
    ];

    for (const tag of tags) {
      await prisma.tag.upsert({
        where: { name: tag.name },
        update: {},
        create: {
          id: snowflake.nextId(),
          name: tag.name,
          displayName: tag.displayName,
          category: tag.category,
          color: tag.color,
          status: 1,
          createdAt: Math.floor(Date.now() / 1000),
          updatedAt: Math.floor(Date.now() / 1000),
          createdBy: defaultUser.id,
        },
      });
    }
    console.log(`✅ 默认标签创建完成: ${tags.length} 个标签`);

    // 4. 创建履约方案数据（7种固定方案）
    console.log('创建履约方案数据...');
    const fulfillmentPlans = [
      {
        id: 1n,
        planCode: 'SELF_VIDEO_SAMPLE',
        planName: '达人自制短视频寄样品',
        requiresSample: true,
        contentType: 'video',
        isInfluencerMade: true,
        initialStatus: 'pending_sample',
        description: '达人自制短视频内容，需要寄送样品'
      },
      {
        id: 2n,
        planCode: 'SELF_VIDEO_NO_SAMPLE',
        planName: '达人自制短视频不寄样品',
        requiresSample: false,
        contentType: 'video',
        isInfluencerMade: true,
        initialStatus: 'content_creation',
        description: '达人自制短视频内容，不需要寄送样品'
      },
      {
        id: 3n,
        planCode: 'LIVE_SAMPLE',
        planName: '直播寄样品',
        requiresSample: true,
        contentType: 'live',
        isInfluencerMade: true,
        initialStatus: 'pending_sample',
        description: '直播带货形式，需要寄送样品'
      },
      {
        id: 4n,
        planCode: 'LIVE_NO_SAMPLE',
        planName: '直播不寄样品',
        requiresSample: false,
        contentType: 'live',
        isInfluencerMade: true,
        initialStatus: 'content_creation',
        description: '直播带货形式，不需要寄送样品'
      },
      {
        id: 5n,
        planCode: 'COMBO_SAMPLE',
        planName: '达人自制短视频+直播寄样品',
        requiresSample: true,
        contentType: 'video_live',
        isInfluencerMade: true,
        initialStatus: 'pending_sample',
        description: '短视频+直播组合形式，需要寄送样品'
      },
      {
        id: 6n,
        planCode: 'COMBO_NO_SAMPLE',
        planName: '达人自制短视频+直播不寄样品',
        requiresSample: false,
        contentType: 'video_live',
        isInfluencerMade: true,
        initialStatus: 'content_creation',
        description: '短视频+直播组合形式，不需要寄送样品'
      },
      {
        id: 7n,
        planCode: 'MERCHANT_VIDEO',
        planName: '商家提供短视频不寄样品',
        requiresSample: false,
        contentType: 'video',
        isInfluencerMade: false,
        initialStatus: 'content_creation',
        description: '商家提供短视频素材，达人发布，不需要寄送样品'
      }
    ];

    for (const plan of fulfillmentPlans) {
      await prisma.fulfillmentPlan.upsert({
        where: { planCode: plan.planCode },
        update: {},
        create: {
          id: plan.id,
          planCode: plan.planCode,
          planName: plan.planName,
          requiresSample: plan.requiresSample,
          contentType: plan.contentType,
          isInfluencerMade: plan.isInfluencerMade,
          initialStatus: plan.initialStatus,
          description: plan.description,
          status: 1,
          createdAt: Math.floor(Date.now() / 1000),
          updatedAt: Math.floor(Date.now() / 1000),
        },
      });
    }
    console.log(`✅ 履约方案创建完成: ${fulfillmentPlans.length} 个方案`);

    // 5. 创建时效配置数据
    console.log('创建时效配置数据...');
    const slaConfigs = [
      // 寄样流程的时效配置（方案1、3、5）
      { planId: 1n, fromStatus: 'pending_sample', toStatus: 'sample_sent', durationHours: 24, description: '24小时内安排寄样' },
      { planId: 1n, fromStatus: 'sample_sent', toStatus: 'in_transit', durationHours: 24, description: '24小时内更新物流状态' },
      { planId: 1n, fromStatus: 'in_transit', toStatus: 'delivered', durationHours: 120, description: '5天内送达签收' },
      { planId: 1n, fromStatus: 'delivered', toStatus: 'content_creation', durationHours: 24, description: '24小时内发送制作指南' },
      { planId: 1n, fromStatus: 'content_creation', toStatus: 'content_published', durationHours: 168, description: '7天内完成制作发布' },
      { planId: 1n, fromStatus: 'content_published', toStatus: 'sales_conversion', durationHours: 168, description: '7天内完成转化分析' },

      { planId: 3n, fromStatus: 'pending_sample', toStatus: 'sample_sent', durationHours: 24, description: '24小时内安排寄样' },
      { planId: 3n, fromStatus: 'sample_sent', toStatus: 'in_transit', durationHours: 24, description: '24小时内更新物流状态' },
      { planId: 3n, fromStatus: 'in_transit', toStatus: 'delivered', durationHours: 120, description: '5天内送达签收' },
      { planId: 3n, fromStatus: 'delivered', toStatus: 'content_creation', durationHours: 24, description: '24小时内发送制作指南' },
      { planId: 3n, fromStatus: 'content_creation', toStatus: 'content_published', durationHours: 168, description: '7天内完成制作发布' },
      { planId: 3n, fromStatus: 'content_published', toStatus: 'sales_conversion', durationHours: 168, description: '7天内完成转化分析' },

      { planId: 5n, fromStatus: 'pending_sample', toStatus: 'sample_sent', durationHours: 24, description: '24小时内安排寄样' },
      { planId: 5n, fromStatus: 'sample_sent', toStatus: 'in_transit', durationHours: 24, description: '24小时内更新物流状态' },
      { planId: 5n, fromStatus: 'in_transit', toStatus: 'delivered', durationHours: 120, description: '5天内送达签收' },
      { planId: 5n, fromStatus: 'delivered', toStatus: 'content_creation', durationHours: 24, description: '24小时内发送制作指南' },
      { planId: 5n, fromStatus: 'content_creation', toStatus: 'content_published', durationHours: 168, description: '7天内完成制作发布' },
      { planId: 5n, fromStatus: 'content_published', toStatus: 'sales_conversion', durationHours: 168, description: '7天内完成转化分析' },

      // 不寄样流程的时效配置（方案2、4、6、7）
      { planId: 2n, fromStatus: 'content_creation', toStatus: 'content_published', durationHours: 168, description: '7天内完成制作发布' },
      { planId: 2n, fromStatus: 'content_published', toStatus: 'sales_conversion', durationHours: 168, description: '7天内完成转化分析' },

      { planId: 4n, fromStatus: 'content_creation', toStatus: 'content_published', durationHours: 168, description: '7天内完成制作发布' },
      { planId: 4n, fromStatus: 'content_published', toStatus: 'sales_conversion', durationHours: 168, description: '7天内完成转化分析' },

      { planId: 6n, fromStatus: 'content_creation', toStatus: 'content_published', durationHours: 168, description: '7天内完成制作发布' },
      { planId: 6n, fromStatus: 'content_published', toStatus: 'sales_conversion', durationHours: 168, description: '7天内完成转化分析' },

      { planId: 7n, fromStatus: 'content_creation', toStatus: 'content_published', durationHours: 168, description: '7天内完成制作发布' },
      { planId: 7n, fromStatus: 'content_published', toStatus: 'sales_conversion', durationHours: 168, description: '7天内完成转化分析' }
    ];

    for (let i = 0; i < slaConfigs.length; i++) {
      const config = slaConfigs[i];
      await prisma.fulfillmentSLA.upsert({
        where: { 
          planId_fromStatus_toStatus: {
            planId: config.planId,
            fromStatus: config.fromStatus,
            toStatus: config.toStatus
          }
        },
        update: {},
        create: {
          id: snowflake.nextId(),
          planId: config.planId,
          fromStatus: config.fromStatus,
          toStatus: config.toStatus,
          durationHours: config.durationHours,
          description: config.description,
          status: 1,
          createdAt: Math.floor(Date.now() / 1000),
        },
      });
    }
    console.log(`✅ 时效配置创建完成: ${slaConfigs.length} 个配置`);

    // 6. 创建示例产品数据
    console.log('创建示例产品数据...');
    const sampleProducts = [
      {
        name: '春季时尚T恤',
        description: '2025年春季新款时尚T恤，舒适透气',
        brand: 'FashionBrand',
        category: 'clothing',
        price: 29.99,
        currency: 'USD',
        country: 'US',
        skuSeries: 'SKU_2025_CLOTHING_TSHIRT_001'
      },
      {
        name: '智能运动手表',
        description: '多功能智能运动手表，健康监测',
        brand: 'TechBrand',
        category: 'electronics',
        price: 199.99,
        currency: 'USD',
        country: 'US',
        skuSeries: 'SKU_2025_ELECTRONICS_WATCH_001'
      },
      {
        name: '天然护肤面霜',
        description: '纯天然成分护肤面霜，深层滋润',
        brand: 'BeautyBrand',
        category: 'beauty',
        price: 59.99,
        currency: 'USD',
        country: 'UK',
        skuSeries: 'SKU_2025_BEAUTY_CREAM_001'
      }
    ];

    for (const product of sampleProducts) {
      await prisma.cooperationProduct.upsert({
        where: { 
          country_skuSeries: {
            country: product.country,
            skuSeries: product.skuSeries
          }
        },
        update: {},
        create: {
          id: snowflake.nextId(),
          name: product.name,
          description: product.description,
          brand: product.brand,
          category: product.category,
          price: product.price,
          currency: product.currency,
          country: product.country,
          skuSeries: product.skuSeries,
          status: 1,
          priority: 'medium',
          createdAt: Math.floor(Date.now() / 1000),
          updatedAt: Math.floor(Date.now() / 1000),
          createdBy: defaultUser.id,
        },
      });
    }
    console.log(`✅ 示例产品创建完成: ${sampleProducts.length} 个产品`);

    console.log('🎉 数据库种子数据初始化完成!');

  } catch (error) {
    console.error('❌ 种子数据初始化失败:', error);
    throw error;
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  }); 