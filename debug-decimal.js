// 调试 Decimal 类型问题
console.log('🔍 调试 Decimal 类型问题...\n');

// 测试不同类型的数据
const testValues = [
  { name: 'number', value: 1000 },
  { name: 'string', value: "1000" },
  { name: 'float', value: 1000.50 },
  { name: 'null', value: null },
  { name: 'undefined', value: undefined },
  { name: 'empty string', value: '' },
  { name: 'zero', value: 0 }
];

console.log('📊 测试不同数据类型:');
testValues.forEach(test => {
  console.log(`  - ${test.name}: ${JSON.stringify(test.value)} (${typeof test.value})`);
});

console.log('\n🧪 模拟 API 处理逻辑:');

function processBaseCooperationFee(value) {
  console.log(`输入值: ${JSON.stringify(value)} (${typeof value})`);
  
  // 原始处理方式
  const result1 = value || null;
  console.log(`  原始处理 (value || null): ${JSON.stringify(result1)}`);
  
  // 修复后的处理方式
  let result2;
  if (value === null || value === '' || value === undefined) {
    result2 = null;
  } else {
    result2 = Number(value);
  }
  console.log(`  修复处理 (Number转换): ${JSON.stringify(result2)}`);
  
  console.log('---');
}

testValues.forEach(test => {
  processBaseCooperationFee(test.value);
});

// 测试 JSON 序列化
console.log('\n📦 测试 JSON 序列化:');
const testData = {
  baseCooperationFee: 1000,
  otherField: "test"
};

console.log('原始数据:', JSON.stringify(testData));

// 模拟前端发送的数据
const frontendData = {
  id: "193296151888269312",
  // baseCooperationFee: 1000, // 字段已删除
  // cooperationCurrency: "USD" // 字段已删除
};

console.log('前端数据:', JSON.stringify(frontendData));

// 模拟可能的 Decimal 对象
const possibleDecimalObject = {
  s: 1,
  e: 0,
  d: [1000]
};

console.log('可能的 Decimal 对象:', JSON.stringify(possibleDecimalObject));

console.log('\n✅ 调试完成!'); 