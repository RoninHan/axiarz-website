'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import AdminCard from '@/components/admin/AdminCard'
import AdminButton from '@/components/admin/AdminButton'
import Input from '@/components/client/Input'
import { Order } from '@/types'

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [orderNumber, setOrderNumber] = useState('')

  useEffect(() => {
    fetchOrders()
  }, [statusFilter])

  async function fetchOrders() {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter) params.append('status', statusFilter)
      if (orderNumber) params.append('orderNumber', orderNumber)

      const res = await fetch(`/api/admin/orders?${params}`)
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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-title-large font-title">订单管理</h1>
      </div>

      <AdminCard>
        <div className="flex gap-4 mb-6">
          <Input
            placeholder="搜索订单号..."
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            className="flex-1"
          />
          <select
            className="input"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">全部状态</option>
            <option value="pending">待支付</option>
            <option value="paid">已支付</option>
            <option value="shipped">已发货</option>
            <option value="delivered">已送达</option>
            <option value="cancelled">已取消</option>
          </select>
          <AdminButton onClick={fetchOrders}>搜索</AdminButton>
        </div>

        {loading ? (
          <div className="text-center py-12">加载中...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-medium">
                  <th className="text-left py-3 px-4 text-body font-medium">订单号</th>
                  <th className="text-left py-3 px-4 text-body font-medium">用户</th>
                  <th className="text-left py-3 px-4 text-body font-medium">金额</th>
                  <th className="text-left py-3 px-4 text-body font-medium">状态</th>
                  <th className="text-left py-3 px-4 text-body font-medium">下单时间</th>
                  <th className="text-left py-3 px-4 text-body font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-neutral-medium">
                    <td className="py-3 px-4 text-body">{order.orderNumber}</td>
                    <td className="py-3 px-4 text-body">{order.user?.email || '-'}</td>
                    <td className="py-3 px-4 text-body">¥{Number(order.totalAmount).toFixed(2)}</td>
                    <td className="py-3 px-4 text-body">{getStatusText(order.status)}</td>
                    <td className="py-3 px-4 text-body text-caption">
                      {new Date(order.createdAt).toLocaleString('zh-CN')}
                    </td>
                    <td className="py-3 px-4">
                      <Link href={`/admin/orders/${order.id}`}>
                        <AdminButton variant="secondary">查看</AdminButton>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>
    </div>
  )
}

