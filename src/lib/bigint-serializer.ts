/**
 * BigInt 序列化工具
 * 用于处理数据库返回的 BigInt 类型转换为字符串
 */

// 递归序列化对象中的所有 BigInt 字段
export function serializeBigInt(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'bigint') {
    return obj.toString();
  }

  // 处理 Decimal.js 对象
  if (obj && typeof obj === 'object' && obj.constructor && obj.constructor.name === 'Decimal') {
    return Number(obj.toString());
  }

  // 处理可能的 Decimal 对象结构
  if (obj && typeof obj === 'object' && obj.s !== undefined && obj.e !== undefined && obj.d !== undefined) {
    // 这是一个 Decimal.js 对象的内部结构
    try {
      // 尝试重建数字值
      const sign = obj.s === 1 ? 1 : -1;
      const exponent = obj.e;
      const digits = obj.d;
      
      if (Array.isArray(digits) && digits.length > 0) {
        let value = 0;
        for (let i = 0; i < digits.length; i++) {
          value = value * 10 + digits[i];
        }
        return sign * value * Math.pow(10, exponent - digits.length + 1);
      }
    } catch (error) {
      console.warn('Failed to parse Decimal object:', obj);
      return 0;
    }
  }

  if (Array.isArray(obj)) {
    return obj.map(item => serializeBigInt(item));
  }

  if (typeof obj === 'object') {
    const serialized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      serialized[key] = serializeBigInt(value);
    }
    return serialized;
  }

  return obj;
}

// 专门用于标签的序列化
export function serializeTag(tag: any) {
  if (!tag) return null;
  
  return serializeBigInt(tag);
}

// 专门用于达人的序列化
export function serializeInfluencer(influencer: any) {
  if (!influencer) return null;
  
  return serializeBigInt(influencer);
}

// 分页数据序列化
export function serializePagination<T>(data: {
  items: T[];
  total: number;
  page: number;
  limit: number;
}) {
  return {
    items: serializeBigInt(data.items),
    pagination: {
      total: data.total,
      page: data.page,
      limit: data.limit,
      pages: Math.ceil(data.total / data.limit)
    }
  };
} 