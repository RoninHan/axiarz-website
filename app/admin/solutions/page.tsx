'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Table,
  Button,
  Space,
  Card,
  Row,
  Col,
  Statistic,
  Tag,
  Popconfirm,
  message,
  Tooltip,
  Image,
  Input,
  Select,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  BulbOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { Solution } from '@/types'

export default function SolutionsPage() {
  const router = useRouter()
  const [solutions, setSolutions] = useState<Solution[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')

  useEffect(() => {
    loadSolutions()
  }, [])

  async function loadSolutions() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (statusFilter) params.append('status', statusFilter)

      const res = await fetch(`/api/admin/solutions?${params}`, {
        credentials: 'include',
      })
      const data = await res.json()
      if (data.success) {
        setSolutions(data.data)
      } else {
        message.error(data.error || '加载失败')
      }
    } catch (error) {
      message.error('网络错误')
    } finally {
      setLoading(false)
    }
  }

  function handleSearch(value: string) {
    setSearch(value)
    loadSolutions()
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/admin/solutions/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      const data = await res.json()
      if (data.success) {
        message.success('删除成功')
        loadSolutions()
      } else {
        message.error(data.error || '删除失败')
      }
    } catch (error) {
      message.error('网络错误')
    }
  }

  const columns: ColumnsType<Solution> = [
    {
      title: '封面',
      dataIndex: 'coverImage',
      key: 'coverImage',
      width: 100,
      render: (coverImage: string) =>
        coverImage ? (
          <Image
            src={coverImage}
            alt="封面"
            width={60}
            height={60}
            style={{ objectFit: 'cover', borderRadius: '4px' }}
          />
        ) : (
          <div
            style={{
              width: 60,
              height: 60,
              background: '#f0f0f0',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BulbOutlined style={{ fontSize: 24, color: '#999' }} />
          </div>
        ),
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      width: 250,
      render: (title: string) => <span style={{ fontWeight: 500 }}>{title}</span>,
    },
    {
      title: '标识',
      dataIndex: 'slug',
      key: 'slug',
      width: 180,
      render: (slug: string) => (
        <Tag color="blue" style={{ fontFamily: 'monospace' }}>
          {slug}
        </Tag>
      ),
    },
    {
      title: '简介',
      dataIndex: 'excerpt',
      key: 'excerpt',
      ellipsis: true,
      render: (excerpt: string) => excerpt || <span style={{ color: '#999' }}>未设置</span>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      filters: [
        { text: '已发布', value: 'published' },
        { text: '草稿', value: 'draft' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status: string) => (
        <Tag
          icon={status === 'published' ? <CheckCircleOutlined /> : <FileTextOutlined />}
          color={status === 'published' ? 'success' : 'warning'}
        >
          {status === 'published' ? '已发布' : '草稿'}
        </Tag>
      ),
    },
    {
      title: '排序',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 80,
      sorter: (a, b) => a.sortOrder - b.sortOrder,
      render: (order: number) => <Tag color="purple">{order}</Tag>,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => new Date(date).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'actions',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="查看详情">
            <Button
              type="text"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => router.push(`/admin/solutions/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="small"
              onClick={() => router.push(`/admin/solutions/${record.id}/edit`)}
            />
          </Tooltip>
          <Popconfirm
            title="删除解决方案"
            description="确定要删除这个解决方案吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="删除">
              <Button type="primary" danger icon={<DeleteOutlined />} size="small" />
            </Tooltip>
          </Popconfirm>
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
              placeholder="搜索标题、标识..."
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
              onChange={(value) => {
                setStatusFilter(value || '')
                loadSolutions()
              }}
            >
              <Select.Option value="">全部状态</Select.Option>
              <Select.Option value="published">已发布</Select.Option>
              <Select.Option value="draft">草稿</Select.Option>
            </Select>
          </Space>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={loadSolutions}>
              刷新
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => router.push('/admin/solutions/new')}
            >
              新建解决方案
            </Button>
          </Space>
        </Space>
      </Card>

      {/* 解决方案表格 */}
      <Card>
        <Table
          columns={columns}
          dataSource={solutions}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          scroll={{ x: 1400 }}
        />
      </Card>
    </div>
  )
}
