const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// 雪花ID生成器简化版本
function generateId() {
  return BigInt(Date.now()) * 1000000n + BigInt(Math.floor(Math.random() * 1000000));
}

// 真实的达人数据
const realisticInfluencers = [
  {
    username: 'beauty_queen_lily',
    displayName: '美妆小仙女Lily',
    platformUserId: 'tiktok_001',
    platform: 'tiktok',
    bio: '🌸 美妆博主 | 日韩系护肤专家 | 每日护肤分享 | 合作微信：beauty_lily',
    followersCount: 1350000,
    followingCount: 256,
    totalLikes: 8950000,
    totalVideos: 423,
    avgVideoViews: 125000,
    engagementRate: 8.5,
    primaryCategory: 'beauty',
    contentLanguage: 'zh-CN',
    country: 'CN',
    region: '广东省',
    city: '深圳市',
    gender: 'female',
    ageRange: '22-28',
    qualityScore: 92.5,
    riskLevel: 'low',
    cooperateStatus: 1,
    hasSign: 1,
    adsRoi: 425.8,
    tags: ['beauty', 'skincare', 'korean_style']
  },
  {
    username: 'tech_guru_tony',
    displayName: '科技达人Tony',
    platformUserId: 'tiktok_002',
    platform: 'tiktok',
    bio: '📱 科技数码评测 | iPhone/Android专家 | 每周新品解读 | 商务合作私信',
    followersCount: 980000,
    followingCount: 189,
    totalLikes: 5680000,
    totalVideos: 312,
    avgVideoViews: 89000,
    engagementRate: 7.2,
    primaryCategory: 'technology',
    contentLanguage: 'zh-CN',
    country: 'CN',
    region: '北京市',
    city: '北京市',
    gender: 'male',
    ageRange: '28-35',
    qualityScore: 88.3,
    riskLevel: 'low',
    cooperateStatus: 1,
    hasSign: 1,
    adsRoi: 380.2,
    tags: ['technology', 'digital', 'reviews']
  },
  {
    username: 'fitness_coach_sam',
    displayName: '健身教练小李',
    platformUserId: 'tiktok_003',
    platform: 'tiktok',
    bio: '💪 健身教练 | 减脂增肌指导 | 营养搭配专家 | 免费健身计划咨询',
    followersCount: 650000,
    followingCount: 98,
    totalLikes: 3200000,
    totalVideos: 267,
    avgVideoViews: 52000,
    engagementRate: 9.1,
    primaryCategory: 'fitness',
    contentLanguage: 'zh-CN',
    country: 'CN',
    region: '上海市',
    city: '上海市',
    gender: 'male',
    ageRange: '25-32',
    qualityScore: 89.7,
    riskLevel: 'low',
    cooperateStatus: 1,
    hasSign: 1,
    adsRoi: 298.5,
    tags: ['fitness', 'health', 'nutrition']
  },
  {
    username: 'fashion_anna',
    displayName: '时尚博主Anna',
    platformUserId: 'instagram_001',
    platform: 'instagram',
    bio: '👗 时尚穿搭博主 | 奢侈品评测 | 街拍分享 | 商务合作邮箱：anna@fashion.com',
    followersCount: 1600000,
    followingCount: 567,
    totalLikes: 12000000,
    totalVideos: 1256,
    avgVideoViews: 156000,
    engagementRate: 6.8,
    primaryCategory: 'fashion',
    contentLanguage: 'zh-CN',
    country: 'CN',
    region: '上海市',
    city: '上海市',
    gender: 'female',
    ageRange: '26-32',
    qualityScore: 91.2,
    riskLevel: 'low',
    cooperateStatus: 1,
    hasSign: 1,
    adsRoi: 512.3,
    tags: ['fashion', 'luxury', 'style']
  },
  {
    username: 'food_explorer',
    displayName: '美食探店家',
    platformUserId: 'tiktok_004',
    platform: 'tiktok',
    bio: '🍜 美食博主 | 探店达人 | 中华料理专家 | 每日美食推荐',
    followersCount: 750000,
    followingCount: 234,
    totalLikes: 4500000,
    totalVideos: 456,
    avgVideoViews: 78000,
    engagementRate: 8.8,
    primaryCategory: 'food',
    contentLanguage: 'zh-CN',
    country: 'CN',
    region: '四川省',
    city: '成都市',
    gender: 'female',
    ageRange: '24-30',
    qualityScore: 87.9,
    riskLevel: 'low',
    cooperateStatus: 1,
    hasSign: 1,
    adsRoi: 256.7,
    tags: ['food', 'restaurant', 'cooking']
  },
  {
    username: 'travel_photographer',
    displayName: '旅行摄影师',
    platformUserId: 'youtube_001',
    platform: 'youtube',
    bio: '📸 旅行摄影师 | 全球旅行分享 | 摄影技巧教学 | 旅行攻略制作',
    followersCount: 920000,
    followingCount: 145,
    totalLikes: 6800000,
    totalVideos: 189,
    avgVideoViews: 145000,
    engagementRate: 7.5,
    primaryCategory: 'travel',
    contentLanguage: 'zh-CN',
    country: 'CN',
    region: '云南省',
    city: '昆明市',
    gender: 'male',
    ageRange: '30-38',
    qualityScore: 90.1,
    riskLevel: 'low',
    cooperateStatus: 1,
    hasSign: 1,
    adsRoi: 189.4,
    tags: ['travel', 'photography', 'adventure']
  }
];

