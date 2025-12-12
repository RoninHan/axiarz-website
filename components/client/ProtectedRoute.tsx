'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Card from './Card'
import Button from './Button'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { isAuthenticated, loading } = useAuth()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, loading, router])

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-12 text-center">
        <p className="text-body text-neutral-medium">加载中...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-6 py-12 max-w-[1920px]">
        <Card className="text-center py-12">
          <p className="text-body text-neutral-medium mb-4">请先登录</p>
          <div className="flex gap-4 justify-center">
            <Button variant="primary" onClick={() => router.push('/client/login')}>
              去登录
            </Button>
            <Button variant="outline" onClick={() => router.push('/register')}>
              去注册
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}

