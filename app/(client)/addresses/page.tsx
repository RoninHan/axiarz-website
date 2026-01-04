'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { message, Modal, Select } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, HomeOutlined, PhoneOutlined, EnvironmentOutlined, StarOutlined, StarFilled } from '@ant-design/icons'
import Button from '@/components/client/Button'
import Card from '@/components/client/Card'
import Input from '@/components/client/Input'
import ProtectedRoute from '@/components/client/ProtectedRoute'
import { Address } from '@/types'

interface AddressFormData {
  name: string
  phone: string
  province: string
  city: string
  detail: string
  postalCode: string
  isDefault: boolean
}

interface FormErrors {
  name?: string
  phone?: string
  province?: string
  city?: string
  detail?: string
  postalCode?: string
}

// 中国省市区数据（简化版）
const provinces = [
  '北京市', '天津市', '上海市', '重庆市', '河北省', '山西省', '辽宁省', '吉林省', '黑龙江省',
  '江苏省', '浙江省', '安徽省', '福建省', '江西省', '山东省', '河南省', '湖北省', '湖南省',
  '广东省', '广西壮族自治区', '海南省', '四川省', '贵州省', '云南省', '西藏自治区',
  '陕西省', '甘肃省', '青海省', '宁夏回族自治区', '新疆维吾尔自治区', '台湾省', '香港特别行政区', '澳门特别行政区'
]

const cities: Record<string, string[]> = {
  '北京市': ['北京市'],
  '天津市': ['天津市'],
  '上海市': ['上海市'],
  '重庆市': ['重庆市'],
  '广东省': ['广州市', '深圳市', '珠海市', '汕头市', '韶关市', '佛山市', '江门市', '湛江市', '茂名市', '肇庆市', '惠州市', '梅州市', '汕尾市', '河源市', '阳江市', '清远市', '东莞市', '中山市', '潮州市', '揭阳市', '云浮市'],
  // 可以扩展更多省市数据
}

// 区县数据已移除，现在只使用省市二级选择

