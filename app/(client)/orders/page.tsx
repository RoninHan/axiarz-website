'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Card from '@/components/client/Card'
import ProtectedRoute from '@/components/client/ProtectedRoute'
import { Order } from '@/types'

function OrdersPageContent() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

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
      pending: 'text-yellow-600',
      paid: 'text-blue-600',
      shipped: 'text-purple-600',
      delivered: 'text-green-600',
      cancelled: 'text-red-600',
    }
    return map[status] || ''
  }

  if (loading) {
    return <div className="container mx-auto px-6 py-12 text-center">加载中...</div>
  }

  return (
    <div className="container mx-auto px-6 py-12 max-w-[1920px]">
      <h1 className="text-title-large font-title mb-8">我的订单</h1>

      {orders.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-body text-neutral-medium mb-4">暂无订单</p>
          <Link href="/products">
            <button className="btn-primary">去购物</button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <Link href={`/client/orders/${order.id}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-4 mb-2">
                      <span className="text-body font-medium">订单号: {order.orderNumber}</span>
                      <span className={`text-body ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                    <p className="text-caption text-neutral-medium">
                      下单时间: {new Date(order.createdAt).toLocaleString('zh-CN')}
                    </p>
                    {order.address && (
                      <p className="text-caption text-neutral-medium mt-1">
                        收货地址: {order.address.province} {order.address.city} {order.address.district} {order.address.detail}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-title-small font-title text-accent-orange">
                      ¥{Number(order.totalAmount).toFixed(2)}
                    </p>
                    <p className="text-caption text-neutral-medium mt-1">
                      {order.items?.length || 0} 件商品
                    </p>
                  </div>
                </div>
              </Link>
            </Card>
          ))}
        </div>
      )}
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

