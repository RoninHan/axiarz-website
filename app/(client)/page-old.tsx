'use client'

import Link from 'next/link'
import { Button, Card, Carousel, Tag, Rate, message, Row, Col } from 'antd'
import { ShoppingCartOutlined, CheckCircleOutlined, ThunderboltOutlined, HeartOutlined, RightOutlined, StarFilled } from '@ant-design/icons'
import { useState, useEffect } from 'react'
import type { Product, BrandAdvantage, Testimonial } from '@/types'

export default function HomePage() {
  const [heroImage, setHeroImage] = useState<string>('')
  const [companyName, setCompanyName] = useState<string>('Axiarz')
  const [advantages, setAdvantages] = useState<BrandAdvantage[]>([])
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [messageApi, contextHolder] = message.useMessage()

  useEffect(() => {
    // 加载系统设置
    fetch('/api/client/settings')
      .then(res => res.json())
      .then(data => {
        if (data.settings) {
          const heroSetting = data.settings.find((s: any) => s.key === 'heroImage')
          const nameSetting = data.settings.find((s: any) => s.key === 'companyName')
          const advSetting = data.settings.find((s: any) => s.key === 'brandAdvantages')
          const testSetting = data.settings.find((s: any) => s.key === 'testimonials')
          
          if (heroSetting?.value) setHeroImage(heroSetting.value as string)
          if (nameSetting?.value) setCompanyName(nameSetting.value as string)
          if (advSetting?.value) setAdvantages(advSetting.value as BrandAdvantage[])
          if (testSetting?.value) setTestimonials(testSetting.value as Testimonial[])
        }
      })
      .catch(err => console.error('Failed to load settings:', err))

    // 加载精选产品
    fetch('/api/client/products')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          const featured = data.data.filter((p: Product) => p.featured).slice(0, 4)
          setFeaturedProducts(featured)
        }
      })
      .catch(err => console.error('Failed to load products:', err))
  }, [])

  // 添加到购物车
  async function addToCart(productId: string) {
    try {
      const res = await fetch('/api/client/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: 1 }),
      })
      const data = await res.json()

      if (data.success) {
        messageApi.success('已加入购物车！')
      } else {
        messageApi.error(data.error || '添加失败，请重试')
      }
    } catch (error) {
      messageApi.error('网络错误，请稍后重试')
    }
  }

  // 默认图标映射
  const defaultIcons: { [key: string]: any } = {
    '✓': <CheckCircleOutlined className="text-4xl" />,
    '⚡': <ThunderboltOutlined className="text-4xl" />,
    '❤': <HeartOutlined className="text-4xl" />,
  }

  // 默认品牌优势
  const defaultAdvantages = [
    { icon: '✓', title: '高品质', description: '采用优质材料，精湛工艺，确保每一件产品都达到最高标准。', sortOrder: 1 },
    { icon: '⚡', title: '高性能', description: '采用最新技术，性能卓越，满足您的各种需求。', sortOrder: 2 },
    { icon: '❤', title: '值得信赖', description: '完善的售后服务，专业的客户支持，让您购买无忧。', sortOrder: 3 },
  ]

  const displayAdvantages = advantages.length > 0 ? advantages : defaultAdvantages

  return (
    <div className="w-full bg-white min-h-screen">
      {contextHolder}
      
      {/* 英雄区 */}
      <section className="bg-gradient-to-br from-primary-black via-primary-dark to-neutral-dark text-primary-white">
        <div className="h-[600px] flex items-center">
          <div className="container mx-auto px-6 max-w-[1920px]">
            <Row gutter={48} align="middle">
              <Col span={12}>
                <div className="space-y-6 animate-fade-in">
                  <h1 className="text-5xl font-bold leading-tight">
                    创新科技，<span className="text-accent-orange">引领未来</span>
                  </h1>
                  <p className="text-lg text-gray-300">
                    我们致力于提供高品质的科技产品，采用最新技术，性能卓越，满足您的各种需求。
                  </p>
                  <div className="flex gap-4 pt-4">
                    <Link href="/products" passHref legacyBehavior>
                      <Button type="primary" size="large" icon={<ShoppingCartOutlined />}>
                        探索产品
                      </Button>
                    </Link>
                    <Link href="/solutions" passHref legacyBehavior>
                      <Button size="large" ghost className="border-white text-white hover:bg-white hover:text-primary-black">
                        了解方案
                      </Button>
                    </Link>
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div className="flex justify-center">
                  {heroImage ? (
                    <img src={heroImage} alt={companyName} className="w-full h-96 object-cover rounded-xl shadow-2xl" />
                  ) : (
                    <div className="w-full h-96 bg-gradient-to-br from-accent-orange to-accent-orange-dark rounded-xl shadow-2xl flex items-center justify-center">
                      <span className="text-white text-xl font-medium">产品展示图</span>
                    </div>
                  )}
                </div>
              </Col>
            </Row>
          </div>
        </div>
      </section>

      {/* 品牌优势 */}
      <section className="py-20 bg-neutral-light">
        <div className="container mx-auto px-6 max-w-[1920px]">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">品牌优势</h2>
            <p className="text-gray-500">为什么选择我们</p>
          </div>
          <Row gutter={[24, 24]}>
            {displayAdvantages
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((adv, index) => (
                <Col key={index} xs={24} sm={12} md={8}>
                  <Card 
                    hoverable
                    className="text-center h-full shadow-card hover:shadow-hover transition-all"
                    bordered={false}
                  >
                    <div className="text-accent-orange mb-4">
                      {defaultIcons[adv.icon] || <span className="text-5xl">{adv.icon}</span>}
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{adv.title}</h3>
                    <p className="text-gray-600">{adv.description}</p>
                  </Card>
                </Col>
              ))}
          </Row>
        </div>
      </section>

      {/* 产品精选 */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-[1920px]">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-4xl font-bold mb-2">产品精选</h2>
              <p className="text-gray-500">精心挑选的优质产品</p>
            </div>
            <Link href="/products" passHref legacyBehavior>
              <Button size="large" icon={<RightOutlined />} iconPosition="end">
                查看更多
              </Button>
            </Link>
          </div>
          <Row gutter={[24, 24]}>
            {featuredProducts.length > 0 ? (
              featuredProducts.map((product) => (
                <Col key={product.id} xs={24} sm={12} md={6}>
                  <Card
                    hoverable
                    className="shadow-card hover:shadow-hover transition-all"
                    bordered={false}
                    cover={
                      <Link href={`/products/${product.id}`}>
                        <div className="h-48 overflow-hidden bg-gray-100 cursor-pointer">
                          {product.images && product.images.length > 0 ? (
                            <img 
                              src={product.images[0]} 
                              alt={product.name} 
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" 
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <span>产品图</span>
                            </div>
                          )}
                        </div>
                      </Link>
                    }
                  >
                    <Card.Meta
                      title={
                        <Link 
                          href={`/products/${product.id}`} 
                          className="text-base text-primary-black hover:text-accent-orange transition-colors no-underline"
                        >
                          {product.name}
                        </Link>
                      }
                      description={
                        <div className="space-y-3">
                          <p className="text-gray-600 line-clamp-2 min-h-[40px]">{product.description}</p>
                          <div className="flex justify-between items-center pt-2">
                            <span className="text-2xl font-bold text-accent-orange">¥{product.price}</span>
                            <Button 
                              type="primary"
                              icon={<ShoppingCartOutlined />}
                              onClick={(e) => {
                                e.stopPropagation()
                                addToCart(product.id)
                              }}
                            >
                              加入购物车
                            </Button>
                          </div>
                        </div>
                      }
                    />
                  </Card>
                </Col>
              ))
            ) : (
              [1, 2, 3, 4].map((i) => (
                <Col key={i} xs={24} sm={12} md={6}>
                  <Card
                    hoverable
                    className="shadow-card"
                    bordered={false}
                    cover={
                      <div className="h-48 bg-gray-100 flex items-center justify-center">
                        <span className="text-gray-400">产品图</span>
                      </div>
                    }
                  >
                    <Card.Meta
                      title={`产品名称 ${i}`}
                      description={
                        <div className="space-y-3">
                          <p className="text-gray-600">产品描述信息</p>
                          <div className="flex justify-between items-center pt-2">
                            <span className="text-2xl font-bold text-accent-orange">¥999</span>
                            <Button type="primary" icon={<ShoppingCartOutlined />}>
                              加入购物车
                            </Button>
                          </div>
                        </div>
                      }
                    />
                  </Card>
                </Col>
              ))
            )}
          </Row>
        </div>
      </section>

      {/* 客户口碑 */}
      <section className="py-20 bg-neutral-light">
        <div className="container mx-auto px-6 max-w-[1920px]">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">客户口碑</h2>
            <p className="text-gray-500">听听客户怎么说</p>
          </div>
          <Row gutter={[24, 24]}>
            {testimonials.length > 0 ? (
              testimonials
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .slice(0, 3)
                .map((test, index) => (
                  <Col key={index} xs={24} sm={12} md={8}>
                    <Card 
                      className="shadow-card hover:shadow-hover transition-all h-full"
                      bordered={false}
                    >
                      <div className="flex items-center mb-4">
                        {test.avatar ? (
                          <img src={test.avatar} alt={test.name} className="w-12 h-12 rounded-full object-cover mr-4" />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-accent-orange flex items-center justify-center mr-4">
                            <span className="text-white font-bold text-lg">{test.name[0]}</span>
                          </div>
                        )}
                        <div>
                          <h4 className="font-semibold">{test.name}</h4>
                          <Rate disabled defaultValue={test.rating} className="text-sm" />
                        </div>
                      </div>
                      <p className="text-gray-600 leading-relaxed">{test.content}</p>
                    </Card>
                  </Col>
                ))
            ) : (
              [1, 2, 3].map((i) => (
                <Col key={i} xs={24} sm={12} md={8}>
                  <Card className="shadow-card h-full" bordered={false}>
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 rounded-full bg-gray-300 mr-4"></div>
                      <div>
                        <h4 className="font-semibold">客户 {i}</h4>
                        <Rate disabled defaultValue={5} className="text-sm" />
                      </div>
                    </div>
                    <p className="text-gray-600">
                      产品质量非常好，性能卓越，完全超出预期。售后服务也很到位，值得推荐！
                    </p>
                  </Card>
                </Col>
              ))
            )}
          </Row>
        </div>
      </section>
    </div>
  )
}
