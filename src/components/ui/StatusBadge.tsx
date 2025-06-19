'use client';

import React from 'react';
import { FulfillmentStatus } from '@/types/fulfillment';

interface StatusBadgeProps {
  status: FulfillmentStatus;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'dot' | 'outline';
  className?: string;
}

const STATUS_CONFIG = {
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
    label: '已收样',
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    borderColor: 'border-green-200',
    dotColor: 'bg-green-400'
  },
  [FulfillmentStatus.CONTENT_PLANNING]: {
    label: '内容策划中',
    color: 'purple',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800',
    borderColor: 'border-purple-200',
    dotColor: 'bg-purple-400'
  },
  [FulfillmentStatus.CONTENT_PRODUCTION]: {
    label: '内容制作中',
    color: 'orange',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-800',
    borderColor: 'border-orange-200',
    dotColor: 'bg-orange-400'
  },
  [FulfillmentStatus.CONTENT_REVIEW]: {
    label: '内容审核中',
    color: 'indigo',
    bgColor: 'bg-indigo-100',
    textColor: 'text-indigo-800',
    borderColor: 'border-indigo-200',
    dotColor: 'bg-indigo-400'
  },
  [FulfillmentStatus.CONTENT_APPROVED]: {
    label: '内容已通过',
    color: 'emerald',
    bgColor: 'bg-emerald-100',
    textColor: 'text-emerald-800',
    borderColor: 'border-emerald-200',
    dotColor: 'bg-emerald-400'
  },
  [FulfillmentStatus.CONTENT_REJECTED]: {
    label: '内容被拒绝',
    color: 'red',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    borderColor: 'border-red-200',
    dotColor: 'bg-red-400'
  },
  [FulfillmentStatus.CONTENT_PUBLISHED]: {
    label: '已发布',
    color: 'teal',
    bgColor: 'bg-teal-100',
    textColor: 'text-teal-800',
    borderColor: 'border-teal-200',
    dotColor: 'bg-teal-400'
  },
  [FulfillmentStatus.TRACKING_STARTED]: {
    label: '数据跟踪中',
    color: 'pink',
    bgColor: 'bg-pink-100',
    textColor: 'text-pink-800',
    borderColor: 'border-pink-200',
    dotColor: 'bg-pink-400'
  },
  [FulfillmentStatus.TRACKING_COMPLETED]: {
    label: '跟踪完成',
    color: 'cyan',
    bgColor: 'bg-cyan-100',
    textColor: 'text-cyan-800',
    borderColor: 'border-cyan-200',
    dotColor: 'bg-cyan-400'
  },
  [FulfillmentStatus.SETTLEMENT_PENDING]: {
    label: '待结算',
    color: 'amber',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-800',
    borderColor: 'border-amber-200',
    dotColor: 'bg-amber-400'
  },
  [FulfillmentStatus.SETTLEMENT_COMPLETED]: {
    label: '结算完成',
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
};

const SIZE_CONFIG = {
  sm: {
    padding: 'px-2 py-0.5',
    text: 'text-xs',
    dot: 'w-1.5 h-1.5'
  },
  md: {
    padding: 'px-2.5 py-0.5',
    text: 'text-sm',
    dot: 'w-2 h-2'
  },
  lg: {
    padding: 'px-3 py-1',
    text: 'text-base',
    dot: 'w-2.5 h-2.5'
  }
};

export default function StatusBadge({
  status,
  size = 'md',
  variant = 'default',
  className = ''
}: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const sizeConfig = SIZE_CONFIG[size];

  if (!config) {
    return (
      <span className={`inline-flex items-center ${sizeConfig.padding} rounded-full ${sizeConfig.text} font-medium bg-gray-100 text-gray-800 ${className}`}>
        未知状态
      </span>
    );
  }

  // 默认样式
  if (variant === 'default') {
    return (
      <span className={`inline-flex items-center ${sizeConfig.padding} rounded-full ${sizeConfig.text} font-medium ${config.bgColor} ${config.textColor} ${className}`}>
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

  // 边框样式
  if (variant === 'outline') {
    return (
      <span className={`inline-flex items-center ${sizeConfig.padding} rounded-full ${sizeConfig.text} font-medium border ${config.borderColor} ${config.textColor} bg-white ${className}`}>
        {config.label}
      </span>
    );
  }

  return null;
}

// 导出状态配置供其他组件使用
export { STATUS_CONFIG }; 