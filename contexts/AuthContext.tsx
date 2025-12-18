'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { User } from '@/types'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (email: string, password: string, name?: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  refreshUser: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 只在客户端检查认证状态
    if (typeof window !== 'undefined') {
      checkAuth()
    } else {
      setLoading(false)
    }
  }, [])

  async function checkAuth() {
    try {
      // 从cookie中读取token，通过API验证
      const res = await fetch('/api/auth/me', {
        credentials: 'include',
      })
      const data = await res.json()
      if (data.success && data.data) {
        setUser(data.data)
      } else {
        setUser(null)
      }
    } catch (error) {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  async function login(email: string, password: string) {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, type: 'user' }),
      })
      const data = await res.json()

      if (data.success) {
        // 保存token到cookie
        if (typeof document !== 'undefined') {
          document.cookie = `token=${data.data.token}; path=/; max-age=604800`
        }
        setUser(data.data.user)
        return { success: true }
      } else {
        return { success: false, error: data.error || '登录失败' }
      }
    } catch (error) {
      return { success: false, error: '网络错误，请稍后重试' }
    }
  }

  async function register(email: string, password: string, name?: string) {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, name }),
      })
      const data = await res.json()

      if (data.success) {
        // 保存token到cookie
        if (typeof document !== 'undefined') {
          document.cookie = `token=${data.data.token}; path=/; max-age=604800`
        }
        setUser(data.data.user)
        return { success: true }
      } else {
        return { success: false, error: data.error || '注册失败' }
      }
    } catch (error) {
      return { success: false, error: '网络错误，请稍后重试' }
    }
  }

  function logout() {
    if (typeof document !== 'undefined') {
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    }
    setUser(null)
  }

  async function refreshUser() {
    try {
      const res = await fetch('/api/auth/me', {
        credentials: 'include',
      })
      const data = await res.json()
      if (data.success && data.data) {
        setUser(data.data)
      }
    } catch (error) {
      console.error('刷新用户信息失败:', error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

