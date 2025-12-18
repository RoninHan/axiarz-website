'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Collapse, Tabs, Card, Row, Col, Empty, Spin, Tag, Badge } from 'antd'
import { QuestionCircleOutlined, BookOutlined, FileTextOutlined, ToolOutlined, EyeOutlined } from '@ant-design/icons'
import type { HelpArticle } from '@/types'

const { Panel } = Collapse
const { TabPane } = Tabs

const CATEGORY_CONFIG: { [key: string]: { label: string; icon: any; color: string } } = {
  faq: { label: '常见问题', icon: <QuestionCircleOutlined />, color: 'blue' },
  guide: { label: '使用指南', icon: <BookOutlined />, color: 'green' },
  tutorial: { label: '教程', icon: <FileTextOutlined />, color: 'orange' },
  troubleshooting: { label: '故障排除', icon: <ToolOutlined />, color: 'red' },
}

export default function HelpPage() {
  const [articles, setArticles] = useState<HelpArticle[]>([])
  const [featuredArticles, setFeaturedArticles] = useState<HelpArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('faq')

  useEffect(() => {
    loadArticles()
    loadFeaturedArticles()
  }, [])

  async function loadArticles() {
    try {
      const res = await fetch('/api/client/help-articles')
      const data = await res.json()
      if (data.success) {
        setArticles(data.data)
      }
    } catch (error) {
      console.error('Failed to load articles:', error)
    } finally {
      setLoading(false)
    }
  }

  async function loadFeaturedArticles() {
    try {
      const res = await fetch('/api/client/help-articles?featured=true')
      const data = await res.json()
      if (data.success) {
        setFeaturedArticles(data.data.slice(0, 3))
      }
    } catch (error) {
      console.error('Failed to load featured articles:', error)
    }
  }

  const articlesByCategory = articles.reduce((acc, article) => {
    if (!acc[article.category]) {
      acc[article.category] = []
    }
    acc[article.category].push(article)
    return acc
  }, {} as { [key: string]: HelpArticle[] })

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-12 flex justify-center items-center min-h-[400px]">
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-6 py-12 max-w-[1200px]">
      {/* 标题区域 */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">帮助中心</h1>
        <p className="text-lg text-gray-600">我们随时为您提供帮助</p>
      </div>

      {/* 精选文章 */}
      {featuredArticles.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">📌 精选文章</h2>
          <Row gutter={[24, 24]}>
            {featuredArticles.map((article) => (
              <Col key={article.id} xs={24} md={8}>
                <Link href={`/help/${article.slug}`}>
                  <Card
                    hoverable
                    className="h-full shadow-card hover:shadow-hover transition-all"
                    bordered={false}
                  >
                    <div className="mb-3">
                      <Tag color={CATEGORY_CONFIG[article.category]?.color || 'default'}>
                        {CATEGORY_CONFIG[article.category]?.label || article.category}
                      </Tag>
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-primary-black">{article.title}</h3>
                    {article.excerpt && (
                      <p className="text-gray-600 line-clamp-2 mb-3">{article.excerpt}</p>
                    )}
                    <div className="flex items-center text-sm text-gray-400">
                      <EyeOutlined className="mr-1" />
                      <span>{article.viewCount} 次浏览</span>
                    </div>
                  </Card>
                </Link>
              </Col>
            ))}
          </Row>
        </div>
      )}

      {/* 分类标签 */}
      <Tabs
        activeKey={activeCategory}
        onChange={setActiveCategory}
        size="large"
        className="mb-8"
      >
        {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
          <TabPane
            key={key}
            tab={
              <span>
                {config.icon}
                <span className="ml-2">{config.label}</span>
                {articlesByCategory[key] && (
                  <Badge
                    count={articlesByCategory[key].length}
                    className="ml-2"
                    style={{ backgroundColor: '#52c41a' }}
                  />
                )}
              </span>
            }
          />
        ))}
      </Tabs>

      {/* 文章列表 */}
      <div className="bg-white rounded-lg shadow-card p-6">
        {articlesByCategory[activeCategory]?.length > 0 ? (
          <Collapse
            bordered={false}
            className="bg-white"
            expandIconPosition="end"
          >
            {articlesByCategory[activeCategory].map((article) => (
              <Panel
                key={article.id}
                header={
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{article.title}</span>
                    <div className="flex items-center text-sm text-gray-400 mr-4">
                      <EyeOutlined className="mr-1" />
                      <span>{article.viewCount}</span>
                    </div>
                  </div>
                }
              >
                {article.excerpt && (
                  <p className="text-gray-600 mb-4">{article.excerpt}</p>
                )}
                <Link href={`/help/${article.slug}`}>
                  <span className="text-accent-orange hover:underline cursor-pointer">
                    查看完整文章 →
                  </span>
                </Link>
              </Panel>
            ))}
          </Collapse>
        ) : (
          <Empty description={`暂无${CATEGORY_CONFIG[activeCategory]?.label || '文章'}`} />
        )}
      </div>

      {/* 联系我们 */}
      <div className="mt-12 text-center bg-gray-50 rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-4">没有找到答案？</h2>
        <p className="text-gray-600 mb-6">
          如果您有其他问题，欢迎联系我们的客服团队
        </p>
        <Link href="/contact">
          <button className="bg-accent-orange text-white px-8 py-3 rounded-lg hover:opacity-90 transition-opacity">
            联系我们
          </button>
        </Link>
      </div>
    </div>
  )
}
