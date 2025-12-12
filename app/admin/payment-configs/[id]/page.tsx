'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import AdminCard from '@/components/admin/AdminCard'
import AdminButton from '@/components/admin/AdminButton'
import Input from '@/components/client/Input'
import Textarea from '@/components/client/Textarea'
import { PaymentConfig } from '@/types'

export default function PaymentConfigDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [config, setConfig] = useState<PaymentConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<any>({})

  useEffect(() => {
    if (params.id) {
      fetchConfig(params.id as string)
    }
  }, [params.id])

  async function fetchConfig(id: string) {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/payment-configs/${id}`)
      const data = await res.json()
      if (data.success) {
        setConfig(data.data)
        setFormData({
          displayName: data.data.displayName,
          enabled: data.data.enabled,
          sortOrder: data.data.sortOrder,
          ...data.data.config,
        })
      }
    } catch (error) {
      console.error('获取支付配置失败:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit() {
    if (!config) return

    try {
      setSaving(true)
      const { displayName, enabled, sortOrder, ...configData } = formData

      const res = await fetch(`/api/admin/payment-configs/${config.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName,
          enabled,
          sortOrder: parseInt(sortOrder) || 0,
          config: configData,
        }),
      })
      const data = await res.json()
      if (data.success) {
        alert('保存成功')
        router.push('/admin/payment-configs')
      } else {
        alert(data.error || '保存失败')
      }
    } catch (error) {
      console.error('保存支付配置失败:', error)
      alert('保存失败')
    } finally {
      setSaving(false)
    }
  }

  function renderConfigFields() {
    if (!config) return null

    switch (config.name) {
      case 'alipay':
        return (
          <>
            <Input
              label="AppID"
              value={formData.appId || ''}
              onChange={(e) => setFormData({ ...formData, appId: e.target.value })}
            />
            <Textarea
              label="商户私钥"
              value={formData.privateKey || ''}
              onChange={(e) => setFormData({ ...formData, privateKey: e.target.value })}
              rows={4}
            />
            <Textarea
              label="支付宝公钥"
              value={formData.publicKey || ''}
              onChange={(e) => setFormData({ ...formData, publicKey: e.target.value })}
              rows={4}
            />
            <Input
              label="网关地址"
              value={formData.gateway || 'https://openapi.alipay.com/gateway.do'}
              onChange={(e) => setFormData({ ...formData, gateway: e.target.value })}
            />
          </>
        )
      case 'wechat':
        return (
          <>
            <Input
              label="AppID"
              value={formData.appId || ''}
              onChange={(e) => setFormData({ ...formData, appId: e.target.value })}
            />
            <Input
              label="商户号 (MchID)"
              value={formData.mchId || ''}
              onChange={(e) => setFormData({ ...formData, mchId: e.target.value })}
            />
            <Input
              label="API 密钥"
              value={formData.apiKey || ''}
              onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
            />
            <Input
              label="通知地址"
              value={formData.notifyUrl || ''}
              onChange={(e) => setFormData({ ...formData, notifyUrl: e.target.value })}
            />
          </>
        )
      case 'paypal':
        return (
          <>
            <Input
              label="Client ID"
              value={formData.clientId || ''}
              onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
            />
            <Input
              label="Client Secret"
              value={formData.clientSecret || ''}
              onChange={(e) => setFormData({ ...formData, clientSecret: e.target.value })}
            />
            <select
              className="input"
              value={formData.mode || 'sandbox'}
              onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
            >
              <option value="sandbox">沙箱环境</option>
              <option value="live">生产环境</option>
            </select>
          </>
        )
      default:
        return (
          <Textarea
            label="配置参数 (JSON格式)"
            value={JSON.stringify(formData, null, 2)}
            onChange={(e) => {
              try {
                setFormData(JSON.parse(e.target.value))
              } catch (error) {
                // 忽略解析错误
              }
            }}
            rows={10}
          />
        )
    }
  }

  if (loading) {
    return <div className="text-center py-12">加载中...</div>
  }

  if (!config) {
    return <div className="text-center py-12">支付配置不存在</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-title-large font-title">配置 {config.displayName}</h1>
        <AdminButton variant="secondary" onClick={() => router.back()}>
          返回
        </AdminButton>
      </div>

      <AdminCard>
        <div className="space-y-4">
          <Input
            label="显示名称"
            value={formData.displayName || ''}
            onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
          />
          <Input
            label="排序顺序"
            type="number"
            value={formData.sortOrder || 0}
            onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
          />
          <div className="flex items-center">
            <input
              type="checkbox"
              id="enabled"
              checked={formData.enabled || false}
              onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
              className="mr-2"
            />
            <label htmlFor="enabled" className="text-body">启用此支付方式</label>
          </div>

          <div className="border-t border-neutral-medium pt-4 mt-4">
            <h3 className="text-title-small font-title mb-4">支付参数配置</h3>
            <div className="space-y-4">
              {renderConfigFields()}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <AdminButton variant="primary" onClick={handleSubmit} disabled={saving}>
              {saving ? '保存中...' : '保存配置'}
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

