'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { FulfillmentStatus, Priority } from '@/types/fulfillment';
import StatusUpdateModal from './StatusUpdateModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import { useDebounce } from '@/hooks/useDebounce';

interface FulfillmentRecord {
  id: string;
  title: string;
  influencerName: string;
  productName: string;
  status: FulfillmentStatus;
  priority: Priority;
  createdAt: string;
  deadline: string;
  budget: number;
  progress: number;
  isOverdue?: boolean;
}

interface FilterOptions {
  status: FulfillmentStatus | 'all' | 'overdue';
  priority: Priority | 'all';
  dateRange: string;
}

interface FulfillmentListProps {
  className?: string;
}

// 性能优化：记忆化状态选项
const STATUS_OPTIONS = [
  { value: 'all', label: '全部状态' },
  { value: 'overdue', label: '逾期履约单' },
  { value: FulfillmentStatus.PENDING_SAMPLE, label: '待寄样' },
  { value: FulfillmentStatus.SAMPLE_SENT, label: '已寄样' },
  { value: FulfillmentStatus.SAMPLE_RECEIVED, label: '已收样' },
  { value: FulfillmentStatus.CONTENT_PRODUCTION, label: '制作中' },
  { value: FulfillmentStatus.CONTENT_REVIEW, label: '审核中' },
  { value: FulfillmentStatus.CONTENT_APPROVED, label: '已通过' },
  { value: FulfillmentStatus.CONTENT_PUBLISHED, label: '已发布' },
  { value: FulfillmentStatus.TRACKING_STARTED, label: '跟踪中' },
  { value: FulfillmentStatus.SETTLEMENT_COMPLETED, label: '已结算' }
];

const PRIORITY_OPTIONS = [
  { value: 'all', label: '全部优先级' },
  { value: Priority.HIGH, label: '高优先级' },
  { value: Priority.MEDIUM, label: '中优先级' },
  { value: Priority.LOW, label: '低优先级' }
];

