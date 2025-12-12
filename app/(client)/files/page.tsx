'use client'

import { useEffect, useState } from 'react'
import Card from '@/components/client/Card'
import Button from '@/components/client/Button'
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

export default function ClientFilesPage() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFiles()
  }, [])

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

  return (
    <div className="container mx-auto px-6 py-12 max-w-[1920px]">
      <h1 className="text-title-large font-title mb-8">文件下载</h1>

      {loading ? (
        <div className="text-center py-12">加载中...</div>
      ) : files.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-body text-neutral-medium">暂无可下载的文件</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {files.map((file) => (
            <Card key={file.id} className="flex items-center justify-between">
              <div>
                <h3 className="text-title-small font-title mb-1">{file.originalName}</h3>
                <p className="text-caption text-neutral-medium">
                  大小: {formatSize(file.size)} · 上传时间:{' '}
                  {new Date(file.createdAt).toLocaleString('zh-CN')}
                </p>
              </div>
              <div className="flex gap-3">
                <a href={file.url} target="_blank" rel="noreferrer">
                  <Button variant="outline" className="whitespace-nowrap">
                    查看
                  </Button>
                </a>
                <a href={file.url} download={file.originalName}>
                  <Button variant="primary" className="whitespace-nowrap">
                    下载
                  </Button>
                </a>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}







