'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/client/Button'
import { Product } from '@/types'

export default function ProductDetailPage() {
  const params = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)

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
      }
    } catch (error) {
      console.error('获取产品详情失败:', error)
    } finally {
      setLoading(false)
    }
  }

  async function addToCart() {
    if (!product) return
    
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
        body: JSON.stringify({ productId: product.id, quantity }),
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

  if (loading) {
    return <div className="container mx-auto px-6 py-12 text-center">加载中...</div>
  }

  if (!product) {
    return <div className="container mx-auto px-6 py-12 text-center">产品不存在</div>
  }

  return (
    <div className="container mx-auto px-6 py-12 max-w-[1920px]">
      <div className="grid grid-cols-2 gap-12">
        {/* 产品图片 */}
        <div>
          <div className="w-full h-96 bg-neutral-medium rounded-default mb-4 flex items-center justify-center">
            {product.image ? (
              <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded-default" />
            ) : (
              <span className="text-neutral-medium">产品图</span>
            )}
          </div>
          {product.images && product.images.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((img, idx) => (
                <div key={idx} className="w-full h-24 bg-neutral-medium rounded-default">
                  <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover rounded-default" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 产品信息 */}
        <div>
          <h1 className="text-title-large font-title mb-4">{product.name}</h1>
          <p className="text-title-medium font-title text-accent-orange mb-6">
            ¥{Number(product.price).toFixed(2)}
          </p>
          <div className="mb-6">
            <p className="text-body text-neutral-medium mb-4">{product.description}</p>
            <div className="space-y-2 text-body">
              <p><span className="font-medium">分类：</span>{product.category?.name || '未分类'}</p>
              <p><span className="font-medium">库存：</span>{product.stock}</p>
              <p><span className="font-medium">状态：</span>
                {product.status === 'active' ? '在售' : product.status === 'sold_out' ? '缺货' : '下架'}
              </p>
            </div>
          </div>

          {/* 数量选择 */}
          <div className="mb-6 flex items-center gap-4">
            <label className="text-body font-medium">数量：</label>
            <div className="flex items-center gap-2">
              <button
                className="w-10 h-10 border border-neutral-medium rounded-default hover:bg-neutral-light"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                -
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 text-center input"
                min="1"
                max={product.stock}
              />
              <button
                className="w-10 h-10 border border-neutral-medium rounded-default hover:bg-neutral-light"
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
              >
                +
              </button>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-4">
            <Button variant="primary" onClick={addToCart} disabled={product.stock === 0}>
              {product.stock === 0 ? '缺货' : '加入购物车'}
            </Button>
            <Link href="/cart">
              <Button variant="outline">查看购物车</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

