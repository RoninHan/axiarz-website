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
  LeftOutlined,
  WalletOutlined,
  FileTextOutlined
} from '@ant-design/icons'
import Link from 'next/link'
import Button from '@/components/client/Button'
import Card from '@/components/client/Card'
import Input from '@/components/client/Input'
import ProtectedRoute from '@/components/client/ProtectedRoute'
import { Address, PaymentConfig, Order } from '@/types'

interface WalletData {
  balance: string
  frozen: string
}

interface InvoiceData {
  needInvoice: boolean
  type: 'personal' | 'company'
  title: string
  taxNumber: string
  email: string
}

function CheckoutPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId') // 如果从订单详情页跳转过来，会有orderId
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string>('')
  const [paymentMethods, setPaymentMethods] = useState<PaymentConfig[]>([])
  const [selectedPayment, setSelectedPayment] = useState<string>('')
  const [useWallet, setUseWallet] = useState(false)
  const [wallet, setWallet] = useState<WalletData | null>(null)
  const [invoice, setInvoice] = useState<InvoiceData>({
    needInvoice: false,
    type: 'personal',
    title: '',
    taxNumber: '',
    email: ''
  })
  const [order, setOrder] = useState<Order | null>(null) // 存储订单信息
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [messageApi, contextHolder] = message.useMessage()

  useEffect(() => {
    fetchAddresses()
    fetchPaymentMethods()
    fetchWallet()
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

  async function fetchWallet() {
    try {
      const res = await fetch('/api/client/wallet')
      const data = await res.json()
      if (data.success) {
        setWallet(data.data)
      }
    } catch (error) {
      console.error('获取钱包信息失败:', error)
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

  function getTotalAmount() {
    return order ? Number(order.totalAmount) : 0
  }

  async function handleSubmit() {
    if (!selectedAddressId) {
      messageApi.warning('请选择收货地址')
      return
    }
    
    // 验证发票信息
    if (invoice.needInvoice) {
      if (!invoice.title.trim()) {
        messageApi.error('请填写发票抬头')
        return
      }
      if (invoice.type === 'company' && !invoice.taxNumber.trim()) {
        messageApi.error('请填写企业税号')
        return
      }
      if (!invoice.email.trim()) {
        messageApi.error('请填写接收发票的邮箱')
        return
      }
      // 简单的邮箱格式验证
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(invoice.email)) {
        messageApi.error('请填写正确的邮箱地址')
        return
      }
    }
    
    // 如果使用钱包支付
    if (useWallet) {
      if (!wallet || Number(wallet.balance) < getTotalAmount()) {
        messageApi.error('钱包余额不足')
        return
      }
    } else {
      // 其他支付方式
      if (!selectedPayment) {
        messageApi.warning('请选择支付方式')
        return
      }
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
            paymentMethod: useWallet ? 'wallet' : selectedPayment,
            useWallet: useWallet,
          }),
        })
        const payData = await payRes.json()
        
        if (payData.success) {
          // 钱包支付直接成功
          if (useWallet || payData.data.paymentMethod === 'wallet') {
            messageApi.success('支付成功！')
            setTimeout(() => router.push(`/orders/${orderId}`), 1000)
            return
          }
          
          // 其他支付方式跳转
          if (payData.data.paymentUrl) {
            messageApi.success('正在跳转到支付页面...')
            // 支付宝返回的是HTML表单，需要在新页面中渲染
            const paymentWindow = window.open('', '_self')
            if (paymentWindow) {
              paymentWindow.document.write(payData.data.paymentUrl)
              paymentWindow.document.close()
            }
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
          paymentMethod: useWallet ? 'wallet' : selectedPayment,
          invoice: invoice.needInvoice ? {
            type: invoice.type,
            title: invoice.title,
            taxNumber: invoice.type === 'company' ? invoice.taxNumber : '',
            email: invoice.email
          } : null
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

              {/* 钱包支付选项 */}
              {wallet && (
                <div className="mb-4 p-4 bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-lg">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={useWallet}
                        onChange={(e) => setUseWallet(e.target.checked)}
                        className="w-5 h-5 text-accent-orange rounded"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <WalletOutlined className="text-accent-orange text-lg" />
                          <span className="text-body font-medium text-gray-800">使用钱包余额</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          当前余额: <span className="font-bold text-accent-orange">¥{Number(wallet.balance).toFixed(2)}</span>
                        </p>
                      </div>
                    </div>
                    <Link 
                      href="/wallet" 
                      className="text-xs text-accent-orange hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      充值 →
                    </Link>
                  </label>
                  {useWallet && Number(wallet.balance) < getTotalAmount() && (
                    <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
                      余额不足，请先充值或选择其他支付方式
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {paymentMethods.map((method) => (
                  <label
                    key={method.id}
                    className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedPayment === method.name
                        ? 'border-accent-orange bg-orange-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    } ${useWallet ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        value={method.name}
                        checked={selectedPayment === method.name}
                        onChange={(e) => setSelectedPayment(e.target.value)}
                        disabled={useWallet}
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

            {/* 发票信息 */}
            <Card className="bg-white">
              <h3 className="text-title-small font-bold mb-6 flex items-center gap-2 text-gray-800">
                <FileTextOutlined className="text-accent-orange" />
                发票信息
              </h3>

              {/* 是否需要发票 */}
              <div className="mb-4">
                <label className="flex items-center gap-3 cursor-pointer p-4 border-2 border-gray-200 rounded-lg hover:border-gray-300 transition-all">
                  <input
                    type="checkbox"
                    checked={invoice.needInvoice}
                    onChange={(e) => setInvoice({ ...invoice, needInvoice: e.target.checked })}
                    className="w-5 h-5 text-accent-orange rounded"
                  />
                  <span className="text-body font-medium text-gray-800">需要开具发票</span>
                </label>
              </div>

              {/* 发票详情 */}
              {invoice.needInvoice && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  {/* 发票类型 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      发票类型 <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <label
                        className={`flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                          invoice.type === 'personal'
                            ? 'border-accent-orange bg-orange-50 text-accent-orange'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <input
                          type="radio"
                          name="invoiceType"
                          value="personal"
                          checked={invoice.type === 'personal'}
                          onChange={(e) => setInvoice({ ...invoice, type: 'personal', taxNumber: '' })}
                          className="sr-only"
                        />
                        <span className="font-medium">个人</span>
                      </label>
                      <label
                        className={`flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                          invoice.type === 'company'
                            ? 'border-accent-orange bg-orange-50 text-accent-orange'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <input
                          type="radio"
                          name="invoiceType"
                          value="company"
                          checked={invoice.type === 'company'}
                          onChange={(e) => setInvoice({ ...invoice, type: 'company' })}
                          className="sr-only"
                        />
                        <span className="font-medium">企业</span>
                      </label>
                    </div>
                  </div>

                  {/* 发票抬头 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      发票抬头 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-orange focus:border-transparent"
                      placeholder={invoice.type === 'personal' ? '请输入姓名' : '请输入企业名称'}
                      value={invoice.title}
                      onChange={(e) => setInvoice({ ...invoice, title: e.target.value })}
                    />
                  </div>

                  {/* 税号（企业发票） */}
                  {invoice.type === 'company' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        税号 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-orange focus:border-transparent"
                        placeholder="请输入纳税人识别号"
                        value={invoice.taxNumber}
                        onChange={(e) => setInvoice({ ...invoice, taxNumber: e.target.value })}
                      />
                    </div>
                  )}

                  {/* 接收邮箱 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      接收邮箱 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-orange focus:border-transparent"
                      placeholder="请输入接收发票的邮箱地址"
                      value={invoice.email}
                      onChange={(e) => setInvoice({ ...invoice, email: e.target.value })}
                    />
                    <p className="text-xs text-gray-500 mt-1">电子发票将发送至此邮箱</p>
                  </div>

                  <div className="text-xs text-gray-500 bg-blue-50 border border-blue-200 rounded p-3">
                    <p className="mb-1">📄 发票说明：</p>
                    <ul className="space-y-1 ml-4">
                      <li>• 发票将在订单完成后的3-5个工作日内开具</li>
                      <li>• 电子发票将发送至您的注册邮箱</li>
                      <li>• 如需纸质发票，请联系客服</li>
                    </ul>
                  </div>
                </div>
              )}
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

