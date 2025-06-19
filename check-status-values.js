const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkStatuses() {
  try {
    console.log('🔍 检查履约方案的initialStatus...');
    const plans = await prisma.fulfillmentPlan.findMany({
      where: { status: 1 },
      select: { id: true, planName: true, initialStatus: true }
    });
    plans.forEach(plan => {
      console.log(`  方案 ${plan.id}: ${plan.planName} -> ${plan.initialStatus}`);
    });
    
    console.log('\n🔍 检查履约单的currentStatus...');
    const records = await prisma.fulfillmentRecord.findMany({
      where: { status: 1 },
      select: { id: true, title: true, currentStatus: true },
      take: 5
    });
    records.forEach(record => {
      console.log(`  履约单 ${record.id}: ${record.title} -> ${record.currentStatus}`);
    });

    console.log('\n🔍 检查状态变更日志...');
    const statusLogs = await prisma.fulfillmentStatusLog.findMany({
      where: { status: 1 },
      select: { fromStatus: true, toStatus: true },
      take: 5
    });
    statusLogs.forEach(log => {
      console.log(`  状态变更: ${log.fromStatus} -> ${log.toStatus}`);
    });

  } catch (error) {
    console.error('❌ 检查失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkStatuses(); 