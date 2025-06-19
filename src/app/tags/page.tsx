'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { Tag, Plus, Edit2, Trash2, Users, Search, Filter } from 'lucide-react';
import { useQueryState } from 'nuqs';
import Modal from '@/components/ui/modal';
import Toast, { useToast } from '@/components/ui/toast';
import CreateTagForm, { TagFormData } from '@/components/tags/create-tag-form';
import EditTagForm from '@/components/tags/edit-tag-form';
import DeleteTagDialog from '@/components/tags/delete-tag-dialog';


interface TagData {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  category: string;
  color: string;
  icon?: string;
  influencerCount?: number;  // 可选字段，如果API没有返回则默认为0
  isSystem: boolean;
  createdAt?: string | number;  // 可能是时间戳
  updatedAt?: string | number;  // 可能是时间戳
}

interface Stats {
  total: number;
  totalInfluencers: number;
  categories: Array<{
    category: string;
    _count: {
      category: number;
    };
  }>;
}

interface ApiResponse {
  success: boolean;
  data: TagData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  stats: Stats;
}

// 状态管理Hook
function useTagFilters() {
  const [search, setSearch] = useQueryState('search', { defaultValue: '' });
  const [category, setCategory] = useQueryState('category', { defaultValue: '' });
  const [page, setPage] = useQueryState('page', { defaultValue: '1' });
  const [limit, setLimit] = useQueryState('limit', { defaultValue: '20' });

  return {
    filters: {
      search,
      category,
      page: parseInt(page),
      limit: parseInt(limit),
    },
    setters: {
      setSearch,
      setCategory,
      setPage: (p: number) => setPage(p.toString()),
      setLimit: (l: number) => setLimit(l.toString()),
    },
  };
}

function formatDate(date: string | number): string {
  if (!date) return '未知时间';
  
  try {
    // 如果是数字时间戳，转换为毫秒
    const dateObj = typeof date === 'number' ? new Date(date * 1000) : new Date(date);
    // 检查日期是否有效
    if (isNaN(dateObj.getTime())) {
      return '无效时间';
    }
    
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(dateObj);
  } catch (error) {
    console.warn('formatDate error:', error, 'date:', date);
    return '时间格式错误';
  }
}

function getCategoryText(category: string): string {
  const categoryMap: Record<string, string> = {
    'CONTENT': '内容类型',
    'AUDIENCE': '受众群体',
    'PERFORMANCE': '表现指标',
    'INDUSTRY': '行业分类',
    'GEOGRAPHY': '地理位置',
    'COOPERATION': '合作相关',
  };
  return categoryMap[category] || category;
}

function getTagColor(color: string): string {
  const colorMap: Record<string, string> = {
    '#ec4899': 'bg-pink-100 text-pink-800',
    '#3b82f6': 'bg-blue-100 text-blue-800',
    '#8b5cf6': 'bg-purple-100 text-purple-800',
    '#10b981': 'bg-green-100 text-green-800',
    '#059669': 'bg-emerald-100 text-emerald-800',
    '#0891b2': 'bg-cyan-100 text-cyan-800',
    '#dc2626': 'bg-red-100 text-red-800',
    '#1d4ed8': 'bg-blue-100 text-blue-800',
    '#7c3aed': 'bg-violet-100 text-violet-800',
  };
  return colorMap[color] || 'bg-gray-100 text-gray-800';
}

