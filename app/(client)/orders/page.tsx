'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Tabs } from 'antd'
import { 
  ShoppingOutlined,
  CreditCardOutlined,
  RocketOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  InboxOutlined
} from '@ant-design/icons'
import Card from '@/components/client/Card'
import Button from '@/components/client/Button'
import ProtectedRoute from '@/components/client/ProtectedRoute'
import { Order } from '@/types'

function OrdersPageContent() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<string>('all')

  useEffect(() => {
    fetchOrders()
  }, [])

  async function fetchOrders() {
    try {
      setLoading(true)
      const res = await fetch('/api/client/orders')
      const data = await res.json()
      if (data.success) {
        setOrders(data.data)
      }
    } catch (error) {
      console.error('获取订单失败:', error)
    } finally {
      setLoading(false)
    }
  }

  function getStatusText(status: string) {
    const map: Record<string, string> = {
      pending: '待支付',
      paid: '已支付',
      shipped: '已发货',
      delivered: '已送达',
      cancelled: '已取消',
    }
    return map[status] || status
  }

  function getStatusColor(status: string) {
    const map: Record<string, string> = {
      pending: 'text-yellow-500',
      paid: 'text-blue-500',
      shipped: 'text-purple-500',
      delivered: 'text-green-500',
      cancelled: 'text-red-500',
    }
    return map[status] || 'text-gray-500'
  }

  function getStatusBgColor(status: string) {
    const map: Record<string, string> = {
      pending: 'bg-yellow-50 border-yellow-200',
      paid: 'bg-blue-50 border-blue-200',
      shipped: 'bg-purple-50 border-purple-200',
      delivered: 'bg-green-50 border-green-200',
      cancelled: 'bg-red-50 border-red-200',
    }
    return map[status] || 'bg-gray-50 border-gray-200'
  }

  function getStatusIcon(status: string) {
    const iconClass = "text-xl"
    switch (status) {
      case 'pending':
        return <CreditCardOutlined className={`${iconClass} text-yellow-500`} />
      case 'paid':
        return <CheckCircleOutlined className={`${iconClass} text-blue-500`} />
      case 'shipped':
        return <RocketOutlined className={`${iconClass} text-purple-500`} />
      case 'delivered':
        return <CheckCircleOutlined className={`${iconClass} text-green-500`} />
      case 'cancelled':
        return <CloseCircleOutlined className={`${iconClass} text-red-500`} />
      default:
        return <ShoppingOutlined className={`${iconClass} text-gray-500`} />
    }
  }

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all') return true
    return order.status === activeTab
  })

  const orderCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    paid: orders.filter(o => o.status === 'paid').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f4f4]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-accent-orange border-t-transparent mb-4"></div>
          <p className="text-body text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f4f4f4] py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* 页面标题 */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">我的订单</h1>
          <p className="text-body text-gray-500">管理您的所有订单</p>
        </div>

        {/* 订单状态标签页 */}
        <Card className="mb-6 bg-white">
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              {
                key: 'all',
                label: (
                  <span className="flex items-center gap-2">
                    <ShoppingOutlined />
                    <span>全部订单</span>
                    {orderCounts.all > 0 && (
                      <span className="ml-1 px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                        {orderCounts.all}
                      </span>
                    )}
                  </span>
                ),
              },
              {
                key: 'pending',
                label: (
                  <span className="flex items-center gap-2">
                    <CreditCardOutlined />
                    <span>待支付</span>
                    {orderCounts.pending > 0 && (
                      <span className="ml-1 px-2 py-0.5 text-xs bg-yellow-100 text-yellow-600 rounded-full">
                        {orderCounts.pending}
                      </span>
                    )}
                  </span>
                ),
              },
              {
                key: 'paid',
                label: (
                  <span className="flex items-center gap-2">
                    <CheckCircleOutlined />
                    <span>已支付</span>
                    {orderCounts.paid > 0 && (
                      <span className="ml-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-600 rounded-full">
                        {orderCounts.paid}
                      </span>
                    )}
                  </span>
                ),
              },
              {
                key: 'shipped',
                label: (
                  <span className="flex items-center gap-2">
                    <RocketOutlined />
                    <span>已发货</span>
                    {orderCounts.shipped > 0 && (
                      <span className="ml-1 px-2 py-0.5 text-xs bg-purple-100 text-purple-600 rounded-full">
                        {orderCounts.shipped}
                      </span>
                    )}
                  </span>
                ),
              },
              {
                key: 'delivered',
                label: (
                  <span className="flex items-center gap-2">
                    <CheckCircleOutlined />
                    <span>已完成</span>
                    {orderCounts.delivered > 0 && (
                      <span className="ml-1 px-2 py-0.5 text-xs bg-green-100 text-green-600 rounded-full">
                        {orderCounts.delivered}
                      </span>
                    )}
                  </span>
                ),
              },
              {
                key: 'cancelled',
                label: (
                  <span className="flex items-center gap-2">
                    <CloseCircleOutlined />
                    <span>已取消</span>
                    {orderCounts.cancelled > 0 && (
                      <span className="ml-1 px-2 py-0.5 text-xs bg-red-100 text-red-600 rounded-full">
                        {orderCounts.cancelled}
                      </span>
                    )}
                  </span>
                ),
              },
            ]}
          />
        </Card>

        {/* 订单列表 */}
        {filteredOrders.length === 0 ? (
          <Card className="text-center py-16 bg-white">
            <InboxOutlined className="text-6xl text-gray-300 mb-4" />
            <p className="text-title-small text-gray-800 mb-2">暂无订单</p>
            <p className="text-body text-gray-500 mb-6">
              {activeTab === 'all' ? '您还没有任何订单' : `没有${getStatusText(activeTab)}的订单`}
            </p>
            <Link href="/products">
              <Button variant="primary">
                <ShoppingOutlined className="mr-2" />
                去购物
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="bg-white hover:shadow-lg transition-shadow">
                {/* 订单头部 */}
                <div className={`flex items-center justify-between p-4 border-b-2 ${getStatusBgColor(order.status)}`}>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <CalendarOutlined className="text-gray-400" />
                      <span className="text-caption text-gray-600">
                        {new Date(order.createdAt).toLocaleString('zh-CN')}
                      </span>
                    </div>
                    <div className="h-4 w-px bg-gray-300"></div>
                    <div className="flex items-center gap-2">
                      <span className="text-caption text-gray-500">订单号:</span>
                      <span className="text-caption font-mono text-gray-700">{order.orderNumber}</span>
                    </div>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${getStatusBgColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    <span className={`text-body font-medium ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>
                </div>

                {/* 订单商品列表 */}
                <div className="p-4">
                  <div className="space-y-3">
                    {order.items?.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex gap-4">
                        <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden border border-gray-200">
                          {item.product?.image ? (
                            <img 
                              src={item.product.image} 
                              alt={item.product.name} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ShoppingOutlined className="text-2xl text-gray-300" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-body font-medium text-gray-800 truncate mb-1">
                            {item.product?.name}
                          </h4>
                          <p className="text-caption text-gray-500">
                            ¥{Number(item.price).toFixed(2)} × {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-body font-medium text-gray-800">
                            ¥{(Number(item.price) * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                    {(order.items?.length || 0) > 3 && (
                      <p className="text-caption text-gray-500 text-center">
                        还有 {(order.items?.length || 0) - 3} 件商品...
                      </p>
                    )}
                  </div>
                </div>

                {/* 订单底部 */}
                <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center gap-6">
                    {order.address && (
                      <div className="flex items-center gap-2 text-caption text-gray-600">
                        <EnvironmentOutlined className="text-gray-400" />
                        <span className="truncate max-w-xs">
                          {order.address.name} | {order.address.phone}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-caption text-gray-500">共 {order.items?.length || 0} 件商品</span>
                      <span className="text-caption text-gray-500">合计:</span>
                      <span className="text-title-small font-bold text-accent-orange">
                        ¥{Number(order.totalAmount).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {order.status === 'pending' && (
                      <Link href={`/checkout?orderId=${order.id}`}>
                        <Button variant="primary">
                          <CreditCardOutlined className="mr-1" />
                          立即支付
                        </Button>
                      </Link>
                    )}
                    <Link href={`/orders/${order.id}`}>
                      <Button variant="outline">
                        查看详情
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function OrdersPage() {
  return (
    <ProtectedRoute>
      <OrdersPageContent />
    </ProtectedRoute>
  )
}
