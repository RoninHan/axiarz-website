'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Card,
  Row,
  Col,
  Switch,
  Button,
  Space,
  Tag,
  Descriptions,
  message,
  Spin,
  Empty,
} from 'antd'
import {
  CreditCardOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  AlipayOutlined,
  WechatOutlined,
  DollarOutlined,
} from '@ant-design/icons'
import { PaymentConfig } from '@/types'

function getPaymentIcon(name: string) {
  if (name.includes('alipay')) return <AlipayOutlined style={{ fontSize: 32, color: '#1677ff' }} />
  if (name.includes('wechat')) return <WechatOutlined style={{ fontSize: 32, color: '#07c160' }} />
  return <CreditCardOutlined style={{ fontSize: 32, color: '#667eea' }} />
}

export default function PaymentConfigsPage() {
  const [configs, setConfigs] = useState<PaymentConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    fetchConfigs()
  }, [])

  async function fetchConfigs() {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/payment-configs', {
        credentials: 'include',
      })
      const data = await res.json()
      if (data.success) {
        setConfigs(data.data)
      }
    } catch (error) {
      console.error('获取支付配置失败:', error)
      message.error('获取支付配置失败')
    } finally {
      setLoading(false)
    }
  }

  async function toggleEnabled(id: string, currentEnabled: boolean) {
    try {
      setUpdating(id)
      const res = await fetch(`/api/admin/payment-configs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ enabled: !currentEnabled }),
      })
      const data = await res.json()
      if (data.success) {
        message.success(currentEnabled ? '已禁用' : '已启用')
        await fetchConfigs()
      } else {
        message.error(data.error || '操作失败')
      }
    } catch (error) {
      console.error('更新支付配置失败:', error)
      message.error('操作失败')
    } finally {
      setUpdating(null)
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div>
      {/* 页面标题 */}
      <Card style={{ marginBottom: 24 }}>
        <Space direction="vertical" size="small">
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>
            <CreditCardOutlined style={{ marginRight: 8, color: '#667eea' }} />
            支付配置管理
          </h2>
          <p style={{ margin: 0, color: '#999' }}>
            配置和管理平台支持的支付方式，可以启用或禁用各个支付渠道
          </p>
        </Space>
      </Card>

      {/* 支付配置列表 */}
      {configs.length === 0 ? (
        <Card>
          <Empty description="暂无支付配置" />
        </Card>
      ) : (
        <Row gutter={[16, 16]}>
          {configs.map((config) => (
            <Col key={config.id} xs={24} sm={24} md={12} lg={12} xl={8}>
              <Card
                hoverable
                style={{
                  borderColor: config.enabled ? '#52c41a' : '#d9d9d9',
                  borderWidth: 2,
                }}
              >
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  {/* 头部：图标和状态 */}
                  <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Space>
                      {getPaymentIcon(config.name)}
                      <div>
                        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
                          {config.displayName}
                        </h3>
                        <p style={{ margin: 0, fontSize: 12, color: '#999' }}>
                          {config.name}
                        </p>
                      </div>
                    </Space>
                    <Tag
                      icon={
                        config.enabled ? <CheckCircleOutlined /> : <CloseCircleOutlined />
                      }
                      color={config.enabled ? 'success' : 'default'}
                    >
                      {config.enabled ? '已启用' : '已禁用'}
                    </Tag>
                  </Space>

                  {/* 配置信息 */}
                  <Descriptions size="small" column={1}>
                    <Descriptions.Item label="排序顺序">
                      <Tag color="blue">{config.sortOrder}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="配置参数">
                      {Object.keys(config.config || {}).length} 项
                    </Descriptions.Item>
                  </Descriptions>

                  {/* 操作按钮 */}
                  <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Space>
                      <span style={{ fontSize: 14 }}>启用状态：</span>
                      <Switch
                        checked={config.enabled}
                        loading={updating === config.id}
                        onChange={() => toggleEnabled(config.id, config.enabled)}
                        checkedChildren="开"
                        unCheckedChildren="关"
                      />
                    </Space>
                    <Link href={`/admin/payment-configs/${config.id}`}>
                      <Button type="primary" icon={<SettingOutlined />}>
                        配置
                      </Button>
                    </Link>
                  </Space>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* 提示信息 */}
      <Card style={{ marginTop: 24, background: '#f6ffed', borderColor: '#b7eb8f' }}>
        <Space>
          <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 20 }} />
          <div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>配置提示</div>
            <div style={{ fontSize: 14, color: '#666' }}>
              点击&quot;配置&quot;按钮可以设置每个支付方式的详细参数。排序顺序决定了支付方式在前台的显示顺序，数字越小越靠前。
            </div>
          </div>
        </Space>
      </Card>
    </div>
  )
}

