import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthFromRequest, successResponse, errorResponse } from '@/lib/api-utils'

// 更新用户个人信息
export async function PUT(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request)
    if (!auth || auth.type !== 'user') {
      return errorResponse('未登录或无权限', 401)
    }

    const body = await request.json()
    const { name, phone, avatar } = body

    // 验证必填字段
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return errorResponse('姓名不能为空', 400)
    }

    if (name.length > 50) {
      return errorResponse('姓名不能超过50个字符', 400)
    }

    // 验证手机号格式（如果提供）
    if (phone && phone.trim().length > 0) {
      const phoneRegex = /^1[3-9]\d{9}$/
      if (!phoneRegex.test(phone)) {
        return errorResponse('手机号格式不正确', 400)
      }
    }

    // 更新用户信息
    const updatedUser = await prisma.user.update({
      where: { id: auth.id },
      data: {
        name: name.trim(),
        phone: phone && phone.trim().length > 0 ? phone.trim() : null,
        avatar: avatar && avatar.trim().length > 0 ? avatar.trim() : null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return successResponse(updatedUser)
  } catch (error) {
    console.error('更新用户信息失败:', error)
    return errorResponse('更新失败', 500)
  }
}
