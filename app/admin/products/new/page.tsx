'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import {
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Card,
  Space,
  Switch,
  message,
  Upload,
  Row,
  Col,
} from 'antd'
import {
  ArrowLeftOutlined,
  SaveOutlined,
  PlusOutlined,
} from '@ant-design/icons'
import type { UploadFile } from 'antd'

const { TextArea } = Input
const RichTextEditor = dynamic(() => import('@/components/admin/RichTextEditor'), { ssr: false })

interface Category {
  id: string
  name: string
  status: string
}

export default function NewProductPage() {
  const router = useRouter()
  const [form] = Form.useForm()
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [content, setContent] = useState('')

  useEffect(() => {
    fetchCategories()
  }, [])

  async function fetchCategories() {
    try {
      const res = await fetch('/api/admin/categories', {
        credentials: 'include',
      })
      const data = await res.json()
      if (data.success) {
        setCategories(data.data.filter((c: Category) => c.status === 'active'))
      }
    } catch (error) {
      console.error('获取分类失败:', error)
    }
  }

  async function handleSubmit(values: any) {
    try {
      setSaving(true)
      const images = values.images ? values.images.split(',').map((s: string) => s.trim()) : []
      
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...values,
          content,
          images,
        }),
      })
      const data = await res.json()
      if (data.success) {
        message.success('创建成功')
        setTimeout(() => router.push('/admin/products'), 1000)
      } else {
        message.error(data.error || '创建失败')
      }
    } catch (error) {
      console.error('创建产品失败:', error)
      message.error('创建失败')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      {/* 页面标题 */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>新增产品</h1>
            <p style={{ margin: '8px 0 0', color: '#666' }}>创建新的产品信息</p>
          </div>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => router.back()}
          >
            返回
          </Button>
        </div>
      </Card>

      {/* 表单区域 */}
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          status: 'active',
          featured: false,
          stock: 0,
          price: 0,
        }}
      >
        <Row gutter={24}>
          {/* 左侧：基本信息 */}
          <Col span={16}>
            <Card title="基本信息" style={{ marginBottom: 24 }}>
              <Form.Item
                label="产品名称"
                name="name"
                rules={[{ required: true, message: '请输入产品名称' }]}
              >
                <Input placeholder="请输入产品名称" size="large" />
              </Form.Item>

              <Form.Item
                label="产品编号 (SKU)"
                name="sku"
              >
                <Input placeholder="可选，用于产品识别" />
              </Form.Item>

              <Form.Item
                label="产品描述"
                name="description"
              >
                <TextArea
                  placeholder="请输入产品简短描述"
                  rows={4}
                  showCount
                  maxLength={500}
                />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="价格"
                    name="price"
                    rules={[{ required: true, message: '请输入价格' }]}
                  >
                    <InputNumber
                      placeholder="0.00"
                      style={{ width: '100%' }}
                      min={0}
                      precision={2}
                      prefix="¥"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="库存"
                    name="stock"
                    rules={[{ required: true, message: '请输入库存' }]}
                  >
                    <InputNumber
                      placeholder="0"
                      style={{ width: '100%' }}
                      min={0}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Card title="产品详情" style={{ marginBottom: 24 }}>
              <div style={{ marginBottom: 8 }}>
                <label style={{ fontSize: 14, fontWeight: 500 }}>详细介绍</label>
              </div>
              <RichTextEditor
                value={content}
                onChange={(value) => setContent(value)}
              />
            </Card>

            <Card title="产品图片" style={{ marginBottom: 24 }}>
              <Form.Item
                label="主图 URL"
                name="image"
                extra="建议尺寸：800x800px"
              >
                <Input placeholder="请输入产品主图 URL" />
              </Form.Item>

              <Form.Item
                label="多图 URL"
                name="images"
                extra="多个图片 URL 请用英文逗号分隔"
              >
                <TextArea
                  placeholder="例如：https://example.com/image1.jpg, https://example.com/image2.jpg"
                  rows={3}
                />
              </Form.Item>
            </Card>
          </Col>

          {/* 右侧：设置选项 */}
          <Col span={8}>
            <Card title="产品设置" style={{ marginBottom: 24 }}>
              <Form.Item
                label="产品分类"
                name="categoryId"
              >
                <Select
                  placeholder="请选择分类"
                  allowClear
                  showSearch
                  optionFilterProp="children"
                >
                  {categories.map((category) => (
                    <Select.Option key={category.id} value={category.id}>
                      {category.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="产品状态"
                name="status"
                rules={[{ required: true, message: '请选择产品状态' }]}
              >
                <Select>
                  <Select.Option value="active">在售</Select.Option>
                  <Select.Option value="inactive">下架</Select.Option>
                  <Select.Option value="sold_out">缺货</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="精选产品"
                name="featured"
                valuePropName="checked"
              >
                <Switch checkedChildren="是" unCheckedChildren="否" />
              </Form.Item>
            </Card>

            <Card>
              <Space style={{ width: '100%' }} direction="vertical" size="middle">
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  htmlType="submit"
                  loading={saving}
                  size="large"
                  block
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                  }}
                >
                  {saving ? '保存中...' : '创建产品'}
                </Button>
                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={() => router.back()}
                  size="large"
                  block
                >
                  取消
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  )
}
