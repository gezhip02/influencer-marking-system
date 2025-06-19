'use client';

import React, { useState, useEffect } from 'react';
import { 
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import StatusBadge from '@/components/ui/StatusBadge';
import { FulfillmentStatus, Priority } from '@/types/fulfillment';

interface RecordInfo {
  id: string;
  title: string;
  currentStatus: FulfillmentStatus;
  priority: Priority;
  influencerName: string;
  productName: string;
}

interface StatusUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: RecordInfo;
  onSuccess: (recordId: string, newStatus: FulfillmentStatus) => void;
}

interface StatusTransitionInfo {
  status: FulfillmentStatus;
  label: string;
  description: string;
  requiresNote: boolean;
  estimatedHours?: number;
  warnings?: string[];
}

const STATUS_TRANSITIONS: Record<FulfillmentStatus, StatusTransitionInfo> = {
  [FulfillmentStatus.PENDING_SAMPLE]: {
    status: FulfillmentStatus.PENDING_SAMPLE,
    label: '待寄样',
    description: '填写达人、产品，需要寄样=是，任务描述，任务优先级，时效T+1',
    requiresNote: false,
    estimatedHours: 24
  },
  [FulfillmentStatus.SAMPLE_SENT]: {
    status: FulfillmentStatus.SAMPLE_SENT,
    label: '已寄样',
    description: '填写物流单号，时效T+1',
    requiresNote: true,
    estimatedHours: 24
  },
  [FulfillmentStatus.SAMPLE_RECEIVED]: {
    status: FulfillmentStatus.SAMPLE_RECEIVED,
    label: '已签收',
    description: '更新sampleDeliveryTime，T+5完成',
    requiresNote: false,
    estimatedHours: 120 // T+5 = 5*24小时
  },
  [FulfillmentStatus.CONTENT_PLANNING]: {
    status: FulfillmentStatus.CONTENT_PLANNING,
    label: '内容策划中',
    description: '达人正在策划内容创作方案',
    requiresNote: false,
    estimatedHours: 48
  },
  [FulfillmentStatus.CONTENT_PRODUCTION]: {
    status: FulfillmentStatus.CONTENT_PRODUCTION,
    label: '内容制作',
    description: '发送制作指南，T+1完成（有寄样）/ 创建任务，发送制作指南，T+1（无寄样）',
    requiresNote: false,
    estimatedHours: 24
  },
  [FulfillmentStatus.CONTENT_REVIEW]: {
    status: FulfillmentStatus.CONTENT_REVIEW,
    label: '内容审核中',
    description: '内容已提交，正在审核中',
    requiresNote: false,
    estimatedHours: 24,
    warnings: ['请及时审核内容，避免影响发布时间']
  },
  [FulfillmentStatus.CONTENT_APPROVED]: {
    status: FulfillmentStatus.CONTENT_APPROVED,
    label: '内容已通过',
    description: '内容审核通过，准备发布',
    requiresNote: false,
    estimatedHours: 12
  },
  [FulfillmentStatus.CONTENT_REJECTED]: {
    status: FulfillmentStatus.CONTENT_REJECTED,
    label: '内容被拒绝',
    description: '内容审核未通过，需要重新制作',
    requiresNote: true,
    warnings: ['请详细说明拒绝原因，帮助达人改进']
  },
  [FulfillmentStatus.CONTENT_PUBLISHED]: {
    status: FulfillmentStatus.CONTENT_PUBLISHED,
    label: '已发布',
    description: '抓取视频链接，T+7完成',
    requiresNote: false,
    estimatedHours: 168 // T+7 = 7*24小时
  },
  [FulfillmentStatus.TRACKING_STARTED]: {
    status: FulfillmentStatus.TRACKING_STARTED,
    label: '销售转化',
    description: '计算adsRoi，人工打标签，T+7完成',
    requiresNote: false,
    estimatedHours: 168 // T+7 = 7*24小时
  },
  [FulfillmentStatus.TRACKING_COMPLETED]: {
    status: FulfillmentStatus.TRACKING_COMPLETED,
    label: '跟踪完成',
    description: '数据跟踪完成，准备结算',
    requiresNote: false,
    estimatedHours: 24
  },
  [FulfillmentStatus.SETTLEMENT_PENDING]: {
    status: FulfillmentStatus.SETTLEMENT_PENDING,
    label: '待结算',
    description: '等待财务结算',
    requiresNote: false,
    estimatedHours: 72
  },
  [FulfillmentStatus.SETTLEMENT_COMPLETED]: {
    status: FulfillmentStatus.SETTLEMENT_COMPLETED,
    label: '结算完成',
    description: '履约单已完成',
    requiresNote: false
  },
  [FulfillmentStatus.CANCELLED]: {
    status: FulfillmentStatus.CANCELLED,
    label: '已取消',
    description: '履约单已取消',
    requiresNote: true,
    warnings: ['取消操作无法撤回，请谨慎操作']
  },
  [FulfillmentStatus.EXPIRED]: {
    status: FulfillmentStatus.EXPIRED,
    label: '已过期',
    description: '履约单已过期',
    requiresNote: true
  }
};

