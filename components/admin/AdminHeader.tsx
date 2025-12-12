'use client'

import { useRouter } from 'next/navigation'

export default function AdminHeader() {
  const router = useRouter()

  function handleLogout() {
    if (confirm('确定要退出登录吗？')) {
      // 清除 token
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      router.push('/admin/login')
    }
  }

  return (
    <header className="h-[60px] bg-primary-white border-b border-neutral-medium flex items-center justify-between px-6">
      <h2 className="text-title-small font-title">管理后台</h2>
      <button
        onClick={handleLogout}
        className="text-body text-neutral-medium hover:text-primary-black transition-colors"
      >
        退出登录
      </button>
    </header>
  )
}

