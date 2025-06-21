# 从Prisma到Supabase客户端迁移指南

## 🎯 迁移目标

将项目从使用Prisma直连PostgreSQL改为使用Supabase官方客户端，提供更稳定、更高效的数据库连接。

## ✅ 当前状态

- ✅ Supabase客户端依赖已安装
- ✅ 环境变量配置正确
- ✅ Supabase连接测试成功
- ✅ 项目处于活跃状态

## 🔄 迁移步骤

### 步骤1: 使用Supabase创建表结构

首先需要在Supabase中创建表结构。有两种方式：

#### 方式A: 使用Prisma迁移（推荐）
```bash
# 将表结构推送到Supabase
npx prisma db push

# 生成Prisma客户端
npx prisma generate
```

#### 方式B: 使用Supabase SQL Editor
1. 访问 https://app.supabase.com/project/efzpntcevdiwkaqubrxq
2. 进入 SQL Editor
3. 执行项目中的 `create_tables.sql` 文件

### 步骤2: 更新API路由

将现有的API路由从Prisma改为Supabase客户端。

#### 示例迁移：用户API

**原来的代码 (Prisma):**
```typescript
import prisma from '@/lib/prisma'

export async function GET() {
  const users = await prisma.user.findMany({
    where: { status: 1 }
  })
  return NextResponse.json(users)
}
```

**新的代码 (Supabase):**
```typescript
import { db } from '@/lib/supabase'

export async function GET() {
  const users = await db.users.getAll()
  return NextResponse.json(users)
}
```

### 步骤3: 更新前端组件

将前端组件中的数据获取逻辑更新为使用Supabase客户端。

#### 示例：用户列表组件

**原来的代码:**
```typescript
const fetchUsers = async () => {
  const response = await fetch('/api/users')
  const data = await response.json()
  return data
}
```

**新的代码:**
```typescript
import { supabase } from '@/lib/supabase'

const fetchUsers = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('status', 1)
  
  if (error) throw error
  return data
}
```

### 步骤4: 实时功能（可选）

Supabase的一个巨大优势是内置实时功能：

```typescript
import { supabase } from '@/lib/supabase'

// 监听用户表变化
const channel = supabase
  .channel('users_changes')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'users' },
    (payload) => {
      console.log('用户数据变化:', payload)
      // 更新UI
    }
  )
  .subscribe()
```

## 🔧 配置文件更新

### 1. 环境变量 (.env.local)

确保以下环境变量已正确设置：
```env
NEXT_PUBLIC_SUPABASE_URL=https://efzpntcevdiwkaqubrxq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 如果需要服务端操作，添加service key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. TypeScript配置

在 `src/types/supabase.ts` 中添加类型定义：

```typescript
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string | null
          email: string
          // ... 其他字段
        }
        Insert: {
          id: string
          name?: string | null
          email: string
          // ... 其他字段
        }
        Update: {
          id?: string
          name?: string | null
          email?: string
          // ... 其他字段
        }
      }
      // ... 其他表
    }
  }
}
```

## 🚀 迁移优势

### 1. 性能提升
- 更快的连接建立
- 内置连接池
- 边缘网络加速

### 2. 功能增强
- 实时数据订阅
- 内置认证
- 行级安全(RLS)
- 存储功能

### 3. 开发体验
- 更简单的API
- 更好的错误处理
- 内置TypeScript支持

## 📋 迁移检查清单

- [ ] 创建数据库表结构
- [ ] 更新用户相关API
- [ ] 更新达人相关API
- [ ] 更新履约相关API
- [ ] 更新标签相关API
- [ ] 更新前端组件
- [ ] 测试所有功能
- [ ] 部署验证

## 🔍 测试命令

```bash
# 测试Supabase连接
node simple-supabase-test.js

# 测试API端点
node test-api-simple.js

# 启动开发服务器
npm run dev
```

## 📞 需要帮助？

如果在迁移过程中遇到问题：

1. 检查Supabase项目状态
2. 验证环境变量配置
3. 查看控制台错误信息
4. 使用测试脚本诊断问题

## 🎯 下一步

1. 立即执行步骤1创建表结构
2. 逐步迁移API路由
3. 测试每个迁移的功能
4. 完成后清理不需要的Prisma代码

迁移完成后，你将拥有一个更现代、更稳定的数据库连接方案！