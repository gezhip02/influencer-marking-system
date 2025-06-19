'use client';

import React from 'react';
import { 
  ExclamationTriangleIcon,
  ClockIcon,
  MinusIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import { Priority } from '@/types/fulfillment';

interface PriorityBadgeProps {
  priority: Priority;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'dot' | 'minimal';
  showIcon?: boolean;
  className?: string;
}

const PRIORITY_CONFIG = {
  [Priority.URGENT]: {
    label: '紧急',
    color: 'red',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    borderColor: 'border-red-200',
    dotColor: 'bg-red-500',
    icon: FireIcon,
    order: 4
  },
  [Priority.HIGH]: {
    label: '高优先级',
    color: 'orange',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-800',
    borderColor: 'border-orange-200',
    dotColor: 'bg-orange-500',
    icon: ExclamationTriangleIcon,
    order: 3
  },
  [Priority.MEDIUM]: {
    label: '中优先级',
    color: 'yellow',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    borderColor: 'border-yellow-200',
    dotColor: 'bg-yellow-500',
    icon: ClockIcon,
    order: 2
  },
  [Priority.LOW]: {
    label: '低优先级',
    color: 'gray',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-800',
    borderColor: 'border-gray-200',
    dotColor: 'bg-gray-500',
    icon: MinusIcon,
    order: 1
  }
};

const SIZE_CONFIG = {
  sm: {
    padding: 'px-2 py-0.5',
    text: 'text-xs',
    icon: 'w-3 h-3',
    dot: 'w-1.5 h-1.5'
  },
  md: {
    padding: 'px-2.5 py-0.5',
    text: 'text-sm',
    icon: 'w-4 h-4',
    dot: 'w-2 h-2'
  },
  lg: {
    padding: 'px-3 py-1',
    text: 'text-base',
    icon: 'w-5 h-5',
    dot: 'w-2.5 h-2.5'
  }
};

export default function PriorityBadge({
  priority,
  size = 'md',
  variant = 'default',
  showIcon = false,
  className = ''
}: PriorityBadgeProps) {
  const config = PRIORITY_CONFIG[priority];
  const sizeConfig = SIZE_CONFIG[size];
  const IconComponent = config.icon;

  if (!config) {
    return (
      <span className={`inline-flex items-center ${sizeConfig.padding} rounded-full ${sizeConfig.text} font-medium bg-gray-100 text-gray-800 ${className}`}>
        未知优先级
      </span>
    );
  }

  // 默认样式
  if (variant === 'default') {
    return (
      <span className={`inline-flex items-center ${sizeConfig.padding} rounded-full ${sizeConfig.text} font-medium ${config.bgColor} ${config.textColor} ${className}`}>
        {showIcon && <IconComponent className={`${sizeConfig.icon} mr-1`} />}
        {config.label}
      </span>
    );
  }

  // 边框样式
  if (variant === 'outline') {
    return (
      <span className={`inline-flex items-center ${sizeConfig.padding} rounded-full ${sizeConfig.text} font-medium border ${config.borderColor} ${config.textColor} bg-white ${className}`}>
        {showIcon && <IconComponent className={`${sizeConfig.icon} mr-1`} />}
        {config.label}
      </span>
    );
  }

  // 点状样式
  if (variant === 'dot') {
    return (
      <span className={`inline-flex items-center ${sizeConfig.padding} rounded-full ${sizeConfig.text} font-medium ${config.bgColor} ${config.textColor} ${className}`}>
        <span className={`${config.dotColor} ${sizeConfig.dot} rounded-full mr-1.5`}></span>
        {config.label}
      </span>
    );
  }

  // 最小化样式
  if (variant === 'minimal') {
    return (
      <span className={`inline-flex items-center ${sizeConfig.text} font-medium ${config.textColor} ${className}`}>
        {showIcon && <IconComponent className={`${sizeConfig.icon} mr-1`} />}
        {config.label}
      </span>
    );
  }

  return null;
}

// 优先级比较函数
export function comparePriority(a: Priority, b: Priority): number {
  const configA = PRIORITY_CONFIG[a];
  const configB = PRIORITY_CONFIG[b];
  return configB.order - configA.order; // 降序排列，紧急在前
}

// 获取优先级数值
export function getPriorityValue(priority: Priority): number {
  return PRIORITY_CONFIG[priority].order;
}

// 获取优先级颜色
export function getPriorityColor(priority: Priority): string {
  return PRIORITY_CONFIG[priority].color;
}

// 简化版本的优先级指示器
export function PriorityIndicator({ 
  priority, 
  size = 'sm',
  className = "" 
}: { 
  priority: Priority; 
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const config = PRIORITY_CONFIG[priority];
  const sizeConfig = SIZE_CONFIG[size];

  return (
    <div className={`inline-flex items-center ${className}`}>
      <div className={`${config.dotColor} ${sizeConfig.dot} rounded-full mr-2`}></div>
      <span className={`${sizeConfig.text} font-medium ${config.textColor}`}>
        {config.label}
      </span>
    </div>
  );
}

// 导出优先级配置
export { PRIORITY_CONFIG }; 