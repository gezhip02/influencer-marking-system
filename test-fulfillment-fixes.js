const API_BASE = 'http://localhost:3000/api';

async function testFulfillmentFixes() {
  console.log('🧪 测试履约单功能修复...\n');

  try {
    // 1. 测试履约单列表 - 应该只返回 status=1 的数据
    console.log('1. 测试履约单列表查询（status=1）...');
    const listResponse = await fetch(`${API_BASE}/fulfillment-records?page=1&limit=10`);
    const listData = await listResponse.json();
    
    if (listData.success) {
      console.log('✅ 履约单列表查询成功');
      console.log(`   - 总计: ${listData.data.length} 条记录`);
      console.log(`   - 分页信息: 第${listData.pagination.page}页，共${listData.pagination.pages}页`);
      
      // 验证所有记录的状态都是1
      const allActiveRecords = listData.data.every(record => record.status === undefined || record.status === 1);
      if (allActiveRecords) {
        console.log('✅ 所有记录都是有效状态（status=1）');
      } else {
        console.log('❌ 发现无效状态的记录');
      }
    } else {
      console.log('❌ 履约单列表查询失败:', listData.error);
    }

    // 2. 测试搜索功能
    console.log('\n2. 测试搜索功能...');
    const searchResponse = await fetch(`${API_BASE}/fulfillment-records?search=美妆`);
    const searchData = await searchResponse.json();
    
    if (searchData.success) {
      console.log('✅ 搜索功能正常');
      console.log(`   - 搜索结果: ${searchData.data.length} 条记录`);
    } else {
      console.log('❌ 搜索功能失败:', searchData.error);
    }

    // 3. 测试删除功能（如果有数据的话）
    if (listData.success && listData.data.length > 0) {
      const testRecordId = listData.data[0].id;
      console.log(`\n3. 测试删除功能（记录ID: ${testRecordId}）...`);
      
      const deleteResponse = await fetch(`${API_BASE}/fulfillment-records/${testRecordId}`, {
        method: 'DELETE'
      });
      const deleteData = await deleteResponse.json();
      
      if (deleteData.success) {
        console.log('✅ 删除功能正常');
        console.log('   - ' + deleteData.message);
        
        // 验证删除后记录不再出现在列表中
        const verifyResponse = await fetch(`${API_BASE}/fulfillment-records?page=1&limit=10`);
        const verifyData = await verifyResponse.json();
        
        if (verifyData.success) {
          const deletedRecordExists = verifyData.data.some(record => record.id === testRecordId);
          if (!deletedRecordExists) {
            console.log('✅ 删除验证成功：记录已从列表中移除');
          } else {
            console.log('❌ 删除验证失败：记录仍在列表中');
          }
        }
      } else {
        console.log('❌ 删除功能失败:', deleteData.error);
      }
    } else {
      console.log('\n3. 跳过删除测试（无可用数据）');
    }

    // 4. 测试创建履约单
    console.log('\n4. 测试创建履约单...');
    const createData = {
      influencerId: "1750356119469101714", // 使用真实的达人ID
      productId: "1750356112746766717",     // 使用真实的产品ID
      planId: "1750355983950151074",        // 使用真实的方案ID
      ownerId: "1001",                      // 使用有效的用户ID
      title: "测试履约单",
      description: "这是一个测试履约单",
      priority: "medium"
    };

    const createResponse = await fetch(`${API_BASE}/fulfillment-records`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(createData)
    });
    const createResult = await createResponse.json();
    
    if (createResult.success) {
      console.log('✅ 创建履约单成功');
      console.log(`   - 新履约单ID: ${createResult.data.id}`);
      console.log(`   - 初始状态: ${createResult.data.currentStatus}`);
    } else {
      console.log('❌ 创建履约单失败:', createResult.error);
    }

    // 5. 测试履约方案API
    console.log('\n5. 测试履约方案API...');
    const plansResponse = await fetch(`${API_BASE}/fulfillment-plans`);
    const plansData = await plansResponse.json();
    
    if (plansData.success) {
      console.log('✅ 履约方案API正常');
      console.log(`   - 可用方案: ${plansData.data.length} 个`);
      plansData.data.forEach(plan => {
        console.log(`     • ${plan.planName} (${plan.contentType})`);
      });
    } else {
      console.log('❌ 履约方案API失败:', plansData.error);
    }

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
  }

  console.log('\n🎯 履约单功能修复测试完成！');
}

// 运行测试
testFulfillmentFixes(); 