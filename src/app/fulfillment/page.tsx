import React from 'react';
import Link from 'next/link';
import { PlusIcon } from '@heroicons/react/24/outline';
import FulfillmentList from '@/components/fulfillment/FulfillmentList';

export default function FulfillmentPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">履约管理</h1>
              <p className="mt-2 text-gray-600">
                管理和跟踪所有达人合作履约单
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Link
                href="/fulfillment/create"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                创建履约单
              </Link>
            </div>
          </div>
        </div>
        
        <FulfillmentList />
      </div>
    </div>
  );
} 