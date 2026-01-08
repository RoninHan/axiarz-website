'use client'

import { useState, useEffect } from 'react'
import { Form, Input, Button, Card, message, Spin } from 'antd'
import { SaveOutlined, ReloadOutlined } from '@ant-design/icons'

const { TextArea } = Input

interface ContractConfig {
  // 甲方信息
  sellerName: string
  sellerAddress: string
  sellerPhone: string
  sellerTaxNumber: string
  sellerBankAccount: string
  
  // 合同条款
  qualityClause: string
  deliveryClause: string
  paymentClause: string
  afterSalesClause: string
  disputeClause: string
}

const DEFAULT_CONFIG: ContractConfig = {
  sellerName: 'Axiarz 科技有限公司',
  sellerAddress: '广东省深圳市南山区科技园南区深圳湾科技生态园',
  sellerPhone: '400-123-4567',
  sellerTaxNumber: '91440300MA5XXXXX',
  sellerBankAccount: '中国银行深圳分行 1234 5678 9012 3456',
  
  qualityClause: '甲方保证所提供产品符合国家相关质量标准，若因产品质量问题导致乙方损失，甲方承担相应责任。',
  deliveryClause: '甲方承诺在收到乙方全额付款后 3-7 个工作日内发货，具体到货时间以物流公司配送时效为准。',
  paymentClause: '乙方应在下单时选择支付方式并完成付款，支持支付宝、微信支付等多种支付方式。',
  afterSalesClause: '产品自签收之日起享受 7 天无理由退换货服务（特殊商品除外），质保期内非人为损坏提供免费维修服务。',
  disputeClause: '如发生争议，双方应友好协商解决；协商不成的，可向甲方所在地人民法院提起诉讼。'
}

export default function ContractConfigPage() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      setFetching(true)
      const response = await fetch('/api/admin/settings/contract-config', {
        headers: {
          'X-Auth-Type': 'admin'
        }
      })
      const data = await response.json()
      
      if (data.success && data.config) {
        form.setFieldsValue(data.config)
      } else {
        // 使用默认配置
        form.setFieldsValue(DEFAULT_CONFIG)
      }
    } catch (error) {
      console.error('加载配置失败:', error)
      message.error('加载配置失败')
      form.setFieldsValue(DEFAULT_CONFIG)
    } finally {
      setFetching(false)
    }
  }

  const handleSave = async (values: ContractConfig) => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/settings/contract-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Type': 'admin'
        },
        body: JSON.stringify({ config: values })
      })

      const data = await response.json()
      
      if (data.success) {
        message.success('保存成功')
      } else {
        message.error(data.error || '保存失败')
      }
    } catch (error) {
      console.error('保存失败:', error)
      message.error('保存失败')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    form.setFieldsValue(DEFAULT_CONFIG)
    message.info('已恢复为默认配置')
  }

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div>
      <div className="p-6 bg-white border-b">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">合同配置</h1>
        <p className="text-gray-600">配置销售合同的甲方信息和合同条款</p>
      </div>

      <div className="p-6">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={DEFAULT_CONFIG}
        >
          {/* 甲方（卖方）信息 */}
          <Card title="甲方（卖方）信息" className="mb-6">
            <Form.Item
              label="公司名称"
              name="sellerName"
              rules={[{ required: true, message: '请输入公司名称' }]}
            >
              <Input placeholder="例如：Axiarz 科技有限公司" />
            </Form.Item>

            <Form.Item
              label="公司地址"
              name="sellerAddress"
              rules={[{ required: true, message: '请输入公司地址' }]}
            >
              <Input placeholder="例如：广东省深圳市南山区科技园南区深圳湾科技生态园" />
            </Form.Item>

            <Form.Item
              label="联系电话"
              name="sellerPhone"
              rules={[{ required: true, message: '请输入联系电话' }]}
            >
              <Input placeholder="例如：400-123-4567" />
            </Form.Item>

            <Form.Item
              label="税号"
              name="sellerTaxNumber"
              rules={[{ required: true, message: '请输入税号' }]}
            >
              <Input placeholder="例如：91440300MA5XXXXX" />
            </Form.Item>

            <Form.Item
              label="银行账户"
              name="sellerBankAccount"
              rules={[{ required: true, message: '请输入银行账户' }]}
            >
              <Input placeholder="例如：中国银行深圳分行 1234 5678 9012 3456" />
            </Form.Item>
          </Card>

          {/* 合同条款 */}
          <Card title="合同条款" className="mb-6">
            <Form.Item
              label="一、产品质量条款"
              name="qualityClause"
              rules={[{ required: true, message: '请输入产品质量条款' }]}
            >
              <TextArea 
                rows={3} 
                placeholder="描述产品质量保证相关内容"
              />
            </Form.Item>

            <Form.Item
              label="二、交付时间条款"
              name="deliveryClause"
              rules={[{ required: true, message: '请输入交付时间条款' }]}
            >
              <TextArea 
                rows={3} 
                placeholder="描述产品交付时间相关内容"
              />
            </Form.Item>

            <Form.Item
              label="三、付款方式条款"
              name="paymentClause"
              rules={[{ required: true, message: '请输入付款方式条款' }]}
            >
              <TextArea 
                rows={3} 
                placeholder="描述付款方式相关内容"
              />
            </Form.Item>

            <Form.Item
              label="四、售后服务条款"
              name="afterSalesClause"
              rules={[{ required: true, message: '请输入售后服务条款' }]}
            >
              <TextArea 
                rows={3} 
                placeholder="描述售后服务相关内容"
              />
            </Form.Item>

            <Form.Item
              label="五、争议解决条款"
              name="disputeClause"
              rules={[{ required: true, message: '请输入争议解决条款' }]}
            >
              <TextArea 
                rows={3} 
                placeholder="描述争议解决相关内容"
              />
            </Form.Item>
          </Card>

          {/* 操作按钮 */}
          <div className="flex gap-4">
            <Button
              type="primary"
              icon={<SaveOutlined />}
              htmlType="submit"
              loading={loading}
              size="large"
            >
              保存配置
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleReset}
              size="large"
            >
              恢复默认
            </Button>
          </div>
        </Form>
      </div>
    </div>
  )
}
