'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Layout, Spin } from 'antd'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'

const { Content } = Layout

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
        console.log('检查管理员认证状态...')
        const res = await fetch('/api/auth/me', {
          credentials: 'include', // 确保发送 cookie
        })
        const data = await res.json()
        console.log('认证检查结果:', data)
        
        if (data.success && data.data.type === 'admin') {
          console.log('管理员认证成功')
          setIsAuthenticated(true)
        } else {
          // 未登录或不是管理员，跳转到登录页
          console.log('管理员认证失败，跳转到登录页')
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
      <div 
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        }}
      >
        <Spin size="large" tip="加载中..." />
      </div>
    )
  }

  // 未登录不显示内容（会自动跳转）
  if (!isAuthenticated) {
    return (
      <div 
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        }}
      >
        <Spin size="large" tip="正在跳转..." />
      </div>
    )
  }

  // 其他管理页面显示完整布局
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AdminSidebar />
      <Layout style={{ marginLeft: 240 }}>
        <AdminHeader />
        <Content
          style={{
            margin: '24px',
            padding: '24px',
            background: '#fff',
            borderRadius: '12px',
            minHeight: 'calc(100vh - 88px)',
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  )
}

