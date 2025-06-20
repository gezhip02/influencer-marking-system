'use client';

import React, { useState } from 'react';
import { 
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CurrencyDollarIcon,
  EyeIcon,
  HeartIcon,
  ShareIcon,
  ShoppingCartIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { CircularProgress } from '@/components/ui/ProgressBar';

interface ROIData {
  fulfillmentId: string;
  period: string; // '7d', '30d', '90d'
  investment: {
    totalCost: number;
    influencerFee: number;
    productCost: number;
    operationCost: number;
  };
  returns: {
    revenue: number;
    orders: number;
    clicks: number;
    impressions: number;
    likes: number;
    shares: number;
    comments: number;
  };
  metrics: {
    roi: number; // ROI百分比
    roas: number; // 广告支出回报率
    cpm: number; // 千次展示成本
    cpc: number; // 点击成本
    ctr: number; // 点击率
    conversionRate: number; // 转化率
    customerAcquisitionCost: number; // 客户获取成本
  };
  trends: {
    roiTrend: number; // 相比上期的变化百分比
    revenueTrend: number;
    ordersTrend: number;
    engagementTrend: number;
  };
}

interface ROIAnalyticsProps {
  data: ROIData;
  variant?: 'summary' | 'detailed' | 'comparison';
  showTrends?: boolean;
  className?: string;
}

export default function ROIAnalytics({
  data,
  variant = 'detailed',
  showTrends = true,
  className = ''
}: ROIAnalyticsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState(data.period);
  
  const formatCurrency = (amount: number) => {
    if (amount >= 10000) {
      return `¥${(amount / 10000).toFixed(1)}万`;
    }
    return `¥${amount.toLocaleString()}`;
  };

  const formatNumber = (num: number) => {
    if (num >= 10000) {
      return `${(num / 10000).toFixed(1)}万`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`;
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) {
      return <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />;
    } else if (trend < 0) {
      return <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />;
    }
    return null;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-green-600';
    if (trend < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  // 摘要版本
  if (variant === 'summary') {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-900">ROI 概览</h3>
          <span className="text-xs text-gray-500">{data.period}</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{formatPercentage(data.metrics.roi)}</div>
            <div className="text-xs text-gray-500">投资回报率</div>
            {showTrends && (
              <div className={`flex items-center justify-center mt-1 text-xs ${getTrendColor(data.trends.roiTrend)}`}>
                {getTrendIcon(data.trends.roiTrend)}
                <span className="ml-1">{Math.abs(data.trends.roiTrend).toFixed(1)}%</span>
              </div>
            )}
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(data.returns.revenue)}</div>
            <div className="text-xs text-gray-500">总收入</div>
            {showTrends && (
              <div className={`flex items-center justify-center mt-1 text-xs ${getTrendColor(data.trends.revenueTrend)}`}>
                {getTrendIcon(data.trends.revenueTrend)}
                <span className="ml-1">{Math.abs(data.trends.revenueTrend).toFixed(1)}%</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 详细版本
  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* 头部 */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">ROI 数据分析</h3>
          <div className="flex items-center space-x-2">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="7d">近7天</option>
              <option value="30d">近30天</option>
              <option value="90d">近90天</option>
            </select>
          </div>
        </div>

        {/* 核心指标 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <CircularProgress 
              value={Math.min(data.metrics.roi, 100)} 
              size={80} 
              color={data.metrics.roi > 100 ? 'green' : data.metrics.roi > 50 ? 'blue' : 'yellow'}
              showPercentage={false}
            />
            <div className="mt-2">
              <div className="text-xl font-bold text-gray-900">{formatPercentage(data.metrics.roi)}</div>
              <div className="text-sm text-gray-500">ROI</div>
              {showTrends && (
                <div className={`flex items-center justify-center mt-1 text-xs ${getTrendColor(data.trends.roiTrend)}`}>
                  {getTrendIcon(data.trends.roiTrend)}
                  <span className="ml-1">{Math.abs(data.trends.roiTrend).toFixed(1)}%</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-xl font-bold text-blue-600">{data.metrics.roas.toFixed(1)}</div>
            <div className="text-sm text-gray-500">ROAS</div>
            <div className="text-xs text-gray-400 mt-1">广告支出回报率</div>
          </div>
          
          <div className="text-center">
            <div className="text-xl font-bold text-green-600">{formatPercentage(data.metrics.conversionRate)}</div>
            <div className="text-sm text-gray-500">转化率</div>
            <div className="text-xs text-gray-400 mt-1">订单/点击</div>
          </div>
          
          <div className="text-center">
            <div className="text-xl font-bold text-purple-600">{formatPercentage(data.metrics.ctr)}</div>
            <div className="text-sm text-gray-500">点击率</div>
            <div className="text-xs text-gray-400 mt-1">点击/展示</div>
          </div>
        </div>
      </div>

      {/* 收入与投入 */}
      <div className="p-6 border-b border-gray-200">
        <h4 className="text-base font-medium text-gray-900 mb-4">收入与投入分析</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 收入 */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">收入构成</span>
              <span className="text-lg font-bold text-green-600">{formatCurrency(data.returns.revenue)}</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">总订单数</span>
                <span className="font-medium">{formatNumber(data.returns.orders)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">平均客单价</span>
                <span className="font-medium">{formatCurrency(data.returns.revenue / data.returns.orders)}</span>
              </div>
            </div>
          </div>
          
          {/* 投入 */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">投入构成</span>
              <span className="text-lg font-bold text-red-600">{formatCurrency(data.investment.totalCost)}</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">达人费用</span>
                <span className="font-medium">{formatCurrency(data.investment.influencerFee)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">产品成本</span>
                <span className="font-medium">{formatCurrency(data.investment.productCost)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">运营成本</span>
                <span className="font-medium">{formatCurrency(data.investment.operationCost)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 互动数据 */}
      <div className="p-6 border-b border-gray-200">
        <h4 className="text-base font-medium text-gray-900 mb-4">互动表现</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
            <EyeIcon className="w-6 h-6 text-blue-600" />
            <div>
              <div className="text-lg font-bold text-blue-900">{formatNumber(data.returns.impressions)}</div>
              <div className="text-xs text-blue-600">展示</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
            <ShareIcon className="w-6 h-6 text-green-600" />
            <div>
              <div className="text-lg font-bold text-green-900">{formatNumber(data.returns.clicks)}</div>
              <div className="text-xs text-green-600">点击</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
            <HeartIcon className="w-6 h-6 text-red-600" />
            <div>
              <div className="text-lg font-bold text-red-900">{formatNumber(data.returns.likes)}</div>
              <div className="text-xs text-red-600">点赞</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
            <ShoppingCartIcon className="w-6 h-6 text-purple-600" />
            <div>
              <div className="text-lg font-bold text-purple-900">{formatNumber(data.returns.orders)}</div>
              <div className="text-xs text-purple-600">订单</div>
            </div>
          </div>
        </div>
      </div>

      {/* 成本分析 */}
      <div className="p-6">
        <h4 className="text-base font-medium text-gray-900 mb-4">成本效率</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">CPM</span>
              <InformationCircleIcon className="w-4 h-4 text-gray-400" />
            </div>
            <div className="text-lg font-bold text-gray-900">{formatCurrency(data.metrics.cpm)}</div>
            <div className="text-xs text-gray-500">千次展示成本</div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">CPC</span>
              <InformationCircleIcon className="w-4 h-4 text-gray-400" />
            </div>
            <div className="text-lg font-bold text-gray-900">{formatCurrency(data.metrics.cpc)}</div>
            <div className="text-xs text-gray-500">平均点击成本</div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">CAC</span>
              <InformationCircleIcon className="w-4 h-4 text-gray-400" />
            </div>
            <div className="text-lg font-bold text-gray-900">{formatCurrency(data.metrics.customerAcquisitionCost)}</div>
            <div className="text-xs text-gray-500">客户获取成本</div>
          </div>
        </div>
      </div>

      {/* 趋势提示 */}
      {showTrends && (
        <div className="px-6 py-4 bg-blue-50 border-t border-gray-200">
          <div className="flex items-start space-x-2">
            <InformationCircleIcon className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-medium">趋势分析</p>
              <p>
                相比上期：ROI {data.trends.roiTrend > 0 ? '上升' : '下降'} {Math.abs(data.trends.roiTrend).toFixed(1)}%，
                收入 {data.trends.revenueTrend > 0 ? '增长' : '下降'} {Math.abs(data.trends.revenueTrend).toFixed(1)}%，
                互动率 {data.trends.engagementTrend > 0 ? '提升' : '下降'} {Math.abs(data.trends.engagementTrend).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 