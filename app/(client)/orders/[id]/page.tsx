'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { message, Modal, Steps, Timeline } from 'antd'
import { 
  ShoppingOutlined, 
  CreditCardOutlined, 
  RocketOutlined, 
  CheckCircleOutlined,
  CloseCircleOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  UserOutlined,
  FileTextOutlined,
  CalendarOutlined,
  LeftOutlined
} from '@ant-design/icons'
import Card from '@/components/client/Card'
import Button from '@/components/client/Button'
import ProtectedRoute from '@/components/client/ProtectedRoute'
import { Order } from '@/types'

function OrderDetailPageContent() {
  const params = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [messageApi, contextHolder] = message.useMessage()

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
      pending: 'bg-yellow-500/10 border-yellow-500/20',
      paid: 'bg-blue-500/10 border-blue-500/20',
      shipped: 'bg-purple-500/10 border-purple-500/20',
      delivered: 'bg-green-500/10 border-green-500/20',
      cancelled: 'bg-red-500/10 border-red-500/20',
    }
    return map[status] || 'bg-gray-500/10 border-gray-500/20'
  }

  function getStepStatus(status: string) {
    const statusMap: Record<string, number> = {
      pending: 0,
      paid: 1,
      shipped: 2,
      delivered: 3,
      cancelled: -1,
    }
    return statusMap[status] || 0
  }

  async function handleCancelOrder(orderId: string) {
    try {
      setCancelling(true)
      const res = await fetch(`/api/client/orders/${orderId}/cancel`, {
        method: 'POST',
      })
      const data = await res.json()

      if (data.success) {
        messageApi.success('订单已取消')
        if (params.id) {
          fetchOrder(params.id as string)
        }
        setShowCancelModal(false)
      } else {
        messageApi.error(data.error || '取消订单失败')
      }
    } catch (error) {
      console.error('取消订单失败:', error)
      messageApi.error('取消订单失败')
    } finally {
      setCancelling(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-accent-orange border-t-transparent mb-4"></div>
          <p className="text-body text-neutral-medium">加载中...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FileTextOutlined className="text-6xl text-neutral-medium mb-4" />
          <p className="text-title-small mb-6">订单不存在</p>
          <Link href="/orders">
            <Button variant="primary" >返回订单列表</Button>
          </Link>
        </div>
      </div>
    )
  }

  const currentStep = getStepStatus(order.status)

  return (
    <div className="min-h-screen bg-[#f4f4f4] py-8">
      {contextHolder}
      
      {/* 顶部返回栏 */}
      <div className="max-w-7xl mx-auto px-6 mb-6">
        <Link href="/orders" className="inline-flex items-center gap-2 text-gray-700 hover:text-accent-orange transition-colors">
          <LeftOutlined />
          <span>返回订单列表</span>
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {/* 订单状态卡片 */}
        <Card className={`mb-6 border-2 ${getStatusBgColor(order.status)} bg-white`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-full ${getStatusBgColor(order.status)} flex items-center justify-center`}>
                {order.status === 'cancelled' ? (
                  <CloseCircleOutlined className={`text-3xl ${getStatusColor(order.status)}`} />
                ) : order.status === 'delivered' ? (
                  <CheckCircleOutlined className={`text-3xl ${getStatusColor(order.status)}`} />
                ) : (
                  <ShoppingOutlined className={`text-3xl ${getStatusColor(order.status)}`} />
                )}
              </div>
              <div>
                <h1 className={`text-2xl font-bold mb-1 ${getStatusColor(order.status)}`}>
                  {getStatusText(order.status)}
                </h1>
                <p className="text-caption text-gray-500">订单号: {order.orderNumber}</p>
              </div>
            </div>
            
            {/* 订单操作 */}
            {order.status === 'pending' && (
              <div className="flex gap-3">
                <Link href={`/checkout?orderId=${order.id}`}>
                  <Button variant="primary" size="large">
                    <CreditCardOutlined className="mr-2" />
                    立即支付
                  </Button>
                </Link>
                <Button variant="outline" size="large" onClick={() => setShowCancelModal(true)}>
                  取消订单
                </Button>
              </div>
            )}
          </div>

          {/* 订单进度 */}
          {order.status !== 'cancelled' && (
            <Steps
              current={currentStep}
              items={[
                {
                  title: <span className="text-gray-800">提交订单</span>,
                  icon: <ShoppingOutlined />,
                  description: order.createdAt ? <span className="text-gray-500">{new Date(order.createdAt).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span> : '',
                },
                {
                  title: <span className="text-gray-800">支付完成</span>,
                  icon: <CreditCardOutlined />,
                  description: '',
                },
                {
                  title: <span className="text-gray-800">商品发货</span>,
                  icon: <RocketOutlined />,
                  description: '',
                },
                {
                  title: <span className="text-gray-800">确认收货</span>,
                  icon: <CheckCircleOutlined />,
                  description: '',
                },
              ]}
              className="px-8"
            />
          )}
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧主要内容 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 商品列表 */}
            <Card className="bg-white">
              <h3 className="text-title-small font-bold mb-6 flex items-center gap-2 text-gray-800">
                <ShoppingOutlined className="text-accent-orange" />
                商品清单
              </h3>
              <div className="space-y-4">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
                    <div className="w-24 h-24 bg-white rounded-lg flex-shrink-0 overflow-hidden border border-gray-200">
                      {item.product?.image ? (
                        <img 
                          src={item.product.image} 
                          alt={item.product.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingOutlined className="text-3xl text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-body font-medium mb-2 truncate text-gray-800">{item.product?.name}</h4>
                      <p className="text-caption text-gray-500 mb-2">
                        {item.product?.description && (
                          <span className="line-clamp-1">{item.product.description}</span>
                        )}
                      </p>
                      <div className="flex items-center gap-4 text-caption">
                        <span className="text-gray-600">单价: ¥{Number(item.price).toFixed(2)}</span>
                        <span className="text-gray-400">×</span>
                        <span className="text-gray-600">数量: {item.quantity}</span>
                      </div>
                    </div>
                    <div className="text-right flex flex-col justify-between">
                      <p className="text-title-small font-bold text-accent-orange">
                        ¥{(Number(item.price) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* 金额汇总 */}
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                <div className="flex justify-between text-body">
                  <span className="text-gray-600">商品总额</span>
                  <span className="text-gray-800">¥{Number(order.totalAmount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-body">
                  <span className="text-gray-600">运费</span>
                  <span className="text-gray-800">¥0.00</span>
                </div>
                <div className="flex justify-between text-title-medium font-bold pt-3 border-t border-gray-200">
                  <span className="text-gray-800">订单总额</span>
                  <span className="text-accent-orange text-2xl">¥{Number(order.totalAmount).toFixed(2)}</span>
                </div>
              </div>
            </Card>

            {/* 订单信息 */}
            <Card className="bg-white">
              <h3 className="text-title-small font-bold mb-6 flex items-center gap-2 text-gray-800">
                <FileTextOutlined className="text-accent-orange" />
                订单信息
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <FileTextOutlined className="text-xl text-accent-orange mt-1" />
                  <div>
                    <p className="text-caption text-gray-500 mb-1">订单号</p>
                    <p className="text-body font-mono text-gray-800">{order.orderNumber}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <CalendarOutlined className="text-xl text-accent-orange mt-1" />
                  <div>
                    <p className="text-caption text-gray-500 mb-1">下单时间</p>
                    <p className="text-body text-gray-800">{new Date(order.createdAt).toLocaleString('zh-CN')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <CreditCardOutlined className="text-xl text-accent-orange mt-1" />
                  <div>
                    <p className="text-caption text-gray-500 mb-1">支付状态</p>
                    <p className="text-body text-gray-800">{order.paymentStatus === 'paid' ? '已支付' : '未支付'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <CheckCircleOutlined className="text-xl text-accent-orange mt-1" />
                  <div>
                    <p className="text-caption text-gray-500 mb-1">订单状态</p>
                    <p className={`text-body font-medium ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* 右侧信息栏 */}
          <div className="space-y-6">
            {/* 收货信息 */}
            <Card className="bg-white">
              <h3 className="text-title-small font-bold mb-6 flex items-center gap-2 text-gray-800">
                <EnvironmentOutlined className="text-accent-orange" />
                收货信息
              </h3>
              {order.address ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <UserOutlined className="text-lg text-gray-400 mt-1" />
                    <div className="flex-1">
                      <p className="text-caption text-gray-500">收货人</p>
                      <p className="text-body font-medium text-gray-800">{order.address.name}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <PhoneOutlined className="text-lg text-gray-400 mt-1" />
                    <div className="flex-1">
                      <p className="text-caption text-gray-500">联系电话</p>
                      <p className="text-body font-medium text-gray-800">{order.address.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <EnvironmentOutlined className="text-lg text-gray-400 mt-1" />
                    <div className="flex-1">
                      <p className="text-caption text-gray-500">收货地址</p>
                      <p className="text-body leading-relaxed text-gray-800">
                        {order.address.province} {order.address.city} {order.address.district}
                        <br />
                        {order.address.detail}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">暂无收货信息</p>
              )}
            </Card>

            {/* 物流信息 */}
            {order.shippingInfo && (
              <Card className="bg-white">
                <h3 className="text-title-small font-bold mb-6 flex items-center gap-2 text-gray-800">
                  <RocketOutlined className="text-accent-orange" />
                  物流信息
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-body leading-relaxed text-gray-800">{order.shippingInfo}</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* 取消订单确认弹窗 */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <CloseCircleOutlined className="text-red-500" />
            <span>确认取消订单</span>
          </div>
        }
        open={showCancelModal}
        onOk={() => order && handleCancelOrder(order.id)}
        onCancel={() => setShowCancelModal(false)}
        okText="确认取消"
        cancelText="暂不取消"
        okButtonProps={{ danger: true, loading: cancelling }}
      >
        <div className="py-4">
          <p className="text-body mb-4">确定要取消这个订单吗？取消后无法恢复。</p>
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
            <p className="text-caption text-neutral-medium mb-1">订单号</p>
            <p className="text-body font-mono">{order?.orderNumber}</p>
            <p className="text-caption text-neutral-medium mt-3 mb-1">订单金额</p>
            <p className="text-body font-bold text-accent-orange">¥{Number(order?.totalAmount).toFixed(2)}</p>
          </div>
        </div>
      </Modal>
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

