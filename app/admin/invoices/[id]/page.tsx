'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import AdminCard from '@/components/admin/AdminCard'
import { message, Tag, Descriptions, Space, Button, Modal, Input, Upload, Spin } from 'antd'
import { 
  FileTextOutlined, 
  ArrowLeftOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  UploadOutlined,
  DownloadOutlined,
  LoadingOutlined
} from '@ant-design/icons'
import Link from 'next/link'
import type { UploadFile } from 'antd/es/upload/interface'

const { TextArea } = Input

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
    status: string
    user: {
      id: string
      name?: string
      email: string
      phone?: string
    }
    items: Array<{
      id: string
      quantity: number
      price: string
      product: {
        name: string
        sku?: string
      }
    }>
  }
}

export default function InvoiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const invoiceId = params.id as string

  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  
  // 开票模态框
  const [issueModalVisible, setIssueModalVisible] = useState(false)
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [uploadedFileUrl, setUploadedFileUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  
  // 拒绝模态框
  const [rejectModalVisible, setRejectModalVisible] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

  useEffect(() => {
    fetchInvoiceDetail()
  }, [invoiceId])

  const fetchInvoiceDetail = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/invoices/${invoiceId}`)
      const data = await response.json()

      if (data.success) {
        setInvoice(data.data)
        if (data.data.invoiceNumber) {
          setInvoiceNumber(data.data.invoiceNumber)
        }
        if (data.data.invoiceUrl) {
          setUploadedFileUrl(data.data.invoiceUrl)
        }
      } else {
        message.error(data.error || '获取发票详情失败')
      }
    } catch (error) {
      message.error('获取发票详情失败')
    } finally {
      setLoading(false)
    }
  }

  // 上传发票文件
  const handleFileUpload = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    try {
      setUploading(true)
      const response = await fetch('/api/admin/files', {
        method: 'POST',
        body: formData,
      })
      const data = await response.json()

      if (data.success) {
        setUploadedFileUrl(data.data.url)
        message.success('发票文件上传成功')
        return true
      } else {
        message.error(data.error || '上传失败')
        return false
      }
    } catch (error) {
      message.error('上传失败')
      return false
    } finally {
      setUploading(false)
    }
  }

  // 开票
  const handleIssueInvoice = async () => {
    if (!invoiceNumber.trim()) {
      message.error('请输入发票号码')
      return
    }
    if (!uploadedFileUrl) {
      message.error('请上传发票文件')
      return
    }

    try {
      setProcessing(true)
      const response = await fetch(`/api/admin/invoices/${invoiceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'completed',
          invoiceNumber: invoiceNumber.trim(),
          invoiceUrl: uploadedFileUrl,
        }),
      })
      const data = await response.json()

      if (data.success) {
        message.success('发票开具成功')
        setIssueModalVisible(false)
        fetchInvoiceDetail()
      } else {
        message.error(data.error || '开票失败')
      }
    } catch (error) {
      message.error('开票失败')
    } finally {
      setProcessing(false)
    }
  }

  // 拒绝开票
  const handleRejectInvoice = async () => {
    if (!rejectionReason.trim()) {
      message.error('请输入拒绝原因')
      return
    }

    try {
      setProcessing(true)
      const response = await fetch(`/api/admin/invoices/${invoiceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'rejected',
          rejectionReason: rejectionReason.trim(),
        }),
      })
      const data = await response.json()

      if (data.success) {
        message.success('已拒绝开票')
        setRejectModalVisible(false)
        fetchInvoiceDetail()
      } else {
        message.error(data.error || '操作失败')
      }
    } catch (error) {
      message.error('操作失败')
    } finally {
      setProcessing(false)
    }
  }

  // 更新为处理中
  const handleSetProcessing = async () => {
    try {
      setProcessing(true)
      const response = await fetch(`/api/admin/invoices/${invoiceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'processing' }),
      })
      const data = await response.json()

      if (data.success) {
        message.success('状态已更新')
        fetchInvoiceDetail()
      } else {
        message.error(data.error || '更新失败')
      }
    } catch (error) {
      message.error('更新失败')
    } finally {
      setProcessing(false)
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

  const getTypeTag = (type: string) => {
    const typeMap: Record<string, { color: string; text: string }> = {
      personal: { color: 'blue', text: '个人' },
      company: { color: 'purple', text: '企业' }
    }
    const config = typeMap[type] || { color: 'default', text: type }
    return <Tag color={config.color}>{config.text}</Tag>
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center h-96">
          <Spin size="large" />
        </div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">发票不存在</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页头 */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/invoices">
              <Button icon={<ArrowLeftOutlined />}>返回列表</Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FileTextOutlined className="text-blue-600" />
              发票详情
            </h1>
          </div>
          <div>
            {getStatusTag(invoice.status)}
          </div>
        </div>

        {/* 发票信息 */}
        <AdminCard className="mb-6">
          <h2 className="text-lg font-semibold mb-4">发票信息</h2>
          <Descriptions bordered column={2}>
            <Descriptions.Item label="发票抬头">{invoice.title}</Descriptions.Item>
            <Descriptions.Item label="发票类型">{getTypeTag(invoice.type)}</Descriptions.Item>
            {invoice.type === 'company' && (
              <Descriptions.Item label="税号" span={2}>{invoice.taxNumber || '-'}</Descriptions.Item>
            )}
            <Descriptions.Item label="接收邮箱">{invoice.email || '-'}</Descriptions.Item>
            <Descriptions.Item label="申请时间">
              {new Date(invoice.createdAt).toLocaleString('zh-CN')}
            </Descriptions.Item>
            <Descriptions.Item label="发票号码">{invoice.invoiceNumber || '-'}</Descriptions.Item>
            <Descriptions.Item label="更新时间">
              {new Date(invoice.updatedAt).toLocaleString('zh-CN')}
            </Descriptions.Item>
            {invoice.invoiceUrl && (
              <Descriptions.Item label="发票文件" span={2}>
                <a href={invoice.invoiceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  <DownloadOutlined /> 下载发票
                </a>
              </Descriptions.Item>
            )}
            {invoice.rejectionReason && (
              <Descriptions.Item label="拒绝原因" span={2}>
                <span className="text-red-600">{invoice.rejectionReason}</span>
              </Descriptions.Item>
            )}
          </Descriptions>
        </AdminCard>

        {/* 订单信息 */}
        <AdminCard className="mb-6">
          <h2 className="text-lg font-semibold mb-4">订单信息</h2>
          <Descriptions bordered column={2}>
            <Descriptions.Item label="订单号">{invoice.order.orderNumber}</Descriptions.Item>
            <Descriptions.Item label="订单金额">¥{invoice.order.totalAmount}</Descriptions.Item>
            <Descriptions.Item label="客户姓名">{invoice.order.user.name || '-'}</Descriptions.Item>
            <Descriptions.Item label="客户邮箱">{invoice.order.user.email}</Descriptions.Item>
            <Descriptions.Item label="客户电话">{invoice.order.user.phone || '-'}</Descriptions.Item>
          </Descriptions>
        </AdminCard>

        {/* 订单商品 */}
        <AdminCard className="mb-6">
          <h2 className="text-lg font-semibold mb-4">订单商品</h2>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">产品名称</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">单价</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">数量</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">小计</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoice.order.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{item.product.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.product.sku || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">¥{item.price}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    ¥{(parseFloat(item.price) * item.quantity).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminCard>

        {/* 操作按钮 */}
        <AdminCard>
          <div className="flex gap-4">
            {invoice.status === 'pending' && (
              <>
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={() => setIssueModalVisible(true)}
                  size="large"
                >
                  开具发票
                </Button>
                <Button
                  icon={<LoadingOutlined />}
                  onClick={handleSetProcessing}
                  loading={processing}
                  size="large"
                >
                  标记为处理中
                </Button>
                <Button
                  danger
                  icon={<CloseCircleOutlined />}
                  onClick={() => setRejectModalVisible(true)}
                  size="large"
                >
                  拒绝开票
                </Button>
              </>
            )}
            {invoice.status === 'processing' && (
              <>
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={() => setIssueModalVisible(true)}
                  size="large"
                >
                  开具发票
                </Button>
                <Button
                  danger
                  icon={<CloseCircleOutlined />}
                  onClick={() => setRejectModalVisible(true)}
                  size="large"
                >
                  拒绝开票
                </Button>
              </>
            )}
            {invoice.status === 'completed' && (
              <div className="text-green-600 flex items-center gap-2">
                <CheckCircleOutlined />
                <span>发票已开具</span>
              </div>
            )}
            {invoice.status === 'rejected' && (
              <div className="text-red-600 flex items-center gap-2">
                <CloseCircleOutlined />
                <span>已拒绝开票</span>
              </div>
            )}
          </div>
        </AdminCard>
      </div>

      {/* 开票模态框 */}
      <Modal
        title="开具发票"
        open={issueModalVisible}
        onOk={handleIssueInvoice}
        onCancel={() => setIssueModalVisible(false)}
        confirmLoading={processing}
        width={600}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              发票号码 <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="请输入发票号码"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              上传发票文件 <span className="text-red-500">*</span>
            </label>
            <Upload
              beforeUpload={(file) => {
                handleFileUpload(file)
                return false
              }}
              maxCount={1}
              accept=".pdf,.jpg,.jpeg,.png"
              fileList={uploadedFileUrl ? [{
                uid: '-1',
                name: '发票文件',
                status: 'done',
                url: uploadedFileUrl,
              }] : []}
              onRemove={() => setUploadedFileUrl('')}
            >
              <Button icon={<UploadOutlined />} loading={uploading}>
                {uploading ? '上传中...' : '选择文件'}
              </Button>
            </Upload>
            <div className="text-xs text-gray-500 mt-2">
              支持 PDF、JPG、PNG 格式，文件大小不超过 10MB
            </div>
          </div>
          {uploadedFileUrl && (
            <div className="text-green-600 text-sm">
              <CheckCircleOutlined /> 文件已上传
            </div>
          )}
        </div>
      </Modal>

      {/* 拒绝模态框 */}
      <Modal
        title="拒绝开票"
        open={rejectModalVisible}
        onOk={handleRejectInvoice}
        onCancel={() => setRejectModalVisible(false)}
        confirmLoading={processing}
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            拒绝原因 <span className="text-red-500">*</span>
          </label>
          <TextArea
            rows={4}
            placeholder="请输入拒绝原因，将通知客户"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  )
}
