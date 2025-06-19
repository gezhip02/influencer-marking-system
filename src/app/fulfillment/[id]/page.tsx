'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeftIcon,
  CalendarDaysIcon,
  ClockIcon,
  CurrencyDollarIcon,
  StarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { FulfillmentStatus, Priority } from '@/types/fulfillment';

interface FulfillmentDetail {
  id: string;
  title: string;
  description: string;
  status: FulfillmentStatus;
  priority: Priority;
  influencer: {
    id: string;
    name: string;
    avatar: string;
    platform: string;
    followers: number;
    rating: number;
  };
  product: {
    id: string;
    name: string;
    brand: string;
    price: number;
    image: string;
  };
  plan: {
    name: string;
    type: string;
    budget: number;
    duration: number;
  };
  timeline: {
    createdAt: string;
    deadline: string;
    updatedAt: string;
  };
  progress: {
    completed: number;
    total: number;
    percentage: number;
  };
  contentItems: Array<{
    id: string;
    type: string;
    title: string;
    status: 'pending' | 'in_progress' | 'completed' | 'rejected';
    deadline: string;
  }>;
  statusHistory: Array<{
    id: string;
    status: string;
    timestamp: string;
    operator: string;
    note?: string;
  }>;
}

export default function FulfillmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [fulfillment, setFulfillment] = useState<FulfillmentDetail | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // 模拟API调用获取履约单详情
    const fetchFulfillmentDetail = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 模拟数据
      const mockData: FulfillmentDetail = {
        id: params.id as string,
        title: '美妆达人小雅CC2 × 兰蔻粉底液 标准合作',
        description: '标准合作 - 最受欢迎的合作模式，性价比最高，适合大多数品牌',
        status: FulfillmentStatus.CONTENT_PRODUCTION,
        priority: Priority.MEDIUM,
        influencer: {
          id: '1',
          name: '美妆达人小雅CC2',
          avatar: 'https://via.placeholder.com/40',
          platform: '抖音',
          followers: 156000,
          rating: 4.8
        },
        product: {
          id: '1',
          name: '兰蔻持久粉底液',
          brand: '兰蔻',
          price: 380,
          image: 'https://via.placeholder.com/80'
        },
        plan: {
          name: '标准合作',
          type: 'sponsored_post',
          budget: 8000,
          duration: 14
        },
        timeline: {
          createdAt: '2024-01-15',
          deadline: '2024-01-29',
          updatedAt: '2024-01-20'
        },
        progress: {
          completed: 3,
          total: 7,
          percentage: 43
        },
        contentItems: [
          {
            id: '1',
            type: 'video',
            title: '产品开箱视频',
            status: 'completed',
            deadline: '2024-01-22'
          },
          {
            id: '2',
            type: 'image',
            title: '产品使用图文',
            status: 'in_progress',
            deadline: '2024-01-25'
          },
          {
            id: '3',
            type: 'video',
            title: '直播带货',
            status: 'pending',
            deadline: '2024-01-28'
          }
        ],
        statusHistory: [
          {
            id: '1',
            status: 'pending_sample',
            timestamp: '2024-01-15 10:00',
            operator: '系统',
            note: '履约单创建成功'
          },
          {
            id: '2',
            status: 'sample_sent',
            timestamp: '2024-01-16 14:30',
            operator: '张经理',
            note: '样品已发送，快递单号：SF123456789'
          },
          {
            id: '3',
            status: 'sample_received',
            timestamp: '2024-01-18 09:15',
            operator: '美妆达人小雅CC2',
            note: '样品收到，质量很好，开始准备内容创作'
          },
          {
            id: '4',
            status: 'content_creation',
            timestamp: '2024-01-20 16:20',
            operator: '系统',
            note: '内容创作阶段开始'
          }
        ]
      };
      
      setFulfillment(mockData);
      setLoading(false);
    };

    fetchFulfillmentDetail();
  }, [params.id]);

  const getStatusBadge = (status: FulfillmentStatus) => {
    const statusConfig = {
      [FulfillmentStatus.PENDING_SAMPLE]: { color: 'bg-gray-100 text-gray-800', label: '待寄样' },
      [FulfillmentStatus.SAMPLE_SENT]: { color: 'bg-blue-100 text-blue-800', label: '已寄样' },
      [FulfillmentStatus.SAMPLE_RECEIVED]: { color: 'bg-green-100 text-green-800', label: '已收样' },
      [FulfillmentStatus.CONTENT_PRODUCTION]: { color: 'bg-yellow-100 text-yellow-800', label: '内容创作' },
      [FulfillmentStatus.CONTENT_REVIEW]: { color: 'bg-purple-100 text-purple-800', label: '内容审核' },
      [FulfillmentStatus.CONTENT_PUBLISHED]: { color: 'bg-green-100 text-green-800', label: '已发布' },
      [FulfillmentStatus.SETTLEMENT_COMPLETED]: { color: 'bg-green-100 text-green-800', label: '已完成' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig[FulfillmentStatus.PENDING_SAMPLE];
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getPriorityBadge = (priority: Priority) => {
    const priorityConfig = {
      [Priority.LOW]: { color: 'bg-gray-100 text-gray-800', label: '低' },
      [Priority.MEDIUM]: { color: 'bg-yellow-100 text-yellow-800', label: '中' },
      [Priority.HIGH]: { color: 'bg-orange-100 text-orange-800', label: '高' },
      [Priority.URGENT]: { color: 'bg-red-100 text-red-800', label: '紧急' }
    };
    
    const config = priorityConfig[priority];
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getContentStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'in_progress':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'rejected':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (!fulfillment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">履约单不存在</p>
          <button
            onClick={() => router.back()}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            返回
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 头部导航 */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-1" />
              返回
            </button>
            <h1 className="text-2xl font-bold text-gray-900">{fulfillment.title}</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {getStatusBadge(fulfillment.status)}
            {getPriorityBadge(fulfillment.priority)}
            <span className="text-sm text-gray-500">
              创建于 {fulfillment.timeline.createdAt}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 主要内容区域 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 进度概览 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">执行进度</h3>
              
              <div className="mb-4">
                <div className="flex justify-between text-sm font-medium text-gray-900 mb-2">
                  <span>整体进度</span>
                  <span>{fulfillment.progress.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${fulfillment.progress.percentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>已完成 {fulfillment.progress.completed} / {fulfillment.progress.total} 项</span>
                  <span>截止 {fulfillment.timeline.deadline}</span>
                </div>
              </div>

              {/* 内容清单 */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">内容清单</h4>
                {fulfillment.contentItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      {getContentStatusIcon(item.status)}
                      <div>
                        <div className="font-medium text-gray-900">{item.title}</div>
                        <div className="text-sm text-gray-500">
                          {item.type === 'video' ? '视频内容' : 
                           item.type === 'image' ? '图片内容' : '其他内容'} · 
                          截止 {item.deadline}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm">
                      {item.status === 'completed' && <span className="text-green-600">已完成</span>}
                      {item.status === 'in_progress' && <span className="text-yellow-600">进行中</span>}
                      {item.status === 'pending' && <span className="text-gray-500">待开始</span>}
                      {item.status === 'rejected' && <span className="text-red-600">需修改</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 状态历史 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">状态历史</h3>
              
              <div className="flow-root">
                <ul className="-mb-8">
                  {fulfillment.statusHistory.map((item, itemIdx) => (
                    <li key={item.id}>
                      <div className="relative pb-8">
                        {itemIdx !== fulfillment.statusHistory.length - 1 ? (
                          <span
                            className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                            aria-hidden="true"
                          />
                        ) : null}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                              <CheckCircleIcon className="h-5 w-5 text-white" aria-hidden="true" />
                            </span>
                          </div>
                          <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                            <div>
                              <p className="text-sm text-gray-500">
                                状态变更为 <span className="font-medium text-gray-900">{item.status}</span>
                                {item.note && (
                                  <span className="block text-gray-600 mt-1">{item.note}</span>
                                )}
                              </p>
                            </div>
                            <div className="whitespace-nowrap text-right text-sm text-gray-500">
                              <div>{item.timestamp}</div>
                              <div className="text-xs">{item.operator}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* 侧边栏信息 */}
          <div className="space-y-6">
            {/* 基本信息 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">基本信息</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-gray-500">合作达人</div>
                  <div className="mt-1 flex items-center space-x-3">
                    <img
                      className="h-10 w-10 rounded-full"
                      src={fulfillment.influencer.avatar}
                      alt={fulfillment.influencer.name}
                    />
                    <div>
                      <div className="font-medium text-gray-900">{fulfillment.influencer.name}</div>
                      <div className="text-sm text-gray-500 flex items-center">
                        {fulfillment.influencer.platform} · {(fulfillment.influencer.followers / 1000).toFixed(1)}K粉丝
                        <div className="flex items-center ml-2">
                          <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="ml-1">{fulfillment.influencer.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-500">推广产品</div>
                  <div className="mt-1 flex items-center space-x-3">
                    <img
                      className="h-10 w-10 rounded-lg object-cover"
                      src={fulfillment.product.image}
                      alt={fulfillment.product.name}
                    />
                    <div>
                      <div className="font-medium text-gray-900">{fulfillment.product.name}</div>
                      <div className="text-sm text-gray-500">
                        {fulfillment.product.brand} · ¥{fulfillment.product.price}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <div className="text-sm font-medium text-gray-500">合作预算</div>
                    <div className="mt-1 text-lg font-bold text-gray-900">
                      ¥{fulfillment.plan.budget.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500">执行周期</div>
                    <div className="mt-1 text-lg font-bold text-gray-900">
                      {fulfillment.plan.duration}天
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 快速操作 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">快速操作</h3>
              
              <div className="space-y-3">
                <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  <EyeIcon className="h-4 w-4 mr-2" />
                  查看内容
                </button>
                <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
                  联系达人
                </button>
                <button className="w-full flex items-center justify-center px-4 py-2 border border-blue-300 rounded-md text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100">
                  <DocumentTextIcon className="h-4 w-4 mr-2" />
                  生成报告
                </button>
              </div>
            </div>

            {/* 时效提醒 */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mr-2" />
                <div className="text-sm">
                  <div className="font-medium text-yellow-800">时效提醒</div>
                  <div className="text-yellow-700 mt-1">
                    距离截止日期还有 9 天，请关注执行进度
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 