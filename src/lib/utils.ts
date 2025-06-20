import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { PlatformEnum } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 格式化数字（粉丝数、观看数等）
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

// 格式化百分比
export function formatPercentage(num: number): string {
  return (num * 100).toFixed(1) + '%';
}

// 格式化日期
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

// 格式化相对时间
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (minutes < 60) {
    return `${minutes}分钟前`;
  } else if (hours < 24) {
    return `${hours}小时前`;
  } else if (days < 30) {
    return `${days}天前`;
  } else {
    return formatDate(date);
  }
}

// 获取平台显示名称
export function getPlatformName(platform: PlatformEnum): string {
  const platformNames: Record<PlatformEnum, string> = {
    [PlatformEnum.TIKTOK]: 'TikTok',
    [PlatformEnum.DOUYIN]: '抖音',
    [PlatformEnum.KUAISHOU]: '快手',
    [PlatformEnum.WEIXIN_CHANNELS]: '视频号',
    [PlatformEnum.XIAOHONGSHU]: '小红书',
    [PlatformEnum.BILIBILI]: 'B站',
    [PlatformEnum.WEIBO]: '微博'
  };
  return platformNames[platform];
}

// 获取平台颜色
export function getPlatformColor(platform: PlatformEnum): string {
  const platformColors: Record<PlatformEnum, string> = {
    [PlatformEnum.TIKTOK]: 'bg-black',
    [PlatformEnum.DOUYIN]: 'bg-red-500',
    [PlatformEnum.KUAISHOU]: 'bg-orange-500',
    [PlatformEnum.WEIXIN_CHANNELS]: 'bg-green-500',
    [PlatformEnum.XIAOHONGSHU]: 'bg-pink-500',
    [PlatformEnum.BILIBILI]: 'bg-blue-500',
    [PlatformEnum.WEIBO]: 'bg-yellow-500'
  };
  return platformColors[platform];
}

// 生成随机颜色（用于标签）
export function generateTagColor(): string {
  const colors = [
    'bg-blue-100 text-blue-800',
    'bg-green-100 text-green-800',
    'bg-yellow-100 text-yellow-800',
    'bg-red-100 text-red-800',
    'bg-purple-100 text-purple-800',
    'bg-pink-100 text-pink-800',
    'bg-indigo-100 text-indigo-800',
    'bg-gray-100 text-gray-800',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// 防抖函数
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// 节流函数
export function throttle<T extends (...args: any[]) => void>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// 深拷贝对象
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as unknown as T;
  if (typeof obj === 'object') {
    const clonedObj = {} as any;
    for (const key in obj) {
      clonedObj[key] = deepClone(obj[key]);
    }
    return clonedObj;
  }
  return obj;
}

// 计算互动率
export function calculateEngagementRate(
  likes: number,
  comments: number,
  shares: number,
  followers: number
): number {
  if (followers === 0) return 0;
  return (likes + comments + shares) / followers;
}

// 生成唯一ID
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

// 验证邮箱
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// 验证手机号
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
} 