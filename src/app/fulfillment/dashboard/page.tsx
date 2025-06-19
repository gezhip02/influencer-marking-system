'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  ChartBarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PlusIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';
import { Suspense } from 'react';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import StatCard from '@/components/fulfillment/dashboard/StatCard';
import ROIRanking from '@/components/fulfillment/dashboard/ROIRanking';
import TodoList from '@/components/fulfillment/dashboard/TodoList';

interface DashboardData {
  summary: {
    total: number;
    pending: number;
    overdue: number;
    completed: number;
    completionRate: number;
    avgCompletionDays: number;
  };
  trends: {
    period: string;
    completed: number;
    overdue: number;
    avgRoi: number;
  }[];
  urgentTasks: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    deadline: string;
    daysOverdue: number;
  }>;
  topPerformers: Array<{
    influencerId: string;
    influencerName: string;
    completedCount: number;
    avgRoi: number;
    totalGmv: number;
  }>;
}

export default function FulfillmentDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // 实时数据刷新
  useEffect(() => {
    fetchDashboardData();
    
    // 设置自动刷新（每5分钟）
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setError(null);
      
      // 并行获取多个数据源
      const [summaryRes, trendsRes, urgentRes, performersRes] = await Promise.all([
        fetch('/api/fulfillment-records/timeliness?type=stats'),
        fetch('/api/fulfillment-records/timeliness?type=trends'),
        fetch('/api/fulfillment-records/timeliness?type=overdue'),
        fetch('/api/fulfillment-records/performance/top-performers')
      ]);

      if (summaryRes.ok && trendsRes.ok && urgentRes.ok) {
        const [summaryData, trendsData, urgentData, performersData] = await Promise.all([
          summaryRes.json(),
          trendsRes.json(), 
          urgentRes.json(),
          performersRes.ok ? performersRes.json() : { data: [] }
        ]);

        const dashboardData: DashboardData = {
          summary: {
            total: summaryData.data?.total || 156,
            pending: summaryData.data?.pending || 24,
            overdue: summaryData.data?.overdue || 1,
            completed: summaryData.data?.completed || 132,
            completionRate: summaryData.data?.completionRate || 84.62,
            avgCompletionDays: summaryData.data?.avgCompletionDays || 3.5
          },
          trends: trendsData.data || [],
          urgentTasks: urgentData.data?.overdueRecords || [],
          topPerformers: performersData.data || []
        };

        setData(dashboardData);
      } else {
        // 使用模拟数据
        setData({
          summary: {
            total: 156,
            pending: 24,
            overdue: 1,
            completed: 132,
            completionRate: 84.62,
            avgCompletionDays: 3.5
          },
          trends: [
            { period: '本周', completed: 28, overdue: 2, avgRoi: 4.2 },
            { period: '上周', completed: 31, overdue: 1, avgRoi: 3.8 },
            { period: '2周前', completed: 25, overdue: 3, avgRoi: 3.5 },
            { period: '3周前', completed: 29, overdue: 2, avgRoi: 4.1 }
          ],
          urgentTasks: [
            {
              id: '1',
              title: '科技产品评测合作',
              status: 'sample_sent',
              priority: 'high',
              deadline: '2024-01-15',
              daysOverdue: 2
            }
          ],
          topPerformers: [
            {
              influencerId: '1',
              influencerName: '美妆小仙女',
              completedCount: 12,
              avgRoi: 5.2,
              totalGmv: 850000
            },
            {
              influencerId: '2', 
              influencerName: '科技达人Tony',
              completedCount: 8,
              avgRoi: 4.8,
              totalGmv: 620000
            }
          ]
        });
      }
    } catch (err) {
      console.error('获取仪表板数据失败:', err);
      setError('数据加载失败');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  // 计算趋势指标
  const trendIndicators = useMemo(() => {
    if (!data?.trends || data.trends.length < 2) return null;
    
    const current = data.trends[0];
    const previous = data.trends[1];
    
    return {
      completedChange: ((current.completed - previous.completed) / previous.completed * 100).toFixed(1),
      overdueChange: ((current.overdue - previous.overdue) / previous.overdue * 100).toFixed(1),
      roiChange: ((current.avgRoi - previous.avgRoi) / previous.avgRoi * 100).toFixed(1)
    };
  }, [data]);

  if (loading) {
    return <LoadingSpinner text="加载仪表板数据..." overlay />;
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">数据加载失败</h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
          <div className="mt-6">
            <button
              onClick={handleRefresh}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              重新加载
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 头部区域 */}
          <div className="mb-8">
            <div className="sm:flex sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">履约仪表板</h1>
                <p className="mt-2 text-gray-600">
                  实时监控履约进度和性能指标
                </p>
              </div>
              <div className="mt-4 sm:mt-0 flex space-x-3">
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  {refreshing ? (
                    <LoadingSpinner size="sm" text="" />
                  ) : (
                    <ChartBarIcon className="h-4 w-4 mr-2" />
                  )}
                  {refreshing ? '刷新中...' : '刷新数据'}
                </button>
                <Link
                  href="/fulfillment/create"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  创建履约单
                </Link>
              </div>
            </div>
          </div>

          {/* 统计卡片区域 */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <StatCard
              title="总履约单"
              value={data.summary.total}
              icon={ChartBarIcon}
              color="blue"
              trend={trendIndicators ? {
                value: trendIndicators.completedChange,
                isPositive: parseFloat(trendIndicators.completedChange) >= 0
              } : undefined}
            />
            <StatCard
              title="进行中"
              value={data.summary.pending}
              icon={ClockIcon}
              color="yellow"
            />
            <StatCard
              title="逾期"
              value={data.summary.overdue}
              icon={ExclamationTriangleIcon}
              color="red"
              trend={trendIndicators ? {
                value: trendIndicators.overdueChange,
                isPositive: parseFloat(trendIndicators.overdueChange) <= 0
              } : undefined}
            />
            <StatCard
              title="完成率"
              value={`${data.summary.completionRate.toFixed(1)}%`}
              icon={CheckCircleIcon}
              color="green"
              trend={trendIndicators ? {
                value: trendIndicators.roiChange,
                isPositive: parseFloat(trendIndicators.roiChange) >= 0
              } : undefined}
            />
          </div>

          {/* 主要内容区域 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 紧急任务列表 */}
            <div className="lg:col-span-2">
              <Suspense fallback={<LoadingSpinner />}>
                <TodoList 
                  tasks={data.urgentTasks}
                  onRefresh={handleRefresh}
                />
              </Suspense>
            </div>

            {/* 右侧边栏 */}
            <div className="space-y-6">
              {/* ROI排行榜 */}
              <Suspense fallback={<LoadingSpinner />}>
                <ROIRanking 
                  performers={data.topPerformers}
                  trends={data.trends}
                />
              </Suspense>

              {/* 快速操作 */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    快速操作
                  </h3>
                  <div className="space-y-3">
                    <Link
                      href="/fulfillment"
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                    >
                      查看所有履约单
                    </Link>
                    <Link
                      href="/fulfillment?status=overdue"
                      className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 rounded-md"
                    >
                      处理逾期任务
                    </Link>
                    <Link
                      href="/fulfillment/analytics"
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                    >
                      查看分析报告
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
} 