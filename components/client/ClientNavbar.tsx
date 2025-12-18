'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button, Modal, Dropdown } from 'antd'
import { ShoppingCartOutlined, UserOutlined, LogoutOutlined, LoginOutlined, UserAddOutlined, ExclamationCircleOutlined, DownOutlined, ProfileOutlined, OrderedListOutlined } from '@ant-design/icons'
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
        if (data.success && data.data) {
          if (data.data.logo) setLogo(data.data.logo)
          if (data.data.companyName) setCompanyName(data.data.companyName)
        }
      })
      .catch(err => console.error('Failed to load settings:', err))
  }, [])

  function handleLogout() {
    Modal.confirm({
      title: '退出登录',
      icon: <ExclamationCircleOutlined />,
      content: '确定要退出登录吗？',
      okText: '确定',
      cancelText: '取消',
      onOk() {
        logout()
        router.push('/')
        router.refresh()
      }
    })
  }

  return (
    <nav className="text-primary-white h-20 flex items-center" style={{ backgroundColor: '#373737' }}>
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
            className={`text-body hover:text-accent-orange transition-colors no-underline ${
              pathname === '/' ? 'text-accent-orange' : 'text-white'
            }`}
          >
            首页
          </Link>
          <Link
            href="/products"
            className={`text-body hover:text-accent-orange transition-colors no-underline ${
              pathname?.startsWith('/products') ? 'text-accent-orange' : 'text-white'
            }`}
          >
            产品
          </Link>
          <Link
            href="/solutions"
            className={`text-body hover:text-accent-orange transition-colors no-underline ${
              pathname === '/solutions' ? 'text-accent-orange' : 'text-white'
            }`}
          >
            解决方案
          </Link>
          <Link
            href="/about"
            className={`text-body hover:text-accent-orange transition-colors no-underline ${
              pathname === '/about' ? 'text-accent-orange' : 'text-white'
            }`}
          >
            关于我们
          </Link>
          <Link
            href="/cart"
            className={`text-body hover:text-accent-orange transition-colors flex items-center gap-1 no-underline ${
              pathname === '/cart' ? 'text-accent-orange' : 'text-white'
            }`}
          >
            <ShoppingCartOutlined />
            购物车
          </Link>
          
          {loading ? (
            <span className="text-body text-neutral-medium">加载中...</span>
          ) : isAuthenticated ? (
            <div className="flex items-center gap-4">
              <Dropdown 
                menu={{ 
                  items: [
                    {
                      key: 'profile',
                      label: '个人中心',
                      icon: <ProfileOutlined />,
                      onClick: () => router.push('/profile'),
                    },
                    {
                      key: 'orders',
                      label: '我的订单',
                      icon: <OrderedListOutlined />,
                      onClick: () => router.push('/orders'),
                    },
                    {
                      type: 'divider',
                    },
                    {
                      key: 'logout',
                      label: '退出登录',
                      icon: <LogoutOutlined />,
                      onClick: handleLogout,
                      danger: true,
                    },
                  ]
                }} 
                placement="bottomRight"
                trigger={['click']}
              >
                <Button
                  type="text"
                  size="middle"
                  className="text-white hover:!bg-white hover:!text-primary-black"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <UserOutlined />
                  <span>欢迎，{user?.name || user?.email}</span>
                  <DownOutlined style={{ fontSize: '12px' }} />
                </Button>
              </Dropdown>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/login" passHref legacyBehavior>
                <Button type="default" size="middle" icon={<LoginOutlined />} ghost className="border-white text-white hover:bg-white hover:text-primary-black">
                  登录
                </Button>
              </Link>
              <Link href="/register" passHref legacyBehavior>
                <Button type="primary" size="middle" icon={<UserAddOutlined />}>
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

