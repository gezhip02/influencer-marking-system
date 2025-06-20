const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedDatabase() {
  console.log('🌱 开始向Supabase数据库插入种子数据...');

  try {
    // 1. 创建用户
    const user = await prisma.users.create({
      data: {
        id: BigInt('1001'),
        name: 'Test User',
        email: 'test@example.com',
        role: 'ADMIN',
        language: 'zh-CN',
        loginCount: 0,
        status: 1,
        createdAt: Math.floor(Date.now() / 1000),
        updatedAt: Math.floor(Date.now() / 1000)
      }
    });
    console.log('✅ 用户创建成功:', user.email);

    // 2. 创建平台
    const platform = await prisma.platforms.create({
      data: {
        id: BigInt('2001'),
        name: 'tiktok',
        displayName: 'TikTok',
        status: 1,
        createdAt: Math.floor(Date.now() / 1000),
        updatedAt: Math.floor(Date.now() / 1000)
      }
    });
    console.log('✅ 平台创建成功:', platform.displayName);

    // 3. 创建达人
    const influencer = await prisma.influencers.create({
      data: {
        id: BigInt('3001'),
        platformId: platform.id,
        platformUserId: 'test_influencer_001',
        username: 'test_influencer',
        displayName: 'Test Influencer',
        followersCount: 100000,
        followingCount: 500,
        totalLikes: 1000000,
        totalVideos: 200,
        avgVideoViews: 50000,
        engagementRate: 5.5,
        primaryCategory: 'lifestyle',
        contentLanguage: 'en',
        qualityScore: 85.0,
        riskLevel: 'low',
        dataSource: 'api',
        cooperateStatus: 1,
        hasSign: 1,
        status: 1,
        createdAt: Math.floor(Date.now() / 1000),
        updatedAt: Math.floor(Date.now() / 1000),
        createdBy: user.id
      }
    });
    console.log('✅ 达人创建成功:', influencer.username);

    // 4. 创建产品
    const product = await prisma.cooperation_products.create({
      data: {
        id: BigInt('4001'),
        name: 'Test Product',
        description: 'A test product for influencer marketing',
        brand: 'Test Brand',
        category: 'Electronics',
        price: 99.99,
        currency: 'USD',
        budget: 10000.0,
        targetAudience: 'Young adults',
        contentRequirements: 'Video review with unboxing',
        priority: 'high',
        country: 'US',
        skuSeries: 'TP001',
        status: 1,
        createdAt: Math.floor(Date.now() / 1000),
        updatedAt: Math.floor(Date.now() / 1000),
        createdBy: user.id
      }
    });
    console.log('✅ 产品创建成功:', product.name);

    // 5. 创建履约方案
    const fulfillmentPlan = await prisma.fulfillment_plans.create({
      data: {
        id: BigInt('5001'),
        planCode: 'PLAN_001',
        planName: '有寄样视频方案',
        requiresSample: true,
        contentType: 'video',
        isInfluencerMade: true,
        initialStatus: 'pending_sample',
        description: '需要寄样的视频制作方案',
        status: 1,
        createdAt: Math.floor(Date.now() / 1000),
        updatedAt: Math.floor(Date.now() / 1000)
      }
    });
    console.log('✅ 履约方案创建成功:', fulfillmentPlan.planName);

    // 6. 创建SLA配置
    const slaConfigs = [
      { fromStatus: 'pending_sample', toStatus: 'sample_sent', hours: 24 },
      { fromStatus: 'sample_sent', toStatus: 'sample_received', hours: 24 },
      { fromStatus: 'sample_received', toStatus: 'content_creation', hours: 120 },
      { fromStatus: 'content_creation', toStatus: 'content_published', hours: 24 },
      { fromStatus: 'content_published', toStatus: 'tracking_started', hours: 168 },
      { fromStatus: 'tracking_started', toStatus: 'settlement_completed', hours: 168 }
    ];

    for (const sla of slaConfigs) {
      await prisma.fulfillment_slas.create({
        data: {
          id: BigInt(Date.now() * 1000 + Math.floor(Math.random() * 1000)),
          planId: fulfillmentPlan.id,
          fromStatus: sla.fromStatus,
          toStatus: sla.toStatus,
          deadlineHours: sla.hours,
          alertBeforeHours: Math.min(sla.hours / 2, 24),
          description: `从${sla.fromStatus}到${sla.toStatus}的时效要求`,
          status: 1,
          createdAt: Math.floor(Date.now() / 1000),
          updatedAt: Math.floor(Date.now() / 1000)
        }
      });
    }
    console.log('✅ SLA配置创建成功: 6条记录');

    // 7. 创建履约记录
    const fulfillmentRecord = await prisma.fulfillment_records.create({
      data: {
        id: BigInt('6001'),
        influencerId: influencer.id,
        productId: product.id,
        planId: fulfillmentPlan.id,
        currentStatus: 'pending_sample',
        priority: 'high',
        budget: 1000.0,
        actualCost: 0.0,
        expectedDeliveryDate: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7天后
        contentRequirements: '制作开箱视频，时长不少于60秒',
        deliverables: '{"video_duration": "60s", "platforms": ["tiktok"], "format": "mp4"}',
        trackingData: '{}',
        roi: 0.0,
        conversionRate: 0.0,
        revenue: 0.0,
        clicks: 0,
        impressions: 0,
        engagement: 0,
        status: 1,
        createdAt: Math.floor(Date.now() / 1000),
        updatedAt: Math.floor(Date.now() / 1000),
        createdBy: user.id
      }
    });
    console.log('✅ 履约记录创建成功:', fulfillmentRecord.id.toString());

    // 8. 创建状态日志
    await prisma.fulfillment_status_logs.create({
      data: {
        id: BigInt(Date.now() * 1000 + Math.floor(Math.random() * 1000)),
        recordId: fulfillmentRecord.id,
        fromStatus: null,
        toStatus: 'pending_sample',
        operatorId: user.id,
        reason: '履约记录初始创建',
        notes: '系统自动创建的初始状态',
        attachments: '{}',
        status: 1,
        createdAt: Math.floor(Date.now() / 1000)
      }
    });
    console.log('✅ 状态日志创建成功');

    console.log('\n🎉 Supabase数据库种子数据插入完成！');
    console.log('📊 数据统计:');
    console.log('   - 用户: 1条');
    console.log('   - 平台: 1条');
    console.log('   - 达人: 1条');
    console.log('   - 产品: 1条');
    console.log('   - 履约方案: 1条');
    console.log('   - SLA配置: 6条');
    console.log('   - 履约记录: 1条');
    console.log('   - 状态日志: 1条');

  } catch (error) {
    console.error('❌ 插入数据时出错:', error);
    if (error.code === 'P2002') {
      console.log('💡 数据已存在，跳过重复插入');
    }
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase().catch(console.error); 