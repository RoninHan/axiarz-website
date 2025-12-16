'use client'

import Card from '@/components/client/Card'
import Input from '@/components/client/Input'
import Textarea from '@/components/client/Textarea'
import Button from '@/components/client/Button'
import { useState } from 'react'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // 模拟提交
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setLoading(false)
    setSubmitted(true)
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    })

    setTimeout(() => setSubmitted(false), 5000)
  }

  const contactMethods = [
    {
      icon: '📞',
      title: '客服电话',
      content: '400-888-8888',
      description: '周一至周五 9:00-18:00'
    },
    {
      icon: '📧',
      title: '电子邮箱',
      content: 'support@axiarz.com',
      description: '我们会在24小时内回复'
    },
    {
      icon: '💬',
      title: '在线客服',
      content: '即时沟通',
      description: '工作时间在线服务'
    },
    {
      icon: '📍',
      title: '公司地址',
      content: '北京市朝阳区xxx路xxx号',
      description: '欢迎预约参观'
    }
  ]

  return (
    <div className="min-h-screen bg-neutral-light">
      {/* 页头 */}
      <div className="bg-primary-black text-primary-white py-16">
        <div className="container mx-auto px-6 max-w-[1920px]">
          <h1 className="text-title-large font-title mb-4">联系我们</h1>
          <p className="text-body text-neutral-medium">
            有任何问题或建议？我们随时倾听您的声音
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 max-w-[1920px] py-12">
        {/* 联系方式 */}
        <section className="mb-16">
          <h2 className="text-title-medium font-title mb-8 text-center">联系方式</h2>
          <div className="grid grid-cols-4 gap-6">
            {contactMethods.map((method, index) => (
              <Card key={index}>
                <div className="text-center">
                  <div className="text-5xl mb-4">{method.icon}</div>
                  <h3 className="text-title-small font-title mb-2">
                    {method.title}
                  </h3>
                  <p className="text-body font-medium text-accent-orange mb-2">
                    {method.content}
                  </p>
                  <p className="text-caption text-neutral-medium">
                    {method.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* 在线留言表单 */}
        <section className="max-w-3xl mx-auto">
          <Card>
            <h2 className="text-title-medium font-title mb-6 text-center">在线留言</h2>
            <p className="text-body text-neutral-medium mb-8 text-center">
              请填写以下信息，我们会尽快与您联系
            </p>

            {submitted && (
              <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-default">
                感谢您的留言！我们已收到您的信息，会尽快与您联系。
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <Input
                  label="姓名"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="请输入您的姓名"
                  required
                />
                <Input
                  label="邮箱"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="请输入您的邮箱"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <Input
                  label="电话"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="请输入您的电话"
                  required
                />
                <Input
                  label="主题"
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  placeholder="请输入留言主题"
                  required
                />
              </div>

              <Textarea
                label="留言内容"
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                placeholder="请详细描述您的问题或建议..."
                rows={6}
                required
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={loading}
              >
                {loading ? '提交中...' : '提交留言'}
              </Button>
            </form>
          </Card>
        </section>

        {/* 工作时间 */}
        <section className="mt-16">
          <Card className="bg-primary-black text-primary-white">
            <div className="text-center">
              <h3 className="text-title-medium font-title mb-4">客服工作时间</h3>
              <div className="grid grid-cols-3 gap-8 mt-8">
                <div>
                  <p className="text-title-small font-medium mb-2">周一至周五</p>
                  <p className="text-body text-neutral-medium">9:00 - 18:00</p>
                </div>
                <div>
                  <p className="text-title-small font-medium mb-2">周六</p>
                  <p className="text-body text-neutral-medium">10:00 - 17:00</p>
                </div>
                <div>
                  <p className="text-title-small font-medium mb-2">周日及节假日</p>
                  <p className="text-body text-neutral-medium">休息</p>
                </div>
              </div>
              <p className="text-caption text-neutral-medium mt-6">
                非工作时间您可以通过邮箱留言，我们会在下一个工作日回复
              </p>
            </div>
          </Card>
        </section>
      </div>
    </div>
  )
}
