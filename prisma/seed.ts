import { PrismaClient } from '@prisma/client';
import snowflake from '../src/lib/snowflake';

const prisma = new PrismaClient();

async function main() {
  console.log('📝 开始创建种子数据...');

  // 清理现有数据（软删除模式）
  await prisma.influencerTag.updateMany({ data: { status: 0 } });
  await prisma.fulfillmentRecordTag.updateMany({ data: { status: 0 } });
  await prisma.fulfillmentRecord.updateMany({ data: { status: 0 } });
  await prisma.cooperationProduct.updateMany({ data: { status: 0 } });
  await prisma.communicationLog.updateMany({ data: { status: 0 } });
  await prisma.influencer.updateMany({ data: { status: 0 } });
  await prisma.tag.updateMany({ data: { status: 0 } });
  await prisma.platform.updateMany({ data: { status: 0 } });
  await prisma.user.updateMany({ data: { status: 0 } });

  const now = Math.floor(Date.now() / 1000);

  // 1. 创建用户
  console.log('👥 创建用户...');
  const users = await Promise.all([
    prisma.user.create({
      data: {
        id: snowflake.nextId(),
        name: '系统管理员',
        email: 'admin@example.com',
        username: 'admin',
        displayName: '管理员',
        role: 'ADMIN',
        department: '技术部',
        status: 1,
        preferences: JSON.stringify({ theme: 'light', language: 'zh-CN' }),
        timezone: 'Asia/Shanghai',
        language: 'zh-CN',
        loginCount: 0,
        createdAt: now,
        updatedAt: now
      }
    }),
    prisma.user.create({
      data: {
        id: snowflake.nextId(),
        name: '运营专员',
        email: 'operator@example.com',
        username: 'operator',
        displayName: '小王',
        role: 'USER',
        department: '运营部',
        status: 1,
        preferences: JSON.stringify({ theme: 'light', language: 'zh-CN' }),
        timezone: 'Asia/Shanghai',
        language: 'zh-CN',
        loginCount: 5,
        createdAt: now,
        updatedAt: now
      }
    })
  ]);

  // 2. 创建平台
  console.log('🚀 创建平台...');
  const platforms = await Promise.all([
    prisma.platform.create({
      data: {
        id: snowflake.nextId(),
        name: 'tiktok',
        displayName: 'TikTok',
        apiEndpoint: 'https://api.tiktok.com',
        apiConfig: JSON.stringify({ apiKey: 'placeholder', version: 'v1.0' }),
        status: 1,
        createdAt: now,
        updatedAt: now
      }
    }),
    prisma.platform.create({
      data: {
        id: snowflake.nextId(),
        name: 'instagram',
        displayName: 'Instagram',
        apiEndpoint: 'https://api.instagram.com',
        apiConfig: JSON.stringify({ apiKey: 'placeholder', version: 'v2.0' }),
        status: 1,
        createdAt: now,
        updatedAt: now
      }
    }),
    prisma.platform.create({
      data: {
        id: snowflake.nextId(),
        name: 'youtube',
        displayName: 'YouTube',
        apiEndpoint: 'https://api.youtube.com',
        apiConfig: JSON.stringify({ apiKey: 'placeholder', version: 'v3.0' }),
        status: 1,
        createdAt: now,
        updatedAt: now
      }
    })
  ]);

  // 3. 创建标签
  console.log('🏷️ 创建标签...');
  const tags = await Promise.all([
    prisma.tag.create({
      data: {
        id: snowflake.nextId(),
        name: 'beauty',
        displayName: '美妆',
        description: '美妆相关内容',
        category: 'CONTENT',
        color: '#FF69B4',
        icon: '💄',
        status: 1,
        sortOrder: 1,
        isSystem: true,
        createdAt: now,
        updatedAt: now,
        createdBy: users[0].id
      }
    }),
    prisma.tag.create({
      data: {
        id: snowflake.nextId(),
        name: 'tech',
        displayName: '科技',
        description: '科技数码内容',
        category: 'CONTENT',
        color: '#4169E1',
        icon: '📱',
        status: 1,
        sortOrder: 2,
        isSystem: true,
        createdAt: now,
        updatedAt: now,
        createdBy: users[0].id
      }
    }),
    prisma.tag.create({
      data: {
        id: snowflake.nextId(),
        name: 'high-quality',
        displayName: '高质量',
        description: '高质量达人',
        category: 'QUALITY',
        color: '#FFD700',
        icon: '⭐',
        status: 1,
        sortOrder: 10,
        isSystem: true,
        createdAt: now,
        updatedAt: now,
        createdBy: users[0].id
      }
    })
  ]);

  // 4. 验证平台存在并创建达人
  console.log('👤 创建达人...');
  const validPlatforms = await prisma.platform.findMany({
    where: { status: 1 },
    select: { id: true }
  });
  
  if (validPlatforms.length === 0) {
    throw new Error('没有可用的平台，无法创建达人');
  }

  const influencers = await Promise.all([
    prisma.influencer.create({
      data: {
        id: snowflake.nextId(),
        platformId: platforms[0].id, // TikTok
        platformUserId: 'beauty_guru_001',
        username: 'beauty_guru_lily',
        displayName: '美妆达人Lily',
        avatarUrl: 'https://example.com/avatar1.jpg',
        bio: '专业美妆博主，分享最新化妆技巧和产品测评',
        email: 'lily@example.com',
        phone: '+86 138****1234',
        country: 'CN',
        region: 'Beijing',
        city: '北京',
        timezone: 'Asia/Shanghai',
        gender: 'female',
        ageRange: '25-30',
        language: 'zh-CN',
        followersCount: 150000,
        followingCount: 500,
        totalLikes: 2500000,
        totalVideos: 280,
        avgVideoViews: 85000,
        engagementRate: 8.5,
        primaryCategory: '美妆',
        contentStyle: JSON.stringify(['教程类', '测评类', '日常分享']),
        contentLanguage: 'zh-CN',
        tendencyCategory: JSON.stringify(['护肤', '彩妆', '美容仪器']),
        qualityScore: 9.2,
        riskLevel: 'low',
        dataSource: 'api',
        lastDataSync: now,
        dataAccuracy: 95.5,
        cooperateStatus: 1,
        hasSign: 1,
        status: 1,
        createdAt: now,
        updatedAt: now,
        createdBy: users[0].id,
        notes: '高质量美妆达人，合作表现优秀'
      }
    }),
    prisma.influencer.create({
      data: {
        id: snowflake.nextId(),
        platformId: platforms[2].id, // YouTube
        platformUserId: 'tech_reviewer_alex',
        username: 'tech_reviewer_alex',
        displayName: '科技评测Alex',
        avatarUrl: 'https://example.com/avatar3.jpg',
        bio: '专业科技产品评测，客观真实的使用体验分享',
        email: 'alex@example.com',
        phone: '+86 137****9999',
        country: 'CN',
        region: 'Guangdong',
        city: '深圳',
        timezone: 'Asia/Shanghai',
        gender: 'male',
        ageRange: '30-35',
        language: 'zh-CN',
        followersCount: 220000,
        followingCount: 200,
        totalLikes: 3800000,
        totalVideos: 95,
        avgVideoViews: 125000,
        engagementRate: 12.3,
        primaryCategory: '科技',
        contentStyle: JSON.stringify(['深度评测', '对比测试', '使用技巧']),
        contentLanguage: 'zh-CN',
        tendencyCategory: JSON.stringify(['手机', '电脑', '智能家居']),
        qualityScore: 9.8,
        riskLevel: 'low',
        dataSource: 'api',
        lastDataSync: now,
        dataAccuracy: 98.0,
        cooperateStatus: 1,
        hasSign: 1,
        status: 1,
        createdAt: now,
        updatedAt: now,
        createdBy: users[0].id,
        notes: '顶级科技达人，影响力极强'
      }
    })
  ]);

  // 5. 创建达人标签关联
  console.log('🔗 创建达人标签关联...');
  const influencerTags = await Promise.all([
    prisma.influencerTag.create({
      data: {
        id: snowflake.nextId(),
        influencerId: influencers[0].id,
        tagId: tags[0].id, // 美妆
        confidence: 0.95,
        source: 'manual',
        status: 1,
        createdAt: now,
        createdBy: users[0].id
      }
    }),
    prisma.influencerTag.create({
      data: {
        id: snowflake.nextId(),
        influencerId: influencers[0].id,
        tagId: tags[2].id, // 高质量
        confidence: 0.92,
        source: 'system',
        status: 1,
        createdAt: now,
        createdBy: users[0].id
      }
    }),
    prisma.influencerTag.create({
      data: {
        id: snowflake.nextId(),
        influencerId: influencers[1].id,
        tagId: tags[1].id, // 科技
        confidence: 0.98,
        source: 'manual',
        status: 1,
        createdAt: now,
        createdBy: users[0].id
      }
    }),
    prisma.influencerTag.create({
      data: {
        id: snowflake.nextId(),
        influencerId: influencers[1].id,
        tagId: tags[2].id, // 高质量
        confidence: 0.98,
        source: 'system',
        status: 1,
        createdAt: now,
        createdBy: users[0].id
      }
    })
  ]);

  // 统计创建的数据
  const stats = {
    users: users.length,
    platforms: platforms.length,
    tags: tags.length,
    influencers: influencers.length,
    influencerTags: influencerTags.length
  };

  console.log('\n✅ 种子数据创建完成！');
  console.log('📊 数据统计:');
  console.log(`   👥 users: ${stats.users}`);
  console.log(`   🚀 platforms: ${stats.platforms}`);
  console.log(`   🏷️ tags: ${stats.tags}`);
  console.log(`   👤 influencers: ${stats.influencers}`);
  console.log(`   🔗 influencerTags: ${stats.influencerTags}`);

  console.log('\n🎯 重要提醒：');
  console.log('• 数据库已重构为无外键约束模式');
  console.log('• 数据完整性由应用层代码保证');
  console.log('• 支持软删除，所有记录通过status字段控制');
  console.log('• 请确保在操作数据时进行适当的验证');
}

main()
  .catch((e) => {
    console.error('❌ 种子数据创建失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 