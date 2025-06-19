const testInfluencers = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/influencers');
    const data = await response.json();
    console.log('📊 达人数据检查:');
    
    if (data.success && data.data.length > 0) {
      console.log(`总共 ${data.data.length} 个达人`);
      
      // 检查前3个达人的数据
      data.data.slice(0, 3).forEach((influencer, index) => {
        console.log(`\n达人 ${index + 1}:`);
        console.log('  姓名:', influencer.displayName);
        console.log('  engagementRate:', influencer.engagementRate, typeof influencer.engagementRate);
        console.log('  followersCount:', influencer.followersCount, typeof influencer.followersCount);
        console.log('  recentROI:', influencer.recentROI, typeof influencer.recentROI);
        
        // 检查是否有null/undefined值
        if (influencer.engagementRate === null || influencer.engagementRate === undefined) {
          console.log('  ⚠️  engagementRate 为 null/undefined!');
        }
        if (influencer.recentROI === null || influencer.recentROI === undefined) {
          console.log('  ⚠️  recentROI 为 null/undefined!');
        }
      });
      
      // 统计null值
      const nullEngagementCount = data.data.filter(i => i.engagementRate === null || i.engagementRate === undefined).length;
      const nullROICount = data.data.filter(i => i.recentROI === null || i.recentROI === undefined).length;
      
      console.log(`\n📈 数据质量统计:`);
      console.log(`  engagementRate 为 null: ${nullEngagementCount}/${data.data.length}`);
      console.log(`  recentROI 为 null: ${nullROICount}/${data.data.length}`);
      
    } else {
      console.log('API返回数据异常:', data);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
};

testInfluencers(); 