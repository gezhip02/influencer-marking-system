'use client';

import React, { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon,
  CheckIcon,
  StarIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

interface Influencer {
  id: string;
  displayName: string;
  realName?: string;
  platformHandle?: string;
  primaryPlatform?: string;
  followersCount: number;
  engagementRate: number;
  averageViews?: number;
  averageLikes?: number;
  recentROI?: number;
  score: number;
  tags?: string[];
  status: number;
  createdAt?: number;
}

interface InfluencerSelectorProps {
  selectedInfluencer: Influencer | null;
  onSelect: (influencer: Influencer) => void;
  className?: string;
}

export default function InfluencerSelector({ 
  selectedInfluencer, 
  onSelect, 
  className = "" 
}: InfluencerSelectorProps) {
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [filteredInfluencers, setFilteredInfluencers] = useState<Influencer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { value: 'all', label: '全部类别' },
    { value: 'beauty', label: '美妆博主' },
    { value: 'tech', label: '科技达人' },
    { value: 'fashion', label: '时尚博主' },
    { value: 'fitness', label: '健身达人' },
    { value: 'food', label: '美食博主' },
    { value: 'travel', label: '旅行达人' },
    { value: 'lifestyle', label: '生活方式' }
  ];

  useEffect(() => {
    fetchInfluencers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [influencers, searchTerm, selectedCategory]);

  const fetchInfluencers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/influencers');
      const result = await response.json();
      
      if (result.success && result.data) {
        const influencerList = result.data.items || [];
        setInfluencers(influencerList);
      } else {
        setError(result.error || '获取达人数据失败');
      }
    } catch (error) {
      console.error('获取达人列表失败:', error);
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = influencers;

    // 搜索过滤
    if (searchTerm) {
      filtered = filtered.filter(influencer =>
        influencer.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (influencer.realName && influencer.realName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (influencer.platformHandle && influencer.platformHandle.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // 类别过滤 - 暂时不过滤，因为数据库中没有明确的分类字段
    // if (selectedCategory !== 'all') {
    //   filtered = filtered.filter(influencer => influencer.category === selectedCategory);
    // }

    setFilteredInfluencers(filtered);
  };

  const formatFollowers = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(0)}K`;
    }
    return count.toString();
  };

  const renderStars = (rating: number) => {
    const normalizedRating = Math.min(5, Math.max(0, rating / 20)); // 将0-100分转换为0-5星
    const fullStars = Math.floor(normalizedRating);
    
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <StarIconSolid
            key={i}
            className={`h-4 w-4 ${
              i < fullStars ? 'text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">{normalizedRating.toFixed(1)}</span>
      </div>
    );
  };

  const getPlatformEmoji = (platform: string) => {
    const platformMap: { [key: string]: string } = {
      'douyin': '🎵',
      'xiaohongshu': '📕', 
      'weibo': '🐦',
      'bilibili': '📺',
      'kuaishou': '⚡',
      'zhihu': '🤔'
    };
    return platformMap[platform?.toLowerCase()] || '📱';
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">选择达人</h3>
          <p className="mt-1 text-sm text-gray-500">
            选择与您品牌调性匹配的达人
          </p>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">加载达人数据中...</span>
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
              onClick={fetchInfluencers}
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
        <h3 className="text-lg font-semibold text-gray-900">选择达人</h3>
        <p className="mt-1 text-sm text-gray-500">
          选择与您品牌调性匹配的达人，关注其粉丝画像和历史表现
        </p>
      </div>

      <div className="p-6">
        {selectedInfluencer && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center text-white font-bold">
                  {selectedInfluencer.displayName.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    已选择: {selectedInfluencer.displayName}
                  </div>
                  <div className="text-sm text-gray-600">
                    {formatFollowers(selectedInfluencer.followersCount)} 粉丝 • {selectedInfluencer.engagementRate.toFixed(1)}% 互动率
                  </div>
                </div>
              </div>
              <CheckIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        )}

        {/* 搜索和筛选 */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索达人姓名、类别或标签..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex items-center space-x-2 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category.value
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* 达人列表 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredInfluencers.map((influencer) => (
            <div
              key={influencer.id}
              onClick={() => onSelect(influencer)}
              className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 hover:shadow-lg group ${
                selectedInfluencer?.id === influencer.id
                  ? 'border-blue-500 bg-blue-50 shadow-lg'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              {selectedInfluencer?.id === influencer.id && (
                <div className="absolute top-3 right-3">
                  <div className="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center">
                    <CheckIcon className="h-4 w-4 text-white" />
                  </div>
                </div>
              )}

              <div className="flex items-start space-x-3">
                <div className={`h-12 w-12 rounded-lg flex items-center justify-center text-white font-bold text-lg ${
                  selectedInfluencer?.id === influencer.id 
                    ? 'bg-blue-600' 
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 group-hover:from-blue-500 group-hover:to-purple-600'
                }`}>
                  {getPlatformEmoji(influencer.primaryPlatform || '')}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 truncate">
                    {influencer.displayName}
                  </h4>
                  <p className="text-sm text-gray-600 truncate">
                    {influencer.primaryPlatform || '多平台'}
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">粉丝数:</span>
                  <span className="font-semibold text-gray-900">
                    {formatFollowers(influencer.followersCount)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">互动率:</span>
                  <span className="font-semibold text-green-600">
                    {influencer.engagementRate.toFixed(1)}%
                  </span>
                </div>
                
                {influencer.recentROI && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">平均ROI:</span>
                    <span className="font-semibold text-blue-600">
                      {influencer.recentROI.toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center">
                  {renderStars(influencer.score)}
                </div>
                
                {influencer.averageViews && (
                  <div className="text-xs text-gray-500">
                    {influencer.averageViews > 1000 
                      ? `${(influencer.averageViews / 1000).toFixed(0)}K 观看` 
                      : `${influencer.averageViews} 观看`}
                  </div>
                )}
              </div>

              {influencer.platformHandle && (
                <div className="mt-2 px-2 py-1 bg-gray-100 rounded text-xs text-gray-600 text-center">
                  @{influencer.platformHandle}
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredInfluencers.length === 0 && !loading && (
          <div className="text-center py-12">
            <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">暂无匹配的达人</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? '请尝试其他搜索关键词' : '暂无可用达人数据'}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-3 text-sm text-blue-600 hover:text-blue-800"
              >
                清除搜索条件
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 