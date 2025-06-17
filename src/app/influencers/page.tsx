'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { Search, Filter, Plus, Users, TrendingUp, Calendar, Tag, Eye, Edit3, Trash2, MessageCircle, Mail, Phone, User2, MapPin, Building2, X, UserCheck, Download, Upload, Settings, CheckSquare, Square, Loader2, AlertTriangle } from 'lucide-react';
import { useQueryState } from 'nuqs';
import Toast, { useToast } from '@/components/ui/toast';
import CreateInfluencerForm, { InfluencerFormData } from '@/components/influencers/create-influencer-form';


interface Platform {
  id: string;
  name: string;
  displayName: string;
}

interface TagData {
  id: string;
  name: string;
  displayName: string;
  color: string;
  category: string;
}

interface Influencer {
  id: string;
  platformUserId: string;
  username?: string;
  displayName?: string;
  avatarUrl?: string;
  platform: Platform;
  bio?: string;
  
  // 联系方式
  whatsappAccount?: string;
  email?: string;
  phone?: string;
  wechat?: string;
  telegram?: string;
  
  // 地理信息
  country?: string;
  region?: string;
  city?: string;
  timezone?: string;
  
  // 基础属性
  gender?: string;
  ageRange?: string;
  language?: string;
  
  // 粉丝数据
  followersCount: number;
  followingCount?: number;
  totalLikes?: number;
  totalVideos?: number;
  avgVideoViews?: number;
  engagementRate?: number;
  
  // 内容属性
  primaryCategory?: string;
  contentStyle?: any;
  contentLanguage?: string;
  
  // 商业合作
  cooperationOpenness?: string;
  baseCooperationFee?: number;
  cooperationCurrency?: string;
  cooperationPreferences?: any;
  
  // 质量评估
  qualityScore?: number;
  riskLevel?: string;
  blacklistReason?: string;
  
  // 数据来源
  dataSource?: string;
  lastDataSync?: string;
  dataAccuracy?: number;
  
  // 系统字段
  status: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  
  // 扩展字段
  platformSpecificData?: any;
  notes?: string;
  
  // 关联数据
  tags: TagData[];
  cooperationCount?: number;
}

interface Stats {
  total: number;
  active: number;
  contacted: number;
  totalTags: number;
}

interface ApiResponse {
  influencers: Influencer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  stats: Stats;
}