export default function FulfillmentList({ className = "" }: FulfillmentListProps) {
  const [records, setRecords] = useState<FulfillmentRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<FulfillmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    status: 'all',
    priority: 'all',
    dateRange: 'all'
  });
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  
  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20); // 增加页面大小以减少请求次数
  const [totalPages, setTotalPages] = useState(1);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [currentEditRecord, setCurrentEditRecord] = useState<FulfillmentRecord | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // 搜索状态
  const [searchInput, setSearchInput] = useState('');
  const [actualSearchTerm, setActualSearchTerm] = useState('');

  // 性能优化：缓存数据
  const [dataCache, setDataCache] = useState<Map<string, any>>(new Map());
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const CACHE_DURATION = 60000; // 1分钟缓存

  // 初始化数据获取
  useEffect(() => {
    fetchRecords();
  }, []);

  // 处理搜索和筛选
  useEffect(() => {
    applyFilters();
  }, [records, actualSearchTerm, filters]);

  // 性能优化：记忆化的获取数据函数
  const fetchRecords = useCallback(async (useCache = true) => {
    try {
      setLoading(true);
      
      // 检查缓存
      const cacheKey = `fulfillment-records-${currentPage}-${pageSize}`;
      const now = Date.now();
      
      if (useCache && dataCache.has(cacheKey) && (now - lastFetchTime < CACHE_DURATION)) {
        const cachedData = dataCache.get(cacheKey);
        setRecords(cachedData);
        setLoading(false);
        return;
      }
      
      // 获取真实数据
      const response = await fetch(`/api/fulfillment-records?page=${currentPage}&limit=${pageSize}`, {
        // 性能优化：启用HTTP缓存
        headers: {
          'Cache-Control': 'max-age=60'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch records');
      }
      
      const data = await response.json();
              console.log('获取到的履约单数据:', data);
        console.log('原始数据长度:', data.data?.length);
      
      if (data.success && data.data) {
        // 转换API数据为组件需要的格式
        const transformedRecords: FulfillmentRecord[] = data.data.map((record: any) => ({
          id: record.id.toString(),
          title: record.title || `${record.influencer?.displayName || '未知达人'} × ${record.product?.name || '未知产品'}`,
          influencerName: record.influencer?.displayName || '未知达人',
          productName: record.product?.name || '未知产品',
          status: record.currentStatus as FulfillmentStatus,
          priority: record.priority as Priority,
          createdAt: new Date(record.createdAt * 1000).toISOString().split('T')[0],
          deadline: record.currentStageDeadline ? new Date(record.currentStageDeadline * 1000).toISOString().split('T')[0] : '无截止日期',
          budget: record.budget || 0,
          progress: calculateProgress(record.currentStatus),
          isOverdue: record.isCurrentStageOverdue || false
        }));

        console.log('转换后的数据长度:', transformedRecords.length);
        console.log('转换后的数据示例:', transformedRecords[0]);
        setRecords(transformedRecords);
        
        // 更新缓存
        dataCache.set(cacheKey, transformedRecords);
        setDataCache(new Map(dataCache));
        setLastFetchTime(now);
        
        // 更新分页信息
        if (data.pagination) {
          setTotalPages(data.pagination.pages);
        }
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('获取履约单列表失败:', error);
      
      console.error('获取履约单列表失败:', error);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, dataCache, lastFetchTime]);

  // 根据状态计算进度百分比
  const calculateProgress = useCallback((status: string): number => {
    const statusProgress: Record<string, number> = {
      [FulfillmentStatus.PENDING_SAMPLE]: 10,
      [FulfillmentStatus.SAMPLE_SENT]: 20,
      [FulfillmentStatus.SAMPLE_RECEIVED]: 30,
      [FulfillmentStatus.CONTENT_PRODUCTION]: 50,
      [FulfillmentStatus.CONTENT_REVIEW]: 70,
      [FulfillmentStatus.CONTENT_APPROVED]: 80,
      [FulfillmentStatus.CONTENT_PUBLISHED]: 85,
      [FulfillmentStatus.TRACKING_STARTED]: 90,
      [FulfillmentStatus.SETTLEMENT_COMPLETED]: 100
    };
    return statusProgress[status] || 0;
  }, []);

  // 性能优化：记忆化的筛选函数
  const applyFilters = useCallback(() => {
    let filtered = [...records];

    // 文本搜索
    if (actualSearchTerm) {
      const searchLower = actualSearchTerm.toLowerCase();
      filtered = filtered.filter(record => 
        record.title.toLowerCase().includes(searchLower) ||
        record.influencerName.toLowerCase().includes(searchLower) ||
        record.productName.toLowerCase().includes(searchLower)
      );
    }

    // 状态筛选
    if (filters.status !== 'all') {
      if (filters.status === 'overdue') {
        filtered = filtered.filter(record => record.isOverdue);
      } else {
        filtered = filtered.filter(record => record.status === filters.status);
      }
    }

    // 优先级筛选
    if (filters.priority !== 'all') {
      filtered = filtered.filter(record => record.priority === filters.priority);
    }

    // 日期范围筛选
    if (filters.dateRange !== 'all') {
      const today = new Date();
      const filterDate = new Date(today);
      
      switch (filters.dateRange) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(today.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(today.getMonth() - 1);
          break;
      }
      
      if (filters.dateRange !== 'all') {
        filtered = filtered.filter(record => 
          new Date(record.createdAt) >= filterDate
        );
      }
    }

    setFilteredRecords(filtered);
    setCurrentPage(1); // 重置到第一页
    setTotalPages(Math.ceil(filtered.length / pageSize));
  }, [records, actualSearchTerm, filters, pageSize]);

  // 性能优化：记忆化的状态徽章组件
  const getStatusBadge = useCallback((status: FulfillmentStatus, isOverdue?: boolean) => {
    const statusConfig = {
      [FulfillmentStatus.PENDING_SAMPLE]: { 
        color: isOverdue ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800', 
        text: '待寄样' 
      },
      [FulfillmentStatus.SAMPLE_SENT]: { 
        color: isOverdue ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800', 
        text: '已寄样' 
      },
      [FulfillmentStatus.SAMPLE_RECEIVED]: { 
        color: 'bg-green-100 text-green-800', 
        text: '已收样' 
      },
      [FulfillmentStatus.CONTENT_CREATION]: { 
        color: isOverdue ? 'bg-red-100 text-red-800' : 'bg-cyan-100 text-cyan-800', 
        text: '内容制作' 
      },
      [FulfillmentStatus.CONTENT_PRODUCTION]: { 
        color: isOverdue ? 'bg-red-100 text-red-800' : 'bg-purple-100 text-purple-800', 
        text: '制作中' 
      },
      [FulfillmentStatus.CONTENT_REVIEW]: { 
        color: 'bg-orange-100 text-orange-800', 
        text: '审核中' 
      },
      [FulfillmentStatus.CONTENT_APPROVED]: { 
        color: 'bg-green-100 text-green-800', 
        text: '已通过' 
      },
      [FulfillmentStatus.CONTENT_REJECTED]: { 
        color: 'bg-red-100 text-red-800', 
        text: '已拒绝' 
      },
      [FulfillmentStatus.CONTENT_PUBLISHED]: { 
        color: 'bg-green-100 text-green-800', 
        text: '已发布' 
      },
      [FulfillmentStatus.TRACKING_STARTED]: { 
        color: 'bg-indigo-100 text-indigo-800', 
        text: '跟踪中' 
      },
      [FulfillmentStatus.TRACKING_COMPLETED]: { 
        color: 'bg-blue-100 text-blue-800', 
        text: '跟踪完成' 
      },
      [FulfillmentStatus.SETTLEMENT_PENDING]: { 
        color: 'bg-yellow-100 text-yellow-800', 
        text: '待结算' 
      },
      [FulfillmentStatus.SETTLEMENT_COMPLETED]: { 
        color: 'bg-gray-100 text-gray-800', 
        text: '已结算' 
      },
      [FulfillmentStatus.CANCELLED]: { 
        color: 'bg-gray-100 text-gray-800', 
        text: '已取消' 
      },
      [FulfillmentStatus.EXPIRED]: { 
        color: 'bg-red-100 text-red-800', 
        text: '已过期' 
      }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { color: 'bg-gray-100 text-gray-800', text: '未知状态' };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {isOverdue && <span className="mr-1">⚠️</span>}
        {config.text}
      </span>
    );
  }, []);

  const getPriorityBadge = (priority: Priority) => {
    const priorityConfig = {
      [Priority.HIGH]: { color: 'bg-red-100 text-red-800', label: '高' },
      [Priority.MEDIUM]: { color: 'bg-yellow-100 text-yellow-800', label: '中' },
      [Priority.LOW]: { color: 'bg-gray-100 text-gray-800', label: '低' },
      [Priority.URGENT]: { color: 'bg-red-200 text-red-900', label: '紧急' }
    };
    
    const config = priorityConfig[priority];
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const handleSelectRecord = (recordId: string) => {
    setSelectedRecords(prev => 
      prev.includes(recordId) 
        ? prev.filter(id => id !== recordId)
        : [...prev, recordId]
    );
  };

  const handleSelectAll = () => {
    const currentPageRecords = getCurrentPageRecords();
    const allSelected = currentPageRecords.every(record => selectedRecords.includes(record.id));
    
    if (allSelected) {
      setSelectedRecords(prev => prev.filter(id => !currentPageRecords.some(record => record.id === id)));
    } else {
      setSelectedRecords(prev => [...prev, ...currentPageRecords.map(record => record.id).filter(id => !prev.includes(id))]);
    }
  };

  const getCurrentPageRecords = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredRecords.slice(startIndex, endIndex);
  };

  const handleBatchDelete = () => {
    if (selectedRecords.length === 0) return;
    
    // 使用自定义确认框，不弹出localhost窗口
    setDeleteTarget({ 
      id: 'batch', 
      title: `${selectedRecords.length} 个履约单` 
    });
    setShowDeleteModal(true);
  };

  const handleConfirmBatchDelete = async () => {
    if (selectedRecords.length === 0) return;

    setDeleteLoading(true);
    try {
      // 批量删除API调用
      const deletePromises = selectedRecords.map(async (recordId) => {
        const response = await fetch(`/api/fulfillment-records/${recordId}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error(`删除履约单 ${recordId} 失败`);
        }
        return recordId;
      });

      await Promise.all(deletePromises);
      
      // 更新本地状态
      setRecords(prev => prev.filter(record => !selectedRecords.includes(record.id)));
      setSelectedRecords([]);
      setShowDeleteModal(false);
      setDeleteTarget(null);
      alert(`成功删除 ${selectedRecords.length} 个履约单`);
    } catch (error) {
      console.error('批量删除失败:', error);
      alert(`删除失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  // 编辑状态处理函数
  const handleEditStatus = (record: FulfillmentRecord) => {
    setCurrentEditRecord(record);
    setShowStatusModal(true);
  };

  // 状态更新成功回调
  const handleStatusUpdateSuccess = (recordId: string, newStatus: FulfillmentStatus) => {
    setRecords(prev => prev.map(record => 
      record.id === recordId 
        ? { ...record, status: newStatus }
        : record
    ));
    setShowStatusModal(false);
    setCurrentEditRecord(null);
  };

  // 删除履约单
  const handleDeleteRecord = (recordId: string) => {
    const record = records.find(r => r.id === recordId);
    if (record) {
      setDeleteTarget({ id: recordId, title: record.title });
      setShowDeleteModal(true);
    }
  };

  // 确认删除
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    
    // 处理批量删除
    if (deleteTarget.id === 'batch') {
      await handleConfirmBatchDelete();
      return;
    }
    
    setDeleteLoading(true);
    try {
      // 调用删除API
      const response = await fetch(`/api/fulfillment-records/${deleteTarget.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || '删除失败');
      }
      
      // 更新本地状态
      setRecords(prev => prev.filter(record => record.id !== deleteTarget.id));
      setShowDeleteModal(false);
      setDeleteTarget(null);
      alert('删除成功');
    } catch (error) {
      console.error('删除失败:', error);
      alert(`删除失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  // 处理搜索
  const handleSearch = () => {
    setActualSearchTerm(searchInput.trim());
  };

  // 清除搜索
  const handleClearSearch = () => {
    setSearchInput('');
    setActualSearchTerm('');
  };

  // 处理回车搜索
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
                <div className="h-8 bg-gray-200 rounded w-24"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* 顶部工具栏 */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-medium text-gray-900">履约单列表</h2>
            <span className="text-sm text-gray-500">
              共 {filteredRecords.length} 条记录
            </span>
          </div>
        </div>
        
        {/* 搜索和筛选 */}
        <div className="mt-4 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1 flex space-x-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="搜索履约单..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-l-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              搜索
            </button>
            {actualSearchTerm && (
              <button
                onClick={handleClearSearch}
                className="px-3 py-2 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
              >
                清除
              </button>
            )}
          </div>
          
          <div className="flex space-x-4">
            <select
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
            >
              {STATUS_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            
            <select
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
              value={filters.priority}
              onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value as any }))}
            >
              {PRIORITY_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* 批量操作 */}
        {selectedRecords.length > 0 && (
          <div className="mt-4 flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              已选择 {selectedRecords.length} 项
            </span>
            <button
              onClick={handleBatchDelete}
              className="inline-flex items-center px-3 py-1 border border-red-300 text-sm font-medium rounded text-red-700 bg-red-50 hover:bg-red-100"
            >
              <TrashIcon className="h-4 w-4 mr-1" />
              批量删除
            </button>
          </div>
        )}
      </div>

      {/* 表格 */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={getCurrentPageRecords().length > 0 && getCurrentPageRecords().every(record => selectedRecords.includes(record.id))}
                  onChange={handleSelectAll}
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                履约单信息
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                状态
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                优先级
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                进度
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                预算
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {getCurrentPageRecords().map((record) => (
              <tr key={record.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={selectedRecords.includes(record.id)}
                    onChange={() => handleSelectRecord(record.id)}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <Link href={`/fulfillment/${record.id}`}>
                      <div className="text-sm font-medium text-gray-900 hover:text-blue-600 cursor-pointer">{record.title}</div>
                    </Link>
                    <div className="text-sm text-gray-500">
                      {record.influencerName} · {record.productName}
                    </div>
                    <div className="text-xs text-gray-400">
                      创建于 {record.createdAt} · 截止 {record.deadline}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(record.status, record.isOverdue)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getPriorityBadge(record.priority)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${record.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">{record.progress}%</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ¥{(record.budget / 10000).toFixed(1)}万
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditStatus(record)}
                      className="text-indigo-600 hover:text-indigo-900"
                      title="编辑状态"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteRecord(record.id)}
                      className="text-red-600 hover:text-red-900"
                      title="删除"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 分页 */}
      <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            上一页
          </button>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            下一页
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              显示第 <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> 到{' '}
              <span className="font-medium">{Math.min(currentPage * pageSize, filteredRecords.length)}</span> 条记录，
              共 <span className="font-medium">{filteredRecords.length}</span> 条
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              
              {[...Array(totalPages)].map((_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      page === currentPage
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* 状态更新模态框 */}
      {showStatusModal && currentEditRecord && (
        <StatusUpdateModal
          isOpen={showStatusModal}
          onClose={() => {
            setShowStatusModal(false);
            setCurrentEditRecord(null);
          }}
          record={{
            id: currentEditRecord.id,
            title: currentEditRecord.title,
            currentStatus: currentEditRecord.status,
            priority: currentEditRecord.priority,
            influencerName: currentEditRecord.influencerName,
            productName: currentEditRecord.productName
          }}
          onSuccess={handleStatusUpdateSuccess}
        />
      )}

      {/* 删除确认模态框 */}
      {showDeleteModal && deleteTarget && (
        <DeleteConfirmModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setDeleteTarget(null);
          }}
          onConfirm={handleConfirmDelete}
          title="删除履约单"
          description={`确定要删除履约单 "${deleteTarget.title}" 吗？此操作无法撤销。`}
          loading={deleteLoading}
        />
      )}
    </div>
  );
} 