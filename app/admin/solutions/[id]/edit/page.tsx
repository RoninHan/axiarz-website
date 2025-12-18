'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Form, Input, Button, Select, InputNumber, message, Card, Upload, Space } from 'antd'
import { SaveOutlined, ArrowLeftOutlined, UploadOutlined } from '@ant-design/icons'
import RichTextEditor from '@/components/admin/RichTextEditor'
import type { Solution } from '@/types'

const { TextArea } = Input
const { Option } = Select

export default function SolutionEditPage() {
  const router = useRouter()
  const params = useParams()
  const isEdit = params.id !== 'new'
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')
  const [messageApi, contextHolder] = message.useMessage()

  useEffect(() => {
    if (isEdit) {
      loadSolution()
    }
  }, [])

  async function loadSolution() {
    try {
      const res = await fetch(`/api/admin/solutions/${params.id}`)
      const data = await res.json()
      if (data.success) {
        const solution: Solution = data.data
        form.setFieldsValue({
          title: solution.title,
          slug: solution.slug,
          description: solution.description,
          coverImage: solution.coverImage,
          status: solution.status,
          sortOrder: solution.sortOrder,
        })
        setContent(solution.content)
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
      const url = isEdit ? `/api/admin/solutions/${params.id}` : '/api/admin/solutions'
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
          router.push('/admin/solutions')
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
      // 简单的拼音转换（实际项目中建议使用 pinyin 库）
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

      <Card title={isEdit ? '编辑解决方案' : '新建解决方案'}>
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
