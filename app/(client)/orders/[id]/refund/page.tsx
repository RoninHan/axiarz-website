'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { message, Radio, Form, Input, Select, Modal } from 'antd'
import { ArrowLeftOutlined, DollarOutlined, BankOutlined, CreditCardOutlined, InfoCircleOutlined } from '@ant-design/icons'
import Button from '@/components/client/Button'
import Card from '@/components/client/Card'
import ProtectedRoute from '@/components/client/ProtectedRoute'
import { Order } from '@/types'

const { TextArea } = Input
const { Option } = Select

function OrderRefundPageContent() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [refundMethod, setRefundMethod] = useState<'original' | 'bank'>('original')
  const [form] = Form.useForm()
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
        // 检查订单状态是否支持退款
        if (!['paid', 'shipped', 'delivered'].includes(data.data.status)) {
          messageApi.warning('当前订单状态不支持退款申请')
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

  async function handleSubmit(values: any) {
    if (!order) return

    try {
      setSubmitting(true)

      const refundData = {
        orderId: order.id,
        reason: values.reason,
        amount: values.amount,
        refundMethod: values.refundMethod,
        ...(values.refundMethod === 'bank' && {
          bankName: values.bankName,
          bankAccount: values.bankAccount,
          accountName: values.accountName,
        }),
      }

      const res = await fetch('/api/client/refund-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(refundData),
      })

      const data = await res.json()

      if (data.success) {
        messageApi.success('退款申请提交成功！我们将在1-3个工作日内处理您的申请。')
        setTimeout(() => {
          router.push('/orders')
        }, 2000)
      } else {
        messageApi.error(data.error || '提交失败')
      }
    } catch (error) {
      console.error('提交退款申请失败:', error)
      messageApi.error('提交失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  // 支持的银行列表
  const supportedBanks = [
    { value: 'ICBC', label: '中国工商银行' },
    { value: 'ABC', label: '中国农业银行' },
    { value: 'BOC', label: '中国银行' },
    { value: 'CCB', label: '中国建设银行' },
  ]

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
          <InfoCircleOutlined className="text-6xl text-neutral-medium mb-4" />
          <h3 className="text-title-medium font-title text-primary-black mb-2">订单不存在</h3>
          <p className="text-body text-neutral-medium">您访问的订单可能已被删除或不存在</p>
          <Button onClick={() => router.push('/orders')} className="mt-4">
            返回订单列表
          </Button>
        </div>
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
              申请退款
            </h1>
            <p className="text-body text-neutral-medium">
              订单号：{order.orderNumber}
            </p>
          </div>
        </div>

        {/* 订单信息 */}
        <Card className="mb-8">
          <h3 className="text-title-small font-title text-primary-black mb-6 flex items-center gap-2">
            <DollarOutlined />
            订单信息
          </h3>

          <div className="bg-neutral-light p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-body text-neutral-dark">订单金额</span>
              <span className="text-body font-medium text-primary-black">
                ¥{Number(order.totalAmount).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-body text-neutral-dark">订单状态</span>
              <span className="text-body text-neutral-dark">
                {order.status === 'paid' ? '已支付' :
                 order.status === 'shipped' ? '已发货' :
                 order.status === 'delivered' ? '已收货' : order.status}
              </span>
            </div>
          </div>
        </Card>

        {/* 退款申请表单 */}
        <Card>
          <h3 className="text-title-small font-title text-primary-black mb-6 flex items-center gap-2">
            <CreditCardOutlined />
            退款申请
          </h3>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              amount: Number(order.totalAmount).toFixed(2),
              refundMethod: 'original',
            }}
          >
            {/* 退款原因 */}
            <Form.Item
              label="退款原因"
              name="reason"
              rules={[{ required: true, message: '请填写退款原因' }]}
            >
              <TextArea
                rows={3}
                placeholder="请详细描述您申请退款的原因..."
                maxLength={200}
                showCount
              />
            </Form.Item>

            {/* 退款金额 */}
            <Form.Item
              label="退款金额"
              name="amount"
              rules={[
                { required: true, message: '请填写退款金额' },
                {
                  validator: (_, value) => {
                    const num = parseFloat(value)
                    if (isNaN(num) || num <= 0) {
                      return Promise.reject('退款金额必须大于0')
                    }
                    if (num > Number(order.totalAmount)) {
                      return Promise.reject('退款金额不能超过订单金额')
                    }
                    return Promise.resolve()
                  }
                }
              ]}
            >
              <Input
                prefix="¥"
                placeholder="请输入退款金额"
                type="number"
                step="0.01"
              />
            </Form.Item>

            {/* 退款方式 */}
            <Form.Item
              label="退款方式"
              name="refundMethod"
              rules={[{ required: true, message: '请选择退款方式' }]}
            >
              <Radio.Group
                onChange={(e) => setRefundMethod(e.target.value)}
                className="w-full"
              >
                <div className="space-y-4">
                  <Radio value="original" className="w-full">
                    <div className="flex items-center gap-3 p-3 border border-neutral-medium rounded-lg hover:border-accent-orange transition-colors">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <CreditCardOutlined className="text-blue-600" />
                      </div>
                      <div>
                        <div className="text-body font-medium text-primary-black">原路退款</div>
                        <div className="text-caption text-neutral-medium">退回到支付时使用的账户</div>
                      </div>
                    </div>
                  </Radio>

                  <Radio value="bank" className="w-full">
                    <div className="flex items-center gap-3 p-3 border border-neutral-medium rounded-lg hover:border-accent-orange transition-colors">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <BankOutlined className="text-green-600" />
                      </div>
                      <div>
                        <div className="text-body font-medium text-primary-black">银行卡退款</div>
                        <div className="text-caption text-neutral-medium">退到指定的银行卡账户</div>
                      </div>
                    </div>
                  </Radio>
                </div>
              </Radio.Group>
            </Form.Item>

            {/* 银行卡信息（仅在选择银行卡退款时显示） */}
            {refundMethod === 'bank' && (
              <div className="space-y-4 p-4 bg-neutral-light rounded-lg">
                <div className="text-body font-medium text-primary-black mb-3">
                  银行卡信息
                </div>

                <Form.Item
                  label="开户银行"
                  name="bankName"
                  rules={[{ required: true, message: '请选择开户银行' }]}
                >
                  <Select placeholder="请选择开户银行">
                    {supportedBanks.map(bank => (
                      <Option key={bank.value} value={bank.value}>
                        {bank.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  label="银行卡号"
                  name="bankAccount"
                  rules={[
                    { required: true, message: '请输入银行卡号' },
                    {
                      pattern: /^\d{16,19}$/,
                      message: '银行卡号格式不正确（16-19位数字）'
                    }
                  ]}
                >
                  <Input placeholder="请输入银行卡号" />
                </Form.Item>

                <Form.Item
                  label="开户姓名"
                  name="accountName"
                  rules={[{ required: true, message: '请输入开户姓名' }]}
                >
                  <Input placeholder="请输入开户姓名（须与银行卡开户人一致）" />
                </Form.Item>
              </div>
            )}

            {/* 提交按钮 */}
            <div className="flex gap-4 pt-6 border-t border-neutral-border">
              <Button
                type="submit"
                variant="primary"
                loading={submitting}
                className="flex-1"
              >
                {submitting ? '提交中...' : '提交退款申请'}
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push(`/orders/${params.id}`)}
                disabled={submitting}
              >
                取消
              </Button>
            </div>
          </Form>
        </Card>

        {/* 注意事项 */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <div className="flex gap-3">
            <InfoCircleOutlined className="text-blue-600 text-lg mt-1 flex-shrink-0" />
            <div>
              <h4 className="text-body font-medium text-blue-900 mb-2">退款说明</h4>
              <ul className="text-caption text-blue-800 space-y-1">
                <li>• 退款申请提交后，我们将在1-3个工作日内进行审核</li>
                <li>• 审核通过后，退款将在1-5个工作日内到账</li>
                <li>• 原路退款通常1-3个工作日到账，银行卡退款通常3-5个工作日到账</li>
                <li>• 如有疑问，请联系客服</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default function OrderRefundPage() {
  return (
    <ProtectedRoute>
      <OrderRefundPageContent />
    </ProtectedRoute>
  )
}