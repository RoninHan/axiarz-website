'use client'

import { useEffect, useState } from 'react'
import {
  Table,
  Tag,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  message,
  Card,
  Statistic,
  Row,
  Col,
  Descriptions,
  Divider,
} from 'antd'
import {
  DollarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
  BankOutlined,
  CreditCardOutlined,
} from '@ant-design/icons'
import { RefundRequest } from '@/types'

const { TextArea } = Input
const { Option } = Select

const statusConfig = {
  pending: { color: 'orange', text: '待审核', icon: <ClockCircleOutlined /> },
  approved: { color: 'blue', text: '已批准', icon: <CheckCircleOutlined /> },
  rejected: { color: 'red', text: '已拒绝', icon: <CloseCircleOutlined /> },
  completed: { color: 'green', text: '已完成', icon: <CheckCircleOutlined /> },
}

const refundMethodConfig = {
  original: { text: '原路退款', icon: <CreditCardOutlined />, color: 'blue' },
  bank: { text: '银行卡退款', icon: <BankOutlined />, color: 'green' },
}

const bankNameConfig = {
  ICBC: '工商银行',
  ABC: '农业银行',
  BOC: '中国银行',
  CCB: '建设银行',
}

export default function RefundRequestsPage() {
  const [refundRequests, setRefundRequests] = useState<RefundRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<RefundRequest | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    completed: 0,
  })

  useEffect(() => {
    fetchRefundRequests()
  }, [])

  async function fetchRefundRequests() {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/refund-requests', {
        credentials: 'include',
      })
      const data = await res.json()
      if (data.success) {
        setRefundRequests(data.data)
        calculateStats(data.data)
      }
    } catch (error) {
      console.error('获取退款申请失败:', error)
      message.error('获取退款申请失败')
    } finally {
      setLoading(false)
    }
  }

  function calculateStats(requests: RefundRequest[]) {
    const stats = {
      total: requests.length,
      pending: requests.filter(r => r.status === 'pending').length,
      approved: requests.filter(r => r.status === 'approved').length,
      completed: requests.filter(r => r.status === 'completed').length,
    }
    setStats(stats)
  }

  async function handleApproval(requestId: string, action: 'approve' | 'reject', adminNote?: string) {
    try {
      setProcessing(true)

      const res = await fetch(`/api/admin/refund-requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action,
          adminNote,
        }),
      })

      const data = await res.json()

      if (data.success) {
        message.success(action === 'approve' ? '已批准退款申请' : '已拒绝退款申请')
        fetchRefundRequests()
        setShowApprovalModal(false)
        setSelectedRequest(null)
      } else {
        message.error(data.error || '操作失败')
      }
    } catch (error) {
      console.error('处理退款申请失败:', error)
      message.error('操作失败')
    } finally {
      setProcessing(false)
    }
  }

  const columns = [
    {
      title: '申请ID',
      dataIndex: 'id',
      key: 'id',
      width: 200,
      render: (id: string) => id.substring(0, 8) + '...',
    },
    {
      title: '订单号',
      dataIndex: ['order', 'orderNumber'],
      key: 'orderNumber',
    },
    {
      title: '申请人',
      dataIndex: ['user', 'name'],
      key: 'userName',
      render: (name: string | null, record: RefundRequest) =>
        name || record.user?.email || '未知',
    },
    {
      title: '退款金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => `¥${Number(amount).toFixed(2)}`,
      sorter: (a: RefundRequest, b: RefundRequest) => Number(a.amount) - Number(b.amount),
    },
    {
      title: '退款方式',
      dataIndex: 'refundMethod',
      key: 'refundMethod',
      render: (method: string) => {
        const config = refundMethodConfig[method as keyof typeof refundMethodConfig]
        return (
          <Tag color={config?.color} icon={config?.icon}>
            {config?.text}
          </Tag>
        )
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const config = statusConfig[status as keyof typeof statusConfig]
        return (
          <Tag color={config?.color} icon={config?.icon}>
            {config?.text}
          </Tag>
        )
      },
    },
    {
      title: '申请时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString('zh-CN'),
      sorter: (a: RefundRequest, b: RefundRequest) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: RefundRequest) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedRequest(record)
              setShowDetailModal(true)
            }}
          >
            查看
          </Button>
          {record.status === 'pending' && (
            <>
              <Button
                type="link"
                icon={<CheckOutlined />}
                style={{ color: '#52c41a' }}
                onClick={() => {
                  setSelectedRequest(record)
                  setShowApprovalModal(true)
                }}
              >
                批准
              </Button>
              <Button
                type="link"
                danger
                icon={<CloseOutlined />}
                onClick={() => {
                  Modal.confirm({
                    title: '确认拒绝',
                    content: '确定要拒绝这个退款申请吗？',
                    okText: '确认拒绝',
                    cancelText: '取消',
                    onOk: () => handleApproval(record.id, 'reject'),
                  })
                }}
              >
                拒绝
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div>
      {/* 统计卡片 */}
      <Row gutter={16} className="mb-6">
        <Col span={6}>
          <Card>
            <Statistic
              title="总申请数"
              value={stats.total}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="待审核"
              value={stats.pending}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已批准"
              value={stats.approved}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已完成"
              value={stats.completed}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 退款申请列表 */}
      <Card title="退款申请管理">
        <Table
          columns={columns}
          dataSource={refundRequests}
          rowKey="id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
          }}
        />
      </Card>

      {/* 详情弹窗 */}
      <Modal
        title="退款申请详情"
        open={showDetailModal}
        onCancel={() => {
          setShowDetailModal(false)
          setSelectedRequest(null)
        }}
        footer={null}
        width={600}
      >
        {selectedRequest && (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="申请ID">{selectedRequest.id}</Descriptions.Item>
              <Descriptions.Item label="订单号">{selectedRequest.order?.orderNumber}</Descriptions.Item>
              <Descriptions.Item label="申请人">
                {selectedRequest.user?.name || selectedRequest.user?.email}
              </Descriptions.Item>
              <Descriptions.Item label="退款金额">
                ¥{Number(selectedRequest.amount).toFixed(2)}
              </Descriptions.Item>
              <Descriptions.Item label="退款方式">
                {refundMethodConfig[selectedRequest.refundMethod as keyof typeof refundMethodConfig]?.text}
              </Descriptions.Item>
              <Descriptions.Item label="申请状态">
                <Tag color={statusConfig[selectedRequest.status as keyof typeof statusConfig]?.color}>
                  {statusConfig[selectedRequest.status as keyof typeof statusConfig]?.text}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="申请时间">
                {new Date(selectedRequest.createdAt).toLocaleString('zh-CN')}
              </Descriptions.Item>
              <Descriptions.Item label="退款时间">
                {selectedRequest.refundTime ? new Date(selectedRequest.refundTime).toLocaleString('zh-CN') : '未退款'}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <div>
              <h4 className="font-medium mb-2">退款原因</h4>
              <p className="text-gray-600 bg-gray-50 p-3 rounded">
                {selectedRequest.reason}
              </p>
            </div>

            {selectedRequest.refundMethod === 'bank' && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">银行卡信息</h4>
                <Descriptions size="small" bordered>
                  <Descriptions.Item label="银行">
                    {bankNameConfig[selectedRequest.bankName as keyof typeof bankNameConfig] || selectedRequest.bankName}
                  </Descriptions.Item>
                  <Descriptions.Item label="卡号">
                    **** **** **** {selectedRequest.bankAccount?.slice(-4)}
                  </Descriptions.Item>
                  <Descriptions.Item label="开户人">
                    {selectedRequest.accountName}
                  </Descriptions.Item>
                </Descriptions>
              </div>
            )}

            {selectedRequest.adminNote && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">管理员备注</h4>
                <p className="text-gray-600 bg-gray-50 p-3 rounded">
                  {selectedRequest.adminNote}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* 批准弹窗 */}
      <Modal
        title="批准退款申请"
        open={showApprovalModal}
        onCancel={() => {
          setShowApprovalModal(false)
          setSelectedRequest(null)
        }}
        footer={null}
      >
        {selectedRequest && (
          <Form
            onFinish={(values) => handleApproval(selectedRequest.id, 'approve', values.adminNote)}
            layout="vertical"
          >
            <div className="mb-4">
              <p className="text-gray-600">
                确定要批准这个退款申请吗？退款金额：¥{Number(selectedRequest.amount).toFixed(2)}
              </p>
            </div>

            <Form.Item
              label="管理员备注"
              name="adminNote"
              rules={[{ required: true, message: '请输入管理员备注' }]}
            >
              <TextArea
                rows={3}
                placeholder="请输入处理备注..."
              />
            </Form.Item>

            <div className="flex justify-end gap-2">
              <Button onClick={() => setShowApprovalModal(false)}>
                取消
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={processing}
              >
                确认批准
              </Button>
            </div>
          </Form>
        )}
      </Modal>
    </div>
  )
}
