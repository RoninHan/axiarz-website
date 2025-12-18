'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button, Card, Tag, Spin, message, Space, Badge } from 'antd'
import { ArrowLeftOutlined, EditOutlined, EyeOutlined, StarFilled } from '@ant-design/icons'
import type { HelpArticle } from '@/types'

const CATEGORY_MAP: { [key: string]: { label: string; color: string } } = {
  faq: { label: '常见问题', color: 'blue' },
  guide: { label: '使用指南', color: 'green' },
  tutorial: { label: '教程', color: 'orange' },
  troubleshooting: { label: '故障排除', color: 'red' },
}

export default function HelpArticleViewPage() {
  const router = useRouter()
  const params = useParams()
  const [article, setArticle] = useState<HelpArticle | null>(null)
  const [loading, setLoading] = useState(true)
  const [messageApi, contextHolder] = message.useMessage()

  useEffect(() => {
    loadArticle()
  }, [])

  async function loadArticle() {
    try {
      const res = await fetch(`/api/admin/help-articles/${params.id}`)
      const data = await res.json()
      if (data.success) {
        setArticle(data.data)
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

  if (!article) {
    return (
      <div className="p-6">
        <p>文章不存在</p>
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
          onClick={() => router.push(`/admin/help-articles/${params.id}/edit`)}
        >
          编辑
        </Button>
      </div>

      <Card>
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold">{article.title}</h1>
              {article.featured && <StarFilled className="text-yellow-500 text-xl" />}
            </div>
            <Space size="middle" className="text-sm text-gray-500">
              <span>标识: <code className="bg-gray-100 px-2 py-1 rounded">{article.slug}</code></span>
              <Tag color={CATEGORY_MAP[article.category]?.color || 'default'}>
                {CATEGORY_MAP[article.category]?.label || article.category}
              </Tag>
              <Tag color={article.status === 'published' ? 'green' : 'orange'}>
                {article.status === 'published' ? '已发布' : '草稿'}
              </Tag>
              <span>排序: {article.sortOrder}</span>
              <Badge count={article.viewCount} showZero color="blue" title="浏览次数" />
            </Space>
          </div>

          {article.excerpt && (
            <div>
              <h3 className="text-lg font-semibold mb-2">摘要</h3>
              <p className="text-gray-600">{article.excerpt}</p>
            </div>
          )}

          <div>
            <h3 className="text-lg font-semibold mb-2">内容</h3>
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </div>

          <div className="text-sm text-gray-500 pt-6 border-t">
            <p>创建时间: {new Date(article.createdAt).toLocaleString('zh-CN')}</p>
            <p>更新时间: {new Date(article.updatedAt).toLocaleString('zh-CN')}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
