const fetch = require('node-fetch');

// 测试配置
const BASE_URL = 'http://localhost:3000';

// 测试工具函数
async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(`${BASE_URL}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    const data = await response.json();
    
    return {
      status: response.status,
      ok: response.ok,
      data
    };
  } catch (error) {
    console.error(`请求 ${url} 失败:`, error.message);
    return {
      status: 500,
      ok: false,
      data: { error: error.message }
    };
  }
}

// 测试用例
const tests = [
  {
    name: '履约单列表API测试',
    url: '/api/fulfillment-records',
    method: 'GET',
    expectedStatus: 200
  },
  {
    name: '履约单创建API测试',
    url: '/api/fulfillment-records',
    method: 'POST',
    body: {
      title: '测试履约单',
      description: '集成测试用履约单',
      influencerId: '1',
      productId: '1',
      planId: '1',
      priority: 'medium',
      ownerId: '1001'
    },
    expectedStatus: 201
  },
  {
    name: '状态管理API测试',
    url: '/api/fulfillment-records/1/status',
    method: 'GET',
    expectedStatus: 200
  },
  {
    name: '状态转换API测试',
    url: '/api/fulfillment-records/1/status',
    method: 'PUT',
    body: {
      toStatus: 'sample_sent',
      changeReason: 'manual_update',
      remarks: '集成测试状态转换',
      operatorId: '1001'
    },
    expectedStatus: 200
  },
  {
    name: '状态历史API测试',
    url: '/api/fulfillment-records/1/status-logs',
    method: 'GET',
    expectedStatus: 200
  },
  {
    name: '时效监控API测试',
    url: '/api/fulfillment-records/timeliness',
    method: 'GET',
    expectedStatus: 200
  },
  {
    name: '达人列表API测试',
    url: '/api/influencers',
    method: 'GET',
    expectedStatus: 200
  },
  {
    name: '标签列表API测试',
    url: '/api/tags',
    method: 'GET',
    expectedStatus: 200
  },
  {
    name: '平台列表API测试',
    url: '/api/platforms',
    method: 'GET',
    expectedStatus: 200
  }
];

// 执行测试
async function runTests() {
  console.log('🚀 开始Phase 6集成测试...\n');
  
  let passedTests = 0;
  let failedTests = 0;
  
  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];
    console.log(`${i + 1}. ${test.name}`);
    
    const options = {
      method: test.method || 'GET'
    };
    
    if (test.body) {
      options.body = JSON.stringify(test.body);
    }
    
    const result = await makeRequest(test.url, options);
    
    // 验证状态码
    const statusPassed = result.status === test.expectedStatus;
    
    // 验证响应数据结构
    let dataPassed = true;
    if (result.ok && result.data) {
      // 基本数据结构验证
      if (test.method === 'GET' && test.url.includes('/api/fulfillment-records') && !test.url.includes('/status')) {
        dataPassed = result.data.hasOwnProperty('success') || result.data.hasOwnProperty('data');
      }
    }
    
    const testPassed = statusPassed && dataPassed;
    
    if (testPassed) {
      console.log(`   ✅ 通过 (状态: ${result.status})`);
      passedTests++;
    } else {
      console.log(`   ❌ 失败 (状态: ${result.status}, 期望: ${test.expectedStatus})`);
      if (result.data.error) {
        console.log(`      错误: ${result.data.error}`);
      }
      failedTests++;
    }
    
    // 显示部分响应数据
    if (result.ok && result.data) {
      if (result.data.data && Array.isArray(result.data.data)) {
        console.log(`      数据量: ${result.data.data.length} 条记录`);
      } else if (result.data.success !== undefined) {
        console.log(`      成功状态: ${result.data.success}`);
      }
    }
    
    console.log('');
    
    // 延迟，避免请求过快
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // 测试总结
  console.log('📊 测试总结:');
  console.log(`   总测试数: ${tests.length}`);
  console.log(`   通过: ${passedTests} ✅`);
  console.log(`   失败: ${failedTests} ❌`);
  console.log(`   成功率: ${((passedTests / tests.length) * 100).toFixed(1)}%`);
  
  if (failedTests === 0) {
    console.log('\n🎉 所有API接口测试通过！系统集成成功！');
  } else {
    console.log('\n⚠️  部分测试失败，请检查相关API接口。');
  }
}

// 前端功能测试提示
function printFrontendTestGuide() {
  console.log('\n🖥️  前端功能测试指南:');
  console.log('1. 访问 http://localhost:3000 - 主页');
  console.log('2. 访问 http://localhost:3000/fulfillment - 履约单列表');
  console.log('3. 访问 http://localhost:3000/fulfillment/dashboard - 履约仪表板');
  console.log('4. 访问 http://localhost:3000/fulfillment/create - 创建履约单');
  console.log('5. 访问 http://localhost:3000/fulfillment/1 - 履约单详情');
  console.log('\n📋 测试检查点:');
  console.log('   ✓ 页面路由正常跳转');
  console.log('   ✓ 导航菜单显示履约管理入口');
  console.log('   ✓ 权限控制生效（需要登录）');
  console.log('   ✓ 错误页面正常显示');
  console.log('   ✓ 所有组件正常渲染');
  console.log('   ✓ 交互功能正常工作');
}

// 状态流转测试
async function testStatusFlow() {
  console.log('\n🔄 状态流转测试:');
  
  const statusFlow = [
    'pending_sample',
    'sample_sent', 
    'sample_received',
    'content_production',
    'content_review',
    'content_published',
    'settlement_completed'
  ];
  
  for (let i = 0; i < statusFlow.length - 1; i++) {
    const fromStatus = statusFlow[i];
    const toStatus = statusFlow[i + 1];
    
    console.log(`   测试: ${fromStatus} → ${toStatus}`);
    
    const result = await makeRequest('/api/fulfillment-records/1/status', {
      method: 'PUT',
      body: JSON.stringify({
        toStatus: toStatus,
        changeReason: 'manual_update',
        remarks: `状态流转测试: ${fromStatus} → ${toStatus}`,
        operatorId: '1001'
      })
    });
    
    if (result.ok) {
      console.log(`      ✅ 转换成功`);
    } else {
      console.log(`      ❌ 转换失败: ${result.data.error || '未知错误'}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 200));
  }
}

