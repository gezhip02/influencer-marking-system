'use client';

import React, { useState, useEffect } from 'react';
import { 
  ClockIcon, 
  ExclamationTriangleIcon,
  ChevronRightIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { FulfillmentStatus } from '@/types/fulfillment';

interface TodoItem {
  id: string;
  title: string;
  type: 'overdue' | 'urgent' | 'normal';
  status: FulfillmentStatus;
  statusDisplayName: string;
  assignee: string;
  dueDate: string;
  overdueHours?: number;
  priority: 'high' | 'medium' | 'low';
}

interface TodoListProps {
  maxItems?: number;
  showHeader?: boolean;
  className?: string;
}

export default function TodoList({ 
  maxItems = 5, 
  showHeader = true,
  className = ""
}: TodoListProps) {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockTodos: TodoItem[] = [
        {
          id: '1',
          title: '审核达人内容 - 美妆新品推广',
          type: 'overdue',
          status: FulfillmentStatus.CONTENT_REVIEW,
          statusDisplayName: '内容审核中',
          assignee: '张小美',
          dueDate: '2小时前',
          overdueHours: 2,
          priority: 'high'
        },
        {
          id: '2', 
          title: '寄送样品 - 护肤套装试用',
          type: 'urgent',
          status: FulfillmentStatus.PENDING_SAMPLE,
          statusDisplayName: '待寄样',
          assignee: '李运营',
          dueDate: '1小时内',
          priority: 'high'
        },
        {
          id: '3',
          title: '跟进制作进度 - 家居用品测评',
          type: 'normal',
          status: FulfillmentStatus.CONTENT_PRODUCTION,
          statusDisplayName: '内容制作中',
          assignee: '王小明',
          dueDate: '明天 14:00',
          priority: 'medium'
        },
        {
          id: '4',
          title: '确认发布时间 - 电子产品评测',
          type: 'normal',
          status: FulfillmentStatus.CONTENT_APPROVED,
          statusDisplayName: '内容已通过',
          assignee: '赵编辑',
          dueDate: '后天 10:00',
          priority: 'medium'
        },
        {
          id: '5',
          title: '数据分析报告 - 服装推广',
          type: 'normal',
          status: FulfillmentStatus.TRACKING_COMPLETED,
          statusDisplayName: '数据跟踪完成',
          assignee: '刘分析',
          dueDate: '下周一',
          priority: 'low'
        }
      ];

      setTodos(mockTodos.slice(0, maxItems));
    } catch (error) {
      console.error('获取待办任务失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'overdue':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'urgent':
        return <ClockIcon className="h-5 w-5 text-orange-500" />;
      default:
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'overdue':
        return 'border-l-red-500 bg-red-50';
      case 'urgent':
        return 'border-l-orange-500 bg-orange-50';
      default:
        return 'border-l-blue-500 bg-blue-50';
    }
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800', 
      low: 'bg-gray-100 text-gray-800'
    };
    
    const labels = {
      high: '高',
      medium: '中',
      low: '低'
    };

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors[priority as keyof typeof colors]}`}>
        {labels[priority as keyof typeof labels]}
      </span>
    );
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
        {showHeader && (
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">待办任务</h3>
          </div>
        )}
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
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
          <h3 className="text-lg font-medium text-gray-900">待办任务</h3>
          <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            查看全部
          </button>
        </div>
      )}
      
      <div className="divide-y divide-gray-200">
        {todos.length === 0 ? (
          <div className="p-6 text-center">
            <CheckCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">暂无待办任务</p>
          </div>
        ) : (
          todos.map((todo) => (
            <div
              key={todo.id}
              className={`p-4 border-l-4 hover:bg-gray-50 cursor-pointer transition-colors duration-200 ${getTypeColor(todo.type)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  {getTypeIcon(todo.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {todo.title}
                      </p>
                      {getPriorityBadge(todo.priority)}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span className="flex items-center">
                        状态: {todo.statusDisplayName}
                      </span>
                      <span>负责人: {todo.assignee}</span>
                      <span className={todo.type === 'overdue' ? 'text-red-600 font-medium' : ''}>
                        {todo.type === 'overdue' && todo.overdueHours 
                          ? `逾期 ${todo.overdueHours} 小时` 
                          : `截止: ${todo.dueDate}`
                        }
                      </span>
                    </div>
                  </div>
                </div>
                
                <ChevronRightIcon className="h-5 w-5 text-gray-400 flex-shrink-0 ml-2" />
              </div>
            </div>
          ))
        )}
      </div>
      
      {todos.length > 0 && (
        <div className="px-6 py-3 bg-gray-50 text-center">
          <button
            onClick={fetchTodos}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            刷新任务
          </button>
        </div>
      )}
    </div>
  );
} 