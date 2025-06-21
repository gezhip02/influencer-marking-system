# Vercel DATABASE_URL 环境变量修复指南

## 问题现象
```
Error [PrismaClientInitializationError]: 
Invalid `prisma.influencer.findMany()` invocation:

error: Error validating datasource `db`: the URL must start with the protocol `postgresql://` or `postgres://`.
  -->  schema.prisma:7
   | 
 6 |   provider = "postgresql"
 7 |   url      = env("DATABASE_URL")
```

## 解决方案

### 1. 访问调试API
部署完成后，访问：`https://你的域名.vercel.app/api/debug-env`

这个API会显示：
- 环境变量是否存在
- 实际的值和长度
- 是否包含引号或空格
- 是否以正确的协议开头

### 2. 在Vercel Dashboard中修复环境变量

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 找到您的项目，点击进入
3. 点击 **Settings**  **Environment Variables**
4. **删除所有现有的 DATABASE_URL 变量**
5. 点击 **"Add New"** 添加新变量：

```
Name: DATABASE_URL
Value: postgresql://postgres:rR9tYMTfwaG0LGbH@db.efzpntcevdiwkaqubrxq.supabase.co:5432/postgres
Environment: Production, Preview, Development (全选)
```

 **重要**：确保没有双引号包围整个URL！

### 3. 重新部署
设置环境变量后，必须重新部署：
- 在 Deployments 页面点击 **"Redeploy"**
- 或者推送一个新的 commit 触发部署

### 4. 验证修复
部署完成后：
1. 访问 `/api/debug-env` 查看环境变量状态
2. 访问 `/api/influencers` 测试数据库连接
3. 检查 Vercel Functions 日志确认无错误

## 常见问题

### Q: 为什么本地正常，Vercel报错？
A: 本地使用 .env.local，Vercel使用Dashboard设置的环境变量，两者可能不同

### Q: 设置环境变量后还是报错？
A: 必须重新部署才能生效，设置环境变量不会自动触发部署

### Q: URL格式正确但还是报错？
A: 检查是否有隐藏字符或BOM，确保使用UTF-8编码

### Q: 如何确认修复成功？
A: 访问 `/api/debug-env` 查看 `startsWithPostgresql: true` 且无错误日志
