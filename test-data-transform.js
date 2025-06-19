const testDataTransform = async () => {
  try {
    console.log('🔄 测试履约单数据转换...');
    
    // 获取原始API数据
    const response = await fetch('http://localhost:3000/api/fulfillment-records');
    const data = await response.json();
    
    console.log('📊 API原始响应:');
    console.log('  success:', data.success);
    console.log('  数据数量:', data.data?.length);
    
    if (data.data && data.data.length > 0) {
      const sampleRecord = data.data[0];
      console.log('\n📋 原始记录示例:');
      console.log('  id:', sampleRecord.id);
      console.log('  currentStatus:', sampleRecord.currentStatus);
      console.log('  priority:', sampleRecord.priority);
      console.log('  title:', sampleRecord.title);
      console.log('  influencer:', sampleRecord.influencer);
      console.log('  product:', sampleRecord.product);
      console.log('  createdAt:', sampleRecord.createdAt);
      
      // 测试数据转换
      console.log('\n🔄 转换后的记录:');
      const transformed = {
        id: sampleRecord.id.toString(),
        title: sampleRecord.title || `${sampleRecord.influencer?.displayName || '未知达人'} × ${sampleRecord.product?.name || '未知产品'}`,
        influencerName: sampleRecord.influencer?.displayName || '未知达人',
        productName: sampleRecord.product?.name || '未知产品',
        status: sampleRecord.currentStatus, // 这里是关键
        priority: sampleRecord.priority,
        createdAt: new Date(sampleRecord.createdAt * 1000).toISOString().split('T')[0],
        budget: sampleRecord.budget || 0,
        progress: 50, // 简化计算
        isOverdue: sampleRecord.isCurrentStageOverdue || false
      };
      
      console.log('  转换结果:', transformed);
      
      // 检查问题字段
      console.log('\n🔍 问题诊断:');
      console.log('  原始currentStatus:', typeof sampleRecord.currentStatus, sampleRecord.currentStatus);
      console.log('  转换后status:', typeof transformed.status, transformed.status);
      console.log('  status是否为undefined:', transformed.status === undefined);
      console.log('  currentStatus是否为null:', sampleRecord.currentStatus === null);
      
      // 验证所有记录
      const statusIssues = data.data.filter(r => !r.currentStatus || r.currentStatus === undefined || r.currentStatus === null);
      console.log('  有问题的状态记录:', statusIssues.length, '/', data.data.length);
      
      if (statusIssues.length > 0) {
        console.log('  问题记录示例:', statusIssues[0]);
      }
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
};

testDataTransform(); 