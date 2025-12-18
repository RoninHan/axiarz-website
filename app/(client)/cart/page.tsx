'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button, Card, InputNumber, Empty, Spin, message, Checkbox, Divider, Image, Popconfirm, Tag } from 'antd'
import { DeleteOutlined, ShoppingOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons'
import ProtectedRoute from '@/components/client/ProtectedRoute'
import { CartItem } from '@/types'

function CartPageContent() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [messageApi, contextHolder] = message.useMessage()

  useEffect(() => {
    fetchCart()
  }, [])

  async function fetchCart() {
    try {
      setLoading(true)
      const res = await fetch('/api/client/cart')
      const data = await res.json()
      if (data.success) {
        setCartItems(data.data)
        // 默认全选
        setSelectedItems(data.data.map((item: CartItem) => item.id))
      }
    } catch (error) {
      console.error('获取购物车失败:', error)
      messageApi.error('获取购物车失败')
    } finally {
      setLoading(false)
    }
  }

  async function updateQuantity(itemId: string, quantity: number) {
    if (quantity < 1) return
    
    try {
      const res = await fetch(`/api/client/cart/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      })
      const data = await res.json()
      if (data.success) {
        await fetchCart()
        messageApi.success('数量已更新')
      } else {
        messageApi.error(data.error || '更新失败')
      }
    } catch (error) {
      console.error('更新购物车失败:', error)
      messageApi.error('更新失败')
    }
  }

  async function removeItem(itemId: string) {
    try {
      const res = await fetch(`/api/client/cart/${itemId}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.success) {
        await fetchCart()
        messageApi.success('商品已删除')
      } else {
        messageApi.error(data.error || '删除失败')
      }
    } catch (error) {
      console.error('删除商品失败:', error)
      messageApi.error('删除失败')
    }
  }

  function handleSelectAll(checked: boolean) {
    if (checked) {
      setSelectedItems(cartItems.map(item => item.id))
    } else {
      setSelectedItems([])
    }
  }

  function handleSelectItem(itemId: string, checked: boolean) {
    if (checked) {
      setSelectedItems([...selectedItems, itemId])
    } else {
      setSelectedItems(selectedItems.filter(id => id !== itemId))
    }
  }

  // 计算选中商品的总价
  function calculateTotal() {
    return cartItems
      .filter(item => selectedItems.includes(item.id))
      .reduce((acc, item) => {
        if (item.product) {
          return acc + Number(item.product.price) * item.quantity
        }
        return acc
      }, 0)
  }

  // 计算选中商品的数量
  function getSelectedCount() {
    return cartItems
      .filter(item => selectedItems.includes(item.id))
      .reduce((acc, item) => acc + item.quantity, 0)
  }

  const total = calculateTotal()
  const selectedCount = getSelectedCount()
  const allSelected = cartItems.length > 0 && selectedItems.length === cartItems.length

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-12 flex justify-center items-center min-h-[400px]">
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      {contextHolder}
      <div className="container mx-auto px-6 max-w-[1400px]">
        <h1 className="text-3xl font-bold mb-8">购物车</h1>

        {cartItems.length === 0 ? (
          <Card className="text-center py-16">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div>
                  <p className="text-lg text-gray-600 mb-4">您的购物车是空的</p>
                  <p className="text-gray-500 mb-6">快去挑选您喜欢的商品吧！</p>
                </div>
              }
            >
              <Link href="/products">
                <Button type="primary" size="large" icon={<ShoppingOutlined />}>
                  去购物
                </Button>
              </Link>
            </Empty>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 左侧商品列表 */}
            <div className="lg:col-span-2">
              <Card className="mb-4">
                <div className="flex items-center justify-between py-2">
                  <Checkbox
                    checked={allSelected}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  >
                    <span className="font-medium">全选 ({cartItems.length} 件商品)</span>
                  </Checkbox>
                  <div className="text-gray-500">
                    <span className="mr-4">单价</span>
                    <span className="mr-4">数量</span>
                    <span className="mr-4">小计</span>
                    <span>操作</span>
                  </div>
                </div>
              </Card>

              <div className="space-y-4">
                {cartItems.map((item) => {
                  const itemTotal = item.product ? Number(item.product.price) * item.quantity : 0
                  const isSelected = selectedItems.includes(item.id)

                  return (
                    <Card key={item.id} className="hover:shadow-lg transition-shadow">
                      <div className="flex items-center gap-4">
                        {/* 选择框 */}
                        <Checkbox
                          checked={isSelected}
                          onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                        />

                        {/* 商品图片 */}
                        <div className="w-28 h-28 flex-shrink-0">
                          {item.product?.image || item.product?.images?.[0] ? (
                            <Image
                              src={item.product.image || item.product.images[0]}
                              alt={item.product?.name}
                              width={112}
                              height={112}
                              className="object-cover rounded"
                              preview={false}
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                              <span className="text-gray-400">暂无图片</span>
                            </div>
                          )}
                        </div>

                        {/* 商品信息 */}
                        <div className="flex-1 min-w-0">
                          <Link href={`/products/${item.productId}`}>
                            <h3 className="text-lg font-medium mb-2 hover:text-accent-orange transition-colors line-clamp-2">
                              {item.product?.name || '未知商品'}
                            </h3>
                          </Link>
                          {item.product?.status === 'sold_out' && (
                            <Tag color="red">已售罄</Tag>
                          )}
                          {item.product && item.product.stock < 10 && item.product.stock > 0 && (
                            <Tag color="orange">仅剩 {item.product.stock} 件</Tag>
                          )}
                        </div>

                        {/* 单价 */}
                        <div className="w-28 text-center">
                          <span className="text-lg font-medium text-accent-orange">
                            ¥{item.product ? Number(item.product.price).toFixed(2) : '0.00'}
                          </span>
                        </div>

                        {/* 数量控制 */}
                        <div className="w-32 flex items-center justify-center">
                          <Button
                            size="small"
                            icon={<MinusOutlined />}
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          />
                          <InputNumber
                            min={1}
                            max={item.product?.stock || 999}
                            value={item.quantity}
                            onChange={(value) => value && updateQuantity(item.id, value)}
                            className="mx-2"
                            style={{ width: 60 }}
                          />
                          <Button
                            size="small"
                            icon={<PlusOutlined />}
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.product && item.quantity >= item.product.stock}
                          />
                        </div>

                        {/* 小计 */}
                        <div className="w-28 text-center">
                          <span className="text-lg font-semibold text-accent-orange">
                            ¥{itemTotal.toFixed(2)}
                          </span>
                        </div>

                        {/* 删除按钮 */}
                        <div className="w-20 text-center">
                          <Popconfirm
                            title="确定要删除这个商品吗？"
                            onConfirm={() => removeItem(item.id)}
                            okText="确定"
                            cancelText="取消"
                          >
                            <Button
                              type="text"
                              danger
                              icon={<DeleteOutlined />}
                            >
                              删除
                            </Button>
                          </Popconfirm>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            </div>

            {/* 右侧结算卡片 */}
            <div className="lg:col-span-1">
              <Card className="sticky top-6">
                <h3 className="text-xl font-bold mb-4">订单摘要</h3>
                <Divider />
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-gray-600">
                    <span>商品件数：</span>
                    <span>{selectedCount} 件</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>商品总额：</span>
                    <span>¥{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>运费：</span>
                    <span className="text-green-600">免运费</span>
                  </div>
                </div>

                <Divider />

                <div className="flex justify-between items-center mb-6">
                  <span className="text-lg font-medium">应付总额：</span>
                  <span className="text-2xl font-bold text-accent-orange">
                    ¥{total.toFixed(2)}
                  </span>
                </div>

                <Link href="/checkout">
                  <Button
                    type="primary"
                    size="large"
                    block
                    disabled={selectedItems.length === 0}
                    className="h-12 text-lg"
                  >
                    去结算 ({selectedItems.length})
                  </Button>
                </Link>

                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    💡 温馨提示：选中的商品将进入结算页面
                  </p>
                </div>
              </Card>

              {/* 推荐商品 */}
              <Card className="mt-6">
                <h3 className="text-lg font-semibold mb-4">🔥 猜你喜欢</h3>
                <div className="space-y-3">
                  <div className="text-center text-gray-400 py-4">
                    <p>暂无推荐商品</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* 继续购物按钮 */}
        {cartItems.length > 0 && (
          <div className="mt-8 text-center">
            <Link href="/products">
              <Button size="large" icon={<ShoppingOutlined />}>
                继续购物
              </Button>
            </Link>
          </div>
        )}
      </div>
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
