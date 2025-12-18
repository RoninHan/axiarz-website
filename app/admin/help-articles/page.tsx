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
  Input,
  Select,
  Badge,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  QuestionCircleOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  StarFilled,
  StarOutlined,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { HelpArticle } from '@/types'

const { Option } = Select

const CATEGORY_MAP: { [key: string]: { label: string; color: string; icon: any } } = {
  faq: { label: '常见问题', color: 'blue', icon: <QuestionCircleOutlined /> },
  guide: { label: '使用指南', color: 'green', icon: <FileTextOutlined /> },
  tutorial: { label: '教程', color: 'orange', icon: <FileTextOutlined /> },
  troubleshooting: { label: '故障排除', color: 'red', icon: <QuestionCircleOutlined /> },
}

export default function HelpArticlesPage() {
  const router = useRouter()
  const [articles, setArticles] = useState<HelpArticle[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')

  useEffect(() => {
    loadArticles()
  }, [])

  async function loadArticles() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (categoryFilter) params.append('category', categoryFilter)
      if (statusFilter) params.append('status', statusFilter)

      const res = await fetch(`/api/admin/help-articles?${params}`, {
        credentials: 'include',
      })
      const data = await res.json()
      if (data.success) {
        setArticles(data.data)
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
    loadArticles()
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/admin/help-articles/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      const data = await res.json()
      if (data.success) {
        message.success('删除成功')
        loadArticles()
      } else {
        message.error(data.error || '删除失败')
      }
    } catch (error) {
      message.error('网络错误')
    }
  }

  const columns: ColumnsType<HelpArticle> = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      width: 250,
      render: (title: string, record: HelpArticle) => (
        <Space>
          {record.featured && (
            <Tooltip title="精选文章">
              <StarFilled style={{ color: '#faad14' }} />
            </Tooltip>
          )}
          <span style={{ fontWeight: 500 }}>{title}</span>
        </Space>
      ),
    },
    {
      title: '标识',
      dataIndex: 'slug',
      key: 'slug',
      width: 150,
      render: (slug: string) => (
        <Tag color="blue" style={{ fontFamily: 'monospace' }}>
          {slug}
        </Tag>
      ),
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      filters: Object.keys(CATEGORY_MAP).map((key) => ({
        text: CATEGORY_MAP[key].label,
        value: key,
      })),
      onFilter: (value, record) => record.category === value,
      render: (category: string) => {
        const config = CATEGORY_MAP[category] || { label: category, color: 'default', icon: null }
        return (
          <Tag icon={config.icon} color={config.color}>
            {config.label}
          </Tag>
        )
      },
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
      title: '浏览次数',
      dataIndex: 'viewCount',
      key: 'viewCount',
      width: 100,
      sorter: (a, b) => (a.viewCount || 0) - (b.viewCount || 0),
      render: (count: number) => (
        <Badge count={count || 0} showZero style={{ backgroundColor: '#667eea' }} />
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
              onClick={() => router.push(`/admin/help-articles/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="small"
              onClick={() => router.push(`/admin/help-articles/${record.id}/edit`)}
            />
          </Tooltip>
          <Popconfirm
            title="删除文章"
            description="确定要删除这篇文章吗？"
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
              placeholder="筛选分类"
              style={{ width: 150 }}
              allowClear
              value={categoryFilter || undefined}
              onChange={(value) => {
                setCategoryFilter(value || '')
                loadArticles()
              }}
            >
              <Option value="">全部分类</Option>
              <Option value="faq">常见问题</Option>
              <Option value="guide">使用指南</Option>
              <Option value="tutorial">教程</Option>
              <Option value="troubleshooting">故障排除</Option>
            </Select>
            <Select
              placeholder="筛选状态"
              style={{ width: 150 }}
              allowClear
              value={statusFilter || undefined}
              onChange={(value) => {
                setStatusFilter(value || '')
                loadArticles()
              }}
            >
              <Select.Option value="">全部状态</Select.Option>
              <Select.Option value="published">已发布</Select.Option>
              <Select.Option value="draft">草稿</Select.Option>
            </Select>
          </Space>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={loadArticles}>
              刷新
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => router.push('/admin/help-articles/new')}
            >
              新建文章
            </Button>
          </Space>
        </Space>
      </Card>

      {/* 文章表格 */}
      <Card>
        <Table
          columns={columns}
          dataSource={articles}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          scroll={{ x: 1600 }}
        />
      </Card>
    </div>
  )
}
