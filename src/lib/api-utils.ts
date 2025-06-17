/**
 * API响应统一处理工具
 * 用于确保API响应的一致性和安全性
 */

export interface BaseApiResponse<T = any> {
  success?: boolean;
  error?: string;
  details?: string;
}

export interface PaginatedResponse<T> extends BaseApiResponse {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  stats?: Record<string, any>;
}

export interface SingleItemResponse<T> extends BaseApiResponse {
  data: T;
}

/**
 * 验证API响应是否包含必需字段
 */
export function validateApiResponse<T>(
  response: any,
  requiredFields: string[] = []
): response is T {
  if (!response || typeof response !== 'object') {
    return false;
  }

  return requiredFields.every(field => {
    const keys = field.split('.');
    let current = response;
    
    for (const key of keys) {
      if (current == null || typeof current !== 'object' || !(key in current)) {
        return false;
      }
      current = current[key];
    }
    
    return true;
  });
}

/**
 * 为分页响应提供默认值
 */
export function ensurePaginatedResponse<T>(
  response: any,
  defaultItems: T[] = []
): PaginatedResponse<T> {
  return {
    items: response?.items || defaultItems,
    pagination: response?.pagination || {
      page: 1,
      limit: 20,
      total: 0,
      pages: 0
    },
    stats: response?.stats || {},
    success: response?.success !== false,
    error: response?.error || null,
    details: response?.details || null
  };
}

/**
 * 统一的fetch包装器，自动处理错误和响应验证
 */
export async function safeFetch<T>(
  url: string,
  options: RequestInit = {},
  requiredFields: string[] = []
): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
      }
      
      throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }

    const data = await response.json();
    
    if (requiredFields.length > 0 && !validateApiResponse(data, requiredFields)) {
      console.warn('API response missing required fields:', requiredFields);
    }
    
    return data;
  } catch (error) {
    console.error(`API request failed for ${url}:`, error);
    throw error;
  }
}

/**
 * 为统计数据提供默认值
 */
export function ensureStats(stats: any, defaultStats: Record<string, any> = {}): Record<string, any> {
  return {
    ...defaultStats,
    ...stats
  };
}

/**
 * 通用的API错误处理器
 */
export function handleApiError(error: any, context: string = 'API操作'): string {
  console.error(`${context}失败:`, error);
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return `${context}失败，请稍后重试`;
} 