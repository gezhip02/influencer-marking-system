// 快速API测试
async function quickTest() {
  console.log('🚀 快速API测试开始...\n');
  
  const BASE_URL = 'http://localhost:3000/api';
  
  // 简单的API测试函数
  async function testAPI(endpoint, method = 'GET', body = null) {
    try {
      const options = {
        method,
        headers: { 'Content-Type': 'application/json' }
      };
      
      if (body) {
        options.body = JSON.stringify(body);
      }
      
      const response = await fetch(`${BASE_URL}${endpoint}`, options);
      const text = await response.text();
      
      console.log(`${method} ${endpoint}: ${response.status}`);
      
      if (response.status >= 200 && response.status < 300) {
        try {
          const data = JSON.parse(text);
          console.log('✅ 成功:', data.success ? '是' : '否');
          if (data.data && Array.isArray(data.data)) {
            console.log(`   数据条数: ${data.data.length}`);
          }
        } catch (e) {
          console.log('⚠️  非JSON响应 (可能是HTML)');
        }
      } else {
        console.log('❌ 失败:', text.substring(0, 100));
      }
      
      console.log('');
      return response.status >= 200 && response.status < 300;
    } catch (error) {
      console.log(`❌ 错误:`, error.message);
      console.log('');
      return false;
    }
  }
  
  // 测试各个API
  console.log('📝 测试平台API:');
  await testAPI('/platforms');
  
  console.log('📝 测试标签API:');
  await testAPI('/tags');
  
  console.log('📝 测试达人API:');
  await testAPI('/influencers');
  
  console.log('📝 测试履约记录API:');
  await testAPI('/fulfillment-records');
  
  console.log('📝 测试履约记录标签API:');
  await testAPI('/fulfillment-record-tags');
  
  console.log('📝 测试批量导出API:');
  await testAPI('/influencers/batch', 'POST', {
    action: 'export',
    format: 'json',
    filters: { limit: 2 }
  });
  
  console.log('✅ 快速测试完成!');
}

// 等待3秒再运行测试，确保服务器启动
setTimeout(quickTest, 3000); 