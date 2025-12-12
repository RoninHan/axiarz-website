'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Card from '@/components/client/Card'
import Button from '@/components/client/Button'
import ProtectedRoute from '@/components/client/ProtectedRoute'
import { Order } from '@/types'

function OrderDetailPageContent() {
  const params = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchOrder(params.id as string)
    }
  }, [params.id])

  async function fetchOrder(id: string) {
    try {
      setLoading(true)
      const res = await fetch(`/api/client/orders/${id}`)
      const data = await res.json()
      if (data.success) {
        setOrder(data.data)
      }
    } catch (error) {
      console.error('获取订单详情失败:', error)
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

  if (loading) {
    return <div className="container mx-auto px-6 py-12 text-center">加载中...</div>
  }

  if (!order) {
    return <div className="container mx-auto px-6 py-12 text-center">订单不存在</div>
  }

  return (
    <div className="container mx-auto px-6 py-12 max-w-[1920px]">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-title-large font-title">订单详情</h1>
        <Link href="/orders">
          <Button variant="outline">返回订单列表</Button>
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 space-y-6">
          {/* 订单信息 */}
          <Card>
            <h3 className="text-title-small font-title mb-4">订单信息</h3>
            <div className="space-y-2 text-body">
              <div className="flex justify-between">
                <span className="text-neutral-medium">订单号:</span>
                <span>{order.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-medium">订单状态:</span>
                <span>{getStatusText(order.status)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-medium">支付状态:</span>
                <span>{order.paymentStatus === 'paid' ? '已支付' : '未支付'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-medium">下单时间:</span>
                <span>{new Date(order.createdAt).toLocaleString('zh-CN')}</span>
              </div>
            </div>
          </Card>

          {/* 商品列表 */}
          <Card>
            <h3 className="text-title-small font-title mb-4">商品列表</h3>
            <div className="space-y-4">
              {order.items?.map((item) => (
                <div key={item.id} className="flex gap-4 pb-4 border-b border-neutral-medium last:border-0">
                  <div className="w-20 h-20 bg-neutral-medium rounded-default flex-shrink-0">
                    {item.product?.image ? (
                      <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover rounded-default" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-caption text-neutral-medium">图片</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-body font-medium">{item.product?.name}</h4>
                    <p className="text-caption text-neutral-medium mt-1">
                      数量: {item.quantity} × ¥{Number(item.price).toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-body font-medium">
                      ¥{(Number(item.price) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div>
          <Card>
            <h3 className="text-title-small font-title mb-4">收货信息</h3>
            {order.address && (
              <div className="space-y-2 text-body">
                <p><span className="text-neutral-medium">收货人:</span> {order.address.name}</p>
                <p><span className="text-neutral-medium">联系电话:</span> {order.address.phone}</p>
                <p className="text-neutral-medium">
                  {order.address.province} {order.address.city} {order.address.district} {order.address.detail}
                </p>
              </div>
            )}
            {order.shippingInfo && (
              <div className="mt-4 pt-4 border-t border-neutral-medium">
                <h4 className="text-body font-medium mb-2">物流信息</h4>
                <p className="text-body text-neutral-medium">{order.shippingInfo}</p>
              </div>
            )}
          </Card>

          <Card className="mt-6">
            <h3 className="text-title-small font-title mb-4">订单金额</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-body">
                <span>商品总额</span>
                <span>¥{Number(order.totalAmount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-body">
                <span>运费</span>
                <span>¥0.00</span>
              </div>
              <div className="border-t border-neutral-medium pt-2 flex justify-between text-title-small font-title">
                <span>总计</span>
                <span className="text-accent-orange">¥{Number(order.totalAmount).toFixed(2)}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function OrderDetailPage() {
  return (
    <ProtectedRoute>
      <OrderDetailPageContent />
    </ProtectedRoute>
  )
}

