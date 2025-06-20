'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import StepIndicator from '@/components/fulfillment/create/StepIndicator';
import InfluencerSelector from '@/components/fulfillment/create/InfluencerSelector';
import ProductSelector from '@/components/fulfillment/create/ProductSelector';
import PlanSelector from '@/components/fulfillment/create/PlanSelector';
import { 
  ArrowLeftIcon, 
  ArrowRightIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

interface CreateFulfillmentFormData {
  influencer: any | null;
  product: any | null;
  plan: any | null;
}

const steps = [
  { id: 1, name: '选择达人', description: '选择合作的达人' },
  { id: 2, name: '选择产品', description: '选择推广的产品' },
  { id: 3, name: '合作方案', description: '确定合作模式' }
];

export default function CreateFulfillmentPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<CreateFulfillmentFormData>({
    influencer: null,
    product: null,
    plan: null
  });

  const updateFormData = (updates: Partial<CreateFulfillmentFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const canGoNext = () => {
    switch (currentStep) {
      case 1:
        return formData.influencer !== null;
      case 2:
        return formData.product !== null;
      case 3:
        return formData.plan !== null;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // 生成履约单标题
      const title = `${formData.influencer?.displayName || formData.influencer?.name} × ${formData.product?.name} 合作`;
      
      const fulfillmentData = {
        title,
        description: `${formData.plan?.planName} - ${formData.plan?.description || ''}`,
        influencerId: formData.influencer?.id,
        productId: formData.product?.id,
        planId: formData.plan?.id,
        ownerId: "1001", // 使用有效的用户ID，实际应该从用户会话获取
        priority: "medium",
        currentStatus: formData.plan?.initialStatus || "pending_sample"
      };

      console.log('准备创建履约单:', fulfillmentData);
      
      // 调用真实的API
      const response = await fetch('/api/fulfillment-records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fulfillmentData),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || '创建失败');
      }

      if (result.success) {
        console.log('履约单创建成功:', result.data);
        // 显示成功消息并跳转到履约单列表
        console.log('履约单创建成功！');
        // 强制刷新页面以确保列表更新
        router.push('/fulfillment?refresh=true');
      } else {
        throw new Error(result.error || '创建失败');
      }
    } catch (error) {
      console.error('创建履约单失败:', error);
      alert(`创建失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <InfluencerSelector
            selectedInfluencer={formData.influencer}
            onSelect={(influencer) => updateFormData({ influencer })}
          />
        );
      case 2:
        return (
          <ProductSelector
            selectedProduct={formData.product}
            onSelect={(product) => updateFormData({ product })}
          />
        );
      case 3:
        return (
          <PlanSelector
            selectedPlan={formData.plan}
            onSelect={(plan) => updateFormData({ plan })}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* 顶部导航区域 */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="inline-flex items-center text-gray-600 hover:text-blue-600 transition-colors duration-200"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                返回
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">创建履约单</h1>
                <p className="text-sm text-gray-600 mt-1">
                  通过简单几步创建新的达人合作履约单
                </p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              第 {currentStep} 步，共 {steps.length} 步
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 步骤指示器 */}
        <div className="mb-8">
          <StepIndicator steps={steps} currentStep={currentStep} />
        </div>

        {/* 选择摘要卡片 */}
        {(formData.influencer || formData.product || formData.plan) && (
          <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <CheckIcon className="h-5 w-5 text-green-500 mr-2" />
                当前选择
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {formData.influencer && (
                  <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckIcon className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-green-900">达人</div>
                      <div className="font-semibold text-gray-900">{formData.influencer.displayName || formData.influencer.name}</div>
                      <div className="text-sm text-gray-600">{formData.influencer.followersCount?.toLocaleString()} 粉丝</div>
                    </div>
                  </div>
                )}
                {formData.product && (
                  <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <CheckIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-blue-900">产品</div>
                      <div className="font-semibold text-gray-900">{formData.product.name}</div>
                      <div className="text-sm text-gray-600">¥{formData.product.price}</div>
                    </div>
                  </div>
                )}
                {formData.plan && (
                  <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                      <CheckIcon className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-purple-900">方案</div>
                      <div className="font-semibold text-gray-900">{formData.plan.planName}</div>
                      <div className="text-sm text-gray-600">{formData.plan.contentType} • {formData.plan.requiresSample ? '需要寄样' : '无需寄样'}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 步骤内容 */}
        <div className="mb-8">
          {renderStepContent()}
        </div>

        {/* 导航按钮 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              上一步
            </button>

            {currentStep < steps.length ? (
              <button
                onClick={handleNext}
                disabled={!canGoNext()}
                className="inline-flex items-center px-8 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                下一步
                <ArrowRightIcon className="h-4 w-4 ml-2" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!canGoNext() || loading}
                className="inline-flex items-center px-8 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    创建中...
                  </>
                ) : (
                  <>
                    <CheckIcon className="h-4 w-4 mr-2" />
                    创建履约单
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* 帮助信息 */}
        <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
            💡 创建提示
          </h4>
          <div className="text-sm text-blue-800">
            {currentStep === 1 && "选择与您品牌调性匹配的达人，关注其粉丝画像和历史表现数据"}
            {currentStep === 2 && "选择适合的产品，确保库存充足且符合达人特色和受众喜好"}
            {currentStep === 3 && "根据预算和目标选择合适的合作方案，不同方案的初始状态和流程会有所差异"}
          </div>
        </div>
      </div>
    </div>
  );
} 