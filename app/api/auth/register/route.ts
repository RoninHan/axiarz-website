import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateToken } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api-utils'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password) {
      return errorResponse('邮箱和密码不能为空')
    }

    // 检查用户是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return errorResponse('该邮箱已被注册')
    }

    // 创建用户
    const hashedPassword = await hashPassword(password)
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
        status: 'active',
      },
    })

    // 生成 token
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
  } catch (error: any) {
    return errorResponse(error.message || '注册失败', 500)
  }
}

