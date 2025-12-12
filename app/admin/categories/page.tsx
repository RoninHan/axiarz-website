'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import AdminCard from '@/components/admin/AdminCard'
import AdminButton from '@/components/admin/AdminButton'
import Input from '@/components/client/Input'
import Textarea from '@/components/client/Textarea'

interface Category {
  id: string
  name: string
  description: string | null
  sortOrder: number
  status: string
  createdAt: Date
  updatedAt: Date
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sortOrder: 0,
    status: 'active',
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  async function fetchCategories() {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/categories')
      const data = await res.json()
      if (data.success) {
        setCategories(data.data)
      }
    } catch (error) {
      console.error('获取分类失败:', error)
    } finally {
      setLoading(false)
    }
  }

  function handleEdit(category: Category) {
    setEditing(category)
    setFormData({
      name: category.name,
      description: category.description || '',
      sortOrder: category.sortOrder,
      status: category.status,
    })
  }

  function handleCancel() {
    setEditing(null)
    setFormData({
      name: '',
      description: '',
      sortOrder: 0,
      status: 'active',
    })
  }

  async function handleSubmit() {
    if (!formData.name) {
      alert('分类名称不能为空')
      return
    }

    try {
      const url = editing ? `/api/admin/categories/${editing.id}` : '/api/admin/categories'
      const method = editing ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (data.success) {
        await fetchCategories()
        handleCancel()
      } else {
        alert(data.error || '操作失败')
      }
    } catch (error) {
      console.error('保存分类失败:', error)
      alert('操作失败')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('确定要删除这个分类吗？')) return
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.success) {
        await fetchCategories()
      } else {
        alert(data.error || '删除失败')
      }
    } catch (error) {
      console.error('删除分类失败:', error)
      alert('删除失败')
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-title-large font-title">分类管理</h1>
        {!editing && (
          <AdminButton variant="primary" onClick={() => setEditing({} as Category)}>
            新增分类
          </AdminButton>
        )}
      </div>

      {editing && (
        <AdminCard className="mb-6">
          <h3 className="text-title-small font-title mb-4">
            {editing.id ? '编辑分类' : '新增分类'}
          </h3>
          <div className="space-y-4">
            <Input
              label="分类名称 *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <Textarea
              label="分类描述"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="排序顺序"
                type="number"
                value={formData.sortOrder}
                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
              />
              <select
                className="input"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="active">启用</option>
                <option value="inactive">禁用</option>
              </select>
            </div>
          </div>
          <div className="flex gap-4 mt-4">
            <AdminButton variant="primary" onClick={handleSubmit}>保存</AdminButton>
            <AdminButton variant="secondary" onClick={handleCancel}>取消</AdminButton>
          </div>
        </AdminCard>
      )}

      <AdminCard>
        {loading ? (
          <div className="text-center py-12">加载中...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-medium">
                  <th className="text-left py-3 px-4 text-body font-medium">分类名称</th>
                  <th className="text-left py-3 px-4 text-body font-medium">描述</th>
                  <th className="text-left py-3 px-4 text-body font-medium">排序</th>
                  <th className="text-left py-3 px-4 text-body font-medium">状态</th>
                  <th className="text-left py-3 px-4 text-body font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id} className="border-b border-neutral-medium">
                    <td className="py-3 px-4 text-body">{category.name}</td>
                    <td className="py-3 px-4 text-body text-neutral-medium">
                      {category.description || '-'}
                    </td>
                    <td className="py-3 px-4 text-body">{category.sortOrder}</td>
                    <td className="py-3 px-4 text-body">
                      <span className={category.status === 'active' ? 'text-green-600' : 'text-red-600'}>
                        {category.status === 'active' ? '启用' : '禁用'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <AdminButton variant="secondary" onClick={() => handleEdit(category)}>
                          编辑
                        </AdminButton>
                        <AdminButton variant="danger" onClick={() => handleDelete(category.id)}>
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

