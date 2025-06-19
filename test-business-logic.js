/**
 * 核心业务逻辑测试脚本
 * 测试状态流转引擎和时效监控系统
 */

const BASE_URL = 'http://localhost:3000';

// 测试数据
const testCases = [
  {
    name: '状态信息查询',
    method: 'GET',
    url: `${BASE_URL}/api/fulfillment-records/1/status`,
    description: '获取履约单状态信息和可转换状态列表'
  },
  {
    name: '状态转换 - 正常流转',
    method: 'PUT',
    url: `${BASE_URL}/api/fulfillment-records/1/status`,
    body: {
      toStatus: 'sample_sent',
      changeReason: 'manual_update',
      remarks: '样品已通过快递寄出',
      operatorId: '1001'
    },
    description: '测试正常的状态流转：从待寄样到样品已寄出'
  },
  {
    name: '状态转换 - 非法流转',
    method: 'PUT',
    url: `${BASE_URL}/api/fulfillment-records/1/status`,
    body: {
      toStatus: 'settlement_completed',
      changeReason: 'manual_update',
      operatorId: '1001'
    },
    description: '测试非法状态流转：从待寄样直接跳转到结算完成'
  },
  {
    name: '状态转换 - 强制流转',
    method: 'PUT',
    url: `${BASE_URL}/api/fulfillment-records/1/status`,
    body: {
      toStatus: 'content_review',
      changeReason: 'manual_update',
      remarks: '紧急情况，跳过中间步骤',
      operatorId: '1001',
      forceTransition: true
    },
    description: '测试强制状态流转：跳过验证规则'
  },
  {
    name: '时效监控 - 概览',
    method: 'GET',
    url: `${BASE_URL}/api/fulfillment-records/timeliness?type=overview`,
    description: '获取时效监控概览数据'
  },
  {
    name: '时效监控 - 逾期记录',
    method: 'GET',
    url: `${BASE_URL}/api/fulfillment-records/timeliness?type=overdue`,
    description: '获取当前逾期的履约单记录'
  },
  {
    name: '时效监控 - 统计数据',
    method: 'GET',
    url: `${BASE_URL}/api/fulfillment-records/timeliness?type=stats`,
    description: '获取详细的时效统计数据'
  },
  {
    name: '时效监控 - 完整报告',
    method: 'GET',
    url: `${BASE_URL}/api/fulfillment-records/timeliness?type=report`,
    description: '获取完整的时效分析报告'
  },
  {
    name: '状态历史查询',
    method: 'GET',
    url: `${BASE_URL}/api/fulfillment-records/1/status-logs`,
    description: '获取履约单的状态变更历史'
  }
];

