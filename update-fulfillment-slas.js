const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 根据用户提供的新流程图定义SLA配置
const NEW_SLA_CONFIG = [
  // 有寄样流程 (stateDiagram-v1)
  {
    planType: 'with_sample',
    fromStatus: 'pending_sample',
    toStatus: 'sample_sent',
    standardHours: 24, // T+1
    description: '创建任务,填写达人，产品，需要寄样=是，任务描述，任务优先级'
  },
  {
    planType: 'with_sample',
    fromStatus: 'sample_sent',
    toStatus: 'sample_received',
    standardHours: 24, // T+1
    description: '填写物流单号'
  },
  {
    planType: 'with_sample',
    fromStatus: 'sample_received',
    toStatus: 'content_creation',
    standardHours: 120, // T+5 (5*24小时)
    description: '更新sampleDeliveryTime'
  },
  {
    planType: 'with_sample',
    fromStatus: 'content_creation',
    toStatus: 'content_published',
    standardHours: 24, // T+1
    description: '发送制作指南'
  },
  {
    planType: 'with_sample',
    fromStatus: 'content_published',
    toStatus: 'tracking_started',
    standardHours: 168, // T+7 (7*24小时)
    description: '抓取视频链接'
  },
  {
    planType: 'with_sample',
    fromStatus: 'tracking_started',
    toStatus: 'settlement_completed',
    standardHours: 168, // T+7 (7*24小时)
    description: '计算adsRoi，人工打标签'
  },

  // 无寄样流程 (stateDiagram-v2)
  {
    planType: 'without_sample',
    fromStatus: null, // 初始状态
    toStatus: 'content_creation',
    standardHours: 24, // T+1
    description: '创建任务，填写达人，产品，是否寄样=否，发送制作指南'
  },
  {
    planType: 'without_sample',
    fromStatus: 'content_creation',
    toStatus: 'content_published',
    standardHours: 168, // T+7 (7*24小时)
    description: '抓取视频链接'
  },
  {
    planType: 'without_sample',
    fromStatus: 'content_published',
    toStatus: 'tracking_started',
    standardHours: 168, // T+7 (7*24小时)
    description: '计算adsRoi，人工打标签'
  }
];

async function updateFulfillmentSLAs() {
  try {
    console.log('🔄 开始更新履约时效配置 (fulfillment_slas)...\n');

    // 1. 清空现有配置
    console.log('1. 清空现有SLA配置...');
    const deleteResult = await prisma.fulfillmentSLA.updateMany({
      where: {},
      data: { status: 0 } // 软删除
    });
    console.log(`   清空了 ${deleteResult.count} 条现有配置`);

    // 2. 获取所有履约方案
    console.log('\n2. 获取履约方案信息...');
    const plans = await prisma.fulfillmentPlan.findMany({
      where: { status: 1 },
      select: { id: true, planName: true, requiresSample: true }
    });
    console.log(`   找到 ${plans.length} 个有效方案`);

    // 3. 为每个方案创建对应的SLA配置
    console.log('\n3. 创建新的SLA配置...');
    let createdCount = 0;

    for (const plan of plans) {
      console.log(`\n   处理方案: ${plan.planName} (ID: ${plan.id})`);
      console.log(`   需要寄样: ${plan.requiresSample ? '是' : '否'}`);
      
      // 根据是否需要寄样选择对应的SLA配置
      const slaConfigs = NEW_SLA_CONFIG.filter(config => {
        if (plan.requiresSample) {
          return config.planType === 'with_sample';
        } else {
          return config.planType === 'without_sample';
        }
      });

      // 为该方案创建SLA记录
      for (const config of slaConfigs) {
        try {
          const slaData = {
            id: BigInt(Date.now() * 1000 + Math.floor(Math.random() * 1000)), // 简单ID生成
            planId: plan.id,
            fromStatus: config.fromStatus,
            toStatus: config.toStatus,
            durationHours: config.standardHours, // 使用schema中正确的字段名
            description: config.description,
            status: 1,
            createdAt: Math.floor(Date.now() / 1000)
          };

          await prisma.fulfillmentSLA.create({ data: slaData });
          console.log(`     ✅ ${config.fromStatus || '[开始]'} -> ${config.toStatus}: ${config.standardHours}小时`);
          createdCount++;
        } catch (error) {
          console.log(`     ❌ 创建失败: ${error.message}`);
        }
      }
    }

    console.log(`\n📊 更新完成统计:`);
    console.log(`   删除配置: ${deleteResult.count} 条`);
    console.log(`   新增配置: ${createdCount} 条`);
    console.log(`   处理方案: ${plans.length} 个`);

    // 4. 验证结果
    console.log('\n4. 验证更新结果...');
    const newSLAs = await prisma.fulfillmentSLA.findMany({
      where: { status: 1 },
      orderBy: [
        { planId: 'asc' },
        { fromStatus: 'asc' }
      ]
    });

    // 获取方案信息以便显示
    const planMap = new Map();
    for (const plan of plans) {
      planMap.set(plan.id, plan);
    }

    console.log(`\n📋 当前SLA配置 (${newSLAs.length}条):`);
    let currentPlanId = null;
    for (const sla of newSLAs) {
      if (sla.planId !== currentPlanId) {
        currentPlanId = sla.planId;
        const plan = planMap.get(sla.planId);
        console.log(`\n   ${plan?.planName || 'Unknown'} (${plan?.requiresSample ? '需要寄样' : '无需寄样'}):`);
      }
      console.log(`     ${sla.fromStatus || '[开始]'} -> ${sla.toStatus}: ${sla.durationHours}h`);
    }

    console.log('\n🎉 履约时效配置更新完成！');

  } catch (error) {
    console.error('❌ 更新失败:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 运行更新
updateFulfillmentSLAs()
  .then(() => {
    console.log('\n✅ 所有操作完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 操作失败:', error);
    process.exit(1);
  }); 