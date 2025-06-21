#!/usr/bin/env node

// Supabase连接修复脚本
console.log('🔧 Supabase连接修复脚本');
console.log('=====================================\n');

// 检查环境变量
function checkEnvFile() {
  const fs = require('fs');
  const path = require('path');
  
  const envFiles = ['.env.local', '.env', '.env.development'];
  let foundEnvFile = null;
  
  for (const file of envFiles) {
    if (fs.existsSync(path.join(process.cwd(), file))) {
      foundEnvFile = file;
      break;
    }
  }
  
  if (!foundEnvFile) {
    console.log('❌ 未找到环境变量文件');
    console.log('💡 请创建 .env.local 文件');
    return false;
  }
  
  console.log(`✅ 找到环境变量文件: ${foundEnvFile}`);
  return true;
}

// 创建环境变量示例
function createEnvExample() {
  const fs = require('fs');
  const envExample = `# Supabase 数据库配置
# 请根据你的Supabase项目信息修改以下值

# 数据库连接字符串
# 格式: postgresql://[用户名]:[密码]@[主机]:[端口]/[数据库名]
DATABASE_URL="postgresql://postgres:your_password@your_project_ref.supabase.co:5432/postgres"

# Supabase 项目配置
NEXT_PUBLIC_SUPABASE_URL="https://your_project_ref.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_anon_key"

# 获取方式：
# 1. 登录 https://app.supabase.com
# 2. 选择你的项目
# 3. 点击左侧菜单 "Settings" -> "Database"
# 4. 在 "Connection info" 部分找到连接字符串
# 5. 在 "API" 部分找到 Project URL 和 anon key
`;

  fs.writeFileSync('.env.local.example', envExample);
  console.log('✅ 已创建 .env.local.example 文件');
}

// 测试连接
async function testConnection() {
  console.log('\n🔍 测试数据库连接...');
  
  if (!process.env.DATABASE_URL) {
    console.log('❌ DATABASE_URL 环境变量未设置');
    return false;
  }
  
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    await prisma.$connect();
    console.log('✅ 数据库连接成功');
    await prisma.$disconnect();
    return true;
  } catch (error) {
    console.log('❌ 数据库连接失败:', error.message);
    
    if (error.message.includes("Can't reach database server")) {
      console.log('\n🔧 可能的解决方案:');
      console.log('1. 检查Supabase项目状态:');
      console.log('   - 登录 https://app.supabase.com');
      console.log('   - 确认项目状态为 "Active"');
      console.log('   - 如果显示 "Paused"，点击 "Resume" 恢复');
      console.log('');
      console.log('2. 更新数据库连接字符串:');
      console.log('   - 在Supabase项目设置中获取最新连接字符串');
      console.log('   - 更新 .env.local 文件');
      console.log('');
      console.log('3. 检查网络连接:');
      console.log('   - 确认网络连接正常');
      console.log('   - 尝试使用VPN（如果在国内）');
      console.log('   - 检查防火墙设置');
    }
    
    return false;
  }
}

// 主函数
async function main() {
  // 检查环境变量文件
  const hasEnvFile = checkEnvFile();
  
  // 创建示例文件
  createEnvExample();
  
  if (!hasEnvFile) {
    console.log('\n💡 接下来的步骤:');
    console.log('1. 复制 .env.local.example 为 .env.local');
    console.log('2. 在 .env.local 中填入正确的Supabase配置');
    console.log('3. 重新运行此脚本测试连接');
    return;
  }
  
  // 测试连接
  const connectionOk = await testConnection();
  
  if (connectionOk) {
    console.log('\n🎉 连接修复成功！');
    console.log('可以重新启动开发服务器: npm run dev');
  } else {
    console.log('\n❓ 如果问题仍然存在，请:');
    console.log('1. 检查Supabase控制台中的项目状态');
    console.log('2. 确认数据库连接字符串正确');
    console.log('3. 尝试重新生成连接字符串');
    console.log('4. 联系技术支持获取帮助');
  }
}

main().catch(console.error); 