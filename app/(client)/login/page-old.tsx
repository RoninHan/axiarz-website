'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/client/Button'
import Card from '@/components/client/Card'
import Input from '@/components/client/Input'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await login(email, password)
    if (result.success) {
      router.push('/')
      router.refresh()
    } else {
      setError(result.error || '登录失败')
    }
    setLoading(false)
  }

  return (
    <div className="container mx-auto px-6 py-12 max-w-[1920px]">
      <div className="max-w-md mx-auto">
        <Card>
          <h1 className="text-title-large font-title mb-6 text-center">用户登录</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="邮箱"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="请输入邮箱"
            />
            <Input
              label="密码"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="请输入密码"
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
              {loading ? '登录中...' : '登录'}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-body text-neutral-medium">
              还没有账号？{' '}
              <Link href="/register" className="text-accent-orange hover:underline">
                立即注册
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}

