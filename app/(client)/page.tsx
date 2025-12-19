'use client'

import Link from 'next/link'
import { 
  Button, 
  Card, 
  Tag, 
  Rate, 
  message, 
  Row, 
  Col, 
  Statistic, 
  Typography,
  Space,
  Divider,
  Badge,
  Image
} from 'antd'
import { 
  ShoppingCartOutlined, 
  CheckCircleOutlined, 
  ThunderboltOutlined, 
  HeartOutlined, 
  RightOutlined, 
  StarFilled,
  SafetyOutlined,
  RocketOutlined,
  TrophyOutlined,
  CustomerServiceOutlined,
  FireOutlined,
  GiftOutlined
} from '@ant-design/icons'
import { useState, useEffect } from 'react'
import type { Product, BrandAdvantage, Testimonial } from '@/types'

const { Title, Paragraph, Text } = Typography

export default function HomePage() {
  const [heroImage, setHeroImage] = useState<string>('')
  const [companyName, setCompanyName] = useState<string>('Axiarz')
  const [heroTitle, setHeroTitle] = useState<string>('创新科技')
  const [heroSubtitle, setHeroSubtitle] = useState<string>('智享生活')
  const [heroDescription, setHeroDescription] = useState<string>('我们致力于提供高品质的科技产品，采用最新技术，性能卓越。\n让科技融入生活，让创新改变未来。')
  const [statsCustomers, setStatsCustomers] = useState<number>(1000)
  const [statsRating, setStatsRating] = useState<number>(98)
  const [advantages, setAdvantages] = useState<BrandAdvantage[]>([])
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [messageApi, contextHolder] = message.useMessage()

  useEffect(() => {
    // 加载系统设置
    fetch('/api/client/settings')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          if (data.data.heroImage) setHeroImage(data.data.heroImage)
          if (data.data.companyName) setCompanyName(data.data.companyName)
          if (data.data.heroTitle) setHeroTitle(data.data.heroTitle)
          if (data.data.heroSubtitle) setHeroSubtitle(data.data.heroSubtitle)
          if (data.data.heroDescription) setHeroDescription(data.data.heroDescription)
          if (data.data.statsCustomers !== undefined) setStatsCustomers(data.data.statsCustomers)
          if (data.data.statsRating !== undefined) setStatsRating(data.data.statsRating)
          if (data.data.brandAdvantages) setAdvantages(data.data.brandAdvantages)
          if (data.data.testimonials) setTestimonials(data.data.testimonials)
        }
      })
      .catch(err => console.error('Failed to load settings:', err))

    // 加载产品
    fetch('/api/client/products')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setAllProducts(data.data)
          const featured = data.data.filter((p: Product) => p.featured).slice(0, 8)
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

  // 图标映射
  const iconMap: { [key: string]: any } = {
    '✓': <CheckCircleOutlined />,
    '⚡': <ThunderboltOutlined />,
    '❤': <HeartOutlined />,
  }

  // 默认品牌优势
  const defaultAdvantages = [
    { 
      icon: '✓', 
      title: '高品质保证', 
      description: '采用优质材料，精湛工艺，确保每一件产品都达到最高标准。', 
      sortOrder: 1 
    },
    { 
      icon: '⚡', 
      title: '卓越性能', 
      description: '采用最新技术，性能卓越，满足您的各种需求。', 
      sortOrder: 2 
    },
    { 
      icon: '❤', 
      title: '完善服务', 
      description: '完善的售后服务，专业的客户支持，让您购买无忧。', 
      sortOrder: 3 
    },
  ]

  const displayAdvantages = advantages.length > 0 ? advantages : defaultAdvantages

  return (
    <div className="w-full min-h-screen" style={{ backgroundColor: '#2D2D2D' }}>
      {contextHolder}
      
      {/* 英雄区 - 重新设计 */}
      <section 
        className="relative bg-gradient-to-br from-primary-black via-gray-900 to-gray-800 text-white overflow-hidden"
        style={{ minHeight: '650px' }}
      >
        {/* 背景装饰 */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-96 h-96 bg-accent-orange rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          <Row gutter={[48, 48]} align="middle" style={{ minHeight: '650px' }}>
            <Col xs={24} md={12}>
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div>
                  <Tag 
                    icon={<FireOutlined />} 
                    color="orange" 
                    className="mb-4"
                    style={{ fontSize: '14px', padding: '4px 12px' }}
                  >
                    科技创新 · 引领未来
                  </Tag>
                  <Title 
                    level={1} 
                    style={{ 
                      color: 'white', 
                      fontSize: '56px', 
                      marginBottom: '24px',
                      lineHeight: '1.2'
                    }}
                  >
                    {heroTitle}
                    <br />
                    <span style={{ color: '#FF6B35' }}>{heroSubtitle}</span>
                  </Title>
                  <Paragraph 
                    style={{ 
                      fontSize: '18px', 
                      color: 'rgba(255,255,255,0.8)',
                      lineHeight: '1.8',
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    {heroDescription}
                  </Paragraph>
                </div>

                {/* 统计数据 */}
                <Row gutter={16} className="my-8">
                  <Col span={8}>
                    <Statistic 
                      title={<span style={{ color: 'rgba(255,255,255,0.6)' }}>产品数量</span>}
                      value={allProducts.length || 100} 
                      suffix="+"
                      valueStyle={{ color: '#FF6B35', fontSize: '32px', fontWeight: 'bold' }}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic 
                      title={<span style={{ color: 'rgba(255,255,255,0.6)' }}>满意客户</span>}
                      value={statsCustomers} 
                      suffix="+"
                      valueStyle={{ color: '#FF6B35', fontSize: '32px', fontWeight: 'bold' }}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic 
                      title={<span style={{ color: 'rgba(255,255,255,0.6)' }}>好评率</span>}
                      value={statsRating} 
                      suffix="%"
                      valueStyle={{ color: '#FF6B35', fontSize: '32px', fontWeight: 'bold' }}
                    />
                  </Col>
                </Row>

                <Space size="middle">
                  <Link href="/products" passHref legacyBehavior>
                    <Button 
                      type="primary" 
                      size="large" 
                      icon={<ShoppingCartOutlined />}
                      style={{ 
                        backgroundColor: '#FF6B35',
                        borderColor: '#FF6B35',
                        height: '48px',
                        fontSize: '16px',
                        paddingLeft: '32px',
                        paddingRight: '32px'
                      }}
                    >
                      立即选购
                    </Button>
                  </Link>
                  <Link href="/solutions" passHref legacyBehavior>
                    <Button 
                      size="large" 
                      ghost 
                      style={{ 
                        borderColor: 'white',
                        color: 'white',
                        height: '48px',
                        fontSize: '16px',
                        paddingLeft: '32px',
                        paddingRight: '32px'
                      }}
                    >
                      解决方案
                    </Button>
                  </Link>
                </Space>
              </Space>
            </Col>

            <Col xs={24} md={12}>
              <div className="relative">
                {heroImage ? (
                  <Image
                    src={heroImage}
                    alt={companyName}
                    preview={false}
                    style={{ 
                      borderRadius: '16px',
                      boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                    }}
                  />
                ) : (
                  <div 
                    style={{
                      width: '100%',
                      height: '450px',
                      background: 'linear-gradient(135deg, #FF6B35 0%, #FF8A5B 100%)',
                      borderRadius: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 20px 60px rgba(255,107,53,0.3)'
                    }}
                  >
                    <RocketOutlined style={{ fontSize: '120px', color: 'white', opacity: 0.5 }} />
                  </div>
                )}
              </div>
            </Col>
          </Row>
        </div>
      </section>

      {/* 核心优势 - 重新设计 */}
      <section className="py-20" style={{ backgroundColor: '#242424' }}>
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-16">
            <Tag color="orange" style={{ fontSize: '14px', padding: '4px 16px', marginBottom: '16px' }}>
              为什么选择我们
            </Tag>
            <Title level={2} style={{ marginBottom: '12px', color: 'white' }}>
              核心优势
            </Title>
            <Text type="secondary" style={{ fontSize: '16px', color: 'rgba(255,255,255,0.6)' }}>
              专业、品质、服务，我们的承诺
            </Text>
          </div>

          <Row gutter={[24, 24]}>
            {displayAdvantages
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((adv, index) => (
                <Col key={index} xs={24} sm={12} md={8}>
                  <Card 
                    hoverable
                    bordered={false}
                    className="h-full"
                    style={{ 
                      borderRadius: '12px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      transition: 'all 0.3s'
                    }}
                    bodyStyle={{ padding: '32px', textAlign: 'center' }}
                  >
                    <div 
                      style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        backgroundColor: '#FFF5F0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 24px',
                        fontSize: '36px',
                        color: '#FF6B35'
                      }}
                    >
                      {iconMap[adv.icon] || <span>{adv.icon}</span>}
                    </div>
                    <Title level={4} style={{ marginBottom: '12px' }}>
                      {adv.title}
                    </Title>
                    <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                      {adv.description}
                    </Paragraph>
                  </Card>
                </Col>
              ))}
          </Row>

          {/* 额外特性 */}
          <Row gutter={[16, 16]} className="mt-12">
            <Col xs={12} sm={6}>
              <Card 
                bordered={false} 
                style={{ textAlign: 'center', backgroundColor: '#FFF5F0' }}
              >
                <SafetyOutlined style={{ fontSize: '32px', color: '#FF6B35', marginBottom: '8px' }} />
                <div style={{ fontWeight: 500 }}>品质保证</div>
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card 
                bordered={false} 
                style={{ textAlign: 'center', backgroundColor: '#FFF5F0' }}
              >
                <RocketOutlined style={{ fontSize: '32px', color: '#FF6B35', marginBottom: '8px' }} />
                <div style={{ fontWeight: 500 }}>快速配送</div>
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card 
                bordered={false} 
                style={{ textAlign: 'center', backgroundColor: '#FFF5F0' }}
              >
                <CustomerServiceOutlined style={{ fontSize: '32px', color: '#FF6B35', marginBottom: '8px' }} />
                <div style={{ fontWeight: 500 }}>贴心服务</div>
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card 
                bordered={false} 
                style={{ textAlign: 'center', backgroundColor: '#FFF5F0' }}
              >
                <GiftOutlined style={{ fontSize: '32px', color: '#FF6B35', marginBottom: '8px' }} />
                <div style={{ fontWeight: 500 }}>会员特权</div>
              </Card>
            </Col>
          </Row>
        </div>
      </section>

      {/* 精选产品 - 重新设计 */}
      <section className="py-20" style={{ backgroundColor: '#2D2D2D' }}>
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex justify-between items-center mb-12">
            <div>
              <Tag 
                icon={<StarFilled />} 
                color="gold" 
                style={{ fontSize: '14px', padding: '4px 16px', marginBottom: '16px' }}
              >
                热门推荐
              </Tag>
              <Title level={2} style={{ marginBottom: '8px', color: 'white' }}>
                精选产品
              </Title>
              <Text type="secondary" style={{ fontSize: '16px', color: 'rgba(255,255,255,0.6)' }}>
                精心挑选的优质产品，满足您的需求
              </Text>
            </div>
            <Link href="/products" passHref legacyBehavior>
              <Button 
                size="large" 
                icon={<RightOutlined />} 
                iconPosition="end"
                style={{ height: '40px' }}
              >
                查看全部
              </Button>
            </Link>
          </div>

          <Row gutter={[24, 24]}>
            {(featuredProducts.length > 0 ? featuredProducts : Array(8).fill(null)).map((product, index) => (
              <Col key={product?.id || index} xs={24} sm={12} md={8} lg={6}>
                <Badge.Ribbon 
                  text="热销" 
                  color="red"
                  style={{ display: product?.featured ? 'block' : 'none' }}
                >
                  <Card
                    hoverable
                    bordered={false}
                    style={{ 
                      borderRadius: '12px',
                      overflow: 'hidden',
                      height: '100%'
                    }}
                    cover={
                      <Link href={product ? `/products/${product.id}` : '#'}>
                        <div 
                          style={{ 
                            height: '200px', 
                            overflow: 'hidden',
                            backgroundColor: '#f5f5f5',
                            position: 'relative'
                          }}
                        >
                          {product?.image || product?.images?.[0] ? (
                            <img 
                              src={product.image || product.images[0]} 
                              alt={product.name} 
                              style={{ 
                                width: '100%', 
                                height: '100%', 
                                objectFit: 'cover',
                                transition: 'transform 0.3s'
                              }} 
                              className="hover:scale-110"
                            />
                          ) : (
                            <div 
                              style={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#999'
                              }}
                            >
                              <ShoppingCartOutlined style={{ fontSize: '48px' }} />
                            </div>
                          )}
                          {product && product.stock === 0 && (
                            <div 
                              style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundColor: 'rgba(0,0,0,0.5)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <Tag color="error" style={{ fontSize: '16px', padding: '8px 16px' }}>
                                已售罄
                              </Tag>
                            </div>
                          )}
                        </div>
                      </Link>
                    }
                    bodyStyle={{ padding: '16px' }}
                  >
                    <Link 
                      href={product ? `/products/${product.id}` : '#'}
                      style={{ textDecoration: 'none' }}
                    >
                      <Title 
                        level={5} 
                        ellipsis={{ rows: 2 }} 
                        style={{ 
                          marginBottom: '8px',
                          minHeight: '44px',
                          color: '#1A1A1A'
                        }}
                      >
                        {product?.name || `产品名称 ${index + 1}`}
                      </Title>
                    </Link>
                    
                    <Paragraph 
                      type="secondary" 
                      ellipsis={{ rows: 2 }}
                      style={{ minHeight: '40px', marginBottom: '12px', fontSize: '13px' }}
                    >
                      {product?.description || '产品描述信息'}
                    </Paragraph>

                    <Divider style={{ margin: '12px 0' }} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <Text 
                          style={{ 
                            fontSize: '24px', 
                            fontWeight: 'bold', 
                            color: '#FF6B35' 
                          }}
                        >
                          ¥{product?.price ? Number(product.price).toFixed(2) : '999.00'}
                        </Text>
                        {product && product.stock > 0 && product.stock < 10 && (
                          <div>
                            <Text type="warning" style={{ fontSize: '12px' }}>
                              仅剩{product.stock}件
                            </Text>
                          </div>
                        )}
                      </div>
                      <Button 
                        type="primary"
                        shape="circle"
                        icon={<ShoppingCartOutlined />}
                        size="large"
                        disabled={product?.stock === 0}
                        onClick={(e) => {
                          e.stopPropagation()
                          if (product) addToCart(product.id)
                        }}
                        style={{
                          backgroundColor: product?.stock === 0 ? undefined : '#FF6B35',
                          borderColor: product?.stock === 0 ? undefined : '#FF6B35'
                        }}
                      />
                    </div>
                  </Card>
                </Badge.Ribbon>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* 客户评价 - 重新设计 */}
      <section className="py-20" style={{ backgroundColor: '#242424' }}>
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-16">
            <Tag 
              icon={<TrophyOutlined />}
              color="gold" 
              style={{ fontSize: '14px', padding: '4px 16px', marginBottom: '16px' }}
            >
              客户好评
            </Tag>
            <Title level={2} style={{ marginBottom: '12px', color: 'white' }}>
              真实评价
            </Title>
            <Text type="secondary" style={{ fontSize: '16px', color: 'rgba(255,255,255,0.6)' }}>
              来自真实客户的反馈
            </Text>
          </div>

          <Row gutter={[24, 24]}>
            {(testimonials.length > 0 
              ? testimonials.sort((a, b) => a.sortOrder - b.sortOrder).slice(0, 3)
              : Array(3).fill(null)
            ).map((test, index) => (
              <Col key={index} xs={24} sm={12} md={8}>
                <Card 
                  bordered={false}
                  style={{ 
                    borderRadius: '12px',
                    height: '100%',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                  }}
                  bodyStyle={{ padding: '24px' }}
                >
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <Rate 
                      disabled 
                      defaultValue={test?.rating || 5} 
                      style={{ color: '#FF6B35' }}
                    />
                    
                    <Paragraph 
                      style={{ 
                        fontSize: '15px',
                        lineHeight: '1.8',
                        color: '#666',
                        marginBottom: 0
                      }}
                    >
                      &quot;{test?.content || '产品质量非常好，性能卓越，完全超出预期。售后服务也很到位，值得推荐！'}&quot;
                    </Paragraph>

                    <Divider style={{ margin: 0 }} />

                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {test?.avatar ? (
                        <Image
                          src={test.avatar}
                          alt={test.name}
                          width={48}
                          height={48}
                          preview={false}
                          style={{ borderRadius: '50%', marginRight: '12px' }}
                        />
                      ) : (
                        <div 
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            backgroundColor: '#FF6B35',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: '12px'
                          }}
                        >
                          <Text style={{ color: 'white', fontSize: '18px', fontWeight: 'bold' }}>
                            {test?.name?.[0] || String.fromCharCode(65 + index)}
                          </Text>
                        </div>
                      )}
                      <div>
                        <Text strong style={{ display: 'block', fontSize: '16px' }}>
                          {test?.name || `客户 ${String.fromCharCode(65 + index)}`}
                        </Text>
                        <Text type="secondary" style={{ fontSize: '13px' }}>
                          认证买家
                        </Text>
                      </div>
                    </div>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* Call to Action */}
      <section 
        className="py-20"
        style={{
          background: 'linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 100%)',
          color: 'white'
        }}
      >
        <div className="container mx-auto px-6 max-w-7xl text-center">
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Title level={2} style={{ color: 'white', marginBottom: 0 }}>
              准备好体验我们的产品了吗？
            </Title>
            <Paragraph style={{ fontSize: '18px', color: 'rgba(255,255,255,0.8)' }}>
              立即浏览我们的产品系列，找到最适合您的解决方案
            </Paragraph>
            <Space size="middle">
              <Link href="/products" passHref legacyBehavior>
                <Button 
                  type="primary" 
                  size="large"
                  icon={<ShoppingCartOutlined />}
                  style={{
                    backgroundColor: '#FF6B35',
                    borderColor: '#FF6B35',
                    height: '48px',
                    fontSize: '16px',
                    paddingLeft: '32px',
                    paddingRight: '32px'
                  }}
                >
                  立即选购
                </Button>
              </Link>
              <Link href="/help" passHref legacyBehavior>
                <Button 
                  size="large"
                  ghost
                  style={{
                    borderColor: 'white',
                    color: 'white',
                    height: '48px',
                    fontSize: '16px',
                    paddingLeft: '32px',
                    paddingRight: '32px'
                  }}
                >
                  了解更多
                </Button>
              </Link>
            </Space>
          </Space>
        </div>
      </section>
    </div>
  )
}
