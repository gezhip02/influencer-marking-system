const axios = require('axios');

const BASE_URL = 'http://localhost:3002';

async function testFulfillmentFeatures() {
  console.log('🔍 开始测试履约管理功能...\n');

  try {
    // 1. 测试获取履约单列表
    console.log('1. 测试获取履约单列表...');
    const response = await axios.get(`${BASE_URL}/api/fulfillment-records`);
    console.log(`✅ 成功获取履约单列表，共 ${response.data.data?.length || 0} 条记录\n`);

    // 2. 如果有履约单，测试单个履约单操作
    if (response.data.data && response.data.data.length > 0) {
      const firstRecord = response.data.data[0];
      console.log(`2. 测试履约单详情 (ID: ${firstRecord.id})...`);
      
      try {
        const detailResponse = await axios.get(`${BASE_URL}/api/fulfillment-records/${firstRecord.id}`);
        console.log(`✅ 成功获取履约单详情\n`);
      } catch (error) {
        console.log(`❌ 获取履约单详情失败: ${error.response?.data?.error || error.message}\n`);
      }

      // 3. 测试状态更新
      console.log(`3. 测试状态更新 (ID: ${firstRecord.id})...`);
      try {
        const statusResponse = await axios.put(`${BASE_URL}/api/fulfillment-records/${firstRecord.id}/status`, {
          toStatus: firstRecord.currentStatus, // 使用正确的字段名
          changeReason: 'manual_update',
          remarks: '测试状态更新',
          operatorId: 'test_user'
        });
        console.log(`✅ 状态更新测试成功\n`);
      } catch (error) {
        console.log(`❌ 状态更新测试失败: ${error.response?.data?.error || error.message}\n`);
      }

      // 4. 测试状态历史
      console.log(`4. 测试状态历史 (ID: ${firstRecord.id})...`);
      try {
        const historyResponse = await axios.get(`${BASE_URL}/api/fulfillment-records/${firstRecord.id}/status-logs`);
        console.log(`✅ 成功获取状态历史，共 ${historyResponse.data.data?.length || 0} 条记录\n`);
      } catch (error) {
        console.log(`❌ 获取状态历史失败: ${error.response?.data?.error || error.message}\n`);
      }
    }

    // 5. 测试时效监控
    console.log('5. 测试时效监控...');
    try {
      const timelinessResponse = await axios.get(`${BASE_URL}/api/fulfillment-records/timeliness`);
      console.log(`✅ 时效监控测试成功\n`);
    } catch (error) {
      console.log(`❌ 时效监控测试失败: ${error.response?.data?.error || error.message}\n`);
    }

    console.log('🎉 履约管理功能测试完成！');

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 提示: 请确保开发服务器正在运行 (npm run dev)');
    }
  }
}

// 运行测试
testFulfillmentFeatures(); 