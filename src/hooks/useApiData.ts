import { useState, useEffect, useCallback } from 'react';
import { ensurePaginatedResponse, handleApiError, safeFetch } from '@/lib/api-utils';

export interface UseApiDataOptions<T> {
  defaultItems?: T[];
  defaultStats?: Record<string, any>;
  dependencies?: any[];
  autoFetch?: boolean;
}

export interface UseApiDataResult<T> {
  data: T[];
  stats: Record<string, any>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  setData: (data: T[]) => void;
  setStats: (stats: Record<string, any>) => void;
}

/**
 * 通用的分页数据获取hook
 */
export function usePaginatedData<T>(
  endpoint: string,
  options: UseApiDataOptions<T> = {}
): UseApiDataResult<T> {
  const {
    defaultItems = [],
    defaultStats = {},
    dependencies = [],
    autoFetch = true
  } = options;

  const [data, setData] = useState<T[]>(defaultItems);
  const [stats, setStats] = useState<Record<string, any>>(defaultStats);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await safeFetch(endpoint);
      const safeResponse = ensurePaginatedResponse(response, defaultItems);

      setData(safeResponse.items);
      setStats({ ...defaultStats, ...safeResponse.stats });
      setPagination(safeResponse.pagination);
    } catch (err) {
      const errorMessage = handleApiError(err, '数据获取');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [endpoint, defaultItems, defaultStats]);

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [fetchData, autoFetch, ...dependencies]);

  return {
    data,
    stats,
    pagination,
    loading,
    error,
    refresh: fetchData,
    setData,
    setStats
  };
}

/**
 * 专用于标签数据的hook
 */
export function useTagsData(params: URLSearchParams) {
  const endpoint = `/api/tags?${params.toString()}`;
  
  return usePaginatedData(endpoint, {
    defaultStats: {
      total: 0,
      totalInfluencers: 0,
      categories: []
    },
    dependencies: [params.toString()]
  });
}

/**
 * 专用于达人数据的hook
 */
export function useInfluencersData(params: URLSearchParams) {
  const endpoint = `/api/influencers?${params.toString()}`;
  
  return usePaginatedData(endpoint, {
    defaultStats: {
      total: 0,
      active: 0,
      contacted: 0,
      totalTags: 0
    },
    dependencies: [params.toString()]
  });
} 