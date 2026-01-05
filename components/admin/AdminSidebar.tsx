'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Layout, Menu } from 'antd'
import {
  DashboardOutlined,
  UserOutlined,
  FolderOutlined,
  InboxOutlined,
  BulbOutlined,
  QuestionCircleOutlined,
  FileOutlined,
  ShoppingOutlined,
  CreditCardOutlined,
  MailOutlined,
  SettingOutlined,
  DollarOutlined,
  FileTextOutlined,
  GiftOutlined,
  ToolOutlined,
  CarOutlined,
  TeamOutlined,
  SafetyOutlined,
  FormOutlined,
} from '@ant-design/icons'

const { Sider } = Layout

interface AdminUser {
  id: string
  email: string
  name: string
  role: string
  permissions?: Array<{
    id: string
    name: string
    resource: string
    action: string
  }>
}

interface MenuItem {
  key: string
  label: string
  icon: React.ReactNode
  resource?: string
  action?: string
  superAdminOnly?: boolean
}

export default function AdminSidebar() {
  const pathname = usePathname()
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCurrentUser()
  }, [])

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: {
          'X-Auth-Type': 'admin',
        },
      })
      const data = await res.json()
      if (data.success) {
        setCurrentUser(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch current user:', error)
    } finally {
      setLoading(false)
    }
  }

  // 检查是否是超级管理员
  const isSuperAdmin = (): boolean => {
    return currentUser?.role === 'super_admin'
  }

  // 检查是否有权限访问菜单
  const hasMenuPermission = (resource?: string, action: string = 'read'): boolean => {
    if (!currentUser) return false
    
    // 超级管理员拥有所有权限
    if (isSuperAdmin()) return true
    
    // 如果没有指定资源，默认允许访问
    if (!resource) return true
    
    // 检查是否有指定权限
    return currentUser.permissions?.some(
      p => p.resource === resource && (p.action === action || p.action === 'manage')
    ) || false
  }

  // 判断菜单项是否应该显示
  const shouldShowMenuItem = (item: MenuItem): boolean => {
    // 如果是超级管理员专属菜单
    if (item.superAdminOnly) {
      return isSuperAdmin()
    }
    
    // 如果没有指定资源，默认显示（如仪表盘）
    if (!item.resource) {
      return true
    }
    
    // 检查资源权限
    return hasMenuPermission(item.resource, item.action)
  }

  // 定义所有菜单项
  const allMenuItems: MenuItem[] = [
    { 
      key: '/admin', 
      label: '仪表盘', 
      icon: <DashboardOutlined /> 
    },
    { 
      key: '/admin/users', 
      label: '用户管理', 
      icon: <UserOutlined />, 
      resource: 'user',
      action: 'read'
    },
    { 
      key: '/admin/admins', 
      label: '管理员管理', 
      icon: <TeamOutlined />, 
      resource: 'admin',
      action: 'read'
    },
    { 
      key: '/admin/permissions', 
      label: '权限管理', 
      icon: <SafetyOutlined />, 
      superAdminOnly: true
    },
    { 
      key: '/admin/categories', 
      label: '分类管理', 
      icon: <FolderOutlined />, 
      resource: 'category',
      action: 'read'
    },
    { 
      key: '/admin/products', 
      label: '产品管理', 
      icon: <InboxOutlined />, 
      resource: 'product',
      action: 'read'
    },
    { 
      key: '/admin/orders', 
      label: '订单管理', 
      icon: <ShoppingOutlined />, 
      resource: 'order',
      action: 'read'
    },
    { 
      key: '/admin/invoices', 
      label: '发票管理', 
      icon: <FileTextOutlined />, 
      resource: 'invoice',
      action: 'read'
    },
    { 
      key: '/admin/refund-requests', 
      label: '退款申请', 
      icon: <DollarOutlined />, 
      resource: 'refund',
      action: 'read'
    },
    { 
      key: '/admin/repairs', 
      label: '维修工单', 
      icon: <ToolOutlined />, 
      resource: 'repair',
      action: 'read'
    },
    { 
      key: '/admin/coupons', 
      label: '优惠券管理', 
      icon: <GiftOutlined />, 
      resource: 'coupon',
      action: 'read'
    },
    { 
      key: '/admin/courier-companies', 
      label: '物流管理', 
      icon: <CarOutlined />, 
      resource: 'courier',
      action: 'read'
    },
    { 
      key: '/admin/solutions', 
      label: '解决方案', 
      icon: <BulbOutlined />, 
      resource: 'system',
      action: 'read'
    },
    { 
      key: '/admin/help-articles', 
      label: '帮助文章', 
      icon: <QuestionCircleOutlined />, 
      resource: 'system',
      action: 'read'
    },
    { 
      key: '/admin/files', 
      label: '文件管理', 
      icon: <FileOutlined />, 
      resource: 'file',
      action: 'read'
    },
    { 
      key: '/admin/payment-configs', 
      label: '支付配置', 
      icon: <CreditCardOutlined />, 
      resource: 'payment',
      action: 'read'
    },
    { 
      key: '/admin/email-settings', 
      label: '邮件配置', 
      icon: <MailOutlined />, 
      superAdminOnly: true
    },
    { 
      key: '/admin/contract-template', 
      label: '合同模板', 
      icon: <FormOutlined />, 
      resource: 'system',
      action: 'manage'
    },
    { 
      key: '/admin/settings', 
      label: '系统设置', 
      icon: <SettingOutlined />, 
      resource: 'system',
      action: 'manage'
    },
  ]

  // 过滤出有权限访问的菜单项
  const menuItems = allMenuItems.filter(item => shouldShowMenuItem(item))

  // 确定当前选中的菜单项
  const selectedKey = menuItems.find(item => {
    if (item.key === '/admin') {
      return pathname === '/admin'
    }
    return pathname === item.key || pathname?.startsWith(item.key + '/')
  })?.key || '/admin'

  if (loading) {
    return (
      <Sider
        width={240}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <div style={{ padding: '20px', color: '#fff', textAlign: 'center' }}>
          加载中...
        </div>
      </Sider>
    )
  }

  return (
    <Sider
      width={240}
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
        boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
      }}
    >
      <div
        style={{
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <h1 style={{ 
          color: '#fff', 
          fontSize: '20px', 
          fontWeight: 'bold',
          margin: 0,
          letterSpacing: '1px',
        }}>
          AXIARZ Admin
        </h1>
      </div>
      
      {/* 显示当前用户信息 */}
      {currentUser && (
        <div style={{ 
          padding: '12px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          color: '#fff',
          fontSize: '12px'
        }}>
          <div style={{ fontWeight: 'bold' }}>{currentUser.name || currentUser.email}</div>
          <div style={{ opacity: 0.7, marginTop: '4px' }}>
            {currentUser.role === 'super_admin' ? '超级管理员' : '管理员'}
          </div>
        </div>
      )}

      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        style={{
          background: 'transparent',
          border: 'none',
          marginTop: '16px',
        }}
        theme="dark"
      >
        {menuItems.map((item) => (
          <Menu.Item key={item.key} icon={item.icon}>
            <Link href={item.key}>{item.label}</Link>
          </Menu.Item>
        ))}
      </Menu>
    </Sider>
  )
}
