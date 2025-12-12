'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import AdminCard from '@/components/admin/AdminCard'
import AdminButton from '@/components/admin/AdminButton'
import Input from '@/components/client/Input'
import { Product } from '@/types'

interface Category {
  id: string
  name: string
  status: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState('')

  useEffect(() => {
    fetchCategories()
    fetchProducts()
  }, [category, status])

  async function fetchCategories() {
    try {
      const res = await fetch('/api/admin/categories')
      const data = await res.json()
      if (data.success) {
        setCategories(data.data.filter((c: Category) => c.status === 'active'))
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
      if (status) params.append('status', status)

      const res = await fetch(`/api/admin/products?${params}`)
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

  async function deleteProduct(id: string) {
    if (!confirm('确定要删除这个产品吗？')) return
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.success) {
        await fetchProducts()
      } else {
        alert(data.error || '删除失败')
      }
    } catch (error) {
      console.error('删除产品失败:', error)
      alert('删除失败')
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-title-large font-title">产品管理</h1>
        <Link href="/admin/products/new">
          <AdminButton variant="primary">新增产品</AdminButton>
        </Link>
      </div>

      <AdminCard>
        <div className="flex gap-4 mb-6">
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
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <select
            className="input"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">全部状态</option>
            <option value="active">在售</option>
            <option value="inactive">下架</option>
            <option value="sold_out">缺货</option>
          </select>
          <AdminButton onClick={fetchProducts}>搜索</AdminButton>
        </div>

        {loading ? (
          <div className="text-center py-12">加载中...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-medium">
                  <th className="text-left py-3 px-4 text-body font-medium">产品名称</th>
                  <th className="text-left py-3 px-4 text-body font-medium">分类</th>
                  <th className="text-left py-3 px-4 text-body font-medium">价格</th>
                  <th className="text-left py-3 px-4 text-body font-medium">库存</th>
                  <th className="text-left py-3 px-4 text-body font-medium">状态</th>
                  <th className="text-left py-3 px-4 text-body font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-neutral-medium">
                    <td className="py-3 px-4 text-body">{product.name}</td>
                    <td className="py-3 px-4 text-body">{product.category?.name || '-'}</td>
                    <td className="py-3 px-4 text-body">¥{Number(product.price).toFixed(2)}</td>
                    <td className="py-3 px-4 text-body">{product.stock}</td>
                    <td className="py-3 px-4 text-body">
                      <span className={
                        product.status === 'active' ? 'text-green-600' :
                        product.status === 'sold_out' ? 'text-red-600' : 'text-neutral-medium'
                      }>
                        {product.status === 'active' ? '在售' :
                         product.status === 'sold_out' ? '缺货' : '下架'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Link href={`/admin/products/${product.id}`}>
                          <AdminButton variant="secondary">编辑</AdminButton>
                        </Link>
                        <AdminButton
                          variant="danger"
                          onClick={() => deleteProduct(product.id)}
                        >
                          删除
                        </AdminButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>
    </div>
  )
}

