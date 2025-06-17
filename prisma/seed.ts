import { PrismaClient } from '@prisma/client';
import { generateId } from '../src/lib/snowflake';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 开始播种数据...');

  // 清空现有数据（按依赖关系顺序）
  await prisma.influencerTag.deleteMany();
  await prisma.communicationLog.deleteMany();
  await prisma.cooperationRecord.deleteMany();
  await prisma.cooperationProject.deleteMany();
  await prisma.influencerMetricsHistory.deleteMany();
  await prisma.influencer.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.platform.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.systemConfig.deleteMany();
  await prisma.importRecord.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.user.deleteMany();

  // 1. 创建用户
  console.log('📝 创建用户...');
  const adminUser = await prisma.user.create({
    data: {
      id: generateId(),
      email: 'admin@example.com',
      name: '系统管理员',
      role: 'ADMIN',
      status: 'ACTIVE'
    }
  });

  const userUser = await prisma.user.create({
    data: {
      id: generateId(),
      email: 'user@example.com', 
      name: '普通用户',
      role: 'USER',
      status: 'ACTIVE'
    }
  });

  // 2. 创建平台
  console.log('🚀 创建平台...');
  const platforms = [
    {
      id: generateId(),
      name: 'tiktok',
      displayName: 'TikTok',
      apiEndpoint: 'https://api.tiktok.com',
      status: 'ACTIVE' as const
    },
    {
      id: generateId(),
      name: 'douyin',
      displayName: '抖音',
      apiEndpoint: 'https://api.douyin.com',
      status: 'ACTIVE' as const
    },
    {
      id: generateId(),
      name: 'kuaishou',
      displayName: '快手',
      apiEndpoint: 'https://api.kuaishou.com',
      status: 'ACTIVE' as const
    },
    {
      id: generateId(),
      name: 'xiaohongshu',
      displayName: '小红书',
      apiEndpoint: 'https://api.xiaohongshu.com',
      status: 'ACTIVE' as const
    }
  ];

  const createdPlatforms = [];
  for (const platform of platforms) {
    const created = await prisma.platform.create({ data: platform });
    createdPlatforms.push(created);
  }

  // 3. 创建标签
  console.log('🏷️ 创建标签...');
  const tags = [
    // 内容类型标签
    {
      id: generateId(),
      name: 'beauty',
      displayName: '美妆',
      description: '美妆护肤相关内容',
      category: 'CONTENT' as const,
      color: '#FF69B4',
      status: 'ACTIVE' as const,
      sortOrder: 1,
      createdBy: adminUser.id
    },
    {
      id: generateId(),
      name: 'fashion',
      displayName: '时尚',
      description: '时尚穿搭相关内容',
      category: 'CONTENT' as const,
      color: '#9932CC',
      status: 'ACTIVE' as const,
      sortOrder: 2,
      createdBy: adminUser.id
    },
    {
      id: generateId(),
      name: 'food',
      displayName: '美食',
      description: '美食制作和探店内容',
      category: 'CONTENT' as const,
      color: '#FF6347',
      status: 'ACTIVE' as const,
      sortOrder: 3,
      createdBy: adminUser.id
    },
    {
      id: generateId(),
      name: 'travel',
      displayName: '旅行',
      description: '旅行和景点推荐',
      category: 'CONTENT' as const,
      color: '#4169E1',
      status: 'ACTIVE' as const,
      sortOrder: 4,
      createdBy: adminUser.id
    },
    {
      id: generateId(),
      name: 'tech',
      displayName: '科技',
      description: '科技产品和数码评测',
      category: 'CONTENT' as const,
      color: '#32CD32',
      status: 'ACTIVE' as const,
      sortOrder: 5,
      createdBy: adminUser.id
    },
    // 受众标签
    {
      id: generateId(),
      name: 'gen-z',
      displayName: 'Z世代',
      description: '主要受众为Z世代用户',
      category: 'AUDIENCE' as const,
      color: '#FF4500',
      status: 'ACTIVE' as const,
      sortOrder: 10,
      createdBy: adminUser.id
    },
    {
      id: generateId(),
      name: 'millennials',
      displayName: '千禧一代',
      description: '主要受众为千禧一代',
      category: 'AUDIENCE' as const,
      color: '#1E90FF',
      status: 'ACTIVE' as const,
      sortOrder: 11,
      createdBy: adminUser.id
    },
    // 表现标签
    {
      id: generateId(),
      name: 'high-engagement',
      displayName: '高互动',
      description: '互动率较高的达人',
      category: 'PERFORMANCE' as const,
      color: '#32CD32',
      status: 'ACTIVE' as const,
      sortOrder: 20,
      createdBy: adminUser.id
    },
    {
      id: generateId(),
      name: 'viral-content',
      displayName: '爆款内容',
      description: '经常产出爆款内容',
      category: 'PERFORMANCE' as const,
      color: '#FFD700',
      status: 'ACTIVE' as const,
      sortOrder: 21,
      createdBy: adminUser.id
    }
  ];

  const createdTags = [];
  for (const tag of tags) {
    const created = await prisma.tag.create({ data: tag });
    createdTags.push(created);
  }

  // 4. 创建达人
  console.log('👤 创建达人...');
  const influencers = [
    {
      id: generateId(),
      platformId: createdPlatforms[0].id, // TikTok
      platformUserId: 'tiktok_user_001',
      username: 'beauty_queen_amy',
      displayName: '美妆女王Amy',
      avatarUrl: 'https://example.com/avatar1.jpg',
      bio: '分享最新美妆技巧和产品测评',
      email: 'amy@example.com',
      phone: '+86 138 0001 0001',
      whatsappAccount: '+86 138 0001 0001',
      wechat: 'amy_beauty',
      dataSource: 'whatsapp',
      country: 'CN',
      region: '上海',
      city: '上海',
      gender: '女',
      ageRange: '25-30',
      language: 'zh-CN',
      followersCount: 1250000,
      followingCount: 500,
      totalLikes: BigInt(15000000),
      totalVideos: 320,
      avgVideoViews: 45000,
      engagementRate: 0.128,
      primaryCategory: '美妆',
      cooperationOpenness: 'high',
      baseCooperationFee: 15000.00,
      cooperationCurrency: 'CNY',
      qualityScore: 8.5,
      riskLevel: 'low',
      status: 'ACTIVE' as const,
      notes: '头部美妆博主，合作效果很好',
      createdBy: adminUser.id
    },
    {
      id: generateId(),
      platformId: createdPlatforms[1].id, // 抖音
      platformUserId: 'douyin_user_002',
      username: 'fashion_star_lisa',
      displayName: '时尚达人Lisa',
      avatarUrl: 'https://example.com/avatar2.jpg',
      bio: '时尚穿搭博主，分享搭配技巧',
      email: 'lisa@example.com',
      phone: '+86 138 0002 0002',
      wechat: 'lisa_fashion',
      dataSource: 'official',
      country: 'CN',
      region: '北京',
      city: '北京',
      gender: '女',
      ageRange: '22-28',
      language: 'zh-CN',
      followersCount: 890000,
      followingCount: 300,
      totalLikes: BigInt(12000000),
      totalVideos: 280,
      avgVideoViews: 38000,
      engagementRate: 0.144,
      primaryCategory: '时尚',
      cooperationOpenness: 'high',
      baseCooperationFee: 12000.00,
      cooperationCurrency: 'CNY',
      qualityScore: 8.2,
      riskLevel: 'low',
      status: 'ACTIVE' as const,
      notes: '时尚领域KOL，粉丝质量高',
      createdBy: adminUser.id
    },
    {
      id: generateId(),
      platformId: createdPlatforms[2].id, // 快手
      platformUserId: 'kuaishou_user_003',
      username: 'food_lover_mike',
      displayName: '美食爱好者Mike',
      avatarUrl: 'https://example.com/avatar3.jpg',
      bio: '美食探店达人，推荐地道美味',
      email: 'mike@example.com',
      phone: '+86 138 0003 0003',
      whatsappAccount: '+86 138 0003 0003',
      dataSource: 'referral',
      country: 'CN',
      region: '广州',
      city: '广州',
      gender: '男',
      ageRange: '28-35',
      language: 'zh-CN',
      followersCount: 560000,
      followingCount: 800,
      totalLikes: BigInt(8500000),
      totalVideos: 450,
      avgVideoViews: 25000,
      engagementRate: 0.165,
      primaryCategory: '美食',
      cooperationOpenness: 'medium',
      baseCooperationFee: 8000.00,
      cooperationCurrency: 'CNY',
      qualityScore: 7.8,
      riskLevel: 'low',
      status: 'ACTIVE' as const,
      notes: '美食垂直领域，互动率不错',
      createdBy: userUser.id
    },
    {
      id: generateId(),
      platformId: createdPlatforms[3].id, // 小红书
      platformUserId: 'xhs_user_004',
      username: 'travel_girl_sophia',
      displayName: '旅行女孩Sophia',
      avatarUrl: 'https://example.com/avatar4.jpg',
      bio: '分享世界各地旅行攻略和美景',
      email: 'sophia@example.com',
      phone: '+86 138 0004 0004',
      wechat: 'sophia_travel',
      dataSource: 'offline',
      country: 'CN',
      region: '深圳',
      city: '深圳',
      gender: '女',
      ageRange: '26-32',
      language: 'zh-CN',
      followersCount: 750000,
      followingCount: 400,
      totalLikes: BigInt(9800000),
      totalVideos: 180,
      avgVideoViews: 32000,
      engagementRate: 0.141,
      primaryCategory: '旅行',
      cooperationOpenness: 'medium',
      baseCooperationFee: 10000.00,
      cooperationCurrency: 'CNY',
      qualityScore: 8.0,
      riskLevel: 'low',
      status: 'ACTIVE' as const,
      notes: '旅行达人，内容质量高',
      createdBy: userUser.id
    }
  ];

  const createdInfluencers = [];
  for (const influencer of influencers) {
    const created = await prisma.influencer.create({ data: influencer });
    createdInfluencers.push(created);
  }

  // 5. 创建达人标签关联
  console.log('🔗 创建达人标签关联...');
  const influencerTags = [
    // Amy - 美妆博主
    {
      id: generateId(),
      influencerId: createdInfluencers[0].id,
      tagId: createdTags.find(t => t.name === 'beauty')!.id,
      confidence: 1.0,
      source: 'manual',
      createdBy: adminUser.id
    },
    {
      id: generateId(),
      influencerId: createdInfluencers[0].id,
      tagId: createdTags.find(t => t.name === 'gen-z')!.id,
      confidence: 0.9,
      source: 'manual',
      createdBy: adminUser.id
    },
    {
      id: generateId(),
      influencerId: createdInfluencers[0].id,
      tagId: createdTags.find(t => t.name === 'high-engagement')!.id,
      confidence: 0.95,
      source: 'manual',
      createdBy: adminUser.id
    },
    // Lisa - 时尚博主
    {
      id: generateId(),
      influencerId: createdInfluencers[1].id,
      tagId: createdTags.find(t => t.name === 'fashion')!.id,
      confidence: 1.0,
      source: 'manual',
      createdBy: adminUser.id
    },
    {
      id: generateId(),
      influencerId: createdInfluencers[1].id,
      tagId: createdTags.find(t => t.name === 'millennials')!.id,
      confidence: 0.85,
      source: 'manual',
      createdBy: adminUser.id
    },
    // Mike - 美食博主
    {
      id: generateId(),
      influencerId: createdInfluencers[2].id,
      tagId: createdTags.find(t => t.name === 'food')!.id,
      confidence: 1.0,
      source: 'manual',
      createdBy: userUser.id
    },
    // Sophia - 旅行博主
    {
      id: generateId(),
      influencerId: createdInfluencers[3].id,
      tagId: createdTags.find(t => t.name === 'travel')!.id,
      confidence: 1.0,
      source: 'manual',
      createdBy: userUser.id
    },
    {
      id: generateId(),
      influencerId: createdInfluencers[3].id,
      tagId: createdTags.find(t => t.name === 'viral-content')!.id,
      confidence: 0.8,
      source: 'manual',
      createdBy: userUser.id
    }
  ];

  for (const it of influencerTags) {
    await prisma.influencerTag.create({ data: it });
  }

  // 6. 创建系统配置
  console.log('⚙️ 创建系统配置...');
  const systemConfigs = [
    {
      id: generateId(),
      key: 'system.version',
      value: '1.0.0',
      type: 'string',
      description: '系统版本号',
      isPublic: true
    },
    {
      id: generateId(),
      key: 'pagination.default_limit',
      value: '20',
      type: 'number',
      description: '默认分页大小',
      isPublic: true
    },
    {
      id: generateId(),
      key: 'snowflake.machine_id',
      value: '1',
      type: 'number',
      description: '雪花算法机器ID',
      isPublic: false
    }
  ];

  for (const config of systemConfigs) {
    await prisma.systemConfig.create({ data: config });
  }

  console.log('✅ 种子数据创建完成！');
  console.log(`👥 创建用户: ${2}个`);
  console.log(`🚀 创建平台: ${createdPlatforms.length}个`);
  console.log(`🏷️ 创建标签: ${createdTags.length}个`);
  console.log(`👤 创建达人: ${createdInfluencers.length}个`);
  console.log(`🔗 创建标签关联: ${influencerTags.length}个`);
  console.log(`⚙️ 创建系统配置: ${systemConfigs.length}个`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ 种子数据创建失败:', e);
    await prisma.$disconnect();
    process.exit(1);
  }); 