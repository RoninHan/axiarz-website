'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import AdminCard from '@/components/admin/AdminCard'
import AdminButton from '@/components/admin/AdminButton'
import { PaymentConfig } from '@/types'

export default function PaymentConfigsPage() {
  const [configs, setConfigs] = useState<PaymentConfig[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchConfigs()
  }, [])

  async function fetchConfigs() {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/payment-configs')
      const data = await res.json()
      if (data.success) {
        setConfigs(data.data)
      }
    } catch (error) {
      console.error('获取支付配置失败:', error)
    } finally {
      setLoading(false)
    }
  }

  async function toggleEnabled(id: string, currentEnabled: boolean) {
    try {
      const res = await fetch(`/api/admin/payment-configs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !currentEnabled }),
      })
      const data = await res.json()
      if (data.success) {
        await fetchConfigs()
      } else {
        alert(data.error || '操作失败')
      }
    } catch (error) {
      console.error('更新支付配置失败:', error)
      alert('操作失败')
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-title-large font-title">支付配置</h1>
      </div>

      <AdminCard>
        {loading ? (
          <div className="text-center py-12">加载中...</div>
        ) : (
          <div className="space-y-4">
            {configs.map((config) => (
              <div
                key={config.id}
                className="border border-neutral-medium rounded-default p-4"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-title-small font-title mb-2">{config.displayName}</h3>
                    <p className="text-caption text-neutral-medium">
                      标识: {config.name} | 排序: {config.sortOrder}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-body ${config.enabled ? 'text-green-600' : 'text-red-600'}`}>
                      {config.enabled ? '已启用' : '已禁用'}
                    </span>
                    <AdminButton
                      variant={config.enabled ? 'secondary' : 'primary'}
                      onClick={() => toggleEnabled(config.id, config.enabled)}
                    >
                      {config.enabled ? '禁用' : '启用'}
                    </AdminButton>
                    <Link href={`/admin/payment-configs/${config.id}`}>
                      <AdminButton variant="secondary">配置</AdminButton>
                    </Link>
                  </div>
                </div>
                <div className="text-caption text-neutral-medium">
                  配置参数: {Object.keys(config.config || {}).length} 项
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminCard>
    </div>
  )
}

