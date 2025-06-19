import { Users, Tag, BarChart3, MessageCircle, Settings, Search, Plus, ClipboardList } from "lucide-react";
import { CheckCircleIcon, ClockIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">欢迎使用达人营销履约管理系统</h2>
          <p className="text-gray-600">
            智能管理 TikTok、抖音、快手、视频号等平台达人资源，提供精准标签匹配和全流程履约管理
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      总达人数
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      12,847
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ClipboardList className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      履约单总数
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      1,247
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <MessageCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      进行中合作
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      158
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Tag className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      标签总数
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      286
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BarChart3 className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      本月完成率
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      89.2%
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions & Fulfillment Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Fulfillment Quick Actions */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <ClipboardList className="h-5 w-5 mr-2 text-purple-600" />
              履约管理
            </h3>
            <div className="space-y-3">
              <Link 
                href="/fulfillment/dashboard"
                className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <BarChart3 className="h-5 w-5 text-blue-600 mr-3" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600">履约仪表板</p>
                  <p className="text-xs text-gray-500">查看整体履约状态</p>
                </div>
              </Link>
              
              <Link 
                href="/fulfillment/create"
                className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <Plus className="h-5 w-5 text-green-600 mr-3" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 group-hover:text-green-600">创建履约单</p>
                  <p className="text-xs text-gray-500">新建合作履约记录</p>
                </div>
              </Link>

              <Link 
                href="/fulfillment"
                className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <ClipboardList className="h-5 w-5 text-purple-600 mr-3" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 group-hover:text-purple-600">履约单列表</p>
                  <p className="text-xs text-gray-500">管理所有履约记录</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Fulfillment Status Overview */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">履约状态概览</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-sm text-gray-700">已完成</span>
                </div>
                <span className="text-sm font-medium text-gray-900">89</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <ClockIcon className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="text-sm text-gray-700">进行中</span>
                </div>
                <span className="text-sm font-medium text-gray-900">45</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-2" />
                  <span className="text-sm text-gray-700">预警</span>
                </div>
                <span className="text-sm font-medium text-gray-900">12</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
                  <span className="text-sm text-gray-700">逾期</span>
                </div>
                <span className="text-sm font-medium text-gray-900">7</span>
              </div>
            </div>
          </div>

          {/* Search Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">快速搜索达人</h3>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索达人名称、平台ID、标签..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {['美妆博主', '科技数码', '高转化', '女性受众', 'TikTok'].map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 cursor-pointer hover:bg-blue-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity & Platform Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Activity */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">最近活动</h3>
            <div className="space-y-3">
              {[
                { action: '履约单完成', name: '美妆达人小雅CC2 × 兰蔻合作', time: '2分钟前', type: 'fulfillment' },
                { action: '新增达人', name: '@beauty_queen', time: '1小时前', type: 'influencer' },
                { action: '状态更新', name: '科技数码达人 × 小米合作', time: '3小时前', type: 'fulfillment' },
                { action: '建立联系', name: '@fitness_guru', time: '1天前', type: 'influencer' },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-3 ${
                      item.type === 'fulfillment' ? 'bg-purple-400' : 'bg-green-400'
                    }`}></div>
                    <div>
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">{item.action}</span> - {item.name}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{item.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Platform Overview */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">平台分布</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: 'TikTok', count: '5,234', color: 'bg-black' },
                { name: '抖音', count: '4,127', color: 'bg-red-500' },
                { name: '快手', count: '2,341', color: 'bg-orange-500' },
                { name: '视频号', count: '1,145', color: 'bg-green-500' },
              ].map((platform) => (
                <div key={platform.name} className="text-center">
                  <div className={`${platform.color} w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold`}>
                    {platform.name.charAt(0)}
                  </div>
                  <h4 className="text-sm font-medium text-gray-900">{platform.name}</h4>
                  <p className="text-lg font-bold text-gray-600">{platform.count}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 