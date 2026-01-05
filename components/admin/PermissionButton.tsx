'use client'

import { useEffect, useState } from 'react'

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

interface PermissionButtonProps {
  children: React.ReactNode
  resource?: string
  action?: string
  requireSuperAdmin?: boolean
  fallback?: React.ReactNode | null
}

/**
 * 权限按钮组件
 * 只有拥有指定权限的用户才能看到此按钮
 */
export default function PermissionButton({
  children,
  resource,
  action = 'read',
  requireSuperAdmin = false,
  fallback = null,
}: PermissionButtonProps) {
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
        setHasPermission(false)
        setLoading(false)
        return
      }

      const data = await res.json()
      if (!data.success) {
        setHasPermission(false)
        setLoading(false)
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
      setHasPermission(false)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return null
  }

  if (!hasPermission) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
