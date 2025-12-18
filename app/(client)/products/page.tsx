'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  Card, 
  Input, 
  Select, 
  Button, 
  Row, 
  Col, 
  Pagination, 
  Empty, 
  Spin, 
  Tag,
  Radio,
  Slider,
  message,
  Breadcrumb,
  Badge,
  Image
} from 'antd'
import { 
  ShoppingCartOutlined, 
  SearchOutlined, 
  AppstoreOutlined, 
  BarsOutlined,
  FilterOutlined,
  StarFilled,
  HomeOutlined
} from '@ant-design/icons'
import { Product, Category } from '@/types'

const { Option } = Select

type ViewMode = 'grid' | 'list'
type SortType = 'default' | 'price-asc' | 'price-desc' | 'newest'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortType, setSortType] = useState<SortType>('default')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(12)
  const [messageApi, contextHolder] = message.useMessage()

  useEffect(() => {
    fetchCategories()
    fetchProducts()
  }, [])

  useEffect(() => {
    filterAndSortProducts()
  }, [products, search, selectedCategory, sortType, priceRange])

  async function fetchCategories() {
    try {
      const res = await fetch('/api/client/categories')
      const data = await res.json()
      if (data.success) {
        setCategories(data.data)
      }
    } catch (error) {
      console.error('获取分类失败:', error)
    }
  }

  async function fetchProducts() {
    try {
      setLoading(true)
      const res = await fetch('/api/client/products')
      const data = await res.json()
      if (data.success) {
        setProducts(data.data)
      }
    } catch (error) {
      console.error('获取产品失败:', error)
      messageApi.error('获取产品失败')
    } finally {
      setLoading(false)
    }
  }

  function filterAndSortProducts() {
    let result = [...products]

    // 搜索过滤
    if (search) {
      const searchLower = search.toLowerCase()
      result = result.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower)
      )
    }

    // 分类过滤
    if (selectedCategory) {
      result = result.filter(p => p.category?.name === selectedCategory)
    }

    // 价格过滤
    result = result.filter(p => {
      const price = Number(p.price)
      return price >= priceRange[0] && price <= priceRange[1]
    })

    // 排序
    switch (sortType) {
      case 'price-asc':
        result.sort((a, b) => Number(a.price) - Number(b.price))
        break
      case 'price-desc':
        result.sort((a, b) => Number(b.price) - Number(a.price))
        break
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
    }

    setFilteredProducts(result)
    setCurrentPage(1)
  }

  async function addToCart(productId: string) {
    // 检查是否登录
    const res = await fetch('/api/auth/me')
    const data = await res.json()
    if (!data.success) {
      messageApi.warning('加入购物车需要登录')
      setTimeout(() => {
        window.location.href = '/login'
      }, 1000)
      return
    }

    try {
      const cartRes = await fetch('/api/client/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: 1 }),
      })
      const cartData = await cartRes.json()
      if (cartData.success) {
        messageApi.success('已加入购物车')
      } else {
        messageApi.error(cartData.error || '操作失败')
      }
    } catch (error) {
      console.error('加入购物车失败:', error)
      messageApi.error('操作失败')
    }
  }

  // 分页数据
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex)

  return (
    <div className="bg-gray-50 min-h-screen">
      {contextHolder}
      
      {/* 面包屑导航 */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-6 py-4 max-w-[1400px]">
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link href="/">
                <HomeOutlined /> 首页
              </Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>产品列表</Breadcrumb.Item>
            {selectedCategory && (
              <Breadcrumb.Item>{selectedCategory}</Breadcrumb.Item>
            )}
          </Breadcrumb>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-[1400px]">
        <div className="flex gap-6">
          {/* 左侧筛选栏 */}
          <div className="w-64 flex-shrink-0">
            <Card title={<span><FilterOutlined /> 筛选条件</span>} className="sticky top-6">
              {/* 分类筛选 */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3">商品分类</h4>
                <Radio.Group
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="flex flex-col gap-2"
                >
                  <Radio value="">全部分类</Radio>
                  {categories.map((cat) => (
                    <Radio key={cat.id} value={cat.name}>
                      {cat.name}
                    </Radio>
                  ))}
                </Radio.Group>
              </div>

              {/* 价格筛选 */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3">价格区间</h4>
                <Slider
                  range
                  min={0}
                  max={10000}
                  step={100}
                  value={priceRange}
                  onChange={(value) => setPriceRange(value as [number, number])}
                  tooltip={{ formatter: (value) => `¥${value}` }}
                />
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>¥{priceRange[0]}</span>
                  <span>¥{priceRange[1]}</span>
                </div>
              </div>

              {/* 重置按钮 */}
              <Button
                block
                onClick={() => {
                  setSearch('')
                  setSelectedCategory('')
                  setPriceRange([0, 10000])
                  setSortType('default')
                }}
              >
                重置筛选
              </Button>
            </Card>
          </div>

          {/* 右侧产品列表 */}
          <div className="flex-1">
            {/* 搜索和工具栏 */}
            <Card className="mb-6">
              <div className="flex items-center gap-4">
                <Input
                  size="large"
                  placeholder="搜索产品名称或描述..."
                  prefix={<SearchOutlined />}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  allowClear
                  className="flex-1"
                />
                <Select
                  size="large"
                  value={sortType}
                  onChange={setSortType}
                  style={{ width: 160 }}
                >
                  <Option value="default">默认排序</Option>
                  <Option value="newest">最新上架</Option>
                  <Option value="price-asc">价格从低到高</Option>
                  <Option value="price-desc">价格从高到低</Option>
                </Select>
                <Button.Group size="large">
                  <Button
                    type={viewMode === 'grid' ? 'primary' : 'default'}
                    icon={<AppstoreOutlined />}
                    onClick={() => setViewMode('grid')}
                  />
                  <Button
                    type={viewMode === 'list' ? 'primary' : 'default'}
                    icon={<BarsOutlined />}
                    onClick={() => setViewMode('list')}
                  />
                </Button.Group>
              </div>
              <div className="mt-3 text-gray-500">
                找到 <span className="text-accent-orange font-medium">{filteredProducts.length}</span> 件商品
              </div>
            </Card>

            {/* 产品列表 */}
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Spin size="large" />
              </div>
            ) : paginatedProducts.length === 0 ? (
              <Card>
                <Empty description="暂无产品" />
              </Card>
            ) : (
              <>
                {viewMode === 'grid' ? (
                  // 网格视图
                  <Row gutter={[16, 16]}>
                    {paginatedProducts.map((product) => (
                      <Col key={product.id} xs={24} sm={12} lg={8} xl={6}>
                        <Card
                          hoverable
                          className="h-full shadow-card hover:shadow-hover transition-all"
                          bordered={false}
                          cover={
                            <Link href={`/products/${product.id}`}>
                              <div className="relative h-56 overflow-hidden bg-gray-100">
                                {product.images && product.images.length > 0 ? (
                                  <Image
                                    src={product.images[0]}
                                    alt={product.name}
                                    width="100%"
                                    height={224}
                                    className="object-cover hover:scale-105 transition-transform duration-300"
                                    preview={false}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <span className="text-gray-400">暂无图片</span>
                                  </div>
                                )}
                                {product.featured && (
                                  <Tag
                                    color="red"
                                    icon={<StarFilled />}
                                    className="absolute top-2 left-2"
                                  >
                                    精选
                                  </Tag>
                                )}
                                {product.stock === 0 && (
                                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                    <Tag color="red" className="text-lg">已售罄</Tag>
                                  </div>
                                )}
                              </div>
                            </Link>
                          }
                        >
                          <Link href={`/products/${product.id}`}>
                            <h3 className="text-base font-medium mb-2 line-clamp-2 hover:text-accent-orange transition-colors h-12">
                              {product.name}
                            </h3>
                          </Link>
                          <p className="text-gray-600 text-sm line-clamp-2 mb-3 h-10">
                            {product.description || '暂无描述'}
                          </p>
                          <div className="flex justify-between items-center">
                            <span className="text-xl font-bold text-accent-orange">
                              ¥{Number(product.price).toFixed(2)}
                            </span>
                            <Button
                              type="primary"
                              size="small"
                              icon={<ShoppingCartOutlined />}
                              onClick={(e) => {
                                e.preventDefault()
                                addToCart(product.id)
                              }}
                              disabled={product.stock === 0}
                            >
                              加入购物车
                            </Button>
                          </div>
                          {product.stock > 0 && product.stock < 10 && (
                            <div className="mt-2">
                              <Tag color="orange" className="text-xs">
                                仅剩 {product.stock} 件
                              </Tag>
                            </div>
                          )}
                        </Card>
                      </Col>
                    ))}
                  </Row>
                ) : (
                  // 列表视图
                  <div className="space-y-4">
                    {paginatedProducts.map((product) => (
                      <Card
                        key={product.id}
                        hoverable
                        className="shadow-card hover:shadow-hover transition-all"
                        bordered={false}
                      >
                        <div className="flex gap-6">
                          <Link href={`/products/${product.id}`}>
                            <div className="relative w-48 h-48 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                              {product.images && product.images.length > 0 ? (
                                <Image
                                  src={product.images[0]}
                                  alt={product.name}
                                  width={192}
                                  height={192}
                                  className="object-cover"
                                  preview={false}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <span className="text-gray-400">暂无图片</span>
                                </div>
                              )}
                              {product.featured && (
                                <Tag
                                  color="red"
                                  icon={<StarFilled />}
                                  className="absolute top-2 left-2"
                                >
                                  精选
                                </Tag>
                              )}
                            </div>
                          </Link>
                          <div className="flex-1 flex flex-col justify-between">
                            <div>
                              <Link href={`/products/${product.id}`}>
                                <h3 className="text-xl font-semibold mb-2 hover:text-accent-orange transition-colors">
                                  {product.name}
                                </h3>
                              </Link>
                              <p className="text-gray-600 mb-3 line-clamp-3">
                                {product.description || '暂无描述'}
                              </p>
                              <div className="flex gap-2">
                                {product.category && (
                                  <Tag color="blue">{product.category.name}</Tag>
                                )}
                                {product.stock === 0 ? (
                                  <Tag color="red">已售罄</Tag>
                                ) : product.stock < 10 ? (
                                  <Tag color="orange">仅剩 {product.stock} 件</Tag>
                                ) : (
                                  <Tag color="green">有货</Tag>
                                )}
                              </div>
                            </div>
                            <div className="flex justify-between items-end">
                              <span className="text-3xl font-bold text-accent-orange">
                                ¥{Number(product.price).toFixed(2)}
                              </span>
                              <Button
                                type="primary"
                                size="large"
                                icon={<ShoppingCartOutlined />}
                                onClick={() => addToCart(product.id)}
                                disabled={product.stock === 0}
                              >
                                加入购物车
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}

                {/* 分页 */}
                {filteredProducts.length > pageSize && (
                  <div className="mt-8 flex justify-center">
                    <Pagination
                      current={currentPage}
                      total={filteredProducts.length}
                      pageSize={pageSize}
                      onChange={setCurrentPage}
                      onShowSizeChange={(_, size) => setPageSize(size)}
                      showSizeChanger
                      showQuickJumper
                      showTotal={(total) => `共 ${total} 件商品`}
                      pageSizeOptions={['12', '24', '48', '96']}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
