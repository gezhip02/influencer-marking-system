const https = require('http');

async function testAPI(url, name) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          console.log(`✅ ${name}: 成功`);
          if (json.data && Array.isArray(json.data)) {
            console.log(`   返回 ${json.data.length} 条记录`);
          } else if (json.pagination) {
            console.log(`   第${json.pagination.page}页，共${json.pagination.total}条记录`);
          }
          resolve(json);
        } catch (error) {
          console.log(`❌ ${name}: JSON解析失败`, error.message);
          console.log('原始响应:', data);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.log(`❌ ${name}: 请求失败`, error.message);
      reject(error);
    });

    req.setTimeout(5000, () => {
      console.log(`❌ ${name}: 请求超时`);
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

async function runTests() {
  console.log('🧪 开始测试API接口...\n');

  const tests = [
    { url: 'http://localhost:3000/api/platforms', name: '平台列表' },
    { url: 'http://localhost:3000/api/tags', name: '标签列表' },
    { url: 'http://localhost:3000/api/tags?page=1&limit=3', name: '标签列表(分页)' },
    { url: 'http://localhost:3000/api/influencers', name: '达人列表' },
    { url: 'http://localhost:3000/api/influencers?page=1&limit=2', name: '达人列表(分页)' },
    { url: 'http://localhost:3000/api/fulfillment-records', name: '履约记录列表' },
    { url: 'http://localhost:3000/api/fulfillment-record-tags', name: '履约记录标签列表' }
  ];

  for (const test of tests) {
    try {
      await testAPI(test.url, test.name);
    } catch (error) {
      // 错误已在testAPI中处理
    }
    console.log(); // 空行
  }

  console.log('🎉 API接口测试完成！');
}

runTests().catch(console.error); 