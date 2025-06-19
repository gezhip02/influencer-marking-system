'use client';

import { useAuth } from '@/contexts/auth-context';
import Navigation from '@/components/navigation';
import { usePathname } from 'next/navigation';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();

  // 不需要导航的页面
  const noNavPages = ['/login'];
  const showNavigation = !noNavPages.includes(pathname);

  // 需要认证的页面
  const protectedPages = ['/', '/influencers', '/tags'];
  const isProtectedPage = protectedPages.some(page => 
    pathname === page || pathname.startsWith(`${page}/`)
  );

  // 如果正在加载，显示加载状态
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">正在加载...</p>
        </div>
      </div>
    );
  }

  // 如果是受保护的页面但用户未登录，重定向到登录页
  if (isProtectedPage && !isAuthenticated) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return null;
  }

  return (
    <>
      {showNavigation && isAuthenticated && <Navigation />}
      {children}
    </>
  );
} 