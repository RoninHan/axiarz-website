import { useEffect, useState } from 'react'

interface Permission {
  id: string
  name: string
  resource: string
  action: string
  description?: string
}

interface AdminUser {
  id: string
  email: string
  name: string
  role: string
  permissions?: Permission[]
}

export function usePermissions() {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUser()
  }, [])

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      if (data.success) {
        setUser(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch user:', error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * 检查是否有特定权限
   */
  const hasPermission = (resource: string, action: string): boolean => {
    if (!user) return false
    
    // 超级管理员拥有所有权限
    if (user.role === 'super_admin') return true
    
    // 检查是否有指定权限或manage权限
    return user.permissions?.some(
      p => p.resource === resource && (p.action === action || p.action === 'manage')
    ) || false
  }

  /**
   * 检查是否有任一权限
   */
  const hasAnyPermission = (permissions: Array<{ resource: string; action: string }>): boolean => {
    return permissions.some(p => hasPermission(p.resource, p.action))
  }

  /**
   * 检查是否有所有权限
   */
  const hasAllPermissions = (permissions: Array<{ resource: string; action: string }>): boolean => {
    return permissions.every(p => hasPermission(p.resource, p.action))
  }

  /**
   * 检查是否是超级管理员
   */
  const isSuperAdmin = (): boolean => {
    return user?.role === 'super_admin'
  }

  /**
   * 检查是否可以访问某个菜单
   */
  const canAccessMenu = (menuPath: string): boolean => {
    const menuPermissions: Record<string, { resource: string; action: string }> = {
      '/admin/users': { resource: 'user', action: 'read' },
      '/admin/admins': { resource: 'admin', action: 'manage' },
      '/admin/categories': { resource: 'category', action: 'read' },
      '/admin/products': { resource: 'product', action: 'read' },
      '/admin/orders': { resource: 'order', action: 'read' },
      '/admin/invoices': { resource: 'invoice', action: 'read' },
      '/admin/refund-requests': { resource: 'refund', action: 'read' },
      '/admin/repairs': { resource: 'repair', action: 'read' },
      '/admin/coupons': { resource: 'coupon', action: 'read' },
      '/admin/courier-companies': { resource: 'courier', action: 'read' },
      '/admin/files': { resource: 'file', action: 'read' },
      '/admin/payment-configs': { resource: 'payment', action: 'manage' },
      '/admin/settings': { resource: 'system', action: 'manage' },
    }

    const permission = menuPermissions[menuPath]
    if (!permission) return true // 没有定义权限要求的菜单，默认可访问
    
    return hasPermission(permission.resource, permission.action)
  }

  return {
    user,
    loading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isSuperAdmin,
    canAccessMenu,
  }
}
