'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button, Card, Tag, Spin, message } from 'antd'
import { ArrowLeftOutlined, EditOutlined } from '@ant-design/icons'
import type { Solution } from '@/types'

export default function SolutionViewPage() {
  const router = useRouter()
  const params = useParams()
  const [solution, setSolution] = useState<Solution | null>(null)
  const [loading, setLoading] = useState(true)
  const [messageApi, contextHolder] = message.useMessage()

  useEffect(() => {
    loadSolution()
  }, [])

  async function loadSolution() {
    try {
      const res = await fetch(`/api/admin/solutions/${params.id}`)
      const data = await res.json()
      if (data.success) {
        setSolution(data.data)
      } else {
        messageApi.error(data.error || '加载失败')
      }
    } catch (error) {
      messageApi.error('网络错误')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    )
  }

  if (!solution) {
    return (
      <div className="p-6">
        <p>解决方案不存在</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {contextHolder}
      
      <div className="mb-6 flex justify-between items-center">
        <Button icon={<ArrowLeftOutlined />} onClick={() => router.back()}>
          返回
        </Button>
        <Button
          type="primary"
          icon={<EditOutlined />}
          onClick={() => router.push(`/admin/solutions/${params.id}/edit`)}
        >
          编辑
        </Button>
      </div>

      <Card>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{solution.title}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>标识: <code className="bg-gray-100 px-2 py-1 rounded">{solution.slug}</code></span>
              <Tag color={solution.status === 'published' ? 'green' : 'orange'}>
                {solution.status === 'published' ? '已发布' : '草稿'}
              </Tag>
              <span>排序: {solution.sortOrder}</span>
            </div>
          </div>

          {solution.description && (
            <div>
              <h3 className="text-lg font-semibold mb-2">简短描述</h3>
              <p className="text-gray-600">{solution.description}</p>
            </div>
          )}

          {solution.coverImage && (
            <div>
              <h3 className="text-lg font-semibold mb-2">封面图片</h3>
              <img src={solution.coverImage} alt={solution.title} className="max-w-md rounded-lg shadow" />
            </div>
          )}

          <div>
            <h3 className="text-lg font-semibold mb-2">内容</h3>
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: solution.content }}
            />
          </div>

          <div className="text-sm text-gray-500 pt-6 border-t">
            <p>创建时间: {new Date(solution.createdAt).toLocaleString('zh-CN')}</p>
            <p>更新时间: {new Date(solution.updatedAt).toLocaleString('zh-CN')}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
