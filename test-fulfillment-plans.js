const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testFulfillmentPlans() {
  console.log('🔍 检查履约方案数据...\n');

  try {
    // 获取所有履约方案
    const plans = await prisma.fulfillmentPlan.findMany({
      where: { status: 1 },
      orderBy: { planName: 'asc' }
    });
    
    console.log(`✅ 找到 ${plans.length} 个履约方案:`);
    console.log('='.repeat(80));
    
    plans.forEach((plan, index) => {
      console.log(`${index + 1}. ID: ${plan.id}`);
      console.log(`   名称: ${plan.planName}`);
      console.log(`   类型: ${plan.contentType}`);
      console.log(`   需要寄样: ${plan.requiresSample ? '是' : '否'}`);
      console.log(`   达人自制: ${plan.isInfluencerMade ? '是' : '否'}`);
      console.log(`   初始状态: ${plan.initialStatus}`);
      console.log(`   描述: ${plan.description || '无'}`);
      console.log('   ' + '-'.repeat(60));
    });

    console.log('\n📋 方案数据结构示例:');
    if (plans.length > 0) {
      console.log(JSON.stringify(plans[0], (key, value) => 
        typeof value === 'bigint' ? value.toString() : value, 2));
    }

  } catch (error) {
    console.error('❌ 查询履约方案时出错:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 运行脚本
testFulfillmentPlans()
  .catch((error) => {
    console.error('脚本执行失败:', error);
    process.exit(1);
  }); 