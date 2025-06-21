require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProductsStructure() {
  console.log('🔍 检查products表（cooperation_products）结构...\n');

  try {
    // 1. 尝试检查cooperation_products表
    const { data: products, error } = await supabase
      .from('cooperation_products')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ 查询cooperation_products表失败:', error);
      
      // 2. 尝试检查products表
      console.log('🔍 尝试查询products表...');
      const { data: products2, error: error2 } = await supabase
        .from('products')
        .select('*')
        .limit(1);

      if (error2) {
        console.error('❌ 查询products表也失败:', error2);
        return;
      }

      if (products2 && products2.length > 0) {
        console.log('✅ products表字段结构:');
        console.log('字段列表:', Object.keys(products2[0]));
        console.log('\n📋 示例数据:');
        console.log(JSON.stringify(products2[0], null, 2));
      } else {
        console.log('⚠️  products表为空');
      }
      return;
    }

    if (products && products.length > 0) {
      console.log('✅ cooperation_products表字段结构:');
      console.log('字段列表:', Object.keys(products[0]));
      console.log('\n📋 示例数据:');
      console.log(JSON.stringify(products[0], null, 2));
    } else {
      console.log('⚠️  cooperation_products表为空');
    }

    // 3. 获取所有活跃products数据
    const { data: allProducts, error: allError } = await supabase
      .from('cooperation_products')
      .select('*')
      .eq('status', 1);

    if (allError) {
      console.error('❌ 获取全部products失败:', allError);
    } else {
      console.log(`\n📊 找到 ${allProducts?.length || 0} 个活跃产品`);
      allProducts?.forEach(product => {
        console.log(`   • ${product.name}: ${product.brand || 'N/A'} (${product.category || 'N/A'})`);
      });
    }

  } catch (error) {
    console.error('💥 检查失败:', error);
  }
}

checkProductsStructure().catch(console.error); 