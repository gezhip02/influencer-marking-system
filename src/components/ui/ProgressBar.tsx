'use client';

import React from 'react';

interface ProgressBarProps {
  value: number; // 0-100
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  showLabel?: boolean;
  showPercentage?: boolean;
  label?: string;
  animated?: boolean;
  striped?: boolean;
  className?: string;
}

const SIZE_CONFIG = {
  sm: {
    height: 'h-1',
    textSize: 'text-xs'
  },
  md: {
    height: 'h-2',
    textSize: 'text-sm'
  },
  lg: {
    height: 'h-3',
    textSize: 'text-base'
  }
};

const VARIANT_CONFIG = {
  default: {
    bgColor: 'bg-blue-600',
    lightBg: 'bg-blue-100'
  },
  success: {
    bgColor: 'bg-green-600',
    lightBg: 'bg-green-100'
  },
  warning: {
    bgColor: 'bg-yellow-500',
    lightBg: 'bg-yellow-100'
  },
  danger: {
    bgColor: 'bg-red-600',
    lightBg: 'bg-red-100'
  },
  info: {
    bgColor: 'bg-blue-500',
    lightBg: 'bg-blue-100'
  }
};

export default function ProgressBar({
  value,
  max = 100,
  size = 'md',
  variant = 'default',
  showLabel = false,
  showPercentage = false,
  label,
  animated = false,
  striped = false,
  className = ''
}: ProgressBarProps) {
  const sizeConfig = SIZE_CONFIG[size];
  const variantConfig = VARIANT_CONFIG[variant];
  
  // 计算百分比
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  // 获取变体颜色
  const getVariantByValue = (val: number) => {
    if (val >= 80) return VARIANT_CONFIG.success;
    if (val >= 60) return VARIANT_CONFIG.info;
    if (val >= 40) return VARIANT_CONFIG.warning;
    return VARIANT_CONFIG.danger;
  };

  const currentVariant = variant === 'default' && percentage > 0 ? getVariantByValue(percentage) : variantConfig;

  return (
    <div className={`w-full ${className}`}>
      {/* 标签和百分比 */}
      {(showLabel || showPercentage) && (
        <div className={`flex justify-between items-center mb-1 ${sizeConfig.textSize}`}>
          {showLabel && (
            <span className="text-gray-700 font-medium">
              {label || '进度'}
            </span>
          )}
          {showPercentage && (
            <span className="text-gray-600">
              {percentage.toFixed(0)}%
            </span>
          )}
        </div>
      )}
      
      {/* 进度条容器 */}
      <div className={`w-full ${currentVariant.lightBg} rounded-full ${sizeConfig.height} overflow-hidden`}>
        {/* 进度条填充 */}
        <div
          className={`${sizeConfig.height} ${currentVariant.bgColor} rounded-full transition-all duration-300 ease-out ${
            animated ? 'animate-pulse' : ''
          } ${
            striped ? 'bg-gradient-to-r from-transparent via-white/20 to-transparent bg-[length:20px_20px] animate-[slide_1s_linear_infinite]' : ''
          }`}
          style={{ width: `${percentage}%` }}
        >
          {/* 条纹效果 */}
          {striped && (
            <div className="h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-25"></div>
          )}
        </div>
      </div>
      
      {/* 数值显示 */}
      {!showPercentage && (value !== undefined && max !== undefined) && (
        <div className={`flex justify-between mt-1 ${sizeConfig.textSize} text-gray-500`}>
          <span>{value}</span>
          <span>{max}</span>
        </div>
      )}
    </div>
  );
}

// 简化版本的进度条组件
export function SimpleProgressBar({ 
  value, 
  className = "",
  size = 'sm',
  color = 'blue' 
}: { 
  value: number; 
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}) {
  const percentage = Math.min(Math.max(value, 0), 100);
  const sizeConfig = SIZE_CONFIG[size];
  
  const colorConfig = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    yellow: 'bg-yellow-500',
    red: 'bg-red-600',
    purple: 'bg-purple-600'
  };

  return (
    <div className={`w-full bg-gray-200 rounded-full ${sizeConfig.height} ${className}`}>
      <div
        className={`${sizeConfig.height} ${colorConfig[color]} rounded-full transition-all duration-300`}
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
}

// 环形进度条组件
export function CircularProgress({
  value,
  size = 60,
  strokeWidth = 6,
  color = 'blue',
  showPercentage = true,
  className = ''
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  showPercentage?: boolean;
  className?: string;
}) {
  const percentage = Math.min(Math.max(value, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const colorConfig = {
    blue: 'stroke-blue-600',
    green: 'stroke-green-600',
    yellow: 'stroke-yellow-500',
    red: 'stroke-red-600',
    purple: 'stroke-purple-600'
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-gray-200"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={`${colorConfig[color]} transition-all duration-300 ease-out`}
        />
      </svg>
      {showPercentage && (
        <span className="absolute text-sm font-semibold text-gray-700">
          {percentage.toFixed(0)}%
        </span>
      )}
    </div>
  );
} 