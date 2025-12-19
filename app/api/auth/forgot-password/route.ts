import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { sendPasswordResetEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: '请提供邮箱地址' },
        { status: 400 }
      )
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email },
    })

    // 即使用户不存在也返回成功，防止邮箱枚举攻击
    if (!user) {
      return NextResponse.json(
        { message: '如果该邮箱存在，我们已发送重置密码链接' },
        { status: 200 }
      )
    }

    // 生成重置令牌
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenHash = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex')

    // 设置令牌过期时间（1小时）
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000)

    // 保存令牌到数据库
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: resetTokenHash,
        resetTokenExpiry,
      },
    })

    // 发送重置密码邮件
    const emailResult = await sendPasswordResetEmail(email, resetToken)
    
    if (!emailResult.success) {
      console.error('发送邮件失败:', emailResult.error)
      // 开发环境下显示令牌，生产环境下不显示具体错误
      if (process.env.NODE_ENV === 'development') {
        console.log('重置密码令牌:', resetToken)
        console.log('用户:', email)
      }
    }

    return NextResponse.json(
      { 
        message: '如果该邮箱存在，我们已发送重置密码链接',
        // 开发环境下返回令牌（生产环境应删除）
        ...(process.env.NODE_ENV === 'development' && { token: resetToken })
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('忘记密码错误:', error)
    return NextResponse.json(
      { error: '服务器错误，请稍后重试' },
      { status: 500 }
    )
  }
}
