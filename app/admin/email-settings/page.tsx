'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  Switch,
  message,
  Space,
  Typography,
  Divider,
  Alert,
  Tabs,
} from 'antd'
import {
  MailOutlined,
  SaveOutlined,
  SendOutlined,
  SettingOutlined,
} from '@ant-design/icons'

const { Title, Text } = Typography
const { TextArea } = Input
const { TabPane } = Tabs

interface EmailSettings {
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
  testEmail?: string
}

export default function EmailSettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [testLoading, setTestLoading] = useState(false)
  const [messageApi, contextHolder] = message.useMessage()
  const [form] = Form.useForm()
  const [provider, setProvider] = useState('smtp')

  useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    try {
      const response = await fetch('/api/admin/email-settings')
      if (response.ok) {
        const data = await response.json()
        if (data) {
          form.setFieldsValue(data)
          setProvider(data.provider || 'smtp')
        }
      }
    } catch (error) {
      console.error('加载设置失败:', error)
    }
  }

  async function handleSave(values: EmailSettings) {
    setLoading(true)

    try {
      const response = await fetch('/api/admin/email-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (response.ok) {
        messageApi.success('邮件设置已保存')
      } else {
        messageApi.error(data.error || '保存失败')
      }
    } catch (error) {
      messageApi.error('保存失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  async function handleTestEmail() {
    const testEmail = form.getFieldValue('testEmail')
    
    if (!testEmail) {
      messageApi.warning('请输入测试邮箱地址')
      return
    }

    setTestLoading(true)

    try {
      const response = await fetch('/api/admin/email-settings/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: testEmail }),
      })

      const data = await response.json()

      if (response.ok) {
        messageApi.success('测试邮件已发送，请检查收件箱')
      } else {
        messageApi.error(data.error || '发送失败')
      }
    } catch (error) {
      messageApi.error('发送失败，请稍后重试')
    } finally {
      setTestLoading(false)
    }
  }

  return (
    <div>
      {contextHolder}
      
      <div className="max-w-4xl mx-auto">
        <Card
          style={{
            borderRadius: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          }}
        >
          <div style={{ marginBottom: '24px' }}>
            <Title level={3} style={{ marginBottom: '8px' }}>
              <MailOutlined style={{ marginRight: '8px', color: '#FF6B35' }} />
              邮件服务配置
            </Title>
            <Text type="secondary">
              配置邮件发送服务，用于发送重置密码、订单通知等邮件
            </Text>
          </div>

          <Alert
            message="安全提示"
            description="邮件配置信息将加密存储在数据库中。建议使用专用的邮件服务账号，避免使用个人邮箱。"
            type="info"
            showIcon
            style={{ marginBottom: '24px' }}
          />

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSave}
            initialValues={{
              provider: 'smtp',
              smtpPort: 587,
              smtpSecure: false,
              enabled: true,
            }}
          >
            <Form.Item
              name="enabled"
              label="启用邮件服务"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item
              name="provider"
              label="邮件服务提供商"
              rules={[{ required: true, message: '请选择邮件服务提供商' }]}
            >
              <Select
                onChange={(value) => setProvider(value)}
                size="large"
                options={[
                  { label: 'SMTP（通用）', value: 'smtp' },
                  { label: 'SendGrid', value: 'sendgrid' },
                  { label: 'AWS SES', value: 'aws-ses' },
                ]}
              />
            </Form.Item>

            <Divider />

            {provider === 'smtp' && (
              <>
                <Title level={5}>SMTP 配置</Title>
                <Form.Item
                  name="smtpHost"
                  label="SMTP 服务器地址"
                  rules={[{ required: true, message: '请输入SMTP服务器地址' }]}
                >
                  <Input
                    placeholder="例如: smtp.gmail.com"
                    size="large"
                  />
                </Form.Item>

                <Space style={{ width: '100%' }} size="large">
                  <Form.Item
                    name="smtpPort"
                    label="端口"
                    rules={[{ required: true, message: '请输入端口' }]}
                    style={{ flex: 1 }}
                  >
                    <Input
                      type="number"
                      placeholder="587 或 465"
                      size="large"
                    />
                  </Form.Item>

                  <Form.Item
                    name="smtpSecure"
                    label="使用SSL/TLS"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Space>

                <Form.Item
                  name="smtpUser"
                  label="用户名"
                  rules={[{ required: true, message: '请输入用户名' }]}
                >
                  <Input
                    placeholder="邮箱地址或用户名"
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  name="smtpPassword"
                  label="密码"
                  rules={[{ required: true, message: '请输入密码' }]}
                >
                  <Input.Password
                    placeholder="密码或应用专用密码"
                    size="large"
                  />
                </Form.Item>
              </>
            )}

            {provider === 'sendgrid' && (
              <>
                <Title level={5}>SendGrid 配置</Title>
                <Form.Item
                  name="sendgridApiKey"
                  label="API Key"
                  rules={[{ required: true, message: '请输入SendGrid API Key' }]}
                >
                  <Input.Password
                    placeholder="SG.xxxxx"
                    size="large"
                  />
                </Form.Item>
                <Alert
                  message="获取 SendGrid API Key"
                  description={
                    <div>
                      1. 注册 <a href="https://sendgrid.com" target="_blank" rel="noopener">SendGrid</a> 账号<br/>
                      2. 进入 Settings → API Keys<br/>
                      3. 创建新的 API Key 并复制
                    </div>
                  }
                  type="info"
                  showIcon
                  style={{ marginBottom: '16px' }}
                />
              </>
            )}

            {provider === 'aws-ses' && (
              <>
                <Title level={5}>AWS SES 配置</Title>
                <Form.Item
                  name="awsSesRegion"
                  label="AWS 区域"
                  rules={[{ required: true, message: '请输入AWS区域' }]}
                >
                  <Input
                    placeholder="例如: us-east-1"
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  name="awsSesAccessKeyId"
                  label="Access Key ID"
                  rules={[{ required: true, message: '请输入Access Key ID' }]}
                >
                  <Input.Password
                    placeholder="AWS Access Key ID"
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  name="awsSesSecretAccessKey"
                  label="Secret Access Key"
                  rules={[{ required: true, message: '请输入Secret Access Key' }]}
                >
                  <Input.Password
                    placeholder="AWS Secret Access Key"
                    size="large"
                  />
                </Form.Item>
              </>
            )}

            <Divider />

            <Title level={5}>发件人信息</Title>
            <Form.Item
              name="fromEmail"
              label="发件人邮箱"
              rules={[
                { required: true, message: '请输入发件人邮箱' },
                { type: 'email', message: '请输入有效的邮箱地址' }
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="noreply@example.com"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="fromName"
              label="发件人名称"
              rules={[{ required: true, message: '请输入发件人名称' }]}
            >
              <Input
                placeholder="Axiarz"
                size="large"
              />
            </Form.Item>

            <Divider />

            <Title level={5}>测试邮件</Title>
            <Form.Item
              name="testEmail"
              label="测试邮箱地址"
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="输入接收测试邮件的地址"
                size="large"
                suffix={
                  <Button
                    type="link"
                    icon={<SendOutlined />}
                    onClick={handleTestEmail}
                    loading={testLoading}
                  >
                    发送测试
                  </Button>
                }
              />
            </Form.Item>

            <Form.Item style={{ marginTop: '32px', marginBottom: 0 }}>
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={loading}
                  size="large"
                  style={{
                    background: 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)',
                    borderColor: 'transparent',
                  }}
                >
                  保存配置
                </Button>
                <Button
                  size="large"
                  onClick={() => router.push('/admin')}
                >
                  返回
                </Button>
              </Space>
            </Form.Item>
          </Form>

          <Divider />

          <Card
            type="inner"
            title="常用邮件服务商 SMTP 配置"
            style={{ marginTop: '24px' }}
          >
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <div>
                <Text strong>Gmail</Text>
                <div style={{ marginLeft: '16px', marginTop: '8px' }}>
                  <Text type="secondary">服务器: smtp.gmail.com</Text><br/>
                  <Text type="secondary">端口: 587 (TLS) 或 465 (SSL)</Text><br/>
                  <Text type="secondary">需要在 Google 账号中启用"两步验证"并生成"应用专用密码"</Text>
                </div>
              </div>

              <div>
                <Text strong>Outlook / Hotmail</Text>
                <div style={{ marginLeft: '16px', marginTop: '8px' }}>
                  <Text type="secondary">服务器: smtp.office365.com</Text><br/>
                  <Text type="secondary">端口: 587 (TLS)</Text>
                </div>
              </div>

              <div>
                <Text strong>QQ邮箱</Text>
                <div style={{ marginLeft: '16px', marginTop: '8px' }}>
                  <Text type="secondary">服务器: smtp.qq.com</Text><br/>
                  <Text type="secondary">端口: 587 或 465</Text><br/>
                  <Text type="secondary">需要在QQ邮箱设置中开启SMTP服务并获取授权码</Text>
                </div>
              </div>

              <div>
                <Text strong>163邮箱</Text>
                <div style={{ marginLeft: '16px', marginTop: '8px' }}>
                  <Text type="secondary">服务器: smtp.163.com</Text><br/>
                  <Text type="secondary">端口: 465 (SSL)</Text><br/>
                  <Text type="secondary">需要在163邮箱设置中开启SMTP服务并获取授权码</Text>
                </div>
              </div>
            </Space>
          </Card>
        </Card>
      </div>
    </div>
  )
}
