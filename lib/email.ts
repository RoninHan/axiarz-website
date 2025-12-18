import prisma from '@/lib/prisma'
import nodemailer from 'nodemailer'
import crypto from 'crypto'

// 加密密钥（与 email-settings API 中的保持一致）
const ENCRYPTION_KEY = process.env.EMAIL_ENCRYPTION_KEY || 'axiarz-email-config-encryption-key-32'
const ALGORITHM = 'aes-256-cbc'

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
    return text
  }
}

interface EmailConfig {
  provider: string
  smtpHost?: string
  smtpPort?: number
  smtpUser?: string
  smtpPassword?: string
  smtpSecure?: boolean
  sendgridApiKey?: string
  awsSesRegion?: string
  awsSesAccessKeyId?: string
  awsSesSecretAccessKey?: string
  fromEmail: string
  fromName: string
  enabled: boolean
}

interface EmailOptions {
  to: string | string[]
  subject: string
  text?: string
  html?: string
}

interface EmailResult {
  success: boolean
  error?: string
}

// 获取邮件配置
async function getEmailConfig(): Promise<EmailConfig | null> {
  try {
    const setting = await prisma.setting.findFirst({
      where: { key: 'email_config' },
    })

    if (!setting || !setting.value) {
      return null
    }

    const config = JSON.parse(setting.value) as EmailConfig

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

    return config
  } catch (error) {
    console.error('获取邮件配置错误:', error)
    return null
  }
}

// 使用 SMTP 发送邮件
async function sendViaSMTP(
  config: EmailConfig,
  options: EmailOptions
): Promise<EmailResult> {
  try {
    const transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpSecure, // true for 465, false for 587
      auth: {
        user: config.smtpUser,
        pass: config.smtpPassword,
      },
    })

    await transporter.sendMail({
      from: `"${config.fromName}" <${config.fromEmail}>`,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    })

    return { success: true }
  } catch (error: any) {
    console.error('SMTP发送邮件错误:', error)
    return { success: false, error: error.message }
  }
}

// 使用 SendGrid 发送邮件
async function sendViaSendGrid(
  config: EmailConfig,
  options: EmailOptions
): Promise<EmailResult> {
  try {
    const sgMail = require('@sendgrid/mail')
    sgMail.setApiKey(config.sendgridApiKey)

    await sgMail.send({
      from: {
        email: config.fromEmail,
        name: config.fromName,
      },
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    })

    return { success: true }
  } catch (error: any) {
    console.error('SendGrid发送邮件错误:', error)
    return { success: false, error: error.message }
  }
}

// 使用 AWS SES 发送邮件
async function sendViaAWSSES(
  config: EmailConfig,
  options: EmailOptions
): Promise<EmailResult> {
  try {
    const AWS = require('aws-sdk')
    
    AWS.config.update({
      region: config.awsSesRegion,
      accessKeyId: config.awsSesAccessKeyId,
      secretAccessKey: config.awsSesSecretAccessKey,
    })

    const ses = new AWS.SES()
    
    await ses.sendEmail({
      Source: `"${config.fromName}" <${config.fromEmail}>`,
      Destination: {
        ToAddresses: Array.isArray(options.to) ? options.to : [options.to],
      },
      Message: {
        Subject: {
          Data: options.subject,
        },
        Body: {
          Html: {
            Data: options.html || '',
          },
          Text: {
            Data: options.text || '',
          },
        },
      },
    }).promise()

    return { success: true }
  } catch (error: any) {
    console.error('AWS SES发送邮件错误:', error)
    return { success: false, error: error.message }
  }
}

// 主发送函数
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  try {
    const config = await getEmailConfig()

    if (!config || !config.enabled) {
      console.log('邮件服务未配置或未启用')
      return { 
        success: false, 
        error: '邮件服务未配置或未启用' 
      }
    }

    // 根据配置的提供商发送邮件
    switch (config.provider) {
      case 'smtp':
        return await sendViaSMTP(config, options)
      
      case 'sendgrid':
        return await sendViaSendGrid(config, options)
      
      case 'aws-ses':
        return await sendViaAWSSES(config, options)
      
      default:
        return { 
          success: false, 
          error: '不支持的邮件服务提供商' 
        }
    }
  } catch (error: any) {
    console.error('发送邮件错误:', error)
    return { 
      success: false, 
      error: error.message || '发送邮件失败' 
    }
  }
}

// 发送重置密码邮件
export async function sendPasswordResetEmail(
  email: string,
  resetToken: string
): Promise<EmailResult> {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`

  return sendEmail({
    to: email,
    subject: '重置密码',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Axiarz</h1>
        </div>
        
        <div style="padding: 40px 30px; background: #f9f9f9;">
          <h2 style="color: #333; margin-top: 0;">重置密码</h2>
          
          <p style="color: #666; line-height: 1.6;">
            您好，
          </p>
          
          <p style="color: #666; line-height: 1.6;">
            我们收到了您的密码重置请求。请点击下面的按钮重置您的密码：
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
              重置密码
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6; font-size: 14px;">
            如果按钮无法点击，请复制以下链接到浏览器地址栏：<br>
            <a href="${resetUrl}" style="color: #FF6B35; word-break: break-all;">${resetUrl}</a>
          </p>
          
          <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
            <p style="color: #856404; margin: 0; font-size: 14px;">
              ⚠️ 此链接有效期为1小时。如果您没有请求重置密码，请忽略此邮件。
            </p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;" />
          
          <p style="color: #999; font-size: 12px; margin: 0;">
            如有疑问，请联系客服。
          </p>
        </div>
        
        <div style="background: #333; padding: 20px; text-align: center;">
          <p style="color: #999; margin: 0; font-size: 12px;">
            © ${new Date().getFullYear()} Axiarz. 保留所有权利。
          </p>
        </div>
      </div>
    `,
    text: `
      重置密码
      
      您好，
      
      我们收到了您的密码重置请求。请访问以下链接重置您的密码：
      
      ${resetUrl}
      
      此链接有效期为1小时。如果您没有请求重置密码，请忽略此邮件。
      
      © ${new Date().getFullYear()} Axiarz. 保留所有权利。
    `,
  })
}
