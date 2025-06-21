const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkTableStructure() {
  console.log('🔍 检查数据库表结构...\n');

  try {
    // 1. 检查tags表结构
    console.log('1️⃣ 检查tags表结构...');
    const { data: tagsData, error: tagsError } = await supabase
      .from('tags')
      .select('*')
      .limit(1);

    if (tagsError) {
      console.error('❌ tags表查询失败:', tagsError.message);
    } else if (tagsData && tagsData.length > 0) {
      console.log('✅ tags表字段:', Object.keys(tagsData[0]));
      console.log('📋 示例数据:', tagsData[0]);
    }

    // 2. 检查influencers表结构
    console.log('\n2️⃣ 检查influencers表结构...');
    const { data: influencersData, error: influencersError } = await supabase
      .from('influencers')
      .select('*')
      .limit(1);

    if (influencersError) {
      console.error('❌ influencers表查询失败:', influencersError.message);
    } else if (influencersData && influencersData.length > 0) {
      console.log('✅ influencers表字段:', Object.keys(influencersData[0]));
      console.log('📋 示例字段值:', {
        id: influencersData[0].id,
        username: influencersData[0].username,
        display_name: influencersData[0].display_name,
        displayName: influencersData[0].displayName,
        platform_id: influencersData[0].platform_id,
        platformId: influencersData[0].platformId
      });
    }

    // 3. 检查platforms表结构
    console.log('\n3️⃣ 检查platforms表结构...');
    const { data: platformsData, error: platformsError } = await supabase
      .from('platforms')
      .select('*')
      .limit(1);

    if (platformsError) {
      console.error('❌ platforms表查询失败:', platformsError.message);
    } else if (platformsData && platformsData.length > 0) {
      console.log('✅ platforms表字段:', Object.keys(platformsData[0]));
      console.log('📋 示例数据:', platformsData[0]);
    }

    // 4. 检查所有表列表
    console.log('\n4️⃣ 检查所有表...');
    const { data: tablesData, error: tablesError } = await supabase
      .rpc('get_tables')
      .catch(() => null);

    if (tablesError) {
      console.log('⚠️ 无法获取表列表，但这是正常的');
    }

  } catch (error) {
    console.error('💥 检查过程中发生错误:', error.message);
  }
}

checkTableStructure().catch(console.error); 