'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Card,
  Form,
  Input,
  Button,
  message,
  Spin,
  Avatar,
  Divider,
  Space,
  Upload,
} from 'antd'
import type { UploadProps } from 'antd'
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  SaveOutlined,
  UploadOutlined,
} from '@ant-design/icons'
import { useAuth } from '@/contexts/AuthContext'

export default function ProfilePage() {
  const router = useRouter()
  const { user, loading: authLoading, refreshUser } = useAuth()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (user) {
      form.setFieldsValue({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        avatar: user.avatar || '',
      })
    }
  }, [user, authLoading, router, form])

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)

      const res = await fetch('/api/client/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(values),
      })

      const data = await res.json()

      if (data.success) {
        message.success('个人信息更新成功')
        // 刷新用户信息
        await refreshUser()
      } else {
        message.error(data.error || '更新失败')
      }
    } catch (error: any) {
      if (error.errorFields) {
        message.error('请检查表单填写')
      } else {
        console.error('保存失败:', error)
        message.error('保存失败')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarUpload: UploadProps['customRequest'] = async ({ file, onSuccess, onError }) => {
    const formData = new FormData()
    formData.append('file', file)

    try {
      setUploading(true)
      const res = await fetch('/api/client/files', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })
      const data = await res.json()
      if (data.success) {
        form.setFieldValue('avatar', data.data.url)
        message.success('头像上传成功')
        onSuccess?.(data.data)
      } else {
        message.error(data.error || '上传失败')
        onError?.(new Error(data.error))
      }
    } catch (error) {
      console.error('上传失败:', error)
      message.error('上传失败')
      onError?.(error as Error)
    } finally {
      setUploading(false)
    }
  }

  const beforeUpload = (file: File) => {
    const isImage = file.type === 'image/jpeg' || file.type === 'image/jpg' || file.type === 'image/png'
    if (!isImage) {
      message.error('只能上传 JPG/JPEG/PNG 格式的图片！')
      return false
    }
    const isLt2M = file.size / 1024 / 1024 < 2
    if (!isLt2M) {
      message.error('图片大小不能超过 2MB！')
      return false
    }
    return true
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-6 max-w-4xl">
        {/* 页面标题 */}
        <div
          className="mb-8 p-8 rounded-lg"
          style={{
            background: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)',
          }}
        >
          <h1 className="text-3xl font-bold text-white mb-2">个人中心</h1>
          <p className="text-white opacity-90">管理您的个人信息和账户设置</p>
        </div>

        <Card
          variant="borderless"
          className="shadow-sm"
        >
          {/* 头像区域 */}
          <div className="text-center mb-8">
            <Avatar
              size={120}
              icon={<UserOutlined />}
              src={form.getFieldValue('avatar')}
              style={{ marginBottom: 16 }}
            />
            <div>
              <Upload
                customRequest={handleAvatarUpload}
                beforeUpload={beforeUpload}
                showUploadList={false}
                accept=".jpg,.jpeg,.png"
              >
                <Button icon={<UploadOutlined />} loading={uploading}>
                  更换头像
                </Button>
              </Upload>
            </div>
          </div>

          <Divider />

          {/* 表单 */}
          <Form
            form={form}
            layout="vertical"
            style={{ maxWidth: 600, margin: '0 auto' }}
          >
            <Form.Item
              label="姓名"
              name="name"
              rules={[
                { required: true, message: '请输入姓名' },
                { max: 50, message: '姓名不能超过50个字符' },
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="请输入姓名"
                size="large"
              />
            </Form.Item>

            <Form.Item
              label="邮箱"
              name="email"
              rules={[
                { required: true, message: '请输入邮箱' },
                { type: 'email', message: '请输入有效的邮箱地址' },
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="请输入邮箱"
                size="large"
                disabled
              />
            </Form.Item>

            <Form.Item
              label="手机号"
              name="phone"
              rules={[
                { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' },
              ]}
            >
              <Input
                prefix={<PhoneOutlined />}
                placeholder="请输入手机号（可选）"
                size="large"
              />
            </Form.Item>

            <Form.Item name="avatar" hidden>
              <Input />
            </Form.Item>

            <Form.Item>
              <Space size="middle" style={{ width: '100%', justifyContent: 'center' }}>
                <Button
                  type="primary"
                  size="large"
                  icon={<SaveOutlined />}
                  onClick={handleSave}
                  loading={loading}
                  style={{
                    background: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)',
                    border: 'none',
                    minWidth: 120,
                  }}
                >
                  保存修改
                </Button>
                <Button
                  size="large"
                  onClick={() => router.back()}
                  style={{ minWidth: 120 }}
                >
                  返回
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  )
}
