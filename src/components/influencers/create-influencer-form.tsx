'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Upload, User, Globe, Hash, Tag, DollarSign, BarChart3, Edit3 } from 'lucide-react';

export interface InfluencerFormData {
  // 平台信息
  platformId: string;
  platformUserId: string;
  username?: string;
  displayName?: string;
  avatarUrl?: string;
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
  
  // 扩展字段
  platformSpecificData?: any;
  notes?: string;
  
  // 标签和状态
  tagIds: string[];
  status?: string;
}

export interface Platform {
  id: string;
  name: string;
  displayName: string;
}

export interface TagData {
  id: string;
  name: string;
  displayName: string;
  color: string;
  category: string;
}

interface CreateInfluencerFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: InfluencerFormData) => Promise<void>;
  isLoading?: boolean;
  platforms?: Platform[];
  availableTags?: TagData[];
  initialData?: Partial<InfluencerFormData & { id: string; status: string; }>;
  mode?: 'create' | 'edit';
}

const GENDER_OPTIONS = [
  { value: 'male', label: '男性' },
  { value: 'female', label: '女性' },
  { value: 'other', label: '其他' },
  { value: 'unknown', label: '未知' }
];

const AGE_RANGE_OPTIONS = [
  { value: '18-24', label: '18-24岁' },
  { value: '25-34', label: '25-34岁' },
  { value: '35-44', label: '35-44岁' },
  { value: '45-54', label: '45-54岁' },
  { value: '55+', label: '55岁以上' },
  { value: 'unknown', label: '未知' }
];

const COOPERATION_OPENNESS_OPTIONS = [
  { value: 'high', label: '积极合作', color: 'text-green-600' },
  { value: 'medium', label: '中等合作', color: 'text-yellow-600' },
  { value: 'low', label: '较少合作', color: 'text-red-600' },
  { value: 'unknown', label: '未知', color: 'text-gray-600' }
];

const RISK_LEVEL_OPTIONS = [
  { value: 'low', label: '低风险', color: 'text-green-600' },
  { value: 'medium', label: '中等风险', color: 'text-yellow-600' },
  { value: 'high', label: '高风险', color: 'text-red-600' },
  { value: 'unknown', label: '未知', color: 'text-gray-600' }
];

const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'CNY', label: 'CNY (¥)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' }
];

const PRIMARY_CATEGORIES = [
  '美妆', '时尚', '生活方式', '科技', '游戏', '美食', '健身', '旅行', 
  '教育', '音乐', '舞蹈', '搞笑', '萌宠', '汽车', '母婴', '其他'
];

