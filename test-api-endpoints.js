#!/usr/bin/env node

// API端点测试脚本
const http = require('http');

console.log('🧪 测试API端点...\n');

function testEndpoint(path, description) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log(`📍 ${description}`);
        console.log(`   URL: http://localhost:3000${path}`);
        console.log(`   状态码: ${res.statusCode}`);
        
        if (res.statusCode === 200) {
          try {
            const jsonData = JSON.parse(data);
            console.log('   响应: ✅ 成功');
            console.log('   数据:', JSON.stringify(jsonData, null, 2));
          } catch (err) {
            console.log('   响应: ✅ 成功 (非JSON)');
            console.log('   数据:', data.substring(0, 200));
          }
        } else {
          console.log('   响应: ❌ 失败');
          console.log('   错误:', data);
        }
        console.log('');
        resolve({ path, status: res.statusCode, data });
      });
    });

    req.on('error', (err) => {
      console.log(`📍 ${description}`);
      console.log(`   URL: http://localhost:3000${path}`);
      console.log('   响应: ❌ 连接失败');
      console.log('   错误:', err.message);
      console.log('');
      reject(err);
    });

    req.end();
  });
}

async function testAllEndpoints() {
  const endpoints = [
    { path: '/', description: '首页' },
    { path: '/api/test-supabase-simple', description: 'Supabase简单测试' },
    { path: '/api/test-supabase', description: 'Supabase完整测试' },
    { path: '/api/users', description: '用户API' },
    { path: '/api/platforms', description: '平台API' },
    { path: '/api/influencers', description: '达人API' }
  ];

  console.log('🚀 开始测试所有API端点...\n');
  
  const results = [];
  
  for (const endpoint of endpoints) {
    try {
      const result = await testEndpoint(endpoint.path, endpoint.description);
      results.push({ ...endpoint, success: true, result });
    } catch (error) {
      results.push({ ...endpoint, success: false, error: error.message });
    }
  }
  
  console.log('📊 测试结果总结:');
  console.log('================');
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ 成功: ${successful.length}`);
  console.log(`❌ 失败: ${failed.length}`);
  console.log(`📍 总计: ${results.length}`);
  
  if (successful.length > 0) {
    console.log('\n✅ 成功的端点:');
    successful.forEach(r => {
      console.log(`   - ${r.path} (${r.description})`);
    });
  }
  
  if (failed.length > 0) {
    console.log('\n❌ 失败的端点:');
    failed.forEach(r => {
      console.log(`   - ${r.path} (${r.description})`);
    });
  }
  
  return results;
}

// 运行测试
testAllEndpoints()
  .then((results) => {
    console.log('\n🎉 API端点测试完成！');
    
    const supabaseTests = results.filter(r => r.path.includes('supabase'));
    if (supabaseTests.length > 0) {
      const workingSupabase = supabaseTests.find(r => r.success && r.result?.status === 200);
      if (workingSupabase) {
        console.log('🚀 Supabase客户端连接正常，可以开始迁移！');
      } else {
        console.log('⚠️ Supabase客户端需要进一步配置');
      }
    }
  })
  .catch((error) => {
    console.error('💥 测试过程出错:', error.message);
  }); 