/**
 * Phase 7: 性能优化测试脚本
 * 测试数据库查询优化、前端性能优化和缓存策略的效果
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

// 性能测试配置
const PERFORMANCE_TESTS = [
  {
    name: '履约单列表查询性能',
    url: '/api/fulfillment-records?page=1&limit=20',
    expectedTime: 500, // 期望响应时间(ms)
    concurrency: 10 // 并发数
  },
  {
    name: '分页查询性能',
    url: '/api/fulfillment-records?page=5&limit=50',
    expectedTime: 800,
    concurrency: 5
  },
  {
    name: '搜索查询性能',
    url: '/api/fulfillment-records?search=美妆&page=1&limit=20',
    expectedTime: 600,
    concurrency: 8
  },
  {
    name: '状态筛选查询性能',
    url: '/api/fulfillment-records?currentStatus=content_production&page=1&limit=20',
    expectedTime: 400,
    concurrency: 12
  },
  {
    name: '时效监控API性能',
    url: '/api/fulfillment-records/timeliness?type=overview',
    expectedTime: 300,
    concurrency: 15
  }
];

// 缓存测试
const CACHE_TESTS = [
  {
    name: '缓存命中率测试',
    url: '/api/fulfillment-records?page=1&limit=20',
    iterations: 5
  }
];

class PerformanceMonitor {
  constructor() {
    this.results = [];
  }

  async measureApiPerformance(test) {
    console.log(`\n🔍 测试: ${test.name}`);
    console.log(`📍 URL: ${test.url}`);
    console.log(`⚡ 并发数: ${test.concurrency}, 期望时间: ${test.expectedTime}ms`);

    const promises = [];
    const startTime = Date.now();

    // 并发请求测试
    for (let i = 0; i < test.concurrency; i++) {
      promises.push(this.measureSingleRequest(test.url));
    }

    try {
      const results = await Promise.all(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // 计算统计数据
      const responseTimes = results.map(r => r.responseTime);
      const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      const minResponseTime = Math.min(...responseTimes);
      const maxResponseTime = Math.max(...responseTimes);
      const successCount = results.filter(r => r.success).length;
      const successRate = (successCount / results.length) * 100;

      // 性能评估
      const performanceGrade = this.evaluatePerformance(avgResponseTime, test.expectedTime, successRate);

      console.log(`📊 测试结果:`);
      console.log(`   总耗时: ${totalTime}ms`);
      console.log(`   平均响应时间: ${avgResponseTime.toFixed(2)}ms`);
      console.log(`   最快响应: ${minResponseTime}ms`);
      console.log(`   最慢响应: ${maxResponseTime}ms`);
      console.log(`   成功率: ${successRate.toFixed(1)}%`);
      console.log(`   性能评级: ${performanceGrade.grade} ${performanceGrade.emoji}`);

      if (avgResponseTime > test.expectedTime) {
        console.log(`⚠️  响应时间超出预期 ${test.expectedTime}ms，需要优化`);
      } else {
        console.log(`✅ 响应时间符合预期`);
      }

      return {
        testName: test.name,
        totalTime,
        avgResponseTime,
        minResponseTime,
        maxResponseTime,
        successRate,
        performanceGrade,
        meetExpectation: avgResponseTime <= test.expectedTime
      };

    } catch (error) {
      console.log(`❌ 测试失败: ${error.message}`);
      return {
        testName: test.name,
        error: error.message,
        success: false
      };
    }
  }

  async measureSingleRequest(url) {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${BASE_URL}${url}`, {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache' // 避免HTTP缓存影响测试
        }
      });
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      if (response.ok) {
        const data = await response.json();
        const dataSize = JSON.stringify(data).length;
        
        return {
          success: true,
          responseTime,
          statusCode: response.status,
          dataSize,
          hasCacheHeader: response.headers.get('cache-control') !== null
        };
      } else {
        return {
          success: false,
          responseTime,
          statusCode: response.status,
          error: `HTTP ${response.status}`
        };
      }
    } catch (error) {
      const endTime = Date.now();
      return {
        success: false,
        responseTime: endTime - startTime,
        error: error.message
      };
    }
  }

  async testCachePerformance(test) {
    console.log(`\n🗄️  缓存测试: ${test.name}`);
    console.log(`📍 URL: ${test.url}`);
    console.log(`🔄 迭代次数: ${test.iterations}`);

    const results = [];
    
    for (let i = 0; i < test.iterations; i++) {
      const result = await this.measureSingleRequest(test.url);
      results.push(result);
      console.log(`   第${i + 1}次请求: ${result.responseTime}ms ${result.hasCacheHeader ? '(有缓存头)' : '(无缓存头)'}`);
      
      // 短暂延迟以避免请求过于密集
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // 分析缓存效果
    const firstRequest = results[0];
    const subsequentRequests = results.slice(1);
    const avgSubsequentTime = subsequentRequests.reduce((sum, r) => sum + r.responseTime, 0) / subsequentRequests.length;
    
    const cacheImprovement = ((firstRequest.responseTime - avgSubsequentTime) / firstRequest.responseTime) * 100;
    
    console.log(`📈 缓存分析:`);
    console.log(`   首次请求: ${firstRequest.responseTime}ms`);
    console.log(`   后续平均: ${avgSubsequentTime.toFixed(2)}ms`);
    console.log(`   性能提升: ${cacheImprovement.toFixed(1)}%`);
    
    if (cacheImprovement > 10) {
      console.log(`✅ 缓存效果良好`);
    } else if (cacheImprovement > 0) {
      console.log(`⚠️  缓存效果一般`);
    } else {
      console.log(`❌ 缓存无效果或负面影响`);
    }

    return {
      testName: test.name,
      firstRequestTime: firstRequest.responseTime,
      avgSubsequentTime,
      cacheImprovement
    };
  }

  evaluatePerformance(avgTime, expectedTime, successRate) {
    if (successRate < 95) {
      return { grade: 'F - 严重问题', emoji: '🔴' };
    }
    
    if (avgTime <= expectedTime * 0.7) {
      return { grade: 'A - 优秀', emoji: '🟢' };
    } else if (avgTime <= expectedTime) {
      return { grade: 'B - 良好', emoji: '🟡' };
    } else if (avgTime <= expectedTime * 1.5) {
      return { grade: 'C - 一般', emoji: '🟠' };
    } else {
      return { grade: 'D - 需要优化', emoji: '🔴' };
    }
  }

  async testDatabaseOptimization() {
    console.log('\n🗃️  数据库查询优化测试');
    console.log('================================================');

    // 测试不同查询场景的性能
    const dbTests = [
      {
        name: '基础列表查询',
        url: '/api/fulfillment-records?page=1&limit=10',
        description: '测试基础分页查询性能'
      },
      {
        name: '复合条件查询',
        url: '/api/fulfillment-records?currentStatus=content_production&priority=high&page=1&limit=10',
        description: '测试多条件筛选查询性能'
      },
      {
        name: '模糊搜索查询',
        url: '/api/fulfillment-records?search=美妆&page=1&limit=10',
        description: '测试全文搜索性能'
      }
    ];

    for (const test of dbTests) {
      console.log(`\n📋 ${test.description}`);
      const startTime = Date.now();
      
      try {
        const response = await fetch(`${BASE_URL}${test.url}`);
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        if (response.ok) {
          const data = await response.json();
          console.log(`✅ ${test.name}: ${responseTime}ms`);
          console.log(`   返回记录数: ${data.data?.length || 0}`);
          console.log(`   总记录数: ${data.pagination?.total || 'N/A'}`);
        } else {
          console.log(`❌ ${test.name}: HTTP ${response.status}`);
        }
      } catch (error) {
        console.log(`❌ ${test.name}: ${error.message}`);
      }
    }
  }

  generateOptimizationReport(results) {
    console.log('\n📊 Phase 7 性能优化报告');
    console.log('================================================');
    
    const totalTests = results.filter(r => r.success !== false).length;
    const passedTests = results.filter(r => r.meetExpectation).length;
    const avgPerformanceGrade = this.calculateAverageGrade(results);
    
    console.log(`📈 总体性能指标:`);
    console.log(`   测试通过率: ${((passedTests / totalTests) * 100).toFixed(1)}% (${passedTests}/${totalTests})`);
    console.log(`   平均性能等级: ${avgPerformanceGrade}`);
    
    console.log(`\n🎯 优化建议:`);
    
    // 分析结果并给出建议
    const slowTests = results.filter(r => !r.meetExpectation && r.avgResponseTime);
    if (slowTests.length > 0) {
      console.log(`⚠️  需要优化的API:`);
      slowTests.forEach(test => {
        console.log(`   - ${test.testName}: ${test.avgResponseTime.toFixed(2)}ms (超出预期)`);
      });
      
      console.log(`\n💡 建议措施:`);
      console.log(`   1. 为慢查询添加数据库索引`);
      console.log(`   2. 优化复杂查询的SQL语句`);
      console.log(`   3. 实施Redis缓存策略`);
      console.log(`   4. 考虑数据分页优化`);
    } else {
      console.log(`✅ 所有API性能表现良好`);
    }
    
    console.log(`\n🔄 下一步行动:`);
    console.log(`   1. 持续监控生产环境性能`);
    console.log(`   2. 建立性能基准线和告警`);
    console.log(`   3. 定期进行性能回归测试`);
    console.log(`   4. 收集用户反馈并持续优化`);
  }

  calculateAverageGrade(results) {
    const gradeValues = {
      'A - 优秀': 90,
      'B - 良好': 80,
      'C - 一般': 70,
      'D - 需要优化': 60,
      'F - 严重问题': 40
    };
    
    const validResults = results.filter(r => r.performanceGrade);
    if (validResults.length === 0) return 'N/A';
    
    const avgScore = validResults.reduce((sum, r) => {
      return sum + (gradeValues[r.performanceGrade.grade] || 50);
    }, 0) / validResults.length;
    
    if (avgScore >= 85) return 'A - 优秀 🟢';
    if (avgScore >= 75) return 'B - 良好 🟡';
    if (avgScore >= 65) return 'C - 一般 🟠';
    return 'D - 需要优化 🔴';
  }
}

// 主测试流程
async function runPerformanceTests() {
  console.log('🚀 Phase 7: 性能优化验证测试');
  console.log('================================================');
  console.log('⏰ 开始时间:', new Date().toLocaleString('zh-CN'));
  
  const monitor = new PerformanceMonitor();
  const results = [];

  // 1. 数据库查询优化测试
  await monitor.testDatabaseOptimization();

  // 2. API性能测试
  console.log('\n⚡ API性能压力测试');
  console.log('================================================');
  
  for (const test of PERFORMANCE_TESTS) {
    const result = await monitor.measureApiPerformance(test);
    results.push(result);
    
    // 测试间隔，避免服务器过载
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // 3. 缓存性能测试
  console.log('\n🗄️  缓存性能测试');
  console.log('================================================');
  
  for (const test of CACHE_TESTS) {
    await monitor.testCachePerformance(test);
  }

  // 4. 生成优化报告
  monitor.generateOptimizationReport(results);
  
  console.log('\n⏰ 完成时间:', new Date().toLocaleString('zh-CN'));
  console.log('🎉 Phase 7 性能优化测试完成！');
}

// 启动测试
if (import.meta.url === `file://${process.argv[1]}`) {
  runPerformanceTests().catch(console.error);
}

export { PerformanceMonitor }; 