function AddressesPageContent() {
  const router = useRouter()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState<Address | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [messageApi, contextHolder] = message.useMessage()

  const [formData, setFormData] = useState<AddressFormData>({
    name: '',
    phone: '',
    province: '',
    city: '',
    detail: '',
    postalCode: '',
    isDefault: false,
  })

  const [formErrors, setFormErrors] = useState<FormErrors>({})

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
      } else {
        messageApi.error(data.error || '获取地址失败')
      }
    } catch (error) {
      console.error('获取地址失败:', error)
      messageApi.error('获取地址失败')
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setFormData({
      name: '',
      phone: '',
      province: '',
      city: '',
      detail: '',
      postalCode: '',
      isDefault: false,
    })
    setFormErrors({})
  }

  function handleEdit(address: Address) {
    setEditing(address)
    setFormData({
      name: address.name,
      phone: address.phone,
      province: address.province,
      city: address.city,
      detail: address.detail,
      postalCode: address.postalCode || '',
      isDefault: address.isDefault,
    })
    setFormErrors({})
    setShowForm(true)
  }

  function handleCancel() {
    setEditing(null)
    setShowForm(false)
    resetForm()
  }

  function validateForm(): boolean {
    const errors: FormErrors = {}

    if (!formData.name.trim()) {
      errors.name = '请输入收货人姓名'
    }

    if (!formData.phone.trim()) {
      errors.phone = '请输入联系电话'
    } else if (!/^1[3-9]\d{9}$/.test(formData.phone.trim())) {
      errors.phone = '请输入正确的手机号码'
    }

    if (!formData.province) {
      errors.province = '请选择省份'
    }

    if (!formData.city) {
      errors.city = '请选择城市'
    }

    if (!formData.detail.trim()) {
      errors.detail = '请输入详细地址'
    }

    if (formData.postalCode && !/^\d{6}$/.test(formData.postalCode.trim())) {
      errors.postalCode = '邮编格式不正确'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit() {
    if (!validateForm()) {
      messageApi.error('请检查表单填写是否正确')
      return
    }

    try {
      setSaving(true)
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
    } finally {
      setSaving(false)
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
        setDeleteConfirm(null)
      } else {
        messageApi.error(data.error || '删除失败')
      }
    } catch (error) {
      console.error('删除地址失败:', error)
      messageApi.error('删除失败')
    }
  }

  async function handleSetDefault(address: Address) {
    try {
      const res = await fetch(`/api/client/addresses/${address.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDefault: true }),
      })
      const data = await res.json()

      if (data.success) {
        messageApi.success('已设为默认地址')
        await fetchAddresses()
      } else {
        messageApi.error(data.error || '设置失败')
      }
    } catch (error) {
      console.error('设置默认地址失败:', error)
      messageApi.error('设置失败')
    }
  }

  function getAvailableCities() {
    return cities[formData.province] || []
  }

  function handleProvinceChange(province: string) {
    setFormData(prev => ({
      ...prev,
      province,
      city: ''
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-orange mx-auto mb-4"></div>
          <p className="text-body text-neutral-medium">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-light">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {contextHolder}

        {/* 页面头部 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-title-large font-title text-primary-black mb-2">收货地址管理</h1>
              <p className="text-body text-neutral-medium">管理您的收货地址，方便快捷的购物体验</p>
            </div>
            <Button
              variant="primary"
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2"
            >
              <PlusOutlined />
              添加新地址
            </Button>
          </div>
        </div>

        {/* 地址表单 */}
        {showForm && (
          <Card className="mb-8 border-2 border-accent-orange/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-accent-orange rounded-full flex items-center justify-center">
                <EditOutlined className="text-primary-white text-lg" />
              </div>
              <h3 className="text-title-small font-title text-primary-black">
                {editing ? '编辑收货地址' : '添加新地址'}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="收货人姓名"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="请输入收货人姓名"
                error={formErrors.name}
                required
              />

              <Input
                label="联系电话"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="请输入手机号码"
                error={formErrors.phone}
                required
              />

              <div className="w-full">
                <label className="label">
                  省份 <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.province || undefined}
                  onChange={handleProvinceChange}
                  placeholder="请选择省份"
                  className="w-full"
                  size="large"
                  showSearch
                  filterOption={(input, option) =>
                    (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {provinces.map(province => (
                    <Select.Option key={province} value={province}>{province}</Select.Option>
                  ))}
                </Select>
                {formErrors.province && (
                  <p className="text-red-500 text-caption mt-1">{formErrors.province}</p>
                )}
              </div>

              <div className="w-full">
                <label className="label">
                  城市 <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.city || undefined}
                  onChange={(value) => setFormData({ ...formData, city: value })}
                  placeholder="请选择城市"
                  className="w-full"
                  size="large"
                  disabled={!formData.province}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {getAvailableCities().map(city => (
                    <Select.Option key={city} value={city}>{city}</Select.Option>
                  ))}
                </Select>
                {formErrors.city && (
                  <p className="text-red-500 text-caption mt-1">{formErrors.city}</p>
                )}
              </div>

              <Input
                label="邮政编码"
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                placeholder="请输入邮政编码（可选）"
                error={formErrors.postalCode}
              />
            </div>

            <div className="mt-6">
              <Input
                label="详细地址"
                value={formData.detail}
                onChange={(e) => setFormData({ ...formData, detail: e.target.value })}
                placeholder="请输入详细地址，如街道、门牌号、小区、楼栋号等"
                error={formErrors.detail}
                required
              />
            </div>

            <div className="mt-6 flex items-center gap-3">
              <input
                type="checkbox"
                id="isDefault"
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                className="w-4 h-4 text-accent-orange rounded border-neutral-medium focus:ring-accent-orange"
              />
              <label htmlFor="isDefault" className="text-body text-primary-black cursor-pointer">
                设为默认地址
              </label>
            </div>

            <div className="flex gap-4 mt-8 pt-6 border-t border-neutral-border">
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={saving}
                className="flex items-center gap-2"
              >
                {saving ? '保存中...' : '保存地址'}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={saving}
              >
                取消
              </Button>
            </div>
          </Card>
        )}

        {/* 地址列表 */}
        <div className="space-y-4">
          {addresses.length === 0 ? (
            <Card className="text-center py-16">
              <div className="mb-6">
                <EnvironmentOutlined className="text-6xl text-neutral-medium mb-4" />
                <h3 className="text-title-small font-title text-primary-black mb-2">暂无收货地址</h3>
                <p className="text-body text-neutral-medium">添加一个收货地址，让购物变得更方便</p>
              </div>
              <Button
                variant="primary"
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 mx-auto"
              >
                <PlusOutlined />
                添加第一个地址
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {addresses.map((address) => (
                <Card
                  key={address.id}
                  className={`relative transition-all duration-200 hover:shadow-hover ${
                    address.isDefault ? 'border-accent-orange border-2' : ''
                  }`}
                >
                  {address.isDefault && (
                    <div className="absolute -top-2 -right-2 bg-accent-orange text-primary-white px-3 py-1 rounded-full text-caption font-medium flex items-center gap-1">
                      <StarFilled className="text-xs" />
                      默认
                    </div>
                  )}

                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-neutral-light rounded-full flex items-center justify-center">
                        <HomeOutlined className="text-neutral-medium" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-body font-medium text-primary-black">{address.name}</span>
                          {!address.isDefault && (
                            <button
                              onClick={() => handleSetDefault(address)}
                              className="text-caption text-accent-orange hover:text-accent-orange-dark transition-colors"
                            >
                              设为默认
                            </button>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-body text-neutral-medium">
                          <PhoneOutlined className="text-sm" />
                          {address.phone}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(address)}
                        className="p-2 text-neutral-medium hover:text-accent-orange transition-colors"
                        title="编辑"
                      >
                        <EditOutlined />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(address.id)}
                        className="p-2 text-neutral-medium hover:text-red-500 transition-colors"
                        title="删除"
                      >
                        <DeleteOutlined />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <EnvironmentOutlined className="text-neutral-medium mt-0.5 flex-shrink-0" />
                      <div className="text-body text-neutral-dark leading-relaxed">
                        <div>{address.province} {address.city}</div>
                        <div>{address.detail}</div>
                        {address.postalCode && (
                          <div className="text-caption text-neutral-medium mt-1">
                            邮编: {address.postalCode}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* 删除确认弹窗 */}
        <Modal
          title="确认删除"
          open={!!deleteConfirm}
          onOk={() => deleteConfirm && handleDelete(deleteConfirm)}
          onCancel={() => setDeleteConfirm(null)}
          okText="删除"
          cancelText="取消"
          okButtonProps={{ danger: true }}
        >
          <p>确定要删除这个收货地址吗？此操作无法撤销。</p>
        </Modal>
      </div>
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

