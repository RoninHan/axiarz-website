import { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { ApiResponse, JWTPayload } from '@/types'

export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  
  // 检查请求头中的认证类型标识
  const authType = request.headers.get('X-Auth-Type')
  
  // 根据认证类型选择对应的 token（优先使用请求头标识）
  if (authType === 'admin') {
    return request.cookies.get('admin_token')?.value || null
  } else if (authType === 'client' || authType === 'user') {
    return request.cookies.get('client_token')?.value || null
  }
  
  // 根据路径选择对应的 token
  if (request.nextUrl.pathname.startsWith('/api/admin')) {
    return request.cookies.get('admin_token')?.value || null
  } else if (request.nextUrl.pathname.startsWith('/api/client')) {
    return request.cookies.get('client_token')?.value || null
  }
  
  // 对于其他公共接口（如 /api/auth/*），不应该自动选择
  // 如果前端没有明确指定 X-Auth-Type，返回 null
  return null
}

export function getAuthFromRequest(request: NextRequest): JWTPayload | null {
  const token = getTokenFromRequest(request)
  if (!token) return null
  return verifyToken(token)
}

export function successResponse<T>(data: T, message?: string): Response {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
  }
  return Response.json(response)
}

export function errorResponse(message: string, status: number = 400): Response {
  const response: ApiResponse = {
    success: false,
    error: message,
  }
  return Response.json(response, { status })
}

