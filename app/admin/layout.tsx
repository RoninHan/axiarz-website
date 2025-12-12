'use client'

import { usePathname } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isLoginPage = pathname === '/admin/login'

  // 登录页面不显示侧边栏和头部
  if (isLoginPage) {
    return <>{children}</>
  }

  // 其他管理页面显示完整布局
  return (
    <div className="min-h-screen bg-neutral-light">
      <AdminSidebar />
      <div className="ml-[220px] flex flex-col min-h-screen">
        <AdminHeader />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}

