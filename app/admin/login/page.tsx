'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/client/Button'
import Input from '@/components/client/Input'
import Card from '@/components/client/Card'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, type: 'admin' }),
      })
      const data = await res.json()

      if (data.success) {
        // 保存 token
        document.cookie = `token=${data.data.token}; path=/; max-age=604800`
        router.push('/admin')
      } else {
        setError(data.error || '登录失败')
      }
    } catch (error) {
      setError('登录失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-light flex items-center justify-center">
      <Card className="w-full max-w-md">
        <h1 className="text-title-large font-title mb-6 text-center">管理员登录</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="邮箱"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="密码"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
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
      </Card>
    </div>
  )
}

