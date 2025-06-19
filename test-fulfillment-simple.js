// 简化的履约单API测试，使用硬编码ID
const baseUrl = 'http://localhost:3000';

async function testFulfillmentSimple() {
  console.log('🚀 开始简化履约单API测试...');

  try {
    // 1. 测试获取履约单列表
    console.log('\n📋 1. 测试获取履约单列表...');
    const listResponse = await fetch(`${baseUrl}/api/fulfillment-records`);
    const listData = await listResponse.json();
    
    console.log('列表API状态:', listResponse.status);
    console.log('列表API响应:', JSON.stringify(listData, null, 2));

    // 2. 测试创建履约单（使用已知的种子数据ID）
    console.log('\n📋 2. 测试创建履约单...');
    const createData = {
      influencerId: "194038555025084416", // 使用现有的达人ID
      productId: "194032038792052736",    // 使用种子数据中的产品ID  
      planId: "194032038700081152",       // 使用种子数据中的履约方案ID
      ownerId: "194032038654943232",      // 使用种子数据中的用户ID
      title: "测试履约单",
      description: "API测试描述",
      priority: "medium",
      videoTitle: "测试视频标题"
    };

    const createResponse = await fetch(`${baseUrl}/api/fulfillment-records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createData)
    });

    const createResult = await createResponse.json();
    
    console.log('创建API状态:', createResponse.status);
    console.log('创建API响应:', JSON.stringify(createResult, null, 2));

    if (createResponse.ok && createResult.success) {
      const createdId = createResult.data.id;
      console.log('✅ 创建成功，履约单ID:', createdId);

      // 3. 测试获取详情
      console.log('\n📋 3. 测试获取履约单详情...');
      const detailResponse = await fetch(`${baseUrl}/api/fulfillment-records/${createdId}`);
      const detailData = await detailResponse.json();
      
      console.log('详情API状态:', detailResponse.status);
      console.log('详情API响应:', JSON.stringify(detailData, null, 2));

      // 4. 测试更新
      console.log('\n📋 4. 测试更新履约单...');
      const updateData = {
        title: "更新的标题",
        priority: "high"
      };

      const updateResponse = await fetch(`${baseUrl}/api/fulfillment-records/${createdId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      const updateResult = await updateResponse.json();
      
      console.log('更新API状态:', updateResponse.status);
      console.log('更新API响应:', JSON.stringify(updateResult, null, 2));

      // 5. 测试删除
      console.log('\n📋 5. 测试删除履约单...');
      const deleteResponse = await fetch(`${baseUrl}/api/fulfillment-records/${createdId}`, {
        method: 'DELETE'
      });

      const deleteResult = await deleteResponse.json();
      
      console.log('删除API状态:', deleteResponse.status);
      console.log('删除API响应:', JSON.stringify(deleteResult, null, 2));

    } else {
      console.log('❌ 创建失败，跳过后续测试');
    }

    console.log('\n🎉 简化测试完成！');

  } catch (error) {
    console.error('❌ 测试错误:', error.message);
  }
}

// 运行测试
testFulfillmentSimple(); 