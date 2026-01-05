'use client'

import { useEffect, useState } from 'react'
import AdminCard from '@/components/admin/AdminCard'
import { message, Table, Button, Modal, Input, Space, Tag, Switch } from 'antd'
import { CarOutlined, PlusOutlined, EditOutlined, DeleteOutlined, GlobalOutlined, PhoneOutlined } from '@ant-design/icons'

interface CourierCompany {
  id: string
  name: string
  code: string
  website?: string
  phone?: string
  sortOrder: number
  status: string
  createdAt: string
  updatedAt: string
}

export default function CourierCompaniesPage() {
  const [companies, setCompanies] = useState<CourierCompany[]>([])
  const [loading, setLoading] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingCompany, setEditingCompany] = useState<CourierCompany | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    website: '',
    phone: '',
    sortOrder: 0,
    status: 'active'
  })

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/courier-companies')
      const data = await response.json()
      if (data.success) {
        setCompanies(data.data)
      } else {
        message.error(data.error || '获取物流公司列表失败')
      }
    } catch (error) {
      message.error('获取物流公司列表失败')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingCompany(null)
    setFormData({
      name: '',
      code: '',
      website: '',
      phone: '',
      sortOrder: 0,
      status: 'active'
    })
    setModalVisible(true)
  }

  const handleEdit = (company: CourierCompany) => {
    setEditingCompany(company)
    setFormData({
      name: company.name,
      code: company.code,
      website: company.website || '',
      phone: company.phone || '',
      sortOrder: company.sortOrder,
      status: company.status
    })
    setModalVisible(true)
  }

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.code.trim()) {
      message.error('请填写公司名称和代码')
      return
    }

    try {
      const url = editingCompany 
        ? `/api/admin/courier-companies/${editingCompany.id}`
        : '/api/admin/courier-companies'
      
      const response = await fetch(url, {
        method: editingCompany ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      if (data.success) {
        message.success(editingCompany ? '更新成功' : '创建成功')
        setModalVisible(false)
        fetchCompanies()
      } else {
        message.error(data.error || '操作失败')
      }
    } catch (error) {
      message.error('操作失败')
    }
  }

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '删除后无法恢复，确定要删除这家物流公司吗？',
      okText: '确定',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        try {
          const response = await fetch(`/api/admin/courier-companies/${id}`, {
            method: 'DELETE'
          })
          const data = await response.json()
          if (data.success) {
            message.success('删除成功')
            fetchCompanies()
          } else {
            message.error(data.error || '删除失败')
          }
        } catch (error) {
          message.error('删除失败')
        }
      }
    })
  }

  const handleStatusToggle = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
    try {
      const response = await fetch(`/api/admin/courier-companies/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      const data = await response.json()
      if (data.success) {
        message.success('状态更新成功')
        fetchCompanies()
      } else {
        message.error(data.error || '状态更新失败')
      }
    } catch (error) {
      message.error('状态更新失败')
    }
  }

  const columns = [
    {
      title: '排序',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 80,
      sorter: (a: CourierCompany, b: CourierCompany) => a.sortOrder - b.sortOrder,
    },
    {
      title: '公司名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <span className="font-medium text-gray-900">{text}</span>
      )
    },
    {
      title: '公司代码',
      dataIndex: 'code',
      key: 'code',
      render: (text: string) => (
        <Tag color="blue">{text}</Tag>
      )
    },
    {
      title: '官网',
      dataIndex: 'website',
      key: 'website',
      render: (text: string) => text ? (
        <a href={text} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
          <GlobalOutlined />
          访问官网
        </a>
      ) : <span className="text-gray-400">-</span>
    },
    {
      title: '客服电话',
      dataIndex: 'phone',
      key: 'phone',
      render: (text: string) => text ? (
        <span className="flex items-center gap-1 text-gray-700">
          <PhoneOutlined />
          {text}
        </span>
      ) : <span className="text-gray-400">-</span>
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string, record: CourierCompany) => (
        <Switch
          checked={status === 'active'}
          onChange={() => handleStatusToggle(record.id, status)}
          checkedChildren="启用"
          unCheckedChildren="停用"
        />
      )
    },
    {
      title: '操作',
      key: 'actions',
      width: 150,
      render: (_: any, record: CourierCompany) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
        </Space>
      )
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <CarOutlined className="text-blue-600" />
              物流公司管理
            </h1>
            <p className="text-gray-600 mt-1">管理系统中的物流公司信息</p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
            size="large"
          >
            添加物流公司
          </Button>
        </div>

        <AdminCard>
          <Table
            columns={columns}
            dataSource={companies}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 20,
              showTotal: (total) => `共 ${total} 家物流公司`
            }}
          />
        </AdminCard>

        <Modal
          title={editingCompany ? '编辑物流公司' : '添加物流公司'}
          open={modalVisible}
          onOk={handleSubmit}
          onCancel={() => setModalVisible(false)}
          okText="确定"
          cancelText="取消"
          width={600}
        >
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                公司名称 <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="例如：顺丰速运"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                公司代码 <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="例如：SF"
                disabled={!!editingCompany}
              />
              {editingCompany && (
                <p className="text-xs text-gray-500 mt-1">公司代码不可修改</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                官网地址
              </label>
              <Input
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://www.sf-express.com"
                prefix={<GlobalOutlined />}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                客服电话
              </label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="95338"
                prefix={<PhoneOutlined />}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                排序顺序
              </label>
              <Input
                type="number"
                value={formData.sortOrder}
                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
              <p className="text-xs text-gray-500 mt-1">数字越小越靠前</p>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  )
}
