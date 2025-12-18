'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button, Spin, Empty } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import type { Solution } from '@/types'

export default function SolutionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [solution, setSolution] = useState<Solution | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSolution()
  }, [])

  async function loadSolution() {
    try {
      const res = await fetch(`/api/client/solutions/${params.slug}`)
      const data = await res.json()
      if (data.success) {
        setSolution(data.data)
      }
    } catch (error) {
      console.error('Failed to load solution:', error)
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

  if (!solution) {
    return (
      <div className="container mx-auto px-6 py-12">
        <Empty description="解决方案不存在" />
        <div className="text-center mt-6">
          <Button type="primary" onClick={() => router.push('/solutions')}>
            返回列表
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white min-h-screen">
      {/* 封面区域 */}
      {solution.coverImage && (
        <div className="w-full h-[400px] relative">
          <img
            src={solution.coverImage}
            alt={solution.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <h1 className="text-5xl font-bold text-white text-center px-6">{solution.title}</h1>
          </div>
        </div>
      )}

      {/* 内容区域 */}
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="mb-6">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => router.push('/solutions')}
          >
            返回列表
          </Button>
        </div>

        {!solution.coverImage && (
          <h1 className="text-4xl font-bold mb-6">{solution.title}</h1>
        )}

        {solution.description && (
          <div className="bg-gray-50 border-l-4 border-accent-orange p-6 rounded-r-lg mb-8">
            <p className="text-lg text-gray-700">{solution.description}</p>
          </div>
        )}

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
            prose-pre:bg-gray-900 prose-pre:text-white prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto"
          dangerouslySetInnerHTML={{ __html: solution.content }}
        />

        <div className="mt-12 pt-8 border-t border-gray-200">
          <Button
            type="primary"
            size="large"
            onClick={() => router.push('/contact')}
          >
            联系我们了解更多
          </Button>
        </div>
      </div>
    </div>
  )
}
