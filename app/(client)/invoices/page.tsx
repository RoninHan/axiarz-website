'use client'

import { useEffect, useState } from 'react'
import { message, Tag, Empty, Spin } from 'antd'
import { FileTextOutlined, DownloadOutlined, ClockCircleOutlined } from '@ant-design/icons'
import Link from 'next/link'
import Button from '@/components/client/Button'
import Card from '@/components/client/Card'
import ProtectedRoute from '@/components/client/ProtectedRoute'
import ClientNavbar from '@/components/client/ClientNavbar'
import ClientFooter from '@/components/client/ClientFooter'

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
  order: {
    orderNumber: string
    totalAmount: string
  }
}

function InvoicesPageContent() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/client/invoices')
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

  const getTypeText = (type: string) => {
    return type === 'personal' ? '个人' : '企业'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <ClientNavbar />
        <div className="flex-1 flex items-center justify-center">
          <Spin size="large" />
        </div>
        <ClientFooter />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <ClientNavbar />
      
      <div className="flex-1 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FileTextOutlined className="text-accent-orange" />
              我的发票
            </h1>
            <p className="mt-2 text-gray-600">查看和下载您的发票记录</p>
          </div>

          {invoices.length === 0 ? (
            <Card className="bg-white">
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <div>
                    <p className="text-gray-500 mb-4">暂无发票记录</p>
                    <p className="text-sm text-gray-400">在订单结算时勾选"需要开具发票"即可申请发票</p>
                  </div>
                }
              >
                <Link href="/products">
                  <Button variant="primary">去购物</Button>
                </Link>
              </Empty>
            </Card>
          ) : (
            <div className="space-y-4">
              {invoices.map((invoice) => (
                <Card key={invoice.id} className="bg-white hover:shadow-lg transition-shadow">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    {/* 发票信息 */}
                    <div className="md:col-span-5">
                      <div className="flex items-start gap-3">
                        <FileTextOutlined className="text-2xl text-accent-orange mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900">{invoice.title}</h3>
                            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                              {getTypeText(invoice.type)}
                            </span>
                          </div>
                          {invoice.type === 'company' && invoice.taxNumber && (
                            <p className="text-sm text-gray-500">税号: {invoice.taxNumber}</p>
                          )}
                          <p className="text-sm text-gray-500 mt-1">
                            订单号: {invoice.order.orderNumber}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* 金额 */}
                    <div className="md:col-span-2">
                      <div className="text-sm text-gray-500 mb-1">开票金额</div>
                      <div className="text-lg font-bold text-accent-orange">
                        ¥{Number(invoice.order.totalAmount).toFixed(2)}
                      </div>
                    </div>

                    {/* 状态 */}
                    <div className="md:col-span-2">
                      <div className="text-sm text-gray-500 mb-1">状态</div>
                      <div>{getStatusTag(invoice.status)}</div>
                    </div>

                    {/* 发票号码 */}
                    <div className="md:col-span-2">
                      {invoice.invoiceNumber ? (
                        <>
                          <div className="text-sm text-gray-500 mb-1">发票号码</div>
                          <div className="text-sm font-medium text-gray-900">
                            {invoice.invoiceNumber}
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center gap-2 text-gray-400">
                          <ClockCircleOutlined />
                          <span className="text-sm">等待开票</span>
                        </div>
                      )}
                    </div>

                    {/* 操作 */}
                    <div className="md:col-span-1 flex justify-end">
                      {invoice.status === 'completed' && invoice.invoiceUrl && (
                        <a 
                          href={invoice.invoiceUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-2 bg-accent-orange text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
                        >
                          <DownloadOutlined />
                          下载
                        </a>
                      )}
                    </div>
                  </div>

                  {/* 拒绝原因 */}
                  {invoice.status === 'rejected' && invoice.rejectionReason && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="text-sm font-medium text-red-800 mb-1">拒绝原因</div>
                      <div className="text-sm text-red-600">{invoice.rejectionReason}</div>
                    </div>
                  )}

                  {/* 底部信息 */}
                  <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
                    <div>
                      申请时间: {new Date(invoice.createdAt).toLocaleString('zh-CN')}
                    </div>
                    {invoice.email && (
                      <div>
                        接收邮箱: {invoice.email}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* 提示信息 */}
          <Card className="mt-6 bg-blue-50 border border-blue-200">
            <div className="flex items-start gap-3">
              <FileTextOutlined className="text-blue-600 text-xl mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 mb-2">发票说明</h4>
                <ul className="space-y-1 text-sm text-blue-800">
                  <li>• 发票将在订单完成后的3-5个工作日内开具</li>
                  <li>• 电子发票将发送至您填写的邮箱地址</li>
                  <li>• 如需纸质发票或有任何疑问，请联系客服</li>
                  <li>• 发票一经开具，不支持修改发票信息</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <ClientFooter />
    </div>
  )
}

export default function InvoicesPage() {
  return (
    <ProtectedRoute>
      <InvoicesPageContent />
    </ProtectedRoute>
  )
}
