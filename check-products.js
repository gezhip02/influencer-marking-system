const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkProducts() {
  console.log('🔍 检查产品数据...\n');

  try {
    // 获取所有产品
    const products = await prisma.cooperationProduct.findMany({
      where: { status: 1 },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`✅ 找到 ${products.length} 个产品:`);
    console.log('='.repeat(80));
    
    products.forEach((product, index) => {
      console.log(`${index + 1}. ID: ${product.id}`);
      console.log(`   名称: ${product.name}`);
      console.log(`   价格: ¥${product.price}`);
      console.log(`   品牌: ${product.brand}`);
      console.log(`   国家: ${product.country}`);
      console.log(`   状态: ${product.status}`);
      console.log('   ' + '-'.repeat(60));
    });

    console.log('\n📋 产品数据结构示例:');
    if (products.length > 0) {
      console.log(JSON.stringify(products[0], (key, value) => 
        typeof value === 'bigint' ? value.toString() : value, 2));
    }

  } catch (error) {
    console.error('❌ 查询产品时出错:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 运行脚本
checkProducts()
  .catch((error) => {
    console.error('脚本执行失败:', error);
    process.exit(1);
  }); 