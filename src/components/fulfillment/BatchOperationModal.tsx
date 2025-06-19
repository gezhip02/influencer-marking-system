'use client';

import React, { useState, useEffect } from 'react';
import { 
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ArrowPathIcon,
  PencilIcon,
  TrashIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import StatusBadge from '@/components/ui/StatusBadge';
import PriorityBadge from '@/components/ui/PriorityBadge';
import { FulfillmentStatus, Priority } from '@/types/fulfillment';

interface BatchOperationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItems: string[];
  onBatchOperation: (operation: BatchOperation) => Promise<void>;
}

interface BatchOperation {
  type: 'status_update' | 'priority_update' | 'assign_tags' | 'delete';
  data: any;
  note?: string;
}

interface SelectedItemSummary {
  id: string;
  title: string;
  status: FulfillmentStatus;
  priority: Priority;
}

// 模拟数据 - 实际应用中应该从 props 获取
const mockSelectedItems: SelectedItemSummary[] = [
  {
    id: '1',
    title: '李佳琦直播带货合作',
    status: FulfillmentStatus.CONTENT_REVIEW,
    priority: Priority.HIGH
  },
  {
    id: '2', 
    title: '薇娅小红书种草推广',
    status: FulfillmentStatus.CONTENT_PRODUCTION,
    priority: Priority.MEDIUM
  }
];

const BATCH_OPERATION_TYPES = [
  {
    type: 'status_update' as const,
    label: '批量更新状态',
    description: '将选中的履约单更新为同一状态',
    icon: ArrowPathIcon,
    color: 'blue'
  },
  {
    type: 'priority_update' as const,
    label: '批量更新优先级',
    description: '调整选中履约单的优先级',
    icon: PencilIcon,
    color: 'green'
  },
  {
    type: 'assign_tags' as const,
    label: '批量分配标签',
    description: '为选中的履约单添加或移除标签',
    icon: TagIcon,
    color: 'purple'
  },
  {
    type: 'delete' as const,
    label: '批量删除',
    description: '删除选中的履约单（危险操作）',
    icon: TrashIcon,
    color: 'red'
  }
];