// 状态管理Hook
function useInfluencerFilters() {
  const [search, setSearch] = useQueryState('search', { defaultValue: '' });
  const [platform, setPlatform] = useQueryState('platform', { defaultValue: '' });
  const [status, setStatus] = useQueryState('status', { defaultValue: '' });
  const [source, setSource] = useQueryState('source', { defaultValue: '' });
  const [tagId, setTagId] = useQueryState('tagId', { defaultValue: '' });
  const [dateFrom, setDateFrom] = useQueryState('dateFrom', { defaultValue: '' });
  const [dateTo, setDateTo] = useQueryState('dateTo', { defaultValue: '' });
  const [page, setPage] = useQueryState('page', { defaultValue: '1' });
  const [limit, setLimit] = useQueryState('limit', { defaultValue: '10' });

  return {
    filters: {
      search,
      platform,
      status,
      source,
      tagId,
      dateFrom,
      dateTo,
      page: parseInt(page),
      limit: parseInt(limit),
    },
    setters: {
      setSearch,
      setPlatform,
      setStatus,
      setSource,
      setTagId,
      setDateFrom,
      setDateTo,
      setPage: (p: number) => setPage(p.toString()),
      setLimit: (l: number) => setLimit(l.toString()),
    },
  };
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

function formatPercentage(num: number): string {
  return (num * 100).toFixed(1) + '%';
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) return '今天';
  if (days === 1) return '昨天';
  if (days < 7) return `${days}天前`;
  if (days < 30) return `${Math.floor(days / 7)}周前`;
  return `${Math.floor(days / 30)}个月前`;
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'ACTIVE': return 'bg-green-100 text-green-800';
    case 'INACTIVE': return 'bg-gray-100 text-gray-800';
    case 'POTENTIAL': return 'bg-blue-100 text-blue-800';
    case 'BLACKLISTED': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

function getStatusText(status: string): string {
  switch (status) {
    case 'ACTIVE': return '活跃';
    case 'INACTIVE': return '不活跃';
    case 'POTENTIAL': return '潜在';
    case 'BLACKLISTED': return '黑名单';
    default: return status;
  }
}

function getPlatformColor(platform: string): string {
  switch (platform) {
    case 'tiktok': return 'bg-black text-white';
    case 'douyin': return 'bg-red-500 text-white';
    case 'kuaishou': return 'bg-orange-500 text-white';
    case 'shipinhao': return 'bg-green-500 text-white';
    case 'xiaohongshu': return 'bg-pink-500 text-white';
    case 'bilibili': return 'bg-blue-500 text-white';
    default: return 'bg-gray-500 text-white';
  }
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

function getSourceIcon(source: string) {
  switch (source) {
    case 'whatsapp':
      return { icon: MessageCircle, color: 'text-green-600', bg: 'bg-green-50', label: 'WhatsApp注册' };
    case 'official':
      return { icon: User2, color: 'text-blue-600', bg: 'bg-blue-50', label: '官网注册' };
    case 'wechat':
      return { icon: MessageCircle, color: 'text-green-500', bg: 'bg-green-50', label: '微信' };
    case 'referral':
      return { icon: Users, color: 'text-purple-600', bg: 'bg-purple-50', label: '客户推荐' };
    case 'offline':
      return { icon: Building2, color: 'text-orange-600', bg: 'bg-orange-50', label: '线下活动' };
    default:
      return { icon: User2, color: 'text-gray-600', bg: 'bg-gray-50', label: '其他' };
  }
}

function getDataSourceOptions() {
  return [
    { value: '', label: '所有来源' },
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'official', label: '官网注册' },
    { value: 'wechat', label: '微信' },
    { value: 'referral', label: '客户推荐' },
    { value: 'offline', label: '线下活动' },
  ];
}

function InfluencersList() {
  const { filters, setters } = useInfluencerFilters();
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, contacted: 0, totalTags: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  // 用于搜索的实际关键词，只有用户主动搜索时才更新
  const [searchTerm, setSearchTerm] = useState('');

  // 创建达人相关状态
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [availableTags, setAvailableTags] = useState<any[]>([]);

  // Toast通知
  const { toast, showSuccess, showError, hideToast } = useToast();

  // 编辑和批量操作相关状态
  const [selectedInfluencers, setSelectedInfluencers] = useState<string[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingInfluencer, setEditingInfluencer] = useState<Influencer | null>(null);
  const [isBatchOperationsOpen, setIsBatchOperationsOpen] = useState(false);
  const [batchOperationLoading, setBatchOperationLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // 获取平台列表
  const fetchPlatforms = useCallback(async () => {
    try {
      const response = await fetch('/api/platforms');
      if (response.ok) {
        const data = await response.json();
        setPlatforms(data.platforms || []);
      }
    } catch (error) {
      console.error('获取平台列表失败:', error);
    }
  }, []);

  // 获取标签列表
  const fetchTags = useCallback(async () => {
    try {
      const response = await fetch('/api/tags');
      if (response.ok) {
        const data = await response.json();
        setAvailableTags(data.tags || []);
      }
    } catch (error) {
      console.error('获取标签列表失败:', error);
    }
  }, []);

  const fetchInfluencers = useCallback(async () => {
    try {
      console.log('开始获取达人数据...');
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filters.platform) params.append('platform', filters.platform);
      if (filters.status) params.append('status', filters.status);
      if (filters.source) params.append('source', filters.source);
      if (filters.tagId) params.append('tagId', filters.tagId);
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);
      params.append('page', filters.page.toString());
      params.append('limit', filters.limit.toString());

      const url = `/api/influencers?${params.toString()}`;
      console.log('请求URL:', url);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ApiResponse = await response.json();
      console.log('获取到的数据:', data);
      setInfluencers(data.influencers || []);
      setStats(data.stats || { total: 0, active: 0, contacted: 0, totalTags: 0 });
      setPagination(data.pagination || { page: 1, limit: 10, total: 0, pages: 0 });
    } catch (err) {
      console.error('获取达人数据失败:', err);
      setError('获取达人数据失败，请稍后重试');
    } finally {
      console.log('设置loading为false');
      setLoading(false);
    }
  }, [searchTerm, filters.platform, filters.status, filters.source, filters.tagId, filters.dateFrom, filters.dateTo, filters.page, filters.limit]);

  useEffect(() => {
    fetchInfluencers();
    fetchPlatforms();
    fetchTags();
  }, [fetchInfluencers, fetchPlatforms, fetchTags]);

  // 创建达人
  const handleCreateInfluencer = useCallback(async (formData: InfluencerFormData) => {
    setIsCreating(true);
    try {
      const response = await fetch('/api/influencers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // 关闭模态框
      setIsCreateModalOpen(false);
      
      // 刷新达人列表
      await fetchInfluencers();
      
      // 显示成功提示
      showSuccess(`达人 "${result.displayName || result.username}" 创建成功！`);
      
    } catch (error) {
      console.error('创建达人失败:', error);
      // 显示错误提示
      const errorMessage = error instanceof Error ? error.message : '创建达人失败，请稍后重试';
      showError(errorMessage);
    } finally {
      setIsCreating(false);
    }
  }, [fetchInfluencers, showSuccess, showError]);

  // 初始化时，如果URL中有搜索参数，同步到searchTerm
  useEffect(() => {
    if (filters.search && searchTerm !== filters.search) {
      setSearchTerm(filters.search);
    }
    // 强制触发一次数据获取
    fetchInfluencers();
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

  const handlePlatformChange = useCallback((value: string) => {
    setters.setPlatform(value);
    setters.setPage(1);
  }, [setters]);

  const handleStatusChange = useCallback((value: string) => {
    setters.setStatus(value);
    setters.setPage(1);
  }, [setters]);

  const handleSourceChange = useCallback((value: string) => {
    setters.setSource(value);
    setters.setPage(1);
  }, [setters]);

  const handleTagChange = useCallback((value: string) => {
    setters.setTagId(value);
    setters.setPage(1);
  }, [setters]);

  const handleDateFromChange = useCallback((value: string) => {
    setters.setDateFrom(value);
    setters.setPage(1);
  }, [setters]);

  const handleDateToChange = useCallback((value: string) => {
    setters.setDateTo(value);
    setters.setPage(1);
  }, [setters]);

  const clearFilters = useCallback(() => {
    setters.setSearch('');
    setSearchTerm('');
    setters.setPlatform('');
    setters.setStatus('');
    setters.setSource('');
    setters.setTagId('');
    setters.setDateFrom('');
    setters.setDateTo('');
    setters.setPage(1);
  }, [setters]);

  // 编辑达人
  const handleEditInfluencer = useCallback((influencer: Influencer) => {
    setEditingInfluencer(influencer);
    setIsEditModalOpen(true);
  }, []);

  // 更新达人
  const handleUpdateInfluencer = useCallback(async (formData: InfluencerFormData) => {
    if (!editingInfluencer) return;
    
    setIsCreating(true);
    try {
      const response = await fetch('/api/influencers', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingInfluencer.id,
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
      setEditingInfluencer(null);
      
      // 刷新达人列表
      await fetchInfluencers();
      
      // 显示成功提示
      showSuccess(`达人 "${result.displayName || result.username}" 更新成功！`);
      
    } catch (error) {
      console.error('更新达人失败:', error);
      const errorMessage = error instanceof Error ? error.message : '更新达人失败，请稍后重试';
      showError(errorMessage);
    } finally {
      setIsCreating(false);
    }
  }, [editingInfluencer, fetchInfluencers, showSuccess, showError]);

  // 删除达人
  const handleDeleteInfluencer = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/influencers?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      // 刷新达人列表
      await fetchInfluencers();
      
      // 显示成功提示
      showSuccess('达人删除成功！');
      
    } catch (error) {
      console.error('删除达人失败:', error);
      const errorMessage = error instanceof Error ? error.message : '删除达人失败，请稍后重试';
      showError(errorMessage);
    } finally {
      setShowDeleteConfirm(null);
    }
  }, [fetchInfluencers, showSuccess, showError]);

  // 选择/取消选择达人
  const handleSelectInfluencer = useCallback((id: string) => {
    setSelectedInfluencers(prev => 
      prev.includes(id) 
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  }, []);

  // 全选/取消全选
  const handleSelectAll = useCallback(() => {
    if (selectedInfluencers.length === influencers.length) {
      setSelectedInfluencers([]);
    } else {
      setSelectedInfluencers(influencers.map(inf => inf.id));
    }
  }, [selectedInfluencers.length, influencers]);

  // 批量操作函数
  const handleBatchAddTags = useCallback(async (tagIds: string[]) => {
    setBatchOperationLoading(true);
    try {
      const response = await fetch('/api/influencers/batch?action=add-tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ influencerIds: selectedInfluencers, tagIds }),
      });
      if (!response.ok) throw new Error('批量添加标签失败');
      await fetchInfluencers();
      showSuccess('批量添加标签成功！');
    } catch (error) {
      showError('批量添加标签失败，请稍后重试');
    } finally {
      setBatchOperationLoading(false);
    }
  }, [selectedInfluencers, fetchInfluencers, showSuccess, showError]);

  const handleBatchRemoveTags = useCallback(async (tagIds: string[]) => {
    setBatchOperationLoading(true);
    try {
      const response = await fetch('/api/influencers/batch?action=remove-tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ influencerIds: selectedInfluencers, tagIds }),
      });
      if (!response.ok) throw new Error('批量移除标签失败');
      await fetchInfluencers();
      showSuccess('批量移除标签成功！');
    } catch (error) {
      showError('批量移除标签失败，请稍后重试');
    } finally {
      setBatchOperationLoading(false);
    }
  }, [selectedInfluencers, fetchInfluencers, showSuccess, showError]);

  const handleBatchUpdateStatus = useCallback(async (status: string) => {
    setBatchOperationLoading(true);
    try {
      const response = await fetch('/api/influencers/batch?action=update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ influencerIds: selectedInfluencers, status }),
      });
      if (!response.ok) throw new Error('批量更新状态失败');
      await fetchInfluencers();
      showSuccess('批量更新状态成功！');
    } catch (error) {
      showError('批量更新状态失败，请稍后重试');
    } finally {
      setBatchOperationLoading(false);
    }
  }, [selectedInfluencers, fetchInfluencers, showSuccess, showError]);

  const handleBatchDelete = useCallback(async () => {
    setBatchOperationLoading(true);
    try {
      const response = await fetch(`/api/influencers?ids=${selectedInfluencers.join(',')}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('批量删除失败');
      setSelectedInfluencers([]);
      setIsBatchOperationsOpen(false);
      await fetchInfluencers();
      showSuccess('批量删除成功！');
    } catch (error) {
      showError('批量删除失败，请稍后重试');
    } finally {
      setBatchOperationLoading(false);
    }
  }, [selectedInfluencers, fetchInfluencers, showSuccess, showError]);

  const handleBatchExport = useCallback(async (format: 'json' | 'csv') => {
    setBatchOperationLoading(true);
    try {
      const response = await fetch('/api/influencers/batch?action=export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ influencerIds: selectedInfluencers, format }),
      });
      if (!response.ok) throw new Error('导出失败');

      if (format === 'csv') {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `influencers_export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `influencers_export_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
      showSuccess('导出成功！');
    } catch (error) {
      showError('导出失败，请稍后重试');
    } finally {
      setBatchOperationLoading(false);
    }
  }, [selectedInfluencers, showSuccess, showError]);

  const handleBatchImport = useCallback(async (file: File) => {
    setBatchOperationLoading(true);
    try {
      const fileContent = await file.text();
      let importData: any[] = [];

      if (file.name.endsWith('.json')) {
        const jsonData = JSON.parse(fileContent);
        importData = Array.isArray(jsonData) ? jsonData : jsonData.data || [jsonData];
      } else if (file.name.endsWith('.csv')) {
        // 简单的CSV解析（实际项目中建议使用专业的CSV解析库）
        const lines = fileContent.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        
        for (let i = 1; i < lines.length; i++) {
          if (lines[i].trim()) {
            const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
            const row: any = {};
            headers.forEach((header, index) => {
              row[header] = values[index] || '';
            });
            importData.push(row);
          }
        }
      } else {
        throw new Error('不支持的文件格式');
      }

      const response = await fetch('/api/influencers/batch?action=import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          data: importData, 
          format: file.name.endsWith('.csv') ? 'csv' : 'json' 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '导入失败');
      }

      const result = await response.json();
      showSuccess(`导入完成！新增 ${result.imported} 个，更新 ${result.updated} 个${result.errors > 0 ? `，失败 ${result.errors} 个` : ''}`);
      
      // 刷新数据
      await fetchInfluencers();
      setSelectedInfluencers([]);
      setIsBatchOperationsOpen(false);
    } catch (error) {
      console.error('Import error:', error);
      showError(error instanceof Error ? error.message : '导入失败，请检查文件格式');
    } finally {
      setBatchOperationLoading(false);
    }
  }, [fetchInfluencers, showSuccess, showError]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            display: 'inline-block', 
            width: '32px', 
            height: '32px', 
            border: '2px solid #e5e7eb', 
            borderTop: '2px solid #2563eb', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite' 
          }}></div>
          <p style={{ marginTop: '8px', color: '#6b7280' }}>加载中...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchInfluencers}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  // 检查是否有活动的筛选条件
  const hasActiveFilters = searchTerm || filters.platform || filters.status || filters.source || filters.tagId || filters.dateFrom || filters.dateTo;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="md:flex md:items-center md:justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">达人管理</h1>
                    <p className="text-sm text-gray-500">管理和跟踪所有达人资源</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
                {selectedInfluencers.length > 0 && (
                  <button 
                    onClick={() => setIsBatchOperationsOpen(true)}
                    className="inline-flex items-center px-4 py-2 border border-purple-300 rounded-md shadow-sm text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100"
                  >
                    <UserCheck className="h-4 w-4 mr-2" />
                    批量操作 ({selectedInfluencers.length})
                  </button>
                )}
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
                <div>
                  <input
                    type="file"
                    accept=".csv,.json"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleBatchImport(file);
                      }
                    }}
                    className="hidden"
                    id="header-import-file"
                  />
                  <label
                    htmlFor="header-import-file"
                    className="inline-flex items-center px-4 py-2 border border-green-300 rounded-md shadow-sm text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 cursor-pointer"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    批量导入
                  </label>
                </div>
                <button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  添加达人
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">总达人数</dt>
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
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">活跃达人</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats?.active || 0}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">本周联系</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats?.contacted || 0}</dd>
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
                    <dt className="text-sm font-medium text-gray-500 truncate">标签数量</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats?.totalTags || 0}</dd>
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
                      placeholder="搜索客户姓名、手机号、邮箱、WhatsApp账号..."
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
              <div className="flex flex-wrap gap-4">
                <select 
                  value={filters.platform}
                  onChange={(e) => handlePlatformChange(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">所有平台</option>
                  <option value="tiktok">TikTok</option>
                  <option value="douyin">抖音</option>
                  <option value="kuaishou">快手</option>
                  <option value="xiaohongshu">小红书</option>
                </select>
                <select 
                  value={filters.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">所有状态</option>
                  <option value="ACTIVE">活跃</option>
                  <option value="INACTIVE">不活跃</option>
                  <option value="POTENTIAL">潜在</option>
                  <option value="BLACKLISTED">黑名单</option>
                </select>
                <select 
                  value={filters.source}
                  onChange={(e) => handleSourceChange(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  {getDataSourceOptions().map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                <select 
                  value={filters.tagId}
                  onChange={(e) => handleTagChange(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">所有标签</option>
                  {availableTags.map(tag => (
                    <option key={tag.id} value={tag.id}>{tag.displayName}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* 日期筛选和清除按钮 */}
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-700 font-medium">注册日期:</span>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleDateFromChange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                <span className="text-gray-500 text-sm">至</span>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleDateToChange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  <X className="h-4 w-4" />
                  清除筛选
                </button>
              )}
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
                {filters.platform && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    平台: {filters.platform}
                  </span>
                )}
                {filters.status && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    状态: {getStatusText(filters.status)}
                  </span>
                )}
                {filters.source && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    来源: {getDataSourceOptions().find(opt => opt.value === filters.source)?.label}
                  </span>
                )}
                {filters.tagId && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                    标签: {availableTags.find(tag => tag.id === filters.tagId)?.displayName}
                  </span>
                )}
                {(filters.dateFrom || filters.dateTo) && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    日期: {filters.dateFrom} {filters.dateFrom && filters.dateTo ? '至' : ''} {filters.dateTo}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Influencers List */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">达人列表</h3>
            <p className="text-sm text-gray-500">
              共 {pagination.total} 个达人
              {hasActiveFilters && ` (已筛选 ${influencers.length} 个)`}
              {filters.search && filters.search !== searchTerm && (
                <span className="text-orange-600 ml-2">输入 "{filters.search}" 后按回车搜索</span>
              )}
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input 
                      type="checkbox" 
                      checked={selectedInfluencers.length === influencers.length && influencers.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-offset-0 focus:ring-blue-200 focus:ring-opacity-50" 
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    客户信息
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    来源渠道
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    标签
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    注册时间
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    最近互动
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {influencers.map((influencer) => {
                  const sourceInfo = getSourceIcon(influencer.dataSource || 'official');
                  const SourceIcon = sourceInfo.icon;
                  
                  return (
                    <tr key={influencer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input 
                          type="checkbox" 
                          checked={selectedInfluencers.includes(influencer.id)}
                          onChange={() => handleSelectInfluencer(influencer.id)}
                          className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-offset-0 focus:ring-blue-200 focus:ring-opacity-50" 
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            {influencer.avatarUrl ? (
                              <img 
                                className="h-12 w-12 rounded-full object-cover" 
                                src={influencer.avatarUrl} 
                                alt={influencer.displayName} 
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  target.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            <div className={`h-12 w-12 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-medium text-lg ${influencer.avatarUrl ? 'hidden' : ''}`}>
                              {influencer.displayName?.charAt(0) || 'U'}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {influencer.displayName}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center gap-2">
                              {influencer.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {influencer.phone}
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                              {influencer.email && (
                                <span className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {influencer.email}
                                </span>
                              )}
                              {influencer.whatsappAccount && (
                                <span className="flex items-center gap-1">
                                  <MessageCircle className="h-3 w-3 text-green-600" />
                                  {influencer.whatsappAccount}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium ${sourceInfo.bg} ${sourceInfo.color}`}>
                          <SourceIcon className="h-4 w-4 mr-2" />
                          {sourceInfo.label}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {influencer.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag.id}
                              className="inline-flex px-2 py-1 text-xs font-medium rounded-full"
                              style={{ 
                                backgroundColor: `${tag.color}20`,
                                color: tag.color,
                                border: `1px solid ${tag.color}40`
                              }}
                            >
                              {tag.displayName}
                            </span>
                          ))}
                          {influencer.tags.length > 2 && (
                            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                              +{influencer.tags.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(influencer.createdAt).toLocaleDateString('zh-CN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatRelativeTime(influencer.updatedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button 
                            className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50 transition-colors"
                            title="查看详情"
                            onClick={() => {
                              // TODO: 跳转到详情页面
                              console.log('查看详情:', influencer.id);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            className="text-green-600 hover:text-green-900 p-1 rounded-md hover:bg-green-50 transition-colors"
                            title="编辑"
                            onClick={() => handleEditInfluencer(influencer)}
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button 
                            className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50 transition-colors"
                            title="删除"
                            onClick={() => setShowDeleteConfirm(influencer.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {influencers.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {hasActiveFilters ? '没有找到符合条件的达人' : '暂无达人数据'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {hasActiveFilters 
                  ? '尝试调整搜索条件或清除筛选器'
                  : '开始添加达人来管理您的资源库'
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
          )}
        </div>

        {/* 简单分页信息 */}
        {pagination.total > 0 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-6 rounded-lg shadow">
            <div className="flex-1 flex justify-between sm:hidden">
              <button 
                disabled={pagination.page <= 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                上一页
              </button>
              <button 
                disabled={pagination.page >= pagination.pages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                下一页
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  显示第 <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> 到{' '}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span> 条，共{' '}
                  <span className="font-medium">{pagination.total}</span> 条记录
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-700">
                  第 <span className="font-medium">{pagination.page}</span> 页，共{' '}
                  <span className="font-medium">{pagination.pages}</span> 页
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 创建达人模态框 */}
      <CreateInfluencerForm
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateInfluencer}
        isLoading={isCreating}
        platforms={platforms}
        availableTags={availableTags}
      />

      {/* 编辑达人模态框 */}
      {editingInfluencer && (
        <CreateInfluencerForm
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingInfluencer(null);
          }}
          onSubmit={handleUpdateInfluencer}
          isLoading={isCreating}
          platforms={platforms}
          availableTags={availableTags}
          mode="edit"
          initialData={{
            id: editingInfluencer.id,
            platformId: editingInfluencer.platform?.id?.toString() || '',
            platformUserId: editingInfluencer.platformUserId || '',
            username: editingInfluencer.username || '',
            displayName: editingInfluencer.displayName || '',
            avatarUrl: editingInfluencer.avatarUrl || '',
            bio: editingInfluencer.bio || '',
            
            // 联系方式
            whatsappAccount: editingInfluencer.whatsappAccount || '',
            email: editingInfluencer.email || '',
            phone: editingInfluencer.phone || '',
            wechat: editingInfluencer.wechat || '',
            telegram: editingInfluencer.telegram || '',
            
            // 地理信息
            country: editingInfluencer.country || '',
            region: editingInfluencer.region || '',
            city: editingInfluencer.city || '',
            
            // 基础属性
            gender: editingInfluencer.gender || '',
            ageRange: editingInfluencer.ageRange || '',
            language: editingInfluencer.language || '',
            
            // 粉丝数据
            followersCount: editingInfluencer.followersCount || 0,
            followingCount: editingInfluencer.followingCount || 0,
            totalVideos: editingInfluencer.totalVideos || 0,
            avgVideoViews: editingInfluencer.avgVideoViews || 0,
            engagementRate: editingInfluencer.engagementRate || 0,
            
            // 内容属性
            primaryCategory: editingInfluencer.primaryCategory || '',
            contentLanguage: editingInfluencer.contentLanguage || '',
            
            // 商业合作
            cooperationOpenness: editingInfluencer.cooperationOpenness || 'unknown',
            baseCooperationFee: editingInfluencer.baseCooperationFee || 0,
            cooperationCurrency: editingInfluencer.cooperationCurrency || 'USD',
            
            // 质量评估
            qualityScore: editingInfluencer.qualityScore || 0,
            riskLevel: editingInfluencer.riskLevel || 'unknown',
            notes: editingInfluencer.notes || '',
            
            // 标签和状态
            tagIds: editingInfluencer.tags?.map(tag => tag.id) || [],
            status: editingInfluencer.status
          }}
        />
      )}

      {/* 批量操作模态框 */}
      {isBatchOperationsOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setIsBatchOperationsOpen(false)}
            />
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-6 pt-6 pb-4">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-purple-100 sm:mx-0 sm:h-10 sm:w-10">
                      <UserCheck className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        批量操作
                      </h3>
                      <p className="text-sm text-gray-500">
                        已选择 {selectedInfluencers.length} 个达人
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    onClick={() => setIsBatchOperationsOpen(false)}
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>
              
              <div className="px-6 pb-6">
                {/* 导出导入区域 */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-4">数据导入导出</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => handleBatchExport('csv')}
                      disabled={batchOperationLoading}
                      className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      导出CSV
                    </button>
                    
                    <button
                      onClick={() => handleBatchExport('json')}
                      disabled={batchOperationLoading}
                      className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      导出JSON
                    </button>
                    
                    <div>
                      <input
                        type="file"
                        accept=".csv,.json"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleBatchImport(file);
                          }
                        }}
                        className="hidden"
                        id="batch-import-file"
                      />
                      <label
                        htmlFor="batch-import-file"
                        className="flex items-center justify-center px-4 py-3 border border-blue-300 rounded-md shadow-sm bg-blue-50 text-sm font-medium text-blue-700 hover:bg-blue-100 cursor-pointer disabled:opacity-50 w-full"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        批量导入
                      </label>
                    </div>
                  </div>
                </div>

                {/* 状态操作区域 */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-4">状态管理</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleBatchUpdateStatus('ACTIVE')}
                      disabled={batchOperationLoading}
                      className="flex items-center justify-center px-4 py-3 border border-green-300 rounded-md shadow-sm bg-green-50 text-sm font-medium text-green-700 hover:bg-green-100 disabled:opacity-50"
                    >
                      <UserCheck className="h-4 w-4 mr-2" />
                      设为活跃
                    </button>
                    
                    <button
                      onClick={() => handleBatchUpdateStatus('INACTIVE')}
                      disabled={batchOperationLoading}
                      className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                    >
                      <UserCheck className="h-4 w-4 mr-2" />
                      设为不活跃
                    </button>
                  </div>
                </div>

                {/* 危险操作区域 */}
                <div>
                  <h4 className="text-sm font-medium text-red-800 mb-4">危险操作</h4>
                  <button
                    onClick={handleBatchDelete}
                    disabled={batchOperationLoading}
                    className="w-full flex items-center justify-center px-4 py-3 border border-red-300 rounded-md shadow-sm bg-red-50 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
                  >
                    {batchOperationLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 mr-2" />
                    )}
                    批量删除
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 删除确认对话框 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowDeleteConfirm(null)}
            />
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      删除达人
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        您确定要删除这个达人吗？此操作无法撤销，相关的合作记录和沟通记录也将被删除。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => handleDeleteInfluencer(showDeleteConfirm)}
                >
                  删除
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowDeleteConfirm(null)}
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

export default function InfluencersPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">加载中...</div>}>
      <InfluencersList />
    </Suspense>
  );
} 