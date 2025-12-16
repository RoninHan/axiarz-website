'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Button from './Button'
import { useAuth } from '@/contexts/AuthContext'
import { useState, useEffect } from 'react'

export default function ClientNavbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading, logout, isAuthenticated } = useAuth()
  const [logo, setLogo] = useState<string>('')
  const [companyName, setCompanyName] = useState<string>('Axiarz')

  useEffect(() => {
    fetch('/api/client/settings')
      .then(res => res.json())
      .then(data => {
        if (data.settings) {
          const logoSetting = data.settings.find((s: any) => s.key === 'logo')
          const nameSetting = data.settings.find((s: any) => s.key === 'companyName')
          if (logoSetting?.value) setLogo(logoSetting.value as string)
          if (nameSetting?.value) setCompanyName(nameSetting.value as string)
        }
      })
      .catch(err => console.error('Failed to load settings:', err))
  }, [])

  function handleLogout() {
    if (confirm('确定要退出登录吗？')) {
      logout()
      router.push('/')
      router.refresh()
    }
  }

  return (
    <nav className="bg-primary-black text-primary-white h-20 flex items-center">
      <div className="container mx-auto px-6 flex items-center justify-between w-full max-w-[1920px]">
        <Link href="/" className="flex items-center gap-3">
          {logo ? (
            <img src={logo} alt={companyName} className="h-12 w-auto" />
          ) : (
            <span className="text-title-medium font-title">{companyName}</span>
          )}
        </Link>
        
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className={`text-body hover:text-accent-orange transition-colors ${
              pathname === '/' ? 'text-accent-orange' : ''
            }`}
          >
            首页
          </Link>
          <Link
            href="/products"
            className={`text-body hover:text-accent-orange transition-colors ${
              pathname?.startsWith('/products') ? 'text-accent-orange' : ''
            }`}
          >
            产品
          </Link>
          <Link
            href="/solutions"
            className={`text-body hover:text-accent-orange transition-colors ${
              pathname === '/solutions' ? 'text-accent-orange' : ''
            }`}
          >
            解决方案
          </Link>
          <Link
            href="/cart"
            className={`text-body hover:text-accent-orange transition-colors ${
              pathname === '/cart' ? 'text-accent-orange' : ''
            }`}
          >
            购物车
          </Link>
          
          {loading ? (
            <span className="text-body text-neutral-medium">加载中...</span>
          ) : isAuthenticated ? (
            <div className="flex items-center gap-4">
              <span className="text-body">
                欢迎，{user?.name || user?.email}
              </span>
              <Link href="/orders">
                <Button variant="outline-white" className="text-sm">
                  我的订单
                </Button>
              </Link>
              <Button
                variant="secondary"
                className="text-sm"
                onClick={handleLogout}
              >
                退出
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="outline-white" className="text-sm">
                  登录
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" className="text-sm">
                  注册
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

