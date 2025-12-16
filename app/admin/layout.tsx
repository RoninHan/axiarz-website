'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const isLoginPage = pathname === '/admin/login'

  useEffect(() => {
    // 登录页面不需要验证
    if (isLoginPage) {
      setLoading(false)
      return
    }

    // 验证管理员登录状态
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me')
        const data = await res.json()
        
        if (data.success && data.data.type === 'admin') {
          setIsAuthenticated(true)
        } else {
          // 未登录或不是管理员，跳转到登录页
          router.push('/admin/login')
        }
      } catch (error) {
        console.error('验证失败:', error)
        router.push('/admin/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [pathname, router, isLoginPage])

  // 登录页面不显示侧边栏和头部
  if (isLoginPage) {
    return <>{children}</>
  }

  // 加载中显示
  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-light flex items-center justify-center">
        <p className="text-body text-neutral-medium">加载中...</p>
      </div>
    )
  }

  // 未登录不显示内容（会自动跳转）
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-light flex items-center justify-center">
        <p className="text-body text-neutral-medium">正在跳转...</p>
      </div>
    )
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