// 真实的产品数据
const realisticProducts = [
  {
    name: '兰蔻小黑瓶精华套装',
    brand: '兰蔻',
    category: 'beauty',
    price: 899.0,
    description: '兰蔻经典小黑瓶精华，7天见证肌肤年轻力',
    targetAudience: '25-45岁女性，关注抗衰老护肤',
    sellingPoints: ['7天见效', '抗衰老', '法国进口', '明星推荐'],
    country: 'CN',
    skuSeries: 'SKU_2025_BEAUTY_001',
    currency: 'CNY'
  },
  {
    name: 'iPhone 15 Pro Max',
    brand: 'Apple',
    category: 'technology',
    price: 8999.0,
    description: '苹果最新旗舰手机，搭载A17 Pro芯片，钛金属机身',
    targetAudience: '科技爱好者，高端用户',
    sellingPoints: ['A17 Pro芯片', '钛金属', '专业摄影', '5G网络'],
    country: 'CN',
    skuSeries: 'SKU_2025_TECH_001',
    currency: 'CNY'
  },
  {
    name: '乳清蛋白粉优质套装',
    brand: 'MuscleTech',
    category: 'fitness',
    price: 299.0,
    description: '美国进口乳清蛋白粉，增肌必备，巧克力味',
    targetAudience: '健身爱好者，增肌人群',
    sellingPoints: ['美国进口', '增肌效果', '好吸收', '巧克力味'],
    country: 'CN',
    skuSeries: 'SKU_2025_FITNESS_001',
    currency: 'CNY'
  },
  {
    name: 'Gucci经典手提包',
    brand: 'Gucci',
    category: 'fashion',
    price: 15999.0,
    description: 'Gucci经典款手提包，意大利手工制作，时尚百搭',
    targetAudience: '时尚女性，奢侈品爱好者',
    sellingPoints: ['意大利制造', '经典设计', '手工缝制', '品牌保证'],
    country: 'CN',
    skuSeries: 'SKU_2025_FASHION_001',
    currency: 'CNY'
  },
  {
    name: '正宗西湖龙井茶叶礼盒',
    brand: '西湖龙井',
    category: 'food',
    price: 599.0,
    description: '明前西湖龙井，清香甘甜，送礼自用皆宜',
    targetAudience: '茶叶爱好者，送礼人群',
    sellingPoints: ['明前采摘', '正宗产地', '清香甘甜', '精美包装'],
    country: 'CN',
    skuSeries: 'SKU_2025_FOOD_001',
    currency: 'CNY'
  },
  {
    name: 'DJI Air 3 无人机',
    brand: 'DJI',
    category: 'technology',
    price: 4999.0,
    description: 'DJI最新无人机，4K双摄像头，专业航拍利器',
    targetAudience: '摄影爱好者，内容创作者',
    sellingPoints: ['4K双摄', '智能避障', '长续航', '专业航拍'],
    country: 'CN',
    skuSeries: 'SKU_2025_TECH_002',
    currency: 'CNY'
  }
];

