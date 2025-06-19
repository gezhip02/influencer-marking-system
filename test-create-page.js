// 测试履约单创建页面功能
console.log('🧪 测试履约单创建页面...\n');

const testCreatePage = async () => {
  try {
    // 1. 测试达人API
    console.log('1. 测试达人API...');
    const influencerResponse = await fetch('http://localhost:3000/api/influencers');
    const influencerData = await influencerResponse.json();
    
    if (influencerData.success) {
      console.log(`✅ 达人API正常，获取到 ${influencerData.data.items.length} 个达人`);
      
      // 检查数据质量
      const sample = influencerData.data.items[0];
      console.log('📊 样本数据:');
      console.log(`   姓名: ${sample.displayName}`);
      console.log(`   engagementRate: ${sample.engagementRate} (${typeof sample.engagementRate})`);
      console.log(`   followersCount: ${sample.followersCount} (${typeof sample.followersCount})`);
      
      // 检查null值
      const nullEngagement = influencerData.data.items.filter(i => i.engagementRate === null || i.engagementRate === undefined);
      console.log(`   含null的engagementRate: ${nullEngagement.length}/${influencerData.data.items.length}`);
      
    } else {
      console.log('❌ 达人API异常:', influencerData.error);
    }

    // 2. 测试产品API
    console.log('\n2. 测试产品API...');
    const productResponse = await fetch('http://localhost:3000/api/products');
    const productData = await productResponse.json();
    
    if (productData.success) {
      console.log(`✅ 产品API正常，获取到 ${productData.data.length} 个产品`);
    } else {
      console.log('❌ 产品API异常:', productData.error);
    }

    // 3. 测试履约方案API
    console.log('\n3. 测试履约方案API...');
    const planResponse = await fetch('http://localhost:3000/api/fulfillment-plans');
    const planData = await planResponse.json();
    
    if (planData.success) {
      console.log(`✅ 履约方案API正常，获取到 ${planData.data.length} 个方案`);
    } else {
      console.log('❌ 履约方案API异常:', planData.error);
    }

    console.log('\n📋 测试总结:');
    const allSuccess = influencerData.success && productData.success && planData.success;
    if (allSuccess) {
      console.log('✅ 所有API都正常，创建页面应该可以正常加载');
    } else {
      console.log('❌ 部分API异常，可能影响创建页面功能');
    }

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
};

testCreatePage(); 