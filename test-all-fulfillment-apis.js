const API_BASE = 'http://localhost:3000/api';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testAllFulfillmentAPIs() {
  console.log('🧪 全面测试履约单相关API...\n');

  const results = {
    success: 0,
    failed: 0,
    errors: []
  };

  try {
    // 等待服务器启动
    console.log('⏳ 等待服务器启动...');
    await sleep(5000);

    // 1. 测试履约方案API
    console.log('1. 测试履约方案API...');
    try {
      const plansResponse = await fetch(`${API_BASE}/fulfillment-plans`);
      const plansData = await plansResponse.json();
      
      if (plansData.success && plansData.data?.length > 0) {
        console.log(`✅ 履约方案API正常 (${plansData.data.length}个方案)`);
        results.success++;
      } else {
        throw new Error(plansData.error || '没有返回方案数据');
      }
    } catch (error) {
      console.log(`❌ 履约方案API失败: ${error.message}`);
      results.failed++;
      results.errors.push(`履约方案API: ${error.message}`);
    }

    // 2. 测试达人API
    console.log('\n2. 测试达人API...');
    try {
      const influencersResponse = await fetch(`${API_BASE}/influencers?page=1&limit=5`);
      const influencersData = await influencersResponse.json();
      
      if (influencersData.success && influencersData.data?.items?.length > 0) {
        console.log(`✅ 达人API正常 (${influencersData.data.items.length}个达人)`);
        results.success++;
      } else {
        throw new Error(influencersData.error || '没有返回达人数据');
      }
    } catch (error) {
      console.log(`❌ 达人API失败: ${error.message}`);
      results.failed++;
      results.errors.push(`达人API: ${error.message}`);
    }

    // 3. 测试产品API
    console.log('\n3. 测试产品API...');
    try {
      const productsResponse = await fetch(`${API_BASE}/products?page=1&limit=5`);
      const productsData = await productsResponse.json();
      
      if (productsData.success && productsData.data?.length > 0) {
        console.log(`✅ 产品API正常 (${productsData.data.length}个产品)`);
        results.success++;
      } else {
        throw new Error(productsData.error || '没有返回产品数据');
      }
    } catch (error) {
      console.log(`❌ 产品API失败: ${error.message}`);
      results.failed++;
      results.errors.push(`产品API: ${error.message}`);
    }

    // 4. 测试履约单列表API
    console.log('\n4. 测试履约单列表API...');
    try {
      const recordsResponse = await fetch(`${API_BASE}/fulfillment-records?page=1&limit=5`);
      const recordsData = await recordsResponse.json();
      
      if (recordsData.success) {
        console.log(`✅ 履约单列表API正常 (${recordsData.data?.length || 0}条记录)`);
        console.log(`   分页信息: 第${recordsData.pagination?.page}页，共${recordsData.pagination?.pages}页`);
        results.success++;
      } else {
        throw new Error(recordsData.error || '履约单列表获取失败');
      }
    } catch (error) {
      console.log(`❌ 履约单列表API失败: ${error.message}`);
      results.failed++;
      results.errors.push(`履约单列表API: ${error.message}`);
    }

    // 5. 测试创建履约单API
    console.log('\n5. 测试创建履约单API...');
    try {
      const createData = {
        influencerId: "1750373301735826",     // 使用已存在的测试达人
        productId: "1750356112746766717",     // 使用已存在的产品
        planId: "1",                          // 使用已存在的方案
        ownerId: "1001",                      // 使用有效的用户ID
        title: "API测试履约单",
        description: "这是API测试创建的履约单",
        priority: "medium"
      };

      const createResponse = await fetch(`${API_BASE}/fulfillment-records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createData)
      });
      const createResult = await createResponse.json();
      
      if (createResult.success && createResult.data?.id) {
        console.log(`✅ 创建履约单API正常 (ID: ${createResult.data.id})`);
        console.log(`   标题: ${createResult.data.title}`);
        console.log(`   初始状态: ${createResult.data.currentStatus}`);
        results.success++;

        // 6. 测试获取单个履约单API
        console.log('\n6. 测试获取单个履约单API...');
        try {
          const getResponse = await fetch(`${API_BASE}/fulfillment-records/${createResult.data.id}`);
          const getData = await getResponse.json();
          
          if (getData.success && getData.data) {
            console.log(`✅ 获取单个履约单API正常`);
            console.log(`   获取到标题: ${getData.data.title}`);
            console.log(`   关联数据: 达人=${!!getData.data.influencer}, 产品=${!!getData.data.product}`);
            results.success++;
          } else {
            throw new Error(getData.error || '获取履约单详情失败');
          }
        } catch (error) {
          console.log(`❌ 获取单个履约单API失败: ${error.message}`);
          results.failed++;
          results.errors.push(`获取单个履约单API: ${error.message}`);
        }

        // 7. 测试状态更新API
        console.log('\n7. 测试状态更新API...');
        try {
          const statusUpdateData = {
            currentStatus: 'sample_sent',
            remarks: 'API测试状态更新'
          };

          const statusResponse = await fetch(`${API_BASE}/fulfillment-records/${createResult.data.id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(statusUpdateData)
          });
          const statusResult = await statusResponse.json();
          
          if (statusResult.success) {
            console.log(`✅ 状态更新API正常`);
            console.log(`   新状态: ${statusResult.data?.currentStatus}`);
            results.success++;
          } else {
            throw new Error(statusResult.error || '状态更新失败');
          }
        } catch (error) {
          console.log(`❌ 状态更新API失败: ${error.message}`);
          results.failed++;
          results.errors.push(`状态更新API: ${error.message}`);
        }

        // 8. 测试删除API
        console.log('\n8. 测试删除API...');
        try {
          const deleteResponse = await fetch(`${API_BASE}/fulfillment-records/${createResult.data.id}`, {
            method: 'DELETE'
          });
          const deleteResult = await deleteResponse.json();
          
          if (deleteResult.success) {
            console.log(`✅ 删除API正常`);
            console.log(`   ${deleteResult.message}`);
            results.success++;
          } else {
            throw new Error(deleteResult.error || '删除失败');
          }
        } catch (error) {
          console.log(`❌ 删除API失败: ${error.message}`);
          results.failed++;
          results.errors.push(`删除API: ${error.message}`);
        }

      } else {
        throw new Error(createResult.error || '创建履约单失败');
      }
    } catch (error) {
      console.log(`❌ 创建履约单API失败: ${error.message}`);
      results.failed++;
      results.errors.push(`创建履约单API: ${error.message}`);
    }

    // 9. 测试搜索API
    console.log('\n9. 测试搜索API...');
    try {
      const searchResponse = await fetch(`${API_BASE}/fulfillment-records?search=测试`);
      const searchData = await searchResponse.json();
      
      if (searchData.success) {
        console.log(`✅ 搜索API正常 (找到${searchData.data?.length || 0}条记录)`);
        results.success++;
      } else {
        throw new Error(searchData.error || '搜索失败');
      }
    } catch (error) {
      console.log(`❌ 搜索API失败: ${error.message}`);
      results.failed++;
      results.errors.push(`搜索API: ${error.message}`);
    }

    // 10. 测试分页API
    console.log('\n10. 测试分页API...');
    try {
      const pageResponse = await fetch(`${API_BASE}/fulfillment-records?page=1&limit=3`);
      const pageData = await pageResponse.json();
      
      if (pageData.success && pageData.pagination) {
        console.log(`✅ 分页API正常`);
        console.log(`   页面信息: 第${pageData.pagination.page}页，每页${pageData.pagination.limit}条`);
        console.log(`   总计: ${pageData.pagination.total}条，共${pageData.pagination.pages}页`);
        results.success++;
      } else {
        throw new Error(pageData.error || '分页信息缺失');
      }
    } catch (error) {
      console.log(`❌ 分页API失败: ${error.message}`);
      results.failed++;
      results.errors.push(`分页API: ${error.message}`);
    }

  } catch (error) {
    console.error('❌ 测试过程中发生严重错误:', error);
    results.failed++;
    results.errors.push(`严重错误: ${error.message}`);
  }

  // 输出测试总结
  console.log('\n📊 测试总结:');
  console.log(`   成功: ${results.success} 个API`);
  console.log(`   失败: ${results.failed} 个API`);
  console.log(`   成功率: ${Math.round((results.success / (results.success + results.failed)) * 100)}%`);

  if (results.errors.length > 0) {
    console.log('\n❌ 错误详情:');
    results.errors.forEach((error, index) => {
      console.log(`   ${index + 1}. ${error}`);
    });
  }

  console.log('\n🎯 所有履约单API测试完成！');

  return results;
}

// 运行测试
testAllFulfillmentAPIs(); 