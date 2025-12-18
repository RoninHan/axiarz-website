'use client'

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
} from '@ant-design/icons'

const { Sider } = Layout

export default function AdminSidebar() {
  const pathname = usePathname()

  const menuItems = [
    { key: '/admin', label: '仪表盘', icon: <DashboardOutlined /> },
    { key: '/admin/users', label: '用户管理', icon: <UserOutlined /> },
    { key: '/admin/categories', label: '分类管理', icon: <FolderOutlined /> },
    { key: '/admin/products', label: '产品管理', icon: <InboxOutlined /> },
    { key: '/admin/solutions', label: '解决方案', icon: <BulbOutlined /> },
    { key: '/admin/help-articles', label: '帮助文章', icon: <QuestionCircleOutlined /> },
    { key: '/admin/files', label: '文件管理', icon: <FileOutlined /> },
    { key: '/admin/orders', label: '订单管理', icon: <ShoppingOutlined /> },
    { key: '/admin/payment-configs', label: '支付配置', icon: <CreditCardOutlined /> },
    { key: '/admin/email-settings', label: '邮件配置', icon: <MailOutlined /> },
    { key: '/admin/settings', label: '系统设置', icon: <SettingOutlined /> },
  ]

  // 确定当前选中的菜单项
  const selectedKey = menuItems.find(item => {
    if (item.key === '/admin') {
      return pathname === '/admin'
    }
    return pathname === item.key || pathname?.startsWith(item.key + '/')
  })?.key || '/admin'

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

