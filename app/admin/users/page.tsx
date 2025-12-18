'use client'

import { useEffect, useState } from 'react'
import {
  Table,
  Input,
  Button,
  Space,
  Tag,
  Modal,
  Select,
  Descriptions,
  Card,
  message,
  Tooltip,
} from 'antd'
import {
  SearchOutlined,
  UserOutlined,
  StopOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { User } from '@/types'

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [detailVisible, setDetailVisible] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (statusFilter) params.append('status', statusFilter)

      const res = await fetch(`/api/admin/users?${params}`, {
        credentials: 'include',
      })
      const data = await res.json()
      if (data.success) {
        setUsers(data.data)
      }
    } catch (error) {
      console.error('获取用户失败:', error)
      message.error('获取用户列表失败')
    } finally {
      setLoading(false)
    }
  }

  function handleSearch(value: string) {
    setSearch(value)
    fetchUsers()
  }

  function handleStatusFilterChange(value: string) {
    setStatusFilter(value)
    fetchUsers()
  }

  function toggleUserStatus(user: User) {
    const newStatus = user.status === 'active' ? 'disabled' : 'active'
    const actionText = newStatus === 'disabled' ? '禁用' : '启用'

    Modal.confirm({
      title: `确认${actionText}用户`,
      content: `确定要${actionText}用户 ${user.email} 吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          const res = await fetch(`/api/admin/users/${user.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ status: newStatus }),
          })
          const data = await res.json()
          if (data.success) {
            message.success(`${actionText}成功`)
            await fetchUsers()
          } else {
            message.error(data.error || `${actionText}失败`)
          }
        } catch (error) {
          console.error('更新用户状态失败:', error)
          message.error(`${actionText}失败`)
        }
      },
    })
  }

  function showUserDetail(user: User) {
    setSelectedUser(user)
    setDetailVisible(true)
  }

  const columns: ColumnsType<User> = [
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 250,
      render: (email: string) => (
        <Space>
          <UserOutlined style={{ color: '#667eea' }} />
          <span>{email}</span>
        </Space>
      ),
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      render: (name: string) => name || <span style={{ color: '#999' }}>未设置</span>,
    },
    {
      title: '电话',
      dataIndex: 'phone',
      key: 'phone',
      width: 150,
      render: (phone: string) => phone || <span style={{ color: '#999' }}>未设置</span>,
    },
    {
      title: '用户类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: string) => (
        <Tag color={type === 'admin' ? 'purple' : 'blue'}>
          {type === 'admin' ? '管理员' : '普通用户'}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag
          icon={status === 'active' ? <CheckCircleOutlined /> : <StopOutlined />}
          color={status === 'active' ? 'success' : 'error'}
        >
          {status === 'active' ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '注册时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => new Date(date).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="查看详情">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => showUserDetail(record)}
            />
          </Tooltip>
          <Button
            type={record.status === 'active' ? 'default' : 'primary'}
            danger={record.status === 'active'}
            size="small"
            onClick={() => toggleUserStatus(record)}
            disabled={record.type === 'admin'}
          >
            {record.status === 'active' ? '禁用' : '启用'}
          </Button>
        </Space>
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
              placeholder="搜索邮箱、姓名、电话..."
              allowClear
              enterButton
              style={{ width: 300 }}
              onSearch={handleSearch}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select
              placeholder="筛选状态"
              style={{ width: 150 }}
              allowClear
              value={statusFilter || undefined}
              onChange={handleStatusFilterChange}
              options={[
                { label: '全部状态', value: '' },
                { label: '启用', value: 'active' },
                { label: '禁用', value: 'disabled' },
              ]}
            />
          </Space>
          <Button icon={<ReloadOutlined />} onClick={fetchUsers}>
            刷新
          </Button>
        </Space>
      </Card>

      {/* 用户表格 */}
      <Card>
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 用户详情弹窗 */}
      <Modal
        title="用户详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>
            关闭
          </Button>,
        ]}
        width={700}
      >
        {selectedUser && (
          <Descriptions column={2} bordered>
            <Descriptions.Item label="用户ID" span={2}>
              {selectedUser.id}
            </Descriptions.Item>
            <Descriptions.Item label="邮箱" span={2}>
              {selectedUser.email}
            </Descriptions.Item>
            <Descriptions.Item label="姓名">
              {selectedUser.name || '未设置'}
            </Descriptions.Item>
            <Descriptions.Item label="电话">
              {selectedUser.phone || '未设置'}
            </Descriptions.Item>
            <Descriptions.Item label="用户类型">
              <Tag color={selectedUser.type === 'admin' ? 'purple' : 'blue'}>
                {selectedUser.type === 'admin' ? '管理员' : '普通用户'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag
                icon={
                  selectedUser.status === 'active' ? (
                    <CheckCircleOutlined />
                  ) : (
                    <StopOutlined />
                  )
                }
                color={selectedUser.status === 'active' ? 'success' : 'error'}
              >
                {selectedUser.status === 'active' ? '启用' : '禁用'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="注册时间" span={2}>
              {new Date(selectedUser.createdAt).toLocaleString('zh-CN')}
            </Descriptions.Item>
            <Descriptions.Item label="最后更新" span={2}>
              {new Date(selectedUser.updatedAt).toLocaleString('zh-CN')}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  )
}

