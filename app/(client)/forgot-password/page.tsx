'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  Typography, 
  message,
  Result
} from 'antd'
import { 
  MailOutlined,
  ArrowLeftOutlined,
  SafetyOutlined
} from '@ant-design/icons'

const { Title, Text } = Typography

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [messageApi, contextHolder] = message.useMessage()
  const [form] = Form.useForm()

  async function handleSubmit(values: { email: string }) {
    setLoading(true)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (response.ok) {
        setSubmitted(true)
        messageApi.success('重置链接已发送')
        
        // 开发环境下显示令牌
        if (process.env.NODE_ENV === 'development' && data.token) {
          console.log('重置令牌:', data.token)
          messageApi.info(`开发环境令牌: ${data.token}`, 10)
        }
      } else {
        messageApi.error(data.error || '发送失败，请稍后重试')
      }
    } catch (error) {
      messageApi.error('发送失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div 
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 16px',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* 装饰性背景元素 */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          right: '-5%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,107,53,0.1) 0%, rgba(255,107,53,0) 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }} />
        
        {contextHolder}
        <div className="max-w-md w-full" style={{ position: 'relative', zIndex: 1 }}>
          <Card
            style={{
              borderRadius: '24px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
              border: '1px solid rgba(255,255,255,0.8)',
              backdropFilter: 'blur(10px)',
              backgroundColor: 'rgba(255,255,255,0.95)',
            }}
            bodyStyle={{ padding: '48px' }}
          >
            <Result
              status="success"
              title="邮件已发送"
              subTitle="如果该邮箱存在，我们已向您发送了重置密码链接。请检查您的收件箱。"
              extra={[
                <Link href="/login" key="login">
                  <Button 
                    type="primary"
                    size="large"
                    style={{
                      background: 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)',
                      borderColor: 'transparent',
                      height: '48px',
                      fontSize: '15px',
                      fontWeight: 600,
                      borderRadius: '12px',
                      padding: '0 32px',
                    }}
                  >
                    返回登录
                  </Button>
                </Link>,
                <Button 
                  key="resend" 
                  size="large"
                  onClick={() => setSubmitted(false)}
                  style={{
                    height: '48px',
                    fontSize: '15px',
                    borderRadius: '12px',
                    padding: '0 32px',
                  }}
                >
                  重新发送
                </Button>,
              ]}
            />

            <div style={{ 
              marginTop: '24px', 
              padding: '16px', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '12px',
              borderLeft: '4px solid #FF6B35'
            }}>
              <Text style={{ fontSize: '13px', color: '#666' }}>
                💡 提示：链接有效期为1小时。如果未收到邮件，请检查垃圾邮件文件夹。
              </Text>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div 
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 16px',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 装饰性背景元素 */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        right: '-5%',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,107,53,0.1) 0%, rgba(255,107,53,0) 70%)',
        filter: 'blur(40px)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-10%',
        left: '-5%',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,107,53,0.15) 0%, rgba(255,107,53,0) 70%)',
        filter: 'blur(40px)',
        pointerEvents: 'none',
      }} />
        background: 'radial-gradient(circle, rgba(255,107,53,0.15) 0%, rgba(255,107,53,0) 70%)',
        filter: 'blur(40px)',
      }} />
      
      {contextHolder}
      <div className="max-w-md w-full" style={{ position: 'relative', zIndex: 1 }}>
        <Card
          style={{
            borderRadius: '24px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            border: '1px solid rgba(255,255,255,0.8)',
            backdropFilter: 'blur(10px)',
            backgroundColor: 'rgba(255,255,255,0.95)',
          }}
          bodyStyle={{ padding: '48px' }}
        >
          {/* Back Button */}
          <Link href="/login">
            <Button 
              type="text" 
              icon={<ArrowLeftOutlined />}
              style={{ 
                marginBottom: '24px',
                color: '#666',
                fontSize: '14px',
              }}
            >
              返回登录
            </Button>
          </Link>

          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div 
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                boxShadow: '0 8px 24px rgba(255,107,53,0.25)',
              }}
            >
              <SafetyOutlined style={{ fontSize: '40px', color: 'white' }} />
            </div>
            <Title level={2} style={{ marginBottom: '8px', color: '#1a1a1a', fontWeight: 700 }}>
              忘记密码
            </Title>
            <Text type="secondary" style={{ fontSize: '15px' }}>
              输入您的邮箱地址，我们将发送重置密码链接
            </Text>
          </div>

          <Form
            form={form}
            name="forgot-password"
            onFinish={handleSubmit}
            autoComplete="off"
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: '请输入邮箱地址' },
                { type: 'email', message: '请输入有效的邮箱地址' }
              ]}
            >
              <Input
                prefix={<MailOutlined style={{ color: '#FF6B35' }} />}
                placeholder="邮箱地址"
                autoComplete="email"
                style={{
                  borderRadius: '12px',
                  border: '2px solid #e8e8e8',
                }}
              />
            </Form.Item>

            <Form.Item style={{ marginTop: '32px', marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
                style={{
                  background: 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)',
                  borderColor: 'transparent',
                  height: '52px',
                  fontSize: '16px',
                  fontWeight: 600,
                  borderRadius: '12px',
                  boxShadow: '0 4px 16px rgba(255,107,53,0.3)',
                }}
              >
                {loading ? '发送中...' : '发送重置链接'}
              </Button>
            </Form.Item>
          </Form>

          {/* 提示信息 */}
          <div style={{ 
            marginTop: '32px', 
            padding: '16px', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '12px' 
          }}>
            <Text style={{ fontSize: '13px', color: '#666', lineHeight: '1.6' }}>
              <div style={{ marginBottom: '8px' }}>📧 我们将向您的邮箱发送重置链接</div>
              <div style={{ marginBottom: '8px' }}>⏰ 链接有效期为1小时</div>
              <div>🔒 如果您记起密码，可以直接返回登录</div>
            </Text>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <Text style={{ color: 'rgba(0,0,0,0.45)', fontSize: '14px' }}>
            © 2024 Axiarz. 保留所有权利。
          </Text>
        </div>
      </div>
    </div>
  )
}
