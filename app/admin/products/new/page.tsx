'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminCard from '@/components/admin/AdminCard'
import AdminButton from '@/components/admin/AdminButton'
import Input from '@/components/client/Input'
import Textarea from '@/components/client/Textarea'

interface Category {
  id: string
  name: string
  status: string
}

export default function NewProductPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    image: '',
    images: '',
    categoryId: '',
    status: 'active',
    featured: false,
  })

  useEffect(() => {
    fetchCategories()
  }, [])

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

  async function handleSubmit() {
    if (!formData.name || !formData.price || !formData.stock) {
      alert('请填写完整产品信息')
      return
    }

    try {
      setSaving(true)
      const images = formData.images ? formData.images.split(',').map(s => s.trim()) : []
      
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock),
          images,
        }),
      })
      const data = await res.json()
      if (data.success) {
        alert('创建成功')
        router.push('/admin/products')
      } else {
        alert(data.error || '创建失败')
      }
    } catch (error) {
      console.error('创建产品失败:', error)
      alert('创建失败')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-title-large font-title">新增产品</h1>
        <AdminButton variant="secondary" onClick={() => router.back()}>
          返回
        </AdminButton>
      </div>

      <AdminCard>
        <div className="space-y-4">
          <Input
            label="产品名称 *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Textarea
            label="产品描述"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="价格 *"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            />
            <Input
              label="库存 *"
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
            />
          </div>
          <Input
            label="主图URL"
            value={formData.image}
            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
          />
          <Input
            label="多图URL (用逗号分隔)"
            value={formData.images}
            onChange={(e) => setFormData({ ...formData, images: e.target.value })}
          />
          <div>
            <label className="label">分类</label>
            <select
              className="input"
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
            >
              <option value="">无分类</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <select
            className="input"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          >
            <option value="active">在售</option>
            <option value="inactive">下架</option>
            <option value="sold_out">缺货</option>
          </select>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="featured"
              checked={formData.featured}
              onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              className="mr-2"
            />
            <label htmlFor="featured" className="text-body">设为精选产品</label>
          </div>
          <div className="flex gap-4 pt-4">
            <AdminButton variant="primary" onClick={handleSubmit} disabled={saving}>
              {saving ? '保存中...' : '创建产品'}
            </AdminButton>
            <AdminButton variant="secondary" onClick={() => router.back()}>
              取消
            </AdminButton>
          </div>
        </div>
      </AdminCard>
    </div>
  )
}

