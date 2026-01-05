'use client'

import { useEffect, useState } from 'react'
import { Table, Tag, Button, message, Modal, Form, Input, Select, Switch } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, KeyOutlined, SafetyOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import AdminCard from '@/components/admin/AdminCard'

export default function AdminsPage() {
  const router = useRouter()
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState<any>(null)
  const [form] = Form.useForm()
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    fetchCurrentUser()
    fetchAdmins()
  }, [])

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      if (data.success && data.data.type === 'admin') {
        setCurrentUser(data.data)
      }
    } catch (error) {
      console.error('获取当前用户失败:', error)
    }
  }

  const fetchAdmins = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/admins')
      const data = await res.json()
      if (data.success) setAdmins(data.data)
      else message.error(data.error || '获取管理员列表失败')
    } catch (error) {
      message.error('获取管理员列表失败')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingAdmin(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (admin: any) => {
    setEditingAdmin(admin)
    form.setFieldsValue({
      name: admin.name,
      email: admin.email,
      role: admin.role,
      status: admin.status
    })
    setModalVisible(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const url = editingAdmin ? '/api/admin/admins/' + editingAdmin.id : '/api/admin/admins'
      const method = editingAdmin ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      })
      const data = await res.json()

      if (data.success) {
        message.success(editingAdmin ? '更新成功' : '创建成功')
        setModalVisible(false)
        fetchAdmins()
      } else {
        message.error(data.error || '操作失败')
      }
    } catch (error) {
      console.error('操作失败:', error)
    }
  }

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个管理员吗？此操作不可恢复。',
      okText: '确定',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        try {
          const res = await fetch('/api/admin/admins/' + id, {
            method: 'DELETE'
          })
          const data = await res.json()
          if (data.success) {
            message.success('删除成功')
            fetchAdmins()
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
      const newStatus = currentStatus === 'active' ? 'disabled' : 'active'
      const res = await fetch('/api/admin/admins/' + id, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      const data = await res.json()
      if (data.success) {
        message.success('状态更新成功')
        fetchAdmins()
      } else {
        message.error(data.error || '状态更新失败')
      }
    } catch (error) {
      message.error('状态更新失败')
    }
  }

  const getRoleInfo = (role: string) => {
    const map: any = {
      super_admin: { color: 'red', text: '超级管理员', level: 1 },
      admin: { color: 'blue', text: '普通管理员', level: 2 },
      sales: { color: 'green', text: '销售', level: 3 },
      support: { color: 'orange', text: '售后', level: 3 },
      service: { color: 'purple', text: '客服', level: 3 }
    }
    return map[role] || { color: 'default', text: role, level: 4 }
  }

  const canManageAdmin = (targetRole: string) => {
    if (!currentUser) return false
    if (currentUser.role !== 'super_admin') return false
    return true
  }

  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 150
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 200
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 150,
      render: (role: string) => {
        const info = getRoleInfo(role)
        return (
          <div>
            <Tag color={info.color}>{info.text}</Tag>
            <span className="text-xs text-gray-500 ml-2">
              {info.level === 1 ? '一级' : info.level === 2 ? '二级' : '三级'}
            </span>
          </div>
        )
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string, record: any) => (
        <Switch
          checked={status === 'active'}
          onChange={() => handleToggleStatus(record.id, status)}
          checkedChildren="启用"
          unCheckedChildren="停用"
          disabled={!canManageAdmin(record.role) || record.id === currentUser?.id}
        />
      )
    },
    {
      title: '权限数量',
      key: 'permissions',
      width: 100,
      render: (_: any, record: any) => (
        <span className="text-blue-600">{record.permissions?.length || 0} 个</span>
      )
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (date: string) => new Date(date).toLocaleDateString('zh-CN')
    },
    {
      title: '操作',
      key: 'actions',
      width: 250,
      render: (_: any, record: any) => (
        <div className="flex gap-2">
          <Button
            size="small"
            icon={<SafetyOutlined />}
            onClick={() => router.push('/admin/admins/' + record.id + '/permissions')}
            disabled={!canManageAdmin(record.role)}
          >
            权限管理
          </Button>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            disabled={!canManageAdmin(record.role)}
          >
            编辑
          </Button>
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
            disabled={!canManageAdmin(record.role) || record.id === currentUser?.id}
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
            <h1 className="text-2xl font-bold text-gray-900">管理员管理</h1>
            <p className="text-gray-600 mt-1">管理系统管理员账号和权限</p>
          </div>
          {currentUser?.role === 'super_admin' && (
            <Button type="primary" icon={<PlusOutlined />} size="large" onClick={handleAdd}>
              添加管理员
            </Button>
          )}
        </div>

        <AdminCard>
          <Table
            columns={columns}
            dataSource={admins}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 20, showTotal: (total) => '共 ' + total + ' 位管理员' }}
          />
        </AdminCard>

        <Modal
          title={editingAdmin ? '编辑管理员' : '添加管理员'}
          open={modalVisible}
          onOk={handleSubmit}
          onCancel={() => setModalVisible(false)}
          okText="确定"
          cancelText="取消"
          width={500}
        >
          <Form form={form} layout="vertical" className="mt-4">
            <Form.Item
              label="姓名"
              name="name"
              rules={[{ required: true, message: '请输入姓名' }]}
            >
              <Input placeholder="请输入管理员姓名" />
            </Form.Item>

            <Form.Item
              label="邮箱"
              name="email"
              rules={[
                { required: true, message: '请输入邮箱' },
                { type: 'email', message: '请输入有效的邮箱地址' }
              ]}
            >
              <Input placeholder="请输入邮箱" disabled={!!editingAdmin} />
            </Form.Item>

            {!editingAdmin && (
              <Form.Item
                label="密码"
                name="password"
                rules={[
                  { required: true, message: '请输入密码' },
                  { min: 6, message: '密码至少6位' }
                ]}
              >
                <Input.Password placeholder="请输入密码（至少6位）" />
              </Form.Item>
            )}

            <Form.Item
              label="角色"
              name="role"
              rules={[{ required: true, message: '请选择角色' }]}
            >
              <Select placeholder="请选择角色">
                <Select.Option value="admin">普通管理员（二级）</Select.Option>
                <Select.Option value="sales">销售（三级）</Select.Option>
                <Select.Option value="support">售后（三级）</Select.Option>
                <Select.Option value="service">客服（三级）</Select.Option>
              </Select>
            </Form.Item>

            {editingAdmin && (
              <Form.Item
                label="状态"
                name="status"
                rules={[{ required: true, message: '请选择状态' }]}
              >
                <Select>
                  <Select.Option value="active">启用</Select.Option>
                  <Select.Option value="disabled">停用</Select.Option>
                </Select>
              </Form.Item>
            )}
          </Form>
        </Modal>
      </div>
    </div>
  )
}
