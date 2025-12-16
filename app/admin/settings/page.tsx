'use client'

import { useEffect, useState } from 'react'
import AdminCard from '@/components/admin/AdminCard'
import AdminButton from '@/components/admin/AdminButton'
import Input from '@/components/client/Input'
import Textarea from '@/components/client/Textarea'
import { BrandAdvantage, Testimonial } from '@/types'

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<any>({})
  
  // Logo 和公司名称
  const [logo, setLogo] = useState('')
  const [heroImage, setHeroImage] = useState('')
  const [companyName, setCompanyName] = useState('')
  
  // 品牌优势
  const [advantages, setAdvantages] = useState<BrandAdvantage[]>([])
  
  // 客户口碑
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/settings')
      const data = await res.json()
      if (data.success) {
        setSettings(data.data)
        setLogo(data.data.logo || '')
        setHeroImage(data.data.heroImage || '')
        setCompanyName(data.data.companyName || 'Axiarz')
        setAdvantages(data.data.brandAdvantages || [])
        setTestimonials(data.data.testimonials || [])
      }
    } catch (error) {
      console.error('获取设置失败:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    try {
      setSaving(true)
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logo,
          heroImage,
          companyName,
          brandAdvantages: advantages,
          testimonials,
        }),
      })
      const data = await res.json()
      if (data.success) {
        alert('保存成功')
        await fetchSettings()
      } else {
        alert(data.error || '保存失败')
      }
    } catch (error) {
      console.error('保存设置失败:', error)
      alert('保存失败')
    } finally {
      setSaving(false)
    }
  }

  function addAdvantage() {
    setAdvantages([
      ...advantages,
      {
        id: Date.now().toString(),
        title: '',
        description: '',
        icon: '✓',
        sortOrder: advantages.length,
      },
    ])
  }

  function updateAdvantage(index: number, field: keyof BrandAdvantage, value: any) {
    const updated = [...advantages]
    updated[index] = { ...updated[index], [field]: value }
    setAdvantages(updated)
  }

  function removeAdvantage(index: number) {
    setAdvantages(advantages.filter((_, i) => i !== index))
  }

  function addTestimonial() {
    setTestimonials([
      ...testimonials,
      {
        id: Date.now().toString(),
        customerName: '',
        customerAvatar: '',
        rating: 5,
        content: '',
        sortOrder: testimonials.length,
      },
    ])
  }

  function updateTestimonial(index: number, field: keyof Testimonial, value: any) {
    const updated = [...testimonials]
    updated[index] = { ...updated[index], [field]: value }
    setTestimonials(updated)
  }

  function removeTestimonial(index: number) {
    setTestimonials(testimonials.filter((_, i) => i !== index))
  }

  if (loading) {
    return <div className="text-center py-12">加载中...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-title-large font-title">系统设置</h1>
        <AdminButton variant="primary" onClick={handleSave} disabled={saving}>
          {saving ? '保存中...' : '保存设置'}
        </AdminButton>
      </div>

      {/* 基本设置 */}
      <AdminCard title="基本设置" className="mb-6">
        <div className="space-y-4">
          <Input
            label="公司名称"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="输入公司名称"
          />
          <Input
            label="公司 Logo URL"
            value={logo}
            onChange={(e) => setLogo(e.target.value)}
            placeholder="输入 Logo 图片 URL，如: /uploads/logo.png"
            help Text="留空则显示公司名称文字"
          />
          {logo && (
            <div className="mt-2">
              <p className="text-caption text-neutral-medium mb-2">Logo 预览：</p>
              <img src={logo} alt="Logo" className="h-12 object-contain" />
            </div>
          )}
          <Input
            label="首页英雄区展示图 URL"
            value={heroImage}
            onChange={(e) => setHeroImage(e.target.value)}
            placeholder="输入展示图 URL，如: /uploads/hero.png"
          />
          {heroImage && (
            <div className="mt-2">
              <p className="text-caption text-neutral-medium mb-2">展示图预览：</p>
              <img src={heroImage} alt="Hero" className="h-32 object-contain" />
            </div>
          )}
        </div>
      </AdminCard>

      {/* 品牌优势 */}
      <AdminCard title="品牌优势" className="mb-6">
        <div className="mb-4">
          <AdminButton variant="secondary" onClick={addAdvantage}>
            + 添加优势
          </AdminButton>
        </div>
        {advantages.length === 0 ? (
          <p className="text-neutral-medium text-center py-4">暂无品牌优势，点击上方按钮添加</p>
        ) : (
          <div className="space-y-4">
            {advantages.map((adv, index) => (
              <div key={adv.id} className="border border-neutral-medium rounded-default p-4">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-body font-medium">优势 {index + 1}</h4>
                  <AdminButton
                    variant="danger"
                    onClick={() => removeAdvantage(index)}
                    className="text-sm"
                  >
                    删除
                  </AdminButton>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="标题"
                    value={adv.title}
                    onChange={(e) => updateAdvantage(index, 'title', e.target.value)}
                  />
                  <Input
                    label="图标 Emoji"
                    value={adv.icon}
                    onChange={(e) => updateAdvantage(index, 'icon', e.target.value)}
                    placeholder="如: ✓, ⚡, ❤"
                  />
                </div>
                <Textarea
                  label="描述"
                  value={adv.description}
                  onChange={(e) => updateAdvantage(index, 'description', e.target.value)}
                  rows={3}
                />
                <Input
                  label="排序"
                  type="number"
                  value={adv.sortOrder.toString()}
                  onChange={(e) => updateAdvantage(index, 'sortOrder', parseInt(e.target.value) || 0)}
                />
              </div>
            ))}
          </div>
        )}
      </AdminCard>

      {/* 客户口碑 */}
      <AdminCard title="客户口碑">
        <div className="mb-4">
          <AdminButton variant="secondary" onClick={addTestimonial}>
            + 添加客户评价
          </AdminButton>
        </div>
        {testimonials.length === 0 ? (
          <p className="text-neutral-medium text-center py-4">暂无客户评价，点击上方按钮添加</p>
        ) : (
          <div className="space-y-4">
            {testimonials.map((test, index) => (
              <div key={test.id} className="border border-neutral-medium rounded-default p-4">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-body font-medium">评价 {index + 1}</h4>
                  <AdminButton
                    variant="danger"
                    onClick={() => removeTestimonial(index)}
                    className="text-sm"
                  >
                    删除
                  </AdminButton>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    label="客户名称"
                    value={test.customerName}
                    onChange={(e) => updateTestimonial(index, 'customerName', e.target.value)}
                  />
                  <Input
                    label="客户头像 URL（可选）"
                    value={test.customerAvatar || ''}
                    onChange={(e) => updateTestimonial(index, 'customerAvatar', e.target.value)}
                  />
                  <Input
                    label="评分 (1-5)"
                    type="number"
                    min="1"
                    max="5"
                    value={test.rating.toString()}
                    onChange={(e) => updateTestimonial(index, 'rating', parseInt(e.target.value) || 5)}
                  />
                </div>
                <Textarea
                  label="评价内容"
                  value={test.content}
                  onChange={(e) => updateTestimonial(index, 'content', e.target.value)}
                  rows={3}
                />
                <Input
                  label="排序"
                  type="number"
                  value={test.sortOrder.toString()}
                  onChange={(e) => updateTestimonial(index, 'sortOrder', parseInt(e.target.value) || 0)}
                />
              </div>
            ))}
          </div>
        )}
      </AdminCard>

      <div className="mt-6 flex justify-end">
        <AdminButton variant="primary" onClick={handleSave} disabled={saving}>
          {saving ? '保存中...' : '保存所有设置'}
        </AdminButton>
      </div>
    </div>
  )
}

