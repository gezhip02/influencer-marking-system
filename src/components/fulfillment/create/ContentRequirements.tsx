'use client';

import React, { useState } from 'react';
import { 
  PlusIcon,
  XMarkIcon,
  DocumentTextIcon,
  PhotoIcon,
  VideoCameraIcon,
  SpeakerWaveIcon
} from '@heroicons/react/24/outline';

interface ContentItem {
  id: string;
  type: 'text' | 'image' | 'video' | 'audio';
  title: string;
  description: string;
  requirements: string;
  deadline: string;
  priority: 'high' | 'medium' | 'low';
}

interface ContentRequirementsProps {
  contentItems: ContentItem[];
  onChange: (items: ContentItem[]) => void;
  className?: string;
}

const CONTENT_TYPES = [
  { value: 'text', label: '图文内容', icon: DocumentTextIcon, color: 'text-blue-600 bg-blue-100' },
  { value: 'image', label: '图片内容', icon: PhotoIcon, color: 'text-green-600 bg-green-100' },
  { value: 'video', label: '视频内容', icon: VideoCameraIcon, color: 'text-purple-600 bg-purple-100' },
  { value: 'audio', label: '音频内容', icon: SpeakerWaveIcon, color: 'text-orange-600 bg-orange-100' }
];

const PRIORITY_OPTIONS = [
  { value: 'high', label: '高优先级', color: 'bg-red-100 text-red-800' },
  { value: 'medium', label: '中优先级', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'low', label: '低优先级', color: 'bg-gray-100 text-gray-800' }
];

export default function ContentRequirements({ 
  contentItems, 
  onChange, 
  className = "" 
}: ContentRequirementsProps) {
  const [showAddForm, setShowAddForm] = useState(false);

  const generateId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  const addContentItem = () => {
    const newItem: ContentItem = {
      id: generateId(),
      type: 'text',
      title: '',
      description: '',
      requirements: '',
      deadline: '',
      priority: 'medium'
    };
    onChange([...contentItems, newItem]);
    setShowAddForm(true);
  };

  const updateContentItem = (id: string, updates: Partial<ContentItem>) => {
    const updatedItems = contentItems.map(item =>
      item.id === id ? { ...item, ...updates } : item
    );
    onChange(updatedItems);
  };

  const removeContentItem = (id: string) => {
    const filteredItems = contentItems.filter(item => item.id !== id);
    onChange(filteredItems);
  };

  const getTypeConfig = (type: string) => {
    return CONTENT_TYPES.find(t => t.value === type) || CONTENT_TYPES[0];
  };

  const getPriorityConfig = (priority: string) => {
    return PRIORITY_OPTIONS.find(p => p.value === priority) || PRIORITY_OPTIONS[1];
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">内容需求清单</h3>
            <p className="mt-1 text-sm text-gray-500">
              详细描述需要创作的内容类型和要求
            </p>
          </div>
          <button
            onClick={addContentItem}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            添加内容
          </button>
        </div>
      </div>

      <div className="p-6">
        {contentItems.length === 0 ? (
          <div className="text-center py-12">
            <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">还没有添加内容需求</p>
            <button
              onClick={addContentItem}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              添加第一个内容需求
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {contentItems.map((item, index) => {
              const typeConfig = getTypeConfig(item.type);
              const priorityConfig = getPriorityConfig(item.priority);
              const IconComponent = typeConfig.icon;

              return (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-lg p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${typeConfig.color}`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <span className="font-medium text-gray-900">
                        内容 #{index + 1}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityConfig.color}`}>
                        {priorityConfig.label}
                      </span>
                    </div>
                    <button
                      onClick={() => removeContentItem(item.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          内容类型
                        </label>
                        <select
                          value={item.type}
                          onChange={(e) => updateContentItem(item.id, { type: e.target.value as any })}
                          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                        >
                          {CONTENT_TYPES.map(type => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          内容标题
                        </label>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => updateContentItem(item.id, { title: e.target.value })}
                          placeholder="请输入内容标题"
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          内容描述
                        </label>
                        <textarea
                          value={item.description}
                          onChange={(e) => updateContentItem(item.id, { description: e.target.value })}
                          placeholder="请描述内容的主要内容和目标"
                          rows={3}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          具体要求
                        </label>
                        <textarea
                          value={item.requirements}
                          onChange={(e) => updateContentItem(item.id, { requirements: e.target.value })}
                          placeholder="请详细说明创作要求、风格、注意事项等"
                          rows={4}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            优先级
                          </label>
                          <select
                            value={item.priority}
                            onChange={(e) => updateContentItem(item.id, { priority: e.target.value as any })}
                            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                          >
                            {PRIORITY_OPTIONS.map(priority => (
                              <option key={priority.value} value={priority.value}>
                                {priority.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            截止日期
                          </label>
                          <input
                            type="date"
                            value={item.deadline}
                            onChange={(e) => updateContentItem(item.id, { deadline: e.target.value })}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 内容创作建议 */}
        {contentItems.length > 0 && (
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-3">💡 内容创作建议</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium text-blue-800">图文内容</div>
                <div className="text-blue-700">注重视觉效果，配图要高清有吸引力</div>
              </div>
              <div>
                <div className="font-medium text-blue-800">视频内容</div>
                <div className="text-blue-700">前3秒是关键，要快速抓住观众注意力</div>
              </div>
              <div>
                <div className="font-medium text-blue-800">直播带货</div>
                <div className="text-blue-700">产品演示要详细，互动要积极</div>
              </div>
              <div>
                <div className="font-medium text-blue-800">数据跟踪</div>
                <div className="text-blue-700">关注曝光量、互动率、转化率等关键指标</div>
              </div>
            </div>
          </div>
        )}

        {/* 内容需求总览 */}
        {contentItems.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">📋 需求总览</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{contentItems.length}</div>
                <div className="text-gray-600">总内容数</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {contentItems.filter(item => item.priority === 'high').length}
                </div>
                <div className="text-gray-600">高优先级</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {contentItems.filter(item => item.type === 'video').length}
                </div>
                <div className="text-gray-600">视频内容</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {contentItems.filter(item => item.deadline && new Date(item.deadline) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)).length}
                </div>
                <div className="text-gray-600">7天内截止</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 