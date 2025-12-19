'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Row, 
  Col, 
  Image, 
  InputNumber, 
  Button, 
  Typography, 
  Divider, 
  Tag, 
  Breadcrumb,
  Card,
  Descriptions,
  Space,
  Badge,
  message,
  Tabs,
  Rate,
  Avatar,
  Empty,
  Spin
} from 'antd'
import { 
  ShoppingCartOutlined, 
  HeartOutlined,
  ShareAltOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  HomeOutlined,
  StarFilled,
  UserOutlined
} from '@ant-design/icons'
import { Product } from '@/types'

const { Title, Text, Paragraph } = Typography

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState<string>('')
  const [messageApi, contextHolder] = message.useMessage()

  useEffect(() => {
    if (params.id) {
      fetchProduct(params.id as string)
    }
  }, [params.id])

  async function fetchProduct(id: string) {
    try {
      setLoading(true)
      const res = await fetch(`/api/client/products/${id}`)
      const data = await res.json()
      if (data.success) {
        setProduct(data.data)
        setSelectedImage(data.data.image || '')
        // Fetch related products from the same category
        if (data.data.categoryId) {
          fetchRelatedProducts(data.data.categoryId, data.data.id)
        }
      }
    } catch (error) {
      console.error('获取产品详情失败:', error)
      messageApi.error('获取产品详情失败')
    } finally {
      setLoading(false)
    }
  }

  async function fetchRelatedProducts(categoryId: number, productId: string) {
    try {
      const res = await fetch(`/api/client/products?categoryId=${categoryId}`)
      const data = await res.json()
      if (data.success) {
        // Filter out current product and limit to 4 items
        const related = data.data
          .filter((p: Product) => p.id !== productId)
          .slice(0, 4)
        setRelatedProducts(related)
      }
    } catch (error) {
      console.error('获取相关产品失败:', error)
    }
  }

  async function addToCart() {
    if (!product) return
    
    // Check if logged in
    const res = await fetch('/api/auth/me')
    const data = await res.json()
    if (!data.success) {
      messageApi.warning('请先登录')
      setTimeout(() => router.push('/login'), 1000)
      return
    }

    try {
      const cartRes = await fetch('/api/client/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, quantity }),
      })
      const cartData = await cartRes.json()
      if (cartData.success) {
        messageApi.success(`已将 ${quantity} 件商品加入购物车`)
        setQuantity(1) // Reset quantity
      } else {
        messageApi.error(cartData.error || '操作失败')
      }
    } catch (error) {
      console.error('加入购物车失败:', error)
      messageApi.error('操作失败')
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-12 flex justify-center items-center" style={{ minHeight: '400px' }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-6 py-12">
        <Empty description="产品不存在" />
      </div>
    )
  }

  const images = product.images && product.images.length > 0 
    ? product.images 
    : product.image 
    ? [product.image] 
    : []

  const stockStatus = product.stock === 0 
    ? { text: '缺货', color: 'error', icon: <CloseCircleOutlined /> }
    : product.stock < 10
    ? { text: `仅剩 ${product.stock} 件`, color: 'warning', icon: <CheckCircleOutlined /> }
    : { text: '有货', color: 'success', icon: <CheckCircleOutlined /> }

  const breadcrumbItems = [
    {
      title: (
        <Link href="/">
          <HomeOutlined /> 首页
        </Link>
      ),
    },
    {
      title: <Link href="/products">产品</Link>,
    },
    {
      title: product.category?.name ? (
        <Link href={`/products?category=${product.categoryId}`}>
          {product.category.name}
        </Link>
      ) : '未分类',
    },
    {
      title: product.name,
    },
  ]

  return (
    <div className="bg-neutral-50 min-h-screen py-8">
      {contextHolder}
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} className="mb-6" />

        {/* Main Product Section */}
        <Card className="mb-8">
          <Row gutter={[32, 32]}>
            {/* Product Images */}
            <Col xs={24} md={12} lg={10}>
              <div className="sticky top-24">
                {/* Main Image */}
                <div className="mb-4">
                  <Image
                    src={selectedImage || '/placeholder-product.png'}
                    alt={product.name}
                    width="100%"
                    height={400}
                    style={{ objectFit: 'cover', borderRadius: '8px' }}
                    preview={{
                      mask: '查看大图',
                    }}
                  />
                </div>

                {/* Thumbnail Images */}
                {images.length > 1 && (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {images.map((img, idx) => (
                      <div
                        key={idx}
                        onClick={() => setSelectedImage(img)}
                        style={{
                          width: '80px',
                          height: '80px',
                          cursor: 'pointer',
                          border: selectedImage === img ? '2px solid #FF6B35' : '2px solid transparent',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          transition: 'all 0.3s',
                        }}
                        className="hover:opacity-80"
                      >
                        <img 
                          src={img} 
                          alt={`${product.name} ${idx + 1}`}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Col>

            {/* Product Info */}
            <Col xs={24} md={12} lg={14}>
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                {/* Product Title */}
                <div>
                  <Title level={2} style={{ marginBottom: '8px', color: '#1A1A1A' }}>
                    {product.name}
                  </Title>
                  <Space>
                    {product.featured && (
                      <Tag icon={<StarFilled />} color="gold">
                        精选推荐
                      </Tag>
                    )}
                    <Tag color={stockStatus.color} icon={stockStatus.icon}>
                      {stockStatus.text}
                    </Tag>
                    {product.status !== 'active' && (
                      <Tag color="default">已下架</Tag>
                    )}
                  </Space>
                </div>

                {/* Price */}
                <div style={{ backgroundColor: '#FFF5F0', padding: '20px', borderRadius: '8px' }}>
                  <Text type="secondary" style={{ fontSize: '14px' }}>价格</Text>
                  <div>
                    <Text 
                      style={{ 
                        fontSize: '36px', 
                        fontWeight: 'bold', 
                        color: '#FF6B35',
                        marginRight: '8px'
                      }}
                    >
                      ¥{Number(product.price).toFixed(2)}
                    </Text>
                    <Text type="secondary" delete style={{ fontSize: '18px' }}>
                      ¥{(Number(product.price) * 1.2).toFixed(2)}
                    </Text>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <Text strong style={{ fontSize: '16px' }}>产品描述</Text>
                  <Paragraph style={{ marginTop: '8px', color: '#666' }}>
                    {product.description || '暂无描述'}
                  </Paragraph>
                </div>

                <Divider />

                {/* Quantity Selector */}
                <div>
                  <Space align="center">
                    <Text strong>数量：</Text>
                    <InputNumber
                      min={1}
                      max={product.stock}
                      value={quantity}
                      onChange={(value) => setQuantity(value || 1)}
                      size="large"
                      style={{ width: '120px' }}
                    />
                    <Text type="secondary">库存：{product.stock} 件</Text>
                  </Space>
                </div>

                {/* Action Buttons */}
                <Space size="middle" style={{ width: '100%' }}>
                  <Button
                    type="primary"
                    size="large"
                    icon={<ShoppingCartOutlined />}
                    onClick={addToCart}
                    disabled={product.stock === 0}
                    style={{ 
                      backgroundColor: '#FF6B35',
                      borderColor: '#FF6B35',
                      flex: 1,
                      height: '48px',
                      fontSize: '16px'
                    }}
                  >
                    {product.stock === 0 ? '缺货' : '加入购物车'}
                  </Button>
                  <Button
                    size="large"
                    icon={<HeartOutlined />}
                    style={{ height: '48px' }}
                  >
                    收藏
                  </Button>
                  <Button
                    size="large"
                    icon={<ShareAltOutlined />}
                    style={{ height: '48px' }}
                  >
                    分享
                  </Button>
                </Space>

                {/* Quick Links */}
                <Space size="middle">
                  <Link href="/cart">
                    <Button type="link">查看购物车</Button>
                  </Link>
                  <Link href="/checkout">
                    <Button type="link">立即购买</Button>
                  </Link>
                </Space>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Product Details Tabs */}
        <Card className="mb-8">
          <Tabs
            defaultActiveKey="1"
            items={[
              {
                key: '1',
                label: '产品规格',
                children: (
                  <Descriptions bordered column={2}>
                    <Descriptions.Item label="产品名称">{product.name}</Descriptions.Item>
                    <Descriptions.Item label="产品分类">
                      {product.category?.name || '未分类'}
                    </Descriptions.Item>
                    <Descriptions.Item label="产品编号">
                      {product.sku || product.id}
                    </Descriptions.Item>
                    <Descriptions.Item label="库存状态">
                      <Badge status={stockStatus.color as any} text={stockStatus.text} />
                    </Descriptions.Item>
                    <Descriptions.Item label="可售数量">{product.stock} 件</Descriptions.Item>
                    <Descriptions.Item label="产品状态">
                      {product.status === 'active' ? '在售' : product.status === 'sold_out' ? '缺货' : '下架'}
                    </Descriptions.Item>
                    <Descriptions.Item label="创建时间" span={2}>
                      {new Date(product.createdAt).toLocaleDateString('zh-CN')}
                    </Descriptions.Item>
                  </Descriptions>
                ),
              },
              {
                key: '2',
                label: '详细介绍',
                children: (
                  <div style={{ padding: '20px 0' }}>
                    {product.content ? (
                      <div 
                        className="prose max-w-none"
                        dangerouslySetInnerHTML={{ __html: product.content }}
                      />
                    ) : (
                      <Empty description="暂无详细介绍" />
                    )}
                  </div>
                ),
              },
              {
                key: '3',
                label: '用户评价',
                children: (
                  <div style={{ padding: '20px 0' }}>
                    <Empty description="暂无评价" />
                    {/* Placeholder for future reviews feature */}
                    <div style={{ display: 'none' }}>
                      <Space direction="vertical" size="large" style={{ width: '100%' }}>
                        {[1, 2, 3].map(i => (
                          <Card key={i} size="small">
                            <Space direction="vertical">
                              <Space>
                                <Avatar icon={<UserOutlined />} />
                                <div>
                                  <Text strong>用户 {i}</Text>
                                  <div>
                                    <Rate disabled defaultValue={5} style={{ fontSize: '14px' }} />
                                  </div>
                                </div>
                              </Space>
                              <Text>这个产品非常好，质量很棒，值得购买！</Text>
                              <Text type="secondary" style={{ fontSize: '12px' }}>
                                2024-01-01
                              </Text>
                            </Space>
                          </Card>
                        ))}
                      </Space>
                    </div>
                  </div>
                ),
              },
            ]}
          />
        </Card>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <Card 
            title={<Title level={4} style={{ margin: 0 }}>相关产品</Title>}
            className="mb-8"
          >
            <Row gutter={[16, 16]}>
              {relatedProducts.map((item) => (
                <Col key={item.id} xs={24} sm={12} md={6}>
                  <Link href={`/products/${item.id}`}>
                    <Card
                      hoverable
                      cover={
                        <div style={{ height: '200px', overflow: 'hidden', backgroundColor: '#f5f5f5' }}>
                          {item.image ? (
                            <img
                              alt={item.name}
                              src={item.image}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <div style={{ 
                              width: '100%', 
                              height: '100%', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              color: '#999'
                            }}>
                              暂无图片
                            </div>
                          )}
                        </div>
                      }
                      style={{ height: '100%' }}
                    >
                      <Card.Meta
                        title={
                          <div className="line-clamp-2" style={{ minHeight: '48px' }}>
                            {item.name}
                          </div>
                        }
                        description={
                          <Space direction="vertical" style={{ width: '100%' }}>
                            <Text 
                              strong 
                              style={{ fontSize: '18px', color: '#FF6B35' }}
                            >
                              ¥{Number(item.price).toFixed(2)}
                            </Text>
                            {item.stock === 0 ? (
                              <Tag color="error">缺货</Tag>
                            ) : item.stock < 10 ? (
                              <Tag color="warning">仅剩 {item.stock} 件</Tag>
                            ) : (
                              <Tag color="success">有货</Tag>
                            )}
                          </Space>
                        }
                      />
                    </Card>
                  </Link>
                </Col>
              ))}
            </Row>
          </Card>
        )}
      </div>
    </div>
  )
}
