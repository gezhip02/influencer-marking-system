// 测试 Decimal 修复
const { serializeBigInt } = require('./src/lib/bigint-serializer.ts');

console.log('🧪 测试 Decimal 对象处理...\n');

// 模拟从错误日志中看到的 Decimal 对象
const decimalObject = {
  s: 1,
  e: 0,
  d: [0]
};

console.log('原始 Decimal 对象:', JSON.stringify(decimalObject));

// 测试序列化
const serialized = serializeBigInt(decimalObject);
console.log('序列化后:', serialized, typeof serialized);

// 测试不同的 Decimal 对象
const testCases = [
  { name: '零值', obj: { s: 1, e: 0, d: [0] } },
  { name: '正整数', obj: { s: 1, e: 3, d: [1, 0, 0, 0] } },
  { name: '负数', obj: { s: -1, e: 2, d: [5, 0, 0] } },
  { name: '小数', obj: { s: 1, e: 0, d: [1, 2, 3] } },
  { name: '1000', obj: { s: 1, e: 3, d: [1, 0, 0, 0] } }
];

console.log('\n📊 测试不同 Decimal 对象:');
testCases.forEach(test => {
  const result = serializeBigInt(test.obj);
  console.log(`  ${test.name}: ${JSON.stringify(test.obj)} → ${result}`);
});

// 测试完整的对象
const testInfluencer = {
  id: "123",
  username: "test",
  baseCooperationFee: { s: 1, e: 3, d: [1, 0, 0, 0] }, // 应该是 1000
  followersCount: 5000
};

console.log('\n🔍 测试完整对象:');
console.log('原始:', JSON.stringify(testInfluencer));
const serializedInfluencer = serializeBigInt(testInfluencer);
console.log('序列化后:', JSON.stringify(serializedInfluencer));

console.log('\n✅ 测试完成!'); 