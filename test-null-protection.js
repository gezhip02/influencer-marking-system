// 测试null值防护
console.log('🛡️ 测试null值防护...\n');

// 模拟包含null值的达人数据
const testInfluencers = [
  {
    id: '1',
    displayName: '正常达人',
    engagementRate: 8.5,
    followersCount: 1350000,
    recentROI: 15.2
  },
  {
    id: '2', 
    displayName: '有null值的达人',
    engagementRate: null,
    followersCount: 950000,
    recentROI: undefined
  }
];

console.log('📊 测试数据处理逻辑:');

testInfluencers.forEach((influencer, index) => {
  console.log(`\n达人 ${index + 1}: ${influencer.displayName}`);
  
  // 测试原始逻辑（会报错）
  try {
    const oldResult = influencer.engagementRate.toFixed(1);
    console.log(`  原始逻辑: ${oldResult}% ✅`);
  } catch (error) {
    console.log(`  原始逻辑: 报错 - ${error.message} ❌`);
  }
  
  // 测试修复后的逻辑
  try {
    const newResult = influencer.engagementRate ? influencer.engagementRate.toFixed(1) : '0.0';
    console.log(`  修复逻辑: ${newResult}% ✅`);
  } catch (error) {
    console.log(`  修复逻辑: 报错 - ${error.message} ❌`);
  }
  
  // 测试空值合并逻辑
  try {
    const safeValue = (influencer.engagementRate ?? 0).toFixed(1);
    console.log(`  空值合并: ${safeValue}% ✅`);
  } catch (error) {
    console.log(`  空值合并: 报错 - ${error.message} ❌`);
  }
});

console.log('\n🔧 数据处理函数测试:');

// 模拟修复后的数据处理函数
const processInfluencerData = (rawData) => {
  return rawData.map(influencer => ({
    ...influencer,
    engagementRate: influencer.engagementRate ?? 0,
    followersCount: influencer.followersCount ?? 0,
    recentROI: influencer.recentROI ?? 0
  }));
};

const processedData = processInfluencerData(testInfluencers);

processedData.forEach((influencer, index) => {
  console.log(`\n处理后的达人 ${index + 1}:`);
  console.log(`  engagementRate: ${influencer.engagementRate.toFixed(1)}% ✅`);
  console.log(`  recentROI: ${influencer.recentROI.toFixed(1)}% ✅`);
});

console.log('\n✅ null值防护测试完成！');

console.log('\n📋 修复总结:');
console.log('  1. 在数据获取时使用空值合并(??)设置默认值');
console.log('  2. 在渲染时使用条件判断(?:)提供fallback');
console.log('  3. 确保所有数值字段都有默认值0');
console.log('  4. 避免在null/undefined上调用toFixed()'); 