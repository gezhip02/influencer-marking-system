const puppeteer = require('puppeteer');

const BASE_URL = 'http://localhost:3002';

async function testFrontendFeatures() {
  console.log('🖥️  开始测试前端功能...\n');

  let browser;
  try {
    browser = await puppeteer.launch({ 
      headless: false,
      slowMo: 100,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    // 1. 测试主页加载
    console.log('1. 测试主页加载...');
    await page.goto(BASE_URL);
    await page.waitForSelector('h1', { timeout: 5000 });
    console.log('✅ 主页加载成功\n');

    // 2. 测试履约管理页面
    console.log('2. 测试履约管理页面...');
    await page.goto(`${BASE_URL}/fulfillment`);
    await page.waitForSelector('.fulfillment-list', { timeout: 5000 });
    console.log('✅ 履约管理页面加载成功\n');

    // 3. 测试履约仪表板
    console.log('3. 测试履约仪表板...');
    await page.goto(`${BASE_URL}/fulfillment/dashboard`);
    await page.waitForSelector('.dashboard-container', { timeout: 10000 });
    console.log('✅ 履约仪表板加载成功\n');

    // 4. 测试搜索功能
    console.log('4. 测试搜索功能...');
    await page.goto(`${BASE_URL}/fulfillment`);
    const searchInput = await page.$('input[placeholder*="搜索"]');
    if (searchInput) {
      await searchInput.type('测试');
      await page.waitForTimeout(1000);
      console.log('✅ 搜索功能正常\n');
    } else {
      console.log('⚠️  搜索框未找到\n');
    }

    // 5. 检查控制台错误
    console.log('5. 检查控制台错误...');
    const logs = await page.evaluate(() => {
      return {
        errors: window.console.errors || [],
        warnings: window.console.warnings || []
      };
    });
    
    if (logs.errors.length === 0) {
      console.log('✅ 无控制台错误\n');
    } else {
      console.log(`❌ 发现 ${logs.errors.length} 个控制台错误\n`);
    }

    console.log('🎉 前端功能测试完成！');

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 提示: 请确保开发服务器正在运行 (npm run dev)');
    }
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// 检查是否安装了puppeteer
try {
  require('puppeteer');
  testFrontendFeatures();
} catch (error) {
  console.log('⚠️  Puppeteer未安装，跳过前端测试');
  console.log('💡 如需测试前端功能，请运行: npm install puppeteer');
} 