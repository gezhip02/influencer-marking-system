'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ClockIcon,
  CurrencyDollarIcon,
  EyeIcon,
  CalendarDaysIcon,
  UserIcon,
  PhotoIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import StatusBadge from '@/components/ui/StatusBadge';
import PriorityBadge from '@/components/ui/PriorityBadge';
import { SimpleProgressBar } from '@/components/ui/ProgressBar';
import { FulfillmentStatus, Priority } from '@/types/fulfillment';

interface FulfillmentCardData {
  id: string;
  title: string;
  description?: string;
  status: FulfillmentStatus;
  priority: Priority;
  progress: number;
  budget: number;
  influencer: {
    id: string;
    name: string;
    avatar?: string;
    platform: string;
    followers: number;
  };
  product: {
    id: string;
    name: string;
    image?: string;
    brand: string;
  };
  timeline: {
    createdAt: string;
    deadline: string;
    updatedAt: string;
  };
  isOverdue?: boolean;
  overdueHours?: number;
}

interface FulfillmentCardProps {
  data: FulfillmentCardData;
  variant?: 'default' | 'compact' | 'detailed';
  showActions?: boolean;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  className?: string;
}

export default function FulfillmentCard({
  data,
  variant = 'default',
  showActions = true,
  onView,
  onEdit,
  onDelete,
  className = ''
}: FulfillmentCardProps) {
  const formatCurrency = (amount: number) => {
    if (amount >= 10000) {
      return `¥${(amount / 10000).toFixed(1)}万`;
    }
    return `¥${amount.toLocaleString()}`;
  };

  const formatFollowers = (count: number) => {
    if (count >= 10000) {
      return `${(count / 10000).toFixed(1)}万`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const getDeadlineInfo = (deadline: string) => {
    try {
      const deadlineDate = new Date(deadline);
      const now = new Date();
      const diffMs = deadlineDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) {
        return { 
          text: `逾期 ${Math.abs(diffDays)} 天`, 
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          urgent: true 
        };
      } else if (diffDays === 0) {
        return { 
          text: '今天截止', 
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          urgent: true 
        };
      } else if (diffDays <= 3) {
        return { 
          text: `${diffDays} 天后截止`, 
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          urgent: true 
        };
      } else {
        return { 
          text: `${diffDays} 天后截止`, 
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          urgent: false 
        };
      }
    } catch {
      return { 
        text: deadline, 
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        urgent: false 
      };
    }
  };

  const deadlineInfo = getDeadlineInfo(data.timeline.deadline);

  // 紧凑版本
  if (variant === 'compact') {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <Link href={`/fulfillment/${data.id}`}>
              <h3 className="text-sm font-medium text-gray-900 hover:text-blue-600 cursor-pointer truncate">
                {data.title}
              </h3>
            </Link>
            <div className="flex items-center space-x-2 mt-1">
              <StatusBadge status={data.status} size="sm" />
              <PriorityBadge priority={data.priority} size="sm" />
            </div>
          </div>
          <div className="flex items-center space-x-3 ml-4">
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">{formatCurrency(data.budget)}</div>
              <div className="text-xs text-gray-500">{data.progress}%</div>
            </div>
            {showActions && (
              <button
                onClick={() => onView?.(data.id)}
                className="text-gray-400 hover:text-blue-500"
              >
                <EyeIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 详细版本
  if (variant === 'detailed') {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 ${className}`}>
        {/* 头部 */}
        <div className="p-6 pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <StatusBadge status={data.status} size="md" variant="dot" />
                <PriorityBadge priority={data.priority} size="sm" />
                {data.isOverdue && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
                    逾期 {data.overdueHours}h
                  </span>
                )}
              </div>
              <Link href={`/fulfillment/${data.id}`}>
                <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 cursor-pointer mb-1">
                  {data.title}
                </h3>
              </Link>
              {data.description && (
                <p className="text-sm text-gray-600 line-clamp-2">{data.description}</p>
              )}
            </div>
            <div className="flex items-center space-x-2 ml-4">
              <div className="text-right">
                <div className="text-xl font-bold text-gray-900">{formatCurrency(data.budget)}</div>
                <div className="text-sm text-gray-500">预算</div>
              </div>
            </div>
          </div>
        </div>

        {/* 进度条 */}
        <div className="px-6 pb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">执行进度</span>
            <span className="text-sm text-gray-600">{data.progress}%</span>
          </div>
          <SimpleProgressBar value={data.progress} size="md" />
        </div>

        {/* 达人和产品信息 */}
        <div className="px-6 pb-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                {data.influencer.avatar ? (
                  <img
                    className="w-10 h-10 rounded-full"
                    src={data.influencer.avatar}
                    alt={data.influencer.name}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-blue-600" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{data.influencer.name}</p>
                <p className="text-xs text-gray-500">{data.influencer.platform} · {formatFollowers(data.influencer.followers)}粉丝</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                {data.product.image ? (
                  <img
                    className="w-10 h-10 rounded-lg object-cover"
                    src={data.product.image}
                    alt={data.product.name}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                    <PhotoIcon className="w-5 h-5 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{data.product.name}</p>
                <p className="text-xs text-gray-500">{data.product.brand}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 底部信息 */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <div className="flex items-center">
                <CalendarDaysIcon className="w-4 h-4 mr-1" />
                创建于 {data.timeline.createdAt}
              </div>
              <div className={`flex items-center px-2 py-1 rounded ${deadlineInfo.bgColor}`}>
                <ClockIcon className={`w-4 h-4 mr-1 ${deadlineInfo.color}`} />
                <span className={deadlineInfo.color}>{deadlineInfo.text}</span>
              </div>
            </div>
            {showActions && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onView?.(data.id)}
                  className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <EyeIcon className="w-3 h-3 mr-1" />
                  查看
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 默认版本
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow ${className}`}>
      {/* 头部 */}
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <StatusBadge status={data.status} size="sm" />
              <PriorityBadge priority={data.priority} size="sm" variant="dot" />
              {data.isOverdue && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                  逾期
                </span>
              )}
            </div>
            <Link href={`/fulfillment/${data.id}`}>
              <h3 className="text-base font-medium text-gray-900 hover:text-blue-600 cursor-pointer mb-1 line-clamp-2">
                {data.title}
              </h3>
            </Link>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>{data.influencer.name}</span>
              <span>·</span>
              <span>{data.product.name}</span>
            </div>
          </div>
          <div className="text-right ml-4">
            <div className="text-lg font-semibold text-gray-900">{formatCurrency(data.budget)}</div>
          </div>
        </div>

        {/* 进度条 */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">进度</span>
            <span className="text-xs text-gray-600">{data.progress}%</span>
          </div>
          <SimpleProgressBar value={data.progress} size="sm" />
        </div>
      </div>

      {/* 底部 */}
      <div className="px-5 py-3 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 text-xs text-gray-500">
            <span>{data.timeline.createdAt}</span>
            <span className={deadlineInfo.color}>{deadlineInfo.text}</span>
          </div>
          {showActions && (
            <button
              onClick={() => onView?.(data.id)}
              className="text-blue-600 hover:text-blue-800 text-xs font-medium"
            >
              查看详情
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 