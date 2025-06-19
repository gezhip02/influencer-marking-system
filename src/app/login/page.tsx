'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, User, Lock, Mail, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface LoginResponse {
  success: boolean;
  data?: {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      department?: string;
    };
    token: string;
  };
  error?: string;
}

// Mock用户数据
const mockUsers = [
  {
    id: '1',
    email: 'admin@example.com',
    password: 'admin123',
    name: '系统管理员',
    role: 'ADMIN',
    department: '技术部'
  },
  {
    id: '2', 
    email: 'manager@example.com',
    password: 'manager123',
    name: '运营经理',
    role: 'MANAGER',
    department: '运营部'
  },
  {
    id: '3',
    email: 'user@example.com', 
    password: 'user123',
    name: '普通用户',
    role: 'USER',
    department: '市场部'
  }
];

// 真实登录接口
async function apiLogin(email: string, password: string, rememberMe: boolean = false): Promise<LoginResponse> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password, rememberMe })
  });

  const data = await response.json();
  
  if (!response.ok) {
    return {
      success: false,
      error: data.error || '登录失败，请稍后重试'
    };
  }

  return {
    success: data.success,
    data: data.data
  };
}

// Mock登录接口（保留作为备用）
async function mockLogin(email: string, password: string): Promise<LoginResponse> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const user = mockUsers.find(u => u.email === email && u.password === password);
  
  if (!user) {
    return {
      success: false,
      error: '邮箱或密码错误'
    };
  }
  
  return {
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department
      },
      token: `mock_token_${user.id}_${Date.now()}`
    }
  };
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({});
  const [loginError, setLoginError] = useState<string>('');

  const handleFieldChange = (field: keyof LoginFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 清除该字段的错误
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    // 清除登录错误
    if (loginError) {
      setLoginError('');
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof LoginFormData, string>> = {};

    if (!formData.email) {
      newErrors.email = '请输入邮箱地址';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '请输入有效的邮箱地址';
    }

    if (!formData.password) {
      newErrors.password = '请输入密码';
    } else if (formData.password.length < 6) {
      newErrors.password = '密码至少需要6个字符';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('表单提交，数据:', formData);
    
    if (!validateForm()) {
      console.log('表单验证失败');
      return;
    }

    setIsLoading(true);
    setLoginError('');

    try {
      console.log('开始API登录...');
      const response = await apiLogin(formData.email, formData.password, formData.rememberMe);
      console.log('API登录响应:', response);
      
      if (response.success && response.data) {
        console.log('登录成功，用户数据:', response.data.user);
        
        // 使用AuthContext的login方法
        login(response.data.user as any, response.data.token);
        
        // 保存记住邮箱的选项
        if (typeof window !== 'undefined') {
          if (formData.rememberMe) {
            localStorage.setItem('rememberedEmail', formData.email);
          } else {
            localStorage.removeItem('rememberedEmail');
          }
        }
        
        console.log('正在跳转到主页...');
        // 跳转到主页
        router.push('/');
        router.refresh();
      } else {
        console.log('登录失败:', response.error);
        setLoginError(response.error || '登录失败，请重试');
      }
    } catch (error) {
      console.error('登录异常:', error);
      setLoginError('网络错误，请检查连接后重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 页面加载时检查是否有记住的邮箱
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const rememberedEmail = localStorage.getItem('rememberedEmail');
      if (rememberedEmail) {
        setFormData(prev => ({
          ...prev,
          email: rememberedEmail,
          rememberMe: true
        }));
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* 头部 */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <User className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            欢迎回来
          </h1>
          <p className="text-sm text-gray-600">
            请登录您的账户以继续使用达人标记系统
          </p>
        </div>

        {/* 测试账户提示 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">测试账户</h3>
          <div className="space-y-1 text-xs text-blue-700">
            <div>管理员: admin@example.com / admin123</div>
            <div>经理: manager@example.com / manager123</div>
            <div>用户: user@example.com / user123</div>
          </div>
          
          {/* 快速登录按钮 */}
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => {
                setFormData({
                  email: 'admin@example.com',
                  password: 'admin123',
                  rememberMe: false
                });
              }}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              填入管理员
            </button>
            <button
              type="button"
              onClick={async () => {
                setIsLoading(true);
                try {
                  const response = await mockLogin('admin@example.com', 'admin123');
                  console.log('Direct login response:', response);
                  if (response.success && response.data) {
                    login(response.data.user as any, response.data.token);
                    router.push('/');
                  }
                } catch (error) {
                  console.error('Direct login error:', error);
                } finally {
                  setIsLoading(false);
                }
              }}
              className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
            >
              直接登录
            </button>
          </div>
        </div>

        {/* 登录表单 */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* 全局错误提示 */}
          {loginError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                <span className="text-sm text-red-800">{loginError}</span>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {/* 邮箱输入 */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                邮箱地址
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                  className={`appearance-none relative block w-full pl-10 pr-3 py-3 border rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm ${
                    errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="请输入您的邮箱地址"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* 密码输入 */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                密码
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={(e) => handleFieldChange('password', e.target.value)}
                  className={`appearance-none relative block w-full pl-10 pr-10 py-3 border rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm ${
                    errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="请输入您的密码"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>
          </div>

          {/* 记住我 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={formData.rememberMe}
                onChange={(e) => handleFieldChange('rememberMe', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                记住我
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                忘记密码？
              </a>
            </div>
          </div>

          {/* 登录按钮 */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  登录中...
                </div>
              ) : (
                '登录'
              )}
            </button>
          </div>

          {/* 底部链接 */}
          <div className="text-center text-sm text-gray-600">
            还没有账户？
            <a href="/register" className="font-medium text-blue-600 hover:text-blue-500 ml-1">
              立即注册
            </a>
          </div>
        </form>
      </div>
    </div>
  );
} 