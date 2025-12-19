import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminAuth } from '@/lib/auth'
import { sendEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const adminUser = await verifyAdminAuth(request)
    if (!adminUser) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: '请提供测试邮箱地址' },
        { status: 400 }
      )
    }

    // 发送测试邮件
    const result = await sendEmail({
      to: email,
      subject: '邮件服务测试',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">Axiarz</h1>
          </div>
          
          <div style="padding: 40px 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-top: 0;">邮件服务测试</h2>
            
            <p style="color: #666; line-height: 1.6;">
              这是一封测试邮件，用于验证您的邮件服务配置是否正确。
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #666; margin: 0;">
                <strong>✅ 邮件服务配置成功！</strong>
              </p>
            </div>
            
            <p style="color: #666; line-height: 1.6;">
              如果您收到这封邮件，说明邮件服务已经正确配置并可以正常发送。
            </p>
            
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;" />
            
            <p style="color: #999; font-size: 12px; margin: 0;">
              测试时间: ${new Date().toLocaleString('zh-CN')}
            </p>
          </div>
          
          <div style="background: #333; padding: 20px; text-align: center;">
            <p style="color: #999; margin: 0; font-size: 12px;">
              © ${new Date().getFullYear()} Axiarz. 保留所有权利。
            </p>
          </div>
        </div>
      `,
    })

    if (result.success) {
      return NextResponse.json({ message: '测试邮件已发送' })
    } else {
      return NextResponse.json(
        { error: result.error || '发送失败' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('发送测试邮件错误:', error)
    return NextResponse.json(
      { error: '发送失败，请检查配置' },
      { status: 500 }
    )
  }
}