// 颜色输出函数
function colorLog(message, color = 'white') {
  const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    reset: '\x1b[0m'
  };
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 执行HTTP请求
async function makeRequest(testCase) {
  try {
    const options = {
      method: testCase.method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (testCase.body) {
      options.body = JSON.stringify(testCase.body);
    }

    const response = await fetch(testCase.url, options);
    const data = await response.json();

    return {
      status: response.status,
      success: response.ok,
      data: data
    };
  } catch (error) {
    return {
      status: 0,
      success: false,
      error: error.message
    };
  }
}

// 格式化响应数据
function formatResponse(response, testCase) {
  if (!response.success) {
    colorLog(`❌ 请求失败 (${response.status}): ${response.error || '未知错误'}`, 'red');
    return;
  }

  colorLog(`✅ 请求成功 (${response.status})`, 'green');
  
  // 根据测试类型格式化输出
  if (testCase.name.includes('状态信息查询')) {
    const { fulfillmentRecord, statusFlow, timeline } = response.data.data;
    colorLog(`   当前状态: ${fulfillmentRecord.currentStatusDisplayName} (${fulfillmentRecord.currentStatus})`, 'cyan');
    colorLog(`   是否终态: ${fulfillmentRecord.isFinalStatus ? '是' : '否'}`, 'white');
    colorLog(`   可转换状态: ${statusFlow.nextPossibleStatuses.map(s => s.displayName).join(', ')}`, 'yellow');
    colorLog(`   时效配置: 标准${timeline.currentSLA.standard}h / 预警${timeline.currentSLA.warning}h / 最大${timeline.currentSLA.max}h`, 'blue');
  }
  
  else if (testCase.name.includes('状态转换')) {
    if (response.data.success) {
      const { fulfillmentRecord, statusLog, nextPossibleStatuses } = response.data.data;
      colorLog(`   状态已更新: ${statusLog.fromStatus || '初始'} → ${statusLog.toStatus}`, 'cyan');
      colorLog(`   实际耗时: ${statusLog.actualDurationHours}小时`, 'white');
      colorLog(`   下步可选: ${nextPossibleStatuses.join(', ')}`, 'yellow');
      if (response.data.warnings?.length > 0) {
        colorLog(`   警告: ${response.data.warnings.join('; ')}`, 'yellow');
      }
    } else {
      colorLog(`   转换失败: ${response.data.error}`, 'red');
      if (response.data.suggestedNextStatuses?.length > 0) {
        colorLog(`   建议状态: ${response.data.suggestedNextStatuses.join(', ')}`, 'yellow');
      }
    }
  }
  
  else if (testCase.name.includes('时效监控 - 概览')) {
    const { overview, currentOverdue, topIssues } = response.data.data;
    colorLog(`   总记录数: ${overview.totalRecords}`, 'white');
    colorLog(`   按时完成: ${overview.onTimeRecords} (${overview.onTimeRate}%)`, 'green');
    colorLog(`   逾期记录: ${overview.overdueRecords} (${overview.overdueRate}%)`, 'red');
    colorLog(`   平均耗时: ${overview.avgCompletionHours}小时`, 'blue');
    colorLog(`   当前逾期: 警告${currentOverdue.warning} | 严重${currentOverdue.critical} | 过期${currentOverdue.expired}`, 'yellow');
    if (topIssues.length > 0) {
      colorLog(`   紧急问题: ${topIssues.length}个需要立即处理`, 'red');
    }
  }
  
  else if (testCase.name.includes('时效监控 - 逾期记录')) {
    const { overdueRecords, summary } = response.data.data;
    colorLog(`   逾期总数: ${summary.totalOverdue}`, 'red');
    colorLog(`   预警级别: 警告${summary.warningCount} | 严重${summary.criticalCount} | 过期${summary.expiredCount}`, 'yellow');
    overdueRecords.slice(0, 3).forEach(record => {
      colorLog(`   - 履约单${record.fulfillmentRecordId}: ${record.currentStatus}, 逾期${record.overdueHours}小时 [${record.warningLevel}]`, 'cyan');
    });
  }
  
  else if (testCase.name.includes('时效监控 - 统计数据')) {
    const stats = response.data.data;
    colorLog(`   状态分布统计:`, 'white');
    Object.entries(stats.statusBreakdown).slice(0, 5).forEach(([status, data]) => {
      if (data.count > 0) {
        colorLog(`   - ${status}: ${data.count}个, 平均${data.avgHours}h, 逾期${data.overdueCount}个`, 'cyan');
      }
    });
    colorLog(`   优先级分布:`, 'white');
    Object.entries(stats.priorityBreakdown).forEach(([priority, data]) => {
      colorLog(`   - ${priority}: ${data.count}个, 平均${data.avgHours}h, 逾期${data.overdueCount}个`, 'blue');
    });
  }
  
  else if (testCase.name.includes('时效监控 - 完整报告')) {
    const { summary, overdueDetails } = response.data.data;
    colorLog(`   报告摘要:`, 'white');
    colorLog(`   - 总记录: ${summary.totalRecords}, 按时: ${summary.onTimeRecords}, 逾期: ${summary.overdueRecords}`, 'cyan');
    colorLog(`   - 按时率: ${summary.onTimeRate}%, 逾期率: ${summary.overdueRate}%`, 'blue');
    colorLog(`   逾期详情: ${overdueDetails.length}个逾期记录需要处理`, 'yellow');
  }
  
  else if (testCase.name.includes('状态历史查询')) {
    const { logs, stats, pagination } = response.data.data;
    colorLog(`   历史记录: ${pagination.total}条`, 'white');
    colorLog(`   统计信息: 总计${stats.totalLogs}条, 逾期${stats.overdueCount}条, 平均耗时${stats.avgActualDuration}h`, 'blue');
    logs.slice(0, 3).forEach(log => {
      colorLog(`   - ${log.statusChangeDescription}: ${log.durationDescription} [${log.timelinessStatus}]`, 'cyan');
    });
  }
}

// 主测试函数
async function runTests() {
  colorLog('🚀 开始测试核心业务逻辑功能...', 'green');
  colorLog('', 'white');

  let passedTests = 0;
  let totalTests = testCases.length;

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    
    colorLog(`[${i + 1}/${totalTests}] 测试: ${testCase.name}`, 'magenta');
    colorLog(`描述: ${testCase.description}`, 'white');
    colorLog(`请求: ${testCase.method} ${testCase.url}`, 'blue');
    
    if (testCase.body) {
      colorLog(`请求体: ${JSON.stringify(testCase.body, null, 2)}`, 'cyan');
    }

    const response = await makeRequest(testCase);
    formatResponse(response, testCase);

    if (response.success) {
      passedTests++;
    }

    colorLog('', 'white'); // 空行分隔

    // 在状态转换测试之间添加延迟
    if (testCase.name.includes('状态转换')) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // 输出测试总结
  colorLog('📊 测试总结:', 'magenta');
  colorLog(`✅ 通过: ${passedTests}/${totalTests}`, passedTests === totalTests ? 'green' : 'yellow');
  colorLog(`❌ 失败: ${totalTests - passedTests}/${totalTests}`, totalTests - passedTests === 0 ? 'green' : 'red');
  
  if (passedTests === totalTests) {
    colorLog('🎉 所有测试通过！核心业务逻辑功能正常！', 'green');
  } else {
    colorLog('⚠️  部分测试失败，请检查相关功能', 'yellow');
  }
}

// 运行测试
runTests().catch(console.error); 