'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, Row, Col, Statistic, Spin, message } from 'antd'
import {
  UserOutlined,
  ShoppingOutlined,
  FileTextOutlined,
  AppstoreOutlined,
  SolutionOutlined,
  QuestionCircleOutlined,
  FileImageOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DatabaseOutlined,
} from '@ant-design/icons'
import Link from 'next/link'

interface DashboardStats {
  users: {
    total: number
    active: number
    disabled: number
    admins: number
  }
  orders: {
    total: number
    pending: number
    paid: number
    shipped: number
    delivered: number
    cancelled: number
    totalAmount: number
  }
  products: {
    total: number
    active: number
    outOfStock: number
    lowStock: number
    totalValue: number
  }
  categories: {
    total: number
    active: number
  }
  solutions: {
    total: number
    active: number
  }
  helpArticles: {
    total: number
    published: number
    totalViews: number
  }
  files: {
    total: number
    images: number
    documents: number
    totalSize: number
  }
}

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  async function fetchAllStats() {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/stats', {
        credentials: 'include',
      })
      
      // 检查是否是认证错误
      if (res.status === 401) {
        message.error('登录已过期，请重新登录')
        // 清除可能的旧 cookie
        document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'
        router.push('/admin/login')
        return
      }
      
      const data = await res.json()
      
      console.log('Stats API response:', data)
      
      if (data.success) {
        setStats(data.data)
      } else {
        console.error('API 返回错误:', data.error)
        message.error(data.error || '获取统计数据失败')
      }
    } catch (error) {
      console.error('获取统计数据失败:', error)
      message.error('获取统计数据失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllStats()
  }, [])

  if (loading || !stats) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div>
      <Card 
        style={{ 
          marginBottom: 24, 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
        }}
      >
        <div style={{ color: 'white' }}>
          <h1 style={{ fontSize: 28, fontWeight: 600, margin: 0, color: 'white' }}>
            📊 数据仪表盘
          </h1>
          <p style={{ margin: '8px 0 0', opacity: 0.9 }}>
            系统总览和关键指标统计
          </p>
        </div>
      </Card>

      <Card 
        title={
          <span>
            <UserOutlined style={{ marginRight: 8, color: '#667eea' }} />
            用户统计
          </span>
        }
        extra={<Link href="/admin/users">查看详情 →</Link>}
        style={{ marginBottom: 24 }}
      >
        <Row gutter={16}>
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false}>
              <Statistic
                title="总用户数"
                value={stats.users.total}
                prefix={<UserOutlined style={{ color: '#667eea' }} />}
                valueStyle={{ color: '#667eea' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false}>
              <Statistic
                title="活跃用户"
                value={stats.users.active}
                prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false}>
              <Statistic
                title="管理员"
                value={stats.users.admins}
                prefix={<UserOutlined style={{ color: '#fa8c16' }} />}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false}>
              <Statistic
                title="已禁用"
                value={stats.users.disabled}
                prefix={<ClockCircleOutlined style={{ color: '#999' }} />}
                valueStyle={{ color: '#999' }}
              />
            </Card>
          </Col>
        </Row>
      </Card>

      {/* 订单统计 */}
      <Card
        title={
          <span>
            <ShoppingCartOutlined style={{ marginRight: 8, color: '#722ed1' }} />
            订单统计
          </span>
        }
        extra={<Link href="/admin/orders">查看详情 →</Link>}
        style={{ marginBottom: 24 }}
      >
        <Row gutter={16}>
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false}>
              <Statistic
                title="总订单数"
                value={stats.orders.total}
                prefix={<ShoppingOutlined style={{ color: '#722ed1' }} />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false}>
              <Statistic
                title="待支付"
                value={stats.orders.pending}
                prefix={<ClockCircleOutlined style={{ color: '#fa8c16' }} />}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false}>
              <Statistic
                title="已支付"
                value={stats.orders.paid}
                prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false}>
              <Statistic
                title="总销售额"
                value={stats.orders.totalAmount}
                prefix="¥"
                precision={2}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
        </Row>
      </Card>

      {/* 产品和分类统计 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <span>
                <ShoppingOutlined style={{ marginRight: 8, color: '#13c2c2' }} />
                产品统计
              </span>
            }
            extra={<Link href="/admin/products">查看详情 →</Link>}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Card bordered={false}>
                  <Statistic
                    title="总产品数"
                    value={stats.products.total}
                    prefix={<ShoppingOutlined style={{ color: '#13c2c2' }} />}
                    valueStyle={{ color: '#13c2c2' }}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card bordered={false}>
                  <Statistic
                    title="已上架"
                    value={stats.products.active}
                    prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card bordered={false}>
                  <Statistic
                    title="库存不足"
                    value={stats.products.lowStock}
                    prefix={<ClockCircleOutlined style={{ color: '#fa8c16' }} />}
                    valueStyle={{ color: '#fa8c16' }}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card bordered={false}>
                  <Statistic
                    title="库存总价值"
                    value={stats.products.totalValue}
                    prefix="¥"
                    precision={2}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title={
              <span>
                <AppstoreOutlined style={{ marginRight: 8, color: '#eb2f96' }} />
                分类统计
              </span>
            }
            extra={<Link href="/admin/categories">查看详情 →</Link>}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Card bordered={false}>
                  <Statistic
                    title="总分类数"
                    value={stats.categories.total}
                    prefix={<AppstoreOutlined style={{ color: '#eb2f96' }} />}
                    valueStyle={{ color: '#eb2f96' }}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card bordered={false}>
                  <Statistic
                    title="已启用"
                    value={stats.categories.active}
                    prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* 内容统计 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <span>
                <SolutionOutlined style={{ marginRight: 8, color: '#faad14' }} />
                解决方案统计
              </span>
            }
            extra={<Link href="/admin/solutions">查看详情 →</Link>}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Card bordered={false}>
                  <Statistic
                    title="总方案数"
                    value={stats.solutions.total}
                    prefix={<SolutionOutlined style={{ color: '#faad14' }} />}
                    valueStyle={{ color: '#faad14' }}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card bordered={false}>
                  <Statistic
                    title="已发布"
                    value={stats.solutions.active}
                    prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title={
              <span>
                <QuestionCircleOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                帮助文章统计
              </span>
            }
            extra={<Link href="/admin/help-articles">查看详情 →</Link>}
          >
            <Row gutter={16}>
              <Col span={8}>
                <Card bordered={false}>
                  <Statistic
                    title="总文章数"
                    value={stats.helpArticles.total}
                    prefix={<QuestionCircleOutlined style={{ color: '#1890ff' }} />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card bordered={false}>
                  <Statistic
                    title="已发布"
                    value={stats.helpArticles.published}
                    prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card bordered={false}>
                  <Statistic
                    title="总浏览量"
                    value={stats.helpArticles.totalViews}
                    valueStyle={{ color: '#fa8c16' }}
                  />
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* 文件统计 */}
      <Card
        title={
          <span>
            <FileImageOutlined style={{ marginRight: 8, color: '#52c41a' }} />
            文件统计
          </span>
        }
        extra={<Link href="/admin/files">查看详情 →</Link>}
      >
        <Row gutter={16}>
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false}>
              <Statistic
                title="总文件数"
                value={stats.files.total}
                prefix={<FileImageOutlined style={{ color: '#667eea' }} />}
                valueStyle={{ color: '#667eea' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false}>
              <Statistic
                title="图片文件"
                value={stats.files.images}
                prefix={<FileImageOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false}>
              <Statistic
                title="文档文件"
                value={stats.files.documents}
                prefix={<FileTextOutlined style={{ color: '#fa8c16' }} />}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false}>
              <Statistic
                title="总存储空间"
                value={formatSize(stats.files.totalSize)}
                prefix={<DatabaseOutlined style={{ color: '#1890ff' }} />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  )
}
