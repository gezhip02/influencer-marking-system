const axios = require('axios');

const BASE_URL = 'http://localhost:3002';

async function testLogin() {
  console.log('🔐 测试登录功能...\n');

  const testAccounts = [
    {
      name: '管理员账户',
      email: 'admin@example.com',
      password: 'admin123'
    },
    {
      name: '测试用户账户',
      email: 'test@example.com',
      password: 'test123'
    },
    {
      name: '错误密码测试',
      email: 'admin@example.com',
      password: 'wrongpassword'
    },
    {
      name: '不存在的用户',
      email: 'nonexistent@example.com',
      password: 'password123'
    }
  ];

  for (const account of testAccounts) {
    console.log(`🧪 测试 ${account.name}...`);
    
    try {
      const response = await axios.post(`${BASE_URL}/api/auth/login`, {
        email: account.email,
        password: account.password,
        rememberMe: false
      }, {
        timeout: 5000,
        validateStatus: () => true // 接受所有状态码
      });

      if (response.status === 200) {
        const data = response.data;
        if (data.success) {
          console.log(`  ✅ 登录成功!`);
          console.log(`     用户: ${data.data.user.name} (${data.data.user.email})`);
          console.log(`     角色: ${data.data.user.role}`);
          console.log(`     Token: ${data.data.token.substring(0, 20)}...`);
        } else {
          console.log(`  ❌ 登录失败: ${data.error || '未知错误'}`);
        }
      } else {
        const errorData = response.data;
        console.log(`  ❌ 登录失败 (${response.status}): ${errorData.error || '服务器错误'}`);
      }
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log(`  ❌ 连接失败: 服务器未启动`);
      } else {
        console.log(`  ❌ 请求失败: ${error.message}`);
      }
    }
    
    console.log();
  }

  // 测试登录后访问受保护的API
  console.log('🔒 测试访问受保护的API...');
  
  try {
    // 先登录获取token
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'admin@example.com',
      password: 'admin123'
    });

    if (loginResponse.status === 200 && loginResponse.data.success) {
      const token = loginResponse.data.data.token;
      
      // 使用token访问API
      const apiResponse = await axios.get(`${BASE_URL}/api/influencers`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        timeout: 5000
      });

      if (apiResponse.status === 200) {
        console.log(`  ✅ 成功访问达人API，获取到 ${apiResponse.data.length || 0} 条记录`);
      } else {
        console.log(`  ⚠️ API访问异常 (${apiResponse.status})`);
      }
    } else {
      console.log(`  ❌ 无法获取有效token进行API测试`);
    }
  } catch (error) {
    console.log(`  ❌ API测试失败: ${error.message}`);
  }

  console.log('\n🎯 登录功能测试完成!');
}

// 运行测试
testLogin()
  .catch((error) => {
    console.error('❌ 测试执行失败:', error);
    process.exit(1);
  }); 