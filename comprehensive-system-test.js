const axios = require('axios');

const BASE_URL = 'http://localhost:3002';

// 测试配置
const TEST_CONFIG = {
  timeout: 10000,
  maxRetries: 3,
  parallel: true
};

// 测试结果收集
let testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  skipped: 0,
  details: []
};

// 辅助函数
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = {
    info: '📍',
    success: '✅',
    error: '❌',
    warning: '⚠️'
  }[type] || '📍';
  console.log(`${prefix} [${timestamp}] ${message}`);
}

function addTestResult(name, success, message, duration = 0) {
  testResults.total++;
  if (success) {
    testResults.passed++;
  } else {
    testResults.failed++;
  }
  
  testResults.details.push({
    name,
    success,
    message,
    duration: `${duration}ms`
  });
  
  log(`${name}: ${message}`, success ? 'success' : 'error');
}

async function makeRequest(method, url, data = null, retries = 0) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      timeout: TEST_CONFIG.timeout,
      validateStatus: (status) => status < 500 // 允许4xx状态码
    };
    
    if (data) {
      config.data = data;
      config.headers = { 'Content-Type': 'application/json' };
    }
    
    const response = await axios(config);
    return response;
  } catch (error) {
    if (retries < TEST_CONFIG.maxRetries) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return makeRequest(method, url, data, retries + 1);
    }
    throw error;
  }
}

// 1. 服务器连接测试
async function testServerConnection() {
  const start = Date.now();
  try {
    const response = await makeRequest('GET', '/');
    if (response.status === 200) {
      addTestResult('服务器连接', true, '服务器正常响应', Date.now() - start);
      return true;
    } else {
      addTestResult('服务器连接', false, `服务器响应状态: ${response.status}`, Date.now() - start);
      return false;
    }
  } catch (error) {
    addTestResult('服务器连接', false, `连接失败: ${error.message}`, Date.now() - start);
    return false;
  }
}

// 2. 数据库数据验证
async function testDatabaseData() {
  const tests = [
    { name: '达人数据', endpoint: '/api/influencers', minCount: 5 },
    { name: '平台数据', endpoint: '/api/platforms', minCount: 3 },
    { name: '标签数据', endpoint: '/api/tags', minCount: 3 },
    { name: '履约单数据', endpoint: '/api/fulfillment-records', minCount: 10 }
  ];
  
  for (const test of tests) {
    const start = Date.now();
    try {
      const response = await makeRequest('GET', test.endpoint);
      
      if (response.status === 200) {
        const data = response.data;
        const count = Array.isArray(data) ? data.length : 
                     (data.data && Array.isArray(data.data)) ? data.data.length :
                     (data.items && Array.isArray(data.items)) ? data.items.length : 0;
        
        if (count >= test.minCount) {
          addTestResult(`${test.name}验证`, true, `找到 ${count} 条记录`, Date.now() - start);
        } else {
          addTestResult(`${test.name}验证`, false, `仅找到 ${count} 条记录，少于预期的 ${test.minCount} 条`, Date.now() - start);
        }
      } else {
        addTestResult(`${test.name}验证`, false, `API响应错误: ${response.status}`, Date.now() - start);
      }
    } catch (error) {
      addTestResult(`${test.name}验证`, false, `请求失败: ${error.message}`, Date.now() - start);
    }
  }
}

