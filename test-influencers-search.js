async function testInfluencersSearch() {
  console.log('🔍 测试 Influencers 搜索功能...\n');

  const testCases = [
    {
      name: '基本列表',
      url: 'http://localhost:3000/api/influencers?page=1&limit=2'
    },
    {
      name: '搜索 "beauty"',
      url: 'http://localhost:3000/api/influencers?search=beauty&page=1&limit=3'
    },
    {
      name: '搜索 "tech"',
      url: 'http://localhost:3000/api/influencers?search=tech&page=1&limit=3'
    },
    {
      name: '搜索 "queen"',
      url: 'http://localhost:3000/api/influencers?search=queen&page=1&limit=3'
    }
  ];

  for (const testCase of testCases) {
    console.log(`🧪 测试: ${testCase.name}`);
    console.log(`📍 URL: ${testCase.url}`);

    try {
      const response = await fetch(testCase.url);
      console.log(`📊 状态码: ${response.status} ${response.statusText}`);

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${testCase.name} - 成功`);
        console.log(`📋 结果:`, {
          success: data.success,
          itemCount: data.data?.items?.length || 0,
          total: data.data?.total || 0,
          stats: data.stats,
          firstItem: data.data?.items?.[0] ? {
            username: data.data.items[0].username,
            displayName: data.data.items[0].displayName,
            followersCount: data.data.items[0].followersCount
          } : null
        });
      } else {
        const errorText = await response.text();
        console.log(`❌ ${testCase.name} - 失败`);
        console.log(`📝 错误信息:`, errorText.substring(0, 200) + '...');
      }
    } catch (error) {
      console.log(`💥 ${testCase.name} - 网络错误`);
      console.log(`🔍 错误详情:`, error.message);
    }
    console.log('-'.repeat(50));
  }
}

testInfluencersSearch().catch(console.error); 