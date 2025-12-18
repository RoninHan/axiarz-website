'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Form, Input, Button, Select, InputNumber, message, Card, Space } from 'antd'
import { SaveOutlined, ArrowLeftOutlined, UploadOutlined } from '@ant-design/icons'
import RichTextEditor from '@/components/admin/RichTextEditor'

const { TextArea } = Input
const { Option } = Select

export default function NewSolutionPage() {
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
      const res = await fetch('/api/admin/solutions', {
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
          router.push('/admin/solutions')
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

      <Card title="新建解决方案">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            status: 'draft',
            sortOrder: 0,
          }}
        >
          <Form.Item
            label="标题"
            name="title"
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input
              size="large"
              placeholder="请输入解决方案标题"
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
            extra="用于 URL，如: /solutions/cloud-computing"
          >
            <Input size="large" placeholder="cloud-computing" />
          </Form.Item>

          <Form.Item
            label="简短描述"
            name="description"
          >
            <TextArea rows={3} placeholder="简短描述，用于列表页展示" />
          </Form.Item>

          <Form.Item
            label="封面图片"
            name="coverImage"
          >
            <Input
              size="large"
              placeholder="请输入封面图片 URL"
              prefix={<UploadOutlined />}
            />
          </Form.Item>

          <Form.Item label="内容" required>
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="请输入解决方案的详细内容，支持富文本、图片和视频..."
            />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
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
