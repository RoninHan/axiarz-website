'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { message } from 'antd'
import { LockOutlined, LeftOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons'
import Link from 'next/link'
import Button from '@/components/client/Button'
import Card from '@/components/client/Card'
import ProtectedRoute from '@/components/client/ProtectedRoute'

function ChangePasswordPageContent() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [messageApi, contextHolder] = message.useMessage()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    // 验证表单
    if (!formData.oldPassword) {
      messageApi.error('请输入当前密码')
      return
    }

    if (!formData.newPassword) {
      messageApi.error('请输入新密码')
      return
    }

    if (formData.newPassword.length < 6) {
      messageApi.error('新密码长度至少为6位')
      return
    }

    if (!formData.confirmPassword) {
      messageApi.error('请确认新密码')
      return
    }

    if (formData.newPassword !== formData.confirmPassword) {
      messageApi.error('两次输入的新密码不一致')
      return
    }

    if (formData.oldPassword === formData.newPassword) {
      messageApi.error('新密码不能与当前密码相同')
      return
    }

    try {
      setSubmitting(true)
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          oldPassword: formData.oldPassword,
          newPassword: formData.newPassword
        })
      })

      const data = await res.json()

      if (data.success) {
        messageApi.success('密码修改成功，请重新登录')
        setTimeout(() => {
          // 清除登录状态
          document.cookie = 'client_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
          router.push('/login')
        }, 1500)
      } else {
        messageApi.error(data.error || '密码修改失败')
      }
    } catch (error) {
      console.error('修改密码失败:', error)
      messageApi.error('修改密码失败，请稍后重试')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f4f4f4] py-8">
      {contextHolder}
      
      {/* 顶部返回栏 */}
      <div className="max-w-2xl mx-auto px-6 mb-6">
        <Link href="/profile" className="inline-flex items-center gap-2 text-gray-700 hover:text-accent-orange transition-colors">
          <LeftOutlined />
          <span>返回个人中心</span>
        </Link>
      </div>

      <div className="max-w-2xl mx-auto px-6">
        <Card className="bg-white">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <LockOutlined className="text-accent-orange" />
              修改密码
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              为了您的账户安全，建议定期更换密码
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 当前密码 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                当前密码 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showOldPassword ? 'text' : 'password'}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-orange focus:border-transparent"
                  placeholder="请输入当前密码"
                  value={formData.oldPassword}
                  onChange={(e) => setFormData({ ...formData, oldPassword: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                >
                  {showOldPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                </button>
              </div>
            </div>

            {/* 新密码 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                新密码 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-orange focus:border-transparent"
                  placeholder="请输入新密码（至少6位）"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                密码长度至少6位，建议包含字母、数字和特殊字符
              </p>
            </div>

            {/* 确认新密码 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                确认新密码 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-orange focus:border-transparent"
                  placeholder="请再次输入新密码"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                </button>
              </div>
            </div>

            {/* 安全提示 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-800 mb-2">安全提示</h4>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• 定期修改密码可以提高账户安全性</li>
                <li>• 不要使用过于简单的密码</li>
                <li>• 不要在多个网站使用相同的密码</li>
                <li>• 修改密码后需要重新登录</li>
              </ul>
            </div>

            {/* 提交按钮 */}
            <div className="flex gap-4">
              <Button
                type="submit"
                variant="primary"
                size="medium"
                loading={submitting}
                className="flex-1"
              >
                <LockOutlined className="mr-2" />
                确认修改
              </Button>
              <Button
                type="button"
                variant="outline"
                size="medium"
                onClick={() => router.back()}
                disabled={submitting}
                className="flex-1"
              >
                取消
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}

export default function ChangePasswordPage() {
  return (
    <ProtectedRoute>
      <ChangePasswordPageContent />
    </ProtectedRoute>
  )
}
