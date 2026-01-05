'use client'

import { useEffect, useState } from 'react'
import { Table, Tag, Button, Select, message, Modal, Input } from 'antd'
import { EyeOutlined, CheckOutlined } from '@ant-design/icons'
import Link from 'next/link'
import AdminCard from '@/components/admin/AdminCard'

const { TextArea } = Input

export default function RepairsPage() {
  const [repairs, setRepairs] = useState([])
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string | undefined>()
  const [processModal, setProcessModal] = useState(false)
  const [selectedRepair, setSelectedRepair] = useState<any>(null)
  const [replyForm, setReplyForm] = useState({ adminReply: '', solution: '', status: 'processing' })

  useEffect(() => {
    fetchRepairs()
  }, [statusFilter])

  const fetchRepairs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter) params.append('status', statusFilter)
      
      const res = await fetch('/api/admin/repairs?' + params.toString())
      const data = await res.json()
      if (data.success) setRepairs(data.data)
      else message.error(data.error || '获取维修工单失败')
    } catch (error) {
      message.error('获取维修工单失败')
    } finally {
      setLoading(false)
    }
  }

  const handleProcess = (repair: any) => {
    setSelectedRepair(repair)
    setReplyForm({
      adminReply: repair.adminReply || '',
      solution: repair.solution || '',
      status: repair.status === 'pending' ? 'processing' : repair.status
    })
    setProcessModal(true)
  }

  const handleSubmitProcess = async () => {
    if (!selectedRepair) return
    
    try {
      const res = await fetch('/api/admin/repairs/' + selectedRepair.id, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(replyForm)
      })
      const data = await res.json()
      if (data.success) {
        message.success('处理成功')
        setProcessModal(false)
        fetchRepairs()
      } else {
        message.error(data.error || '处理失败')
      }
    } catch (error) {
      message.error('处理失败')
    }
  }

  const getStatusTag = (status: string) => {
    const map: any = {
      pending: { color: 'orange', text: '待处理' },
      processing: { color: 'blue', text: '处理中' },
      completed: { color: 'green', text: '已完成' },
      rejected: { color: 'red', text: '已拒绝' }
    }
    const info = map[status] || { color: 'default', text: status }
    return <Tag color={info.color}>{info.text}</Tag>
  }

  const columns = [
    {
      title: '工单号',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      width: 180,
      render: (text: string) => <span className="font-mono text-sm">{text}</span>
    },
    {
      title: '订单号',
      key: 'order',
      width: 180,
      render: (_: any, record: any) => (
        <Link href={'/admin/orders/' + record.orderId} className="text-blue-600 hover:underline">
          {record.order?.orderNumber}
        </Link>
      )
    },
    {
      title: '产品名称',
      dataIndex: 'productName',
      key: 'productName',
      width: 200
    },
    {
      title: '用户',
      key: 'user',
      width: 150,
      render: (_: any, record: any) => (
        <div>
          <div className="font-medium">{record.user?.name || '-'}</div>
          <div className="text-xs text-gray-500">{record.user?.email}</div>
        </div>
      )
    },
    {
      title: '问题描述',
      dataIndex: 'issue',
      key: 'issue',
      ellipsis: true,
      render: (text: string) => (
        <div className="max-w-xs truncate" title={text}>{text}</div>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => getStatusTag(status)
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (date: string) => new Date(date).toLocaleString('zh-CN')
    },
    {
      title: '操作',
      key: 'actions',
      width: 180,
      render: (_: any, record: any) => (
        <div className="flex gap-2">
          <Link href={'/admin/repairs/' + record.id}>
            <Button size="small" icon={<EyeOutlined />}>查看</Button>
          </Link>
          {record.status !== 'completed' && record.status !== 'rejected' && (
            <Button size="small" type="primary" icon={<CheckOutlined />} onClick={() => handleProcess(record)}>
              处理
            </Button>
          )}
        </div>
      )
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">维修工单管理</h1>
          <p className="text-gray-600 mt-1">查看和处理用户的维修申请</p>
        </div>

        <AdminCard>
          <div className="mb-4 flex items-center gap-4">
            <span className="text-sm font-medium">状态筛选:</span>
            <Select
              style={{ width: 150 }}
              placeholder="全部状态"
              allowClear
              value={statusFilter}
              onChange={setStatusFilter}
            >
              <Select.Option value="pending">待处理</Select.Option>
              <Select.Option value="processing">处理中</Select.Option>
              <Select.Option value="completed">已完成</Select.Option>
              <Select.Option value="rejected">已拒绝</Select.Option>
            </Select>
          </div>

          <Table
            columns={columns}
            dataSource={repairs}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 20, showTotal: (total) => '共 ' + total + ' 条' }}
          />
        </AdminCard>

        <Modal
          title="处理维修工单"
          open={processModal}
          onOk={handleSubmitProcess}
          onCancel={() => setProcessModal(false)}
          okText="提交"
          cancelText="取消"
          width={600}
        >
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-2">状态</label>
              <Select
                style={{ width: '100%' }}
                value={replyForm.status}
                onChange={(value) => setReplyForm({ ...replyForm, status: value })}
              >
                <Select.Option value="processing">处理中</Select.Option>
                <Select.Option value="completed">已完成</Select.Option>
                <Select.Option value="rejected">已拒绝</Select.Option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">管理员回复</label>
              <TextArea
                rows={4}
                placeholder="请输入回复内容"
                value={replyForm.adminReply}
                onChange={(e) => setReplyForm({ ...replyForm, adminReply: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">解决方案</label>
              <TextArea
                rows={4}
                placeholder="请输入解决方案"
                value={replyForm.solution}
                onChange={(e) => setReplyForm({ ...replyForm, solution: e.target.value })}
              />
            </div>
          </div>
        </Modal>
      </div>
    </div>
  )
}
