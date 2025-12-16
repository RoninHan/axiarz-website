'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function AdminSidebar() {
  const pathname = usePathname()

  const menuItems = [
    { href: '/admin', label: '仪表盘', icon: '📊' },
    { href: '/admin/users', label: '用户管理', icon: '👥' },
    { href: '/admin/categories', label: '分类管理', icon: '📁' },
    { href: '/admin/products', label: '产品管理', icon: '📦' },
    { href: '/admin/files', label: '文件管理', icon: '📂' },
    { href: '/admin/orders', label: '订单管理', icon: '📋' },
    { href: '/admin/payment-configs', label: '支付配置', icon: '💳' },
    { href: '/admin/settings', label: '系统设置', icon: '⚙️' },
  ]

  return (
    <aside className="w-[220px] bg-primary-black text-primary-white h-screen fixed left-0 top-0">
      <div className="p-6 border-b border-neutral-medium">
        <h1 className="text-title-medium font-title">Admin Portal</h1>
      </div>
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            // 特殊处理仪表盘，只有完全匹配才高亮
            const isActive = item.href === '/admin'
              ? pathname === '/admin'
              : pathname === item.href || pathname?.startsWith(item.href + '/')
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-default transition-colors ${
                    isActive
                      ? 'bg-accent-orange text-primary-white'
                      : 'hover:bg-neutral-medium text-neutral-medium hover:text-primary-white'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span className="text-body">{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}

