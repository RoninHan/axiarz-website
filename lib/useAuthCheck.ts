import { useRouter } from 'next/navigation'
import { message } from 'antd'

export function useAuthCheck() {
  const router = useRouter()

  const handleAuthError = (status: number, error?: string) => {
    if (status === 401) {
      message.error('登录已过期，请重新登录')
      // 清除 token cookie
      document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'
      router.push('/admin/login')
      return true
    }
    return false
  }

  const fetchWithAuth = async (url: string, options?: RequestInit) => {
    try {
      const res = await fetch(url, {
        ...options,
        credentials: 'include',
      })

      // 检查认证错误
      if (handleAuthError(res.status)) {
        return null
      }

      return res
    } catch (error) {
      console.error('请求失败:', error)
      throw error
    }
  }

  return { handleAuthError, fetchWithAuth }
}
