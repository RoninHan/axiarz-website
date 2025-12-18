'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button, Spin, Empty, Tag, Breadcrumb } from 'antd'
import { ArrowLeftOutlined, HomeOutlined, QuestionCircleOutlined, EyeOutlined } from '@ant-design/icons'
import Link from 'next/link'
import type { HelpArticle } from '@/types'

const CATEGORY_MAP: { [key: string]: { label: string; color: string } } = {
  faq: { label: '常见问题', color: 'blue' },
  guide: { label: '使用指南', color: 'green' },
  tutorial: { label: '教程', color: 'orange' },
  troubleshooting: { label: '故障排除', color: 'red' },
}

export default function HelpArticleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [article, setArticle] = useState<HelpArticle | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadArticle()
  }, [])

  async function loadArticle() {
    try {
      const res = await fetch(`/api/client/help-articles/${params.slug}`)
      const data = await res.json()
      if (data.success) {
        setArticle(data.data)
      }
    } catch (error) {
      console.error('Failed to load article:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-12 flex justify-center items-center min-h-[400px]">
        <Spin size="large" />
      </div>
    )
  }

  if (!article) {
    return (
      <div className="container mx-auto px-6 py-12">
        <Empty description="文章不存在" />
        <div className="text-center mt-6">
          <Button type="primary" onClick={() => router.push('/help')}>
            返回帮助中心
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        {/* 面包屑导航 */}
        <Breadcrumb className="mb-6">
          <Breadcrumb.Item>
            <Link href="/">
              <HomeOutlined />
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link href="/help">
              <QuestionCircleOutlined /> 帮助中心
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Tag color={CATEGORY_MAP[article.category]?.color || 'default'}>
              {CATEGORY_MAP[article.category]?.label || article.category}
            </Tag>
          </Breadcrumb.Item>
          <Breadcrumb.Item>{article.title}</Breadcrumb.Item>
        </Breadcrumb>

        {/* 返回按钮 */}
        <div className="mb-6">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => router.push('/help')}
          >
            返回帮助中心
          </Button>
        </div>

        {/* 文章标题 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <Tag color={CATEGORY_MAP[article.category]?.color || 'default'}>
              {CATEGORY_MAP[article.category]?.label || article.category}
            </Tag>
            <span className="flex items-center">
              <EyeOutlined className="mr-1" />
              {article.viewCount} 次浏览
            </span>
            <span>更新于 {new Date(article.updatedAt).toLocaleDateString('zh-CN')}</span>
          </div>
        </div>

        {/* 文章摘要 */}
        {article.excerpt && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg mb-8">
            <p className="text-lg text-gray-700">{article.excerpt}</p>
          </div>
        )}

        {/* 文章内容 */}
        <div
          className="prose prose-lg max-w-none
            prose-headings:text-primary-black
            prose-h1:text-4xl prose-h1:font-bold prose-h1:mb-6
            prose-h2:text-3xl prose-h2:font-bold prose-h2:mb-4 prose-h2:mt-8
            prose-h3:text-2xl prose-h3:font-semibold prose-h3:mb-3 prose-h3:mt-6
            prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
            prose-a:text-accent-orange prose-a:no-underline hover:prose-a:underline
            prose-strong:text-primary-black prose-strong:font-semibold
            prose-ul:list-disc prose-ul:pl-6 prose-ul:my-4
            prose-ol:list-decimal prose-ol:pl-6 prose-ol:my-4
            prose-li:text-gray-700 prose-li:mb-2
            prose-blockquote:border-l-4 prose-blockquote:border-accent-orange prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600
            prose-img:rounded-lg prose-img:shadow-lg prose-img:my-8
            prose-video:rounded-lg prose-video:shadow-lg prose-video:my-8
            prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm
            prose-pre:bg-gray-900 prose-pre:text-white prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto
            prose-table:border-collapse prose-table:w-full
            prose-th:bg-gray-100 prose-th:border prose-th:border-gray-300 prose-th:p-2
            prose-td:border prose-td:border-gray-300 prose-td:p-2"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* 页脚 */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="text-center">
            <p className="text-gray-600 mb-4">这篇文章有帮助吗？</p>
            <div className="flex justify-center gap-4 mb-6">
              <Button type="primary" size="large">
                👍 有帮助
              </Button>
              <Button size="large">
                👎 没有帮助
              </Button>
            </div>
            <p className="text-gray-500">
              如果您还有其他问题，请
              <Link href="/contact" className="text-accent-orange hover:underline mx-1">
                联系我们
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