// 3. 达人管理功能测试
async function testInfluencerManagement() {
  const start = Date.now();
  
  try {
    // 获取达人列表
    const response = await makeRequest('GET', '/api/influencers');
    
    if (response.status === 200) {
      const influencers = response.data;
      
      if (influencers && influencers.length > 0) {
        addTestResult('达人列表获取', true, `成功获取 ${influencers.length} 个达人`, Date.now() - start);
        
        // 验证达人数据结构
        const firstInfluencer = influencers[0];
        const requiredFields = ['id', 'displayName', 'followersCount', 'primaryCategory'];
        const missingFields = requiredFields.filter(field => !firstInfluencer.hasOwnProperty(field));
        
        if (missingFields.length === 0) {
          addTestResult('达人数据结构', true, '达人数据结构完整');
        } else {
          addTestResult('达人数据结构', false, `缺少字段: ${missingFields.join(', ')}`);
        }
        
        // 测试批量操作API
        try {
          const batchResponse = await makeRequest('POST', '/api/influencers/batch', {
            action: 'query',
            filters: { primaryCategory: 'beauty' }
          });
          
          if (batchResponse.status === 200) {
            addTestResult('批量查询功能', true, '批量查询接口正常工作');
          } else {
            addTestResult('批量查询功能', false, `批量查询失败: ${batchResponse.status}`);
          }
        } catch (error) {
          addTestResult('批量查询功能', false, `批量查询请求失败: ${error.message}`);
        }
        
      } else {
        addTestResult('达人列表获取', false, '未找到任何达人数据');
      }
    } else {
      addTestResult('达人列表获取', false, `API响应错误: ${response.status}`);
    }
  } catch (error) {
    addTestResult('达人列表获取', false, `请求失败: ${error.message}`);
  }
}

// 4. 标签管理功能测试
async function testTagManagement() {
  const start = Date.now();
  
  try {
    // 获取标签列表
    const response = await makeRequest('GET', '/api/tags');
    
    if (response.status === 200) {
      const tags = response.data;
      
      if (tags && tags.length > 0) {
        addTestResult('标签列表获取', true, `成功获取 ${tags.length} 个标签`, Date.now() - start);
        
        // 验证标签数据结构
        const firstTag = tags[0];
        const requiredFields = ['id', 'name', 'displayName'];
        const missingFields = requiredFields.filter(field => !firstTag.hasOwnProperty(field));
        
        if (missingFields.length === 0) {
          addTestResult('标签数据结构', true, '标签数据结构完整');
        } else {
          addTestResult('标签数据结构', false, `缺少字段: ${missingFields.join(', ')}`);
        }
        
        // 测试标签分类
        const categories = [...new Set(tags.map(tag => tag.category))];
        if (categories.length > 0) {
          addTestResult('标签分类', true, `找到 ${categories.length} 个标签分类: ${categories.join(', ')}`);
        } else {
          addTestResult('标签分类', false, '未找到标签分类');
        }
        
      } else {
        addTestResult('标签列表获取', false, '未找到任何标签数据');
      }
    } else {
      addTestResult('标签列表获取', false, `API响应错误: ${response.status}`);
    }
  } catch (error) {
    addTestResult('标签列表获取', false, `请求失败: ${error.message}`);
  }
}

// 5. 履约单管理功能测试
async function testFulfillmentManagement() {
  const start = Date.now();
  
  try {
    // 获取履约单列表
    const response = await makeRequest('GET', '/api/fulfillment-records');
    
    if (response.status === 200) {
      const result = response.data;
      const records = result.data || result;
      
      if (records && records.length > 0) {
        addTestResult('履约单列表获取', true, `成功获取 ${records.length} 个履约单`, Date.now() - start);
        
        // 验证履约单数据结构
        const firstRecord = records[0];
        const requiredFields = ['id', 'title', 'currentStatus', 'priority'];
        const missingFields = requiredFields.filter(field => !firstRecord.hasOwnProperty(field));
        
        if (missingFields.length === 0) {
          addTestResult('履约单数据结构', true, '履约单数据结构完整');
        } else {
          addTestResult('履约单数据结构', false, `缺少字段: ${missingFields.join(', ')}`);
        }
        
        // 测试单个履约单详情
        const firstRecordId = firstRecord.id;
        try {
          const detailResponse = await makeRequest('GET', `/api/fulfillment-records/${firstRecordId}`);
          
          if (detailResponse.status === 200) {
            addTestResult('履约单详情获取', true, '履约单详情接口正常');
          } else {
            addTestResult('履约单详情获取', false, `详情接口错误: ${detailResponse.status}`);
          }
        } catch (error) {
          addTestResult('履约单详情获取', false, `详情请求失败: ${error.message}`);
        }
        
        // 测试状态更新功能
        try {
          const statusResponse = await makeRequest('PUT', `/api/fulfillment-records/${firstRecordId}/status`, {
            toStatus: firstRecord.currentStatus, // 使用相同状态测试
            changeReason: 'manual_update',
            remarks: '系统测试',
            operatorId: 'test_user'
          });
          
          if (statusResponse.status === 200) {
            addTestResult('状态更新功能', true, '状态更新接口正常');
          } else {
            addTestResult('状态更新功能', false, `状态更新错误: ${statusResponse.status}`);
          }
        } catch (error) {
          addTestResult('状态更新功能', false, `状态更新请求失败: ${error.message}`);
        }
        
        // 测试时效监控
        try {
          const timelinessResponse = await makeRequest('GET', '/api/fulfillment-records/timeliness');
          
          if (timelinessResponse.status === 200) {
            addTestResult('时效监控功能', true, '时效监控接口正常');
          } else {
            addTestResult('时效监控功能', false, `时效监控错误: ${timelinessResponse.status}`);
          }
        } catch (error) {
          addTestResult('时效监控功能', false, `时效监控请求失败: ${error.message}`);
        }
        
      } else {
        addTestResult('履约单列表获取', false, '未找到任何履约单数据');
      }
    } else {
      addTestResult('履约单列表获取', false, `API响应错误: ${response.status}`);
    }
  } catch (error) {
    addTestResult('履约单列表获取', false, `请求失败: ${error.message}`);
  }
}

