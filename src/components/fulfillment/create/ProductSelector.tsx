'use client';

import React, { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon,
  CheckIcon,
  TagIcon,
  CubeIcon
} from '@heroicons/react/24/outline';

interface Product {
  id: string;
  name: string;
  description: string;
  brand: string;
  category: string;
  price: number;
  currency: string;
  targetAudience?: string;
  contentRequirements?: string;
  priority: string;
  country: string;
  skuSeries: string;
  status: number;
  createdAt?: number;
}

interface ProductSelectorProps {
  selectedProduct: Product | null;
  onSelect: (product: Product) => void;
  className?: string;
}

export default function ProductSelector({ 
  selectedProduct, 
  onSelect, 
  className = "" 
}: ProductSelectorProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { value: 'all', label: '全部类别' },
    { value: 'beauty', label: '美妆护肤' },
    { value: 'electronics', label: '数码电子' },
    { value: 'fashion', label: '服装配饰' },
    { value: 'fitness', label: '健身器材' },
    { value: 'food', label: '食品饮料' },
    { value: 'home', label: '家居用品' },
    { value: 'travel', label: '旅行用品' }
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [products, searchTerm, selectedCategory]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 从实际API获取产品数据
      const response = await fetch('/api/products');
      const result = await response.json();
      
      if (result.success && result.data) {
        setProducts(result.data);
      } else {
        setError(result.error || '获取产品数据失败');
      }
    } catch (error) {
      console.error('获取产品列表失败:', error);
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };



  const applyFilters = () => {
    let filtered = products;

    // 搜索过滤
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // 类别过滤
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    setFilteredProducts(filtered);
  };

  const formatPrice = (price: number, currency: string = 'CNY') => {
    if (currency === 'CNY') {
      return `¥${price.toLocaleString()}`;
    }
    return `${price.toLocaleString()} ${currency}`;
  };

  const getCategoryLabel = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      beauty: '美妆',
      electronics: '数码',
      fashion: '时尚',
      fitness: '健身',
      food: '食品',
      home: '家居',
      travel: '旅行'
    };
    return categoryMap[category] || category;
  };

  const getCategoryColor = (category: string) => {
    const colorMap: { [key: string]: string } = {
      beauty: 'bg-pink-100 text-pink-800 border-pink-200',
      electronics: 'bg-blue-100 text-blue-800 border-blue-200',
      fashion: 'bg-purple-100 text-purple-800 border-purple-200',
      fitness: 'bg-green-100 text-green-800 border-green-200',
      food: 'bg-orange-100 text-orange-800 border-orange-200',
      home: 'bg-gray-100 text-gray-800 border-gray-200',
      travel: 'bg-indigo-100 text-indigo-800 border-indigo-200'
    };
    return colorMap[category] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig: { [key: string]: { color: string; label: string } } = {
      high: { color: 'bg-red-100 text-red-800 border-red-200', label: '高优先级' },
      medium: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: '中优先级' },
      low: { color: 'bg-gray-100 text-gray-800 border-gray-200', label: '普通优先级' }
    };
    
    const config = priorityConfig[priority] || priorityConfig.medium;
    
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">选择产品</h3>
          <p className="mt-1 text-sm text-gray-500">
            选择适合的推广产品
          </p>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">加载产品数据中...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-red-200 ${className}`}>
        <div className="px-6 py-4 border-b border-red-200">
          <h3 className="text-lg font-semibold text-red-900">加载失败</h3>
        </div>
        <div className="p-6">
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchProducts}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              重新加载
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">选择产品</h3>
        <p className="mt-1 text-sm text-gray-500">
          选择适合的推广产品，确保库存充足且符合达人特色
        </p>
      </div>

      <div className="p-6">
        {selectedProduct && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center text-white font-bold">
                  {selectedProduct.name.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    已选择: {selectedProduct.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {selectedProduct.brand} • {formatPrice(selectedProduct.price, selectedProduct.currency)}
                  </div>
                </div>
              </div>
              <CheckIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        )}

        {/* 搜索和筛选 */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索产品名称、品牌或类别..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex items-center space-x-2 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category.value
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* 产品列表 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => onSelect(product)}
              className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 hover:shadow-lg group ${
                selectedProduct?.id === product.id
                  ? 'border-blue-500 bg-blue-50 shadow-lg'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              {selectedProduct?.id === product.id && (
                <div className="absolute top-3 right-3">
                  <div className="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center">
                    <CheckIcon className="h-4 w-4 text-white" />
                  </div>
                </div>
              )}

              <div className="mb-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-white font-bold ${
                      selectedProduct?.id === product.id 
                        ? 'bg-blue-600' 
                        : 'bg-gradient-to-r from-indigo-500 to-purple-500 group-hover:from-blue-500 group-hover:to-purple-600'
                    }`}>
                      {product.name.charAt(0)}
                    </div>
                    <h4 className="font-semibold text-gray-900 text-sm leading-tight">{product.name}</h4>
                  </div>
                </div>

                <div className="flex items-center space-x-2 mb-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getCategoryColor(product.category)}`}>
                    {getCategoryLabel(product.category)}
                  </span>
                  {getPriorityBadge(product.priority)}
                </div>

                <p className="text-sm text-gray-600 mb-3 leading-relaxed line-clamp-2">
                  {product.description}
                </p>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">品牌:</span>
                    <span className="font-semibold text-gray-900">{product.brand}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">价格:</span>
                    <span className="font-semibold text-blue-600 text-lg">
                      {formatPrice(product.price, product.currency)}
                    </span>
                  </div>
                  
                  {product.targetAudience && (
                    <div className="text-xs text-gray-500 mt-2">
                      目标用户: {product.targetAudience}
                    </div>
                  )}
                </div>
              </div>

              <div className={`mt-3 pt-3 border-t transition-colors duration-200 ${
                selectedProduct?.id === product.id ? 'border-blue-200' : 'border-gray-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    SKU: {product.skuSeries}
                  </div>
                  <div className={`text-xs font-medium ${
                    selectedProduct?.id === product.id ? 'text-blue-600' : 'text-gray-500 group-hover:text-blue-600'
                  }`}>
                    点击选择
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && !loading && (
          <div className="text-center py-12">
            <CubeIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">暂无匹配的产品</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? '请尝试其他搜索关键词' : '暂无可用产品数据'}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-3 text-sm text-blue-600 hover:text-blue-800"
              >
                清除搜索条件
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 