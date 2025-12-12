'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/client/Button'
import Card from '@/components/client/Card'
import Input from '@/components/client/Input'
import { useAuth } from '@/contexts/AuthContext'

export default function RegisterPage() {
  const router = useRouter()
  const { register } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    // 验证
    if (!formData.email || !formData.password) {
      setError('请填写邮箱和密码')
      return
    }

    if (formData.password.length < 6) {
      setError('密码长度至少6位')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }

    setLoading(true)

    const result = await register(formData.email, formData.password, formData.name || undefined)
    if (result.success) {
      router.push('/')
      router.refresh()
    } else {
      setError(result.error || '注册失败')
    }
    setLoading(false)
  }

  return (
    <div className="container mx-auto px-6 py-12 max-w-[1920px]">
      <div className="max-w-md mx-auto">
        <Card>
          <h1 className="text-title-large font-title mb-6 text-center">用户注册</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="邮箱"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              placeholder="请输入邮箱"
            />
            <Input
              label="姓名（可选）"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="请输入姓名"
            />
            <Input
              label="密码"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              placeholder="至少6位字符"
            />
            <Input
              label="确认密码"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
              placeholder="请再次输入密码"
            />
            {error && (
              <p className="text-red-500 text-caption">{error}</p>
            )}
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={loading}
            >
              {loading ? '注册中...' : '注册'}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-body text-neutral-medium">
              已有账号？{' '}
              <Link href="/login" className="text-accent-orange hover:underline">
                立即登录
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}

