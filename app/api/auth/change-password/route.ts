import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { compare, hash } from 'bcryptjs'
import { verify } from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function POST(request: NextRequest) {
  try {
    // 获取 token
    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json(
        { success: false, error: '未登录' },
        { status: 401 }
      )
    }

    // 验证 token
    let userId: string
    try {
      const decoded = verify(token, JWT_SECRET) as { id: string }
      userId = decoded.id
    } catch (error) {
      return NextResponse.json(
        { success: false, error: '登录已过期' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { oldPassword, newPassword } = body

    if (!oldPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: '请提供当前密码和新密码' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: '新密码至少6个字符' },
        { status: 400 }
      )
    }

    // 获取用户
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      )
    }

    // 验证当前密码
    const isPasswordValid = await compare(oldPassword, user.password)
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: '当前密码不正确' },
        { status: 400 }
      )
    }

    // 加密新密码
    const hashedPassword = await hash(newPassword, 10)

    // 更新密码
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    })

    return NextResponse.json({
      success: true,
      message: '密码修改成功',
    })
  } catch (error) {
    console.error('修改密码错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
