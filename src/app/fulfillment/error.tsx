'use client';

import { useEffect } from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function FulfillmentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 记录错误到监控系统
    console.error('履约管理模块错误:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
          <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
        </div>
        
        <h2 className="text-lg font-medium text-gray-900 mb-2">
          履约管理系统出错
        </h2>
        
        <p className="text-sm text-gray-500 mb-4">
          抱歉，履约管理系统遇到了一个错误。请刷新页面重试。
        </p>
        
        {error.digest && (
          <p className="text-xs text-gray-400 mb-4">
            错误ID: {error.digest}
          </p>
        )}
        
        <div className="space-y-2">
          <button
            onClick={reset}
            className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            重试
          </button>
          
          <a
            href="/fulfillment"
            className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            返回履约管理首页
          </a>
        </div>
      </div>
    </div>
  );
} 