const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// 配置Supabase客户端
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 缺少Supabase配置');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testTagsAPI() {
  console.log('🧪 开始测试 Tags API (Supabase版本)...\n');

  try {
    // 1. 测试直接数据库查询
    console.log('1️⃣ 测试直接数据库查询...');
    const { data: directData, error: directError } = await supabase
      .from('tags')
      .select('*')
      .eq('status', 1)
      .limit(5);

    if (directError) {
      console.error('❌ 直接查询失败:', directError.message);
    } else {
      console.log('✅ 直接查询成功，找到记录数:', directData?.length || 0);
      if (directData && directData.length > 0) {
        console.log('📋 示例记录:', {
          id: directData[0].id,
          name: directData[0].name,
          displayName: directData[0].displayName,
          category: directData[0].category
        });
      }
    }

    // 2. 测试API端点 - GET
    console.log('\n2️⃣ 测试Tags API - GET...');
    const response = await fetch('http://localhost:3000/api/tags?page=1&limit=10');
    
    if (!response.ok) {
      console.error('❌ Tags API请求失败:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('错误详情:', errorText);
    } else {
      const data = await response.json();
      console.log('✅ Tags API请求成功');
      console.log('📊 响应数据:', {
        success: data.success,
        totalItems: data.pagination?.total || 0,
        itemsCount: data.data?.length || 0,
        stats: data.stats
      });
    }

    // 3. 测试搜索功能
    console.log('\n3️⃣ 测试搜索功能...');
    const { data: searchData, error: searchError } = await supabase
      .from('tags')
      .select('*')
      .eq('status', 1)
      .or('name.ilike.%test%,displayName.ilike.%测试%')
      .limit(3);

    if (searchError) {
      console.error('❌ 搜索查询失败:', searchError.message);
    } else {
      console.log('✅ 搜索查询成功，找到记录数:', searchData?.length || 0);
    }

    // 4. 测试分类统计
    console.log('\n4️⃣ 测试分类统计...');
    const { data: categoryData, error: categoryError } = await supabase
      .from('tags')
      .select('category')
      .eq('status', 1)
      .not('category', 'is', null);

    if (categoryError) {
      console.error('❌ 分类统计失败:', categoryError.message);
    } else {
      console.log('✅ 分类统计成功，记录数:', categoryData?.length || 0);
      
      // 模拟统计逻辑
      const categoryCount = {};
      if (categoryData) {
        categoryData.forEach(item => {
          const cat = item.category;
          categoryCount[cat] = (categoryCount[cat] || 0) + 1;
        });
      }
      console.log('📊 分类统计结果:', categoryCount);
    }

    console.log('\n🎉 所有测试完成！');

  } catch (error) {
    console.error('💥 测试过程中发生错误:', error.message);
    console.error('错误详情:', error);
  }
}

// 运行测试
testTagsAPI().catch(console.error); 