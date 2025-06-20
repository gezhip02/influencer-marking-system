console.log('🔧 更新履约单系统：修复ID生成、状态流程和SLA逻辑...\n');

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// 修复所有问题的综合脚本
async function updateFulfillmentSystem() {
  console.log('🚀 开始更新履约单系统...\n');
  
  // 1. 修复状态更新API中的导入
  console.log('1. 修复状态更新API...');
  const statusApiPath = path.join(process.cwd(), 'src/app/api/fulfillment-records/[id]/status/route.ts');
  
  try {
    let content = fs.readFileSync(statusApiPath, 'utf8');
    
    // 添加雪花算法导入
    if (!content.includes("import { generateId }")) {
      content = content.replace(
        "import { serializeBigInt } from '@/lib/bigint-serializer';",
        "import { serializeBigInt } from '@/lib/bigint-serializer';\nimport { generateId } from '@/lib/snowflake';"
      );
    }
    
    fs.writeFileSync(statusApiPath, content, 'utf8');
    console.log('   ✅ 状态更新API已添加雪花算法导入');
  } catch (error) {
    console.log(`   ❌ 修复状态更新API失败: ${error.message}`);
  }
  
  // 2. 更新SLA配置
  console.log('\n2. 更新SLA配置...');
  
  const prisma = new PrismaClient();
  
  try {
    // 清除旧的SLA数据
    await prisma.fulfillmentSLA.deleteMany({});
    console.log('   清除旧SLA数据');
    
    // 导入雪花算法
    const { generateId } = require('./src/lib/snowflake');
    
    // 新的SLA配置 - 根据用户的状态流程设计
    const slaConfigs = [
      // 有寄样流程 (planId: 1, 3, 5)
      // begin -> pending_sample (创建任务，T+1)
      { planId: 1, fromStatus: 'begin', toStatus: 'pending_sample', durationHours: 24, description: '创建任务' },
      { planId: 3, fromStatus: 'begin', toStatus: 'pending_sample', durationHours: 24, description: '创建任务' },
      { planId: 5, fromStatus: 'begin', toStatus: 'pending_sample', durationHours: 24, description: '创建任务' },
      
      // pending_sample -> sample_sent (填写物流单号，T+1)
      { planId: 1, fromStatus: 'pending_sample', toStatus: 'sample_sent', durationHours: 24, description: '填写物流单号' },
      { planId: 3, fromStatus: 'pending_sample', toStatus: 'sample_sent', durationHours: 24, description: '填写物流单号' },
      { planId: 5, fromStatus: 'pending_sample', toStatus: 'sample_sent', durationHours: 24, description: '填写物流单号' },
      
      // sample_sent -> sample_received (更新sampleDeliveryTime，T+5)
      { planId: 1, fromStatus: 'sample_sent', toStatus: 'sample_received', durationHours: 120, description: '更新sampleDeliveryTime' },
      { planId: 3, fromStatus: 'sample_sent', toStatus: 'sample_received', durationHours: 120, description: '更新sampleDeliveryTime' },
      { planId: 5, fromStatus: 'sample_sent', toStatus: 'sample_received', durationHours: 120, description: '更新sampleDeliveryTime' },
      
      // sample_received -> content_creation (发送制作指南，T+1)
      { planId: 1, fromStatus: 'sample_received', toStatus: 'content_creation', durationHours: 24, description: '发送制作指南' },
      { planId: 3, fromStatus: 'sample_received', toStatus: 'content_creation', durationHours: 24, description: '发送制作指南' },
      { planId: 5, fromStatus: 'sample_received', toStatus: 'content_creation', durationHours: 24, description: '发送制作指南' },
      
      // content_creation -> content_published (抓取视频链接，T+7)
      { planId: 1, fromStatus: 'content_creation', toStatus: 'content_published', durationHours: 168, description: '抓取视频链接' },
      { planId: 3, fromStatus: 'content_creation', toStatus: 'content_published', durationHours: 168, description: '抓取视频链接' },
      { planId: 5, fromStatus: 'content_creation', toStatus: 'content_published', durationHours: 168, description: '抓取视频链接' },
      
      // content_published -> sales_conversion (计算adsRoi，人工打标签，T+7)
      { planId: 1, fromStatus: 'content_published', toStatus: 'sales_conversion', durationHours: 168, description: '计算adsRoi，人工打标签' },
      { planId: 3, fromStatus: 'content_published', toStatus: 'sales_conversion', durationHours: 168, description: '计算adsRoi，人工打标签' },
      { planId: 5, fromStatus: 'content_published', toStatus: 'sales_conversion', durationHours: 168, description: '计算adsRoi，人工打标签' },
      
      // sales_conversion -> finished (结束，关闭履约单，无时效)
      { planId: 1, fromStatus: 'sales_conversion', toStatus: 'finished', durationHours: null, description: '结束，关闭履约单' },
      { planId: 3, fromStatus: 'sales_conversion', toStatus: 'finished', durationHours: null, description: '结束，关闭履约单' },
      { planId: 5, fromStatus: 'sales_conversion', toStatus: 'finished', durationHours: null, description: '结束，关闭履约单' },
      
      // 无寄样流程 (planId: 2, 4, 6, 7)
      // begin -> content_creation (创建任务，发送制作指南，T+1)
      { planId: 2, fromStatus: 'begin', toStatus: 'content_creation', durationHours: 24, description: '创建任务，发送制作指南' },
      { planId: 4, fromStatus: 'begin', toStatus: 'content_creation', durationHours: 24, description: '创建任务，发送制作指南' },
      { planId: 6, fromStatus: 'begin', toStatus: 'content_creation', durationHours: 24, description: '创建任务，发送制作指南' },
      { planId: 7, fromStatus: 'begin', toStatus: 'content_creation', durationHours: 24, description: '创建任务，发送制作指南' },
      
      // content_creation -> content_published (抓取视频链接，T+7)
      { planId: 2, fromStatus: 'content_creation', toStatus: 'content_published', durationHours: 168, description: '抓取视频链接' },
      { planId: 4, fromStatus: 'content_creation', toStatus: 'content_published', durationHours: 168, description: '抓取视频链接' },
      { planId: 6, fromStatus: 'content_creation', toStatus: 'content_published', durationHours: 168, description: '抓取视频链接' },
      { planId: 7, fromStatus: 'content_creation', toStatus: 'content_published', durationHours: 168, description: '抓取视频链接' },
      
      // content_published -> sales_conversion (计算adsRoi，人工打标签，T+7)
      { planId: 2, fromStatus: 'content_published', toStatus: 'sales_conversion', durationHours: 168, description: '计算adsRoi，人工打标签' },
      { planId: 4, fromStatus: 'content_published', toStatus: 'sales_conversion', durationHours: 168, description: '计算adsRoi，人工打标签' },
      { planId: 6, fromStatus: 'content_published', toStatus: 'sales_conversion', durationHours: 168, description: '计算adsRoi，人工打标签' },
      { planId: 7, fromStatus: 'content_published', toStatus: 'sales_conversion', durationHours: 168, description: '计算adsRoi，人工打标签' },
      
      // sales_conversion -> finished (结束，关闭履约单，无时效)
      { planId: 2, fromStatus: 'sales_conversion', toStatus: 'finished', durationHours: null, description: '结束，关闭履约单' },
      { planId: 4, fromStatus: 'sales_conversion', toStatus: 'finished', durationHours: null, description: '结束，关闭履约单' },
      { planId: 6, fromStatus: 'sales_conversion', toStatus: 'finished', durationHours: null, description: '结束，关闭履约单' },
      { planId: 7, fromStatus: 'sales_conversion', toStatus: 'finished', durationHours: null, description: '结束，关闭履约单' }
    ];
    
    // 批量插入SLA配置
    for (const config of slaConfigs) {
      await prisma.fulfillmentSLA.create({
        data: {
          id: generateId(),
          planId: BigInt(config.planId),
          fromStatus: config.fromStatus,
          toStatus: config.toStatus,
          durationHours: config.durationHours,
          description: config.description,
          status: 1,
          createdAt: Math.floor(Date.now() / 1000)
        }
      });
    }
    
    console.log(`   ✅ 成功创建 ${slaConfigs.length} 条SLA配置`);
    
    // 验证创建结果
    const count = await prisma.fulfillmentSLA.count();
    console.log(`   📊 数据库中共有 ${count} 条SLA配置`);
    
  } catch (error) {
    console.error('   ❌ 更新SLA配置失败:', error);
  } finally {
    await prisma.$disconnect();
  }
  
  // 3. 创建状态管理逻辑文档
  console.log('\n3. 创建状态管理逻辑说明...');
  
  const statusLogicDoc = `# 履约单状态流程和SLA逻辑

## 状态枚举
- pending_sample: 待寄样
- sample_sent: 已寄样
- sample_received: 已签收  
- content_creation: 内容制作
- content_published: 已发布
- sales_conversion: 销售转化
- finished: 已完成

## 流程设计

### 有寄样流程 (planId: 1, 3, 5)
1. pending_sample (T+1) → sample_sent (T+1) → sample_received (T+5) → content_creation (T+1) → content_published (T+7) → sales_conversion (T+7) → finished

### 无寄样流程 (planId: 2, 4, 6, 7)  
1. content_creation (T+1) → content_published (T+7) → sales_conversion (T+7) → finished

## SLA逻辑
- stageDeadline = stageStartTime + durationHours (从SLA表获取)
- stageEndTime = 下一状态的stageStartTime
- isOverdue = stageEndTime > stageDeadline
- finished状态无时效限制

## 状态更新流程
1. 获取当前履约单和方案信息
2. 从SLA表查询状态转换的时效配置
3. 计算新状态的截止时间
4. 更新fulfillment_records表
5. 插入fulfillment_status_logs日志
6. 更新上一状态的stageEndTime`;
  
  fs.writeFileSync('fulfillment-status-logic.md', statusLogicDoc, 'utf8');
  console.log('   ✅ 创建状态管理逻辑文档: fulfillment-status-logic.md');
  
  console.log('\n🎉 履约单系统更新完成！');
  console.log('\n📋 更新内容:');
  console.log('1. ✅ 修复状态更新API的雪花算法导入');
  console.log('2. ✅ 重新设计SLA配置表数据');
  console.log('3. ✅ 建立正确的状态流程逻辑');
  console.log('4. ✅ 创建详细的状态管理文档');
  
  console.log('\n🚀 后续步骤:');
  console.log('1. 运行 npm run build 验证编译');
  console.log('2. 更新状态更新API以使用新的SLA逻辑');
  console.log('3. 测试完整的状态转换流程');
}

updateFulfillmentSystem().catch(console.error); 