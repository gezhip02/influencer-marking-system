// 测试达人编辑API修复
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

// 测试数据
const testInfluencerData = {
  id: "193296151888269312", // 使用错误日志中的ID
  platformId: "193252347378407338", // 使用错误日志中的平台ID
  platformUserId: "natanaelpereira028",
  username: "natanaelpereira028",
  displayName: "测试达人名称",
  avatarUrl: "",
  bio: "测试达人简介",
  whatsappAccount: "16994049690",
  email: "test@example.com",
  phone: "",
  wechat: "",
  telegram: "",
  country: "中国",
  region: "广东",
  city: "深圳",
  timezone: "",
  gender: "female",
  ageRange: "25-34",
  language: "中文",
  followersCount: 1000,
  followingCount: 500,
  totalLikes: 10000,
  totalVideos: 100,
  avgVideoViews: 5000,
  engagementRate: 0.05,
  primaryCategory: "美食",
  contentStyle: null,
  contentLanguage: "中文",
  cooperationOpenness: "high",
  baseCooperationFee: 1000, // 修复：使用数字而不是复杂对象
  cooperationCurrency: "CNY",
  cooperationPreferences: null,
  qualityScore: 85,
  riskLevel: "low",
  blacklistReason: "",
  dataSource: "manual",
  lastDataSync: null,
  dataAccuracy: 0.9,
  platformSpecificData: null,
  notes: "测试备注",
  status: "ACTIVE",
  tagIds: []
};

async function testUpdateInfluencer() {
  try {
    console.log('🧪 开始测试达人更新API...');
    console.log('📤 发送数据:', JSON.stringify(testInfluencerData, null, 2));
    
    const response = await fetch(`${BASE_URL}/api/influencers`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testInfluencerData)
    });

    console.log('📊 响应状态:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ 请求失败:', errorText);
      return;
    }

    const result = await response.json();
    console.log('✅ 更新成功!');
    console.log('📥 返回数据:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    console.error('详细错误:', error);
  }
}

async function testGetInfluencers() {
  try {
    console.log('\n🧪 测试获取达人列表API...');
    
    const response = await fetch(`${BASE_URL}/api/influencers?page=1&limit=5`);
    
    console.log('📊 响应状态:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ 请求失败:', errorText);
      return;
    }

    const result = await response.json();
    console.log('✅ 获取成功!');
    console.log('📥 达人数量:', result.influencers?.length || 0);
    
    if (result.influencers && result.influencers.length > 0) {
      console.log('📋 第一个达人信息:');
      const firstInfluencer = result.influencers[0];
      console.log(`  - ID: ${firstInfluencer.id}`);
      console.log(`  - 用户名: ${firstInfluencer.username}`);
      console.log(`  - 显示名称: ${firstInfluencer.displayName}`);
      console.log(`  - 平台: ${firstInfluencer.platform?.displayName}`);
      console.log(`  - 粉丝数: ${firstInfluencer.followersCount}`);
      console.log(`  - 状态: ${firstInfluencer.status}`);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

async function testGetPlatforms() {
  try {
    console.log('\n🧪 测试获取平台列表API...');
    
    const response = await fetch(`${BASE_URL}/api/platforms`);
    
    console.log('📊 响应状态:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ 请求失败:', errorText);
      return;
    }

    const result = await response.json();
    console.log('✅ 获取成功!');
    console.log('📥 平台数量:', result.length || 0);
    
    if (result && result.length > 0) {
      console.log('📋 可用平台:');
      result.forEach(platform => {
        console.log(`  - ${platform.displayName} (${platform.name}) - ID: ${platform.id}`);
      });
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

// 运行测试
async function runTests() {
  console.log('🚀 开始API测试...\n');
  
  // 首先测试基础API
  await testGetPlatforms();
  await testGetInfluencers();
  
  // 然后测试更新API
  await testUpdateInfluencer();
  
  console.log('\n🏁 测试完成!');
}

// 检查服务器连接
async function checkServer() {
  try {
    const response = await fetch(`${BASE_URL}/api/platforms`, {
      method: 'GET',
      timeout: 5000
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

// 主函数
async function main() {
  console.log('🔍 检查服务器连接...');
  
  const isServerRunning = await checkServer();
  
  if (!isServerRunning) {
    console.error('❌ 服务器未运行或无法连接到 http://localhost:3000');
    console.log('💡 请确保运行了 npm run dev');
    return;
  }
  
  console.log('✅ 服务器连接正常\n');
  await runTests();
}

main().catch(console.error); 