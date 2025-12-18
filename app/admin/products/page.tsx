'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Table,
  Button,
  Space,
  Tag,
  Card,
  Row,
  Col,
  Statistic,
  Input,
  Select,
  message,
  Tooltip,
  Popconfirm,
  Image,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  InboxOutlined,
  ShoppingCartOutlined,
  CloseCircleOutlined,
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { Product } from '@/types'

interface Category {
  id: string
  name: string
  status: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')

  useEffect(() => {
    fetchCategories()
    fetchProducts()
  }, [])

  async function fetchCategories() {
    try {
      const res = await fetch('/api/admin/categories', {
        credentials: 'include',
      })
      const data = await res.json()
      if (data.success) {
        setCategories(data.data.filter((c: Category) => c.status === 'active'))
      }
    } catch (error) {
      console.error('获取分类失败:', error)
    }
  }

  async function fetchProducts() {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (categoryFilter) params.append('category', categoryFilter)
      if (statusFilter) params.append('status', statusFilter)

      const res = await fetch(`/api/admin/products?${params}`, {
        credentials: 'include',
      })
      const data = await res.json()
      if (data.success) {
        setProducts(data.data)
      }
    } catch (error) {
      console.error('获取产品失败:', error)
      message.error('获取产品列表失败')
    } finally {
      setLoading(false)
    }
  }

  function handleSearch(value: string) {
    setSearch(value)
    fetchProducts()
  }

  async function deleteProduct(id: string) {
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      const data = await res.json()
      if (data.success) {
        message.success('产品删除成功')
        await fetchProducts()
      } else {
        message.error(data.error || '删除失败')
      }
    } catch (error) {
      console.error('删除产品失败:', error)
      message.error('删除失败')
    }
  }

  const getStatusTag = (status: string) => {
    const statusMap = {
      active: { color: 'success', text: '在售', icon: <ShoppingCartOutlined /> },
      inactive: { color: 'default', text: '下架', icon: <CloseCircleOutlined /> },
      sold_out: { color: 'error', text: '缺货', icon: <CloseCircleOutlined /> },
    }
    const config = statusMap[status as keyof typeof statusMap] || statusMap.inactive
    return (
      <Tag icon={config.icon} color={config.color}>
        {config.text}
      </Tag>
    )
  }

  const columns: ColumnsType<Product> = [
    {
      title: '产品图片',
      dataIndex: 'images',
      key: 'images',
      width: 100,
      render: (images: string[]) =>
        images && images.length > 0 ? (
          <Image
            src={images[0]}
            alt="产品图片"
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
            <InboxOutlined style={{ fontSize: 24, color: '#999' }} />
          </div>
        ),
    },
    {
      title: '产品名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (name: string) => <span style={{ fontWeight: 500 }}>{name}</span>,
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (category: any) => (
        <Tag color="blue">{category?.name || '未分类'}</Tag>
      ),
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      sorter: (a, b) => Number(a.price) - Number(b.price),
      render: (price: number) => (
        <span style={{ color: '#667eea', fontWeight: 500 }}>
          ¥{Number(price).toFixed(2)}
        </span>
      ),
    },
    {
      title: '库存',
      dataIndex: 'stock',
      key: 'stock',
      width: 100,
      sorter: (a, b) => a.stock - b.stock,
      render: (stock: number) => (
        <Tag color={stock > 10 ? 'success' : stock > 0 ? 'warning' : 'error'}>
          {stock}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      filters: [
        { text: '在售', value: 'active' },
        { text: '下架', value: 'inactive' },
        { text: '缺货', value: 'sold_out' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status: string) => getStatusTag(status),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: Date) => new Date(date).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="查看">
            <Link href={`/products/${record.id}`} target="_blank">
              <Button type="text" icon={<EyeOutlined />} size="small" />
            </Link>
          </Tooltip>
          <Tooltip title="编辑">
            <Link href={`/admin/products/${record.id}`}>
              <Button type="primary" icon={<EditOutlined />} size="small" />
            </Link>
          </Tooltip>
          <Popconfirm
            title="删除产品"
            description="确定要删除这个产品吗？"
            onConfirm={() => deleteProduct(record.id)}
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
              placeholder="搜索产品名称、SKU..."
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
                fetchProducts()
              }}
            >
              <Select.Option value="">所有分类</Select.Option>
              {categories.map((cat) => (
                <Select.Option key={cat.id} value={cat.id}>
                  {cat.name}
                </Select.Option>
              ))}
            </Select>
            <Select
              placeholder="筛选状态"
              style={{ width: 150 }}
              allowClear
              value={statusFilter || undefined}
              onChange={(value) => {
                setStatusFilter(value || '')
                fetchProducts()
              }}
            >
              <Select.Option value="">全部状态</Select.Option>
              <Select.Option value="active">在售</Select.Option>
              <Select.Option value="inactive">下架</Select.Option>
              <Select.Option value="sold_out">缺货</Select.Option>
            </Select>
          </Space>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={fetchProducts}>
              刷新
            </Button>
            <Link href="/admin/products/new">
              <Button type="primary" icon={<PlusOutlined />}>
                新增产品
              </Button>
            </Link>
          </Space>
        </Space>
      </Card>

      {/* 产品表格 */}
      <Card>
        <Table
          columns={columns}
          dataSource={products}
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