export default function BatchOperationModal({
  isOpen,
  onClose,
  selectedItems,
  onBatchOperation
}: BatchOperationModalProps) {
  const [selectedOperation, setSelectedOperation] = useState<string | null>(null);
  const [operationData, setOperationData] = useState<any>({});
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  
  // 在实际应用中，这些数据应该通过 API 获取
  const selectedItemsData = mockSelectedItems.filter(item => 
    selectedItems.includes(item.id)
  );

  useEffect(() => {
    if (isOpen) {
      setSelectedOperation(null);
      setOperationData({});
      setNote('');
      setErrors([]);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!selectedOperation) return;
    
    setLoading(true);
    setErrors([]);
    
    try {
      // 验证操作数据
      if (selectedOperation === 'status_update' && !operationData.status) {
        setErrors(['请选择要更新的状态']);
        return;
      }
      
      if (selectedOperation === 'priority_update' && !operationData.priority) {
        setErrors(['请选择要更新的优先级']);
        return;
      }
      
      if (selectedOperation === 'assign_tags' && (!operationData.tags || operationData.tags.length === 0)) {
        setErrors(['请选择要分配的标签']);
        return;
      }
      
      if (selectedOperation === 'delete' && !operationData.confirmed) {
        setErrors(['请确认删除操作']);
        return;
      }

      const operation: BatchOperation = {
        type: selectedOperation as any,
        data: operationData,
        note: note.trim() || undefined
      };
      
      await onBatchOperation(operation);
      onClose();
    } catch (error) {
      setErrors([error instanceof Error ? error.message : '批量操作失败']);
    } finally {
      setLoading(false);
    }
  };

  const renderOperationForm = () => {
    switch (selectedOperation) {
      case 'status_update':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                选择新状态
              </label>
              <select
                value={operationData.status || ''}
                onChange={(e) => setOperationData({ ...operationData, status: e.target.value })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">请选择状态</option>
                {Object.values(FulfillmentStatus).map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={operationData.forceUpdate || false}
                  onChange={(e) => setOperationData({ ...operationData, forceUpdate: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">强制更新（跳过状态验证）</span>
              </label>
            </div>
          </div>
        );
        
      case 'priority_update':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              选择新优先级
            </label>
            <div className="space-y-2">
              {Object.values(Priority).map((priority) => (
                <label key={priority} className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="priority"
                    value={priority}
                    checked={operationData.priority === priority}
                    onChange={(e) => setOperationData({ ...operationData, priority: e.target.value })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <PriorityBadge priority={priority as Priority} size="sm" />
                </label>
              ))}
            </div>
          </div>
        );
        
      case 'assign_tags':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                选择标签
              </label>
              <div className="border border-gray-300 rounded-md p-2 max-h-32 overflow-y-auto">
                {['重点项目', '紧急处理', '高价值客户', 'A级达人', '新产品推广'].map((tag) => (
                  <label key={tag} className="flex items-center space-x-2 py-1">
                    <input
                      type="checkbox"
                      checked={(operationData.tags || []).includes(tag)}
                      onChange={(e) => {
                        const tags = operationData.tags || [];
                        if (e.target.checked) {
                          setOperationData({ ...operationData, tags: [...tags, tag] });
                        } else {
                          setOperationData({ ...operationData, tags: tags.filter((t: string) => t !== tag) });
                        }
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">{tag}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="tagAction"
                  value="add"
                  checked={operationData.action === 'add' || !operationData.action}
                  onChange={(e) => setOperationData({ ...operationData, action: 'add' })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="text-sm text-gray-700">添加标签</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="tagAction"
                  value="remove"
                  checked={operationData.action === 'remove'}
                  onChange={(e) => setOperationData({ ...operationData, action: 'remove' })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="text-sm text-gray-700">移除标签</span>
              </label>
            </div>
          </div>
        );
        
      case 'delete':
        return (
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-start space-x-2">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-700">
                  <p className="font-medium">危险操作警告</p>
                  <p>删除操作无法撤回，请确认您真的要删除这 {selectedItems.length} 个履约单。</p>
                </div>
              </div>
            </div>
            <div>
              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={operationData.confirmed || false}
                  onChange={(e) => setOperationData({ ...operationData, confirmed: e.target.checked })}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded mt-1"
                />
                <div className="text-sm">
                  <span className="font-medium text-gray-700">我确认要删除这些履约单</span>
                  <p className="text-gray-500">此操作将永久删除选中的履约单及其相关数据</p>
                </div>
              </label>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* 背景遮罩 */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        {/* 模态框内容 */}
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
          {/* 头部 */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              批量操作 ({selectedItems.length} 项)
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* 选中项目概览 */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">选中的履约单</h4>
            <div className="border border-gray-200 rounded-md max-h-32 overflow-y-auto">
              {selectedItemsData.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <StatusBadge status={item.status} size="sm" />
                    <PriorityBadge priority={item.priority} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 操作类型选择 */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">选择操作类型</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {BATCH_OPERATION_TYPES.map((operation) => {
                const IconComponent = operation.icon;
                const colorClasses = {
                  blue: 'border-blue-200 bg-blue-50 text-blue-700',
                  green: 'border-green-200 bg-green-50 text-green-700',
                  purple: 'border-purple-200 bg-purple-50 text-purple-700',
                  red: 'border-red-200 bg-red-50 text-red-700'
                };
                
                return (
                  <div
                    key={operation.type}
                    onClick={() => setSelectedOperation(operation.type)}
                    className={`relative border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedOperation === operation.type
                        ? colorClasses[operation.color as keyof typeof colorClasses]
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {selectedOperation === operation.type ? (
                          <CheckCircleIcon className="w-5 h-5 text-blue-600" />
                        ) : (
                          <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <IconComponent className="w-4 h-4" />
                          <span className="text-sm font-medium">{operation.label}</span>
                        </div>
                        <p className="text-xs text-gray-600">{operation.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 操作配置表单 */}
          {selectedOperation && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">操作配置</h4>
              {renderOperationForm()}
            </div>
          )}

          {/* 备注输入 */}
          {selectedOperation && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                操作备注
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="可选填写操作备注..."
                rows={2}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          {/* 错误提示 */}
          {errors.length > 0 && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-start space-x-2">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-700">
                  {errors.map((error, index) => (
                    <div key={index}>{error}</div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedOperation || loading}
              className={`flex-1 px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                selectedOperation === 'delete'
                  ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                  : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  执行中...
                </div>
              ) : (
                '确认执行'
              )}
            </button>
          </div>

          {/* 提示信息 */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-start space-x-2">
              <InformationCircleIcon className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p>批量操作将对所有选中的履约单生效，操作完成后会记录详细日志。</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 