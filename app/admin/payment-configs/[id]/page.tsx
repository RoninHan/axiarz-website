'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  Form,
  Input,
  InputNumber,
  Button,
  Card,
  Space,
  Switch,
  message,
  Spin,
  Select,
  Row,
  Col,
  Divider,
  Tag,
  Alert,
} from 'antd'
import {
  ArrowLeftOutlined,
  SaveOutlined,
  AlipayOutlined,
  WechatOutlined,
  PayCircleOutlined,
  LockOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import { PaymentConfig } from '@/types'

const { TextArea } = Input

export default function PaymentConfigDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [form] = Form.useForm()
  const [config, setConfig] = useState<PaymentConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchConfig(params.id as string)
    }
  }, [params.id])

  async function fetchConfig(id: string) {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/payment-configs/${id}`, {
        credentials: 'include',
      })
      const data = await res.json()
      if (data.success) {
        setConfig(data.data)
        form.setFieldsValue({
          displayName: data.data.displayName,
          enabled: data.data.enabled,
          sortOrder: data.data.sortOrder,
          ...data.data.config,
        })
      }
    } catch (error) {
      console.error('获取支付配置失败:', error)
      message.error('获取支付配置失败')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(values: any) {
    if (!config) return

    try {
      setSaving(true)
      const { displayName, enabled, sortOrder, ...configData } = values

      const res = await fetch(`/api/admin/payment-configs/${config.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          displayName,
          enabled,
          sortOrder,
          config: configData,
        }),
      })
      const data = await res.json()
      if (data.success) {
        message.success('保存成功')
        setTimeout(() => router.push('/admin/payment-configs'), 1000)
      } else {
        message.error(data.error || '保存失败')
      }
    } catch (error) {
      console.error('保存支付配置失败:', error)
      message.error('保存失败')
    } finally {
      setSaving(false)
    }
  }

  function getPaymentIcon(name: string) {
    switch (name) {
      case 'alipay':
        return <AlipayOutlined style={{ fontSize: 32, color: '#1677ff' }} />
      case 'wechat':
        return <WechatOutlined style={{ fontSize: 32, color: '#07c160' }} />
      case 'paypal':
        return <PayCircleOutlined style={{ fontSize: 32, color: '#003087' }} />
      default:
        return <PayCircleOutlined style={{ fontSize: 32, color: '#666' }} />
    }
  }

  function getPaymentColor(name: string) {
    switch (name) {
      case 'alipay':
        return '#1677ff'
      case 'wechat':
        return '#07c160'
      case 'paypal':
        return '#003087'
      default:
        return '#666'
    }
  }

  function renderConfigFields() {
    if (!config) return null

    switch (config.name) {
      case 'alipay':
        return (
          <>
            <Alert
              message="支付宝支付配置"
              description="请在支付宝开放平台获取相关配置信息"
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />
            <Form.Item
              label="AppID"
              name="appId"
              rules={[{ required: true, message: '请输入 AppID' }]}
            >
              <Input placeholder="请输入支付宝 AppID" />
            </Form.Item>
            <Form.Item
              label="商户私钥"
              name="privateKey"
              rules={[{ required: true, message: '请输入商户私钥' }]}
            >
              <TextArea
                rows={4}
                placeholder="请输入商户私钥"
              />
            </Form.Item>
            <Form.Item
              label="支付宝公钥"
              name="publicKey"
              rules={[{ required: true, message: '请输入支付宝公钥' }]}
            >
              <TextArea
                rows={4}
                placeholder="请输入支付宝公钥"
              />
            </Form.Item>
            <Form.Item
              label="网关地址"
              name="gateway"
              initialValue="https://openapi.alipay.com/gateway.do"
            >
              <Input placeholder="https://openapi.alipay.com/gateway.do" />
            </Form.Item>
          </>
        )
      case 'wechat':
        return (
          <>
            <Alert
              message="微信支付配置"
              description="请在微信支付商户平台获取相关配置信息"
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />
            <Form.Item
              label="AppID"
              name="appId"
              rules={[{ required: true, message: '请输入 AppID' }]}
            >
              <Input placeholder="请输入微信 AppID" />
            </Form.Item>
            <Form.Item
              label="商户号 (MchID)"
              name="mchId"
              rules={[{ required: true, message: '请输入商户号' }]}
            >
              <Input placeholder="请输入商户号" />
            </Form.Item>
            <Form.Item
              label="API 密钥"
              name="apiKey"
              rules={[{ required: true, message: '请输入 API 密钥' }]}
            >
              <Input.Password placeholder="请输入 API 密钥" />
            </Form.Item>
            <Form.Item
              label="通知地址"
              name="notifyUrl"
            >
              <Input placeholder="支付回调通知地址" />
            </Form.Item>
          </>
        )
      case 'paypal':
        return (
          <>
            <Alert
              message="PayPal 支付配置"
              description="请在 PayPal 开发者平台获取相关配置信息"
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />
            <Form.Item
              label="Client ID"
              name="clientId"
              rules={[{ required: true, message: '请输入 Client ID' }]}
            >
              <Input placeholder="请输入 Client ID" />
            </Form.Item>
            <Form.Item
              label="Client Secret"
              name="clientSecret"
              rules={[{ required: true, message: '请输入 Client Secret' }]}
            >
              <Input.Password placeholder="请输入 Client Secret" />
            </Form.Item>
            <Form.Item
              label="运行模式"
              name="mode"
              initialValue="sandbox"
              rules={[{ required: true, message: '请选择运行模式' }]}
            >
              <Select>
                <Select.Option value="sandbox">沙箱环境</Select.Option>
                <Select.Option value="live">生产环境</Select.Option>
              </Select>
            </Form.Item>
          </>
        )
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" tip="加载中..." />
      </div>
    )
  }

  if (!config) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <p style={{ fontSize: 16, color: '#999' }}>支付配置不存在</p>
          <Button onClick={() => router.push('/admin/payment-configs')} style={{ marginTop: 16 }}>
            返回列表
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <div>
      {/* 页面标题 */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space size="large">
            {getPaymentIcon(config.name)}
            <div>
              <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>
                配置 {config.displayName}
              </h1>
              <p style={{ margin: '8px 0 0', color: '#666' }}>
                <Tag color={config.enabled ? 'success' : 'default'}>
                  {config.enabled ? '已启用' : '未启用'}
                </Tag>
                <span style={{ marginLeft: 8 }}>支付方式配置</span>
              </p>
            </div>
          </Space>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => router.back()}
          >
            返回
          </Button>
        </div>
      </Card>

      {/* 表单区域 */}
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Row gutter={24}>
          {/* 左侧：配置参数 */}
          <Col span={16}>
            <Card 
              title={
                <Space>
                  <SettingOutlined />
                  支付参数配置
                </Space>
              }
              style={{ marginBottom: 24 }}
            >
              {renderConfigFields()}
            </Card>
          </Col>

          {/* 右侧：基本设置 */}
          <Col span={8}>
            <Card title="基本设置" style={{ marginBottom: 24 }}>
              <Form.Item
                label="显示名称"
                name="displayName"
                rules={[{ required: true, message: '请输入显示名称' }]}
              >
                <Input placeholder="请输入显示名称" />
              </Form.Item>

              <Form.Item
                label="排序顺序"
                name="sortOrder"
                extra="数字越小越靠前"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  placeholder="0"
                />
              </Form.Item>

              <Form.Item
                label="启用状态"
                name="enabled"
                valuePropName="checked"
              >
                <Switch
                  checkedChildren="已启用"
                  unCheckedChildren="未启用"
                />
              </Form.Item>
            </Card>

            <Card>
              <Space style={{ width: '100%' }} direction="vertical" size="middle">
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  htmlType="submit"
                  loading={saving}
                  size="large"
                  block
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                  }}
                >
                  {saving ? '保存中...' : '保存配置'}
                </Button>
                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={() => router.back()}
                  size="large"
                  block
                >
                  取消
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  )
}