// 6. 数据关联性测试
async function testDataRelationships() {
  try {
    // 获取所有数据
    const [influencersRes, recordsRes, tagsRes] = await Promise.all([
      makeRequest('GET', '/api/influencers'),
      makeRequest('GET', '/api/fulfillment-records'),
      makeRequest('GET', '/api/fulfillment-record-tags')
    ]);
    
    if (influencersRes.status === 200 && recordsRes.status === 200) {
      const influencers = influencersRes.data;
      const records = recordsRes.data.data || recordsRes.data;
      
      // 检查履约单是否正确关联达人
      let relatedRecords = 0;
      const influencerIds = new Set(influencers.map(inf => inf.id.toString()));
      
      for (const record of records) {
        if (influencerIds.has(record.influencerId?.toString())) {
          relatedRecords++;
        }
      }
      
      if (relatedRecords > 0) {
        addTestResult('达人履约单关联', true, `${relatedRecords}/${records.length} 个履约单正确关联达人`);
      } else {
        addTestResult('达人履约单关联', false, '履约单与达人关联异常');
      }
    }
    
    // 检查标签关联
    if (tagsRes.status === 200) {
      const tagRelations = tagsRes.data;
      if (tagRelations && tagRelations.length > 0) {
        addTestResult('标签关联功能', true, `找到 ${tagRelations.length} 个标签关联`);
      } else {
        addTestResult('标签关联功能', false, '未找到任何标签关联');
      }
    }
    
  } catch (error) {
    addTestResult('数据关联性测试', false, `测试失败: ${error.message}`);
  }
}

// 7. 性能测试
async function testPerformance() {
  const performanceTests = [
    { name: '履约单列表加载', endpoint: '/api/fulfillment-records', expectedTime: 1000 },
    { name: '达人列表加载', endpoint: '/api/influencers', expectedTime: 800 },
    { name: '标签列表加载', endpoint: '/api/tags', expectedTime: 500 }
  ];
  
  for (const test of performanceTests) {
    const start = Date.now();
    try {
      const response = await makeRequest('GET', test.endpoint);
      const duration = Date.now() - start;
      
      if (response.status === 200) {
        if (duration <= test.expectedTime) {
          addTestResult(`${test.name}性能`, true, `响应时间: ${duration}ms (期望: ≤${test.expectedTime}ms)`);
        } else {
          addTestResult(`${test.name}性能`, false, `响应时间: ${duration}ms 超过期望的 ${test.expectedTime}ms`);
        }
      } else {
        addTestResult(`${test.name}性能`, false, `API响应错误: ${response.status}`);
      }
    } catch (error) {
      addTestResult(`${test.name}性能`, false, `请求失败: ${error.message}`);
    }
  }
}

