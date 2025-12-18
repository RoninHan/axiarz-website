'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  Typography, 
  message,
  Progress,
  Result
} from 'antd'
import { 
  LockOutlined,
  CheckCircleOutlined,
  SafetyOutlined
} from '@ant-design/icons'

const { Title, Text } = Typography

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [messageApi, contextHolder] = message.useMessage()
  const [form] = Form.useForm()
  const [passwordStrength, setPasswordStrength] = useState(0)

  useEffect(() => {
    if (!token) {
      messageApi.error('无效的重置链接')
    }
  }, [token, messageApi])

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

  async function handleSubmit(values: { password: string; confirmPassword: string }) {
    if (!token) {
      messageApi.error('无效的重置链接')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password: values.password,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        messageApi.success('密码重置成功！')
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      } else {
        messageApi.error(data.error || '重置失败，请稍后重试')
      }
    } catch (error) {
      messageApi.error('重置失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div 
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 16px',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          overflow: 'hidden',
        }}
      >
        {contextHolder}
        <Card style={{ maxWidth: '500px' }}>
          <Result
            status="error"
            title="无效的重置链接"
            subTitle="该链接可能已过期或无效，请重新申请重置密码。"
            extra={[
              <Link href="/forgot-password" key="forgot">
                <Button type="primary">重新申请</Button>
              </Link>,
              <Link href="/login" key="login">
                <Button>返回登录</Button>
              </Link>,
            ]}
          />
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div 
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 16px',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          overflow: 'hidden',
        }}
      >
        {contextHolder}
        <div className="max-w-md w-full">
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
              title="密码重置成功"
              subTitle="您的密码已成功重置。正在跳转到登录页面..."
              icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            />
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
              <SafetyOutlined style={{ fontSize: '40px', color: 'white' }} />
            </div>
            <Title level={2} style={{ marginBottom: '8px', color: '#1a1a1a', fontWeight: 700 }}>
              重置密码
            </Title>
            <Text type="secondary" style={{ fontSize: '15px' }}>
              请输入您的新密码
            </Text>
          </div>

          <Form
            form={form}
            name="reset-password"
            onFinish={handleSubmit}
            autoComplete="off"
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="password"
              rules={[
                { required: true, message: '请输入新密码' },
                { min: 6, message: '密码长度至少6位' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#FF6B35' }} />}
                placeholder="新密码（至少6位）"
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
                { required: true, message: '请确认新密码' },
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
                placeholder="确认新密码"
                autoComplete="new-password"
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
                {loading ? '重置中...' : '重置密码'}
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
              <div style={{ marginBottom: '8px' }}>🔒 密码建议包含大小写字母、数字和特殊字符</div>
              <div>📝 密码长度至少6位，建议8位以上</div>
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      }}>
        <Text>加载中...</Text>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
