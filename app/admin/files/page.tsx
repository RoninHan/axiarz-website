'use client'

import { useEffect, useState } from 'react'
import {
  Table,
  Button,
  Space,
  Card,
  Row,
  Col,
  Statistic,
  Upload,
  message,
  Tooltip,
  Popconfirm,
  Image,
  Tag,
} from 'antd'
import {
  UploadOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EyeOutlined,
  FileOutlined,
  CloudUploadOutlined,
  FileImageOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { UploadProps } from 'antd'
import { FileItem } from '@/types'

function formatSize(size: number) {
  if (size > 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(2)} MB`
  }
  if (size > 1024) {
    return `${(size / 1024).toFixed(2)} KB`
  }
  return `${size} B`
}

function getFileIcon(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase()
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) {
    return <FileImageOutlined style={{ color: '#52c41a' }} />
  }
  if (ext === 'pdf') {
    return <FilePdfOutlined style={{ color: '#ff4d4f' }} />
  }
  if (['doc', 'docx'].includes(ext || '')) {
    return <FileWordOutlined style={{ color: '#1890ff' }} />
  }
  if (['xls', 'xlsx'].includes(ext || '')) {
    return <FileExcelOutlined style={{ color: '#52c41a' }} />
  }
  return <FileOutlined style={{ color: '#999' }} />
}

function isImage(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase()
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')
}

export default function FilesPage() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchFiles()
  }, [])

  async function fetchFiles() {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/files', {
        credentials: 'include',
      })
      const data = await res.json()
      if (data.success) {
        setFiles(data.data)
      }
    } catch (error) {
      console.error('获取文件列表失败:', error)
      message.error('获取文件列表失败')
    } finally {
      setLoading(false)
    }
  }

  const uploadProps: UploadProps = {
    name: 'file',
    action: '/api/admin/files',
    headers: {
      // credentials 会自动带上 cookie
    },
    onChange(info) {
      if (info.file.status === 'uploading') {
        setUploading(true)
      }
      if (info.file.status === 'done') {
        setUploading(false)
        if (info.file.response?.success) {
          message.success(`${info.file.name} 上传成功`)
          fetchFiles()
        } else {
          message.error(info.file.response?.error || '上传失败')
        }
      } else if (info.file.status === 'error') {
        setUploading(false)
        message.error(`${info.file.name} 上传失败`)
      }
    },
    showUploadList: false,
  }

  async function handleDelete(id: string, filename: string) {
    try {
      const res = await fetch(`/api/admin/files/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      const data = await res.json()
      if (data.success) {
        message.success('删除成功')
        fetchFiles()
      } else {
        message.error(data.error || '删除失败')
      }
    } catch (error) {
      console.error('删除文件失败:', error)
      message.error('删除失败')
    }
  }

  function handleDownload(url: string, filename: string) {
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const columns: ColumnsType<FileItem> = [
    {
      title: '预览',
      dataIndex: 'url',
      key: 'preview',
      width: 80,
      render: (url: string, record) =>
        isImage(record.originalName) ? (
          <Image
            src={url}
            alt={record.originalName}
            width={50}
            height={50}
            style={{ objectFit: 'cover', borderRadius: '4px' }}
          />
        ) : (
          <div
            style={{
              width: 50,
              height: 50,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#f5f5f5',
              borderRadius: '4px',
            }}
          >
            {getFileIcon(record.originalName)}
          </div>
        ),
    },
    {
      title: '文件名',
      dataIndex: 'originalName',
      key: 'originalName',
      render: (name: string) => (
        <Space>
          {getFileIcon(name)}
          <span style={{ fontWeight: 500 }}>{name}</span>
        </Space>
      ),
    },
    {
      title: '类型',
      dataIndex: 'originalName',
      key: 'type',
      width: 100,
      render: (name: string) => {
        const ext = name.split('.').pop()?.toLowerCase()
        return <Tag color="blue">{ext?.toUpperCase()}</Tag>
      },
    },
    {
      title: '大小',
      dataIndex: 'size',
      key: 'size',
      width: 120,
      sorter: (a, b) => a.size - b.size,
      render: (size: number) => <span>{formatSize(size)}</span>,
    },
    {
      title: '上传时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: Date) => new Date(date).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'actions',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="查看">
            <Button
              type="text"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => window.open(record.url, '_blank')}
            />
          </Tooltip>
          <Tooltip title="下载">
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              size="small"
              onClick={() => handleDownload(record.url, record.originalName)}
            />
          </Tooltip>
          <Popconfirm
            title="删除文件"
            description={`确定要删除 ${record.originalName} 吗？`}
            onConfirm={() => handleDelete(record.id, record.originalName)}
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
      {/* 上传区域 */}
      <Card style={{ marginBottom: 24 }}>
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Upload {...uploadProps}>
            <Button
              type="primary"
              icon={<UploadOutlined />}
              loading={uploading}
              size="large"
            >
              {uploading ? '上传中...' : '上传文件'}
            </Button>
          </Upload>
          <Button icon={<ReloadOutlined />} onClick={fetchFiles}>
            刷新
          </Button>
        </Space>
      </Card>

      {/* 文件表格 */}
      <Card>
        <Table
          columns={columns}
          dataSource={files}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 个文件`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>
    </div>
  )
}







