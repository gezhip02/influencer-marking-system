async function testPlatformsAPI() {
  console.log('🧪 测试 Platforms API...\n');

  try {
    const response = await fetch('http://localhost:3000/api/platforms');
    
    console.log('📊 响应状态:', response.status, response.statusText);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Platforms API - 成功');
      console.log('📋 响应数据:', {
        success: data.success,
        platformCount: data.platforms?.length || 0,
        platforms: data.platforms?.map(p => ({ id: p.id, name: p.name, displayName: p.displayName }))
      });
    } else {
      const errorText = await response.text();
      console.log('❌ Platforms API - 失败');
      console.log('📝 错误信息:', errorText);
    }

  } catch (error) {
    console.error('💥 网络错误:', error.message);
  }
}

testPlatformsAPI().catch(console.error); 