const fs = require('fs');

console.log(' 综合修复履约单系统...\n');

// 1. 修复状态枚举
console.log('1. 更新状态枚举...');
const typesPath = 'src/types/fulfillment.ts';
let typesContent = fs.readFileSync(typesPath, 'utf8');

if (!typesContent.includes('SALES_CONVERSION')) {
  typesContent = typesContent.replace(
    'CONTENT_PUBLISHED = \\'content_published\\',     // 内容已发布',
    'CONTENT_PUBLISHED = \\'content_published\\',     // 内容已发布\\n  SALES_CONVERSION = \\'sales_conversion\\',       // 销售转化'
  );
}

if (!typesContent.includes('FINISHED')) {
  typesContent = typesContent.replace(
    'SETTLEMENT_COMPLETED = \\'settlement_completed\\', // 结算完成',
    'SETTLEMENT_COMPLETED = \\'settlement_completed\\', // 结算完成\\n  FINISHED = \\'finished\\',                       // 已完成'
  );
}

fs.writeFileSync(typesPath, typesContent, 'utf8');
console.log(' 状态枚举已更新');

console.log(' 修复完成');
