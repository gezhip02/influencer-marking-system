'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrophyIcon, 
  ArrowUpIcon, 
  ArrowDownIcon,
  ChartBarIcon 
} from '@heroicons/react/24/outline';

interface ROIItem {
  rank: number;
  influencerId: string;
  influencerName: string;
  avatar?: string;
  productName: string;
  roi: number;
  revenue: number;
  cost: number;
  change: number; // 相比上期的变化
  status: 'up' | 'down' | 'same';
}

interface ROIRankingProps {
  maxItems?: number;
  showHeader?: boolean;
  className?: string;
}

export default function ROIRanking({ 
  maxItems = 10, 
  showHeader = true,
  className = ""
}: ROIRankingProps) {
  const [rankings, setRankings] = useState<ROIItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRankings();
  }, []);

  const fetchRankings = async () => {
    try {
      setLoading(true);
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      const mockRankings: ROIItem[] = [
        {
          rank: 1,
          influencerId: '1001',
          influencerName: '美妆小仙女',
          avatar: '/avatars/user1.jpg',
          productName: '兰蔻精华套装',
          roi: 850.5,
          revenue: 125000,
          cost: 14700,
          change: 23.5,
          status: 'up'
        },
        {
          rank: 2,
          influencerId: '1002', 
          influencerName: '科技达人Tony',
          avatar: '/avatars/user2.jpg',
          productName: 'iPhone 15 Pro',
          roi: 720.8,
          revenue: 340000,
          cost: 47200,
          change: 15.2,
          status: 'up'
        },
        {
          rank: 3,
          influencerId: '1003',
          influencerName: '健身教练小李',
          avatar: '/avatars/user3.jpg',
          productName: '蛋白粉套装',
          roi: 680.3,
          revenue: 89000,
          cost: 13080,
          change: -5.8,
          status: 'down'
        },
        {
          rank: 4,
          influencerId: '1004',
          influencerName: '时尚博主Anna',
          avatar: '/avatars/user4.jpg',
          productName: '奢侈品包包',
          roi: 620.1,
          revenue: 280000,
          cost: 45200,
          change: 8.9,
          status: 'up'
        },
        {
          rank: 5,
          influencerId: '1005',
          influencerName: '美食探店家',
          avatar: '/avatars/user5.jpg',
          productName: '高端茶叶',
          roi: 580.7,
          revenue: 58000,
          cost: 9980,
          change: 0,
          status: 'same'
        },
        {
          rank: 6,
          influencerId: '1006',
          influencerName: '汽车评测师',
          avatar: '/avatars/user6.jpg',
          productName: '汽车用品套装',
          roi: 520.4,
          revenue: 156000,
          cost: 29980,
          change: -12.3,
          status: 'down'
        },
        {
          rank: 7,
          influencerId: '1007',
          influencerName: '宠物博主',
          avatar: '/avatars/user7.jpg',
          productName: '宠物营养品',
          roi: 480.2,
          revenue: 72000,
          cost: 15000,
          change: 18.7,
          status: 'up'
        }
      ];

      setRankings(mockRankings.slice(0, maxItems));
    } catch (error) {
      console.error('获取ROI排行榜失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) {
      return <TrophyIcon className="h-6 w-6 text-yellow-500" />;
    } else if (rank === 2) {
      return <TrophyIcon className="h-6 w-6 text-gray-400" />;
    } else if (rank === 3) {
      return <TrophyIcon className="h-6 w-6 text-orange-500" />;
    } else {
      return <span className="flex items-center justify-center h-6 w-6 rounded-full bg-gray-100 text-sm font-medium text-gray-600">{rank}</span>;
    }
  };

  const getChangeIcon = (status: string, change: number) => {
    if (status === 'up') {
      return <ArrowUpIcon className="h-4 w-4 text-green-500" />;
    } else if (status === 'down') {
      return <ArrowDownIcon className="h-4 w-4 text-red-500" />;
    } else {
      return <div className="h-4 w-4 rounded-full bg-gray-400"></div>;
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 10000) {
      return `${(amount / 10000).toFixed(1)}万`;
    }
    return amount.toLocaleString();
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
        {showHeader && (
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">ROI排行榜</h3>
          </div>
        )}
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {showHeader && (
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ChartBarIcon className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-medium text-gray-900">ROI排行榜</h3>
          </div>
          <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            查看全部
          </button>
        </div>
      )}
      
      <div className="divide-y divide-gray-200">
        {rankings.length === 0 ? (
          <div className="p-6 text-center">
            <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">暂无数据</p>
          </div>
        ) : (
          rankings.map((item) => (
            <div
              key={item.influencerId}
              className="p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-200"
            >
              <div className="flex items-center space-x-4">
                {/* 排名 */}
                <div className="flex-shrink-0">
                  {getRankIcon(item.rank)}
                </div>
                
                {/* 头像 */}
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {item.influencerName.charAt(0)}
                    </span>
                  </div>
                </div>
                
                {/* 信息 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.influencerName}
                    </p>
                    <div className="flex items-center space-x-1">
                      {getChangeIcon(item.status, item.change)}
                      {item.change !== 0 && (
                        <span className={`text-xs font-medium ${
                          item.status === 'up' ? 'text-green-600' : 
                          item.status === 'down' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {item.change > 0 ? '+' : ''}{item.change}%
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {item.productName}
                  </p>
                </div>
                
                {/* ROI数据 */}
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">
                    {item.roi.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500">
                    收入 ¥{formatCurrency(item.revenue)}
                  </div>
                </div>
              </div>
              
              {/* 详细数据 */}
              <div className="mt-3 ml-14 flex items-center space-x-6 text-xs text-gray-500">
                <span>成本: ¥{formatCurrency(item.cost)}</span>
                <span>收益: ¥{formatCurrency(item.revenue - item.cost)}</span>
                <span className="px-2 py-1 bg-gray-100 rounded text-gray-700">
                  第{item.rank}名
                </span>
              </div>
            </div>
          ))
        )}
      </div>
      
      {rankings.length > 0 && (
        <div className="px-6 py-3 bg-gray-50 text-center">
          <button
            onClick={fetchRankings}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            刷新数据
          </button>
        </div>
      )}
    </div>
  );
} 