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
  
  // 根据路径或认证类型选择对应的 token
  if (authType === 'admin' || request.nextUrl.pathname.startsWith('/api/admin')) {
    return request.cookies.get('admin_token')?.value || null
  } else {
    return request.cookies.get('client_token')?.value || null
  }
  
  // 兼容旧版本的通用 token
  // return request.cookies.get('token')?.value || null
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

