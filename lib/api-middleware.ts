import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from './auth'
import { hasPermission } from './permissions'

/**
 * API 权限中间件
 * 用法：在 API 路由中调用此函数检查权限
 */
export async function checkApiPermission(
  req: NextRequest,
  resource: string,
  action: string
): Promise<{ authorized: boolean; admin?: any; response?: NextResponse }> {
  // 验证管理员身份
  const admin = await verifyAdmin(req)
  
  if (!admin) {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: '未登录或登录已过期' },
        { status: 401 }
      )
    }
  }

  if (admin.status !== 'active') {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: '账户已被禁用' },
        { status: 403 }
      )
    }
  }

  // 检查权限
  const hasAccess = await hasPermission(admin.id, resource, action)
  
  if (!hasAccess) {
    return {
      authorized: false,
      admin,
      response: NextResponse.json(
        { success: false, error: '无权限执行此操作' },
        { status: 403 }
      )
    }
  }

  return { authorized: true, admin }
}

/**
 * 仅验证登录，不检查具体权限（用于超级管理员专属功能）
 */
export async function checkAdminAuth(
  req: NextRequest,
  requiredRole?: string
): Promise<{ authorized: boolean; admin?: any; response?: NextResponse }> {
  const admin = await verifyAdmin(req)
  
  if (!admin) {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: '未登录或登录已过期' },
        { status: 401 }
      )
    }
  }

  if (admin.status !== 'active') {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: '账户已被禁用' },
        { status: 403 }
      )
    }
  }

  if (requiredRole && admin.role !== requiredRole) {
    return {
      authorized: false,
      admin,
      response: NextResponse.json(
        { success: false, error: '权限不足' },
        { status: 403 }
      )
    }
  }

  return { authorized: true, admin }
}
