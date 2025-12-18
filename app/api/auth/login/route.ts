import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { comparePassword, generateToken } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api-utils'

export async function POST(request: NextRequest) {
  try {
    const { email, password, type = 'user' } = await request.json()

    if (!email || !password) {
      return errorResponse('邮箱和密码不能为空')
    }

    if (type === 'admin') {
      // 管理员登录
      const admin = await prisma.admin.findUnique({
        where: { email },
      })

      if (!admin || admin.status !== 'active') {
        return errorResponse('账号不存在或已被禁用')
      }

      const isValid = await comparePassword(password, admin.password)
      if (!isValid) {
        return errorResponse('密码错误')
      }

      const token = generateToken({
        id: admin.id,
        email: admin.email,
        role: admin.role,
        type: 'admin',
      })

      const response = successResponse({ admin, token })
      // 设置 HttpOnly cookie
      response.headers.set(
        'Set-Cookie',
        `token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`
      )
      return response
    } else {
      // 用户登录
      const user = await prisma.user.findUnique({
        where: { email },
      })

      if (!user || user.status !== 'active') {
        return errorResponse('账号不存在或已被禁用')
      }

      const isValid = await comparePassword(password, user.password)
      if (!isValid) {
        return errorResponse('密码错误')
      }

      const token = generateToken({
        id: user.id,
        email: user.email,
        role: 'user',
        type: 'user',
      })

      const response = successResponse({ user, token })
      // 设置 cookie
      response.headers.set(
        'Set-Cookie',
        `token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`
      )
      return response
    }
  } catch (error: any) {
    return errorResponse(error.message || '登录失败', 500)
  }
}

