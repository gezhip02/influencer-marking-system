const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestData() {
  console.log('🚀 开始创建综合测试数据...');

  try {
    // 1. 创建测试用户
    console.log('1. 创建测试用户...');
    const users = await Promise.all([
      prisma.user.upsert({
        where: { email: 'admin@test.com' },
        update: {},
        create: {
          id: BigInt('1001'),
          email: 'admin@test.com',
          name: '系统管理员',
          displayName: '管理员',
          role: 'ADMIN',
          department: '运营部',
          status: 1,
          createdAt: Math.floor(Date.now() / 1000)
        }
      }),
      prisma.user.upsert({
        where: { email: 'manager@test.com' },
        update: {},
        create: {
          id: BigInt('1002'),
          email: 'manager@test.com',
          name: '项目经理',
          displayName: '经理',
          role: 'MANAGER',
          department: '商务部',
          status: 1,
          createdAt: Math.floor(Date.now() / 1000)
        }
      })
    ]);
    console.log(`   ✅ 创建了 ${users.length} 个用户`);

    // 2. 创建平台数据
    console.log('2. 创建平台数据...');
    const platforms = await Promise.all([
      prisma.platform.upsert({
        where: { name: 'TikTok' },
        update: {},
        create: {
          id: BigInt('1'),
          name: 'TikTok',
          displayName: 'TikTok',
          status: 1,
          createdAt: Math.floor(Date.now() / 1000)
        }
      }),
      prisma.platform.upsert({
        where: { name: '抖音' },
        update: {},
        create: {
          id: BigInt('2'),
          name: '抖音',
          displayName: '抖音',
          status: 1,
          createdAt: Math.floor(Date.now() / 1000)
        }
      }),
      prisma.platform.upsert({
        where: { name: '小红书' },
        update: {},
        create: {
          id: BigInt('3'),
          name: '小红书',
          displayName: '小红书',
          status: 1,
          createdAt: Math.floor(Date.now() / 1000)
        }
      })
    ]);
    console.log(`   ✅ 创建了 ${platforms.length} 个平台`);

    // 3. 创建达人数据
    console.log('3. 创建达人数据...');
    const influencers = [];
    const influencerData = [
      {
        id: BigInt('1'),
        platformId: BigInt('2'), // 抖音
        platformUserId: 'beauty_queen_001',
        username: 'beauty_queen',
        displayName: '美妆达人小雅CC2',
        bio: '专业美妆博主，10年化妆经验',
        avatarUrl: 'https://via.placeholder.com/100',
        followersCount: 1280000,
        avgVideoViews: 85000,
        totalLikes: 12000
      },
      {
        id: BigInt('2'),
        platformId: BigInt('1'), // TikTok
        platformUserId: 'tech_tony_002',
        username: 'tech_tony',
        displayName: '科技达人Tony',
        bio: '专注科技产品评测',
        avatarUrl: 'https://via.placeholder.com/100',
        followersCount: 2100000,
        avgVideoViews: 120000,
        totalLikes: 18000
      },
      {
        id: BigInt('3'),
        platformId: BigInt('3'), // 小红书
        platformUserId: 'fitness_guru_003',
        username: 'fitness_guru',
        displayName: '健身教练小李',
        bio: '健身达人，分享健康生活',
        avatarUrl: 'https://via.placeholder.com/100',
        followersCount: 890000,
        avgVideoViews: 65000,
        totalLikes: 9500
      },
      {
        id: BigInt('4'),
        platformId: BigInt('2'), // 抖音
        platformUserId: 'fashion_anna_004',
        username: 'fashion_anna',
        displayName: '时尚博主Anna',
        bio: '时尚穿搭分享',
        avatarUrl: 'https://via.placeholder.com/100',
        followersCount: 1560000,
        avgVideoViews: 95000,
        totalLikes: 14000
      },
      {
        id: BigInt('5'),
        platformId: BigInt('3'), // 小红书
        platformUserId: 'food_lover_005',
        username: 'food_lover',
        displayName: '美食探店家',
        bio: '专业美食博主',
        avatarUrl: 'https://via.placeholder.com/100',
        followersCount: 750000,
        avgVideoViews: 58000,
        totalLikes: 8200
      }
    ];

    for (const data of influencerData) {
      const influencer = await prisma.influencer.upsert({
        where: { id: data.id },
        update: {},
        create: {
          ...data,
          status: 1,
          createdAt: Math.floor(Date.now() / 1000),
          updatedAt: Math.floor(Date.now() / 1000)
        }
      });
      influencers.push(influencer);
    }
    console.log(`   ✅ 创建了 ${influencers.length} 个达人`);

    // 4. 创建产品数据
    console.log('4. 创建产品数据...');
    const products = [];
    const productData = [
      {
        id: BigInt('1'),
        name: '兰蔻持久粉底液',
        brand: '兰蔻',
        country: '法国',
        skuSeries: 'LANCOME-FOUND-001'
      },
      {
        id: BigInt('2'),
        name: 'iPhone 15 Pro',
        brand: '苹果',
        country: '美国',
        skuSeries: 'APPLE-IP15P-001'
      },
      {
        id: BigInt('3'),
        name: '智能跑步机',
        brand: '小米',
        country: '中国',
        skuSeries: 'MI-TREADMILL-001'
      },
      {
        id: BigInt('4'),
        name: '春季连衣裙',
        brand: 'ZARA',
        country: '西班牙',
        skuSeries: 'ZARA-DRESS-001'
      },
      {
        id: BigInt('5'),
        name: '高端牛排套餐',
        brand: '王品集团',
        country: '台湾',
        skuSeries: 'WANGPIN-STEAK-001'
      }
    ];

    for (const data of productData) {
      const product = await prisma.cooperationProduct.upsert({
        where: { id: data.id },
        update: {},
        create: {
          ...data,
          status: 1,
          createdAt: Math.floor(Date.now() / 1000),
          updatedAt: Math.floor(Date.now() / 1000)
        }
      });
      products.push(product);
    }
    console.log(`   ✅ 创建了 ${products.length} 个产品`);

    // 5. 创建履约方案
    console.log('5. 创建履约方案...');
    const plans = [];
    const planData = [
      {
        id: BigInt('1'),
        planCode: 'BASIC',
        planName: '基础合作',
        requiresSample: true,
        contentType: 'VIDEO',
        isInfluencerMade: false,
        initialStatus: 'pending_sample'
      },
      {
        id: BigInt('2'),
        planCode: 'STANDARD',
        planName: '标准合作',
        requiresSample: true,
        contentType: 'MIXED',
        isInfluencerMade: false,
        initialStatus: 'pending_sample'
      },
      {
        id: BigInt('3'),
        planCode: 'PREMIUM',
        planName: '深度合作',
        requiresSample: true,
        contentType: 'COMPREHENSIVE',
        isInfluencerMade: true,
        initialStatus: 'pending_sample'
      }
    ];

    for (const data of planData) {
      const plan = await prisma.fulfillmentPlan.upsert({
        where: { id: data.id },
        update: {},
        create: {
          ...data,
          status: 1,
          createdAt: Math.floor(Date.now() / 1000),
          updatedAt: Math.floor(Date.now() / 1000)
        }
      });
      plans.push(plan);
    }
    console.log(`   ✅ 创建了 ${plans.length} 个履约方案`);

    // 6. 创建履约单数据
    console.log('6. 创建履约单数据...');
    const currentTime = Math.floor(Date.now() / 1000);
    const fulfillmentRecords = [];
    
    // 创建不同状态的履约单
    const recordData = [
      {
        id: BigInt('1'),
        influencerId: BigInt('1'),
        productId: BigInt('1'),
        planId: BigInt('2'),
        ownerId: BigInt('1001'),
        title: '美妆达人小雅CC2 × 兰蔻粉底液 标准合作',
        description: '春季新品推广，主打持久不脱妆概念',
        priority: 'high',
        currentStatus: 'content_production',
        recordStatus: 'active',
        currentStageStartTime: currentTime - 7200, // 2小时前开始
        currentStageDeadline: currentTime + 79200, // 22小时后截止
        isCurrentStageOverdue: false,
        videoTitle: '兰蔻新品试用分享',
        contentGuidelines: '重点突出产品持久度和自然效果'
      },
      {
        id: BigInt('2'),
        influencerId: BigInt('2'),
        productId: BigInt('2'),
        planId: BigInt('3'),
        ownerId: BigInt('1002'),
        title: '科技达人Tony × iPhone 15 Pro 深度评测',
        description: 'iPhone 15 Pro深度评测合作',
        priority: 'urgent',
        currentStatus: 'sample_received',
        recordStatus: 'active',
        currentStageStartTime: currentTime - 3600, // 1小时前
        currentStageDeadline: currentTime + 3600, // 1小时后截止 (即将逾期)
        isCurrentStageOverdue: false,
        videoTitle: 'iPhone 15 Pro全面评测',
        contentGuidelines: '重点测试摄影功能和性能表现'
      },
      {
        id: BigInt('3'),
        influencerId: BigInt('3'),
        productId: BigInt('3'),
        planId: BigInt('1'),
        ownerId: BigInt('1001'),
        title: '健身教练小李 × 小米跑步机 基础合作',
        description: '智能跑步机使用体验分享',
        priority: 'medium',
        currentStatus: 'content_published',
        recordStatus: 'active',
        currentStageStartTime: currentTime - 86400, // 1天前
        currentStageDeadline: currentTime + 86400, // 1天后
        isCurrentStageOverdue: false,
        videoTitle: '小米跑步机使用心得',
        publishTime: currentTime - 3600,
        adsRoi: 15.8
      },
      {
        id: BigInt('4'),
        influencerId: BigInt('4'),
        productId: BigInt('4'),
        planId: BigInt('2'),
        ownerId: BigInt('1002'),
        title: '时尚博主Anna × ZARA春季新品',
        description: '春季连衣裙穿搭分享',
        priority: 'medium',
        currentStatus: 'content_review',
        recordStatus: 'active',
        currentStageStartTime: currentTime - 1800, // 30分钟前
        currentStageDeadline: currentTime + 5400, // 1.5小时后
        isCurrentStageOverdue: false,
        videoTitle: 'ZARA春季穿搭推荐'
      },
      {
        id: BigInt('5'),
        influencerId: BigInt('5'),
        productId: BigInt('5'),
        planId: BigInt('1'),
        ownerId: BigInt('1001'),
        title: '美食探店家 × 王品牛排套餐',
        description: '高端牛排套餐体验分享',
        priority: 'low',
        currentStatus: 'pending_sample',
        recordStatus: 'active',
        currentStageStartTime: currentTime - 172800, // 2天前开始
        currentStageDeadline: currentTime - 86400, // 1天前就应该完成 (已逾期)
        isCurrentStageOverdue: true,
        videoTitle: '王品牛排试吃体验'
      },
      {
        id: BigInt('6'),
        influencerId: BigInt('1'),
        productId: BigInt('1'),
        planId: BigInt('1'),
        ownerId: BigInt('1001'),
        title: '美妆达人小雅CC2 × 兰蔻粉底液 基础合作',
        description: '已完成的合作案例',
        priority: 'medium',
        currentStatus: 'settlement_completed',
        recordStatus: 'completed',
        currentStageStartTime: currentTime - 604800, // 7天前
        currentStageDeadline: currentTime - 518400, // 6天前
        isCurrentStageOverdue: false,
        videoTitle: '兰蔻粉底液真实测评',
        publishTime: currentTime - 432000, // 5天前发布
        adsRoi: 22.5
      }
    ];

    for (const data of recordData) {
      const record = await prisma.fulfillmentRecord.upsert({
        where: { id: data.id },
        update: {},
        create: {
          ...data,
          status: 1,
          createdAt: currentTime - 604800, // 7天前创建
          updatedAt: currentTime
        }
      });
      fulfillmentRecords.push(record);
    }
    console.log(`   ✅ 创建了 ${fulfillmentRecords.length} 个履约单`);

    // 7. 创建状态变更日志
    console.log('7. 创建状态变更日志...');
    const statusLogs = [];
    
    // 为每个履约单创建状态历史
    for (let i = 0; i < fulfillmentRecords.length; i++) {
      const record = fulfillmentRecords[i];
      const recordId = record.id;
      
      // 创建初始状态日志
      const initialLog = await prisma.fulfillmentStatusLog.create({
        data: {
          id: BigInt(`${i + 1}001`),
          fulfillmentRecordId: recordId,
          fromStatus: null,
          toStatus: 'pending_sample',
          stageStartTime: currentTime - 604800,
          stageEndTime: currentTime - 518400,
          stageDeadline: currentTime - 518400,
          plannedDurationHours: 24,
          actualDurationHours: 24,
          isOverdue: false,
          overdueHours: 0,
          changeReason: 'system_auto',
          remarks: '履约单创建',
          operatorId: '1001',
          createdAt: currentTime - 604800
        }
      });
      statusLogs.push(initialLog);

      // 根据当前状态创建相应的历史记录
      if (record.currentStatus !== 'pending_sample') {
        const secondLog = await prisma.fulfillmentStatusLog.create({
          data: {
            id: BigInt(`${i + 1}002`),
            fulfillmentRecordId: recordId,
            fromStatus: 'pending_sample',
            toStatus: 'sample_sent',
            stageStartTime: currentTime - 518400,
            stageEndTime: currentTime - 432000,
            stageDeadline: currentTime - 432000,
            plannedDurationHours: 24,
            actualDurationHours: 24,
            isOverdue: false,
            overdueHours: 0,
            changeReason: 'manual_update',
            remarks: '样品已寄出',
            operatorId: '1002',
            createdAt: currentTime - 518400
          }
        });
        statusLogs.push(secondLog);
      }
    }
    console.log(`   ✅ 创建了 ${statusLogs.length} 条状态日志`);

    console.log('\n🎉 测试数据创建完成！');
    console.log('\n📊 数据统计:');
    console.log(`   👥 用户: ${users.length} 个`);
    console.log(`   📱 平台: ${platforms.length} 个`);
    console.log(`   🌟 达人: ${influencers.length} 个`);
    console.log(`   📦 产品: ${products.length} 个`);
    console.log(`   📋 方案: ${plans.length} 个`);
    console.log(`   📄 履约单: ${fulfillmentRecords.length} 个`);
    console.log(`   📝 状态日志: ${statusLogs.length} 条`);

    console.log('\n🔍 履约单状态分布:');
    const statusCounts = {};
    fulfillmentRecords.forEach(record => {
      statusCounts[record.currentStatus] = (statusCounts[record.currentStatus] || 0) + 1;
    });
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count} 个`);
    });

  } catch (error) {
    console.error('❌ 创建测试数据失败:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 执行数据创建
createTestData()
  .then(() => {
    console.log('\n✅ 所有测试数据创建成功！');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 创建失败:', error);
    process.exit(1);
  }); 