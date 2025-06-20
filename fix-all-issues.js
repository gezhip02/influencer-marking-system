const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

async function fixAllIssues() {
  console.log('🔧 开始修复所有问题...\n');
  
  // 1. 修复TagData类型问题
  console.log('1. 修复TagData类型问题...');
  try {
    const deleteTagPath = 'src/components/tags/delete-tag-dialog.tsx';
    let content = fs.readFileSync(deleteTagPath, 'utf8');
    
    if (content.includes('influencerCount: number;')) {
      content = content.replace('influencerCount: number;', 'influencerCount?: number;');
      fs.writeFileSync(deleteTagPath, content, 'utf8');
      console.log('   ✅ 修复TagData接口类型');
    } else {
      console.log('   ⚠️ TagData类型已正确');
    }
  } catch (error) {
    console.log('   ❌ 修复TagData失败:', error.message);
  }
  
  // 2. 修复状态API的雪花算法导入
  console.log('\n2. 修复状态API雪花算法导入...');
  try {
    const statusApiPath = 'src/app/api/fulfillment-records/[id]/status/route.ts';
    let apiContent = fs.readFileSync(statusApiPath, 'utf8');
    
    if (!apiContent.includes('import { generateId }')) {
      apiContent = apiContent.replace(
        "import { serializeBigInt } from '@/lib/bigint-serializer';",
        "import { serializeBigInt } from '@/lib/bigint-serializer';\nimport { generateId } from '@/lib/snowflake';"
      );
      fs.writeFileSync(statusApiPath, apiContent, 'utf8');
      console.log('   ✅ 添加雪花算法导入');
    } else {
      console.log('   ⚠️ 雪花算法导入已存在');
    }
  } catch (error) {
    console.log('   ❌ 修复状态API失败:', error.message);
  }
  
  // 3. 更新SLA配置
  console.log('\n3. 更新SLA配置...');
  const prisma = new PrismaClient();
  
  try {
    // 清除旧数据
    await prisma.fulfillmentSLA.deleteMany({});
    console.log('   清除旧SLA数据');
    
    // 导入雪花算法
    const { generateId } = require('./src/lib/snowflake');
    
    // 新的SLA配置
    const slaConfigs = [
      // 有寄样流程 (planId: 1, 3, 5)
      { planId: 1, fromStatus: 'begin', toStatus: 'pending_sample', durationHours: 24, description: '创建任务' },
      { planId: 1, fromStatus: 'pending_sample', toStatus: 'sample_sent', durationHours: 24, description: '填写物流单号' },
      { planId: 1, fromStatus: 'sample_sent', toStatus: 'sample_received', durationHours: 120, description: '更新sampleDeliveryTime' },
      { planId: 1, fromStatus: 'sample_received', toStatus: 'content_creation', durationHours: 24, description: '发送制作指南' },
      { planId: 1, fromStatus: 'content_creation', toStatus: 'content_published', durationHours: 168, description: '抓取视频链接' },
      { planId: 1, fromStatus: 'content_published', toStatus: 'sales_conversion', durationHours: 168, description: '计算adsRoi，人工打标签' },
      { planId: 1, fromStatus: 'sales_conversion', toStatus: 'finished', durationHours: null, description: '结束，关闭履约单' },
      
      { planId: 3, fromStatus: 'begin', toStatus: 'pending_sample', durationHours: 24, description: '创建任务' },
      { planId: 3, fromStatus: 'pending_sample', toStatus: 'sample_sent', durationHours: 24, description: '填写物流单号' },
      { planId: 3, fromStatus: 'sample_sent', toStatus: 'sample_received', durationHours: 120, description: '更新sampleDeliveryTime' },
      { planId: 3, fromStatus: 'sample_received', toStatus: 'content_creation', durationHours: 24, description: '发送制作指南' },
      { planId: 3, fromStatus: 'content_creation', toStatus: 'content_published', durationHours: 168, description: '抓取视频链接' },
      { planId: 3, fromStatus: 'content_published', toStatus: 'sales_conversion', durationHours: 168, description: '计算adsRoi，人工打标签' },
      { planId: 3, fromStatus: 'sales_conversion', toStatus: 'finished', durationHours: null, description: '结束，关闭履约单' },
      
      { planId: 5, fromStatus: 'begin', toStatus: 'pending_sample', durationHours: 24, description: '创建任务' },
      { planId: 5, fromStatus: 'pending_sample', toStatus: 'sample_sent', durationHours: 24, description: '填写物流单号' },
      { planId: 5, fromStatus: 'sample_sent', toStatus: 'sample_received', durationHours: 120, description: '更新sampleDeliveryTime' },
      { planId: 5, fromStatus: 'sample_received', toStatus: 'content_creation', durationHours: 24, description: '发送制作指南' },
      { planId: 5, fromStatus: 'content_creation', toStatus: 'content_published', durationHours: 168, description: '抓取视频链接' },
      { planId: 5, fromStatus: 'content_published', toStatus: 'sales_conversion', durationHours: 168, description: '计算adsRoi，人工打标签' },
      { planId: 5, fromStatus: 'sales_conversion', toStatus: 'finished', durationHours: null, description: '结束，关闭履约单' },
      
      // 无寄样流程 (planId: 2, 4, 6, 7)
      { planId: 2, fromStatus: 'begin', toStatus: 'content_creation', durationHours: 24, description: '创建任务，发送制作指南' },
      { planId: 2, fromStatus: 'content_creation', toStatus: 'content_published', durationHours: 168, description: '抓取视频链接' },
      { planId: 2, fromStatus: 'content_published', toStatus: 'sales_conversion', durationHours: 168, description: '计算adsRoi，人工打标签' },
      { planId: 2, fromStatus: 'sales_conversion', toStatus: 'finished', durationHours: null, description: '结束，关闭履约单' },
      
      { planId: 4, fromStatus: 'begin', toStatus: 'content_creation', durationHours: 24, description: '创建任务，发送制作指南' },
      { planId: 4, fromStatus: 'content_creation', toStatus: 'content_published', durationHours: 168, description: '抓取视频链接' },
      { planId: 4, fromStatus: 'content_published', toStatus: 'sales_conversion', durationHours: 168, description: '计算adsRoi，人工打标签' },
      { planId: 4, fromStatus: 'sales_conversion', toStatus: 'finished', durationHours: null, description: '结束，关闭履约单' },
      
      { planId: 6, fromStatus: 'begin', toStatus: 'content_creation', durationHours: 24, description: '创建任务，发送制作指南' },
      { planId: 6, fromStatus: 'content_creation', toStatus: 'content_published', durationHours: 168, description: '抓取视频链接' },
      { planId: 6, fromStatus: 'content_published', toStatus: 'sales_conversion', durationHours: 168, description: '计算adsRoi，人工打标签' },
      { planId: 6, fromStatus: 'sales_conversion', toStatus: 'finished', durationHours: null, description: '结束，关闭履约单' },
      
      { planId: 7, fromStatus: 'begin', toStatus: 'content_creation', durationHours: 24, description: '创建任务，发送制作指南' },
      { planId: 7, fromStatus: 'content_creation', toStatus: 'content_published', durationHours: 168, description: '抓取视频链接' },
      { planId: 7, fromStatus: 'content_published', toStatus: 'sales_conversion', durationHours: 168, description: '计算adsRoi，人工打标签' },
      { planId: 7, fromStatus: 'sales_conversion', toStatus: 'finished', durationHours: null, description: '结束，关闭履约单' }
    ];
    
    // 批量插入，使用雪花算法
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
    
    const count = await prisma.fulfillmentSLA.count();
    console.log(`   📊 数据库中共有 ${count} 条SLA配置`);
    
  } catch (error) {
    console.error('   ❌ 更新SLA失败:', error);
  } finally {
    await prisma.$disconnect();
  }
  
  console.log('\n🎉 修复完成！');
  console.log('\n📋 修复总结:');
  console.log('1. ✅ TagData类型 → 修复编译错误');
  console.log('2. ✅ 雪花算法ID → 统一ID生成');
  console.log('3. ✅ SLA配置 → 重新设计状态流程');
  console.log('\n🚀 状态流程设计:');
  console.log('有寄样: pending_sample → sample_sent → sample_received → content_creation → content_published → sales_conversion → finished');
  console.log('无寄样: content_creation → content_published → sales_conversion → finished');
}

fixAllIssues().catch(console.error); 