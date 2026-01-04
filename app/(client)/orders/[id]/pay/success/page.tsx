'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { CheckCircleOutlined, LoadingOutlined } from '@ant-design/icons'
import Button from '@/components/client/Button'
import Card from '@/components/client/Card'
import ProtectedRoute from '@/components/client/ProtectedRoute'
import { Order } from '@/types'

function PaymentSuccessPageContent() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState(true)

  useEffect(() => {
    if (params.id) {
      verifyPayment(params.id as string)
    }
  }, [params.id])

  async function verifyPayment(orderId: string) {
    try {
      setVerifying(true)

      // 获取支付宝返回的参数
      const alipayParams: Record<string, string> = {}
      searchParams.forEach((value, key) => {
        alipayParams[key] = value
      })

      console.log('📥 支付宝返回参数:', alipayParams)

      // 如果有支付宝返回的参数，先验证签名
      if (alipayParams.out_trade_no || alipayParams.trade_no) {
        console.log('✅ 检测到支付宝返回参数，开始验证...')
        try {
          // 调用后端验证支付宝签名并更新订单状态
          const verifyRes = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ params: alipayParams, orderId })
          })
          const verifyData = await verifyRes.json()
          console.log('📋 支付验证结果:', verifyData)
          
          if (verifyData.success) {
            console.log('✅ 支付验证成功')
          } else {
            console.warn('⚠️ 支付验证失败:', verifyData.error)
          }
        } catch (error) {
          console.error('❌ 支付验证请求失败:', error)
        }
      } else {
        console.log('ℹ️ 未检测到支付宝返回参数（可能从其他页面直接访问）')
      }

      // 等待一下让后端处理完成
      await new Promise(resolve => setTimeout(resolve, 1500))

      // 获取订单最新状态
      const res = await fetch(`/api/client/orders/${orderId}`)
      const data = await res.json()

      if (data.success) {
        setOrder(data.data)
      }
    } catch (error) {
      console.error('支付验证失败:', error)
    } finally {
      setVerifying(false)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-light">
        <Card className="text-center p-12 max-w-md">
          <LoadingOutlined className="text-4xl text-accent-orange mb-6" />
          <h2 className="text-title-large font-title text-primary-black mb-4">
            正在验证支付结果...
          </h2>
          <p className="text-body text-neutral-medium">
            请稍候，我们正在确认您的支付状态
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-light">
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <Card className="text-center p-12">
          {verifying ? (
            <>
              <LoadingOutlined className="text-4xl text-accent-orange mb-6" />
              <h2 className="text-title-large font-title text-primary-black mb-4">
                正在验证支付结果...
              </h2>
              <p className="text-body text-neutral-medium">
                请稍候，我们正在确认您的支付状态
              </p>
            </>
          ) : order?.status === 'paid' || order?.paymentStatus === 'paid' ? (
            <>
              <CheckCircleOutlined className="text-6xl text-green-500 mb-6" />
              <h2 className="text-title-large font-title text-primary-black mb-4">
                支付成功！
              </h2>
              <p className="text-body text-neutral-medium mb-8">
                您的订单已支付成功，我们将尽快为您发货
              </p>

              <div className="space-y-4">
                <div className="bg-neutral-light p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-body text-neutral-dark">订单号</span>
                    <span className="text-body font-medium text-primary-black">
                      {order.orderNumber}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-body text-neutral-dark">支付金额</span>
                    <span className="text-title-small font-medium text-accent-orange">
                      ¥{Number(order.totalAmount).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-4 justify-center">
                  <Button
                    variant="primary"
                    onClick={() => router.push(`/orders/${params.id}`)}
                  >
                    查看订单详情
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push('/orders')}
                  >
                    返回订单列表
                  </Button>
                </div>
              </div>
            </>
          ) : order?.status === 'pending' ? (
            <>
              <div className="text-6xl text-yellow-500 mb-6">⏳</div>
              <h2 className="text-title-large font-title text-primary-black mb-4">
                支付处理中
              </h2>
              <p className="text-body text-neutral-medium mb-8">
                您的支付正在处理中，请稍候刷新页面查看支付结果
              </p>

              <div className="flex gap-4 justify-center">
                <Button
                  variant="primary"
                  onClick={() => window.location.reload()}
                >
                  刷新页面
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push(`/orders/${params.id}`)}
                >
                  查看订单详情
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="text-6xl text-red-500 mb-6">❌</div>
              <h2 className="text-title-large font-title text-primary-black mb-4">
                支付验证失败
              </h2>
              <p className="text-body text-neutral-medium mb-8">
                您的支付可能还未完成，请检查支付状态或重新支付
              </p>

              <div className="flex gap-4 justify-center">
                <Button
                  variant="primary"
                  onClick={() => router.push(`/orders/${params.id}/pay`)}
                >
                  重新支付
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/orders')}
                >
                  返回订单列表
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <ProtectedRoute>
      <PaymentSuccessPageContent />
    </ProtectedRoute>
  )
}
