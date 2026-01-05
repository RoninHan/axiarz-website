'use client'

import { useEffect, useState } from 'react'
import { Table, Tag, Button, message, Modal, Switch } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, GiftOutlined } from '@ant-design/icons'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import AdminCard from '@/components/admin/AdminCard'

export default function CouponsPage() {
  const router = useRouter()
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchCoupons()
  }, [])

  const fetchCoupons = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/coupons')
      const data = await res.json()
      if (data.success) setCoupons(data.data)
      else message.error(data.error || '获取优惠券列表失败')
    } catch (error) {
      message.error('获取优惠券列表失败')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个优惠券吗？',
      okText: '确定',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        try {
          const res = await fetch('/api/admin/coupons/' + id, {
            method: 'DELETE'
          })
          const data = await res.json()
          if (data.success) {
            message.success('删除成功')
            fetchCoupons()
          } else {
            message.error(data.error || '删除失败')
          }
        } catch (error) {
          message.error('删除失败')
        }
      }
    })
  }

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
      const res = await fetch('/api/admin/coupons/' + id, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      const data = await res.json()
      if (data.success) {
        message.success('状态更新成功')
        fetchCoupons()
      } else {
        message.error(data.error || '状态更新失败')
      }
    } catch (error) {
      message.error('状态更新失败')
    }
  }

  const columns = [
    {
      title: '优惠券代码',
      dataIndex: 'code',
      key: 'code',
      width: 150,
      render: (text: string) => <span className="font-mono font-medium">{text}</span>
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: 200
    },
    {
      title: '类型/折扣',
      key: 'discount',
      width: 150,
      render: (_: any, record: any) => (
        <div>
          {record.type === 'fixed' ? (
            <span className="text-green-600 font-medium">¥{Number(record.value).toFixed(2)}</span>
          ) : (
            <span className="text-blue-600 font-medium">{Number(record.value) * 100}%</span>
          )}
          <span className="text-xs text-gray-500 ml-2">
            {record.type === 'fixed' ? '固定金额' : '百分比'}
          </span>
        </div>
      )
    },
    {
      title: '最低消费',
      dataIndex: 'minAmount',
      key: 'minAmount',
      width: 120,
      render: (val: string) => '¥' + Number(val).toFixed(2)
    },
    {
      title: '使用情况',
      key: 'usage',
      width: 150,
      render: (_: any, record: any) => (
        <div>
          <div className="text-sm">
            已用: <span className="font-medium">{record.usedCount}</span> / {record.totalCount}
          </div>
          <div className="text-xs text-gray-500">
            剩余: {record.totalCount - record.usedCount}
          </div>
        </div>
      )
    },
    {
      title: '有效期',
      key: 'validity',
      width: 200,
      render: (_: any, record: any) => (
        <div className="text-sm">
          <div>{new Date(record.validFrom).toLocaleDateString('zh-CN')}</div>
          <div className="text-gray-500">至 {new Date(record.validTo).toLocaleDateString('zh-CN')}</div>
        </div>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string, record: any) => (
        <Switch
          checked={status === 'active'}
          onChange={() => handleToggleStatus(record.id, status)}
          checkedChildren="启用"
          unCheckedChildren="停用"
        />
      )
    },
    {
      title: '操作',
      key: 'actions',
      width: 200,
      render: (_: any, record: any) => (
        <div className="flex gap-2">
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => router.push('/admin/coupons/' + record.id)}
          >
            编辑
          </Button>
          <Button
            size="small"
            icon={<GiftOutlined />}
            onClick={() => router.push('/admin/coupons/' + record.id + '/distribute')}
          >
            发放
          </Button>
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
        </div>
      )
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">优惠券管理</h1>
            <p className="text-gray-600 mt-1">创建和管理优惠券</p>
          </div>
          <Link href="/admin/coupons/new">
            <Button type="primary" icon={<PlusOutlined />} size="large">
              创建优惠券
            </Button>
          </Link>
        </div>

        <AdminCard>
          <Table
            columns={columns}
            dataSource={coupons}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 20, showTotal: (total) => '共 ' + total + ' 张优惠券' }}
          />
        </AdminCard>
      </div>
    </div>
  )
}
