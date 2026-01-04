'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { message, Steps } from 'antd'
import { 
  EnvironmentOutlined, 
  CreditCardOutlined, 
  CheckCircleOutlined,
  PlusOutlined,
  EditOutlined,
  SafetyOutlined,
  ShoppingCartOutlined,
  LeftOutlined
} from '@ant-design/icons'
import Link from 'next/link'
import Button from '@/components/client/Button'
import Card from '@/components/client/Card'
import Input from '@/components/client/Input'
import ProtectedRoute from '@/components/client/ProtectedRoute'
import { Address, PaymentConfig, Order } from '@/types'

function CheckoutPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId') // 如果从订单详情页跳转过来，会有orderId
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string>('')
  const [paymentMethods, setPaymentMethods] = useState<PaymentConfig[]>([])
  const [selectedPayment, setSelectedPayment] = useState<string>('')
  const [order, setOrder] = useState<Order | null>(null) // 存储订单信息
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [messageApi, contextHolder] = message.useMessage()

  useEffect(() => {
    fetchAddresses()
    fetchPaymentMethods()
    if (orderId) {
      fetchOrder(orderId)
    }
  }, [orderId])

  async function fetchAddresses() {
    try {
      const res = await fetch('/api/client/addresses')
      const data = await res.json()
      if (data.success) {
        setAddresses(data.data)
        const defaultAddr = data.data.find((a: Address) => a.isDefault)
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id)
        } else if (data.data.length > 0) {
          setSelectedAddressId(data.data[0].id)
        }
      }
    } catch (error) {
      console.error('获取地址失败:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchPaymentMethods() {
    try {
      const res = await fetch('/api/client/payment-methods')
      const data = await res.json()
      if (data.success) {
        const enabled = data.data.filter((p: PaymentConfig) => p.enabled)
        setPaymentMethods(enabled.sort((a: PaymentConfig, b: PaymentConfig) => a.sortOrder - b.sortOrder))
        if (enabled.length > 0) {
          setSelectedPayment(enabled[0].name) // 使用 name 而不是 id
        }
      }
    } catch (error) {
      console.error('获取支付方式失败:', error)
    }
  }

  async function fetchOrder(id: string) {
    try {
      const res = await fetch(`/api/client/orders/${id}`)
      const data = await res.json()
      if (data.success) {
        setOrder(data.data)
        // 如果订单有地址，自动选择该地址
        if (data.data.addressId) {
          setSelectedAddressId(data.data.addressId)
        }
        // 如果订单有支付方式，自动选择该支付方式
        if (data.data.paymentMethod) {
          setSelectedPayment(data.data.paymentMethod)
        }
      }
    } catch (error) {
      console.error('获取订单信息失败:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit() {
    if (!selectedAddressId) {
      messageApi.warning('请选择收货地址')
      return
    }
    if (!selectedPayment) {
      messageApi.warning('请选择支付方式')
      return
    }

    try {
      setSubmitting(true)
      
      // 如果是从订单详情页跳转过来（已有订单），直接发起支付
      if (orderId) {
        // 调用支付API
        const payRes = await fetch(`/api/client/orders/${orderId}/pay`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentMethod: selectedPayment,
          }),
        })
        const payData = await payRes.json()
        
        if (payData.success && payData.data.paymentUrl) {
          messageApi.success('正在跳转到支付页面...')
          // 支付宝返回的是HTML表单，需要在新页面中渲染
          // 创建一个新窗口并写入HTML
          const paymentWindow = window.open('', '_self')
          if (paymentWindow) {
            paymentWindow.document.write(payData.data.paymentUrl)
            paymentWindow.document.close()
          }
        } else {
          messageApi.error(payData.error || '发起支付失败')
        }
        return
      }
      
      // 从购物车创建新订单
      const res = await fetch('/api/client/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          addressId: selectedAddressId,
          paymentMethod: selectedPayment,
        }),
      })
      const data = await res.json()
      if (data.success) {
        messageApi.success('订单创建成功')
        setTimeout(() => router.push(`/orders/${data.data.id}`), 1000)
      } else {
        messageApi.error(data.error || '创建订单失败')
      }
    } catch (error) {
      console.error('操作失败:', error)
      messageApi.error('操作失败，请重试')
    } finally {
      setSubmitting(false)
    }
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

  if (paymentMethods.length === 0) {
    return (
      <div className="min-h-screen bg-[#f4f4f4] py-8">
        {contextHolder}
        <div className="max-w-4xl mx-auto px-6">
          <Card className="text-center py-16 bg-white">
            <SafetyOutlined className="text-6xl text-gray-300 mb-4" />
            <p className="text-title-small text-gray-800 mb-2">暂未开放支付功能</p>
            <p className="text-body text-gray-500 mb-6">支付功能正在配置中，敬请期待</p>
            <Button variant="outline" onClick={() => router.back()}>返回</Button>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f4f4f4] py-8">
      {contextHolder}
      
      {/* 顶部返回栏 */}
      <div className="max-w-6xl mx-auto px-6 mb-6">
        {orderId ? (
          <Link href={`/orders/${orderId}`} className="inline-flex items-center gap-2 text-gray-700 hover:text-accent-orange transition-colors">
            <LeftOutlined />
            <span>返回订单详情</span>
          </Link>
        ) : (
          <Link href="/cart" className="inline-flex items-center gap-2 text-gray-700 hover:text-accent-orange transition-colors">
            <LeftOutlined />
            <span>返回购物车</span>
          </Link>
        )}
      </div>

      {/* 进度条 */}
      <div className="max-w-6xl mx-auto px-6 mb-8">
        <Card className="bg-white">
          <Steps
            current={1}
            items={[
              {
                title: <span className="text-gray-800">购物车</span>,
                icon: <ShoppingCartOutlined />,
              },
              {
                title: <span className="text-gray-800">确认订单</span>,
                icon: <CheckCircleOutlined />,
              },
              {
                title: <span className="text-gray-800">支付</span>,
                icon: <CreditCardOutlined />,
              },
            ]}
          />
        </Card>
      </div>

      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* 收货地址 */}
            <Card className="bg-white">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-title-small font-bold flex items-center gap-2 text-gray-800">
                  <EnvironmentOutlined className="text-accent-orange" />
                  收货地址
                </h3>
                <Link href="/addresses">
                  <Button variant="outline">
                    <EditOutlined className="mr-1" />
                    管理地址
                  </Button>
                </Link>
              </div>
              
              {addresses.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <EnvironmentOutlined className="text-4xl text-gray-300 mb-3" />
                  <p className="text-body text-gray-500 mb-4">暂无收货地址</p>
                  <Button variant="primary" onClick={() => router.push('/addresses')}>
                    <PlusOutlined className="mr-1" />
                    添加地址
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <label
                      key={addr.id}
                      className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedAddressId === addr.id
                          ? 'border-accent-orange bg-orange-50 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="address"
                          value={addr.id}
                          checked={selectedAddressId === addr.id}
                          onChange={(e) => setSelectedAddressId(e.target.value)}
                          className="mt-1 w-4 h-4 text-accent-orange"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-body font-bold text-gray-800">{addr.name}</span>
                            <span className="text-body text-gray-600">{addr.phone}</span>
                            {addr.isDefault && (
                              <span className="px-2 py-0.5 text-xs bg-accent-orange text-white rounded-full">
                                默认
                              </span>
                            )}
                          </div>
                          <p className="text-body text-gray-600 leading-relaxed">
                            {addr.province} {addr.city} {addr.district} {addr.detail}
                          </p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </Card>

            {/* 支付方式 */}
            <Card className="bg-white">
              <h3 className="text-title-small font-bold mb-6 flex items-center gap-2 text-gray-800">
                <CreditCardOutlined className="text-accent-orange" />
                支付方式
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {paymentMethods.map((method) => (
                  <label
                    key={method.id}
                    className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedPayment === method.name
                        ? 'border-accent-orange bg-orange-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        value={method.name}
                        checked={selectedPayment === method.name}
                        onChange={(e) => setSelectedPayment(e.target.value)}
                        className="w-4 h-4 text-accent-orange"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <CreditCardOutlined className="text-accent-orange" />
                          <span className="text-body font-medium text-gray-800">{method.displayName}</span>
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
                <SafetyOutlined className="text-blue-500 mt-0.5" />
                <p className="text-caption text-blue-700">
                  我们采用业界领先的加密技术，确保您的支付信息安全
                </p>
              </div>
            </Card>
          </div>

          {/* 订单摘要 */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <Card className="bg-white border-2 border-gray-200">
                <h3 className="text-title-small font-bold mb-6 text-gray-800">订单摘要</h3>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-body">
                    <span className="text-gray-600">商品小计</span>
                    <span className="text-gray-800 font-medium">
                      ¥{order ? Number(order.totalAmount).toFixed(2) : '0.00'}
                    </span>
                  </div>
                  <div className="flex justify-between text-body">
                    <span className="text-gray-600">配送费用</span>
                    <span className="text-green-600 font-medium">免费</span>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-baseline mb-2">
                      <span className="text-gray-600">订单总计</span>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-accent-orange">
                          ¥{order ? Number(order.totalAmount).toFixed(2) : '0.00'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  variant="primary"
                  className="w-full py-3 text-lg"
                  onClick={handleSubmit}
                  disabled={submitting || !selectedAddressId || !selectedPayment}
                >
                  {submitting ? (
                    <>
                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      {orderId ? '处理中...' : '提交中...'}
                    </>
                  ) : (
                    <>
                      <CheckCircleOutlined className="mr-2" />
                      {orderId ? '确认支付' : '提交订单'}
                    </>
                  )}
                </Button>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-caption text-gray-500">
                    <CheckCircleOutlined className="text-green-500" />
                    <span>支持7天无理由退货</span>
                  </div>
                  <div className="flex items-center gap-2 text-caption text-gray-500">
                    <CheckCircleOutlined className="text-green-500" />
                    <span>全国包邮，48小时发货</span>
                  </div>
                  <div className="flex items-center gap-2 text-caption text-gray-500">
                    <CheckCircleOutlined className="text-green-500" />
                    <span>正品保障，假一赔十</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <ProtectedRoute>
      <CheckoutPageContent />
    </ProtectedRoute>
  )
}

