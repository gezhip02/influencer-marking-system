// 测试创建履约单相关的API
const BASE_URL = 'http://localhost:3000';

async function testAPIs() {
  console.log('🧪 测试创建履约单相关API...\n');

  // 测试达人API
  console.log('1. 测试达人API (/api/influencers)');
  try {
    const response = await fetch(`${BASE_URL}/api/influencers`);
    const result = await response.json();
    
    if (result.success && result.data && result.data.items) {
      console.log(`✅ 成功获取 ${result.data.items.length} 位达人`);
      console.log('达人样例:');
      console.log(JSON.stringify(result.data.items.slice(0, 2), null, 2));
    } else {
      console.log('❌ 达人API失败:', result);
    }
  } catch (error) {
    console.log('❌ 达人API请求失败:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // 测试产品API
  console.log('2. 测试产品API (/api/products)');
  try {
    const response = await fetch(`${BASE_URL}/api/products`);
    const result = await response.json();
    
    if (result.success && result.data) {
      console.log(`✅ 成功获取 ${result.data.length} 个产品`);
      console.log('产品样例:');
      console.log(JSON.stringify(result.data.slice(0, 2), null, 2));
    } else {
      console.log('❌ 产品API失败:', result);
    }
  } catch (error) {
    console.log('❌ 产品API请求失败:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // 测试履约方案API
  console.log('3. 测试履约方案API (/api/fulfillment-plans)');
  try {
    const response = await fetch(`${BASE_URL}/api/fulfillment-plans`);
    const result = await response.json();
    
    if (result.success && result.data) {
      console.log(`✅ 成功获取 ${result.data.length} 个履约方案`);
      console.log('履约方案样例:');
      console.log(JSON.stringify(result.data.slice(0, 2), null, 2));
    } else {
      console.log('❌ 履约方案API失败:', result);
    }
  } catch (error) {
    console.log('❌ 履约方案API请求失败:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // 测试创建履约单API (模拟数据)
  console.log('4. 测试创建履约单API (/api/fulfillment-records)');
  const testData = {
    influencerId: "1750356112649834388", // 美妆小仙女Lily
    productId: "1750356112746766717",    // 兰蔻小黑瓶精华套装
    planId: "1",                         // 达人自制短视频寄样品
    ownerId: "1001"                      // 负责人
  };

  try {
    const response = await fetch(`${BASE_URL}/api/fulfillment-records`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    const result = await response.json();
    
    if (result.success && result.data) {
      console.log('✅ 成功创建履约单');
      console.log('创建结果:');
      console.log(JSON.stringify(result.data, null, 2));
    } else {
      console.log('❌ 创建履约单失败:', result);
    }
  } catch (error) {
    console.log('❌ 创建履约单请求失败:', error.message);
  }

  console.log('\n🎉 API测试完成!');
}

// 使用node-fetch进行HTTP请求
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

testAPIs().catch(console.error); 