'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { User } from '@/types'
import { usePathname } from 'next/navigation'

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
  const pathname = usePathname()
  
  // 判断当前是否在 admin 路径下
  const isAdminPath = pathname?.startsWith('/admin')
  const tokenName = isAdminPath ? 'admin_token' : 'client_token'

  useEffect(() => {
    // 只在客户端检查认证状态
    if (typeof window !== 'undefined') {
      checkAuth()
    } else {
      setLoading(false)
    }
  }, [pathname])

  async function checkAuth() {
    try {
      // 从cookie中读取对应的token
      const res = await fetch('/api/auth/me', {
        credentials: 'include',
        headers: {
          'X-Auth-Type': isAdminPath ? 'admin' : 'client'
        }
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
        headers: { 
          'Content-Type': 'application/json',
          'X-Auth-Type': isAdminPath ? 'admin' : 'client'
        },
        credentials: 'include',
        body: JSON.stringify({ 
          email, 
          password, 
          type: isAdminPath ? 'admin' : 'user' 
        }),
      })
      const data = await res.json()

      if (data.success) {
        // 保存token到对应的cookie
        if (typeof document !== 'undefined') {
          document.cookie = `${tokenName}=${data.data.token}; path=/; max-age=604800; SameSite=Strict`
        }
        setUser(data.data.user || data.data.admin)
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
        headers: { 
          'Content-Type': 'application/json',
          'X-Auth-Type': 'client'
        },
        credentials: 'include',
        body: JSON.stringify({ email, password, name }),
      })
      const data = await res.json()

      if (data.success) {
        // 注册只用于 client，保存到 client_token
        if (typeof document !== 'undefined') {
          document.cookie = `client_token=${data.data.token}; path=/; max-age=604800; SameSite=Strict`
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
      // 清除对应的 token
      document.cookie = `${tokenName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
      // 为了安全，也清除旧的通用 token（兼容旧版本）
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    }
    setUser(null)
  }

  async function refreshUser() {
    try {
      const res = await fetch('/api/auth/me', {
        credentials: 'include',
        headers: {
          'X-Auth-Type': isAdminPath ? 'admin' : 'client'
        }
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

