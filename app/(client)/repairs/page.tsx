'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { message } from 'antd'
import { ToolOutlined, ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, LeftOutlined } from '@ant-design/icons'
import Card from '@/components/client/Card'
import Button from '@/components/client/Button'
import ProtectedRoute from '@/components/client/ProtectedRoute'

interface RepairOrder {
  id: string
  orderNumber: string
  productName: string
  issue: string
  status: string
  adminReply: string | null
  solution: string | null
  createdAt: string
  updatedAt: string
  order: {
    orderNumber: string
    createdAt: string
  }
}

function RepairOrdersPageContent() {
  const [repairs, setRepairs] = useState<RepairOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [messageApi, contextHolder] = message.useMessage()

  useEffect(() => {
    fetchRepairs()
  }, [])

  async function fetchRepairs() {
    try {
      setLoading(true)
      const res = await fetch('/api/client/repairs')
      const data = await res.json()
      if (data.success) {
        setRepairs(data.data)
      }
    } catch (error) {
      console.error('获取维修工单失败:', error)
      messageApi.error('获取维修工单失败')
    } finally {
      setLoading(false)
    }
  }

  function getStatusText(status: string) {
    const map: Record<string, string> = {
      pending: '待处理',
      processing: '处理中',
      completed: '已完成',
      rejected: '已拒绝'
    }
    return map[status] || status
  }

  function getStatusColor(status: string) {
    const map: Record<string, string> = {
      pending: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      processing: 'text-blue-600 bg-blue-50 border-blue-200',
      completed: 'text-green-600 bg-green-50 border-green-200',
      rejected: 'text-red-600 bg-red-50 border-red-200'
    }
    return map[status] || 'text-gray-600 bg-gray-50 border-gray-200'
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'pending':
        return <ClockCircleOutlined />
      case 'processing':
        return <ToolOutlined className="animate-pulse" />
      case 'completed':
        return <CheckCircleOutlined />
      case 'rejected':
        return <CloseCircleOutlined />
      default:
        return <ClockCircleOutlined />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f4f4]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-accent-orange border-t-transparent mb-4"></div>
          <p className="text-body text-neutral-medium">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f4f4f4] py-8">
      {contextHolder}
      
      {/* 顶部导航 */}
      <div className="max-w-7xl mx-auto px-6 mb-6">
        <Link href="/orders" className="inline-flex items-center gap-2 text-gray-700 hover:text-accent-orange transition-colors">
          <LeftOutlined />
          <span>返回订单列表</span>
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-800">我的维修工单</h1>
          <p className="text-body text-gray-600">查看和管理您的售后维修申请</p>
        </div>

        {repairs.length === 0 ? (
          <Card className="text-center py-16 bg-white">
            <ToolOutlined className="text-6xl text-gray-300 mb-4" />
            <p className="text-title-small text-gray-500 mb-6">暂无维修工单</p>
            <Link href="/orders">
              <Button variant="primary">查看订单</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {repairs.map((repair) => (
              <Card key={repair.id} className="bg-white hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full ${getStatusColor(repair.status).split(' ')[1]} ${getStatusColor(repair.status).split(' ')[2]} flex items-center justify-center border`}>
                      <span className={getStatusColor(repair.status).split(' ')[0]}>
                        {getStatusIcon(repair.status)}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-title-small font-bold text-gray-800">{repair.productName}</h3>
                      <p className="text-caption text-gray-500">工单号: {repair.orderNumber}</p>
                    </div>
                  </div>
                  <span className={`px-4 py-2 rounded-lg text-caption font-medium border ${getStatusColor(repair.status)}`}>
                    {getStatusText(repair.status)}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-caption text-gray-500 mb-2">问题描述</p>
                    <p className="text-body text-gray-800 leading-relaxed">{repair.issue}</p>
                  </div>

                  {repair.adminReply && (
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <p className="text-caption text-blue-600 mb-2 font-medium">客服回复</p>
                      <p className="text-body text-gray-800 leading-relaxed">{repair.adminReply}</p>
                    </div>
                  )}

                  {repair.solution && (
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <p className="text-caption text-green-600 mb-2 font-medium">解决方案</p>
                      <p className="text-body text-gray-800 leading-relaxed">{repair.solution}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-caption text-gray-500 pt-3 border-t border-gray-200">
                    <div className="flex items-center gap-4">
                      <span>关联订单: {repair.order.orderNumber}</span>
                      <span>提交时间: {new Date(repair.createdAt).toLocaleString('zh-CN')}</span>
                    </div>
                    {repair.status === 'pending' && (
                      <span className="text-yellow-600">等待客服处理...</span>
                    )}
                    {repair.status === 'processing' && (
                      <span className="text-blue-600">正在处理中...</span>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function RepairOrdersPage() {
  return (
    <ProtectedRoute>
      <RepairOrdersPageContent />
    </ProtectedRoute>
  )
}