export default function CreateInfluencerForm({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  platforms = [],
  availableTags = [],
  initialData,
  mode = 'create'
}: CreateInfluencerFormProps) {
  const [formData, setFormData] = useState<InfluencerFormData>(() => {
    if (mode === 'edit' && initialData) {
      return {
        // 平台信息
        platformId: initialData.platformId || '',
        platformUserId: initialData.platformUserId || '',
        username: initialData.username || '',
        displayName: initialData.displayName || '',
        avatarUrl: initialData.avatarUrl || '',
        bio: initialData.bio || '',
        
        // 联系方式
        whatsappAccount: initialData.whatsappAccount || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        wechat: initialData.wechat || '',
        telegram: initialData.telegram || '',
        
        // 地理信息
        country: initialData.country || '',
        region: initialData.region || '',
        city: initialData.city || '',
        timezone: initialData.timezone || '',
        
        // 基础属性
        gender: initialData.gender || '',
        ageRange: initialData.ageRange || '',
        language: initialData.language || '',
        
        // 粉丝数据
        followersCount: initialData.followersCount || 0,
        followingCount: initialData.followingCount || 0,
        totalLikes: initialData.totalLikes || 0,
        totalVideos: initialData.totalVideos || 0,
        avgVideoViews: initialData.avgVideoViews || 0,
        engagementRate: initialData.engagementRate || 0,
        
        // 内容属性
        primaryCategory: initialData.primaryCategory || '',
        contentStyle: initialData.contentStyle || null,
        contentLanguage: initialData.contentLanguage || '',
        
        // 商业合作
        cooperationOpenness: initialData.cooperationOpenness || 'unknown',
        baseCooperationFee: initialData.baseCooperationFee || 0,
        cooperationCurrency: initialData.cooperationCurrency || 'USD',
        cooperationPreferences: initialData.cooperationPreferences || null,
        
        // 质量评估
        qualityScore: initialData.qualityScore || 0,
        riskLevel: initialData.riskLevel || 'unknown',
        blacklistReason: initialData.blacklistReason || '',
        
        // 数据来源
        dataSource: initialData.dataSource || 'manual',
        lastDataSync: initialData.lastDataSync || '',
        dataAccuracy: initialData.dataAccuracy || 0,
        
        // 扩展字段
        platformSpecificData: initialData.platformSpecificData || null,
        notes: initialData.notes || '',
        
        // 标签和状态
        tagIds: initialData.tagIds || [],
        status: initialData.status || 'ACTIVE'
      };
    }
    return {
      platformId: '',
      platformUserId: '',
      username: '',
      displayName: '',
      followersCount: 0,
      tagIds: [],
      cooperationCurrency: 'USD',
      cooperationOpenness: 'unknown',
      riskLevel: 'unknown',
      status: 'ACTIVE'
    };
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTags, setSelectedTags] = useState<TagData[]>([]);

  // 初始化编辑模式的标签
  useEffect(() => {
    if (mode === 'edit' && initialData && initialData.tagIds && availableTags.length > 0) {
      const initialTags = availableTags.filter(tag => initialData.tagIds?.includes(tag.id));
      setSelectedTags(initialTags);
    }
  }, [mode, initialData, availableTags]);

  const steps = [
    { id: 1, title: '平台信息', icon: Globe },
    { id: 2, title: '基础信息', icon: User },
    { id: 3, title: '数据指标', icon: BarChart3 },
    { id: 4, title: '商业合作', icon: DollarSign },
    { id: 5, title: '标签分类', icon: Tag }
  ];

  // 重置表单
  const resetForm = () => {
    setFormData({
      platformId: '',
      platformUserId: '',
      username: '',
      displayName: '',
      followersCount: 0,
      tagIds: [],
      cooperationCurrency: 'USD',
      cooperationOpenness: 'unknown',
      riskLevel: 'unknown'
    });
    setErrors({});
    setCurrentStep(1);
    setSelectedTags([]);
  };

  // 表单字段变化处理
  const handleFieldChange = (field: keyof InfluencerFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // 清除相关错误
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // 标签选择处理
  const handleTagToggle = (tag: TagData) => {
    const isSelected = selectedTags.some(t => t.id === tag.id);
    if (isSelected) {
      setSelectedTags(prev => prev.filter(t => t.id !== tag.id));
      setFormData(prev => ({
        ...prev, 
        tagIds: prev.tagIds.filter(id => id !== tag.id)
      }));
    } else {
      setSelectedTags(prev => [...prev, tag]);
      setFormData(prev => ({
        ...prev,
        tagIds: [...prev.tagIds, tag.id]
      }));
    }
  };

  // 验证当前步骤
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1: // 平台信息
        if (!formData.platformId) newErrors.platformId = '请选择平台';
        if (!formData.platformUserId) newErrors.platformUserId = '请输入平台用户ID';
        break;
      
      case 2: // 基础信息
        if (!formData.displayName) newErrors.displayName = '请输入显示名称';
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = '请输入有效的邮箱地址';
        }
        break;
      
      case 3: // 数据指标
        if (formData.followersCount < 0) newErrors.followersCount = '粉丝数不能为负数';
        if (formData.engagementRate && (formData.engagementRate < 0 || formData.engagementRate > 1)) {
          newErrors.engagementRate = '互动率应在0-1之间';
        }
        if (formData.qualityScore && (formData.qualityScore < 0 || formData.qualityScore > 100)) {
          newErrors.qualityScore = '质量评分应在0-100之间';
        }
        break;
      
      case 4: // 商业合作
        if (formData.baseCooperationFee && formData.baseCooperationFee < 0) {
          newErrors.baseCooperationFee = '合作费用不能为负数';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 下一步
  const handleNext = (e?: React.MouseEvent) => {
    e?.preventDefault(); // 防止任何意外的表单提交
    console.log('handleNext called, current step:', currentStep);
    if (validateStep(currentStep)) {
      console.log('Validation passed, moving to next step');
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    } else {
      console.log('Validation failed for step:', currentStep);
    }
  };

  // 上一步
  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // 处理键盘事件，防止意外提交
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentStep < steps.length) {
      e.preventDefault();
      handleNext();
    }
  };

  // 表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submit triggered! Current step:', currentStep, 'Total steps:', steps.length);
    
    // 只有在最后一步才允许提交
    if (currentStep !== steps.length) {
      console.log('Not on final step, preventing submission');
      return;
    }
    
    if (!validateStep(currentStep)) {
      console.log('Validation failed for step:', currentStep);
      return;
    }

    console.log('Submitting form data:', formData);
    try {
      // 添加额外的检查确保当前在最后一步
      if (currentStep !== steps.length) {
        console.error('ERROR: Attempting to submit on non-final step!');
        return;
      }
      await onSubmit(formData);
      resetForm();
    } catch (error) {
      console.error('提交表单失败:', error);
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
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* 头部 */}
          <div className="bg-white px-6 pt-6 pb-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                  {mode === 'edit' ? (
                    <Edit3 className="h-6 w-6 text-blue-600" />
                  ) : (
                    <Plus className="h-6 w-6 text-blue-600" />
                  )}
                </div>
                <div className="ml-3">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {mode === 'edit' ? '编辑达人信息' : '创建新达人'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {mode === 'edit' ? '修改达人的基本信息和标签' : '添加新的达人信息到系统中'}
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

            {/* 步骤指示器 */}
            <nav aria-label="Progress">
              <ol className="flex items-center">
                {steps.map((step, stepIdx) => (
                  <li key={step.id} className={`${stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''} relative`}>
                    <div className="flex items-center">
                      <div className={`relative flex h-8 w-8 items-center justify-center rounded-full ${
                        step.id < currentStep 
                          ? 'bg-blue-600 text-white' 
                          : step.id === currentStep 
                            ? 'border-2 border-blue-600 bg-white text-blue-600' 
                            : 'border-2 border-gray-300 bg-white text-gray-500'
                      }`}>
                        {step.id < currentStep ? (
                          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <step.icon className="h-4 w-4" />
                        )}
                      </div>
                      <span className={`ml-2 text-sm font-medium ${
                        step.id === currentStep ? 'text-blue-600' : 'text-gray-500'
                      }`}>
                        {step.title}
                      </span>
                    </div>
                    {stepIdx !== steps.length - 1 && (
                      <div className="absolute top-4 left-4 -ml-px mt-0.5 h-full w-0.5 bg-gray-300" />
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          </div>

          {/* 表单内容 */}
          <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="px-6 pb-6">
            <div className="mt-6">
              {/* 步骤1: 平台信息 */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 平台选择 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        选择平台 <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.platformId}
                        onChange={(e) => handleFieldChange('platformId', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                          errors.platformId ? 'border-red-300' : 'border-gray-300'
                        }`}
                      >
                        <option value="">请选择平台</option>
                        {platforms.map(platform => (
                          <option key={platform.id} value={platform.id}>
                            {platform.displayName}
                          </option>
                        ))}
                      </select>
                      {errors.platformId && (
                        <p className="mt-1 text-sm text-red-600">{errors.platformId}</p>
                      )}
                    </div>

                    {/* 平台用户ID */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        平台用户ID <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.platformUserId}
                        onChange={(e) => handleFieldChange('platformUserId', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                          errors.platformUserId ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="平台上的唯一标识"
                      />
                      {errors.platformUserId && (
                        <p className="mt-1 text-sm text-red-600">{errors.platformUserId}</p>
                      )}
                    </div>

                    {/* 用户名 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        用户名
                      </label>
                      <input
                        type="text"
                        value={formData.username || ''}
                        onChange={(e) => handleFieldChange('username', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="@username"
                      />
                    </div>

                    {/* 头像URL */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        头像链接
                      </label>
                      <input
                        type="url"
                        value={formData.avatarUrl || ''}
                        onChange={(e) => handleFieldChange('avatarUrl', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  {/* 简介 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      简介
                    </label>
                    <textarea
                      value={formData.bio || ''}
                      onChange={(e) => handleFieldChange('bio', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="达人的个人简介..."
                    />
                  </div>
                </div>
              )}

              {/* 步骤2: 基础信息 */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 显示名称 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        显示名称 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.displayName || ''}
                        onChange={(e) => handleFieldChange('displayName', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                          errors.displayName ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="达人显示名称"
                      />
                      {errors.displayName && (
                        <p className="mt-1 text-sm text-red-600">{errors.displayName}</p>
                      )}
                    </div>

                    {/* 性别 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        性别
                      </label>
                      <select
                        value={formData.gender || ''}
                        onChange={(e) => handleFieldChange('gender', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">请选择</option>
                        {GENDER_OPTIONS.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 年龄范围 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        年龄范围
                      </label>
                      <select
                        value={formData.ageRange || ''}
                        onChange={(e) => handleFieldChange('ageRange', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">请选择</option>
                        {AGE_RANGE_OPTIONS.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 主要分类 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        主要分类
                      </label>
                      <select
                        value={formData.primaryCategory || ''}
                        onChange={(e) => handleFieldChange('primaryCategory', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">请选择</option>
                        {PRIMARY_CATEGORIES.map(category => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* 联系方式 */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">联系方式</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          手机号
                        </label>
                        <input
                          type="tel"
                          value={formData.phone || ''}
                          onChange={(e) => handleFieldChange('phone', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          placeholder="+8613800138000"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          邮箱
                        </label>
                        <input
                          type="email"
                          value={formData.email || ''}
                          onChange={(e) => handleFieldChange('email', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                            errors.email ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="email@example.com"
                        />
                        {errors.email && (
                          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          WhatsApp
                        </label>
                        <input
                          type="text"
                          value={formData.whatsappAccount || ''}
                          onChange={(e) => handleFieldChange('whatsappAccount', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          placeholder="+1234567890"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          微信
                        </label>
                        <input
                          type="text"
                          value={formData.wechat || ''}
                          onChange={(e) => handleFieldChange('wechat', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          placeholder="微信号"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Telegram
                        </label>
                        <input
                          type="text"
                          value={formData.telegram || ''}
                          onChange={(e) => handleFieldChange('telegram', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          placeholder="@telegram_username"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 地理信息 */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">地理信息</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          国家
                        </label>
                        <input
                          type="text"
                          value={formData.country || ''}
                          onChange={(e) => handleFieldChange('country', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          placeholder="中国"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          省/州
                        </label>
                        <input
                          type="text"
                          value={formData.region || ''}
                          onChange={(e) => handleFieldChange('region', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          placeholder="广东省"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          城市
                        </label>
                        <input
                          type="text"
                          value={formData.city || ''}
                          onChange={(e) => handleFieldChange('city', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          placeholder="深圳市"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 步骤3: 数据指标 */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 粉丝数 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        粉丝数 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={formData.followersCount}
                        onChange={(e) => handleFieldChange('followersCount', parseInt(e.target.value) || 0)}
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                          errors.followersCount ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="0"
                        min="0"
                      />
                      {errors.followersCount && (
                        <p className="mt-1 text-sm text-red-600">{errors.followersCount}</p>
                      )}
                    </div>

                    {/* 关注数 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        关注数
                      </label>
                      <input
                        type="number"
                        value={formData.followingCount || ''}
                        onChange={(e) => handleFieldChange('followingCount', parseInt(e.target.value) || undefined)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0"
                        min="0"
                      />
                    </div>

                    {/* 视频数量 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        视频数量
                      </label>
                      <input
                        type="number"
                        value={formData.totalVideos || ''}
                        onChange={(e) => handleFieldChange('totalVideos', parseInt(e.target.value) || undefined)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0"
                        min="0"
                      />
                    </div>

                    {/* 平均播放量 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        平均播放量
                      </label>
                      <input
                        type="number"
                        value={formData.avgVideoViews || ''}
                        onChange={(e) => handleFieldChange('avgVideoViews', parseInt(e.target.value) || undefined)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0"
                        min="0"
                      />
                    </div>

                    {/* 互动率 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        互动率 (0-1)
                      </label>
                      <input
                        type="number"
                        step="0.001"
                        value={formData.engagementRate || ''}
                        onChange={(e) => handleFieldChange('engagementRate', parseFloat(e.target.value) || undefined)}
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                          errors.engagementRate ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="0.05"
                        min="0"
                        max="1"
                      />
                      {errors.engagementRate && (
                        <p className="mt-1 text-sm text-red-600">{errors.engagementRate}</p>
                      )}
                    </div>

                    {/* 质量评分 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        质量评分 (0-100)
                      </label>
                      <input
                        type="number"
                        value={formData.qualityScore || ''}
                        onChange={(e) => handleFieldChange('qualityScore', parseInt(e.target.value) || undefined)}
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                          errors.qualityScore ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="85"
                        min="0"
                        max="100"
                      />
                      {errors.qualityScore && (
                        <p className="mt-1 text-sm text-red-600">{errors.qualityScore}</p>
                      )}
                    </div>
                  </div>

                  {/* 风险等级 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      风险等级
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {RISK_LEVEL_OPTIONS.map(option => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleFieldChange('riskLevel', option.value)}
                          className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
                            formData.riskLevel === option.value
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-300 bg-white hover:bg-gray-50'
                          }`}
                        >
                          <span className={option.color}>{option.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 步骤4: 商业合作 */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  {/* 合作意愿 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      合作意愿
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {COOPERATION_OPENNESS_OPTIONS.map(option => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleFieldChange('cooperationOpenness', option.value)}
                          className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
                            formData.cooperationOpenness === option.value
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-300 bg-white hover:bg-gray-50'
                          }`}
                        >
                          <span className={option.color}>{option.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 合作费用 */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        基础合作费用
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.baseCooperationFee || ''}
                        onChange={(e) => handleFieldChange('baseCooperationFee', parseFloat(e.target.value) || undefined)}
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                          errors.baseCooperationFee ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="1000.00"
                        min="0"
                      />
                      {errors.baseCooperationFee && (
                        <p className="mt-1 text-sm text-red-600">{errors.baseCooperationFee}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        货币
                      </label>
                      <select
                        value={formData.cooperationCurrency}
                        onChange={(e) => handleFieldChange('cooperationCurrency', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      >
                        {CURRENCY_OPTIONS.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* 备注 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      备注
                    </label>
                    <textarea
                      value={formData.notes || ''}
                      onChange={(e) => handleFieldChange('notes', e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="关于此达人的其他重要信息..."
                    />
                  </div>
                </div>
              )}

              {/* 步骤5: 标签分类 */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      选择标签 ({selectedTags.length} 个已选择)
                    </label>
                    
                    {availableTags.length > 0 ? (
                      <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-md p-4">
                        <div className="space-y-4">
                          {/* 按分类分组显示标签 */}
                          {Array.from(new Set(availableTags.map(tag => tag.category))).map(category => (
                            <div key={category}>
                              <h4 className="text-sm font-medium text-gray-900 mb-2">
                                {category === 'CONTENT' && '内容类型'}
                                {category === 'AUDIENCE' && '受众群体'}
                                {category === 'PERFORMANCE' && '表现指标'}
                                {category === 'INDUSTRY' && '行业分类'}
                                {category === 'GEOGRAPHY' && '地理位置'}
                                {category === 'COOPERATION' && '合作相关'}
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {availableTags
                                  .filter(tag => tag.category === category)
                                  .map(tag => (
                                  <button
                                    key={tag.id}
                                    type="button"
                                    onClick={() => handleTagToggle(tag)}
                                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                      selectedTags.some(t => t.id === tag.id)
                                        ? 'text-white'
                                        : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                    style={{
                                      backgroundColor: selectedTags.some(t => t.id === tag.id) ? tag.color : 'transparent',
                                      border: `1px solid ${tag.color}`
                                    }}
                                  >
                                    {tag.displayName}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Tag className="mx-auto h-8 w-8 mb-2" />
                        <p>暂无可用标签</p>
                      </div>
                    )}

                    {/* 已选择的标签 */}
                    {selectedTags.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">已选择的标签:</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedTags.map(tag => (
                            <span
                              key={tag.id}
                              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white"
                              style={{ backgroundColor: tag.color }}
                            >
                              {tag.displayName}
                              <button
                                type="button"
                                onClick={() => handleTagToggle(tag)}
                                className="ml-2 text-white hover:text-gray-200"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 底部按钮 */}
            <div className="mt-8 flex justify-between">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentStep === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                上一步
              </button>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  取消
                </button>

                {currentStep < steps.length ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Next button clicked, current step:', currentStep);
                      handleNext(e);
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    下一步
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isLoading}
                    onClick={(e) => {
                      console.log('Submit button clicked, current step:', currentStep);
                      if (currentStep !== steps.length) {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Blocking submit on non-final step');
                        return false;
                      }
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading 
                      ? (mode === 'edit' ? '保存中...' : '创建中...') 
                      : (mode === 'edit' ? '保存修改' : '创建达人')
                    }
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 