require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPlatformsStructure() {
  console.log('🔍 检查platforms表结构...\n');

  try {
    // 1. 获取表中的所有数据查看字段
    const { data: platforms, error } = await supabase
      .from('platforms')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ 查询platforms表失败:', error);
      return;
    }

    if (platforms && platforms.length > 0) {
      console.log('✅ platforms表字段结构:');
      console.log('字段列表:', Object.keys(platforms[0]));
      console.log('\n📋 示例数据:');
      console.log(JSON.stringify(platforms[0], null, 2));
    } else {
      console.log('⚠️  platforms表为空');
    }

    // 2. 获取所有platforms数据
    const { data: allPlatforms, error: allError } = await supabase
      .from('platforms')
      .select('*')
      .eq('status', 1);

    if (allError) {
      console.error('❌ 获取全部platforms失败:', allError);
    } else {
      console.log(`\n📊 找到 ${allPlatforms?.length || 0} 个活跃平台`);
      allPlatforms?.forEach(platform => {
        console.log(`   • ${platform.name}: ${platform.displayName}`);
      });
    }

  } catch (error) {
    console.error('💥 检查失败:', error);
  }
}

checkPlatformsStructure().catch(console.error); 