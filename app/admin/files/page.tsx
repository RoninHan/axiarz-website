'use client'

import { useEffect, useState } from 'react'
import AdminCard from '@/components/admin/AdminCard'
import AdminButton from '@/components/admin/AdminButton'
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

export default function FilesPage() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  useEffect(() => {
    fetchFiles()
  }, [])

  async function fetchFiles() {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/files')
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

  async function handleUpload() {
    if (!selectedFile) {
      alert('请选择文件')
      return
    }

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('file', selectedFile)

      const res = await fetch('/api/admin/files', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (data.success) {
        alert('上传成功')
        setSelectedFile(null)
        await fetchFiles()
      } else {
        alert(data.error || '上传失败')
      }
    } catch (error) {
      console.error('上传文件失败:', error)
      alert('上传失败')
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('确定要删除这个文件吗？')) return
    try {
      const res = await fetch(`/api/admin/files/${id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.success) {
        await fetchFiles()
      } else {
        alert(data.error || '删除失败')
      }
    } catch (error) {
      console.error('删除文件失败:', error)
      alert('删除失败')
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-title-large font-title">文件管理</h1>
      </div>

      <AdminCard className="mb-6" title="上传文件">
        <div className="flex items-center gap-4">
          <input
            type="file"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            className="text-body"
          />
          <AdminButton
            variant="primary"
            onClick={handleUpload}
            disabled={uploading || !selectedFile}
            className="whitespace-nowrap"
          >
            {uploading ? '上传中...' : '上传'}
          </AdminButton>
          {selectedFile && (
            <span className="text-caption text-neutral-medium">
              已选择: {selectedFile.name} ({formatSize(selectedFile.size)})
            </span>
          )}
        </div>
      </AdminCard>

      <AdminCard title="文件列表">
        {loading ? (
          <div className="text-center py-12">加载中...</div>
        ) : files.length === 0 ? (
          <div className="text-center py-12 text-neutral-medium">暂无文件</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-medium">
                  <th className="text-left py-3 px-4 text-body font-medium">文件名</th>
                  <th className="text-left py-3 px-4 text-body font-medium">大小</th>
                  <th className="text-left py-3 px-4 text-body font-medium">上传时间</th>
                  <th className="text-left py-3 px-4 text-body font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file) => (
                  <tr key={file.id} className="border-b border-neutral-medium">
                    <td className="py-3 px-4 text-body">{file.originalName}</td>
                    <td className="py-3 px-4 text-body">{formatSize(file.size)}</td>
                    <td className="py-3 px-4 text-body text-caption">
                      {new Date(file.createdAt).toLocaleString('zh-CN')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <a href={file.url} target="_blank" rel="noreferrer">
                          <AdminButton variant="secondary" className="whitespace-nowrap">
                            查看
                          </AdminButton>
                        </a>
                        <a href={file.url} download={file.originalName}>
                          <AdminButton variant="secondary" className="whitespace-nowrap">
                            下载
                          </AdminButton>
                        </a>
                        <AdminButton
                          variant="danger"
                          onClick={() => handleDelete(file.id)}
                          className="whitespace-nowrap"
                        >
                          删除
                        </AdminButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>
    </div>
  )
}







