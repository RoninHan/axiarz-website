'use client'

import { useEffect, useState } from 'react'
import { Card, List, Button, Input, Select, Tag, Space, Empty, Spin, Typography, Divider } from 'antd'
import {
  DownloadOutlined,
  FileOutlined,
  FileTextOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  FileZipOutlined,
  FileExcelOutlined,
  FileWordOutlined,
  SearchOutlined,
  EyeOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons'
import { FileItem } from '@/types'

const { Title, Text, Paragraph } = Typography

function formatSize(size: number) {
  if (size > 1024 * 1024 * 1024) {
    return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`
  }
  if (size > 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(2)} MB`
  }
  if (size > 1024) {
    return `${(size / 1024).toFixed(2)} KB`
  }
  return `${size} B`
}

function getFileIcon(fileName: string) {
  const ext = fileName.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'pdf':
      return <FilePdfOutlined style={{ fontSize: 32, color: '#f5222d' }} />
    case 'doc':
    case 'docx':
      return <FileWordOutlined style={{ fontSize: 32, color: '#1890ff' }} />
    case 'xls':
    case 'xlsx':
      return <FileExcelOutlined style={{ fontSize: 32, color: '#52c41a' }} />
    case 'zip':
    case 'rar':
    case '7z':
      return <FileZipOutlined style={{ fontSize: 32, color: '#faad14' }} />
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'svg':
      return <FileImageOutlined style={{ fontSize: 32, color: '#722ed1' }} />
    case 'txt':
    case 'md':
      return <FileTextOutlined style={{ fontSize: 32, color: '#13c2c2' }} />
    default:
      return <FileOutlined style={{ fontSize: 32, color: '#8c8c8c' }} />
  }
}

function getFileType(fileName: string) {
  const ext = fileName.split('.').pop()?.toLowerCase()
  const typeMap: { [key: string]: { label: string; color: string } } = {
    pdf: { label: 'PDF', color: 'red' },
    doc: { label: 'Word', color: 'blue' },
    docx: { label: 'Word', color: 'blue' },
    xls: { label: 'Excel', color: 'green' },
    xlsx: { label: 'Excel', color: 'green' },
    zip: { label: '压缩包', color: 'orange' },
    rar: { label: '压缩包', color: 'orange' },
    '7z': { label: '压缩包', color: 'orange' },
    jpg: { label: '图片', color: 'purple' },
    jpeg: { label: '图片', color: 'purple' },
    png: { label: '图片', color: 'purple' },
    gif: { label: '图片', color: 'purple' },
    txt: { label: '文本', color: 'cyan' },
    md: { label: 'Markdown', color: 'cyan' },
  }
  return typeMap[ext || ''] || { label: '文件', color: 'default' }
}

export default function ClientFilesPage() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [filteredFiles, setFilteredFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('')

  useEffect(() => {
    fetchFiles()
  }, [])

  useEffect(() => {
    filterFiles()
  }, [files, search, typeFilter])

  async function fetchFiles() {
    try {
      setLoading(true)
      const res = await fetch('/api/client/files')
      const data = await res.json()
      if (data.success) {
        setFiles(data.data)
      }
    } catch (error) {
      console.error('获取文件列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  function filterFiles() {
    let result = [...files]

    if (search) {
      result = result.filter((file) =>
        file.originalName.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (typeFilter) {
      result = result.filter((file) => {
        const ext = file.originalName.split('.').pop()?.toLowerCase()
        return ext === typeFilter
      })
    }

    setFilteredFiles(result)
  }

  const fileTypes = Array.from(
    new Set(files.map((f) => f.originalName.split('.').pop()?.toLowerCase() || ''))
  ).filter(Boolean)

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', padding: '40px 0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        {/* 页面标题 */}
        <Card style={{ marginBottom: 24, background: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)', border: 'none' }}>
          <Title level={2} style={{ margin: 0, color: '#fff' }}>
            📂 文件下载中心
          </Title>
          <Paragraph style={{ margin: '8px 0 0', color: 'rgba(255, 255, 255, 0.85)', fontSize: 16 }}>
            浏览和下载项目相关的文档、资料和文件
          </Paragraph>
        </Card>

        {/* 搜索和筛选 */}
        <Card style={{ marginBottom: 24 }}>
          <Space size="middle" style={{ width: '100%' }} wrap>
            <Input
              placeholder="搜索文件名..."
              prefix={<SearchOutlined />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 300 }}
              allowClear
            />
            <Select
              placeholder="文件类型"
              value={typeFilter || undefined}
              onChange={setTypeFilter}
              style={{ width: 150 }}
              allowClear
            >
              {fileTypes.map((type) => (
                <Select.Option key={type} value={type}>
                  {type.toUpperCase()}
                </Select.Option>
              ))}
            </Select>
            <Text type="secondary">
              共 {filteredFiles.length} 个文件
            </Text>
          </Space>
        </Card>

        {/* 文件列表 */}
        {loading ? (
          <Card>
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <Spin size="large" tip="加载中..." />
            </div>
          </Card>
        ) : filteredFiles.length === 0 ? (
          <Card>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={search || typeFilter ? '没有找到匹配的文件' : '暂无可下载的文件'}
            />
          </Card>
        ) : (
          <List
            grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 2, xxl: 3 }}
            dataSource={filteredFiles}
            renderItem={(file) => {
              const fileType = getFileType(file.originalName)
              return (
                <List.Item>
                  <Card
                    hoverable
                    style={{ height: '100%' }}
                    bodyStyle={{ padding: 24 }}
                  >
                    <Space direction="vertical" style={{ width: '100%' }} size="middle">
                      {/* 文件图标和类型 */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        {getFileIcon(file.originalName)}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <Text
                            strong
                            style={{
                              fontSize: 16,
                              display: 'block',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                            title={file.originalName}
                          >
                            {file.originalName}
                          </Text>
                          <Space size="small" style={{ marginTop: 4 }}>
                            <Tag color={fileType.color}>{fileType.label}</Tag>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {formatSize(file.size)}
                            </Text>
                          </Space>
                        </div>
                      </div>

                      <Divider style={{ margin: 0 }} />

                      {/* 文件信息 */}
                      <div>
                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <ClockCircleOutlined style={{ color: '#8c8c8c' }} />
                            <Text type="secondary" style={{ fontSize: 13 }}>
                              {new Date(file.createdAt).toLocaleString('zh-CN', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </Text>
                          </div>
                        </Space>
                      </div>

                      {/* 操作按钮 */}
                      <Space style={{ width: '100%' }}>
                        <Button
                          type="default"
                          icon={<EyeOutlined />}
                          href={file.url}
                          target="_blank"
                          rel="noreferrer"
                          style={{ flex: 1 }}
                        >
                          预览
                        </Button>
                        <Button
                          type="primary"
                          icon={<DownloadOutlined />}
                          href={file.url}
                          download={file.originalName}
                          style={{
                            flex: 1,
                            background: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)',
                            border: 'none',
                          }}
                        >
                          下载
                        </Button>
                      </Space>
                    </Space>
                  </Card>
                </List.Item>
              )
            }}
          />
        )}
      </div>
    </div>
  )
}






