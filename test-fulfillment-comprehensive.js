console.log('🧪 全面测试履约单接口和数据库真实数据...\n');

const BASE_URL = 'http://localhost:3000';

// 测试结果收集
const testResults = {
  passed: 0,
  failed: 0,
  details: []
};

// 添加测试结果
function addResult(name, passed, details = '') {
  testResults.details.push({
    name,
    status: passed ? '✅' : '❌',
    details
  });
  
  if (passed) {
    testResults.passed++;
  } else {
    testResults.failed++;
  }
}

// 1. 检查数据库真实数据
async function checkDatabaseData() {
  console.log('🗄️ 检查数据库真实数据...');
  
  try {
    // 直接查询数据库所有履约单
    const dbResponse = await fetch(`${BASE_URL}/api/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        query: `
          SELECT 
            id, title, currentStatus, priority, status, 
            createdAt, updatedAt,
            CASE WHEN status = 1 THEN '有效' ELSE '已删除' END as statusText
          FROM fulfillment_records 
          ORDER BY createdAt DESC 
          LIMIT 10
        `
      })
    });
    
    if (dbResponse.ok) {
      const dbData = await dbResponse.json();
      console.log('📋 数据库中的履约单记录:');
      
      if (dbData.length > 0) {
        dbData.forEach((record, index) => {
          console.log(`  ${index + 1}. ${record.title || '未命名'}`);
          console.log(`     ID: ${record.id}, 状态: ${record.currentStatus}, 优先级: ${record.priority}`);
          console.log(`     数据状态: ${record.statusText} (status=${record.status})`);
          console.log(`     创建时间: ${new Date(record.createdAt * 1000).toLocaleString()}`);
        });
        
        const activeCount = dbData.filter(r => r.status === 1).length;
        const deletedCount = dbData.filter(r => r.status === 0).length;
        
        console.log(`\n📊 数据统计: 总计${dbData.length}条, 有效${activeCount}条, 已删除${deletedCount}条`);
        addResult('数据库查询', true, `总计${dbData.length}条记录，有效${activeCount}条`);
        
        return { allRecords: dbData, activeRecords: dbData.filter(r => r.status === 1) };
      } else {
        console.log('   ⚠️ 数据库中没有履约单记录');
        addResult('数据库查询', true, '数据库为空');
        return { allRecords: [], activeRecords: [] };
      }
    } else {
      console.log('   ❌ 数据库查询失败');
      addResult('数据库查询', false, '查询失败');
      return null;
    }
  } catch (error) {
    console.log('   ❌ 数据库查询异常:', error.message);
    addResult('数据库查询', false, error.message);
    return null;
  }
}

// 2. 测试履约单列表API
async function testFulfillmentListAPI() {
  console.log('\n📋 测试履约单列表API...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/fulfillment-records`);
    const data = await response.json();
    
    console.log('API响应结构:', {
      success: data.success,
      dataType: Array.isArray(data.data) ? 'array' : typeof data.data,
      recordCount: data.data?.length || 0,
      hasPagination: !!data.pagination
    });
    
    if (data.success && data.data) {
      console.log('📋 API返回的履约单:');
      data.data.forEach((record, index) => {
        console.log(`  ${index + 1}. ${record.title}`);
        console.log(`     ID: ${record.id}, 状态: ${record.currentStatus}, 优先级: ${record.priority}`);
        console.log(`     达人: ${record.influencer?.displayName || '未知'}, 产品: ${record.product?.name || '未知'}`);
      });
      
      addResult('履约单列表API', true, `返回${data.data.length}条记录`);
      return data.data;
    } else {
      console.log('   ❌ API返回异常:', data);
      addResult('履约单列表API', false, data.error || 'API返回格式异常');
      return [];
    }
  } catch (error) {
    console.log('   ❌ 列表API测试失败:', error.message);
    addResult('履约单列表API', false, error.message);
    return [];
  }
}

// 3. 测试单个履约单详情API
async function testFulfillmentDetailAPI(recordId) {
  console.log(`\n🔍 测试履约单详情API (ID: ${recordId})...`);
  
  try {
    const response = await fetch(`${BASE_URL}/api/fulfillment-records/${recordId}`);
    const data = await response.json();
    
    if (data.success && data.data) {
      console.log('   ✅ 详情API正常');
      console.log(`      标题: ${data.data.title}`);
      console.log(`      状态: ${data.data.currentStatus}`);
      console.log(`      优先级: ${data.data.priority}`);
      addResult(`履约单详情API (${recordId})`, true, '获取成功');
      return data.data;
    } else {
      console.log(`   ❌ 详情API异常:`, data.error);
      addResult(`履约单详情API (${recordId})`, false, data.error);
      return null;
    }
  } catch (error) {
    console.log(`   ❌ 详情API测试失败:`, error.message);
    addResult(`履约单详情API (${recordId})`, false, error.message);
    return null;
  }
}