async function createRealisticTestData() {
  console.log('🚀 开始创建真实测试数据...\n');

  try {
    // 0. 清理现有测试数据
    console.log('0. 清理现有测试数据...');
    await prisma.fulfillmentRecordTag.deleteMany({});
    await prisma.fulfillmentRecord.deleteMany({});
    await prisma.influencerTag.deleteMany({});
    await prisma.cooperationProduct.deleteMany({});
    await prisma.influencer.deleteMany({});
    console.log('✅ 清理完成\n');
    // 1. 获取平台数据
    console.log('1. 获取平台数据...');
    const platforms = await prisma.platform.findMany({
      where: { status: 1 }
    });
    const platformMap = Object.fromEntries(platforms.map(p => [p.name, p.id]));
    console.log(`✅ 找到 ${platforms.length} 个平台\n`);

    // 2. 获取标签数据
    console.log('2. 获取标签数据...');
    const tags = await prisma.tag.findMany({
      where: { status: 1 }
    });
    const tagMap = Object.fromEntries(tags.map(t => [t.name, t.id]));
    console.log(`✅ 找到 ${tags.length} 个标签\n`);

    // 3. 获取用户数据
    const defaultUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });
    if (!defaultUser) {
      throw new Error('未找到管理员用户，请先运行 prisma db seed');
    }

    // 4. 创建真实达人数据
    console.log('3. 创建真实达人数据...');
    const createdInfluencers = [];
    
    for (const influencerData of realisticInfluencers) {
      const platformId = platformMap[influencerData.platform];
      if (!platformId) {
        console.log(`⚠️ 平台 ${influencerData.platform} 不存在，跳过达人 ${influencerData.displayName}`);
        continue;
      }

      const influencer = await prisma.influencer.create({
        data: {
          id: generateId(),
          platformId: platformId,
          platformUserId: influencerData.platformUserId,
          username: influencerData.username,
          displayName: influencerData.displayName,
          bio: influencerData.bio,
          followersCount: influencerData.followersCount,
          followingCount: influencerData.followingCount,
          totalLikes: influencerData.totalLikes,
          totalVideos: influencerData.totalVideos,
          avgVideoViews: influencerData.avgVideoViews,
          engagementRate: influencerData.engagementRate,
          primaryCategory: influencerData.primaryCategory,
          contentLanguage: influencerData.contentLanguage,
          country: influencerData.country,
          region: influencerData.region,
          city: influencerData.city,
          gender: influencerData.gender,
          ageRange: influencerData.ageRange,
          qualityScore: influencerData.qualityScore,
          riskLevel: influencerData.riskLevel,
          cooperateStatus: influencerData.cooperateStatus,
          hasSign: influencerData.hasSign,
          adsRoi: influencerData.adsRoi,
          status: 1,
          createdAt: Math.floor(Date.now() / 1000),
          updatedAt: Math.floor(Date.now() / 1000),
          createdBy: defaultUser.id
        }
      });

      // 为达人添加标签
      for (const tagName of influencerData.tags) {
        const tagId = tagMap[tagName];
        if (tagId) {
          await prisma.influencerTag.create({
            data: {
              id: generateId(),
              influencerId: influencer.id,
              tagId: tagId,
              status: 1,
              createdAt: Math.floor(Date.now() / 1000),
              createdBy: defaultUser.id
            }
          });
        }
      }

      createdInfluencers.push(influencer);
      console.log(`✅ 创建达人: ${influencer.displayName} (${influencer.followersCount.toLocaleString()} 粉丝)`);
    }
    console.log(`✅ 总共创建了 ${createdInfluencers.length} 个达人\n`);

    // 5. 创建真实产品数据
    console.log('4. 创建真实产品数据...');
    const createdProducts = [];
    
    for (const productData of realisticProducts) {
      const product = await prisma.cooperationProduct.create({
        data: {
          id: generateId(),
          name: productData.name,
          brand: productData.brand,
          category: productData.category,
          price: productData.price,
          currency: productData.currency,
          description: productData.description,
          targetAudience: productData.targetAudience,
          contentRequirements: JSON.stringify(productData.sellingPoints),
          country: productData.country,
          skuSeries: productData.skuSeries,
          status: 1,
          createdAt: Math.floor(Date.now() / 1000),
          updatedAt: Math.floor(Date.now() / 1000),
          createdBy: defaultUser.id
        }
      });

      createdProducts.push(product);
      console.log(`✅ 创建产品: ${product.name} (¥${(product.price / 100).toFixed(2)})`);
    }
    console.log(`✅ 总共创建了 ${createdProducts.length} 个产品\n`);

    // 6. 创建履约单数据
    console.log('5. 创建履约单数据...');
    const fulfillmentPlans = await prisma.fulfillmentPlan.findMany({
      where: { status: 1 }
    });

    const statuses = [
      'pending_sample', 'sample_sent', 'in_transit', 'delivered', 
      'content_creation', 'content_published', 'sales_conversion'
    ];

    const priorities = ['low', 'medium', 'high'];
    
    let createdRecordsCount = 0;

    for (let i = 0; i < Math.min(createdInfluencers.length, createdProducts.length); i++) {
      const influencer = createdInfluencers[i];
      const product = createdProducts[i];
      const plan = fulfillmentPlans[Math.floor(Math.random() * fulfillmentPlans.length)];
      
      // 创建基础履约单
      const currentTime = Math.floor(Date.now() / 1000);
      const stageStartTime = currentTime - Math.floor(Math.random() * 86400 * 7); // 7天内的随机时间
      const currentStatus = statuses[Math.floor(Math.random() * statuses.length)];
      const priority = priorities[Math.floor(Math.random() * priorities.length)];
      
      const record = await prisma.fulfillmentRecord.create({
        data: {
          id: generateId(),
          influencerId: influencer.id,
          productId: product.id,
          planId: plan.id,
          ownerId: defaultUser.id,
          title: `${influencer.displayName} × ${product.name}`,
          description: `${influencer.displayName} 推广 ${product.name} 的履约合作`,
          priority: priority,
          currentStatus: currentStatus,
          recordStatus: 'active',
          currentStageStartTime: stageStartTime,
          currentStageDeadline: stageStartTime + 86400 * 3, // 3天后截止
          isCurrentStageOverdue: Math.random() > 0.8, // 20% 概率逾期
          status: 1,
          createdAt: currentTime,
          updatedAt: currentTime,
          createdBy: defaultUser.id
        }
      });

      // 为履约单添加标签
      const productTags = await prisma.tag.findMany({
        where: {
          name: { in: [product.category] },
          status: 1
        }
      });

      for (const tag of productTags) {
        await prisma.fulfillmentRecordTag.create({
          data: {
            id: generateId(),
            fulfillmentRecordId: record.id,
            tagId: tag.id,
            status: 1,
            createdAt: currentTime,
            createdBy: defaultUser.id
          }
        });
      }

      createdRecordsCount++;
      console.log(`✅ 创建履约单: ${record.title} (${record.currentStatus})`);
    }

    // 再创建一些随机组合的履约单
    for (let i = 0; i < 10; i++) {
      const randomInfluencer = createdInfluencers[Math.floor(Math.random() * createdInfluencers.length)];
      const randomProduct = createdProducts[Math.floor(Math.random() * createdProducts.length)];
      const randomPlan = fulfillmentPlans[Math.floor(Math.random() * fulfillmentPlans.length)];
      
      const currentTime = Math.floor(Date.now() / 1000);
      const stageStartTime = currentTime - Math.floor(Math.random() * 86400 * 14); // 14天内的随机时间
      const currentStatus = statuses[Math.floor(Math.random() * statuses.length)];
      const priority = priorities[Math.floor(Math.random() * priorities.length)];
      
      const record = await prisma.fulfillmentRecord.create({
        data: {
          id: generateId(),
          influencerId: randomInfluencer.id,
          productId: randomProduct.id,
          planId: randomPlan.id,
          ownerId: defaultUser.id,
          title: `${randomInfluencer.displayName} × ${randomProduct.name}`,
          description: `${randomInfluencer.displayName} 推广 ${randomProduct.name} 的履约合作`,
          priority: priority,
          currentStatus: currentStatus,
          recordStatus: 'active',
          currentStageStartTime: stageStartTime,
          currentStageDeadline: stageStartTime + 86400 * 3,
          isCurrentStageOverdue: Math.random() > 0.8,
          status: 1,
          createdAt: currentTime,
          updatedAt: currentTime,
          createdBy: defaultUser.id
        }
      });

      createdRecordsCount++;
    }

    console.log(`✅ 总共创建了 ${createdRecordsCount} 个履约单\n`);

    console.log('🎉 真实测试数据创建完成！');
    console.log('\n📊 数据汇总:');
    console.log(`- 达人数量: ${createdInfluencers.length}`);
    console.log(`- 产品数量: ${createdProducts.length}`);
    console.log(`- 履约单数量: ${createdRecordsCount}`);
    console.log(`- 平台数量: ${platforms.length}`);
    console.log(`- 标签数量: ${tags.length}`);

  } catch (error) {
    console.error('❌ 创建测试数据时出错:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 运行脚本
createRealisticTestData()
  .catch((error) => {
    console.error('脚本执行失败:', error);
    process.exit(1);
  }); 