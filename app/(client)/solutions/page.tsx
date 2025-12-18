'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, Row, Col, Empty, Spin } from 'antd'
import { ArrowRightOutlined } from '@ant-design/icons'
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

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-12 flex justify-center items-center min-h-[400px]">
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-6 py-12 max-w-[1920px]">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">解决方案</h1>
        <p className="text-lg text-gray-600">为您提供专业的技术解决方案</p>
      </div>

      {solutions.length === 0 ? (
        <Empty description="暂无解决方案" />
      ) : (
        <Row gutter={[24, 24]}>
          {solutions.map((solution) => (
            <Col key={solution.id} xs={24} sm={12} md={8}>
              <Link href={`/solutions/${solution.slug}`}>
                <Card
                  hoverable
                  className="h-full shadow-card hover:shadow-hover transition-all"
                  bordered={false}
                  cover={
                    solution.coverImage ? (
                      <div className="h-48 overflow-hidden">
                        <img
                          src={solution.coverImage}
                          alt={solution.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="h-48 bg-gradient-to-br from-accent-orange to-accent-orange-dark flex items-center justify-center">
                        <span className="text-white text-lg font-medium">{solution.title}</span>
                      </div>
                    )
                  }
                >
                  <Card.Meta
                    title={
                      <div className="flex justify-between items-center">
                        <span className="text-lg">{solution.title}</span>
                        <ArrowRightOutlined className="text-accent-orange" />
                      </div>
                    }
                    description={
                      <p className="text-gray-600 line-clamp-3">
                        {solution.description || '点击查看详情'}
                      </p>
                    }
                  />
                </Card>
              </Link>
            </Col>
          ))}
        </Row>
      )}
    </div>
  )
}

