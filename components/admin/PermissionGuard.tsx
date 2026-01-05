'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Spin, Result, Button } from 'antd'
import { LockOutlined } from '@ant-design/icons'

interface AdminUser {
  id: string
  email: string
  name: string
  role: string
  permissions?: Array<{
    id: string
    name: string
    resource: string
    action: string
  }>
}

interface PermissionGuardProps {
  children: React.ReactNode
  resource?: string
  action?: string
  requireSuperAdmin?: boolean
  fallback?: React.ReactNode
}

export default function PermissionGuard({
  children,
  resource,
  action = 'read',
  requireSuperAdmin = false,
  fallback,
}: PermissionGuardProps) {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasPermission, setHasPermission] = useState(false)

  useEffect(() => {
    checkPermission()
  }, [])

  const checkPermission = async () => {
    try {
      const res = await fetch('/api/auth/me', {
        credentials: 'include',
      })
      
      if (!res.ok) {
        router.push('/admin/login')
        return
      }

      const data = await res.json()
      if (!data.success) {
        router.push('/admin/login')
        return
      }

      const user = data.data
      setCurrentUser(user)

      // 检查权限
      let permitted = false

      // 超级管理员拥有所有权限
      if (user.role === 'super_admin') {
        permitted = true
      } 
      // 如果需要超级管理员权限
      else if (requireSuperAdmin) {
        permitted = false
      }
      // 如果没有指定资源要求，默认允许
      else if (!resource) {
        permitted = true
      }
      // 检查具体资源权限
      else {
        permitted = user.permissions?.some(
          (p: any) => p.resource === resource && (p.action === action || p.action === 'manage')
        ) || false
      }

      setHasPermission(permitted)
    } catch (error) {
      console.error('检查权限失败:', error)
      router.push('/admin/login')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px' 
      }}>
        <Spin size="large" tip="正在验证权限..." />
      </div>
    )
  }

  if (!hasPermission) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div style={{ padding: '40px' }}>
        <Result
          status="403"
          icon={<LockOutlined />}
          title="权限不足"
          subTitle={
            requireSuperAdmin
              ? "抱歉，此功能仅限超级管理员访问。"
              : resource
              ? `抱歉，您没有访问此功能的权限。需要的权限：${resource}.${action}`
              : "抱歉，您没有访问此页面的权限。"
          }
          extra={
            <Button type="primary" onClick={() => router.push('/admin')}>
              返回首页
            </Button>
          }
        />
      </div>
    )
  }

  return <>{children}</>
}
