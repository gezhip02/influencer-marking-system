const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// 简单的ID生成函数
function generateId() {
  return BigInt(Date.now() * 1000 + Math.floor(Math.random() * 1000));
}

async function createTestData() {
  try {
    console.log('开始创建测试数据...');

    // 1. 创建平台数据
    console.log('创建平台数据...');
    const platforms = [
      {
        id: generateId(),
        name: 'tiktok',
        displayName: 'TikTok',
        apiEndpoint: 'https://api.tiktok.com',
        status: 1,
        createdAt: Math.floor(Date.now() / 1000),
        updatedAt: Math.floor(Date.now() / 1000)
      },
      {
        id: generateId(),
        name: 'instagram',
        displayName: 'Instagram',
        apiEndpoint: 'https://api.instagram.com',
        status: 1,
        createdAt: Math.floor(Date.now() / 1000),
        updatedAt: Math.floor(Date.now() / 1000)
      },
      {
        id: generateId(),
        name: 'youtube',
        displayName: 'YouTube',
        apiEndpoint: 'https://api.youtube.com',
        status: 1,
        createdAt: Math.floor(Date.now() / 1000),
        updatedAt: Math.floor(Date.now() / 1000)
      }
    ];

    for (const platform of platforms) {
      await prisma.platform.upsert({
        where: { name: platform.name },
        update: platform,
        create: platform
      });
    }

    // 2. 创建标签数据
    console.log('创建标签数据...');
    const tags = [
      {
        id: generateId(),
        name: 'beauty',
        displayName: '美妆',
        description: '美妆护肤相关内容',
        category: 'CONTENT',
        color: '#ff69b4',
        status: 1,
        sortOrder: 1,
        isSystem: false,
        createdAt: Math.floor(Date.now() / 1000),
        updatedAt: Math.floor(Date.now() / 1000)
      },
      {
        id: generateId(),
        name: 'fashion',
        displayName: '时尚',
        description: '时尚穿搭相关内容',
        category: 'CONTENT',
        color: '#9370db',
        status: 1,
        sortOrder: 2,
        isSystem: false,
        createdAt: Math.floor(Date.now() / 1000),
        updatedAt: Math.floor(Date.now() / 1000)
      },
      {
        id: generateId(),
        name: 'lifestyle',
        displayName: '生活方式',
        description: '生活方式相关内容',
        category: 'CONTENT',
        color: '#32cd32',
        status: 1,
        sortOrder: 3,
        isSystem: false,
        createdAt: Math.floor(Date.now() / 1000),
        updatedAt: Math.floor(Date.now() / 1000)
      },
      {
        id: generateId(),
        name: 'tech',
        displayName: '科技',
        description: '科技产品相关内容',
        category: 'CONTENT',
        color: '#1e90ff',
        status: 1,
        sortOrder: 4,
        isSystem: false,
        createdAt: Math.floor(Date.now() / 1000),
        updatedAt: Math.floor(Date.now() / 1000)
      },
      {
        id: generateId(),
        name: 'high_engagement',
        displayName: '高互动',
        description: '互动率较高的达人',
        category: 'PERFORMANCE',
        color: '#ffd700',
        status: 1,
        sortOrder: 5,
        isSystem: false,
        createdAt: Math.floor(Date.now() / 1000),
        updatedAt: Math.floor(Date.now() / 1000)
      }
    ];

    for (const tag of tags) {
      await prisma.tag.upsert({
        where: { name: tag.name },
        update: tag,
        create: tag
      });
    }

    // 获取创建的平台和标签ID
    const createdPlatforms = await prisma.platform.findMany({ where: { status: 1 } });
    const createdTags = await prisma.tag.findMany({ where: { status: 1 } });

    // 3. 创建达人数据
    console.log('创建达人数据...');
    const influencers = [
      {
        id: generateId(),
        platformId: createdPlatforms[0].id, // TikTok
        platformUserId: 'user001',
        username: 'beauty_guru_anna',
        displayName: 'Anna Beauty',
        avatarUrl: 'https://example.com/avatar1.jpg',
        bio: '美妆达人，分享护肤心得',
        email: 'anna@example.com',
        whatsappAccount: '+1234567890',
        country: 'US',
        region: 'California',
        city: 'Los Angeles',
        gender: 'female',
        ageRange: '25-30',
        language: 'en',
        followersCount: 150000,
        followingCount: 500,
        totalLikes: 2500000,
        totalVideos: 120,
        avgVideoViews: 50000,
        engagementRate: 0.08,
        primaryCategory: 'Beauty',
        qualityScore: 85.5,
        riskLevel: 'low',
        dataSource: 'manual',
        cooperateStatus: 1,
        hasSign: 0,
        status: 1,
        createdAt: Math.floor(Date.now() / 1000),
        updatedAt: Math.floor(Date.now() / 1000)
      },
      {
        id: generateId(),
        platformId: createdPlatforms[1].id, // Instagram
        platformUserId: 'user002',
        username: 'fashion_alex',
        displayName: 'Alex Fashion',
        avatarUrl: 'https://example.com/avatar2.jpg',
        bio: '时尚博主，穿搭分享',
        email: 'alex@example.com',
        telegram: '@alex_fashion',
        country: 'UK',
        region: 'England',
        city: 'London',
        gender: 'male',
        ageRange: '20-25',
        language: 'en',
        followersCount: 89000,
        followingCount: 300,
        totalLikes: 1200000,
        totalVideos: 80,
        avgVideoViews: 25000,
        engagementRate: 0.06,
        primaryCategory: 'Fashion',
        qualityScore: 78.2,
        riskLevel: 'low',
        dataSource: 'fastmoss',
        cooperateStatus: 2,
        hasSign: 1,
        status: 1,
        createdAt: Math.floor(Date.now() / 1000),
        updatedAt: Math.floor(Date.now() / 1000)
      },
      {
        id: generateId(),
        platformId: createdPlatforms[2].id, // YouTube
        platformUserId: 'user003',
        username: 'tech_reviewer_mike',
        displayName: 'Mike Tech Reviews',
        avatarUrl: 'https://example.com/avatar3.jpg',
        bio: '科技产品评测，数码爱好者',
        email: 'mike@example.com',
        wechat: 'mike_tech',
        country: 'CA',
        region: 'Ontario',
        city: 'Toronto',
        gender: 'male',
        ageRange: '30-35',
        language: 'en',
        followersCount: 250000,
        followingCount: 800,
        totalLikes: 5000000,
        totalVideos: 200,
        avgVideoViews: 120000,
        engagementRate: 0.12,
        primaryCategory: 'Technology',
        qualityScore: 92.1,
        riskLevel: 'low',
        dataSource: 'tiktok',
        cooperateStatus: 2,
        hasSign: 2,
        status: 1,
        createdAt: Math.floor(Date.now() / 1000),
        updatedAt: Math.floor(Date.now() / 1000)
      },
      {
        id: generateId(),
        platformId: createdPlatforms[0].id, // TikTok
        platformUserId: 'user004',
        username: 'lifestyle_sarah',
        displayName: 'Sarah Lifestyle',
        avatarUrl: 'https://example.com/avatar4.jpg',
        bio: '生活方式博主，分享日常',
        email: 'sarah@example.com',
        phone: '+1987654321',
        country: 'AU',
        region: 'New South Wales',
        city: 'Sydney',
        gender: 'female',
        ageRange: '25-30',
        language: 'en',
        followersCount: 95000,
        followingCount: 400,
        totalLikes: 1800000,
        totalVideos: 150,
        avgVideoViews: 30000,
        engagementRate: 0.07,
        primaryCategory: 'Lifestyle',
        qualityScore: 81.7,
        riskLevel: 'medium',
        dataSource: 'excel',
        cooperateStatus: 1,
        hasSign: 0,
        status: 1,
        createdAt: Math.floor(Date.now() / 1000),
        updatedAt: Math.floor(Date.now() / 1000)
      }
    ];

    const createdInfluencers = [];
    for (const influencer of influencers) {
      const created = await prisma.influencer.create({ data: influencer });
      createdInfluencers.push(created);
    }

    // 4. 为达人添加标签关联
    console.log('创建达人标签关联...');
    const influencerTagRelations = [
      // Anna Beauty - 美妆标签
      {
        id: generateId(),
        influencerId: createdInfluencers[0].id,
        tagId: createdTags.find(t => t.name === 'beauty').id,
        confidence: 0.95,
        source: 'manual',
        status: 1,
        createdAt: Math.floor(Date.now() / 1000)
      },
      {
        id: generateId(),
        influencerId: createdInfluencers[0].id,
        tagId: createdTags.find(t => t.name === 'high_engagement').id,
        confidence: 0.85,
        source: 'system',
        status: 1,
        createdAt: Math.floor(Date.now() / 1000)
      },
      // Alex Fashion - 时尚标签
      {
        id: generateId(),
        influencerId: createdInfluencers[1].id,
        tagId: createdTags.find(t => t.name === 'fashion').id,
        confidence: 0.92,
        source: 'manual',
        status: 1,
        createdAt: Math.floor(Date.now() / 1000)
      },
      // Mike Tech - 科技标签
      {
        id: generateId(),
        influencerId: createdInfluencers[2].id,
        tagId: createdTags.find(t => t.name === 'tech').id,
        confidence: 0.98,
        source: 'manual',
        status: 1,
        createdAt: Math.floor(Date.now() / 1000)
      },
      {
        id: generateId(),
        influencerId: createdInfluencers[2].id,
        tagId: createdTags.find(t => t.name === 'high_engagement').id,
        confidence: 0.90,
        source: 'system',
        status: 1,
        createdAt: Math.floor(Date.now() / 1000)
      },
      // Sarah Lifestyle - 生活方式标签
      {
        id: generateId(),
        influencerId: createdInfluencers[3].id,
        tagId: createdTags.find(t => t.name === 'lifestyle').id,
        confidence: 0.88,
        source: 'manual',
        status: 1,
        createdAt: Math.floor(Date.now() / 1000)
      }
    ];

    for (const relation of influencerTagRelations) {
      await prisma.influencerTag.create({ data: relation });
    }

    // 5. 创建合作产品数据
    console.log('创建合作产品数据...');
    const products = [
      {
        id: generateId(),
        name: 'Beauty Serum Pro',
        description: '高效保湿精华液',
        brand: 'SkinCare Plus',
        category: 'Beauty',
        price: 89.99,
        currency: 'USD',
        budget: 10000,
        targetAudience: '25-35岁女性',
        contentRequirements: '产品试用视频，展示使用效果',
        deliverables: JSON.stringify(['短视频', '图文帖子']),
        kpis: JSON.stringify({ 'views': 100000, 'engagement_rate': 0.05 }),
        startDate: Math.floor(Date.now() / 1000),
        endDate: Math.floor((Date.now() + 30 * 24 * 60 * 60 * 1000) / 1000),
        status: 1,
        priority: 'high',
        createdAt: Math.floor(Date.now() / 1000),
        updatedAt: Math.floor(Date.now() / 1000)
      },
      {
        id: generateId(),
        name: 'Fashion Jacket 2024',
        description: '春季新款时尚外套',
        brand: 'StyleWear',
        category: 'Fashion',
        price: 199.99,
        currency: 'USD',
        budget: 15000,
        targetAudience: '20-30岁时尚人群',
        contentRequirements: '穿搭展示，搭配建议',
        deliverables: JSON.stringify(['穿搭视频', 'OOTD图片']),
        kpis: JSON.stringify({ 'views': 150000, 'engagement_rate': 0.06 }),
        startDate: Math.floor(Date.now() / 1000),
        endDate: Math.floor((Date.now() + 45 * 24 * 60 * 60 * 1000) / 1000),
        status: 1,
        priority: 'medium',
        createdAt: Math.floor(Date.now() / 1000),
        updatedAt: Math.floor(Date.now() / 1000)
      },
      {
        id: generateId(),
        name: 'Smart Watch X1',
        description: '智能手表新品',
        brand: 'TechGear',
        category: 'Technology',
        price: 299.99,
        currency: 'USD',
        budget: 25000,
        targetAudience: '科技爱好者',
        contentRequirements: '产品评测，功能展示',
        deliverables: JSON.stringify(['评测视频', '功能介绍']),
        kpis: JSON.stringify({ 'views': 200000, 'engagement_rate': 0.08 }),
        startDate: Math.floor(Date.now() / 1000),
        endDate: Math.floor((Date.now() + 60 * 24 * 60 * 60 * 1000) / 1000),
        status: 1,
        priority: 'high',
        createdAt: Math.floor(Date.now() / 1000),
        updatedAt: Math.floor(Date.now() / 1000)
      }
    ];

    const createdProducts = [];
    for (const product of products) {
      const created = await prisma.cooperationProduct.create({ data: product });
      createdProducts.push(created);
    }

    // 6. 创建履约记录数据
    console.log('创建履约记录数据...');
    const fulfillmentRecords = [
      {
        id: generateId(),
        influencerId: createdInfluencers[0].id, // Anna Beauty
        productId: createdProducts[0].id, // Beauty Serum Pro
        productName: 'Beauty Serum Pro',
        cooperationType: 'product_trial',
        fulfillmentDesc: '美妆精华试用推广',
        fulfillmentStatus: 'in_progress',
        needSample: 1,
        cooperateStatus: 2,
        hasSign: 1,
        correspondScore: 8.5,
        fulfillDays: 7,
        contactDate: Math.floor(Date.now() / 1000),
        videoStyle: '清新自然',
        videoStyleForUs: '产品特写+使用过程',
        contentScore: 85.0,
        orderScore: 80.0,
        adsRoi: 3.2,
        videoQuantityDesc: '1个主视频+2个补充视频',
        ownerName: 'Marketing Team',
        fulfillRemark: '达人配合度高，内容质量优秀',
        status: 1,
        createdAt: Math.floor(Date.now() / 1000),
        updatedAt: Math.floor(Date.now() / 1000)
      },
      {
        id: generateId(),
        influencerId: createdInfluencers[1].id, // Alex Fashion
        productId: createdProducts[1].id, // Fashion Jacket 2024
        productName: 'Fashion Jacket 2024',
        cooperationType: 'brand_collaboration',
        fulfillmentDesc: '春季外套穿搭推广',
        fulfillmentStatus: 'completed',
        needSample: 1,
        cooperateStatus: 2,
        hasSign: 2,
        actualFulfillTime: Math.floor((Date.now() - 5 * 24 * 60 * 60 * 1000) / 1000),
        correspondScore: 9.0,
        fulfillDays: 5,
        contactDate: Math.floor((Date.now() - 10 * 24 * 60 * 60 * 1000) / 1000),
        videoStyle: '时尚潮流',
        videoStyleForUs: '多角度展示+搭配建议',
        contentScore: 92.0,
        orderScore: 88.0,
        adsRoi: 4.1,
        videoQuantityDesc: '3个穿搭视频',
        liveQuantityDesc: '1场直播',
        ownerName: 'Brand Team',
        fulfillRemark: '效果超出预期，转化率很高',
        status: 1,
        createdAt: Math.floor(Date.now() / 1000),
        updatedAt: Math.floor(Date.now() / 1000)
      },
      {
        id: generateId(),
        influencerId: createdInfluencers[2].id, // Mike Tech
        productId: createdProducts[2].id, // Smart Watch X1
        productName: 'Smart Watch X1',
        cooperationType: 'product_review',
        fulfillmentDesc: '智能手表深度评测',
        fulfillmentStatus: 'pending',
        needSample: 1,
        cooperateStatus: 1,
        hasSign: 1,
        correspondScore: 9.5,
        fulfillDays: 14,
        contactDate: Math.floor(Date.now() / 1000),
        videoStyle: '专业评测',
        videoStyleForUs: '详细功能演示+对比测试',
        contentScore: 95.0,
        orderScore: 90.0,
        adsRoi: 5.8,
        videoQuantityDesc: '1个详细评测视频',
        ownerName: 'Product Team',
        fulfillRemark: '专业度高，适合科技产品推广',
        status: 1,
        createdAt: Math.floor(Date.now() / 1000),
        updatedAt: Math.floor(Date.now() / 1000)
      },
      {
        id: generateId(),
        influencerId: createdInfluencers[3].id, // Sarah Lifestyle
        productId: createdProducts[0].id, // Beauty Serum Pro
        productName: 'Beauty Serum Pro',
        cooperationType: 'lifestyle_integration',
        fulfillmentDesc: '生活方式融入美妆产品',
        fulfillmentStatus: 'draft',
        needSample: 1,
        cooperateStatus: 1,
        hasSign: 0,
        correspondScore: 7.8,
        fulfillDays: 10,
        contactDate: Math.floor(Date.now() / 1000),
        videoStyle: '生活化',
        videoStyleForUs: '日常护肤流程展示',
        contentScore: 78.0,
        orderScore: 75.0,
        adsRoi: 2.9,
        videoQuantityDesc: '2个生活场景视频',
        ownerName: 'Content Team',
        fulfillRemark: '风格契合，等待最终确认',
        status: 1,
        createdAt: Math.floor(Date.now() / 1000),
        updatedAt: Math.floor(Date.now() / 1000)
      }
    ];

    const createdFulfillmentRecords = [];
    for (const record of fulfillmentRecords) {
      const created = await prisma.fulfillmentRecord.create({ data: record });
      createdFulfillmentRecords.push(created);
    }

    // 7. 为履约记录添加标签关联
    console.log('创建履约记录标签关联...');
    const fulfillmentTagRelations = [
      // Beauty Serum Pro (Anna) - 美妆标签
      {
        id: generateId(),
        fulfillmentRecordId: createdFulfillmentRecords[0].id,
        tagId: createdTags.find(t => t.name === 'beauty').id,
        confidence: 0.95,
        source: 'manual',
        status: 1,
        createdAt: Math.floor(Date.now() / 1000)
      },
      // Fashion Jacket (Alex) - 时尚标签
      {
        id: generateId(),
        fulfillmentRecordId: createdFulfillmentRecords[1].id,
        tagId: createdTags.find(t => t.name === 'fashion').id,
        confidence: 0.92,
        source: 'manual',
        status: 1,
        createdAt: Math.floor(Date.now() / 1000)
      },
      {
        id: generateId(),
        fulfillmentRecordId: createdFulfillmentRecords[1].id,
        tagId: createdTags.find(t => t.name === 'high_engagement').id,
        confidence: 0.88,
        source: 'system',
        status: 1,
        createdAt: Math.floor(Date.now() / 1000)
      },
      // Smart Watch (Mike) - 科技标签
      {
        id: generateId(),
        fulfillmentRecordId: createdFulfillmentRecords[2].id,
        tagId: createdTags.find(t => t.name === 'tech').id,
        confidence: 0.98,
        source: 'manual',
        status: 1,
        createdAt: Math.floor(Date.now() / 1000)
      },
      // Beauty Serum Pro (Sarah) - 美妆+生活方式标签
      {
        id: generateId(),
        fulfillmentRecordId: createdFulfillmentRecords[3].id,
        tagId: createdTags.find(t => t.name === 'beauty').id,
        confidence: 0.80,
        source: 'manual',
        status: 1,
        createdAt: Math.floor(Date.now() / 1000)
      },
      {
        id: generateId(),
        fulfillmentRecordId: createdFulfillmentRecords[3].id,
        tagId: createdTags.find(t => t.name === 'lifestyle').id,
        confidence: 0.90,
        source: 'manual',
        status: 1,
        createdAt: Math.floor(Date.now() / 1000)
      }
    ];

    for (const relation of fulfillmentTagRelations) {
      await prisma.fulfillmentRecordTag.create({ data: relation });
    }

    console.log('✅ 测试数据创建完成！');
    console.log(`创建了：
    - ${platforms.length} 个平台
    - ${tags.length} 个标签
    - ${influencers.length} 个达人
    - ${influencerTagRelations.length} 个达人标签关联
    - ${products.length} 个合作产品
    - ${fulfillmentRecords.length} 个履约记录
    - ${fulfillmentTagRelations.length} 个履约记录标签关联`);

  } catch (error) {
    console.error('创建测试数据时出错:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 运行脚本
if (require.main === module) {
  createTestData()
    .then(() => {
      console.log('测试数据创建成功！');
      process.exit(0);
    })
    .catch((error) => {
      console.error('测试数据创建失败:', error);
      process.exit(1);
    });
}

module.exports = { createTestData }; 
