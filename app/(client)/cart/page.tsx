'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Button from '@/components/client/Button'
import Card from '@/components/client/Card'
import ProtectedRoute from '@/components/client/ProtectedRoute'
import { CartItem } from '@/types'

function CartPageContent() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    fetchCart()
  }, [])

  useEffect(() => {
    calculateTotal()
  }, [cartItems])

  async function fetchCart() {
    try {
      setLoading(true)
      const res = await fetch('/api/client/cart')
      const data = await res.json()
      if (data.success) {
        setCartItems(data.data)
      }
    } catch (error) {
      console.error('获取购物车失败:', error)
    } finally {
      setLoading(false)
    }
  }

  function calculateTotal() {
    const sum = cartItems.reduce((acc, item) => {
      if (item.product) {
        return acc + Number(item.product.price) * item.quantity
      }
      return acc
    }, 0)
    setTotal(sum)
  }

  async function updateQuantity(itemId: string, quantity: number) {
    try {
      const res = await fetch(`/api/client/cart/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      })
      const data = await res.json()
      if (data.success) {
        await fetchCart()
      } else {
        alert(data.error || '操作失败')
      }
    } catch (error) {
      console.error('更新购物车失败:', error)
      alert('操作失败')
    }
  }

  async function removeItem(itemId: string) {
    if (!confirm('确定要删除这个商品吗？')) return
    try {
      const res = await fetch(`/api/client/cart/${itemId}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.success) {
        await fetchCart()
      } else {
        alert(data.error || '操作失败')
      }
    } catch (error) {
      console.error('删除商品失败:', error)
      alert('操作失败')
    }
  }

  if (loading) {
    return <div className="container mx-auto px-6 py-12 text-center">加载中...</div>
  }

  return (
    <div className="container mx-auto px-6 py-12 max-w-[1920px]">
      <h1 className="text-title-large font-title mb-8">购物车</h1>

      {cartItems.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-body text-neutral-medium mb-4">购物车是空的</p>
          <Link href="/products">
            <Button variant="primary">去购物</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-2 space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id}>
                <div className="flex gap-4">
                  <div className="w-24 h-24 bg-neutral-medium rounded-default flex-shrink-0">
                    {item.product?.image ? (
                      <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover rounded-default" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-caption text-neutral-medium">图片</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-title-small font-title mb-2">{item.product?.name}</h3>
                    <p className="text-body text-neutral-medium mb-2">
                      ¥{item.product ? Number(item.product.price).toFixed(2) : '0.00'}
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <button
                          className="w-8 h-8 border border-neutral-medium rounded-default hover:bg-neutral-light"
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        >
                          -
                        </button>
                        <span className="w-12 text-center">{item.quantity}</span>
                        <button
                          className="w-8 h-8 border border-neutral-medium rounded-default hover:bg-neutral-light"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                      <button
                        className="text-caption text-red-500 hover:underline"
                        onClick={() => removeItem(item.id)}
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div>
            <Card>
              <h3 className="text-title-small font-title mb-4">订单摘要</h3>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-body">
                  <span>小计</span>
                  <span>¥{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-body">
                  <span>运费</span>
                  <span>¥0.00</span>
                </div>
                <div className="border-t border-neutral-medium pt-2 flex justify-between text-title-small font-title">
                  <span>总计</span>
                  <span className="text-accent-orange">¥{total.toFixed(2)}</span>
                </div>
              </div>
              <Link href="/checkout" className="block">
                <Button variant="primary" className="w-full">
                  去结算
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}

export default function CartPage() {
  return (
    <ProtectedRoute>
      <CartPageContent />
    </ProtectedRoute>
  )
}

