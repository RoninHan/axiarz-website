'use client'

import { useEffect, useState } from 'react'
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Space,
  Tag,
  Card,
  Row,
  Col,
  Statistic,
  message,
  Tooltip,
  Popconfirm,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FolderOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

const { TextArea } = Input

interface Category {
  id: string
  name: string
  description: string | null
  sortOrder: number
  status: string
  createdAt: Date
  updatedAt: Date
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    fetchCategories()
  }, [])

  async function fetchCategories() {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/categories', {
        credentials: 'include',
      })
      const data = await res.json()
      if (data.success) {
        setCategories(data.data)
      }
    } catch (error) {
      console.error('获取分类失败:', error)
      message.error('获取分类列表失败')
    } finally {
      setLoading(false)
    }
  }

  function showCreateModal() {
    setEditingCategory(null)
    form.resetFields()
    form.setFieldsValue({
      status: 'active',
      sortOrder: 0,
    })
    setModalVisible(true)
  }

  function showEditModal(category: Category) {
    setEditingCategory(category)
    form.setFieldsValue({
      name: category.name,
      description: category.description,
      sortOrder: category.sortOrder,
      status: category.status,
    })
    setModalVisible(true)
  }

  async function handleSubmit() {
    try {
      const values = await form.validateFields()
      const url = editingCategory
        ? `/api/admin/categories/${editingCategory.id}`
        : '/api/admin/categories'
      const method = editingCategory ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(values),
      })
      const data = await res.json()
      if (data.success) {
        message.success(editingCategory ? '分类更新成功' : '分类创建成功')
        setModalVisible(false)
        form.resetFields()
        await fetchCategories()
      } else {
        message.error(data.error || '操作失败')
      }
    } catch (error) {
      console.error('保存分类失败:', error)
      message.error('操作失败')
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      const data = await res.json()
      if (data.success) {
        message.success('分类删除成功')
        await fetchCategories()
      } else {
        message.error(data.error || '删除失败')
      }
    } catch (error) {
      console.error('删除分类失败:', error)
      message.error('删除失败')
    }
  }

  const columns: ColumnsType<Category> = [
    {
      title: '分类名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (name: string) => (
        <Space>
          <FolderOutlined style={{ color: '#667eea' }} />
          <span style={{ fontWeight: 500 }}>{name}</span>
        </Space>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (desc: string | null) => desc || <span style={{ color: '#999' }}>未设置</span>,
    },
    {
      title: '排序',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 100,
      sorter: (a, b) => a.sortOrder - b.sortOrder,
      render: (order: number) => <Tag color="blue">{order}</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      filters: [
        { text: '启用', value: 'active' },
        { text: '禁用', value: 'inactive' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status: string) => (
        <Tag
          icon={status === 'active' ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
          color={status === 'active' ? 'success' : 'default'}
        >
          {status === 'active' ? '启用' : '禁用'}
        </Tag>
      ),
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
          <Tooltip title="编辑">
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="small"
              onClick={() => showEditModal(record)}
            />
          </Tooltip>
          <Popconfirm
            title="删除分类"
            description="确定要删除这个分类吗？"
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
      {/* 操作按钮 */}
      <Card style={{ marginBottom: 24 }}>
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={showCreateModal}>
            新增分类
          </Button>
          <Button icon={<ReloadOutlined />} onClick={fetchCategories}>
            刷新
          </Button>
        </Space>
      </Card>

      {/* 分类表格 */}
      <Card>
        <Table
          columns={columns}
          dataSource={categories}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>

      {/* 新增/编辑弹窗 */}
      <Modal
        title={editingCategory ? '编辑分类' : '新增分类'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setModalVisible(false)
          form.resetFields()
        }}
        okText="保存"
        cancelText="取消"
        width={600}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item
            label="分类名称"
            name="name"
            rules={[{ required: true, message: '请输入分类名称' }]}
          >
            <Input placeholder="请输入分类名称" />
          </Form.Item>
          <Form.Item label="分类描述" name="description">
            <TextArea rows={4} placeholder="请输入分类描述（可选）" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="排序顺序"
                name="sortOrder"
                rules={[{ required: true, message: '请输入排序顺序' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  placeholder="数字越小越靠前"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="状态"
                name="status"
                rules={[{ required: true, message: '请选择状态' }]}
              >
                <Select>
                  <Select.Option value="active">启用</Select.Option>
                  <Select.Option value="inactive">禁用</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  )
}

