'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { message, Descriptions, Tag, Table, Button, Modal, Select, Input, Steps, Spin } from 'antd'
import { ArrowLeftOutlined, SendOutlined } from '@ant-design/icons'
import Link from 'next/link'
import AdminCard from '@/components/admin/AdminCard'
import DownloadContractButton from '@/components/DownloadContractButton'

export default function OrderDetailPage() {
  const params = useParams()
  const orderId = params.id as string
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [shippingModal, setShippingModal] = useState(false)
  const [companies, setCompanies] = useState<any[]>([])
  const [form, setForm] = useState({ courierCompanyId: '', shippingInfo: '' })

  useEffect(() => {
    loadOrder()
    loadCompanies()
  }, [orderId])

  const loadOrder = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/orders/' + orderId)
      const data = await res.json()
      if (data.success) setOrder(data.data)
      else message.error(data.error || '获取订单失败')
    } catch (error) {
      message.error('获取订单失败')
    } finally {
      setLoading(false)
    }
  }

  const loadCompanies = async () => {
    try {
      const res = await fetch('/api/admin/courier-companies?status=active')
      const data = await res.json()
      if (data.success) setCompanies(data.data)
    } catch (error) {
      console.error(error)
    }
  }

  const handleShip = async () => {
    if (!form.courierCompanyId || !form.shippingInfo.trim()) {
      message.error('请选择物流公司并填写物流单号')
      return
    }
    try {
      const res = await fetch('/api/admin/orders/' + orderId, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'shipped', ...form })
      })
      const data = await res.json()
      if (data.success) {
        message.success('发货成功')
        setShippingModal(false)
        loadOrder()
      } else {
        message.error(data.error || '发货失败')
      }
    } catch (error) {
      message.error('发货失败')
    }
  }

  const handleCancel = () => {
    Modal.confirm({
      title: '确认取消订单',
      content: '取消后无法恢复，确定要取消吗？',
      okText: '确定',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        try {
          const res = await fetch('/api/admin/orders/' + orderId, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'cancelled' })
          })
          const data = await res.json()
          if (data.success) {
            message.success('订单已取消')
            loadOrder()
          } else {
            message.error(data.error || '取消失败')
          }
        } catch (error) {
          message.error('取消失败')
        }
      }
    })
  }

  const columns = [
    {
      title: '商品',
      key: 'product',
      render: (_: any, record: any) => (
        <div className="flex items-center gap-3">
          {record.product.image && (
            <img src={record.product.image} alt={record.product.name} className="w-16 h-16 object-cover rounded" />
          )}
          <div>
            <div className="font-medium">{record.product.name}</div>
            {record.product.sku && <div className="text-xs text-gray-500">SKU: {record.product.sku}</div>}
          </div>
        </div>
      )
    },
    { title: '单价', dataIndex: 'price', key: 'price', width: 100, render: (v: string) => '¥' + Number(v).toFixed(2) },
    { title: '数量', dataIndex: 'quantity', key: 'quantity', width: 80 },
    { title: '小计', key: 'subtotal', width: 100, render: (_: any, r: any) => '¥' + (Number(r.price) * r.quantity).toFixed(2) }
  ]

  if (loading) return <div className="flex items-center justify-center h-96"><Spin size="large" /></div>
  if (!order) return <div className="text-center py-16"><p className="text-gray-500">订单不存在</p></div>

  const statusMap: any = {
    pending: { color: 'orange', text: '待支付', step: 0 },
    paid: { color: 'blue', text: '已支付', step: 1 },
    shipped: { color: 'cyan', text: '已发货', step: 2 },
    delivered: { color: 'green', text: '已送达', step: 3 },
    cancelled: { color: 'red', text: '已取消', step: -1 }
  }
  const paymentMap: any = {
    unpaid: { color: 'orange', text: '未支付' },
    paid: { color: 'green', text: '已支付' },
    refunded: { color: 'purple', text: '已退款' }
  }

  const status = statusMap[order.status] || { color: 'default', text: order.status, step: 0 }
  const payment = paymentMap[order.paymentStatus] || { color: 'default', text: order.paymentStatus }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/admin/orders">
            <Button icon={<ArrowLeftOutlined />} className="mb-4">返回列表</Button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">订单详情</h1>
              <p className="text-gray-600 mt-1">订单号: {order.orderNumber}</p>
            </div>
            <div className="flex gap-2">
              <DownloadContractButton 
                orderId={order.id} 
                orderNumber={order.orderNumber}
                isAdmin={true}
                buttonText="下载合同"
                type="default"
                size="large"
              />
              {order.status === 'paid' && (
                <Button 
                  type="primary" 
                  icon={<SendOutlined />} 
                  size="large"
                  onClick={() => {
                    setForm({ courierCompanyId: order.courierCompanyId || '', shippingInfo: order.shippingInfo || '' })
                    setShippingModal(true)
                  }}
                >
                  发货
                </Button>
              )}
              {(order.status === 'pending' || order.status === 'paid') && (
                <Button danger size="large" onClick={handleCancel}>取消订单</Button>
              )}
            </div>
          </div>
        </div>

        <AdminCard title="订单状态" className="mb-6">
          <Steps 
            current={status.step} 
            status={order.status === 'cancelled' ? 'error' : 'process'}
            items={[
              { title: '待支付' },
              { title: '已支付' },
              { title: '已发货' },
              { title: '已送达' }
            ]}
          />
          {order.status === 'cancelled' && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-700">订单已取消</div>
          )}
        </AdminCard>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <AdminCard title="商品信息">
              <Table columns={columns} dataSource={order.items} rowKey="id" pagination={false} />
              <div className="mt-4 pt-4 border-t flex justify-end">
                <div className="w-64 space-y-2">
                  {order.originalAmount && Number(order.originalAmount) > Number(order.totalAmount) && (
                    <>
                      <div className="flex justify-between text-gray-600">
                        <span>原价:</span>
                        <span>¥{Number(order.originalAmount).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-green-600">
                        <span>优惠:</span>
                        <span>-¥{Number(order.discountAmount || 0).toFixed(2)}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between text-lg font-bold">
                    <span>订单总额:</span>
                    <span className="text-blue-600">¥{Number(order.totalAmount).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </AdminCard>

            {(order.courierCompany || order.shippingInfo) && (
              <AdminCard title="物流信息">
                <Descriptions column={2}>
                  <Descriptions.Item label="物流公司">{order.courierCompany?.name || '-'}</Descriptions.Item>
                  <Descriptions.Item label="客服电话">{order.courierCompany?.phone || '-'}</Descriptions.Item>
                  <Descriptions.Item label="物流单号" span={2}>
                    <span className="font-mono">{order.shippingInfo || '-'}</span>
                  </Descriptions.Item>
                </Descriptions>
              </AdminCard>
            )}

            <AdminCard title="收货地址">
              <Descriptions column={2}>
                <Descriptions.Item label="收货人">{order.address.name}</Descriptions.Item>
                <Descriptions.Item label="联系电话">{order.address.phone}</Descriptions.Item>
                <Descriptions.Item label="收货地址" span={2}>
                  {order.address.province} {order.address.city} {order.address.district} {order.address.detail}
                </Descriptions.Item>
              </Descriptions>
            </AdminCard>
          </div>

          <div className="space-y-6">
            <AdminCard title="订单信息">
              <Descriptions column={1} size="small">
                <Descriptions.Item label="订单状态">
                  <Tag color={status.color}>{status.text}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="支付状态">
                  <Tag color={payment.color}>{payment.text}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="支付方式">
                  {order.paymentMethod === 'wallet' ? '钱包余额' : order.paymentMethod || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="创建时间">
                  {new Date(order.createdAt).toLocaleString('zh-CN')}
                </Descriptions.Item>
                <Descriptions.Item label="更新时间">
                  {new Date(order.updatedAt).toLocaleString('zh-CN')}
                </Descriptions.Item>
              </Descriptions>
            </AdminCard>

            <AdminCard title="用户信息">
              <Descriptions column={1} size="small">
                <Descriptions.Item label="用户名">{order.user.name || '-'}</Descriptions.Item>
                <Descriptions.Item label="邮箱">{order.user.email}</Descriptions.Item>
                <Descriptions.Item label="手机">{order.user.phone || '-'}</Descriptions.Item>
              </Descriptions>
            </AdminCard>
          </div>
        </div>

        <Modal 
          title="发货" 
          open={shippingModal} 
          onOk={handleShip} 
          onCancel={() => setShippingModal(false)}
          okText="确认发货"
          cancelText="取消"
        >
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                物流公司 <span className="text-red-500">*</span>
              </label>
              <Select 
                style={{ width: '100%' }} 
                placeholder="请选择物流公司"
                value={form.courierCompanyId || undefined}
                onChange={(value) => setForm({ ...form, courierCompanyId: value })}
              >
                {companies.map(c => (
                  <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
                ))}
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                物流单号 <span className="text-red-500">*</span>
              </label>
              <Input 
                placeholder="请输入物流单号"
                value={form.shippingInfo}
                onChange={(e) => setForm({ ...form, shippingInfo: e.target.value })}
              />
            </div>
          </div>
        </Modal>
      </div>
    </div>
  )
}
