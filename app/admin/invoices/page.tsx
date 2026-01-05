'use client'

import { useEffect, useState } from 'react'
import AdminHeader from '@/components/admin/AdminHeader'
import AdminCard from '@/components/admin/AdminCard'
import { message, Select, Input, Tag, Table, Space, Button } from 'antd'
import { FileTextOutlined, SearchOutlined, EyeOutlined } from '@ant-design/icons'
import Link from 'next/link'

const { Option } = Select

interface Invoice {
  id: string
  orderId: string
  type: 'personal' | 'company'
  title: string
  taxNumber?: string
  email?: string
  status: 'pending' | 'processing' | 'completed' | 'rejected'
  invoiceNumber?: string
  invoiceUrl?: string
  rejectionReason?: string
  createdAt: string
  updatedAt: string
  order: {
    orderNumber: string
    totalAmount: string
    user: {
      name?: string
      email: string
    }
  }
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [searchText, setSearchText] = useState('')

  useEffect(() => {
    fetchInvoices()
  }, [])

  useEffect(() => {
    filterInvoices()
  }, [invoices, statusFilter, typeFilter, searchText])

  const fetchInvoices = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/invoices')
      const data = await response.json()

      if (data.success) {
        setInvoices(data.data)
      } else {
        message.error(data.error || '获取发票列表失败')
      }
    } catch (error) {
      message.error('获取发票列表失败')
    } finally {
      setLoading(false)
    }
  }

  const filterInvoices = () => {
    let filtered = [...invoices]

    // 状态筛选
    if (statusFilter !== 'all') {
      filtered = filtered.filter(inv => inv.status === statusFilter)
    }

    // 类型筛选
    if (typeFilter !== 'all') {
      filtered = filtered.filter(inv => inv.type === typeFilter)
    }

    // 搜索筛选
    if (searchText) {
      const search = searchText.toLowerCase()
      filtered = filtered.filter(inv => 
        inv.title.toLowerCase().includes(search) ||
        inv.order.orderNumber.toLowerCase().includes(search) ||
        inv.invoiceNumber?.toLowerCase().includes(search) ||
        inv.order.user.email.toLowerCase().includes(search) ||
        inv.order.user.name?.toLowerCase().includes(search)
      )
    }

    setFilteredInvoices(filtered)
  }

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      pending: { color: 'blue', text: '待开票' },
      processing: { color: 'orange', text: '处理中' },
      completed: { color: 'green', text: '已开票' },
      rejected: { color: 'red', text: '已拒绝' }
    }
    const config = statusMap[status] || { color: 'default', text: status }
    return <Tag color={config.color}>{config.text}</Tag>
  }

  const getTypeTag = (type: string) => {
    const typeMap: Record<string, { color: string; text: string }> = {
      personal: { color: 'blue', text: '个人' },
      company: { color: 'purple', text: '企业' }
    }
    const config = typeMap[type] || { color: 'default', text: type }
    return <Tag color={config.color}>{config.text}</Tag>
  }

  const columns = [
    {
      title: '发票抬头',
      dataIndex: 'title',
      key: 'title',
      width: 200,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => getTypeTag(type),
    },
    {
      title: '订单号',
      dataIndex: ['order', 'orderNumber'],
      key: 'orderNumber',
      width: 150,
    },
    {
      title: '订单金额',
      dataIndex: ['order', 'totalAmount'],
      key: 'totalAmount',
      width: 120,
      render: (amount: string) => `¥${amount}`,
    },
    {
      title: '客户',
      dataIndex: ['order', 'user'],
      key: 'user',
      width: 150,
      render: (user: any) => user.name || user.email,
    },
    {
      title: '发票号码',
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
      width: 150,
      render: (num: string) => num || '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => getStatusTag(status),
    },
    {
      title: '申请时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => new Date(date).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right' as const,
      render: (_: any, record: Invoice) => (
        <Space>
          <Link href={`/admin/invoices/${record.id}`}>
            <Button type="link" size="small" icon={<EyeOutlined />}>
              查看
            </Button>
          </Link>
        </Space>
      ),
    },
  ]

  const stats = {
    total: invoices.length,
    pending: invoices.filter(i => i.status === 'pending').length,
    processing: invoices.filter(i => i.status === 'processing').length,
    completed: invoices.filter(i => i.status === 'completed').length,
    rejected: invoices.filter(i => i.status === 'rejected').length,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileTextOutlined className="text-blue-600" />
            发票管理
          </h1>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <AdminCard className="bg-white">
            <div className="text-sm text-gray-500">全部发票</div>
            <div className="text-2xl font-bold mt-1">{stats.total}</div>
          </AdminCard>
          <AdminCard className="bg-blue-50">
            <div className="text-sm text-blue-600">待开票</div>
            <div className="text-2xl font-bold mt-1 text-blue-600">{stats.pending}</div>
          </AdminCard>
          <AdminCard className="bg-orange-50">
            <div className="text-sm text-orange-600">处理中</div>
            <div className="text-2xl font-bold mt-1 text-orange-600">{stats.processing}</div>
          </AdminCard>
          <AdminCard className="bg-green-50">
            <div className="text-sm text-green-600">已开票</div>
            <div className="text-2xl font-bold mt-1 text-green-600">{stats.completed}</div>
          </AdminCard>
          <AdminCard className="bg-red-50">
            <div className="text-sm text-red-600">已拒绝</div>
            <div className="text-2xl font-bold mt-1 text-red-600">{stats.rejected}</div>
          </AdminCard>
        </div>

        {/* 筛选器 */}
        <AdminCard className="mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="搜索发票抬头、订单号、客户..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </div>
            <Select
              style={{ width: 150 }}
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder="状态筛选"
            >
              <Option value="all">全部状态</Option>
              <Option value="pending">待开票</Option>
              <Option value="processing">处理中</Option>
              <Option value="completed">已开票</Option>
              <Option value="rejected">已拒绝</Option>
            </Select>
            <Select
              style={{ width: 120 }}
              value={typeFilter}
              onChange={setTypeFilter}
              placeholder="类型筛选"
            >
              <Option value="all">全部类型</Option>
              <Option value="personal">个人</Option>
              <Option value="company">企业</Option>
            </Select>
          </div>
        </AdminCard>

        {/* 发票列表 */}
        <AdminCard>
          <Table
            columns={columns}
            dataSource={filteredInvoices}
            rowKey="id"
            loading={loading}
            scroll={{ x: 1200 }}
            pagination={{
              pageSize: 20,
              showTotal: (total) => `共 ${total} 条记录`,
              showSizeChanger: true,
              showQuickJumper: true,
            }}
          />
        </AdminCard>
      </div>
    </div>
  )
}
