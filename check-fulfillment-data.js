const testFulfillmentList = async () => {
  try {
    console.log('🔍 检查履约单列表数据...');
    const response = await fetch('http://localhost:3000/api/fulfillment-records');
    const data = await response.json();
    
    console.log('📊 API响应结构:');
    console.log('  success:', data.success);
    console.log('  total:', data.total);
    console.log('  data类型:', Array.isArray(data.data) ? 'array' : typeof data.data);
    console.log('  data长度:', data.data?.length);
    
    if (data.success && data.data && Array.isArray(data.data)) {
      console.log(`\n📋 履约单记录 (共${data.data.length}条):`);
      data.data.slice(0, 5).forEach((record, i) => {
        console.log(`  ${i + 1}. ${record.title || '未命名'} (ID: ${record.id})`);
        console.log(`     状态: ${record.status}, 创建时间: ${record.createdAt}`);
      });
      
      if (data.data.length > 5) {
        console.log(`  ... 还有 ${data.data.length - 5} 条记录`);
      }
    } else {
      console.log('❌ 数据格式异常:', data);
    }
    
    // 检查数据库直接查询
    console.log('\n🗄️ 直接查询数据库...');
    const dbResponse = await fetch('http://localhost:3000/api/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        query: 'SELECT COUNT(*) as count FROM fulfillment_records WHERE status != -1' 
      })
    });
    
    if (dbResponse.ok) {
      const dbData = await dbResponse.json();
      console.log('  数据库记录数:', dbData);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
};

testFulfillmentList(); 