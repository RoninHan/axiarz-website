'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Form, Input, Button, Select, InputNumber, message, Card, Switch, Space } from 'antd'
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import RichTextEditor from '@/components/admin/RichTextEditor'
import type { HelpArticle } from '@/types'

const { TextArea } = Input
const { Option } = Select

export default function HelpArticleEditPage() {
  const router = useRouter()
  const params = useParams()
  const isEdit = params.id !== 'new'
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')
  const [messageApi, contextHolder] = message.useMessage()

  useEffect(() => {
    if (isEdit) {
      loadArticle()
    }
  }, [])

  async function loadArticle() {
    try {
      const res = await fetch(`/api/admin/help-articles/${params.id}`)
      const data = await res.json()
      if (data.success) {
        const article: HelpArticle = data.data
        form.setFieldsValue({
          title: article.title,
          slug: article.slug,
          category: article.category,
          excerpt: article.excerpt,
          status: article.status,
          sortOrder: article.sortOrder,
          featured: article.featured,
        })
        setContent(article.content)
      } else {
        messageApi.error(data.error || '加载失败')
      }
    } catch (error) {
      messageApi.error('网络错误')
    }
  }

  async function handleSubmit(values: any) {
    if (!content || content.trim() === '<p><br></p>') {
      messageApi.error('请输入内容')
      return
    }

    setLoading(true)
    try {
      const url = isEdit ? `/api/admin/help-articles/${params.id}` : '/api/admin/help-articles'
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          content,
        }),
      })

      const data = await res.json()
      if (data.success) {
        messageApi.success(isEdit ? '更新成功' : '创建成功')
        setTimeout(() => {
          router.push('/admin/help-articles')
        }, 1000)
      } else {
        messageApi.error(data.error || '操作失败')
      }
    } catch (error) {
      messageApi.error('网络错误')
    } finally {
      setLoading(false)
    }
  }

  // 生成 slug
  function generateSlug() {
    const title = form.getFieldValue('title')
    if (title) {
      const slug = title
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-\u4e00-\u9fa5]+/g, '')
      form.setFieldValue('slug', slug)
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {contextHolder}
      
      <div className="mb-6">
        <Button icon={<ArrowLeftOutlined />} onClick={() => router.back()}>
          返回
        </Button>
      </div>

      <Card title={isEdit ? '编辑帮助文章' : '新建帮助文章'}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            category: 'faq',
            status: 'draft',
            sortOrder: 0,
            featured: false,
          }}
        >
          <Form.Item
            label="标题"
            name="title"
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input
              size="large"
              placeholder="请输入文章标题"
              onBlur={generateSlug}
            />
          </Form.Item>

          <Form.Item
            label="URL 标识"
            name="slug"
            rules={[
              { required: true, message: '请输入 URL 标识' },
              { pattern: /^[a-z0-9\-\u4e00-\u9fa5]+$/, message: '只能包含小写字母、数字、中文和连字符' },
            ]}
            extra="用于 URL，如: /help/how-to-order"
          >
            <Input size="large" placeholder="how-to-order" />
          </Form.Item>

          <Form.Item
            label="分类"
            name="category"
            rules={[{ required: true, message: '请选择分类' }]}
          >
            <Select size="large">
              <Option value="faq">常见问题</Option>
              <Option value="guide">使用指南</Option>
              <Option value="tutorial">教程</Option>
              <Option value="troubleshooting">故障排除</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="摘要"
            name="excerpt"
            extra="用于搜索结果和列表展示"
          >
            <TextArea rows={2} placeholder="简短描述文章内容" />
          </Form.Item>

          <Form.Item label="内容" required>
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="请输入文章内容，支持富文本、图片和视频..."
            />
          </Form.Item>

          <div className="grid grid-cols-3 gap-4">
            <Form.Item
              label="状态"
              name="status"
              rules={[{ required: true }]}
            >
              <Select size="large">
                <Option value="draft">草稿</Option>
                <Option value="published">已发布</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="排序"
              name="sortOrder"
              extra="数字越小越靠前"
            >
              <InputNumber size="large" className="w-full" min={0} />
            </Form.Item>

            <Form.Item
              label="精选文章"
              name="featured"
              valuePropName="checked"
            >
              <Switch checkedChildren="是" unCheckedChildren="否" />
            </Form.Item>
          </div>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                size="large"
                htmlType="submit"
                loading={loading}
                icon={<SaveOutlined />}
              >
                保存
              </Button>
              <Button size="large" onClick={() => router.back()}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}
