'use client'

import { useState } from 'react'
import { Form, Input, InputNumber, Select, DatePicker, Button, message } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AdminCard from '@/components/admin/AdminCard'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker
const { TextArea } = Input

export default function NewCouponPage() {
  const router = useRouter()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [couponType, setCouponType] = useState('fixed')

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true)
      const [validFrom, validTo] = values.validityPeriod
      
      const data = {
        code: values.code,
        name: values.name,
        type: values.type,
        value: values.value,
        minAmount: values.minAmount || 0,
        maxDiscount: values.maxDiscount,
        totalCount: values.totalCount,
        validFrom: validFrom.toISOString(),
        validTo: validTo.toISOString(),
        description: values.description,
        status: 'active'
      }

      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      const result = await res.json()
      if (result.success) {
        message.success('优惠券创建成功')
        router.push('/admin/coupons')
      } else {
        message.error(result.error || '创建失败')
      }
    } catch (error) {
      message.error('创建失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/admin/coupons">
            <Button icon={<ArrowLeftOutlined />} className="mb-4">返回列表</Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">创建优惠券</h1>
          <p className="text-gray-600 mt-1">填写优惠券信息</p>
        </div>

        <AdminCard>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              type: 'fixed',
              minAmount: 0,
              totalCount: 100
            }}
          >
            <Form.Item
              label="优惠券代码"
              name="code"
              rules={[{ required: true, message: '请输入优惠券代码' }]}
              extra="建议使用大写字母和数字，例如：SAVE50"
            >
              <Input placeholder="例如：SAVE50" maxLength={20} />
            </Form.Item>

            <Form.Item
              label="优惠券名称"
              name="name"
              rules={[{ required: true, message: '请输入优惠券名称' }]}
            >
              <Input placeholder="例如：新用户专享券" />
            </Form.Item>

            <Form.Item
              label="优惠类型"
              name="type"
              rules={[{ required: true }]}
            >
              <Select onChange={(value) => setCouponType(value)}>
                <Select.Option value="fixed">固定金额</Select.Option>
                <Select.Option value="percent">百分比折扣</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              label={couponType === 'fixed' ? '优惠金额（元）' : '折扣比例'}
              name="value"
              rules={[{ required: true, message: '请输入优惠值' }]}
              extra={couponType === 'percent' ? '例如：0.1 表示 10% 折扣' : ''}
            >
              <InputNumber
                min={0}
                max={couponType === 'percent' ? 1 : undefined}
                step={couponType === 'percent' ? 0.01 : 1}
                style={{ width: '100%' }}
                placeholder={couponType === 'percent' ? '0.1 (10%折扣)' : '50'}
              />
            </Form.Item>

            <Form.Item
              label="最低消费金额（元）"
              name="minAmount"
            >
              <InputNumber min={0} style={{ width: '100%' }} placeholder="0表示无门槛" />
            </Form.Item>

            {couponType === 'percent' && (
              <Form.Item
                label="最大折扣金额（元）"
                name="maxDiscount"
                extra="百分比优惠券的最大折扣上限，可选"
              >
                <InputNumber min={0} style={{ width: '100%' }} placeholder="不填则无上限" />
              </Form.Item>
            )}

            <Form.Item
              label="发放总数量"
              name="totalCount"
              rules={[{ required: true, message: '请输入发放总数量' }]}
            >
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              label="有效期"
              name="validityPeriod"
              rules={[{ required: true, message: '请选择有效期' }]}
            >
              <RangePicker 
                showTime 
                style={{ width: '100%' }}
                disabledDate={(current) => current && current < dayjs().startOf('day')}
              />
            </Form.Item>

            <Form.Item
              label="优惠券描述"
              name="description"
            >
              <TextArea rows={3} placeholder="描述优惠券的使用说明和限制条件" />
            </Form.Item>

            <Form.Item>
              <div className="flex gap-2">
                <Button type="primary" htmlType="submit" loading={loading} size="large">
                  创建优惠券
                </Button>
                <Link href="/admin/coupons">
                  <Button size="large">取消</Button>
                </Link>
              </div>
            </Form.Item>
          </Form>
        </AdminCard>
      </div>
    </div>
  )
}
