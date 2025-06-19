// 最终履约单API测试，使用数据库真实ID
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const baseUrl = 'http://localhost:3000';

async function testFulfillmentFinal() {
  console.log('🚀 开始最终履约单API测试...');

  try {
    // 1. 从数据库获取真实的基础数据ID
    console.log('\n📋 1. 获取数据库中的真实ID...');
    
    const [users, plans, products, influencers] = await Promise.all([
      prisma.user.findMany({ select: { id: true, name: true }, take: 1 }),
      prisma.fulfillmentPlan.findMany({ select: { id: true, planName: true }, take: 1 }),
      prisma.cooperationProduct.findMany({ select: { id: true, name: true }, take: 1 }),
      prisma.influencer.findMany({ select: { id: true, username: true }, take: 1 })
    ]);

    if (users.length === 0 || plans.length === 0 || products.length === 0) {
      console.log('❌ 缺少必要的基础数据');
      console.log('  - 用户数量:', users.length);
      console.log('  - 履约方案数量:', plans.length);
      console.log('  - 产品数量:', products.length);
      console.log('  - 达人数量:', influencers.length);
      return;
    }

    const testData = {
      userId: users[0].id.toString(),
      planId: plans[0].id.toString(),
      productId: products[0].id.toString(),
      influencerId: influencers.length > 0 ? influencers[0].id.toString() : users[0].id.toString() // 如果没有达人就用用户ID
    };

    console.log('  - 测试用户ID:', testData.userId);
    console.log('  - 测试方案ID:', testData.planId, '(' + plans[0].planName + ')');
    console.log('  - 测试产品ID:', testData.productId, '(' + products[0].name + ')');
    console.log('  - 测试达人ID:', testData.influencerId);

    // 2. 测试履约单列表API
    console.log('\n📋 2. 测试获取履约单列表...');
    const listResponse = await fetch(`${baseUrl}/api/fulfillment-records`);
    const listData = await listResponse.json();
    
    console.log('  - 状态码:', listResponse.status);
    console.log('  - 响应成功:', listData.success);
    console.log('  - 总数:', listData.pagination?.total || 0);

    if (!listResponse.ok) {
      console.log('❌ 列表API失败，终止测试');
      return;
    }

    // 3. 测试创建履约单
    console.log('\n📋 3. 测试创建履约单...');
    const createData = {
      influencerId: testData.influencerId,
      productId: testData.productId,
      planId: testData.planId,
      ownerId: testData.userId,
      title: "测试履约单-最终测试",
      description: "这是最终API测试",
      priority: "medium",
      videoTitle: "最终测试视频"
    };

    const createResponse = await fetch(`${baseUrl}/api/fulfillment-records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createData)
    });

    const createResult = await createResponse.json();
    
    console.log('  - 状态码:', createResponse.status);
    console.log('  - 响应成功:', createResult.success);
    
    if (createResponse.ok && createResult.success) {
      const createdId = createResult.data.id;
      console.log('  - 履约单ID:', createdId);
      console.log('  - 标题:', createResult.data.title);
      console.log('  - 当前状态:', createResult.data.currentStatus);

      // 4. 测试获取详情
      console.log('\n📋 4. 测试获取履约单详情...');
      const detailResponse = await fetch(`${baseUrl}/api/fulfillment-records/${createdId}`);
      const detailData = await detailResponse.json();
      
      console.log('  - 状态码:', detailResponse.status);
      console.log('  - 响应成功:', detailData.success);
      if (detailResponse.ok) {
        console.log('  - 详情标题:', detailData.data.title);
        console.log('  - 优先级:', detailData.data.priority);
      }

      // 5. 测试更新
      console.log('\n📋 5. 测试更新履约单...');
      const updateData = {
        title: "更新后的标题 - 最终测试",
        priority: "high",
        description: "更新后的描述"
      };

      const updateResponse = await fetch(`${baseUrl}/api/fulfillment-records/${createdId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      const updateResult = await updateResponse.json();
      
      console.log('  - 状态码:', updateResponse.status);
      console.log('  - 响应成功:', updateResult.success);
      if (updateResponse.ok) {
        console.log('  - 新标题:', updateResult.data.title);
        console.log('  - 新优先级:', updateResult.data.priority);
      }

      // 6. 测试查询功能
      console.log('\n📋 6. 测试查询功能...');
      const queryResponse = await fetch(`${baseUrl}/api/fulfillment-records?search=更新后&priority=high&limit=5`);
      const queryData = await queryResponse.json();
      
      console.log('  - 状态码:', queryResponse.status);
      console.log('  - 响应成功:', queryData.success);
      if (queryResponse.ok) {
        console.log('  - 查询结果数量:', queryData.data.length);
        console.log('  - 搜索功能有效:', queryData.data.some(r => r.title.includes('更新后')));
      }

      // 7. 测试删除
      console.log('\n📋 7. 测试删除履约单...');
      const deleteResponse = await fetch(`${baseUrl}/api/fulfillment-records/${createdId}`, {
        method: 'DELETE'
      });

      const deleteResult = await deleteResponse.json();
      
      console.log('  - 状态码:', deleteResponse.status);
      console.log('  - 响应成功:', deleteResult.success);
      if (deleteResponse.ok) {
        console.log('  - 删除消息:', deleteResult.message);
      }

      // 8. 验证删除
      console.log('\n📋 8. 验证删除效果...');
      const verifyResponse = await fetch(`${baseUrl}/api/fulfillment-records/${createdId}`);
      
      console.log('  - 状态码:', verifyResponse.status);
      if (verifyResponse.status === 404) {
        console.log('  - ✅ 删除验证成功 - 记录已不存在');
      } else {
        console.log('  - ❌ 删除验证失败 - 记录仍然存在');
      }

      console.log('\n🎉 所有CRUD操作测试完成！');

    } else {
      console.log('❌ 创建履约单失败');
      console.log('  - 错误信息:', createResult.error);
      
      // 如果创建失败，检查数据库连接和模型
      console.log('\n🔍 诊断信息:');
      const diagnostic = await fetch(`${baseUrl}/api/fulfillment-records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          influencerId: "1", 
          productId: "1", 
          planId: "1", 
          ownerId: "1" 
        })
      }).then(r => r.json());
      
      console.log('  - 简单创建测试:', diagnostic.error || '成功');
    }

  } catch (error) {
    console.error('❌ 测试发生错误:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// 运行测试
testFulfillmentFinal(); 