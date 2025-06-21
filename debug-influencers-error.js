require('dotenv').config({ path: '.env.local' });

async function debugInfluencersAPI() {
  console.log('🔍 深入分析 Influencers API 错误...\n');

  try {
    // 1. 测试API响应
    const response = await fetch('http://localhost:3000/api/influencers?page=1&limit=2');
    const responseText = await response.text();
    
    console.log('📊 响应状态:', response.status);
    console.log('📋 响应头:', Object.fromEntries(response.headers.entries()));
    console.log('📄 响应内容:', responseText);

    // 2. 尝试解析JSON
    try {
      const data = JSON.parse(responseText);
      console.log('\n✅ JSON解析成功:');
      console.log('成功:', data.success);
      console.log('错误:', data.error);
      console.log('消息:', data.message);
      console.log('详情:', data.details);
    } catch (jsonError) {
      console.log('\n❌ JSON解析失败:', jsonError.message);
    }

    // 3. 检查控制台日志(服务器端)
    console.log('\n🔍 请检查开发服务器控制台的详细错误信息...');

  } catch (error) {
    console.error('💥 请求失败:', error.message);
  }
}

debugInfluencersAPI().catch(console.error); 