#!/usr/bin/env node

// Supabase连接诊断脚本
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

console.log('🔍 Supabase连接诊断开始...\n');

// 检查环境变量
function checkEnvironmentVariables() {
  console.log('1️⃣ 检查环境变量...');
  
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.log('❌ DATABASE_URL 环境变量未设置');
    console.log('💡 请创建 .env.local 文件并添加以下内容：');
    console.log('DATABASE_URL="postgresql://postgres:[password]@[host]:5432/postgres"');
    return false;
  }
  
  console.log('✅ DATABASE_URL 已设置');
  
  // 解析数据库URL
  try {
    const url = new URL(databaseUrl);
    console.log(`📊 数据库信息:`);
    console.log(`   - 主机: ${url.hostname}`);
    console.log(`   - 端口: ${url.port}`);
    console.log(`   - 数据库: ${url.pathname.substring(1)}`);
    console.log(`   - 用户名: ${url.username}`);
    console.log(`   - 密码: ${url.password ? '已设置' : '未设置'}\n`);
    
    return {
      host: url.hostname,
      port: url.port,
      database: url.pathname.substring(1),
      username: url.username,
      password: url.password
    };
  } catch (error) {
    console.log('❌ DATABASE_URL 格式错误:', error.message);
    return false;
  }
}

// 检查网络连接
async function checkNetworkConnection(host, port) {
  console.log('2️⃣ 检查网络连接...');
  
  try {
    // 使用ping检查主机可达性
    const { stdout } = await execAsync(`ping -n 1 ${host}`);
    if (stdout.includes('TTL=')) {
      console.log('✅ 主机可达');
    } else {
      console.log('❌ 主机不可达');
      return false;
    }
  } catch (error) {
    console.log('❌ 网络连接失败:', error.message);
    console.log('💡 可能的原因:');
    console.log('   - 网络连接问题');
    console.log('   - 防火墙阻止连接');
    console.log('   - DNS解析问题');
    return false;
  }
  
  try {
    // 检查端口连通性 (Windows)
    const { stdout } = await execAsync(`Test-NetConnection -ComputerName ${host} -Port ${port}`, { shell: 'powershell' });
    if (stdout.includes('TcpTestSucceeded : True')) {
      console.log('✅ 端口连接正常');
      return true;
    } else {
      console.log('❌ 端口连接失败');
      return false;
    }
  } catch (error) {
    console.log('⚠️  无法测试端口连接:', error.message);
    return null;
  }
}

// 检查Supabase项目状态
async function checkSupabaseProject() {
  console.log('3️⃣ 检查Supabase项目状态...');
  
  console.log('💡 请检查以下项目：');
  console.log('   1. 登录 https://app.supabase.com');
  console.log('   2. 确认项目状态为 "Active"（活跃）');
  console.log('   3. 检查项目是否因为不活跃而被暂停');
  console.log('   4. 确认数据库实例正在运行');
  console.log('   5. 检查项目的API密钥是否有效\n');
}

// 测试数据库连接
async function testDatabaseConnection() {
  console.log('4️⃣ 测试数据库连接...');
  
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    });
    
    await prisma.$connect();
    console.log('✅ 数据库连接成功');
    
    // 测试简单查询
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ 数据库查询测试成功:', result);
    
    await prisma.$disconnect();
    return true;
  } catch (error) {
    console.log('❌ 数据库连接失败:', error.message);
    
    if (error.message.includes("Can't reach database server")) {
      console.log('💡 可能的解决方案:');
      console.log('   1. 检查Supabase项目是否处于活跃状态');
      console.log('   2. 重启Supabase项目（如果被暂停）');
      console.log('   3. 检查数据库连接字符串是否正确');
      console.log('   4. 确认网络连接正常');
    }
    
    if (error.message.includes("Invalid `prisma")) {
      console.log('💡 Prisma相关问题:');
      console.log('   1. 运行: npx prisma generate');
      console.log('   2. 运行: npx prisma db push');
    }
    
    return false;
  }
}

// 提供修复建议
function provideSolutions() {
  console.log('🔧 常见解决方案:\n');
  
  console.log('方案1: 重新激活Supabase项目');
  console.log('  - 登录 https://app.supabase.com');
  console.log('  - 找到你的项目');
  console.log('  - 如果显示"Paused"，点击"Resume"恢复\n');
  
  console.log('方案2: 更新数据库连接字符串');
  console.log('  - 在Supabase项目设置中获取最新的连接字符串');
  console.log('  - 更新 .env.local 文件中的 DATABASE_URL\n');
  
  console.log('方案3: 检查本地环境');
  console.log('  - 确保 .env.local 文件在项目根目录');
  console.log('  - 重启开发服务器: npm run dev\n');
  
  console.log('方案4: 重新生成Prisma客户端');
  console.log('  - 运行: npx prisma generate');
  console.log('  - 运行: npx prisma db push\n');
  
  console.log('方案5: 网络问题排查');
  console.log('  - 尝试使用VPN');
  console.log('  - 检查防火墙设置');
  console.log('  - 确认DNS解析正常\n');
}

// 主函数
async function main() {
  try {
    const dbConfig = checkEnvironmentVariables();
    
    if (!dbConfig) {
      provideSolutions();
      return;
    }
    
    const networkOk = await checkNetworkConnection(dbConfig.host, dbConfig.port);
    
    await checkSupabaseProject();
    
    const dbConnectionOk = await testDatabaseConnection();
    
    if (!dbConnectionOk) {
      console.log('\n❌ 数据库连接失败');
      provideSolutions();
    } else {
      console.log('\n✅ 所有检查通过！数据库连接正常。');
    }
    
  } catch (error) {
    console.error('诊断过程中出现错误:', error.message);
    provideSolutions();
  }
}

main().catch(console.error); 