'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import AdminCard from '@/components/admin/AdminCard'
import AdminButton from '@/components/admin/AdminButton'
import Textarea from '@/components/client/Textarea'
import { Order } from '@/types'

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [shippingInfo, setShippingInfo] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchOrder(params.id as string)
    }
  }, [params.id])

  async function fetchOrder(id: string) {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/orders/${id}`)
      const data = await res.json()
      if (data.success) {
        setOrder(data.data)
        setStatus(data.data.status)
        setShippingInfo(data.data.shippingInfo || '')
      }
    } catch (error) {
      console.error('获取订单详情失败:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!order) return

    try {
      setSaving(true)
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          shippingInfo,
        }),
      })
      const data = await res.json()
      if (data.success) {
        alert('保存成功')
        await fetchOrder(order.id)
      } else {
        alert(data.error || '保存失败')
      }
    } catch (error) {
      console.error('保存订单失败:', error)
      alert('保存失败')
    } finally {
      setSaving(false)
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
    return <div className="text-center py-12">加载中...</div>
  }

  if (!order) {
    return <div className="text-center py-12">订单不存在</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-title-large font-title">订单详情</h1>
        <AdminButton variant="secondary" onClick={() => router.back()}>
          返回
        </AdminButton>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <AdminCard title="订单信息">
            <div className="space-y-2 text-body">
              <div className="flex justify-between">
                <span className="text-neutral-medium">订单号:</span>
                <span>{order.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-medium">用户:</span>
                <span>{order.user?.email || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-medium">订单状态:</span>
                <select
                  className="input"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="pending">待支付</option>
                  <option value="paid">已支付</option>
                  <option value="shipped">已发货</option>
                  <option value="delivered">已送达</option>
                  <option value="cancelled">已取消</option>
                </select>
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
          </AdminCard>

          <AdminCard title="商品列表">
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
          </AdminCard>

          <AdminCard title="物流信息">
            <Textarea
              label="物流信息"
              value={shippingInfo}
              onChange={(e) => setShippingInfo(e.target.value)}
              rows={4}
            />
            <div className="mt-4">
              <AdminButton variant="primary" onClick={handleSave} disabled={saving}>
                {saving ? '保存中...' : '保存'}
              </AdminButton>
            </div>
          </AdminCard>
        </div>

        <div>
          <AdminCard title="收货信息">
            {order.address && (
              <div className="space-y-2 text-body">
                <p><span className="text-neutral-medium">收货人:</span> {order.address.name}</p>
                <p><span className="text-neutral-medium">联系电话:</span> {order.address.phone}</p>
                <p className="text-neutral-medium">
                  {order.address.province} {order.address.city} {order.address.district} {order.address.detail}
                </p>
              </div>
            )}
          </AdminCard>

          <AdminCard title="订单金额" className="mt-6">
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
          </AdminCard>
        </div>
      </div>
    </div>
  )
}

