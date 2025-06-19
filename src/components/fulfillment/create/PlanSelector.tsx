'use client';

import React, { useState, useEffect } from 'react';
import { 
  CheckIcon,
  CalendarDaysIcon,
  PlayIcon,
  VideoCameraIcon,
  GiftIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

interface FulfillmentPlan {
  id: string;
  planCode: string;
  planName: string;
  requiresSample: boolean;
  contentType: string;
  isInfluencerMade: boolean;
  initialStatus: string;
  description: string;
  status: number;
}

interface PlanSelectorProps {
  selectedPlan: FulfillmentPlan | null;
  onSelect: (plan: FulfillmentPlan) => void;
  className?: string;
}

export default function PlanSelector({ 
  selectedPlan, 
  onSelect, 
  className = "" 
}: PlanSelectorProps) {
  const [plans, setPlans] = useState<FulfillmentPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/fulfillment-plans');
      const result = await response.json();
      
      if (result.success) {
        setPlans(result.data);
      } else {
        setError(result.error || '获取方案失败');
      }
    } catch (err) {
      setError('网络错误，请重试');
      console.error('获取履约方案失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const getContentTypeIcon = (contentType: string) => {
    switch (contentType) {
      case 'video':
        return <VideoCameraIcon className="h-5 w-5" />;
      case 'live':
        return <PlayIcon className="h-5 w-5" />;
      case 'video_live':
        return <SparklesIcon className="h-5 w-5" />;
      default:
        return <GiftIcon className="h-5 w-5" />;
    }
  };

  const getContentTypeLabel = (contentType: string) => {
    switch (contentType) {
      case 'video':
        return '短视频';
      case 'live':
        return '直播带货';
      case 'video_live':
        return '短视频+直播';
      default:
        return contentType;
    }
  };

  const getContentTypeColor = (contentType: string) => {
    switch (contentType) {
      case 'video':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'live':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'video_live':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">选择合作方案</h3>
          <p className="mt-1 text-sm text-gray-500">
            根据预算和需求选择最适合的合作模式
          </p>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">加载方案中...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-red-200 ${className}`}>
        <div className="px-6 py-4 border-b border-red-200">
          <h3 className="text-lg font-semibold text-red-900">加载失败</h3>
        </div>
        <div className="p-6">
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchPlans}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              重新加载
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">选择合作方案</h3>
        <p className="mt-1 text-sm text-gray-500">
          根据预算和需求选择最适合的合作模式
        </p>
      </div>

      <div className="p-6">
        {selectedPlan && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center text-white">
                  {getContentTypeIcon(selectedPlan.contentType)}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    已选择: {selectedPlan.planName}
                  </div>
                  <div className="text-sm text-gray-600">
                    {getContentTypeLabel(selectedPlan.contentType)} • {selectedPlan.requiresSample ? '需要寄样' : '无需寄样'}
                  </div>
                </div>
              </div>
              <CheckIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {plans.map((plan) => (
            <div
              key={plan.id}
              onClick={() => onSelect(plan)}
              className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all duration-200 hover:shadow-lg group ${
                selectedPlan?.id === plan.id
                  ? 'border-blue-500 bg-blue-50 shadow-lg'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              {selectedPlan?.id === plan.id && (
                <div className="absolute top-4 right-4">
                  <div className="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center">
                    <CheckIcon className="h-4 w-4 text-white" />
                  </div>
                </div>
              )}

              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                      selectedPlan?.id === plan.id 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600'
                    }`}>
                      {getContentTypeIcon(plan.contentType)}
                    </div>
                    <h4 className="text-lg font-bold text-gray-900">{plan.planName}</h4>
                  </div>
                </div>

                <div className="flex items-center space-x-2 mb-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getContentTypeColor(plan.contentType)}`}>
                    {getContentTypeLabel(plan.contentType)}
                  </span>
                  {plan.requiresSample && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-orange-100 text-orange-800 border-orange-200">
                      需要寄样
                    </span>
                  )}
                  {plan.isInfluencerMade && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-purple-100 text-purple-800 border-purple-200">
                      达人自制
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                  {plan.description}
                </p>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <CalendarDaysIcon className="h-4 w-4" />
                    <span>初始状态: {plan.initialStatus}</span>
                  </div>
                </div>
              </div>

              <div className={`mt-4 pt-4 border-t transition-colors duration-200 ${
                selectedPlan?.id === plan.id ? 'border-blue-200' : 'border-gray-200'
              }`}>
                <div className="text-center">
                  <span className={`text-sm font-medium ${
                    selectedPlan?.id === plan.id ? 'text-blue-600' : 'text-gray-500 group-hover:text-blue-600'
                  }`}>
                    点击选择此方案
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {plans.length === 0 && (
          <div className="text-center py-12">
            <GiftIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">暂无可用方案</h3>
            <p className="mt-1 text-sm text-gray-500">
              请联系管理员添加履约方案
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 