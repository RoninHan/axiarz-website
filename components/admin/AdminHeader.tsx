'use client'

import { useRouter, usePathname } from 'next/navigation'
import { Layout, Button, Modal, Space, Typography, Breadcrumb } from 'antd'
import { LogoutOutlined, ExclamationCircleOutlined, HomeOutlined } from '@ant-design/icons'

const { Header } = Layout
const { Text } = Typography

export default function AdminHeader() {
  const router = useRouter()
  const pathname = usePathname()

  // 生成面包屑
  const getBreadcrumbs = () => {
    const pathMap: Record<string, string> = {
      '/admin': '仪表盘',
      '/admin/users': '用户管理',
      '/admin/categories': '分类管理',
      '/admin/products': '产品管理',
      '/admin/solutions': '解决方案',
      '/admin/help-articles': '帮助文章',
      '/admin/files': '文件管理',
      '/admin/orders': '订单管理',
      '/admin/payment-configs': '支付配置',
      '/admin/email-settings': '邮件配置',
      '/admin/settings': '系统设置',
    }

    const segments = pathname.split('/').filter(Boolean)
    const breadcrumbs: Array<{ title: React.ReactNode; href?: string }> = [
      {
        title: <HomeOutlined />,
        href: '/admin',
      }
    ]

    let currentPath = ''
    segments.forEach((segment, index) => {
      currentPath += '/' + segment
      if (index > 0) { // 跳过 'admin'
        const title: React.ReactNode = pathMap[currentPath] || segment
        breadcrumbs.push({
          title,
          href: currentPath,
        })
      }
    })

    return breadcrumbs
  }

  function handleLogout() {
    Modal.confirm({
      title: '退出登录',
      icon: <ExclamationCircleOutlined />,
      content: '确定要退出登录吗？',
      okText: '确定',
      cancelText: '取消',
      onOk() {
        // 清除 token
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
        window.location.href = '/admin/login'
      }
    })
  }

  return (
    <Header
      style={{
        background: '#fff',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #f0f0f0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}
    >
      <Breadcrumb
        items={getBreadcrumbs()}
        style={{ fontSize: '14px' }}
      />
      <Space>
        <Text type="secondary" style={{ fontSize: '14px' }}>管理员</Text>
        <Button
          type="text"
          danger
          icon={<LogoutOutlined />}
          onClick={handleLogout}
        >
          退出登录
        </Button>
      </Space>
    </Header>
  )
}

