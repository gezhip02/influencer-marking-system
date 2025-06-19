const axios = require('axios');

const BASE_URL = 'http://localhost:3002';

async function testSpecificAPIs() {
  console.log('🧪 测试特定API功能...\n');

  // 1. 测试标签API
  console.log('🏷️ 测试标签API...');
  try {
    const response = await axios.get(`${BASE_URL}/api/tags`);
    if (response.status === 200) {
      const data = response.data;
      console.log(`✅ 标签API正常: 找到 ${data.data?.length || 0} 个标签`);
      if (data.data && data.data.length > 0) {
        console.log(`  示例标签: ${data.data[0].name} (${data.data[0].category})`);
      }
    } else {
      console.log(`❌ 标签API异常: ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ 标签API错误: ${error.message}`);
  }
  console.log();

  // 2. 测试达人API
  console.log('👥 测试达人API...');
  try {
    const response = await axios.get(`${BASE_URL}/api/influencers`);
    if (response.status === 200) {
      const data = response.data;
      const influencers = data.data?.items || [];
      console.log(`✅ 达人API正常: 找到 ${influencers.length} 个达人`);
      console.log(`  API响应格式: success=${data.success}, 总数=${data.data?.total || 0}`);
      if (influencers.length > 0) {
        console.log(`  示例达人: ${influencers[0].displayName} (${influencers[0].followersCount} 粉丝)`);
      }
    } else {
      console.log(`❌ 达人API异常: ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ 达人API错误: ${error.message}`);
  }
  console.log();

  // 3. 测试平台API
  console.log('📱 测试平台API...');
  try {
    const response = await axios.get(`${BASE_URL}/api/platforms`);
    if (response.status === 200) {
      const data = response.data;
      const platforms = data.platforms || [];
      console.log(`✅ 平台API正常: 找到 ${platforms.length} 个平台`);
      console.log(`  API响应格式: success=${data.success}`);
      if (platforms.length > 0) {
        console.log(`  示例平台: ${platforms[0].displayName}`);
      }
    } else {
      console.log(`❌ 平台API异常: ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ 平台API错误: ${error.message}`);
  }
  console.log();

  // 4. 测试履约单状态更新
  console.log('📋 测试履约单状态更新...');
  try {
    // 先获取一个履约单
    const listResponse = await axios.get(`${BASE_URL}/api/fulfillment-records`);
    
    if (listResponse.status === 200) {
      const data = listResponse.data;
      const records = data.data || [];
      console.log(`✅ 履约单API正常: 找到 ${records.length} 个履约单`);
      console.log(`  API响应格式: success=${data.success}, 总数=${data.pagination?.total || 0}`);
      
      if (records.length > 0) {
        const firstRecord = records[0];
        console.log(`  测试履约单: ${firstRecord.id} (当前状态: ${firstRecord.currentStatus})`);
        
        // 尝试状态更新
        const updateResponse = await axios.put(
          `${BASE_URL}/api/fulfillment-records/${firstRecord.id}/status`,
          {
            toStatus: 'sample_sent',
            notes: '测试状态更新'
          },
          {
            validateStatus: () => true // 接受所有状态码
          }
        );
        
        if (updateResponse.status === 200) {
          console.log(`✅ 状态更新成功: ${updateResponse.data.message || '状态已更新'}`);
        } else {
          console.log(`❌ 状态更新失败 (${updateResponse.status}): ${updateResponse.data.error || updateResponse.data.message || '未知错误'}`);
          console.log(`  详细错误: ${JSON.stringify(updateResponse.data, null, 2)}`);
        }
      } else {
        console.log(`❌ 没有找到履约单进行状态更新测试`);
      }
    } else {
      console.log(`❌ 无法获取履约单列表: ${listResponse.status}`);
    }
  } catch (error) {
    console.log(`❌ 状态更新测试错误: ${error.message}`);
  }
  console.log();

  // 5. 直接测试数据库连接
  console.log('🗄️ 测试数据库数据...');
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  
  try {
    const [tagCount, influencerCount, platformCount, fulfillmentCount] = await Promise.all([
      prisma.tag.count({ where: { status: 1 } }),
      prisma.influencer.count({ where: { status: 1 } }),
      prisma.platform.count({ where: { status: 1 } }),
      prisma.fulfillmentRecord.count({ where: { status: 1 } })
    ]);
    
    console.log(`✅ 数据库直接查询结果:`);
    console.log(`  标签数量: ${tagCount}`);
    console.log(`  达人数量: ${influencerCount}`);
    console.log(`  平台数量: ${platformCount}`);
    console.log(`  履约单数量: ${fulfillmentCount}`);
    
    await prisma.$disconnect();
  } catch (error) {
    console.log(`❌ 数据库查询错误: ${error.message}`);
  }

  console.log('\n🎯 特定API测试完成!');
}

// 运行测试
testSpecificAPIs()
  .catch((error) => {
    console.error('❌ 测试执行失败:', error);
    process.exit(1);
  }); 