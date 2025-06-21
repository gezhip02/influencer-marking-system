require('dotenv').config({ path: '.env.local' });

const BASE_URL = 'http://localhost:3000';

// 测试结果收集
const testResults = {
  success: [],
  failed: [],
  errors: []
};

// 通用测试函数
async function testAPI(name, url, options = {}) {
  console.log(`\n🧪 测试 ${name}...`);
  console.log(`📍 URL: ${url}`);
  
  try {
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      body: options.body ? JSON.stringify(options.body) : undefined
    });

    console.log(`📊 状态码: ${response.status} ${response.statusText}`);

    if (response.ok) {
      const data = await response.json();
      console.log(`✅ ${name} - 成功`);
      console.log(`📋 响应数据概要:`, {
        success: data.success,
        dataType: Array.isArray(data.data) ? `Array(${data.data.length})` : typeof data.data,
        hasStats: !!data.stats,
        hasPagination: !!data.pagination
      });
      
      testResults.success.push({ name, url, status: response.status, data: data });
      return { success: true, data, status: response.status };
    } else {
      const errorText = await response.text();
      console.log(`❌ ${name} - 失败`);
      console.log(`📝 错误信息:`, errorText.substring(0, 200) + '...');
      
      testResults.failed.push({ name, url, status: response.status, error: errorText });
      return { success: false, error: errorText, status: response.status };
    }

  } catch (error) {
    console.log(`💥 ${name} - 网络错误`);
    console.log(`🔍 错误详情:`, error.message);
    
    testResults.errors.push({ name, url, error: error.message });
    return { success: false, error: error.message };
  }
}

async function runComprehensiveAPITest() {
  console.log('🚀 开始全面API测试...');
  console.log('=' .repeat(80));

  // 1. 测试已迁移的API (Supabase)
  console.log('\n📦 第一组：已迁移到Supabase的API');
  console.log('-'.repeat(50));

  await testAPI('Influencers - 获取列表', `${BASE_URL}/api/influencers?page=1&limit=5`);
  await testAPI('Influencers - 搜索', `${BASE_URL}/api/influencers?search=beauty&page=1&limit=3`);
  await testAPI('Tags - 获取列表', `${BASE_URL}/api/tags?page=1&limit=5`);
  await testAPI('Tags - 按分类', `${BASE_URL}/api/tags?category=CONTENT&page=1&limit=3`);

  // 2. 测试基础数据API (Prisma)
  console.log('\n📦 第二组：基础数据API (仍使用Prisma)');
  console.log('-'.repeat(50));

  await testAPI('Platforms - 获取列表', `${BASE_URL}/api/platforms`);
  await testAPI('Products - 获取列表', `${BASE_URL}/api/products`);

  // 3. 测试认证API (Prisma)
  console.log('\n📦 第三组：认证相关API (仍使用Prisma)');
  console.log('-'.repeat(50));

  await testAPI('Users - 获取列表', `${BASE_URL}/api/users`);
  
  // 注意：认证API需要谨慎测试，这里只测试GET
  // await testAPI('Auth - 登录', `${BASE_URL}/api/auth/login`, {
  //   method: 'POST',
  //   body: { email: 'test@test.com', password: 'test123' }
  // });

  // 4. 测试履约相关API (Prisma)
  console.log('\n📦 第四组：履约管理API (仍使用Prisma)');
  console.log('-'.repeat(50));

  await testAPI('Fulfillment Plans - 获取列表', `${BASE_URL}/api/fulfillment-plans`);
  await testAPI('Fulfillment Records - 获取列表', `${BASE_URL}/api/fulfillment-records?page=1&limit=5`);
  await testAPI('Fulfillment Record Tags - 获取列表', `${BASE_URL}/api/fulfillment-record-tags`);

  // 5. 测试批量操作API (Prisma)
  console.log('\n📦 第五组：批量操作API (仍使用Prisma)');
  console.log('-'.repeat(50));

  await testAPI('Influencers Batch - 获取', `${BASE_URL}/api/influencers/batch`);

  // 6. 测试特殊功能API
  console.log('\n📦 第六组：特殊功能API');
  console.log('-'.repeat(50));

  await testAPI('Test Supabase - 连接测试', `${BASE_URL}/api/test-supabase`);
  await testAPI('Test Supabase Simple - 简单测试', `${BASE_URL}/api/test-supabase-simple`);

  // 测试总结
  console.log('\n' + '='.repeat(80));
  console.log('📊 测试结果总结');
  console.log('='.repeat(80));

  console.log(`\n✅ 成功的API: ${testResults.success.length}`);
  testResults.success.forEach(result => {
    console.log(`   ✓ ${result.name} (${result.status})`);
  });

  console.log(`\n❌ 失败的API: ${testResults.failed.length}`);
  testResults.failed.forEach(result => {
    console.log(`   ✗ ${result.name} (${result.status})`);
  });

  console.log(`\n💥 网络错误的API: ${testResults.errors.length}`);
  testResults.errors.forEach(result => {
    console.log(`   ⚠ ${result.name} (${result.error})`);
  });

  // 问题分析
  console.log('\n' + '='.repeat(80));
  console.log('🔍 问题分析');
  console.log('='.repeat(80));

  const prismaErrors = [...testResults.failed, ...testResults.errors].filter(result => 
    result.error && (
      result.error.includes('PrismaClientInitializationError') ||
      result.error.includes('mysql://') ||
      result.error.includes('Can\'t reach database server')
    )
  );

  if (prismaErrors.length > 0) {
    console.log('\n🚨 检测到Prisma相关错误:');
    prismaErrors.forEach(error => {
      console.log(`   • ${error.name}: 需要迁移到Supabase`);
    });
  }

  const networkErrors = testResults.errors.filter(result => 
    result.error.includes('ECONNREFUSED') || result.error.includes('fetch failed')
  );

  if (networkErrors.length > 0) {
    console.log('\n🌐 检测到网络连接错误:');
    networkErrors.forEach(error => {
      console.log(`   • ${error.name}: 开发服务器可能未启动`);
    });
  }

  // 优先级建议
  console.log('\n' + '='.repeat(80));
  console.log('🎯 修复优先级建议');
  console.log('='.repeat(80));

  if (testResults.failed.length > 0 || testResults.errors.length > 0) {
    console.log('\n📋 建议修复顺序:');
    console.log('1. 🔴 高优先级: platforms API (影响关联查询)');
    console.log('2. 🟡 中优先级: users API (影响认证功能)'); 
    console.log('3. 🟠 中优先级: fulfillment-plans API (核心业务功能)');
    console.log('4. 🟢 低优先级: 其他 fulfillment APIs');
    console.log('5. 🔵 可选: products, batch 等辅助功能');
  } else {
    console.log('\n🎉 所有API测试通过！系统运行正常。');
  }
}

// 运行测试
runComprehensiveAPITest().catch(console.error); 