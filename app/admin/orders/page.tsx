'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Table,
  Button,
  Space,
  Card,
  Input,
  Select,
  Tag,
  message,
  Tooltip,
  DatePicker,
} from 'antd'
import {
  SearchOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CarOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { Order } from '@/types'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [orderNumber, setOrderNumber] = useState('')
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  async function fetchOrders() {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter) params.append('status', statusFilter)
      if (orderNumber) params.append('orderNumber', orderNumber)

      const res = await fetch(`/api/admin/orders?${params}`, {
        credentials: 'include',
      })
      const data = await res.json()
      if (data.success) {
        setOrders(data.data)
      }
    } catch (error) {
      console.error('获取订单失败:', error)
      message.error('获取订单列表失败')
    } finally {
      setLoading(false)
    }
  }

  function handleSearch(value: string) {
    setOrderNumber(value)
    fetchOrders()
  }

  function getStatusConfig(status: string) {
    const map: Record<string, { text: string; color: string; icon: any }> = {
      pending: { text: '待支付', color: 'warning', icon: <ClockCircleOutlined /> },
      paid: { text: '已支付', color: 'success', icon: <CheckCircleOutlined /> },
      shipped: { text: '已发货', color: 'processing', icon: <TruckOutlined /> },
      delivered: { text: '已送达', color: 'success', icon: <HomeOutlined /> },
      cancelled: { text: '已取消', color: 'error', icon: <CloseCircleOutlined /> },
    }
    return map[status] || { text: status, color: 'default', icon: null }
  }

  const columns: ColumnsType<Order> = [
    {
      title: '订单号',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      width: 200,
      render: (orderNumber: string) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 500 }}>{orderNumber}</span>
      ),
    },
    {
      title: '用户',
      dataIndex: 'user',
      key: 'user',
      width: 200,
      render: (user: any) => user?.email || <span style={{ color: '#999' }}>未知用户</span>,
    },
    {
      title: '金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 120,
      sorter: (a, b) => Number(a.totalAmount) - Number(b.totalAmount),
      render: (amount: number) => (
        <span style={{ color: '#667eea', fontWeight: 500 }}>
          ¥{Number(amount).toFixed(2)}
        </span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      filters: [
        { text: '待支付', value: 'pending' },
        { text: '已支付', value: 'paid' },
        { text: '已发货', value: 'shipped' },
        { text: '已送达', value: 'delivered' },
        { text: '已取消', value: 'cancelled' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status: string) => {
        const config = getStatusConfig(status)
        return (
          <Tag icon={config.icon} color={config.color}>
            {config.text}
          </Tag>
        )
      },
    },
    {
      title: '下单时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: Date) => new Date(date).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Tooltip title="查看详情">
          <Link href={`/admin/orders/${record.id}`}>
            <Button type="primary" icon={<EyeOutlined />} size="small" />
          </Link>
        </Tooltip>
      ),
    },
  ]

  return (
    <div>
      {/* 搜索和筛选 */}
      <Card style={{ marginBottom: 24 }}>
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space>
            <Input.Search
              placeholder="搜索订单号..."
              allowClear
              enterButton
              style={{ width: 300 }}
              onSearch={handleSearch}
              onChange={(e) => setOrderNumber(e.target.value)}
            />
            <Select
              placeholder="筛选状态"
              style={{ width: 150 }}
              allowClear
              value={statusFilter || undefined}
              onChange={(value) => {
                setStatusFilter(value || '')
                fetchOrders()
              }}
            >
              <Select.Option value="">全部状态</Select.Option>
              <Select.Option value="pending">待支付</Select.Option>
              <Select.Option value="paid">已支付</Select.Option>
              <Select.Option value="shipped">已发货</Select.Option>
              <Select.Option value="delivered">已送达</Select.Option>
              <Select.Option value="cancelled">已取消</Select.Option>
            </Select>
          </Space>
          <Button icon={<ReloadOutlined />} onClick={fetchOrders}>
            刷新
          </Button>
        </Space>
      </Card>

      {/* 订单表格 */}
      <Card>
        <Table
          columns={columns}
          dataSource={orders}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条订单`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>
    </div>
  )
}

