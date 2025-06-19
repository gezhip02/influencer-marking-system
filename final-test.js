// 最终API测试脚本
const BASE_URL = 'http://localhost:3000/api';

async function finalTest() {
  console.log('🎯 开始最终API测试...\n');
  
  const results = {
    total: 0,
    passed: 0,
    failed: 0
  };
  
  async function test(name, testFunc) {
    results.total++;
    console.log(`🧪 ${name}`);
    try {
      const passed = await testFunc();
      if (passed) {
        console.log('   ✅ 通过\n');
        results.passed++;
      } else {
        console.log('   ❌ 失败\n');
        results.failed++;
      }
    } catch (error) {
      console.log(`   ❌ 错误: ${error.message}\n`);
      results.failed++;
    }
  }
  
  // 1. 测试平台API
  await test('平台列表API', async () => {
    const response = await fetch(`${BASE_URL}/platforms`);
    const data = await response.json();
    return response.ok && data.success && Array.isArray(data.platforms);
  });
  
  // 2. 测试标签API
  await test('标签列表API', async () => {
    const response = await fetch(`${BASE_URL}/tags`);
    const data = await response.json();
    return response.ok && data.success && Array.isArray(data.data);
  });
  
  // 3. 测试达人API
  await test('达人列表API', async () => {
    const response = await fetch(`${BASE_URL}/influencers`);
    const data = await response.json();
    return response.ok && data.success;
  });
  
  // 4. 测试履约记录API
  await test('履约记录列表API', async () => {
    const response = await fetch(`${BASE_URL}/fulfillment-records`);
    const data = await response.json();
    return response.ok && data.success;
  });
  
  // 5. 测试履约记录标签API
  await test('履约记录标签API', async () => {
    const response = await fetch(`${BASE_URL}/fulfillment-record-tags`);
    const data = await response.json();
    return response.ok && data.success;
  });
  
  // 6. 测试批量导出
  await test('批量导出JSON', async () => {
    const response = await fetch(`${BASE_URL}/influencers/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'export',
        format: 'json',
        filters: { limit: 3 }
      })
    });
    const data = await response.json();
    return response.ok && Array.isArray(data.data);
  });
  
  // 7. 测试批量导出CSV
  await test('批量导出CSV', async () => {
    const response = await fetch(`${BASE_URL}/influencers/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'export',
        format: 'csv',
        filters: { limit: 3 }
      })
    });
    return response.ok && response.headers.get('content-type').includes('csv');
  });
  
  // 8. 测试标签CRUD
  await test('标签创建、更新、删除', async () => {
    // 创建标签
    const createResponse = await fetch(`${BASE_URL}/tags`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'test_final_' + Date.now(),
        displayName: '最终测试标签',
        category: 'test',
        color: '#FF0000'
      })
    });
    
    if (!createResponse.ok) return false;
    
    const createData = await createResponse.json();
    if (!createData.success) return false;
    
    const tagId = createData.data.id;
    
    // 更新标签
    const updateResponse = await fetch(`${BASE_URL}/tags`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: tagId,
        name: 'test_final_updated_' + Date.now(),
        displayName: '最终测试标签(已更新)',
        category: 'test',
        color: '#00FF00'
      })
    });
    
    if (!updateResponse.ok) return false;
    
    // 删除标签
    const deleteResponse = await fetch(`${BASE_URL}/tags?id=${tagId}`, {
      method: 'DELETE'
    });
    
    return deleteResponse.ok;
  });
  
  // 输出测试结果
  console.log('📊 测试结果汇总:');
  console.log(`总数: ${results.total}`);
  console.log(`通过: ${results.passed} ✅`);
  console.log(`失败: ${results.failed} ❌`);
  console.log(`成功率: ${Math.round((results.passed / results.total) * 100)}%`);
  
  if (results.failed === 0) {
    console.log('\n🎉 所有测试通过！API接口修复成功！');
  } else {
    console.log(`\n⚠️  还有 ${results.failed} 个测试失败，需要进一步检查。`);
  }
}

// 等待2秒后运行测试
setTimeout(finalTest, 2000); 