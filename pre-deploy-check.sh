#!/bin/bash
echo "🚀 部署前检查..."

echo "1. 检查TypeScript编译..."
npx tsc --noEmit

echo "2. 检查ESLint..."
npx eslint src --ext .ts,.tsx

echo "3. 运行构建测试..."
npm run build

echo "✅ 部署检查完成！"