// 4. 测试状态更新API
async function testStatusUpdateAPI(recordId, newStatus) {
  console.log(`\n🔄 测试状态更新API (ID: ${recordId}, 新状态: ${newStatus})...`);
  
  try {
    const response = await fetch(`${BASE_URL}/api/fulfillment-records/${recordId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        currentStatus: newStatus,
        remarks: 'API测试状态更新',
        operatorId: '1001'
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('   ✅ 状态更新成功');
      console.log(`      新状态: ${data.data.currentStatus}`);
      addResult(`状态更新API (${recordId})`, true, `更新为${newStatus}`);
      return true;
    } else {
      console.log(`   ❌ 状态更新失败:`, data.error);
      addResult(`状态更新API (${recordId})`, false, data.error);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ 状态更新测试失败:`, error.message);
    addResult(`状态更新API (${recordId})`, false, error.message);
    return false;
  }
}

// 5. 测试删除API
async function testDeleteAPI(recordId) {
  console.log(`\n🗑️ 测试删除API (ID: ${recordId})...`);
  
  try {
    const response = await fetch(`${BASE_URL}/api/fulfillment-records/${recordId}`, {
      method: 'DELETE'
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('   ✅ 删除成功');
      addResult(`删除API (${recordId})`, true, '软删除成功');
      return true;
    } else {
      console.log(`   ❌ 删除失败:`, data.error);
      addResult(`删除API (${recordId})`, false, data.error);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ 删除测试失败:`, error.message);
    addResult(`删除API (${recordId})`, false, error.message);
    return false;
  }
}

// 6. 验证删除后的查询
async function verifyAfterDelete() {
  console.log('\n🔍 验证删除后的查询结果...');
  
  // 重新查询列表
  const listData = await testFulfillmentListAPI();
  
  // 重新查询数据库
  const dbData = await checkDatabaseData();
  
  if (dbData && listData) {
    const apiCount = listData.length;
    const dbActiveCount = dbData.activeRecords.length;
    
    console.log(`\n📊 删除验证结果:`);
    console.log(`   API返回记录数: ${apiCount}`);
    console.log(`   数据库有效记录数: ${dbActiveCount}`);
    
    if (apiCount === dbActiveCount) {
      console.log('   ✅ 数据一致性验证通过');
      addResult('删除后数据一致性', true, 'API和数据库数据一致');
    } else {
      console.log('   ❌ 数据不一致！');
      addResult('删除后数据一致性', false, `API:${apiCount} vs DB:${dbActiveCount}`);
    }
  }
}

// 主测试流程
async function runComprehensiveTest() {
  console.log('🚀 开始全面测试...\n');
  
  // 1. 检查数据库数据
  const dbData = await checkDatabaseData();
  
  // 2. 测试列表API
  const listData = await testFulfillmentListAPI();
  
  // 3. 如果有数据，测试详情API
  if (listData && listData.length > 0) {
    const firstRecord = listData[0];
    await testFulfillmentDetailAPI(firstRecord.id);
    
    // 4. 测试状态更新（如果状态不是已发布）
    if (firstRecord.currentStatus !== 'content_published') {
      await testStatusUpdateAPI(firstRecord.id, 'content_published');
    }
    
    // 5. 如果有多条记录，测试删除最后一条
    if (listData.length > 1) {
      const lastRecord = listData[listData.length - 1];
      await testDeleteAPI(lastRecord.id);
      
      // 6. 验证删除后的数据一致性
      await verifyAfterDelete();
    }
  }
  
  // 输出测试总结
  console.log('\n' + '='.repeat(50));
  console.log('📊 测试总结');
  console.log('='.repeat(50));
  
  testResults.details.forEach(result => {
    console.log(`${result.status} ${result.name}: ${result.details}`);
  });
  
  console.log(`\n📈 测试统计:`);
  console.log(`   总测试数: ${testResults.passed + testResults.failed}`);
  console.log(`   通过: ${testResults.passed} ✅`);
  console.log(`   失败: ${testResults.failed} ❌`);
  console.log(`   成功率: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
  
  if (testResults.failed === 0) {
    console.log('\n🎉 所有测试通过！履约单系统功能正常。');
  } else {
    console.log('\n⚠️ 发现问题需要修复：');
    testResults.details
      .filter(r => r.status === '❌')
      .forEach(r => console.log(`   - ${r.name}: ${r.details}`));
  }
}

// 运行测试
runComprehensiveTest().catch(error => {
  console.error('测试运行失败:', error);
}); 