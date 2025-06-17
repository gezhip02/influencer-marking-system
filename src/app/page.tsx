import { Users, Tag, BarChart3, MessageCircle, Settings, Search, Plus } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">欢迎使用达人打标管理系统</h2>
          <p className="text-gray-600">
            智能管理 TikTok、抖音、快手、视频号等平台达人资源，提供精准标签匹配和合作流程跟踪
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                  <Tag className="h-6 w-6 text-green-600" />
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
                  <MessageCircle className="h-6 w-6 text-purple-600" />
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
                  <BarChart3 className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      本月转化
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

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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

          {/* Recent Activity */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">最近活动</h3>
            <div className="space-y-3">
              {[
                { action: '新增达人', name: '@beauty_queen', time: '2分钟前' },
                { action: '合作完成', name: '@tech_reviewer', time: '1小时前' },
                { action: '标签更新', name: '@fashion_girl', time: '3小时前' },
                { action: '建立联系', name: '@fitness_guru', time: '1天前' },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
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
      </main>
    </div>
  );
} 