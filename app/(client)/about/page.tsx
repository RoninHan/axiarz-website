'use client'

import { useEffect, useState } from 'react'
import { Card, Spin, Empty } from 'antd'
import { InfoCircleOutlined } from '@ant-design/icons'

export default function AboutPage() {
  const [loading, setLoading] = useState(true)
  const [aboutUs, setAboutUs] = useState<string>('')
  const [companyName, setCompanyName] = useState<string>('Axiarz')

  useEffect(() => {
    fetchAboutUs()
  }, [])

  async function fetchAboutUs() {
    try {
      setLoading(true)
      const res = await fetch('/api/client/settings')
      const data = await res.json()
      if (data.success && data.data) {
        setAboutUs(data.data.aboutUs || '')
        setCompanyName(data.data.companyName || 'Axiarz')
      }
    } catch (error) {
      console.error('获取关于我们失败:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-6 max-w-4xl">
        {/* 页面标题 */}
        <div
          className="mb-8 p-8 rounded-lg"
          style={{
            background: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)',
          }}
        >
          <div className="flex items-center gap-3 mb-2">
            <InfoCircleOutlined style={{ fontSize: 32, color: 'white' }} />
            <h1 className="text-3xl font-bold text-white m-0">关于我们</h1>
          </div>
          <p className="text-white opacity-90 m-0">About {companyName}</p>
        </div>

        {/* 内容区域 */}
        <Card className="shadow-sm">
          {aboutUs ? (
            <div
              style={{
                fontSize: 16,
                lineHeight: 1.8,
                color: '#333',
                whiteSpace: 'pre-wrap',
              }}
            >
              {aboutUs}
            </div>
          ) : (
            <Empty
              description="暂无关于我们的信息"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </Card>
      </div>
    </div>
  )
}
