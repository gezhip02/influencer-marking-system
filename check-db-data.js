const { PrismaClient } = require('@prisma/client');

async function checkFulfillmentData() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 检查数据库中的履约单数据...\n');
    
    // 查询所有履约单（包括软删除的）
    const allRecords = await prisma.fulfillmentRecord.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    
    console.log('📋 数据库中所有履约单记录:');
    allRecords.forEach((record, index) => {
      console.log(`${index + 1}. ${record.title}`);
      console.log(`   ID: ${record.id}`);
      console.log(`   状态: ${record.currentStatus}`);
      console.log(`   数据状态: ${record.status === 1 ? '有效' : '已删除'} (status=${record.status})`);
      console.log(`   创建时间: ${new Date(record.createdAt * 1000).toLocaleString()}`);
      console.log(`   更新时间: ${new Date(record.updatedAt * 1000).toLocaleString()}`);
      console.log('');
    });
    
    // 统计
    const totalCount = allRecords.length;
    const activeCount = allRecords.filter(r => r.status === 1).length;
    const deletedCount = allRecords.filter(r => r.status === 0).length;
    
    console.log('📊 数据统计:');
    console.log(`   总记录数: ${totalCount}`);
    console.log(`   有效记录: ${activeCount}`);
    console.log(`   已删除记录: ${deletedCount}`);
    
    // 查询只有效的记录（API查询逻辑）
    console.log('\n🔍 API查询逻辑测试（只查询有效记录）:');
    const activeRecords = await prisma.fulfillmentRecord.findMany({
      where: { status: 1 },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`   API应该返回 ${activeRecords.length} 条记录:`);
    activeRecords.forEach((record, index) => {
      console.log(`   ${index + 1}. ${record.title} (ID: ${record.id})`);
    });
    
    // 验证数据一致性
    console.log('\n✅ 验证结果:');
    console.log(`   数据库有效记录: ${activeCount} 条`);
    console.log(`   API查询结果: ${activeRecords.length} 条`);
    
    if (activeCount === activeRecords.length) {
      console.log('   ✅ 数据一致性正常');
    } else {
      console.log('   ❌ 数据不一致！');
    }
    
  } catch (error) {
    console.error('❌ 数据库查询失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkFulfillmentData(); 