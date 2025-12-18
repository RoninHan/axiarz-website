'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { message } from 'antd'
import Button from '@/components/client/Button'
import Card from '@/components/client/Card'
import Input from '@/components/client/Input'
import ProtectedRoute from '@/components/client/ProtectedRoute'
import { Address } from '@/types'

function AddressesPageContent() {
  const router = useRouter()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Address | null>(null)
  const [messageApi, contextHolder] = message.useMessage()
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    province: '',
    city: '',
    district: '',
    detail: '',
    postalCode: '',
    isDefault: false,
  })

  useEffect(() => {
    fetchAddresses()
  }, [])

  async function fetchAddresses() {
    try {
      setLoading(true)
      const res = await fetch('/api/client/addresses')
      const data = await res.json()
      if (data.success) {
        setAddresses(data.data)
      }
    } catch (error) {
      console.error('获取地址失败:', error)
    } finally {
      setLoading(false)
    }
  }

  function handleEdit(address: Address) {
    setEditing(address)
    setFormData({
      name: address.name,
      phone: address.phone,
      province: address.province,
      city: address.city,
      district: address.district,
      detail: address.detail,
      postalCode: address.postalCode || '',
      isDefault: address.isDefault,
    })
  }

  function handleCancel() {
    setEditing(null)
    setFormData({
      name: '',
      phone: '',
      province: '',
      city: '',
      district: '',
      detail: '',
      postalCode: '',
      isDefault: false,
    })
  }

  async function handleSubmit() {
    try {
      const url = editing ? `/api/client/addresses/${editing.id}` : '/api/client/addresses'
      const method = editing ? 'PATCH' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (data.success) {
        messageApi.success(editing ? '地址已更新' : '地址已添加')
        await fetchAddresses()
        handleCancel()
      } else {
        messageApi.error(data.error || '操作失败')
      }
    } catch (error) {
      console.error('保存地址失败:', error)
      messageApi.error('操作失败')
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/client/addresses/${id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.success) {
        messageApi.success('地址已删除')
        await fetchAddresses()
      } else {
        messageApi.error(data.error || '删除失败')
      }
    } catch (error) {
      console.error('删除地址失败:', error)
      messageApi.error('删除失败')
    }
  }

  if (loading) {
    return <div className="container mx-auto px-6 py-12 text-center">加载中...</div>
  }

  return (
    <div className="container mx-auto px-6 py-12 max-w-[1920px]">
      {contextHolder}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-title-large font-title">收货地址</h1>
        {!editing && (
          <Button variant="primary" onClick={() => setEditing({} as Address)}>
            添加地址
          </Button>
        )}
      </div>

      {editing && (
        <Card className="mb-6">
          <h3 className="text-title-small font-title mb-4">
            {editing.id ? '编辑地址' : '新增地址'}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="收货人姓名"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <Input
              label="联系电话"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <Input
              label="省份"
              value={formData.province}
              onChange={(e) => setFormData({ ...formData, province: e.target.value })}
            />
            <Input
              label="城市"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
            <Input
              label="区县"
              value={formData.district}
              onChange={(e) => setFormData({ ...formData, district: e.target.value })}
            />
            <Input
              label="邮编"
              value={formData.postalCode}
              onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
            />
            <div className="col-span-2">
              <Input
                label="详细地址"
                value={formData.detail}
                onChange={(e) => setFormData({ ...formData, detail: e.target.value })}
              />
            </div>
            <div className="col-span-2 flex items-center">
              <input
                type="checkbox"
                id="isDefault"
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                className="mr-2"
              />
              <label htmlFor="isDefault" className="text-body">设为默认地址</label>
            </div>
          </div>
          <div className="flex gap-4 mt-4">
            <Button variant="primary" onClick={handleSubmit}>保存</Button>
            <Button variant="outline" onClick={handleCancel}>取消</Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-4">
        {addresses.map((address) => (
          <Card key={address.id}>
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="text-body font-medium">{address.name}</span>
                <span className="text-body ml-2">{address.phone}</span>
                {address.isDefault && (
                  <span className="ml-2 text-caption text-accent-orange bg-orange-50 px-2 py-1 rounded-default">
                    默认
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  className="text-caption text-accent-orange hover:underline"
                  onClick={() => handleEdit(address)}
                >
                  编辑
                </button>
                <button
                  className="text-caption text-red-500 hover:underline"
                  onClick={() => handleDelete(address.id)}
                >
                  删除
                </button>
              </div>
            </div>
            <p className="text-body text-neutral-medium">
              {address.province} {address.city} {address.district} {address.detail}
            </p>
            {address.postalCode && (
              <p className="text-caption text-neutral-medium mt-1">邮编: {address.postalCode}</p>
            )}
          </Card>
        ))}
      </div>

      {addresses.length === 0 && !editing && (
        <Card className="text-center py-12">
          <p className="text-body text-neutral-medium mb-4">暂无收货地址</p>
          <Button variant="primary" onClick={() => setEditing({} as Address)}>
            添加地址
          </Button>
        </Card>
      )}
    </div>
  )
}

export default function AddressesPage() {
  return (
    <ProtectedRoute>
      <AddressesPageContent />
    </ProtectedRoute>
  )
}

