'use client'

import { useEffect, useState } from 'react'
import {
  Card,
  Form,
  Input,
  Button,
  Space,
  message,
  Divider,
  Row,
  Col,
  Image,
  Empty,
  Rate,
  InputNumber,
  Collapse,
  Avatar,
  Tag,
  Spin,
  Upload,
} from 'antd'
import type { UploadFile, UploadProps } from 'antd'
import {
  SaveOutlined,
  PlusOutlined,
  DeleteOutlined,
  SettingOutlined,
  ThunderboltOutlined,
  StarOutlined,
  UserOutlined,
  PictureOutlined,
  UploadOutlined,
} from '@ant-design/icons'
import { BrandAdvantage, Testimonial } from '@/types'

const { TextArea } = Input
const { Panel } = Collapse

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form] = Form.useForm()
  
  // 品牌优势
  const [advantages, setAdvantages] = useState<BrandAdvantage[]>([])
  
  // 客户口碑
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])

  // 图片预览
  const [logo, setLogo] = useState<string>('')
  const [heroImage, setHeroImage] = useState<string>('')

  // 上传状态
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingHero, setUploadingHero] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/settings', {
        credentials: 'include',
      })
      const data = await res.json()
      if (data.success) {
        form.setFieldsValue({
          logo: data.data.logo || '',
          heroImage: data.data.heroImage || '',
          companyName: data.data.companyName || 'Axiarz',
          heroTitle: data.data.heroTitle || '',
          heroSubtitle: data.data.heroSubtitle || '',
          heroDescription: data.data.heroDescription || '',
          statsCustomers: data.data.statsCustomers || 1000,
          statsRating: data.data.statsRating || 98,
          aboutUs: data.data.aboutUs || '',
          contactEmail: data.data.contactEmail || '',
          contactPhone: data.data.contactPhone || '',
        })
        // 设置预览图片
        setLogo(data.data.logo || '')
        setHeroImage(data.data.heroImage || '')
        setAdvantages(data.data.brandAdvantages || [])
        setTestimonials(data.data.testimonials || [])
      }
    } catch (error) {
      console.error('获取设置失败:', error)
      message.error('获取设置失败')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    try {
      const values = await form.validateFields()
      setSaving(true)
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...values,
          brandAdvantages: advantages,
          testimonials,
        }),
      })
      const data = await res.json()
      if (data.success) {
        message.success('保存成功')
        await fetchSettings()
      } else {
        message.error(data.error || '保存失败')
      }
    } catch (error) {
      console.error('保存设置失败:', error)
      message.error('保存失败')
    } finally {
      setSaving(false)
    }
  }

  // 处理 Logo 上传
  const handleLogoUpload: UploadProps['customRequest'] = async ({ file, onSuccess, onError }) => {
    const formData = new FormData()
    formData.append('file', file)

    try {
      setUploadingLogo(true)
      const res = await fetch('/api/admin/files', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })
      const data = await res.json()
      if (data.success) {
        form.setFieldValue('logo', data.data.url)
        setLogo(data.data.url) // 更新预览
        message.success('Logo 上传成功')
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
      setUploadingLogo(false)
    }
  }

  // 处理英雄区图片上传
  const handleHeroUpload: UploadProps['customRequest'] = async ({ file, onSuccess, onError }) => {
    const formData = new FormData()
    formData.append('file', file)

    try {
      setUploadingHero(true)
      const res = await fetch('/api/admin/files', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })
      const data = await res.json()
      if (data.success) {
        form.setFieldValue('heroImage', data.data.url)
        setHeroImage(data.data.url) // 更新预览
        message.success('图片上传成功')
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
      setUploadingHero(false)
    }
  }

  // 文件类型验证
  const beforeUpload = (file: File) => {
    const isImage = file.type === 'image/jpeg' || file.type === 'image/jpg' || file.type === 'image/png'
    if (!isImage) {
      message.error('只能上传 JPG/JPEG/PNG 格式的图片！')
      return false
    }
    const isLt5M = file.size / 1024 / 1024 < 5
    if (!isLt5M) {
      message.error('图片大小不能超过 5MB！')
      return false
    }
    return true
  }

  function addAdvantage() {
    setAdvantages([
      ...advantages,
      {
        id: Date.now().toString(),
        title: '',
        description: '',
        icon: '✓',
        sortOrder: advantages.length,
      },
    ])
  }

  function updateAdvantage(index: number, field: keyof BrandAdvantage, value: any) {
    const updated = [...advantages]
    updated[index] = { ...updated[index], [field]: value }
    setAdvantages(updated)
  }

  function removeAdvantage(index: number) {
    setAdvantages(advantages.filter((_, i) => i !== index))
  }

  function addTestimonial() {
    setTestimonials([
      ...testimonials,
      {
        id: Date.now().toString(),
        name: '',
        avatar: '',
        rating: 5,
        content: '',
        sortOrder: testimonials.length,
      },
    ])
  }

  function updateTestimonial(index: number, field: keyof Testimonial, value: any) {
    const updated = [...testimonials]
    updated[index] = { ...updated[index], [field]: value }
    setTestimonials(updated)
  }

  function removeTestimonial(index: number) {
    setTestimonials(testimonials.filter((_, i) => i !== index))
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div>
      {/* 页面标题和保存按钮 */}
      <Card style={{ marginBottom: 24 }}>
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space>
            <SettingOutlined style={{ fontSize: 24, color: '#667eea' }} />
            <div>
              <h2 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>系统设置</h2>
              <p style={{ margin: 0, color: '#999' }}>管理网站基本信息、品牌优势和客户评价</p>
            </div>
          </Space>
          <Button
            type="primary"
            size="large"
            icon={<SaveOutlined />}
            onClick={handleSave}
            loading={saving}
          >
            保存所有设置
          </Button>
        </Space>
      </Card>

      {/* 基本设置 */}
      <Card
        title={
          <Space>
            <PictureOutlined style={{ color: '#667eea' }} />
            基本设置
          </Space>
        }
        style={{ marginBottom: 24 }}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="公司名称"
                name="companyName"
                rules={[{ required: true, message: '请输入公司名称' }]}
              >
                <Input placeholder="输入公司名称" size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="公司 Logo URL" name="logo">
                <Space.Compact style={{ width: '100%' }}>
                  <Input
                    placeholder="输入 Logo 图片 URL 或点击上传"
                    size="large"
                  />
                  <Upload
                    customRequest={handleLogoUpload}
                    beforeUpload={beforeUpload}
                    showUploadList={false}
                    accept=".jpg,.jpeg,.png"
                  >
                    <Button
                      size="large"
                      icon={<UploadOutlined />}
                      loading={uploadingLogo}
                    >
                      上传
                    </Button>
                  </Upload>
                </Space.Compact>
              </Form.Item>
            </Col>
          </Row>

          {logo && (
            <div style={{ marginBottom: 24 }}>
              <p style={{ marginBottom: 8, color: '#666' }}>Logo 预览：</p>
              <Image src={logo} alt="Logo" height={60} style={{ objectFit: 'contain' }} />
            </div>
          )}

          <Form.Item label="首页英雄区展示图 URL" name="heroImage">
            <Space.Compact style={{ width: '100%' }}>
              <Input
                placeholder="输入展示图 URL 或点击上传"
                size="large"
              />
              <Upload
                customRequest={handleHeroUpload}
                beforeUpload={beforeUpload}
                showUploadList={false}
                accept=".jpg,.jpeg,.png"
              >
                <Button
                  size="large"
                  icon={<UploadOutlined />}
                  loading={uploadingHero}
                >
                  上传
                </Button>
              </Upload>
            </Space.Compact>
          </Form.Item>

          {heroImage && (
            <div>
              <p style={{ marginBottom: 8, color: '#666' }}>展示图预览：</p>
              <Image
                src={heroImage}
                alt="Hero"
                height={150}
                style={{ objectFit: 'contain' }}
              />
            </div>
          )}

          <Divider />

          <h3 style={{ marginBottom: 16, color: '#666' }}>英雄区内容设置</h3>
          
          <Form.Item 
            label="主标题" 
            name="heroTitle"
            extra="显示在英雄区的主标题"
          >
            <Input
              placeholder="例如: 创新科技"
              size="large"
              maxLength={50}
              showCount
            />
          </Form.Item>

          <Form.Item 
            label="副标题" 
            name="heroSubtitle"
            extra="主标题下方的亮点文字（橙色显示）"
          >
            <Input
              placeholder="例如: 智享生活"
              size="large"
              maxLength={50}
              showCount
            />
          </Form.Item>

          <Form.Item 
            label="描述文字" 
            name="heroDescription"
            extra="英雄区的详细描述"
          >
            <TextArea
              placeholder="输入英雄区的描述内容"
              rows={3}
              maxLength={200}
              showCount
            />
          </Form.Item>

          <Divider />

          <h3 style={{ marginBottom: 16, color: '#666' }}>统计数据设置</h3>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                label="满意客户数量" 
                name="statsCustomers"
                extra="显示在英雄区的客户数量统计"
                rules={[
                  { required: true, message: '请输入客户数量' },
                  { type: 'number', min: 0, message: '必须大于等于0' }
                ]}
              >
                <InputNumber
                  placeholder="例如: 1000"
                  size="large"
                  style={{ width: '100%' }}
                  min={0}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                label="好评率 (%)" 
                name="statsRating"
                extra="显示在英雄区的好评率统计"
                rules={[
                  { required: true, message: '请输入好评率' },
                  { type: 'number', min: 0, max: 100, message: '必须在0-100之间' }
                ]}
              >
                <InputNumber
                  placeholder="例如: 98"
                  size="large"
                  style={{ width: '100%' }}
                  min={0}
                  max={100}
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <Form.Item 
            label="关于我们" 
            name="aboutUs"
            extra="介绍公司的历史、使命、愿景等信息"
          >
            <TextArea
              placeholder="输入关于我们的内容"
              rows={8}
              maxLength={2000}
              showCount
            />
          </Form.Item>

          <Divider />

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                label="联系邮箱" 
                name="contactEmail"
                rules={[
                  { type: 'email', message: '请输入有效的邮箱地址' }
                ]}
              >
                <Input
                  placeholder="例如: support@axiarz.com"
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                label="联系电话" 
                name="contactPhone"
              >
                <Input
                  placeholder="例如: 400-123-4567"
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      {/* 品牌优势 */}
      <Card
        title={
          <Space>
            <ThunderboltOutlined style={{ color: '#52c41a' }} />
            品牌优势
          </Space>
        }
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={addAdvantage}>
            添加优势
          </Button>
        }
        style={{ marginBottom: 24 }}
      >
        {advantages.length === 0 ? (
          <Empty description="暂无品牌优势，点击右上角按钮添加" />
        ) : (
          <Collapse>
            {advantages.map((adv, index) => (
              <Panel
                header={
                  <Space>
                    <Tag color="blue">优势 {index + 1}</Tag>
                    <span>{adv.title || '未命名'}</span>
                    {adv.icon && <span style={{ fontSize: 20 }}>{adv.icon}</span>}
                  </Space>
                }
                key={adv.id}
                extra={
                  <Button
                    type="text"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={(e) => {
                      e.stopPropagation()
                      removeAdvantage(index)
                    }}
                  >
                    删除
                  </Button>
                }
              >
                <Row gutter={16}>
                  <Col span={8}>
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
                        标题 *
                      </label>
                      <Input
                        value={adv.title}
                        onChange={(e) => updateAdvantage(index, 'title', e.target.value)}
                        placeholder="如：专业服务"
                      />
                    </div>
                  </Col>
                  <Col span={8}>
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
                        图标 Emoji
                      </label>
                      <Input
                        value={adv.icon}
                        onChange={(e) => updateAdvantage(index, 'icon', e.target.value)}
                        placeholder="如: ✓, ⚡, ❤"
                        maxLength={2}
                      />
                    </div>
                  </Col>
                  <Col span={8}>
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
                        排序
                      </label>
                      <InputNumber
                        value={adv.sortOrder}
                        onChange={(value) => updateAdvantage(index, 'sortOrder', value || 0)}
                        style={{ width: '100%' }}
                        min={0}
                      />
                    </div>
                  </Col>
                  <Col span={24}>
                    <div>
                      <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
                        描述 *
                      </label>
                      <TextArea
                        value={adv.description}
                        onChange={(e) =>
                          updateAdvantage(index, 'description', e.target.value)
                        }
                        rows={3}
                        placeholder="详细描述这个优势..."
                      />
                    </div>
                  </Col>
                </Row>
              </Panel>
            ))}
          </Collapse>
        )}
      </Card>

      {/* 客户口碑 */}
      <Card
        title={
          <Space>
            <StarOutlined style={{ color: '#faad14' }} />
            客户口碑
          </Space>
        }
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={addTestimonial}>
            添加评价
          </Button>
        }
      >
        {testimonials.length === 0 ? (
          <Empty description="暂无客户评价，点击右上角按钮添加" />
        ) : (
          <Collapse>
            {testimonials.map((test, index) => (
              <Panel
                header={
                  <Space>
                    <Tag color="orange">评价 {index + 1}</Tag>
                    <Avatar
                      size="small"
                      src={test.avatar}
                      icon={<UserOutlined />}
                    />
                    <span>{test.name || '未命名'}</span>
                    <Rate disabled value={test.rating} style={{ fontSize: 14 }} />
                  </Space>
                }
                key={test.id}
                extra={
                  <Button
                    type="text"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={(e) => {
                      e.stopPropagation()
                      removeTestimonial(index)
                    }}
                  >
                    删除
                  </Button>
                }
              >
                <Row gutter={16}>
                  <Col span={8}>
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
                        客户名称 *
                      </label>
                      <Input
                        value={test.name}
                        onChange={(e) =>
                          updateTestimonial(index, 'name', e.target.value)
                        }
                        placeholder="客户姓名"
                      />
                    </div>
                  </Col>
                  <Col span={8}>
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
                        客户头像 URL
                      </label>
                      <Input
                        value={test.avatar || ''}
                        onChange={(e) =>
                          updateTestimonial(index, 'avatar', e.target.value)
                        }
                        placeholder="头像图片URL（可选）"
                      />
                    </div>
                  </Col>
                  <Col span={4}>
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
                        评分 *
                      </label>
                      <Rate
                        value={test.rating}
                        onChange={(value) => updateTestimonial(index, 'rating', value)}
                      />
                    </div>
                  </Col>
                  <Col span={4}>
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
                        排序
                      </label>
                      <InputNumber
                        value={test.sortOrder}
                        onChange={(value) =>
                          updateTestimonial(index, 'sortOrder', value || 0)
                        }
                        style={{ width: '100%' }}
                        min={0}
                      />
                    </div>
                  </Col>
                  <Col span={24}>
                    <div>
                      <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
                        评价内容 *
                      </label>
                      <TextArea
                        value={test.content}
                        onChange={(e) =>
                          updateTestimonial(index, 'content', e.target.value)
                        }
                        rows={3}
                        placeholder="客户的评价内容..."
                      />
                    </div>
                  </Col>
                </Row>
              </Panel>
            ))}
          </Collapse>
        )}
      </Card>

      {/* 底部保存按钮 */}
      <div style={{ marginTop: 24, textAlign: 'right' }}>
        <Button
          type="primary"
          size="large"
          icon={<SaveOutlined />}
          onClick={handleSave}
          loading={saving}
        >
          保存所有设置
        </Button>
      </div>
    </div>
  )
}

