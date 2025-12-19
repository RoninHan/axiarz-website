import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json(
        { error: '请提供令牌和新密码' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: '密码长度至少6位' },
        { status: 400 }
      )
    }

    // 对令牌进行哈希以匹配数据库中的值
    const resetTokenHash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex')

    // 查找具有有效令牌的用户
    const user = await prisma.user.findFirst({
      where: {
        resetToken: resetTokenHash,
        resetTokenExpiry: {
          gt: new Date(), // 令牌未过期
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: '无效或已过期的重置令牌' },
        { status: 400 }
      )
    }

    // 加密新密码
    const hashedPassword = await bcrypt.hash(password, 10)

    // 更新密码并清除重置令牌
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    })

    return NextResponse.json(
      { message: '密码重置成功，请使用新密码登录' },
      { status: 200 }
    )
  } catch (error) {
    console.error('重置密码错误:', error)
    return NextResponse.json(
      { error: '服务器错误，请稍后重试' },
      { status: 500 }
    )
  }
}
