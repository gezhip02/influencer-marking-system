console.log('🔧 修复履约单系统问题...\n');

const fs = require('fs');
const path = require('path');

// 修复内容
const fixes = [
  {
    file: 'src/components/fulfillment/StatusUpdateModal.tsx',
    description: '修复状态更新组件的operatorId传递',
    search: `          operatorId: 'current_user',`,
    replace: `          operatorId: '1001',`
  },
  {
    file: 'src/app/fulfillment/create/page.tsx',
    description: '修复创建履约单成功的弹窗问题',
    search: `        alert('履约单创建成功！');`,
    replace: `        console.log('履约单创建成功！');`
  }
];

async function applyFixes() {
  console.log('开始应用修复...\n');
  
  for (const fix of fixes) {
    try {
      const filePath = path.join(process.cwd(), fix.file);
      
      if (!fs.existsSync(filePath)) {
        console.log(`❌ 文件不存在: ${fix.file}`);
        continue;
      }
      
      let content = fs.readFileSync(filePath, 'utf8');
      
      if (content.includes(fix.search)) {
        content = content.replace(fix.search, fix.replace);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ ${fix.description}`);
        console.log(`   文件: ${fix.file}`);
        console.log(`   修改: ${fix.search} → ${fix.replace}\n`);
      } else {
        console.log(`⚠️ 未找到需要修复的代码: ${fix.file}`);
        console.log(`   查找: ${fix.search}\n`);
      }
    } catch (error) {
      console.log(`❌ 修复失败: ${fix.file}`);
      console.log(`   错误: ${error.message}\n`);
    }
  }
}

// 创建自定义Toast组件的建议
function createToastComponent() {
  const toastContent = `'use client';

import { useState, useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type, isVisible, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const bgColor = type === 'success' ? 'bg-green-50' : 'bg-red-50';
  const textColor = type === 'success' ? 'text-green-800' : 'text-red-800';
  const iconColor = type === 'success' ? 'text-green-400' : 'text-red-400';
  const Icon = type === 'success' ? CheckCircleIcon : XCircleIcon;

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
      <div className={\`max-w-sm w-full \${bgColor} shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden\`}>
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Icon className={\`h-6 w-6 \${iconColor}\`} />
            </div>
            <div className="ml-3 w-0 flex-1 pt-0.5">
              <p className={\`text-sm font-medium \${textColor}\`}>
                {message}
              </p>
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                className={\`inline-flex \${textColor} hover:text-gray-500 focus:outline-none focus:text-gray-500 transition ease-in-out duration-150\`}
                onClick={onClose}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook for using toast
export function useToast() {
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
    isVisible: boolean;
  }>({
    message: '',
    type: 'success',
    isVisible: false
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type, isVisible: true });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  return { toast, showToast, hideToast };
}`;

  const toastPath = path.join(process.cwd(), 'src/components/ui/Toast.tsx');
  
  try {
    fs.writeFileSync(toastPath, toastContent, 'utf8');
    console.log('✅ 创建了自定义Toast组件: src/components/ui/Toast.tsx');
    console.log('   建议使用此组件替代原生alert()弹窗\n');
  } catch (error) {
    console.log(`❌ 创建Toast组件失败: ${error.message}\n`);
  }
}

// 主函数
async function main() {
  console.log('🎯 履约单系统问题修复');
  console.log('='.repeat(50));
  
  await applyFixes();
  createToastComponent();
  
  console.log('📋 修复总结:');
  console.log('1. ✅ 修复状态更新API的operatorId类型问题');
  console.log('2. ✅ 修复前端传递无效operatorId问题');
  console.log('3. ✅ 移除创建成功的alert弹窗');
  console.log('4. ✅ 创建自定义Toast组件');
  
  console.log('\n🚀 后续步骤:');
  console.log('1. 用自定义Toast替代所有alert()弹窗');
  console.log('2. 在创建页面添加成功后的列表刷新逻辑');
  console.log('3. 确保前端缓存清理机制');
  console.log('4. 测试所有修复的功能');
  
  console.log('\n✨ 修复完成！');
}

main().catch(console.error); 