export default function StatusUpdateModal({
  isOpen,
  onClose,
  record,
  onSuccess
}: StatusUpdateModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<FulfillmentStatus | null>(null);
  const [note, setNote] = useState('');
  const [forceUpdate, setForceUpdate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      setSelectedStatus(null);
      setNote('');
      setForceUpdate(false);
      setErrors([]);
    }
  }, [isOpen]);

  // 获取可用的状态转换选项 - 根据新的流程图更新
  const getAvailableStatuses = (): FulfillmentStatus[] => {
    const current = record.currentStatus;
    
    // 根据用户提供的新流程图定义状态转换逻辑
    switch (current) {
      // 有寄样流程: 待寄样 → 已寄样 → 已签收 → 内容制作 → 已发布 → 销售转化
      case FulfillmentStatus.PENDING_SAMPLE:
        return [FulfillmentStatus.SAMPLE_SENT, FulfillmentStatus.CANCELLED];
      case FulfillmentStatus.SAMPLE_SENT:
        return [FulfillmentStatus.SAMPLE_RECEIVED, FulfillmentStatus.CANCELLED];
      case FulfillmentStatus.SAMPLE_RECEIVED:
        return [FulfillmentStatus.CONTENT_PRODUCTION, FulfillmentStatus.CANCELLED];
      
      // 无寄样流程: 内容制作 → 已发布 → 销售转化
      case FulfillmentStatus.CONTENT_PRODUCTION:
        return [FulfillmentStatus.CONTENT_PUBLISHED, FulfillmentStatus.CANCELLED];
      case FulfillmentStatus.CONTENT_PUBLISHED:
        return [FulfillmentStatus.TRACKING_STARTED, FulfillmentStatus.CANCELLED];
      case FulfillmentStatus.TRACKING_STARTED:
        return [FulfillmentStatus.SETTLEMENT_COMPLETED, FulfillmentStatus.CANCELLED];
      
      // 完成状态
      case FulfillmentStatus.SETTLEMENT_COMPLETED:
        return []; // 已完成，无法再转换
      
      // 取消/过期状态
      case FulfillmentStatus.CANCELLED:
      case FulfillmentStatus.EXPIRED:
        return []; // 终止状态，无法再转换
      
      default:
        return [FulfillmentStatus.CANCELLED]; // 任何其他状态都可以取消
    }
  };

  const handleSubmit = async () => {
    if (!selectedStatus) return;
    
    setLoading(true);
    setErrors([]);
    
    try {
      const statusInfo = STATUS_TRANSITIONS[selectedStatus];
      
      // 验证是否需要备注
      if (statusInfo.requiresNote && !note.trim()) {
        setErrors(['此状态变更需要填写备注']);
        return;
      }
      
      // 调用API更新状态
      const response = await fetch(`/api/fulfillment-records/${record.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toStatus: selectedStatus,
          changeReason: 'manual_update',
          remarks: note.trim() || undefined,
          operatorId: 'current_user',
          forceTransition: forceUpdate
        }),
      });

      const result = await response.json();

      if (!result.success) {
        setErrors([result.error || '状态更新失败']);
        return;
      }

      // 显示成功消息
      console.log('状态更新成功:', result);
      
      onSuccess(record.id, selectedStatus);
      onClose();
    } catch (error) {
      setErrors([error instanceof Error ? error.message : '状态更新失败']);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: FulfillmentStatus) => {
    return STATUS_TRANSITIONS[status];
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
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          {/* 头部 */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">更新履约状态</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* 当前状态 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              当前状态
            </label>
            <StatusBadge status={record.currentStatus} size="md" />
          </div>

          {/* 可选状态 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              选择新状态
            </label>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {getAvailableStatuses().map((status: FulfillmentStatus) => {
                const statusInfo = getStatusInfo(status);
                return (
                  <div
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={`relative border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedStatus === status
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {selectedStatus === status ? (
                          <CheckCircleIcon className="w-5 h-5 text-blue-600" />
                        ) : (
                          <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <StatusBadge status={status} size="sm" />
                          {statusInfo.estimatedHours && (
                            <span className="text-xs text-gray-500">
                              预计 {statusInfo.estimatedHours > 24 
                                ? `${Math.round(statusInfo.estimatedHours / 24)}天` 
                                : `${statusInfo.estimatedHours}小时`}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{statusInfo.description}</p>
                        {statusInfo.warnings && statusInfo.warnings.length > 0 && (
                          <div className="mt-2 flex items-start space-x-1">
                            <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                            <div className="text-xs text-yellow-700">
                              {statusInfo.warnings.map((warning, index) => (
                                <div key={index}>{warning}</div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 备注输入 */}
          {selectedStatus && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                备注
                {STATUS_TRANSITIONS[selectedStatus].requiresNote && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={STATUS_TRANSITIONS[selectedStatus].requiresNote 
                  ? '请填写备注信息...' 
                  : '可选填写备注信息...'}
                rows={3}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          {/* 强制更新选项 */}
          {selectedStatus && (
            <div className="mb-6">
              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={forceUpdate}
                  onChange={(e) => setForceUpdate(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                />
                <div className="text-sm">
                  <span className="font-medium text-gray-700">强制更新</span>
                  <p className="text-gray-500">跳过状态转换验证，强制更新到选定状态</p>
                </div>
              </label>
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
              disabled={!selectedStatus || loading}
              className="flex-1 px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  更新中...
                </div>
              ) : (
                '确认更新'
              )}
            </button>
          </div>

          {/* 提示信息 */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-start space-x-2">
              <InformationCircleIcon className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p>状态更新后将自动记录操作日志，并通知相关人员。</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 