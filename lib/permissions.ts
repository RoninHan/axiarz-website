import { prisma } from '@/lib/prisma'

/**
 * 检查管理员是否有特定权限
 * @param adminId 管理员ID
 * @param resource 资源名称（如 'user', 'product', 'order'）
 * @param action 操作类型（如 'create', 'read', 'update', 'delete', 'manage'）
 * @returns 是否有权限
 */
export async function hasPermission(
  adminId: string,
  resource: string,
  action: string
): Promise<boolean> {
  try {
    // 获取管理员信息
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      }
    })

    if (!admin) {
      return false
    }

    // 超级管理员拥有所有权限
    if (admin.role === 'super_admin') {
      return true
    }

    // 检查是否有指定的权限
    const hasSpecificPermission = admin.permissions.some(
      ap => ap.permission.resource === resource && ap.permission.action === action
    )

    if (hasSpecificPermission) {
      return true
    }

    // 检查是否有该资源的 'manage' 权限（完全管理权限）
    const hasManagePermission = admin.permissions.some(
      ap => ap.permission.resource === resource && ap.permission.action === 'manage'
    )

    return hasManagePermission
  } catch (error) {
    console.error('Error checking permission:', error)
    return false
  }
}

/**
 * 检查管理员是否有任一权限
 * @param adminId 管理员ID
 * @param permissions 权限数组，格式为 [{resource: 'user', action: 'read'}]
 * @returns 是否有任一权限
 */
export async function hasAnyPermission(
  adminId: string,
  permissions: Array<{ resource: string; action: string }>
): Promise<boolean> {
  for (const perm of permissions) {
    if (await hasPermission(adminId, perm.resource, perm.action)) {
      return true
    }
  }
  return false
}

/**
 * 检查管理员是否有所有权限
 * @param adminId 管理员ID
 * @param permissions 权限数组
 * @returns 是否有所有权限
 */
export async function hasAllPermissions(
  adminId: string,
  permissions: Array<{ resource: string; action: string }>
): Promise<boolean> {
  for (const perm of permissions) {
    if (!(await hasPermission(adminId, perm.resource, perm.action))) {
      return false
    }
  }
  return true
}

/**
 * 获取管理员的所有权限（用于前端菜单控制）
 * @param adminId 管理员ID
 * @returns 权限列表
 */
export async function getAdminPermissions(adminId: string) {
  try {
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      }
    })

    if (!admin) {
      return []
    }

    // 超级管理员返回所有权限
    if (admin.role === 'super_admin') {
      return await prisma.permission.findMany()
    }

    return admin.permissions.map(ap => ap.permission)
  } catch (error) {
    console.error('Error getting admin permissions:', error)
    return []
  }
}

/**
 * 权限装饰器工厂 - 用于API路由
 */
export function requirePermission(resource: string, action: string) {
  return async (adminId: string): Promise<boolean> => {
    return await hasPermission(adminId, resource, action)
  }
}

/**
 * 资源和菜单的映射关系
 */
export const MENU_PERMISSIONS = {
  '/admin/users': { resource: 'user', action: 'read' },
  '/admin/admins': { resource: 'admin', action: 'manage' }, // 只有超级管理员
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
} as const

/**
 * 检查管理员是否可以访问某个菜单
 */
export async function canAccessMenu(adminId: string, menuPath: string): Promise<boolean> {
  const permission = MENU_PERMISSIONS[menuPath as keyof typeof MENU_PERMISSIONS]
  if (!permission) {
    return true // 没有定义权限要求的菜单，默认可访问
  }
  return await hasPermission(adminId, permission.resource, permission.action)
}
