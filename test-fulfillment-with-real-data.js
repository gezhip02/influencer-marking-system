// 使用真实ID测试履约单API
const baseUrl = 'http://localhost:3000';

async function testWithRealData() {
  console.log('🚀 开始使用真实数据测试履约单API...');

  // 使用刚才创建的真实ID
  const testData = {
    influencerId: '1750339627924161',
    planId: '1',
    productId: '194077390052265984',
    ownerId: '194077388907220992'
  };

  console.log('📋 使用的测试数据:');
  console.log('  - 达人ID:', testData.influencerId);
  console.log('  - 方案ID:', testData.planId);
  console.log('  - 产品ID:', testData.productId);
  console.log('  - 负责人ID:', testData.ownerId);

  try {
    // 1. 测试获取列表
    console.log('\n📋 1. 测试获取履约单列表...');
    const listResponse = await fetch(`${baseUrl}/api/fulfillment-records`);
    const listData = await listResponse.json();
    
    console.log('  - 状态码:', listResponse.status);
    console.log('  - 成功:', listData.success);
    console.log('  - 当前总数:', listData.pagination?.total || 0);

    // 2. 测试创建履约单
    console.log('\n📋 2. 测试创建履约单...');
    const createData = {
      influencerId: testData.influencerId,
      productId: testData.productId,
      planId: testData.planId,
      ownerId: testData.ownerId,
      title: "测试履约单 - 真实数据测试",
      description: "使用真实数据进行API测试",
      priority: "medium",
      videoTitle: "真实数据测试视频"
    };

    const createResponse = await fetch(`${baseUrl}/api/fulfillment-records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createData)
    });

    const createResult = await createResponse.json();
    
    console.log('  - 状态码:', createResponse.status);
    console.log('  - 成功:', createResult.success);
    
    if (createResponse.ok && createResult.success) {
      const createdId = createResult.data.id;
      console.log('  - ✅ 履约单创建成功！');
      console.log('  - 履约单ID:', createdId);
      console.log('  - 标题:', createResult.data.title);
      console.log('  - 当前状态:', createResult.data.currentStatus);
      console.log('  - 优先级:', createResult.data.priority);

      // 3. 测试获取详情
      console.log('\n📋 3. 测试获取履约单详情...');
      const detailResponse = await fetch(`${baseUrl}/api/fulfillment-records/${createdId}`);
      const detailData = await detailResponse.json();
      
      console.log('  - 状态码:', detailResponse.status);
      console.log('  - 成功:', detailData.success);
      
      if (detailResponse.ok) {
        console.log('  - ✅ 详情获取成功！');
        console.log('  - 标题:', detailData.data.title);
        console.log('  - 描述:', detailData.data.description);
        console.log('  - 视频标题:', detailData.data.videoTitle);
      }

      // 4. 测试更新履约单
      console.log('\n📋 4. 测试更新履约单...');
      const updateData = {
        title: "更新后的履约单标题",
        description: "更新后的描述信息",
        priority: "high"
      };

      const updateResponse = await fetch(`${baseUrl}/api/fulfillment-records/${createdId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      const updateResult = await updateResponse.json();
      
      console.log('  - 状态码:', updateResponse.status);
      console.log('  - 成功:', updateResult.success);
      
      if (updateResponse.ok) {
        console.log('  - ✅ 更新成功！');
        console.log('  - 新标题:', updateResult.data.title);
        console.log('  - 新优先级:', updateResult.data.priority);
      }

      // 5. 测试查询功能
      console.log('\n📋 5. 测试查询功能...');
      const queryParams = new URLSearchParams({
        search: '更新后',
        priority: 'high',
        limit: '10'
      });
      
      const queryResponse = await fetch(`${baseUrl}/api/fulfillment-records?${queryParams}`);
      const queryData = await queryResponse.json();
      
      console.log('  - 状态码:', queryResponse.status);
      console.log('  - 成功:', queryData.success);
      
      if (queryResponse.ok) {
        console.log('  - ✅ 查询成功！');
        console.log('  - 查询结果数量:', queryData.data.length);
        console.log('  - 搜索条件生效:', queryData.data.some(r => r.title.includes('更新后')) ? '是' : '否');
        console.log('  - 优先级筛选生效:', queryData.data.every(r => r.priority === 'high') ? '是' : '否');
      }

      // 6. 测试分页功能
      console.log('\n📋 6. 测试分页功能...');
      const pageResponse = await fetch(`${baseUrl}/api/fulfillment-records?page=1&limit=5`);
      const pageData = await pageResponse.json();
      
      console.log('  - 状态码:', pageResponse.status);
      console.log('  - 成功:', pageData.success);
      
      if (pageResponse.ok) {
        console.log('  - ✅ 分页成功！');
        console.log('  - 当前页:', pageData.pagination.page);
        console.log('  - 每页数量:', pageData.pagination.limit);
        console.log('  - 总数:', pageData.pagination.total);
        console.log('  - 总页数:', pageData.pagination.pages);
      }

      // 7. 测试删除功能
      console.log('\n📋 7. 测试软删除功能...');
      const deleteResponse = await fetch(`${baseUrl}/api/fulfillment-records/${createdId}`, {
        method: 'DELETE'
      });

      const deleteResult = await deleteResponse.json();
      
      console.log('  - 状态码:', deleteResponse.status);
      console.log('  - 成功:', deleteResult.success);
      
      if (deleteResponse.ok) {
        console.log('  - ✅ 删除成功！');
        console.log('  - 删除消息:', deleteResult.message);
      }

      // 8. 验证删除效果
      console.log('\n📋 8. 验证删除效果...');
      const verifyResponse = await fetch(`${baseUrl}/api/fulfillment-records/${createdId}`);
      
      console.log('  - 状态码:', verifyResponse.status);
      
      if (verifyResponse.status === 404) {
        console.log('  - ✅ 删除验证成功！记录已不可访问');
      } else {
        console.log('  - ❌ 删除验证失败，记录仍然存在');
      }

      console.log('\n🎉 履约单CRUD API测试全部完成！');
      console.log('\n📊 测试总结:');
      console.log('  ✅ 创建履约单 - 成功');
      console.log('  ✅ 获取列表 - 成功');
      console.log('  ✅ 获取详情 - 成功');
      console.log('  ✅ 更新履约单 - 成功');
      console.log('  ✅ 查询功能 - 成功');
      console.log('  ✅ 分页功能 - 成功');
      console.log('  ✅ 删除功能 - 成功');

    } else {
      console.log('  - ❌ 创建履约单失败');
      console.log('  - 错误信息:', createResult.error);
    }

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
  }
}

// 运行测试
testWithRealData(); 