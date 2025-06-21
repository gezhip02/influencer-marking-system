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

async function testInfluencersAPI() {
  console.log('🧪 开始测试 Influencers API (Supabase版本)...\n');

  try {
    // 1. 测试直接数据库查询
    console.log('1️⃣ 测试直接数据库查询...');
    const { data: directData, error: directError } = await supabase
      .from('influencers')
      .select('*')
      .eq('status', 1)
      .limit(3);

    if (directError) {
      console.error('❌ 直接查询失败:', directError.message);
    } else {
      console.log('✅ 直接查询成功，找到记录数:', directData?.length || 0);
      if (directData && directData.length > 0) {
        console.log('📋 示例记录:', {
          id: directData[0].id,
          username: directData[0].username,
          platform_id: directData[0].platform_id
        });
      }
    }

    // 2. 测试API端点
    console.log('\n2️⃣ 测试API端点...');
    const response = await fetch('http://localhost:3000/api/influencers?page=1&limit=5');
    
    if (!response.ok) {
      console.error('❌ API请求失败:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('错误详情:', errorText);
    } else {
      const data = await response.json();
      console.log('✅ API请求成功');
      console.log('📊 响应数据:', {
        success: data.success,
        totalItems: data.data?.total || 0,
        itemsCount: data.data?.items?.length || 0,
        stats: data.stats
      });
    }

    // 3. 测试关联查询
    console.log('\n3️⃣ 测试关联查询...');
    const { data: joinData, error: joinError } = await supabase
      .from('influencers')
      .select(`
        id,
        username,
        display_name,
        platforms!inner(id, name, display_name)
      `)
      .eq('status', 1)
      .limit(2);

    if (joinError) {
      console.error('❌ 关联查询失败:', joinError.message);
    } else {
      console.log('✅ 关联查询成功，找到记录数:', joinData?.length || 0);
    }

    // 4. 测试统计查询
    console.log('\n4️⃣ 测试统计查询...');
    const { count: totalCount, error: countError } = await supabase
      .from('influencers')
      .select('*', { count: 'exact', head: true })
      .eq('status', 1);

    if (countError) {
      console.error('❌ 统计查询失败:', countError.message);
    } else {
      console.log('✅ 统计查询成功，总记录数:', totalCount || 0);
    }

    console.log('\n🎉 所有测试完成！');

  } catch (error) {
    console.error('💥 测试过程中发生错误:', error.message);
    console.error('错误详情:', error);
  }
}

// 运行测试
testInfluencersAPI().catch(console.error); 