'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  Typography, 
  Space, 
  Divider,
  message,
  Checkbox,
  Progress
} from 'antd'
import { 
  UserOutlined, 
  LockOutlined, 
  MailOutlined,
  UserAddOutlined,
  CheckCircleOutlined 
} from '@ant-design/icons'
import { useAuth } from '@/contexts/AuthContext'

const { Title, Text } = Typography

export default function RegisterPage() {
  const router = useRouter()
  const { register } = useAuth()
  const [loading, setLoading] = useState(false)
  const [messageApi, contextHolder] = message.useMessage()
  const [form] = Form.useForm()
  const [passwordStrength, setPasswordStrength] = useState(0)

  // 计算密码强度
  function calculatePasswordStrength(password: string) {
    let strength = 0
    if (password.length >= 6) strength += 25
    if (password.length >= 8) strength += 25
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25
    if (/\d/.test(password)) strength += 15
    if (/[^a-zA-Z\d]/.test(password)) strength += 10
    return Math.min(strength, 100)
  }

  function handlePasswordChange(e: React.ChangeEvent<HTMLInputElement>) {
    const password = e.target.value
    setPasswordStrength(calculatePasswordStrength(password))
  }

  function getPasswordStrengthStatus(): 'exception' | 'active' | 'success' {
    if (passwordStrength < 50) return 'exception'
    if (passwordStrength < 80) return 'active'
    return 'success'
  }

  function getPasswordStrengthText() {
    if (passwordStrength < 50) return '弱'
    if (passwordStrength < 80) return '中'
    return '强'
  }

  async function handleSubmit(values: { 
    email: string
    name?: string
    password: string
    confirmPassword: string
    agree: boolean 
  }) {
    if (!values.agree) {
      messageApi.warning('请同意用户协议和隐私政策')
      return
    }

    setLoading(true)

    try {
      const result = await register(values.email, values.password, values.name || undefined)
      if (result.success) {
        messageApi.success('注册成功！正在跳转...')
        setTimeout(() => {
          // 使用 window.location.href 强制刷新，确保 cookie 生效
          window.location.href = '/'
        }, 1000)
      } else {
        messageApi.error(result.error || '注册失败，请稍后重试')
      }
    } catch (error) {
      messageApi.error('注册失败，请稍后重试')
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
              <UserAddOutlined style={{ fontSize: '40px', color: 'white' }} />
            </div>
            <Title level={2} style={{ marginBottom: '8px', color: '#1a1a1a', fontWeight: 700 }}>
              创建账号
            </Title>
            <Text type="secondary" style={{ fontSize: '15px' }}>
              填写以下信息开始使用
            </Text>
          </div>

          <Form
            form={form}
            name="register"
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

            <Form.Item
              name="name"
            >
              <Input
                prefix={<UserOutlined style={{ color: '#FF6B35' }} />}
                placeholder="姓名（可选）"
                autoComplete="name"
                style={{
                  borderRadius: '12px',
                  border: '2px solid #e8e8e8',
                }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码长度至少6位' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#FF6B35' }} />}
                placeholder="密码（至少6位）"
                onChange={handlePasswordChange}
                autoComplete="new-password"
                style={{
                  borderRadius: '12px',
                  border: '2px solid #e8e8e8',
                }}
              />
            </Form.Item>

            {/* 密码强度指示器 */}
            {passwordStrength > 0 && (
              <div style={{ marginTop: '-16px', marginBottom: '16px' }}>
                <Progress 
                  percent={passwordStrength} 
                  status={getPasswordStrengthStatus()}
                  showInfo={false}
                  strokeColor={
                    passwordStrength < 50 ? '#ff4d4f' : 
                    passwordStrength < 80 ? '#faad14' : '#52c41a'
                  }
                />
                <Text 
                  type="secondary" 
                  style={{ 
                    fontSize: '12px',
                    color: passwordStrength < 50 ? '#ff4d4f' : 
                           passwordStrength < 80 ? '#faad14' : '#52c41a'
                  }}
                >
                  密码强度：{getPasswordStrengthText()}
                </Text>
              </div>
            )}

            <Form.Item
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                { required: true, message: '请确认密码' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve()
                    }
                    return Promise.reject(new Error('两次输入的密码不一致'))
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#FF6B35' }} />}
                placeholder="确认密码"
                autoComplete="new-password"
                style={{
                  borderRadius: '12px',
                  border: '2px solid #e8e8e8',
                }}
              />
            </Form.Item>

            <Form.Item
              name="agree"
              valuePropName="checked"
              rules={[
                {
                  validator: (_, value) =>
                    value ? Promise.resolve() : Promise.reject(new Error('请同意用户协议')),
                },
              ]}
            >
              <Checkbox>
                <Text style={{ fontSize: '14px' }}>
                  我已阅读并同意{' '}
                  <Link href="/terms" target="_blank">
                    <Text style={{ color: '#FF6B35' }}>用户协议</Text>
                  </Link>
                  {' '}和{' '}
                  <Link href="/privacy" target="_blank">
                    <Text style={{ color: '#FF6B35' }}>隐私政策</Text>
                  </Link>
                </Text>
              </Checkbox>
            </Form.Item>

            <Form.Item>
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
                  marginTop: '8px',
                }}
              >
                {loading ? '注册中...' : '立即注册'}
              </Button>
            </Form.Item>
          </Form>

          <Divider plain style={{ margin: '32px 0' }}>
            <Text type="secondary" style={{ fontSize: '13px', color: '#999' }}>
              或
            </Text>
          </Divider>

          <div className="text-center">
            <Text type="secondary" style={{ fontSize: '15px' }}>
              已有账号？{' '}
              <Link href="/login">
                <span style={{ 
                  color: '#FF6B35',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}>
                  立即登录 →
                </span>
              </Link>
            </Text>
          </div>

          {/* 注册优势 */}
          <div style={{ marginTop: '32px', padding: '24px', backgroundColor: '#f8f9fa', borderRadius: '12px' }}>
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '18px' }} />
                <Text style={{ fontSize: '14px', color: '#666' }}>
                  免费注册，无需信用卡
                </Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '18px' }} />
                <Text style={{ fontSize: '14px', color: '#666' }}>
                  享受会员专属优惠
                </Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '18px' }} />
                <Text style={{ fontSize: '14px', color: '#666' }}>
                  快速下单和订单追踪
                </Text>
              </div>
            </Space>
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
