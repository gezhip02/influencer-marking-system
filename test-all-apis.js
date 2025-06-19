const BASE_URL = 'http://localhost:3000/api';

// 测试函数
async function testAPI(endpoint, options = {}) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    const data = await response.json();
    console.log(`✅ ${options.method || 'GET'} ${endpoint}: ${response.status}`);
    
    if (!response.ok) {
      console.log(`   Error: ${data.error || data.message || 'Unknown error'}`);
    } else {
      if (data.data && Array.isArray(data.data)) {
        console.log(`   返回 ${data.data.length} 条记录`);
      } else if (data.success !== undefined) {
        console.log(`   Success: ${data.success}`);
      }
    }
    
    return { success: response.ok, data, status: response.status };
  } catch (error) {
    console.log(`❌ ${options.method || 'GET'} ${endpoint}: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// 主测试函数
async function runTests() {
  console.log('🚀 开始测试所有API接口...\n');

  // 1. 测试平台接口
  console.log('📝 测试平台接口:');
  await testAPI('/platforms');
  
  // 2. 测试标签接口
  console.log('\n📝 测试标签接口:');
  await testAPI('/tags');
  await testAPI('/tags?page=1&limit=5');
  
  // 3. 测试达人接口
  console.log('\n📝 测试达人接口:');
  await testAPI('/influencers');
  await testAPI('/influencers?page=1&limit=5');
  
  // 4. 测试履约记录接口
  console.log('\n📝 测试履约记录接口:');
  await testAPI('/fulfillment-records');
  
  // 5. 测试履约记录标签接口
  console.log('\n📝 测试履约记录标签接口:');
  await testAPI('/fulfillment-record-tags');
  
  // 6. 测试批量操作接口
  console.log('\n📝 测试批量操作接口:');
  
  // 测试批量导出JSON
  await testAPI('/influencers/batch', {
    method: 'POST',
    body: JSON.stringify({
      action: 'export',
      format: 'json',
      filters: { limit: 5 }
    })
  });
  
  // 测试批量导出CSV
  await testAPI('/influencers/batch', {
    method: 'POST',
    body: JSON.stringify({
      action: 'export',
      format: 'csv',
      filters: { limit: 5 }
    })
  });
  
  // 7. 测试创建标签
  console.log('\n📝 测试创建标签:');
  const createTagResult = await testAPI('/tags', {
    method: 'POST',
    body: JSON.stringify({
      name: 'test_tag_' + Date.now(),
      displayName: '测试标签',
      category: 'test',
      color: '#FF0000',
      description: '这是一个测试标签'
    })
  });
  
  let testTagId = null;
  if (createTagResult.success && createTagResult.data.data) {
    testTagId = createTagResult.data.data.id;
    console.log(`   创建的标签ID: ${testTagId}`);
    
    // 8. 测试更新标签
    console.log('\n📝 测试更新标签:');
    await testAPI('/tags', {
      method: 'PUT',
      body: JSON.stringify({
        id: testTagId,
        name: 'test_tag_updated_' + Date.now(),
        displayName: '测试标签(已更新)',
        category: 'test',
        color: '#00FF00',
        description: '这是一个更新后的测试标签'
      })
    });
    
    // 9. 测试删除标签
    console.log('\n📝 测试软删除标签:');
    await testAPI(`/tags?id=${testTagId}`, {
      method: 'DELETE'
    });
  }
  
  // 10. 测试创建达人
  console.log('\n📝 测试创建达人:');
  const createInfluencerResult = await testAPI('/influencers', {
    method: 'POST',
    body: JSON.stringify({
      platformId: '1',
      platformUserId: 'test_user_' + Date.now(),
      username: 'testuser',
      displayName: '测试达人',
      email: 'test@example.com',
      followersCount: 10000,
      riskLevel: 'LOW',
      dataSource: 'manual'
    })
  });
  
  let testInfluencerId = null;
  if (createInfluencerResult.success && createInfluencerResult.data.data) {
    testInfluencerId = createInfluencerResult.data.data.id;
    console.log(`   创建的达人ID: ${testInfluencerId}`);
    
    // 11. 测试更新达人
    console.log('\n📝 测试更新达人:');
    await testAPI('/influencers', {
      method: 'PUT',
      body: JSON.stringify({
        id: testInfluencerId,
        displayName: '测试达人(已更新)',
        followersCount: 15000,
        bio: '这是一个测试达人的简介'
      })
    });
    
    // 12. 测试软删除达人
    console.log('\n📝 测试软删除达人:');
    await testAPI(`/influencers?id=${testInfluencerId}`, {
      method: 'DELETE'
    });
  }
  
  // 13. 测试数据统计
  console.log('\n📝 测试数据统计:');
  const statsResult = await testAPI('/influencers?page=1&limit=1');
  if (statsResult.success && statsResult.data.stats) {
    console.log('   统计信息:');
    console.log(`   - 总达人数: ${statsResult.data.stats.total}`);
    console.log(`   - 活跃达人数: ${statsResult.data.stats.active}`);
    console.log(`   - 本周联系数: ${statsResult.data.stats.contacted}`);
    console.log(`   - 总标签数: ${statsResult.data.stats.totalTags}`);
  }
  
  console.log('\n✅ API接口测试完成!');
}

// 运行测试
runTests().catch(console.error); 