const API_BASE = 'http://localhost:3000/api';

async function testCreateFulfillment() {
  console.log('🧪 测试创建履约单...\n');

  try {
    // 1. 先测试获取方案
    console.log('1. 获取履约方案...');
    const plansResponse = await fetch(`${API_BASE}/fulfillment-plans`);
    const plansData = await plansResponse.json();
    
    if (!plansData.success || !plansData.data?.length) {
      throw new Error('无法获取履约方案');
    }
    
    console.log(`✅ 获取到 ${plansData.data.length} 个方案`);
    const plan = plansData.data[0]; // 使用第一个方案
    console.log(`   选择方案: ${plan.planName} (ID: ${plan.id})`);

    // 2. 获取达人
    console.log('\n2. 获取达人列表...');
    const influencersResponse = await fetch(`${API_BASE}/influencers?page=1&limit=5`);
    const influencersData = await influencersResponse.json();
    
    if (!influencersData.success || !influencersData.data?.items?.length) {
      throw new Error('无法获取达人列表');
    }
    
    console.log(`✅ 获取到 ${influencersData.data.items.length} 个达人`);
    const influencer = influencersData.data.items[0]; // 使用第一个达人
    console.log(`   选择达人: ${influencer.displayName || influencer.name} (ID: ${influencer.id})`);

    // 3. 获取产品
    console.log('\n3. 获取产品列表...');
    const productsResponse = await fetch(`${API_BASE}/products?page=1&limit=5`);
    const productsData = await productsResponse.json();
    
    if (!productsData.success || !productsData.data?.length) {
      throw new Error('无法获取产品列表');
    }
    
    console.log(`✅ 获取到 ${productsData.data.length} 个产品`);
    const product = productsData.data[0]; // 使用第一个产品
    console.log(`   选择产品: ${product.name} (ID: ${product.id})`);

    // 4. 创建履约单
    console.log('\n4. 创建履约单...');
    const createData = {
      title: `${influencer.displayName || influencer.name} × ${product.name} 合作`,
      description: `${plan.planName} - 测试创建`,
      influencerId: influencer.id,
      productId: product.id,
      planId: plan.id,
      ownerId: "1001",
      priority: "medium",
      currentStatus: plan.initialStatus || "pending_sample"
    };

    console.log('   提交数据:', JSON.stringify(createData, null, 2));

    const createResponse = await fetch(`${API_BASE}/fulfillment-records`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(createData),
    });

    console.log(`   响应状态: ${createResponse.status}`);
    
    const responseText = await createResponse.text();
    console.log(`   响应内容: ${responseText.substring(0, 200)}...`);

    let createResult;
    try {
      createResult = JSON.parse(responseText);
    } catch (e) {
      throw new Error(`响应不是有效的JSON: ${responseText}`);
    }

    if (!createResponse.ok) {
      throw new Error(`HTTP ${createResponse.status}: ${createResult.error || '请求失败'}`);
    }

    if (createResult.success && createResult.data?.id) {
      console.log(`✅ 履约单创建成功!`);
      console.log(`   ID: ${createResult.data.id}`);
      console.log(`   标题: ${createResult.data.title}`);
      console.log(`   状态: ${createResult.data.currentStatus}`);
      return createResult.data;
    } else {
      throw new Error(createResult.error || '创建失败，但没有错误信息');
    }

  } catch (error) {
    console.error('❌ 创建履约单失败:', error.message);
    console.error('   详细错误:', error);
    throw error;
  }
}

// 运行测试
testCreateFulfillment()
  .then(result => {
    console.log('\n🎉 测试完成，创建成功！');
  })
  .catch(error => {
    console.log('\n💥 测试失败');
    process.exit(1);
  }); 