import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminAuth } from '@/lib/auth'
import crypto from 'crypto'

// 加密密钥（实际项目中应该从环境变量读取）
const ENCRYPTION_KEY = process.env.EMAIL_ENCRYPTION_KEY || 'axiarz-email-config-encryption-key-32'
const ALGORITHM = 'aes-256-cbc'

// 加密函数
function encrypt(text: string): string {
  const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').substring(0, 32))
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return iv.toString('hex') + ':' + encrypted
}

// 解密函数
function decrypt(text: string): string {
  try {
    const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').substring(0, 32))
    const parts = text.split(':')
    const iv = Buffer.from(parts[0], 'hex')
    const encrypted = parts[1]
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
  } catch (error) {
    return text // 如果解密失败，返回原文
  }
}

export async function GET(request: NextRequest) {
  try {
    const adminUser = await verifyAdminAuth(request)
    if (!adminUser) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const setting = await prisma.setting.findFirst({
      where: { key: 'email_config' },
    })

    if (!setting || !setting.value) {
      return NextResponse.json(null)
    }

    if (typeof setting.value !== 'string') {
      return NextResponse.json(null)
    }

    const config = JSON.parse(setting.value)

    // 解密敏感信息
    if (config.smtpPassword) {
      config.smtpPassword = decrypt(config.smtpPassword)
    }
    if (config.sendgridApiKey) {
      config.sendgridApiKey = decrypt(config.sendgridApiKey)
    }
    if (config.awsSesAccessKeyId) {
      config.awsSesAccessKeyId = decrypt(config.awsSesAccessKeyId)
    }
    if (config.awsSesSecretAccessKey) {
      config.awsSesSecretAccessKey = decrypt(config.awsSesSecretAccessKey)
    }

    return NextResponse.json(config)
  } catch (error) {
    console.error('获取邮件配置错误:', error)
    return NextResponse.json(
      { error: '获取配置失败' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminUser = await verifyAdminAuth(request)
    if (!adminUser) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const body = await request.json()

    // 加密敏感信息
    const config = { ...body }
    if (config.smtpPassword) {
      config.smtpPassword = encrypt(config.smtpPassword)
    }
    if (config.sendgridApiKey) {
      config.sendgridApiKey = encrypt(config.sendgridApiKey)
    }
    if (config.awsSesAccessKeyId) {
      config.awsSesAccessKeyId = encrypt(config.awsSesAccessKeyId)
    }
    if (config.awsSesSecretAccessKey) {
      config.awsSesSecretAccessKey = encrypt(config.awsSesSecretAccessKey)
    }

    // 删除测试邮箱字段
    delete config.testEmail

    await prisma.setting.upsert({
      where: { key: 'email_config' },
      create: {
        key: 'email_config',
        value: JSON.stringify(config),
      },
      update: {
        value: JSON.stringify(config),
      },
    })

    return NextResponse.json({ message: '配置已保存' })
  } catch (error) {
    console.error('保存邮件配置错误:', error)
    return NextResponse.json(
      { error: '保存配置失败' },
      { status: 500 }
    )
  }
}
