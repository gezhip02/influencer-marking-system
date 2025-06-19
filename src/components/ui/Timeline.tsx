'use client';

import React from 'react';
import { 
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  XCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  status?: 'completed' | 'current' | 'pending' | 'failed' | 'warning';
  icon?: React.ComponentType<{ className?: string }>;
  metadata?: Record<string, any>;
  operator?: string;
  duration?: string;
  isOverdue?: boolean;
}

interface TimelineProps {
  items: TimelineItem[];
  variant?: 'default' | 'compact' | 'detailed';
  showConnector?: boolean;
  className?: string;
}

const STATUS_CONFIG = {
  completed: {
    iconBg: 'bg-green-500',
    icon: CheckCircleIcon,
    iconColor: 'text-white',
    textColor: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  current: {
    iconBg: 'bg-blue-500',
    icon: InformationCircleIcon,
    iconColor: 'text-white',
    textColor: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  pending: {
    iconBg: 'bg-gray-300',
    icon: ClockIcon,
    iconColor: 'text-gray-600',
    textColor: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200'
  },
  failed: {
    iconBg: 'bg-red-500',
    icon: XCircleIcon,
    iconColor: 'text-white',
    textColor: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  },
  warning: {
    iconBg: 'bg-yellow-500',
    icon: ExclamationCircleIcon,
    iconColor: 'text-white',
    textColor: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200'
  }
};

export default function Timeline({
  items,
  variant = 'default',
  showConnector = true,
  className = ''
}: TimelineProps) {
  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return timestamp;
    }
  };

  const getRelativeTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);

      if (diffHours < 1) return '刚刚';
      if (diffHours < 24) return `${diffHours}小时前`;
      if (diffDays < 7) return `${diffDays}天前`;
      return formatTimestamp(timestamp);
    } catch {
      return timestamp;
    }
  };

  // 紧凑版本
  if (variant === 'compact') {
    return (
      <div className={`space-y-2 ${className}`}>
        {items.map((item, index) => {
          const config = STATUS_CONFIG[item.status || 'pending'];
          const IconComponent = item.icon || config.icon;

          return (
            <div key={item.id} className="flex items-center space-x-3">
              <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${config.iconBg}`}>
                <IconComponent className={`w-3 h-3 ${config.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                  <p className="text-xs text-gray-500">{getRelativeTime(item.timestamp)}</p>
                </div>
                {item.description && (
                  <p className="text-xs text-gray-600 truncate">{item.description}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // 详细版本
  if (variant === 'detailed') {
    return (
      <div className={`space-y-6 ${className}`}>
        {items.map((item, index) => {
          const config = STATUS_CONFIG[item.status || 'pending'];
          const IconComponent = item.icon || config.icon;
          const isLast = index === items.length - 1;

          return (
            <div key={item.id} className="relative">
              {/* 连接线 */}
              {showConnector && !isLast && (
                <span
                  className="absolute top-10 left-5 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              )}
              
              <div className="relative flex space-x-4">
                {/* 图标 */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ring-8 ring-white ${config.iconBg}`}>
                  <IconComponent className={`w-5 h-5 ${config.iconColor}`} />
                </div>
                
                {/* 内容区域 */}
                <div className={`flex-1 min-w-0 p-4 rounded-lg border ${config.bgColor} ${config.borderColor}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className={`text-base font-medium ${config.textColor}`}>
                        {item.title}
                        {item.isOverdue && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                            逾期
                          </span>
                        )}
                      </h4>
                      {item.description && (
                        <p className="mt-1 text-sm text-gray-600">{item.description}</p>
                      )}
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="text-sm text-gray-500">{formatTimestamp(item.timestamp)}</p>
                      {item.operator && (
                        <p className="text-xs text-gray-400">by {item.operator}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* 元数据 */}
                  {item.metadata && Object.keys(item.metadata).length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {Object.entries(item.metadata).map(([key, value]) => (
                          <div key={key} className="text-xs">
                            <span className="font-medium text-gray-500">{key}:</span>
                            <span className="ml-1 text-gray-700">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* 耗时信息 */}
                  {item.duration && (
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        <ClockIcon className="w-3 h-3 mr-1" />
                        耗时 {item.duration}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // 默认版本
  return (
    <div className={`flow-root ${className}`}>
      <ul className="-mb-8">
        {items.map((item, index) => {
          const config = STATUS_CONFIG[item.status || 'pending'];
          const IconComponent = item.icon || config.icon;
          const isLast = index === items.length - 1;

          return (
            <li key={item.id}>
              <div className="relative pb-8">
                {/* 连接线 */}
                {showConnector && !isLast && (
                  <span
                    className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                    aria-hidden="true"
                  />
                )}
                
                <div className="relative flex space-x-3">
                  {/* 图标 */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ring-8 ring-white ${config.iconBg}`}>
                    <IconComponent className={`w-4 h-4 ${config.iconColor}`} />
                  </div>
                  
                  {/* 内容 */}
                  <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">{item.title}</span>
                        {item.isOverdue && (
                          <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                            逾期
                          </span>
                        )}
                      </p>
                      {item.description && (
                        <p className="mt-0.5 text-sm text-gray-600">{item.description}</p>
                      )}
                    </div>
                    <div className="whitespace-nowrap text-right text-sm text-gray-500">
                      <div>{formatTimestamp(item.timestamp)}</div>
                      {item.operator && (
                        <div className="text-xs text-gray-400">{item.operator}</div>
                      )}
                      {item.duration && (
                        <div className="text-xs text-gray-400">耗时 {item.duration}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
} 