// 时效计算测试
async function testTimelinessCalculation() {
  console.log('\n⏰ 时效计算测试:');
  
  const modes = ['overview', 'overdue', 'stats', 'report'];
  
  for (const mode of modes) {
    console.log(`   测试模式: ${mode}`);
    
    const result = await makeRequest(`/api/fulfillment-records/timeliness?mode=${mode}`);
    
    if (result.ok && result.data.success) {
      console.log(`      ✅ 成功`);
      
      if (result.data.data) {
        if (mode === 'stats' && result.data.data.summary) {
          console.log(`         总记录数: ${result.data.data.summary.totalRecords}`);
          console.log(`         逾期记录: ${result.data.data.summary.overdueCount}`);
        }
      }
    } else {
      console.log(`      ❌ 失败: ${result.data.error || '未知错误'}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

// 主执行函数
async function main() {
  console.log('='.repeat(60));
  console.log('          达人营销履约管理系统 - Phase 6 集成测试');
  console.log('='.repeat(60));
  
  // API接口测试
  await runTests();
  
  // 状态流转测试
  await testStatusFlow();
  
  // 时效计算测试
  await testTimelinessCalculation();
  
  // 前端测试指南
  printFrontendTestGuide();
  
  console.log('\n' + '='.repeat(60));
  console.log('🎯 Phase 6 集成测试完成！');
  console.log('='.repeat(60));
}

// 执行测试
main().catch(console.error); 