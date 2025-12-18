'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Form, Input, Button, Select, InputNumber, message, Card, Switch, Space } from 'antd'
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import RichTextEditor from '@/components/admin/RichTextEditor'

const { TextArea } = Input
const { Option } = Select

export default function NewHelpArticlePage() {
  const router = useRouter()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')

  async function handleSubmit(values: any) {
    if (!content || content.trim() === '<p><br></p>') {
      message.error('请输入内容')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/admin/help-articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...values,
          content,
        }),
      })

      const data = await res.json()
      if (data.success) {
        message.success('创建成功')
        setTimeout(() => {
          router.push('/admin/help-articles')
        }, 1000)
      } else {
        message.error(data.error || '创建失败')
      }
    } catch (error) {
      message.error('网络错误')
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
      <div className="mb-6">
        <Button icon={<ArrowLeftOutlined />} onClick={() => router.back()}>
          返回
        </Button>
      </div>

      <Card title="新建帮助文章">
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
          >
            <TextArea rows={3} placeholder="简短摘要，用于列表页展示" />
          </Form.Item>

          <Form.Item label="内容" required>
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="请输入文章的详细内容，支持富文本、图片和视频..."
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
              <Switch 
                checkedChildren="是" 
                unCheckedChildren="否"
                style={{ marginTop: 8 }}
              />
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
                创建
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
