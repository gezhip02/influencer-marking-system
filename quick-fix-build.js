const fs = require('fs');

console.log('🔧 快速修复build错误...\n');

// 1. 修复状态枚举 - 添加缺失的状态
console.log('1. 更新状态枚举...');
try {
  const fulfillmentTypesPath = 'src/types/fulfillment.ts';
  let typesContent = fs.readFileSync(fulfillmentTypesPath, 'utf8');

  // 添加SALES_CONVERSION状态
  if (!typesContent.includes('SALES_CONVERSION')) {
    typesContent = typesContent.replace(
      'CONTENT_PUBLISHED = \'content_published\',     // 内容已发布',
      'CONTENT_PUBLISHED = \'content_published\',     // 内容已发布\n  SALES_CONVERSION = \'sales_conversion\',       // 销售转化'
    );
    console.log('   ✅ 添加SALES_CONVERSION状态');
  }

  // 添加FINISHED状态
  if (!typesContent.includes('FINISHED')) {
    typesContent = typesContent.replace(
      'SETTLEMENT_COMPLETED = \'settlement_completed\', // 结算完成',
      'SETTLEMENT_COMPLETED = \'settlement_completed\', // 结算完成\n  FINISHED = \'finished\',                       // 已完成'
    );
    console.log('   ✅ 添加FINISHED状态');
  }

  fs.writeFileSync(fulfillmentTypesPath, typesContent, 'utf8');
  console.log('   ✅ 状态枚举已更新');
} catch (error) {
  console.log('   ❌ 更新状态枚举失败:', error.message);
}

// 2. 修复StatusBadge - 移除不存在的状态配置
console.log('\n2. 修复StatusBadge配置...');
try {
  const statusBadgePath = 'src/components/ui/StatusBadge.tsx';
  let badgeContent = fs.readFileSync(statusBadgePath, 'utf8');

  // 新的简化的STATUS_CONFIG，只包含实际存在的状态
  const newConfig = `const STATUS_CONFIG = {
  [FulfillmentStatus.PENDING_SAMPLE]: {
    label: '待寄样',
    color: 'yellow',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    borderColor: 'border-yellow-200',
    dotColor: 'bg-yellow-400'
  },
  [FulfillmentStatus.SAMPLE_SENT]: {
    label: '已寄样',
    color: 'blue',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    borderColor: 'border-blue-200',
    dotColor: 'bg-blue-400'
  },
  [FulfillmentStatus.SAMPLE_RECEIVED]: {
    label: '已签收',
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    borderColor: 'border-green-200',
    dotColor: 'bg-green-400'
  },
  [FulfillmentStatus.CONTENT_CREATION]: {
    label: '内容制作',
    color: 'purple',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800',
    borderColor: 'border-purple-200',
    dotColor: 'bg-purple-400'
  },
  [FulfillmentStatus.CONTENT_PUBLISHED]: {
    label: '已发布',
    color: 'teal',
    bgColor: 'bg-teal-100',
    textColor: 'text-teal-800',
    borderColor: 'border-teal-200',
    dotColor: 'bg-teal-400'
  },
  [FulfillmentStatus.SALES_CONVERSION]: {
    label: '销售转化',
    color: 'orange',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-800',
    borderColor: 'border-orange-200',
    dotColor: 'bg-orange-400'
  },
  [FulfillmentStatus.FINISHED]: {
    label: '已完成',
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    borderColor: 'border-green-200',
    dotColor: 'bg-green-400'
  },
  [FulfillmentStatus.CANCELLED]: {
    label: '已取消',
    color: 'gray',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-800',
    borderColor: 'border-gray-200',
    dotColor: 'bg-gray-400'
  },
  [FulfillmentStatus.EXPIRED]: {
    label: '已过期',
    color: 'slate',
    bgColor: 'bg-slate-100',
    textColor: 'text-slate-800',
    borderColor: 'border-slate-200',
    dotColor: 'bg-slate-400'
  }
};`;

  // 找到并替换STATUS_CONFIG
  const configStart = badgeContent.indexOf('const STATUS_CONFIG = {');
  if (configStart !== -1) {
    const configEnd = badgeContent.indexOf('};', configStart) + 2;
    badgeContent = badgeContent.substring(0, configStart) + newConfig + badgeContent.substring(configEnd);
    
    fs.writeFileSync(statusBadgePath, badgeContent, 'utf8');
    console.log('   ✅ StatusBadge配置已更新');
  } else {
    console.log('   ⚠️ 未找到STATUS_CONFIG配置');
  }
} catch (error) {
  console.log('   ❌ 更新StatusBadge失败:', error.message);
}

console.log('\n🎉 修复完成！');
console.log('\n📋 修复内容:');
console.log('1. ✅ 添加SALES_CONVERSION和FINISHED状态枚举');
console.log('2. ✅ 更新StatusBadge配置，移除不存在的状态');
console.log('\n🚀 可以重新运行 npm run build 了'); 