// 8. 错误处理测试
async function testErrorHandling() {
  const errorTests = [
    { name: '不存在的履约单', endpoint: '/api/fulfillment-records/999999', expectedStatus: 404 },
    { name: '不存在的达人', endpoint: '/api/influencers/999999', expectedStatus: 404 },
    { name: '无效的状态更新', endpoint: '/api/fulfillment-records/1/status', method: 'PUT', 
      data: { toStatus: 'invalid_status' }, expectedStatus: 400 }
  ];
  
  for (const test of errorTests) {
    try {
      const response = await makeRequest(test.method || 'GET', test.endpoint, test.data);
      
      if (response.status === test.expectedStatus) {
        addTestResult(`错误处理-${test.name}`, true, `正确返回 ${test.expectedStatus} 状态码`);
      } else {
        addTestResult(`错误处理-${test.name}`, false, `期望 ${test.expectedStatus}，实际 ${response.status}`);
      }
    } catch (error) {
      if (test.expectedStatus >= 400) {
        addTestResult(`错误处理-${test.name}`, true, '正确抛出错误');
      } else {
        addTestResult(`错误处理-${test.name}`, false, `意外错误: ${error.message}`);
      }
    }
  }
}

// 主测试函数
async function runComprehensiveTest() {
  console.log('🚀 开始全面系统测试...\n');
  console.log('='.repeat(60));
  
  const startTime = Date.now();
  
  // 服务器连接测试
  log('正在测试服务器连接...');
  const serverOk = await testServerConnection();
  
  if (!serverOk) {
    log('服务器连接失败，停止测试', 'error');
    return;
  }
  
  console.log();
  
  // 按顺序执行各项测试
  const testSuites = [
    { name: '数据库数据验证', func: testDatabaseData },
    { name: '达人管理功能', func: testInfluencerManagement },
    { name: '标签管理功能', func: testTagManagement },
    { name: '履约单管理功能', func: testFulfillmentManagement },
    { name: '数据关联性测试', func: testDataRelationships },
    { name: '性能测试', func: testPerformance },
    { name: '错误处理测试', func: testErrorHandling }
  ];
  
  for (const suite of testSuites) {
    log(`正在执行 ${suite.name}...`);
    await suite.func();
    console.log();
  }
  
  // 生成测试报告
  const totalTime = Date.now() - startTime;
  const successRate = ((testResults.passed / testResults.total) * 100).toFixed(1);
  
  console.log('='.repeat(60));
  console.log('📊 测试报告');
  console.log('='.repeat(60));
  console.log(`总测试数: ${testResults.total}`);
  console.log(`✅ 通过: ${testResults.passed}`);
  console.log(`❌ 失败: ${testResults.failed}`);
  console.log(`⏭️ 跳过: ${testResults.skipped}`);
  console.log(`📈 成功率: ${successRate}%`);
  console.log(`⏱️ 总耗时: ${totalTime}ms`);
  console.log();
  
  // 详细结果
  console.log('📋 详细结果:');
  console.log('-'.repeat(60));
  testResults.details.forEach((result, index) => {
    const status = result.success ? '✅' : '❌';
    console.log(`${index + 1}. ${status} ${result.name}: ${result.message} (${result.duration})`);
  });
  
  console.log();
  
  // 评估和建议
  if (successRate >= 90) {
    log('🎉 系统状态优秀！所有功能基本正常工作。', 'success');
  } else if (successRate >= 75) {
    log('⚠️ 系统状态良好，但有少数问题需要关注。', 'warning');
  } else if (successRate >= 50) {
    log('⚠️ 系统存在较多问题，建议优先修复失败的功能。', 'warning');
  } else {
    log('❌ 系统存在严重问题，需要立即进行修复。', 'error');
  }
  
  // 失败项目汇总
  const failedTests = testResults.details.filter(r => !r.success);
  if (failedTests.length > 0) {
    console.log();
    console.log('🔧 需要修复的问题:');
    console.log('-'.repeat(60));
    failedTests.forEach((test, index) => {
      console.log(`${index + 1}. ${test.name}: ${test.message}`);
    });
  }
  
  console.log('\n测试完成! 🎯');
}

// 运行测试
runComprehensiveTest()
  .catch((error) => {
    console.error('❌ 测试执行失败:', error);
    process.exit(1);
  }); 