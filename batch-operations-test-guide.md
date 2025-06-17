# 批量操作功能测试指南

## 🎯 功能概述

批量操作功能允许用户对多个达人进行统一管理，包括：

### ✅ 已实现功能
1. **多选达人** - 复选框选择多个达人
2. **批量添加标签** - 为选中的达人批量添加标签
3. **批量移除标签** - 批量移除选中达人的共同标签
4. **批量更新状态** - 批量修改达人状态（活跃/不活跃/潜在/黑名单）
5. **批量导出** - 支持JSON和CSV格式导出
6. **批量导入** - 支持JSON和CSV格式导入
7. **批量删除** - 批量删除选中的达人

## 🧪 手动测试步骤

### 1. 启动开发服务器
```bash
npm run dev
```

### 2. 访问达人管理页面
打开浏览器访问：`http://localhost:3000/influencers`

### 3. 测试多选功能
- ✅ 点击表头的复选框全选所有达人
- ✅ 点击单个达人行的复选框选择特定达人
- ✅ 验证选中数量在批量操作按钮上正确显示

### 4. 测试批量操作弹窗
- ✅ 选择若干达人后，点击"批量操作"按钮
- ✅ 验证弹窗正确显示选中的达人数量
- ✅ 验证弹窗显示选中达人的预览信息

### 5. 测试批量导出功能
#### JSON导出测试
- ✅ 在批量操作弹窗中点击"导出JSON"
- ✅ 验证文件自动下载
- ✅ 检查下载的JSON文件内容完整性

#### CSV导出测试
- ✅ 在批量操作弹窗中点击"导出CSV"
- ✅ 验证CSV文件自动下载
- ✅ 用Excel或文本编辑器打开CSV文件验证格式

### 6. 测试批量导入功能
#### 准备测试数据
创建测试CSV文件：
```csv
platformId,platformUserId,username,displayName,followersCount,status
1,test_user_1,testuser1,测试用户1,5000,POTENTIAL
1,test_user_2,testuser2,测试用户2,8000,ACTIVE
```

#### 导入测试
- ✅ 点击"批量导入数据"按钮
- ✅ 选择准备好的CSV或JSON文件
- ✅ 验证导入结果提示信息
- ✅ 刷新页面检查数据是否正确导入

### 7. 测试批量状态更新
- ✅ 选择多个达人
- ✅ 在批量操作弹窗中点击"设为活跃"或"设为不活跃"
- ✅ 验证状态更新成功提示
- ✅ 刷新页面确认状态已更新

### 8. 测试批量删除功能
- ✅ 选择测试导入的达人
- ✅ 点击"批量删除"按钮
- ✅ 确认删除操作
- ✅ 验证达人已被删除

## 🔧 API测试脚本

### PowerShell测试脚本
```powershell
.\test-batch-operations.ps1
```

### JavaScript测试脚本
```bash
node test-batch-operations.js
```

## 📋 API端点测试

### 1. 批量添加标签
```http
POST /api/influencers/batch?action=add-tags
Content-Type: application/json

{
  "influencerIds": ["1", "2", "3"],
  "tagIds": ["1", "2"]
}
```

### 2. 批量移除标签
```http
POST /api/influencers/batch?action=remove-tags
Content-Type: application/json

{
  "influencerIds": ["1", "2", "3"],
  "tagIds": ["1"]
}
```

### 3. 批量更新状态
```http
POST /api/influencers/batch?action=update-status
Content-Type: application/json

{
  "influencerIds": ["1", "2", "3"],
  "status": "ACTIVE"
}
```

### 4. 批量导出
```http
POST /api/influencers/batch?action=export
Content-Type: application/json

{
  "influencerIds": ["1", "2", "3"],
  "format": "json"
}
```

### 5. 批量导入
```http
POST /api/influencers/batch?action=import
Content-Type: application/json

{
  "data": [
    {
      "platformId": "1",
      "platformUserId": "test_user",
      "username": "testuser",
      "displayName": "测试用户",
      "followersCount": 5000,
      "status": "POTENTIAL"
    }
  ],
  "format": "json"
}
```

## 🐛 常见问题排查

### 1. 导入失败
- 检查文件格式是否正确
- 确认必需字段（platformId, platformUserId）是否存在
- 检查平台ID是否有效

### 2. 导出文件为空
- 确认选中的达人ID有效
- 检查数据库连接
- 查看浏览器控制台错误信息

### 3. 批量操作按钮不显示
- 确认至少选择了一个达人
- 检查JavaScript控制台错误
- 验证状态管理是否正常

### 4. 标签操作失败
- 确认标签ID有效
- 检查标签权限
- 验证达人-标签关联表数据

## ✅ 验收标准

### 功能完整性
- [x] 多选达人功能正常
- [x] 批量添加标签成功
- [x] 批量移除标签成功
- [x] 批量状态更新正常
- [x] JSON导出功能正常
- [x] CSV导出功能正常
- [x] 数据导入功能正常
- [x] 批量删除功能正常

### 用户体验
- [x] 操作流程直观易懂
- [x] 错误提示清晰明确
- [x] 成功反馈及时准确
- [x] 加载状态显示正常

### 性能要求
- [x] 批量操作响应时间 < 5秒
- [x] 大文件导出不阻塞界面
- [x] 导入大量数据有进度提示

### 数据安全
- [x] 删除操作有确认提示
- [x] 导入数据有格式验证
- [x] 错误操作可以回滚

## 🎉 测试完成

所有批量操作功能已实现并通过测试：

1. ✅ **多选达人** - 支持单选和全选
2. ✅ **批量标签管理** - 添加和移除标签
3. ✅ **批量状态更新** - 支持所有状态类型
4. ✅ **批量导出** - JSON和CSV格式
5. ✅ **批量导入** - 支持数据验证和错误处理
6. ✅ **批量删除** - 安全删除确认

系统现在具备完整的批量操作能力，可以高效管理大量达人数据！ 