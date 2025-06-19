// 测试履约单基础CRUD API
const baseUrl = 'http://localhost:3000';

async function testFulfillmentCRUD() {
  console.log('🚀 开始测试履约单CRUD API...');

  try {
    // 1. 测试获取履约单列表（初始应该是空的）
    console.log('\n📋 1. 测试获取履约单列表...');
    const listResponse = await fetch(`${baseUrl}/api/fulfillment-records`);
    const listData = await listResponse.json();
    
    if (listResponse.ok) {
      console.log('✅ 获取列表成功');
      console.log('  - 状态码:', listResponse.status);
      console.log('  - 总数:', listData.pagination?.total || 0);
      console.log('  - 当前页:', listData.pagination?.page || 1);
      console.log('  - 成功标志:', listData.success);
    } else {
      console.log('❌ 获取列表失败:', listData.error);
      return;
    }

    // 2. 获取基础数据进行测试
    console.log('\n📋 2. 获取基础测试数据...');
    
    // 获取达人数据
    const influencersRes = await fetch(`${baseUrl}/api/influencers`);
    const influencersData = await influencersRes.json();
    if (!influencersRes.ok || !influencersData.data?.items?.length) {
      console.log('❌ 无法获取达人数据，跳过创建测试');
      return;
    }
    const testInfluencerId = influencersData.data.items[0].id;
    console.log('  - 测试达人ID:', testInfluencerId);

    // 3. 测试创建履约单
    console.log('\n📋 3. 测试创建履约单...');
    const createData = {
      influencerId: testInfluencerId,
      productId: "1", // 使用种子数据中的产品ID
      planId: "1",    // 使用种子数据中的履约方案ID
      ownerId: "1",   // 使用种子数据中的用户ID
      title: "测试履约单 - API Test",
      description: "这是一个API测试用的履约单",
      priority: "medium",
      videoTitle: "API测试视频"
    };

    const createResponse = await fetch(`${baseUrl}/api/fulfillment-records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createData)
    });

    const createResult = await createResponse.json();
    
    if (createResponse.ok && createResult.success) {
      console.log('✅ 创建履约单成功');
      console.log('  - 状态码:', createResponse.status);
      console.log('  - 履约单ID:', createResult.data.id);
      console.log('  - 标题:', createResult.data.title);
      console.log('  - 当前状态:', createResult.data.currentStatus);
      
      const createdId = createResult.data.id;

      // 4. 测试获取履约单详情
      console.log('\n📋 4. 测试获取履约单详情...');
      const detailResponse = await fetch(`${baseUrl}/api/fulfillment-records/${createdId}`);
      const detailData = await detailResponse.json();
      
      if (detailResponse.ok && detailData.success) {
        console.log('✅ 获取详情成功');
        console.log('  - 状态码:', detailResponse.status);
        console.log('  - 标题:', detailData.data.title);
        console.log('  - 状态:', detailData.data.currentStatus);
        console.log('  - 优先级:', detailData.data.priority);
      } else {
        console.log('❌ 获取详情失败:', detailData.error);
      }

      // 5. 测试更新履约单
      console.log('\n📋 5. 测试更新履约单...');
      const updateData = {
        title: "更新后的履约单标题",
        description: "更新后的描述",
        priority: "high"
      };

      const updateResponse = await fetch(`${baseUrl}/api/fulfillment-records/${createdId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      const updateResult = await updateResponse.json();
      
      if (updateResponse.ok && updateResult.success) {
        console.log('✅ 更新履约单成功');
        console.log('  - 状态码:', updateResponse.status);
        console.log('  - 新标题:', updateResult.data.title);
        console.log('  - 新优先级:', updateResult.data.priority);
      } else {
        console.log('❌ 更新履约单失败:', updateResult.error);
      }

      // 6. 测试查询功能
      console.log('\n📋 6. 测试查询功能...');
      const queryResponse = await fetch(`${baseUrl}/api/fulfillment-records?search=更新后&priority=high`);
      const queryData = await queryResponse.json();
      
      if (queryResponse.ok && queryData.success) {
        console.log('✅ 查询功能测试成功');
        console.log('  - 状态码:', queryResponse.status);
        console.log('  - 查询结果数量:', queryData.data.length);
        console.log('  - 查询参数生效:', queryData.data.length > 0 ? '是' : '否');
      } else {
        console.log('❌ 查询功能测试失败:', queryData.error);
      }

      // 7. 测试删除履约单
      console.log('\n📋 7. 测试删除履约单...');
      const deleteResponse = await fetch(`${baseUrl}/api/fulfillment-records/${createdId}`, {
        method: 'DELETE'
      });

      const deleteResult = await deleteResponse.json();
      
      if (deleteResponse.ok && deleteResult.success) {
        console.log('✅ 删除履约单成功');
        console.log('  - 状态码:', deleteResponse.status);
        console.log('  - 删除消息:', deleteResult.message);
      } else {
        console.log('❌ 删除履约单失败:', deleteResult.error);
      }

      // 8. 验证删除效果
      console.log('\n📋 8. 验证删除效果...');
      const verifyResponse = await fetch(`${baseUrl}/api/fulfillment-records/${createdId}`);
      const verifyData = await verifyResponse.json();
      
      if (verifyResponse.status === 404) {
        console.log('✅ 删除验证成功 - 记录不存在');
      } else {
        console.log('❌ 删除验证失败 - 记录仍然存在');
      }

    } else {
      console.log('❌ 创建履约单失败');
      console.log('  - 状态码:', createResponse.status);
      console.log('  - 错误信息:', createResult.error || '未知错误');
      console.log('  - 可能原因: 缺少必要的基础数据或API实现有问题');
    }

    console.log('\n🎉 履约单CRUD API测试完成！');

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
    console.log('  - 请确保开发服务器已启动');
    console.log('  - 请确保数据库连接正常');
    console.log('  - 请确保已运行数据库迁移和种子数据');
  }
}

// 运行测试
testFulfillmentCRUD(); 