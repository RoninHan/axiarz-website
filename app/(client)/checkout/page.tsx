'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { message } from 'antd'
import Button from '@/components/client/Button'
import Card from '@/components/client/Card'
import Input from '@/components/client/Input'
import ProtectedRoute from '@/components/client/ProtectedRoute'
import { Address, PaymentConfig } from '@/types'

function CheckoutPageContent() {
  const router = useRouter()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string>('')
  const [paymentMethods, setPaymentMethods] = useState<PaymentConfig[]>([])
  const [selectedPayment, setSelectedPayment] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [messageApi, contextHolder] = message.useMessage()

  useEffect(() => {
    fetchAddresses()
    fetchPaymentMethods()
  }, [])

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
          setSelectedPayment(enabled[0].id)
        }
      }
    } catch (error) {
      console.error('获取支付方式失败:', error)
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
      console.error('创建订单失败:', error)
      messageApi.error('创建订单失败')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="container mx-auto px-6 py-12 text-center">加载中...</div>
  }

  if (paymentMethods.length === 0) {
    return (
      <div className="container mx-auto px-6 py-12 max-w-[1920px]">
        {contextHolder}
        <Card className="text-center py-12">
          <p className="text-body text-neutral-medium mb-4">暂未开放支付功能</p>
          <Button variant="outline" onClick={() => router.back()}>返回</Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-6 py-12 max-w-[1920px]">
      {contextHolder}
      <h1 className="text-title-large font-title mb-8">结算</h1>

      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 space-y-6">
          {/* 收货地址 */}
          <Card>
            <h3 className="text-title-small font-title mb-4">收货地址</h3>
            {addresses.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-body text-neutral-medium mb-4">暂无收货地址</p>
                <Button variant="outline" onClick={() => router.push('/addresses')}>
                  添加地址
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {addresses.map((addr) => (
                  <label
                    key={addr.id}
                    className={`block p-4 border-2 rounded-default cursor-pointer ${
                      selectedAddressId === addr.id
                        ? 'border-accent-orange bg-orange-50'
                        : 'border-neutral-medium hover:border-neutral-medium'
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      value={addr.id}
                      checked={selectedAddressId === addr.id}
                      onChange={(e) => setSelectedAddressId(e.target.value)}
                      className="mr-2"
                    />
                    <div>
                      <span className="text-body font-medium">{addr.name}</span>
                      <span className="text-body ml-2">{addr.phone}</span>
                      {addr.isDefault && (
                        <span className="ml-2 text-caption text-accent-orange">默认</span>
                      )}
                      <p className="text-body text-neutral-medium mt-1">
                        {addr.province} {addr.city} {addr.district} {addr.detail}
                      </p>
                    </div>
                  </label>
                ))}
                <Button variant="outline" onClick={() => router.push('/addresses')}>
                  管理地址
                </Button>
              </div>
            )}
          </Card>

          {/* 支付方式 */}
          <Card>
            <h3 className="text-title-small font-title mb-4">支付方式</h3>
            <div className="space-y-2">
              {paymentMethods.map((method) => (
                <label
                  key={method.id}
                  className={`block p-4 border-2 rounded-default cursor-pointer ${
                    selectedPayment === method.id
                      ? 'border-accent-orange bg-orange-50'
                      : 'border-neutral-medium hover:border-neutral-medium'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={method.id}
                    checked={selectedPayment === method.id}
                    onChange={(e) => setSelectedPayment(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-body font-medium">{method.displayName}</span>
                </label>
              ))}
            </div>
          </Card>
        </div>

        <div>
          <Card>
            <h3 className="text-title-small font-title mb-4">订单摘要</h3>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-body">
                <span>小计</span>
                <span>¥0.00</span>
              </div>
              <div className="flex justify-between text-body">
                <span>运费</span>
                <span>¥0.00</span>
              </div>
              <div className="border-t border-neutral-medium pt-2 flex justify-between text-title-small font-title">
                <span>总计</span>
                <span className="text-accent-orange">¥0.00</span>
              </div>
            </div>
            <Button
              variant="primary"
              className="w-full"
              onClick={handleSubmit}
              disabled={submitting || !selectedAddressId || !selectedPayment}
            >
              {submitting ? '提交中...' : '提交订单'}
            </Button>
          </Card>
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

