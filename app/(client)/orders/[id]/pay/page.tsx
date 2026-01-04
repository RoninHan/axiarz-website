'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { message } from 'antd'
import { ArrowLeftOutlined, CreditCardOutlined, CheckCircleOutlined } from '@ant-design/icons'
import Button from '@/components/client/Button'
import Card from '@/components/client/Card'
import ProtectedRoute from '@/components/client/ProtectedRoute'
import { formatCurrency } from '@/lib/utils'
import { Order, PaymentConfig } from '@/types'

function OrderPaymentPageContent() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [paymentMethods, setPaymentMethods] = useState<PaymentConfig[]>([])
  const [selectedPayment, setSelectedPayment] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [paymentFormHtml, setPaymentFormHtml] = useState<string | null>(null)
  const [messageApi, contextHolder] = message.useMessage()

  useEffect(() => {
    if (params.id) {
      fetchOrder(params.id as string)
      fetchPaymentMethods()
    }
  }, [params.id, messageApi, router])

  // 处理支付表单自动提交
  useEffect(() => {
    if (paymentFormHtml && typeof window !== 'undefined') {
      // 创建一个临时的div来插入支付表单
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = paymentFormHtml
      tempDiv.style.display = 'none'
      document.body.appendChild(tempDiv)

      // 找到表单并提交
      const form = tempDiv.querySelector('form')
      if (form) {
        // 短暂延迟后提交，让用户看到提示信息
        setTimeout(() => {
          form.submit()
        }, 1000)
      }

      // 清理临时元素
      return () => {
        if (tempDiv.parentNode) {
          tempDiv.parentNode.removeChild(tempDiv)
        }
      }
    }
  }, [paymentFormHtml])

  async function fetchOrder(id: string) {
    try {
      const res = await fetch(`/api/client/orders/${id}`)
      const data = await res.json()
      if (data.success) {
        setOrder(data.data)
        // 检查订单状态
        if (data.data.status !== 'pending') {
          messageApi.warning('订单状态不允许支付')
          router.push(`/orders/${id}`)
        }
      } else {
        messageApi.error(data.error || '获取订单失败')
        router.push('/orders')
      }
    } catch (error) {
      console.error('获取订单失败:', error)
      messageApi.error('获取订单失败')
      router.push('/orders')
    } finally {
      setLoading(false)
    }
  }

  async function fetchPaymentMethods() {
    try {
      const res = await fetch('/api/client/payment-methods')
      const data = await res.json()
      if (data.success) {
        setPaymentMethods(data.data)
        // 默认选择第一个启用的支付方式
        const defaultPayment = data.data.find((p: PaymentConfig) => p.enabled)
        if (defaultPayment) {
          setSelectedPayment(defaultPayment.name)
        }
      }
    } catch (error) {
      console.error('获取支付方式失败:', error)
    }
  }

  async function handlePayment() {
    if (!selectedPayment) {
      messageApi.error('请选择支付方式')
      return
    }

    try {
      setPaying(true)

      const res = await fetch(`/api/client/orders/${params.id}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod: selectedPayment
        }),
      })

      const data = await res.json()

      if (data.success) {
        if (selectedPayment === 'alipay' && data.data.paymentUrl) {
          // 支付宝支付：显示支付表单并自动提交
          messageApi.info('正在准备支付宝支付...')
          setPaymentFormHtml(data.data.paymentUrl)
          // 表单会在useEffect中自动提交
        } else if (selectedPayment === 'wechat' && data.data.qrCode) {
          // 微信支付：显示二维码（暂未实现）
          messageApi.error('微信支付暂未实现')
        } else {
          // 其他支付方式
          messageApi.error('不支持的支付方式')
        }
      } else {
        messageApi.error(data.error || '支付失败')
      }
    } catch (error) {
      console.error('支付失败:', error)
      messageApi.error('支付失败，请重试')
    } finally {
      setPaying(false)
    }
  }

  function getPaymentIcon(name: string) {
    if (name.includes('alipay')) return '💰'
    if (name.includes('wechat')) return '💚'
    return '💳'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-orange mx-auto mb-4"></div>
          <p className="text-body text-neutral-medium">加载中...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-body text-neutral-medium">订单不存在</p>
          <Button onClick={() => router.push('/orders')} className="mt-4">
            返回订单列表
          </Button>
        </div>
      </div>
    )
  }

  // 如果有支付表单HTML，显示支付处理界面
  if (paymentFormHtml) {
    return (
      <div className="min-h-screen bg-neutral-light flex items-center justify-center">
        <Card className="text-center p-8 max-w-md">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CreditCardOutlined className="text-3xl text-white" />
          </div>
          <h2 className="text-title-large font-title text-primary-black mb-4">
            正在跳转到支付宝...
          </h2>
          <p className="text-body text-neutral-medium mb-6">
            请稍候，正在为您跳转到支付宝安全支付页面
          </p>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-orange"></div>
          </div>
          <p className="text-caption text-neutral-medium mt-4">
            如果长时间未跳转，请刷新页面重试
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-light">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {contextHolder}

        {/* 页面头部 */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              onClick={() => router.push(`/orders/${params.id}`)}
              className="flex items-center gap-2"
            >
              <ArrowLeftOutlined />
              返回订单详情
            </Button>
          </div>

          <div className="text-center">
            <h1 className="text-title-large font-title text-primary-black mb-2">
              订单支付
            </h1>
            <p className="text-body text-neutral-medium">
              订单号：{order.orderNumber}
            </p>
          </div>
        </div>

        {/* 订单金额 */}
        <Card className="mb-8">
          <div className="text-center">
            <div className="text-caption text-neutral-medium mb-2">支付金额</div>
            <div className="text-4xl font-bold text-accent-orange mb-4">
              {formatCurrency(order.totalAmount)}
            </div>
            <div className="text-body text-neutral-medium">
              请在 <span className="text-accent-orange font-medium">30分钟</span> 内完成支付
            </div>
          </div>
        </Card>

        {/* 支付方式选择 */}
        <Card className="mb-8">
          <h3 className="text-title-small font-title text-primary-black mb-6 flex items-center gap-2">
            <CreditCardOutlined />
            选择支付方式
          </h3>

          <div className="space-y-4">
            {paymentMethods.map((payment) => (
              <label
                key={payment.name}
                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedPayment === payment.name
                    ? 'border-accent-orange bg-orange-50'
                    : 'border-neutral-medium hover:border-accent-orange/50'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value={payment.name}
                  checked={selectedPayment === payment.name}
                  onChange={(e) => setSelectedPayment(e.target.value)}
                  className="mr-4"
                />
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-2xl">{getPaymentIcon(payment.name)}</span>
                  <div>
                    <div className="text-body font-medium text-primary-black">
                      {payment.displayName}
                    </div>
                    <div className="text-caption text-neutral-medium">
                      支持在线支付，安全快捷
                    </div>
                  </div>
                </div>
                {payment.enabled && (
                  <CheckCircleOutlined className="text-accent-orange text-lg" />
                )}
              </label>
            ))}

            {paymentMethods.length === 0 && (
              <div className="text-center py-8 text-neutral-medium">
                暂无可用的支付方式
              </div>
            )}
          </div>
        </Card>

        {/* 订单信息确认 */}
        <Card className="mb-8">
          <h3 className="text-title-small font-title text-primary-black mb-4">
            订单信息确认
          </h3>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-body text-neutral-dark">商品总价</span>
              <span className="text-body text-primary-black">¥{Number(order.totalAmount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-body text-neutral-dark">运费</span>
              <span className="text-body text-primary-black">¥0.00</span>
            </div>
            <div className="border-t border-neutral-medium pt-3 flex justify-between">
              <span className="text-title-small font-medium text-primary-black">应付金额</span>
              <span className="text-title-small font-medium text-accent-orange">
                ¥{Number(order.totalAmount).toFixed(2)}
              </span>
            </div>
          </div>
        </Card>

        {/* 支付按钮 */}
        <div className="text-center">
          <Button
            variant="primary"
            onClick={handlePayment}
            disabled={paying || !selectedPayment}
            className="w-full max-w-md text-lg py-4"
          >
            {paying ? '支付中...' : `立即支付 ¥${Number(order.totalAmount).toFixed(2)}`}
          </Button>

          <p className="text-caption text-neutral-medium mt-4">
            点击&quot;立即支付&quot;即表示您同意我们的支付协议
          </p>
        </div>
      </div>
    </div>
  )
}

export default function OrderPaymentPage() {
  return (
    <ProtectedRoute>
      <OrderPaymentPageContent />
    </ProtectedRoute>
  )
}
