'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Card from '@/components/client/Card'
import Button from '@/components/client/Button'
import Input from '@/components/client/Input'
import { Product, Category } from '@/types'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')

  useEffect(() => {
    fetchCategories()
    fetchProducts()
  }, [category])

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
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (category) params.append('category', category)
      
      const res = await fetch(`/api/client/products?${params}`)
      const data = await res.json()
      if (data.success) {
        setProducts(data.data)
      }
    } catch (error) {
      console.error('获取产品失败:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSearch() {
    await fetchProducts()
  }

  async function addToCart(productId: string) {
    // 检查是否登录
    const res = await fetch('/api/auth/me')
    const data = await res.json()
    if (!data.success) {
      if (confirm('加入购物车需要登录，是否前往登录？')) {
        window.location.href = '/login'
      }
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
        alert('已加入购物车')
      } else {
        alert(cartData.error || '操作失败')
      }
    } catch (error) {
      console.error('加入购物车失败:', error)
      alert('操作失败')
    }
  }

  return (
    <div className="container mx-auto px-6 py-12 max-w-[1920px]">
      <h1 className="text-title-large font-title mb-8">产品列表</h1>

      {/* 搜索和筛选 */}
      <div className="mb-8 flex gap-4">
        <Input
          placeholder="搜索产品..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        <select
          className="input"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">所有分类</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>
        <Button onClick={handleSearch}>搜索</Button>
      </div>

      {/* 产品列表 */}
      {loading ? (
        <div className="text-center py-12">加载中...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 text-neutral-medium">暂无产品</div>
      ) : (
        <div className="grid grid-cols-4 gap-6">
          {products.map((product) => (
            <Card key={product.id}>
              <Link href={`/products/${product.id}`}>
                <div className="w-full h-48 bg-neutral-medium rounded-default mb-4 flex items-center justify-center cursor-pointer">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded-default" />
                  ) : (
                    <span className="text-neutral-medium">产品图</span>
                  )}
                </div>
                <h3 className="text-title-small font-title mb-2">{product.name}</h3>
                <p className="text-body text-neutral-medium mb-4 line-clamp-2">{product.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-title-small font-title text-accent-orange">
                    ¥{Number(product.price).toFixed(2)}
                  </span>
                  <Button
                    variant="primary"
                    className="text-sm py-2 px-4"
                    onClick={(e) => {
                      e.preventDefault()
                      addToCart(product.id)
                    }}
                  >
                    加入购物车
                  </Button>
                </div>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

