import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { AuthProvider } from '@/contexts/auth-context';
import ClientLayout from './client-layout';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "达人打标管理系统 - Influencer Marking System",
  description: "智能管理 TikTok、抖音、快手、视频号等平台达人资源，提供精准标签匹配和合作流程跟踪",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <ClientLayout>
            <NuqsAdapter>
              {children}
            </NuqsAdapter>
          </ClientLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
