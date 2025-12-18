'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  Typography, 
  message,
  Checkbox,
  Divider
} from 'antd'
import { 
  MailOutlined, 
  LockOutlined,
  SafetyOutlined,
  DashboardOutlined
} from '@ant-design/icons'

const { Title, Text } = Typography

export default function AdminLoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [messageApi, contextHolder] = message.useMessage()
  const [form] = Form.useForm()

  async function handleSubmit(values: { email: string; password: string; remember?: boolean }) {
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // 确保接收和发送 cookie
        body: JSON.stringify({ 
          email: values.email, 
          password: values.password, 
          type: 'admin' 
        }),
      })
      const data = await res.json()

      if (data.success) {
        // 服务端已经设置了 HttpOnly cookie，无需手动设置
        console.log('登录成功，准备跳转到 /admin')
        messageApi.success('登录成功！正在跳转...')
        setTimeout(() => {
          // 使用 window.location.href 强制刷新，确保 cookie 生效
          window.location.href = '/admin'
        }, 800)
      } else {
        messageApi.error(data.error || '登录失败')
      }
    } catch (error) {
      messageApi.error('登录失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div 
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 16px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
        background: 'radial-gradient(circle, rgba(102,126,234,0.3) 0%, rgba(102,126,234,0) 70%)',
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
        background: 'radial-gradient(circle, rgba(118,75,162,0.3) 0%, rgba(118,75,162,0) 70%)',
        filter: 'blur(40px)',
        pointerEvents: 'none',
      }} />
      
      {contextHolder}
      <div className="max-w-md w-full" style={{ position: 'relative', zIndex: 1 }}>
        <Card
          style={{
            borderRadius: '24px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            border: '1px solid rgba(255,255,255,0.8)',
            backdropFilter: 'blur(10px)',
            backgroundColor: 'rgba(255,255,255,0.95)',
          }}
          bodyStyle={{ padding: '48px' }}
        >
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div 
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                boxShadow: '0 8px 24px rgba(102,126,234,0.3)',
              }}
            >
              <SafetyOutlined style={{ fontSize: '40px', color: 'white' }} />
            </div>
            <Title level={2} style={{ marginBottom: '8px', color: '#1a1a1a', fontWeight: 700 }}>
              管理员登录
            </Title>
            <Text type="secondary" style={{ fontSize: '15px' }}>
              登录管理后台
            </Text>
          </div>

          <Form
            form={form}
            name="admin-login"
            onFinish={handleSubmit}
            autoComplete="off"
            layout="vertical"
            size="large"
            initialValues={{ remember: true }}
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: '请输入邮箱地址' },
                { type: 'email', message: '请输入有效的邮箱地址' }
              ]}
            >
              <Input
                prefix={<MailOutlined style={{ color: '#667eea' }} />}
                placeholder="管理员邮箱"
                autoComplete="email"
                style={{
                  borderRadius: '12px',
                  border: '2px solid #e8e8e8',
                }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: '请输入密码' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#667eea' }} />}
                placeholder="密码"
                autoComplete="current-password"
                style={{
                  borderRadius: '12px',
                  border: '2px solid #e8e8e8',
                }}
              />
            </Form.Item>

            <Form.Item>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox style={{ fontSize: '14px' }}>记住我</Checkbox>
                </Form.Item>
              </div>
            </Form.Item>

            <Form.Item style={{ marginTop: '32px', marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
                icon={<DashboardOutlined />}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderColor: 'transparent',
                  height: '52px',
                  fontSize: '16px',
                  fontWeight: 600,
                  borderRadius: '12px',
                  boxShadow: '0 4px 16px rgba(102,126,234,0.3)',
                }}
              >
                {loading ? '登录中...' : '进入后台'}
              </Button>
            </Form.Item>
          </Form>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px' }}>
            © 2024 Axiarz Admin Portal. 保留所有权利。
          </Text>
        </div>
      </div>
    </div>
  )
}

