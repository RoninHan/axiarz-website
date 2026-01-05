'use client'

import { useEffect, useState } from 'react'
import { Table, Tag, Button, message, Empty } from 'antd'
import { EyeOutlined, ToolOutlined } from '@ant-design/icons'
import Link from 'next/link'

export default function RepairsPage() {
  const [repairs, setRepairs] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchRepairs()
  }, [])

  const fetchRepairs = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/client/repairs')
      const data = await res.json()
      if (data.success) setRepairs(data.data)
      else message.error(data.error || '获取维修记录失败')
    } catch (error) {
      message.error('获取维修记录失败')
    } finally {
      setLoading(false)
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
      render: (text: string) => <span className="font-mono text-sm">{text}</span>
    },
    {
      title: '产品名称',
      dataIndex: 'productName',
      key: 'productName'
    },
    {
      title: '问题描述',
      dataIndex: 'issue',
      key: 'issue',
      ellipsis: true
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status)
    },
    {
      title: '提交时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('zh-CN')
    },
    {
      title: '完成时间',
      dataIndex: 'completedAt',
      key: 'completedAt',
      render: (date: string | null) => date ? new Date(date).toLocaleDateString('zh-CN') : '-'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6 flex items-center gap-3">
          <ToolOutlined className="text-2xl text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">我的维修记录</h1>
            <p className="text-gray-600 text-sm mt-1">查看您的所有维修申请</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          {repairs.length === 0 && !loading ? (
            <Empty
              description="暂无维修记录"
              className="py-16"
            />
          ) : (
            <Table
              columns={columns}
              dataSource={repairs}
              rowKey="id"
              loading={loading}
              pagination={false}
              expandable={{
                expandedRowRender: (record: any) => (
                  <div className="p-4 bg-gray-50 space-y-3">
                    {record.images && record.images.length > 0 && (
                      <div>
                        <div className="font-medium text-gray-700 mb-2">问题图片：</div>
                        <div className="flex gap-2">
                          {record.images.map((img: string, idx: number) => (
                            <img key={idx} src={img} alt="问题图片" className="w-24 h-24 object-cover rounded" />
                          ))}
                        </div>
                      </div>
                    )}
                    {record.adminReply && (
                      <div>
                        <div className="font-medium text-gray-700">管理员回复：</div>
                        <div className="text-gray-600 mt-1">{record.adminReply}</div>
                      </div>
                    )}
                    {record.solution && (
                      <div>
                        <div className="font-medium text-gray-700">解决方案：</div>
                        <div className="text-gray-600 mt-1">{record.solution}</div>
                      </div>
                    )}
                    <div>
                      <Link href={'/orders/' + record.orderId}>
                        <Button size="small" icon={<EyeOutlined />}>查看订单</Button>
                      </Link>
                    </div>
                  </div>
                )
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
