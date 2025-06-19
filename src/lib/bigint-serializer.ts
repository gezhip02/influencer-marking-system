/**
 * BigInt 和时间戳序列化工具
 * 处理 MySQL BigInt 类型和时间戳的序列化/反序列化
 */

// BigInt序列化函数
export function serializeBigInt(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'bigint') {
    return obj.toString();
  }

  if (Array.isArray(obj)) {
    return obj.map(serializeBigInt);
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

// 时间戳工具函数
export const timestampUtils = {
  // 获取当前秒级时间戳
  now(): number {
    return Math.floor(Date.now() / 1000);
  },

  // 日期转秒级时间戳
  fromDate(date: Date): number {
    return Math.floor(date.getTime() / 1000);
  },

  // 秒级时间戳转日期
  toDate(timestamp: number): Date {
    return new Date(timestamp * 1000);
  },

  // 格式化时间戳为可读字符串
  format(timestamp: number, locale: string = 'zh-CN'): string {
    return new Date(timestamp * 1000).toLocaleString(locale);
  },

  // 检查是否为有效时间戳
  isValid(timestamp: number): boolean {
    return timestamp > 0 && timestamp < 4102444800; // 2100年之前
  },

  // 时间戳转ISO字符串
  toISOString(timestamp: number): string {
    return new Date(timestamp * 1000).toISOString();
  },

  // ISO字符串转时间戳
  fromISOString(isoString: string): number {
    return Math.floor(new Date(isoString).getTime() / 1000);
  }
};

// 处理模型数据中的时间戳字段
export function processTimestamps(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(processTimestamps);
  }

  if (typeof obj === 'object') {
    const processed: any = {};
    for (const [key, value] of Object.entries(obj)) {
      // 处理时间戳字段
      if (key.includes('Time') || key.includes('At') || key === 'recordDate' || key === 'communicationDate') {
        if (typeof value === 'number' && timestampUtils.isValid(value)) {
          processed[key] = value;
        } else if (value instanceof Date) {
          processed[key] = timestampUtils.fromDate(value);
        } else if (typeof value === 'string' && value) {
          try {
            processed[key] = timestampUtils.fromISOString(value);
          } catch {
            processed[key] = value;
          }
        } else {
          processed[key] = value;
        }
      } else {
        processed[key] = processTimestamps(value);
      }
    }
    return processed;
  }

  return obj;
}

// 为API响应处理分页数据
export function serializePagination<T>(result: {
  items: T[];
  total: number;
  page: number;
  limit: number;
}): {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
} {
  return {
    items: result.items.map(item => serializeBigInt(processTimestamps(item))),
    total: result.total,
    page: result.page,
    limit: result.limit,
    pages: Math.ceil(result.total / result.limit),
  };
}

// 序列化单个实体
export function serializeEntity<T>(entity: T): T {
  return serializeBigInt(processTimestamps(entity));
}

// 为创建/更新操作准备数据
export function prepareForDatabase(data: any): any {
  if (data === null || data === undefined) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(prepareForDatabase);
  }

  if (typeof data === 'object') {
    const prepared: any = {};
    for (const [key, value] of Object.entries(data)) {
      // 处理时间戳字段 - 如果是当前时间，使用 now()
      if ((key === 'createdAt' || key === 'updatedAt') && !value) {
        prepared[key] = timestampUtils.now();
      } else if (key.includes('Time') || key.includes('At') || key === 'recordDate' || key === 'communicationDate' || key === 'lastDataSync') {
        if (value === null || value === undefined || value === '') {
          prepared[key] = null;
        } else if (typeof value === 'string' && value) {
          try {
            prepared[key] = timestampUtils.fromISOString(value);
          } catch {
            // 如果无法解析字符串，设为null而不是保留字符串
            prepared[key] = null;
          }
        } else if (value instanceof Date) {
          prepared[key] = timestampUtils.fromDate(value);
        } else if (typeof value === 'number') {
          prepared[key] = value;
        } else {
          prepared[key] = null;
        }
      } 
      // 处理BigInt字段 - 只有真正的ID字段才转换为BigInt
      else if (typeof value === 'string' && (key === 'id' || (key.endsWith('Id') && key !== 'platformUserId')) && value) {
        try {
          prepared[key] = BigInt(value);
        } catch {
          prepared[key] = value;
        }
      } else {
        prepared[key] = prepareForDatabase(value);
      }
    }
    return prepared;
  }

  return data;
}

// 状态值映射
export const statusMappings = {
  // 通用状态
  common: {
    DISABLED: 0,
    ACTIVE: 1,
  },
  
  // 合作状态
  cooperate: {
    PENDING: 1,      // 待合作
    COOPERATED: 2,   // 已合作
    TERMINATED: 3,   // 终止合作
  },
  
  // 签约状态
  sign: {
    UNSIGNED: 0,     // 未签约
    SIGNING: 1,      // 签约中
    SIGNED: 2,       // 已签约
  },
  
  // 导入状态
  import: {
    PENDING: 0,      // 待处理
    PROCESSING: 1,   // 处理中
    SUCCESS: 2,      // 成功
    FAILED: 3,       // 失败
  },
  
  // 需要样品状态
  sample: {
    NOT_NEEDED: 0,   // 不需要
    NEEDED: 1,       // 需要
  }
};

// 获取状态文本
export function getStatusText(type: keyof typeof statusMappings, value: number): string {
  const mapping = statusMappings[type];
  const entry = Object.entries(mapping).find(([, v]) => v === value);
  return entry ? entry[0] : 'UNKNOWN';
}

// 状态值反向查找
export function getStatusValue(type: keyof typeof statusMappings, text: string): number {
  const mapping = statusMappings[type];
  return (mapping as any)[text.toUpperCase()] ?? -1;
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