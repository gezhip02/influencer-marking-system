'use client';

import { useState } from 'react';
import { X, Plus, Palette, Tag } from 'lucide-react';

export interface TagFormData {
  name: string;
  displayName: string;
  description?: string;
  category: string;
  color: string;
  icon?: string;
  parentId?: string;
}

interface CreateTagFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TagFormData) => Promise<void>;
  isLoading?: boolean;
  existingTags?: { id: string; name: string; displayName: string }[];
}

const CATEGORY_OPTIONS = [
  { value: 'CONTENT', label: '内容类型', description: '根据内容类型分类达人' },
  { value: 'AUDIENCE', label: '受众群体', description: '根据受众特征分类达人' },
  { value: 'PERFORMANCE', label: '表现指标', description: '根据表现数据分类达人' },
  { value: 'INDUSTRY', label: '行业分类', description: '根据行业领域分类达人' },
  { value: 'GEOGRAPHY', label: '地理位置', description: '根据地理位置分类达人' },
  { value: 'COOPERATION', label: '合作相关', description: '根据合作状态分类达人' }
];

const COLOR_OPTIONS = [
  { value: '#FF69B4', label: '粉色', class: 'bg-pink-500' },
  { value: '#9932CC', label: '紫色', class: 'bg-purple-500' },
  { value: '#FF6347', label: '橙红', class: 'bg-orange-500' },
  { value: '#4169E1', label: '蓝色', class: 'bg-blue-500' },
  { value: '#32CD32', label: '绿色', class: 'bg-green-500' },
  { value: '#FF4500', label: '橙色', class: 'bg-orange-600' },
  { value: '#1E90FF', label: '天蓝', class: 'bg-sky-500' },
  { value: '#FFD700', label: '金色', class: 'bg-yellow-500' },
  { value: '#DC143C', label: '深红', class: 'bg-red-600' },
  { value: '#6B7280', label: '灰色', class: 'bg-gray-500' }
];

const ICON_OPTIONS = [
  { value: 'tag', label: '标签', icon: '🏷️' },
  { value: 'star', label: '星星', icon: '⭐' },
  { value: 'heart', label: '心形', icon: '❤️' },
  { value: 'crown', label: '皇冠', icon: '👑' },
  { value: 'fire', label: '火焰', icon: '🔥' },
  { value: 'diamond', label: '钻石', icon: '💎' },
  { value: 'rocket', label: '火箭', icon: '🚀' },
  { value: 'trophy', label: '奖杯', icon: '🏆' }
];

export default function CreateTagForm({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  existingTags = []
}: CreateTagFormProps) {
  const [formData, setFormData] = useState<TagFormData>({
    name: '',
    displayName: '',
    description: '',
    category: '',
    color: '#6B7280',
    icon: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showColorPicker, setShowColorPicker] = useState(false);

  // 验证表单
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // 验证名称
    if (!formData.name.trim()) {
      newErrors.name = '名称不能为空';
    } else if (formData.name.length < 2) {
      newErrors.name = '名称至少需要2个字符';
    } else if (formData.name.length > 50) {
      newErrors.name = '名称不能超过50个字符';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.name)) {
      newErrors.name = '名称只能包含字母、数字、下划线和短横线';
    } else if (existingTags.some(tag => tag.name === formData.name)) {
      newErrors.name = '该名称已存在';
    }

    // 验证显示名称
    if (!formData.displayName.trim()) {
      newErrors.displayName = '显示名称不能为空';
    } else if (formData.displayName.length < 1) {
      newErrors.displayName = '显示名称至少需要1个字符';
    } else if (formData.displayName.length > 20) {
      newErrors.displayName = '显示名称不能超过20个字符';
    }

    // 验证分类
    if (!formData.category) {
      newErrors.category = '请选择标签分类';
    }

    // 验证描述
    if (formData.description && formData.description.length > 200) {
      newErrors.description = '描述不能超过200个字符';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
      // 重置表单
      setFormData({
        name: '',
        displayName: '',
        description: '',
        category: '',
        color: '#6B7280',
        icon: ''
      });
      setErrors({});
    } catch (error) {
      console.error('提交表单失败:', error);
    }
  };

  // 处理表单字段变化
  const handleFieldChange = (field: keyof TagFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // 清除对应字段的错误
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // 自动生成名称（从显示名称）
    if (field === 'displayName' && !formData.name) {
      const generatedName = value
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-_]/g, '')
        .substring(0, 50);
      setFormData(prev => ({ ...prev, name: generatedName }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* 背景遮罩 */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* 模态框 */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {/* 头部 */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                  <Plus className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    创建新标签
                  </h3>
                  <p className="text-sm text-gray-500">
                    创建一个新的标签来分类管理达人
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={onClose}
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* 表单 */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 显示名称 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  显示名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => handleFieldChange('displayName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                    errors.displayName ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="例如：美妆博主"
                  maxLength={20}
                />
                {errors.displayName && (
                  <p className="mt-1 text-sm text-red-600">{errors.displayName}</p>
                )}
              </div>

              {/* 名称 (唯一标识) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  名称 (唯一标识) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="例如：beauty-blogger"
                  maxLength={50}
                />
                <p className="mt-1 text-xs text-gray-500">只能包含字母、数字、下划线和短横线</p>
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* 分类 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  分类 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleFieldChange('category', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                    errors.category ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">请选择分类</option>
                  {CATEGORY_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label} - {option.description}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                )}
              </div>

              {/* 颜色选择 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  标签颜色
                </label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_OPTIONS.map(color => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => handleFieldChange('color', color.value)}
                      className={`w-8 h-8 rounded-full ${color.class} border-2 ${
                        formData.color === color.value ? 'border-gray-900' : 'border-gray-300'
                      } hover:border-gray-600 transition-colors`}
                      title={color.label}
                    />
                  ))}
                </div>
                <div className="mt-2 flex items-center space-x-2">
                  <div 
                    className="w-6 h-6 rounded-full border-2 border-gray-300"
                    style={{ backgroundColor: formData.color }}
                  />
                  <span className="text-sm text-gray-600">当前选择: {formData.color}</span>
                </div>
              </div>

              {/* 图标选择 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  图标 (可选)
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleFieldChange('icon', '')}
                    className={`px-3 py-2 border rounded-md text-sm ${
                      !formData.icon ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                    }`}
                  >
                    无图标
                  </button>
                  {ICON_OPTIONS.map(icon => (
                    <button
                      key={icon.value}
                      type="button"
                      onClick={() => handleFieldChange('icon', icon.value)}
                      className={`px-3 py-2 border rounded-md text-sm flex items-center space-x-1 ${
                        formData.icon === icon.value ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                      }`}
                      title={icon.label}
                    >
                      <span>{icon.icon}</span>
                      <span>{icon.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 描述 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  描述 (可选)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                    errors.description ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="描述这个标签的用途和适用场景..."
                  maxLength={200}
                />
                <div className="flex justify-between mt-1">
                  <div>
                    {errors.description && (
                      <p className="text-sm text-red-600">{errors.description}</p>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {formData.description?.length || 0}/200
                  </p>
                </div>
              </div>
            </form>
          </div>

          {/* 底部按钮 */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '创建中...' : '创建标签'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 