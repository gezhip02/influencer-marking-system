// 测试标签API
const fetch = require('node-fetch');

async function testTagsAPI() {
  try {
    console.log('🏷️  测试标签API...');
    
    const response = await fetch('http://localhost:3000/api/tags');
    console.log('✅ 响应状态:', response.status);
    
    const data = await response.json();
    console.log('✅ 响应成功:', data.success);
    
    if (data.success) {
      console.log('📊 数据字段:', Object.keys(data));
      
      if (data.data) {
        console.log('📊 标签数组长度:', data.data.length);
        if (data.data.length > 0) {
          console.log('📋 第一个标签:', data.data[0]);
        }
      } else if (data.tags) {
        console.log('📊 标签数组长度:', data.tags.length);
        if (data.tags.length > 0) {
          console.log('📋 第一个标签:', data.tags[0]);
        }
      } else {
        console.log('⚠️  没有找到标签数据字段');
        console.log('完整响应:', JSON.stringify(data, null, 2));
      }
    } else {
      console.log('❌ API返回失败:', data.message || data.error);
    }
    
  } catch (error) {
    console.log('❌ 请求失败:', error.message);
  }
}

testTagsAPI(); 