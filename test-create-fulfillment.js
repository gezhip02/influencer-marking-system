const API_BASE = 'http://localhost:3000/api';

async function testCreateFulfillment() {
  console.log('🧪 测试创建履约单功能...\n');

  try {
    // 使用有效的测试数据
    const createData = {
      influencerId: "1750373301735826",     // 刚创建的测试达人
      productId: "1750356112746766717",     // 兰蔻小黑瓶精华套装
      planId: "1",                          // 达人自制短视频寄样品
      ownerId: "1001",                      // 系统管理员
      title: "测试履约单",
      description: "这是一个测试履约单",
      priority: "medium"
    };

    console.log('📝 创建数据:');
    console.log('   - 达人ID:', createData.influencerId);
    console.log('   - 产品ID:', createData.productId);
    console.log('   - 方案ID:', createData.planId);
    console.log('   - 负责人ID:', createData.ownerId);

    console.log('\n🚀 发送创建请求...');
    const createResponse = await fetch(`${API_BASE}/fulfillment-records`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(createData)
    });

    const createResult = await createResponse.json();
    
    if (createResult.success) {
      console.log('✅ 创建履约单成功!');
      console.log(`   - 新履约单ID: ${createResult.data.id}`);
      console.log(`   - 标题: ${createResult.data.title}`);
      console.log(`   - 初始状态: ${createResult.data.currentStatus}`);
      console.log(`   - 优先级: ${createResult.data.priority}`);
      console.log(`   - 创建时间: ${new Date(createResult.data.createdAt * 1000).toLocaleString()}`);
      
      // 验证创建后能在列表中找到
      console.log('\n🔍 验证新记录在列表中...');
      const listResponse = await fetch(`${API_BASE}/fulfillment-records?page=1&limit=10`);
      const listData = await listResponse.json();
      
      if (listData.success) {
        const newRecord = listData.data.find(record => record.id === createResult.data.id);
        if (newRecord) {
          console.log('✅ 验证成功：新记录已出现在列表中');
          console.log(`   - 列表中标题: ${newRecord.title || '无标题'}`);
          console.log(`   - 列表中状态: ${newRecord.currentStatus}`);
        } else {
          console.log('❌ 验证失败：新记录未在列表中找到');
        }
      }
      
    } else {
      console.log('❌ 创建履约单失败:', createResult.error);
    }

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
  }

  console.log('\n🎯 创建履约单测试完成！');
}

// 运行测试
testCreateFulfillment(); 