function TagsManagement() {
  const { filters, setters } = useTagFilters();
  const [tags, setTags] = useState<TagData[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, totalInfluencers: 0, categories: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  // 用于搜索的实际关键词，只有用户主动搜索时才更新
  const [searchTerm, setSearchTerm] = useState('');
  
  // 视图模式状态
  const [viewMode, setViewMode] = useState<'list' | 'card'>('card');
  
  // 模态框状态
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedTag, setSelectedTag] = useState<TagData | null>(null);

  // Toast通知
  const { toast, showSuccess, showError, hideToast } = useToast();

  const fetchTags = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filters.category) params.append('category', filters.category);
      params.append('page', filters.page.toString());
      params.append('limit', filters.limit.toString());

      const response = await fetch(`/api/tags?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ApiResponse = await response.json();
      // 确保每个标签都有influencerCount字段
      const tagsWithCount = (data.data || []).map(tag => ({
        ...tag,
        influencerCount: tag.influencerCount || 0
      }));
      setTags(tagsWithCount);
      setStats(data.stats || { total: 0, totalInfluencers: 0, categories: [] });
      setPagination(data.pagination || { page: 1, limit: 20, total: 0, pages: 0 });
    } catch (err) {
      console.error('获取标签数据失败:', err);
      setError('获取标签数据失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filters.category, filters.page, filters.limit]);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  // 初始化时，如果URL中有搜索参数，同步到searchTerm
  useEffect(() => {
    if (filters.search && searchTerm !== filters.search) {
      setSearchTerm(filters.search);
    }
    // 强制触发一次数据获取
    fetchTags();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 处理搜索输入变化（仅更新输入框值，不触发搜索）
  const handleSearchInputChange = useCallback((value: string) => {
    setters.setSearch(value);
  }, [setters]);

  // 执行搜索（按回车或点击搜索按钮时调用）
  const handleSearch = useCallback(() => {
    setSearchTerm(filters.search);
    setters.setPage(1); // 重置到第一页
  }, [filters.search, setters]);

  // 处理回车键搜索
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }, [handleSearch]);

  const handleCategoryChange = useCallback((value: string) => {
    setters.setCategory(value);
    setters.setPage(1);
  }, [setters]);

  const clearFilters = useCallback(() => {
    setters.setSearch('');
    setSearchTerm('');
    setters.setCategory('');
    setters.setPage(1);
  }, [setters]);

  // 创建标签
  const handleCreateTag = useCallback(async (formData: TagFormData) => {
    setIsCreating(true);
    try {
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          createdBy: null, // 暂时设为null，后续接入用户系统时再设置
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // 关闭模态框
      setIsCreateModalOpen(false);
      
      // 刷新标签列表
      await fetchTags();
      
      // 显示成功提示
      showSuccess(`标签 "${result.data.displayName}" 创建成功！`);
      
    } catch (error) {
      console.error('创建标签失败:', error);
      // 显示错误提示
      const errorMessage = error instanceof Error ? error.message : '创建标签失败，请稍后重试';
      showError(errorMessage);
    } finally {
      setIsCreating(false);
    }
  }, [fetchTags, showSuccess, showError]);

  // 编辑标签
  const handleEditTag = useCallback(async (formData: TagFormData) => {
    if (!selectedTag) return;
    
    setIsEditing(true);
    try {
      const response = await fetch('/api/tags', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedTag.id,
          ...formData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // 关闭模态框
      setIsEditModalOpen(false);
      setSelectedTag(null);
      
      // 刷新标签列表
      await fetchTags();
      
      // 显示成功提示
      showSuccess(`标签 "${result.data.displayName}" 更新成功！`);
      
    } catch (error) {
      console.error('编辑标签失败:', error);
      // 显示错误提示
      const errorMessage = error instanceof Error ? error.message : '编辑标签失败，请稍后重试';
      showError(errorMessage);
    } finally {
      setIsEditing(false);
    }
  }, [selectedTag, fetchTags, showSuccess, showError]);

  // 删除标签
  const handleDeleteTag = useCallback(async () => {
    if (!selectedTag) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/tags?id=${selectedTag.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // 关闭对话框
      setIsDeleteDialogOpen(false);
      setSelectedTag(null);
      
      // 刷新标签列表
      await fetchTags();
      
      // 显示成功提示
      showSuccess(`标签 "${selectedTag.displayName}" 删除成功！${result.deletedInfluencerConnections > 0 ? ` 同时移除了 ${result.deletedInfluencerConnections} 个达人关联。` : ''}`);
      
    } catch (error) {
      console.error('删除标签失败:', error);
      // 显示错误提示
      const errorMessage = error instanceof Error ? error.message : '删除标签失败，请稍后重试';
      showError(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  }, [selectedTag, fetchTags, showSuccess, showError]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchTags}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  // 检查是否有活动的筛选条件
  const hasActiveFilters = searchTerm || filters.category;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="md:flex md:items-center md:justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center">
                  <Tag className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">标签管理</h1>
                    <p className="text-sm text-gray-500">管理达人标签和分类体系</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
                {/* 视图模式切换 */}
                <div className="inline-flex rounded-md shadow-sm">
                  <button
                    onClick={() => setViewMode('card')}
                    className={`relative inline-flex items-center px-3 py-2 rounded-l-md border text-sm font-medium ${
                      viewMode === 'card' 
                        ? 'bg-blue-600 border-blue-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-4v8M5 7v8m6-8v8" />
                    </svg>
                    <span className="ml-1 hidden sm:block">卡片</span>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`relative inline-flex items-center px-3 py-2 rounded-r-md border text-sm font-medium ${
                      viewMode === 'list' 
                        ? 'bg-blue-600 border-blue-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                    <span className="ml-1 hidden sm:block">列表</span>
                  </button>
                </div>
                
                {hasActiveFilters && (
                  <button 
                    onClick={clearFilters}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    清除筛选
                  </button>
                )}
                <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  <Filter className="h-4 w-4 mr-2" />
                  筛选
                </button>
                <button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  创建标签
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Tag className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">总标签数</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats?.total || 0}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">关联达人</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats?.totalInfluencers || 0}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Filter className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">分类数量</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats?.categories?.length || 0}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative flex">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="输入标签名称、描述... 然后按回车或点击搜索"
                      value={filters.search}
                      onChange={(e) => handleSearchInputChange(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <button
                    onClick={handleSearch}
                    className="px-4 py-2 bg-blue-600 text-white border border-blue-600 rounded-r-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                  >
                    搜索
                  </button>
                </div>
              </div>
              <div className="flex gap-4">
                <select 
                  value={filters.category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">所有分类</option>
                  <option value="CONTENT">内容类型</option>
                  <option value="AUDIENCE">受众群体</option>
                  <option value="PERFORMANCE">表现指标</option>
                  <option value="INDUSTRY">行业分类</option>
                  <option value="GEOGRAPHY">地理位置</option>
                  <option value="COOPERATION">合作相关</option>
                </select>
              </div>
            </div>
            
            {/* 显示当前筛选状态 */}
            {hasActiveFilters && (
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-sm text-gray-500">当前筛选:</span>
                {searchTerm && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    搜索: {searchTerm}
                  </span>
                )}
                {filters.category && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    分类: {getCategoryText(filters.category)}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 标签概览 */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">标签概览</h3>
            <p className="text-sm text-gray-500">
              共 {pagination.total} 个标签
              {hasActiveFilters && ` (已筛选 ${tags.length} 个)`}
              {filters.search && filters.search !== searchTerm && (
                <span className="text-orange-600 ml-2">输入 "{filters.search}" 后按回车搜索</span>
              )}
            </p>
          </div>
        </div>

        {/* 标签显示区域 */}
        {tags.length > 0 ? (
          <div className="bg-white shadow rounded-lg">
            {/* 卡片视图 */}
            {viewMode === 'card' && (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tags.map((tag) => (
                    <div key={tag.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTagColor(tag.color)}`}>
                          {tag.displayName}
                        </span>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => {
                              setSelectedTag(tag);
                              setIsEditModalOpen(true);
                            }}
                            className="text-gray-400 hover:text-blue-600 transition-colors"
                            title="编辑标签"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          {!tag.isSystem && (
                            <button 
                              onClick={() => {
                                setSelectedTag(tag);
                                setIsDeleteDialogOpen(true);
                              }}
                              className="text-gray-400 hover:text-red-600 transition-colors"
                              title="删除标签"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">分类：</span>{getCategoryText(tag.category)}
                        </div>
                        
                        {tag.description && (
                          <div className="text-sm text-gray-600 line-clamp-2">
                            <span className="font-medium">描述：</span>{tag.description}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            <span>{tag.influencerCount || 0} 个达人</span>
                          </div>
                          {tag.isSystem && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                              系统
                            </span>
                          )}
                        </div>
                        
                        <div className="text-xs text-gray-400">
                          创建于 {formatDate(tag.createdAt || '')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 列表视图 */}
            {viewMode === 'list' && (
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        标签名称
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        分类
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        描述
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        关联达人
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        创建时间
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tags.map((tag) => (
                      <tr key={tag.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTagColor(tag.color)}`}>
                              {tag.displayName}
                            </span>
                            {tag.isSystem && (
                              <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                系统
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {getCategoryText(tag.category)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                          {tag.description || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1 text-gray-400" />
                            {tag.influencerCount || 0}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(tag.createdAt || '')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => {
                                setSelectedTag(tag);
                                setIsEditModalOpen(true);
                              }}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50 transition-colors"
                              title="编辑标签"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            {!tag.isSystem && (
                              <button 
                                onClick={() => {
                                  setSelectedTag(tag);
                                  setIsDeleteDialogOpen(true);
                                }}
                                className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50 transition-colors"
                                title="删除标签"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg">
            <div className="text-center py-12">
              <Tag className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {hasActiveFilters ? '没有找到符合条件的标签' : '暂无标签数据'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {hasActiveFilters 
                  ? '尝试调整搜索条件或清除筛选器'
                  : '开始创建标签来管理您的达人分类'
                }
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  清除筛选
                </button>
              )}
            </div>
          </div>
        )}

        {/* 完整分页控件 */}
        {pagination.total > 0 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-6 rounded-lg shadow">
            <div className="flex-1 flex justify-between sm:hidden">
              <button 
                disabled={pagination.page <= 1}
                onClick={() => setters.setPage(pagination.page - 1)}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                上一页
              </button>
              <button 
                disabled={pagination.page >= pagination.pages}
                onClick={() => setters.setPage(pagination.page + 1)}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                下一页
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div className="flex items-center space-x-6">
                <div>
                  <p className="text-sm text-gray-700">
                    显示第 <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> 到{' '}
                    <span className="font-medium">
                      {Math.min(pagination.page * pagination.limit, pagination.total)}
                    </span> 条，共{' '}
                    <span className="font-medium">{pagination.total}</span> 条记录
                  </p>
                </div>
                
                {/* 每页显示条数选择 */}
                <div className="flex items-center space-x-2">
                  <label htmlFor="page-size" className="text-sm text-gray-700">每页显示:</label>
                  <select
                    id="page-size"
                    value={filters.limit}
                    onChange={(e) => {
                      setters.setLimit(parseInt(e.target.value));
                      setters.setPage(1); // 重置到第一页
                    }}
                    className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span className="text-sm text-gray-700">条</span>
                </div>
              </div>
              
              {/* 页码导航 */}
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  {/* 上一页 */}
                  <button
                    disabled={pagination.page <= 1}
                    onClick={() => setters.setPage(pagination.page - 1)}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">上一页</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {/* 页码按钮 */}
                  {(() => {
                    const getPageNumbers = () => {
                      const delta = 2;
                      const range = [];
                      const rangeWithDots = [];

                      for (let i = Math.max(1, pagination.page - delta); 
                           i <= Math.min(pagination.pages, pagination.page + delta); 
                           i++) {
                        range.push(i);
                      }

                      if (range[0] > 1) {
                        if (range[0] > 2) {
                          rangeWithDots.push(1, '...');
                        } else {
                          rangeWithDots.push(1);
                        }
                      }

                      rangeWithDots.push(...range);

                      if (range[range.length - 1] < pagination.pages) {
                        if (range[range.length - 1] < pagination.pages - 1) {
                          rangeWithDots.push('...', pagination.pages);
                        } else {
                          rangeWithDots.push(pagination.pages);
                        }
                      }

                      return rangeWithDots;
                    };

                    return getPageNumbers().map((page, index) => {
                      if (page === '...') {
                        return (
                          <span
                            key={`ellipsis-${index}`}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                          >
                            ...
                          </span>
                        );
                      }
                      
                      const isCurrentPage = page === pagination.page;
                      return (
                        <button
                          key={page}
                          onClick={() => setters.setPage(page as number)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            isCurrentPage
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    });
                  })()}
                  
                  {/* 下一页 */}
                  <button
                    disabled={pagination.page >= pagination.pages}
                    onClick={() => setters.setPage(pagination.page + 1)}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">下一页</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 创建标签模态框 */}
      <CreateTagForm
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTag}
        isLoading={isCreating}
        existingTags={tags.map(tag => ({ id: tag.id, name: tag.name, displayName: tag.displayName }))}
      />

      {/* 编辑标签模态框 */}
      <EditTagForm
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedTag(null);
        }}
        onSubmit={handleEditTag}
        isLoading={isEditing}
        existingTags={tags.map(tag => ({ id: tag.id, name: tag.name, displayName: tag.displayName }))}
        tag={selectedTag}
      />

      {/* 删除标签确认对话框 */}
      <DeleteTagDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedTag(null);
        }}
        onConfirm={handleDeleteTag}
        isLoading={isDeleting}
        tag={selectedTag}
      />

      {/* Toast通知 */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </div>
  );
}

export default function TagsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">加载中...</div>}>
      <TagsManagement />
    </Suspense>
  );
}
