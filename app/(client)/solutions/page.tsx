'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  RocketOutlined,
  CheckCircleOutlined,
  TeamOutlined,
  SafetyOutlined,
  ThunderboltOutlined,
  GlobalOutlined,
  ArrowRightOutlined,
  BulbOutlined
} from '@ant-design/icons'
import Card from '@/components/client/Card'
import type { Solution } from '@/types'

export default function SolutionsPage() {
  const [solutions, setSolutions] = useState<Solution[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSolutions()
  }, [])

  async function loadSolutions() {
    try {
      const res = await fetch('/api/client/solutions')
      const data = await res.json()
      if (data.success) {
        setSolutions(data.data)
      }
    } catch (error) {
      console.error('Failed to load solutions:', error)
    } finally {
      setLoading(false)
    }
  }

  // 获取解决方案的图标
  const getIconForIndex = (index: number) => {
    const icons = [
      <RocketOutlined className="text-4xl" />,
      <ThunderboltOutlined className="text-4xl" />,
      <GlobalOutlined className="text-4xl" />,
      <BulbOutlined className="text-4xl" />,
      <TeamOutlined className="text-4xl" />,
      <SafetyOutlined className="text-4xl" />,
    ]
    return icons[index % icons.length]
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f4f4]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-accent-orange border-t-transparent mb-4"></div>
          <p className="text-body text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f4f4f4]">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-accent-orange to-orange-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-full mb-6 backdrop-blur-sm">
            <RocketOutlined className="text-5xl" />
          </div>
          <h1 className="text-5xl font-bold mb-6">解决方案</h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
            为您提供专业的技术解决方案，助力企业数字化转型
          </p>
          <div className="flex items-center justify-center gap-8 mt-12 flex-wrap">
            <div className="flex items-center gap-3">
              <CheckCircleOutlined className="text-2xl" />
              <span className="text-lg">专业团队</span>
            </div>
            <div className="flex items-center gap-3">
              <ThunderboltOutlined className="text-2xl" />
              <span className="text-lg">快速响应</span>
            </div>
            <div className="flex items-center gap-3">
              <SafetyOutlined className="text-2xl" />
              <span className="text-lg">安全可靠</span>
            </div>
          </div>
        </div>
      </div>

      {/* Solutions Grid */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        {solutions.length === 0 ? (
          <Card className="text-center py-16 bg-white">
            <BulbOutlined className="text-6xl text-gray-300 mb-4" />
            <p className="text-title-small text-gray-800 mb-2">暂无解决方案</p>
            <p className="text-body text-gray-500">敬请期待更多精彩内容</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {solutions.map((solution, index) => (
              <Link key={solution.id} href={`/solutions/${solution.slug}`}>
                <Card className="h-full bg-white hover:shadow-xl transition-all duration-300 group cursor-pointer overflow-hidden">
                  {/* 封面图片或渐变背景 */}
                  {solution.coverImage ? (
                    <div className="h-56 overflow-hidden rounded-t-lg">
                      <img
                        src={solution.coverImage}
                        alt={solution.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                  ) : (
                    <div className="h-56 bg-gradient-to-br from-accent-orange via-orange-500 to-orange-600 flex items-center justify-center rounded-t-lg relative overflow-hidden">
                      {/* 背景装饰 */}
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-20 -translate-y-20"></div>
                        <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-30 translate-y-30"></div>
                      </div>
                      <div className="relative text-white">
                        {getIconForIndex(index)}
                      </div>
                    </div>
                  )}

                  {/* 内容区域 */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold text-gray-800 group-hover:text-accent-orange transition-colors">
                        {solution.title}
                      </h3>
                      <ArrowRightOutlined className="text-accent-orange text-lg mt-1 group-hover:translate-x-2 transition-transform" />
                    </div>

                    <p className="text-body text-gray-600 line-clamp-3 mb-4 leading-relaxed">
                      {solution.description || '点击查看详情，了解更多关于此解决方案的信息'}
                    </p>

                    {/* 底部标签 */}
                    <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-1 text-caption text-gray-500">
                        <CheckCircleOutlined className="text-green-500" />
                        <span>专业可靠</span>
                      </div>
                      <div className="h-4 w-px bg-gray-200"></div>
                      <div className="flex items-center gap-1 text-caption text-gray-500">
                        <ThunderboltOutlined className="text-yellow-500" />
                        <span>快速部署</span>
                      </div>
                    </div>
                  </div>

                  {/* 悬停效果边框 */}
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-accent-orange rounded-lg transition-colors pointer-events-none"></div>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* 底部CTA区域 */}
        {solutions.length > 0 && (
          <div className="mt-16">
            <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200">
              <div className="text-center py-8">
                <TeamOutlined className="text-5xl text-accent-orange mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-3">
                  需要定制化解决方案？
                </h3>
                <p className="text-body text-gray-600 mb-6 max-w-2xl mx-auto">
                  我们的专业团队随时为您提供咨询服务，帮助您找到最适合的解决方案
                </p>
                <div className="flex items-center justify-center gap-4">
                  <a
                    href="mailto:contact@axiarz.com"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-accent-orange text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
                  >
                    <TeamOutlined />
                    联系我们
                  </a>
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-800 border-2 border-gray-300 rounded-lg hover:border-accent-orange hover:text-accent-orange transition-colors font-medium"
                  >
                    <BulbOutlined />
                    查看产品
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* 优势特性区域 */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">为什么选择我们</h2>
            <p className="text-body text-gray-600">专业的技术实力，值得信赖的合作伙伴</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-50 rounded-full mb-4">
                <RocketOutlined className="text-3xl text-accent-orange" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">创新技术</h3>
              <p className="text-caption text-gray-600">
                采用最新技术栈，持续创新
              </p>
            </div>

            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mb-4">
                <TeamOutlined className="text-3xl text-blue-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">专业团队</h3>
              <p className="text-caption text-gray-600">
                经验丰富的技术专家团队
              </p>
            </div>

            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-50 rounded-full mb-4">
                <SafetyOutlined className="text-3xl text-green-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">安全可靠</h3>
              <p className="text-caption text-gray-600">
                企业级安全保障体系
              </p>
            </div>

            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-50 rounded-full mb-4">
                <ThunderboltOutlined className="text-3xl text-purple-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">快速交付</h3>
              <p className="text-caption text-gray-600">
                高效的开发和部署流程
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
