'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, Checkbox, Button, message, Spin, Tag, Divider } from 'antd'
import { ArrowLeftOutlined, SaveOutlined, UserOutlined } from '@ant-design/icons'
import Link from 'next/link'
import AdminCard from '@/components/admin/AdminCard'

export default function AdminPermissionsPage() {
  const params = useParams()
  const router = useRouter()
  const adminId = params.id as string
  const [admin, setAdmin] = useState<any>(null)
  const [allPermissions, setAllPermissions] = useState<any[]>([])
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchData()
  }, [adminId])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [adminRes, permissionsRes] = await Promise.all([
        fetch('/api/admin/admins/' + adminId),
        fetch('/api/admin/permissions')
      ])
      
      const adminData = await adminRes.json()
      const permissionsData = await permissionsRes.json()
      
      if (adminData.success) {
        setAdmin(adminData.data)
        setSelectedPermissions(adminData.data.permissions?.map((p: any) => p.permissionId) || [])
      }
      
      if (permissionsData.success) {
        setAllPermissions(permissionsData.data)
      }
    } catch (error) {
      message.error('加载失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const res = await fetch('/api/admin/admins/' + adminId + '/permissions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissionIds: selectedPermissions })
      })
      const data = await res.json()
      
      if (data.success) {
        message.success('权限保存成功')
        router.push('/admin/admins')
      } else {
        message.error(data.error || '保存失败')
      }
    } catch (error) {
      message.error('保存失败')
    } finally {
      setSaving(false)
    }
  }

  const getRoleInfo = (role: string) => {
    const map: any = {
      super_admin: { color: 'red', text: '超级管理员' },
      admin: { color: 'blue', text: '普通管理员' },
      sales: { color: 'green', text: '销售' },
      support: { color: 'orange', text: '售后' },
      service: { color: 'purple', text: '客服' }
    }
    return map[role] || { color: 'default', text: role }
  }

  const groupPermissionsByResource = () => {
    const grouped: Record<string, any[]> = {}
    allPermissions.forEach(p => {
      if (!grouped[p.resource]) {
        grouped[p.resource] = []
      }
      grouped[p.resource].push(p)
    })
    return grouped
  }

  const getResourceName = (resource: string) => {
    const map: Record<string, string> = {
      user: '用户管理',
      admin: '管理员管理',
      product: '商品管理',
      category: '分类管理',
      order: '订单管理',
      payment: '支付管理',
      coupon: '优惠券管理',
      repair: '维修管理',
      invoice: '发票管理',
      refund: '退款管理',
      file: '文件管理',
      system: '系统设置',
      courier: '物流管理'
    }
    return map[resource] || resource
  }

  const getActionName = (action: string) => {
    const map: Record<string, string> = {
      create: '创建',
      read: '查看',
      update: '编辑',
      delete: '删除',
      manage: '完全管理'
    }
    return map[action] || action
  }

  const handleToggleResource = (resource: string, checked: boolean) => {
    const resourcePermissions = allPermissions.filter(p => p.resource === resource)
    const permissionIds = resourcePermissions.map(p => p.id)
    
    if (checked) {
      setSelectedPermissions([...new Set([...selectedPermissions, ...permissionIds])])
    } else {
      setSelectedPermissions(selectedPermissions.filter(id => !permissionIds.includes(id)))
    }
  }

  const isResourceFullySelected = (resource: string) => {
    const resourcePermissions = allPermissions.filter(p => p.resource === resource)
    return resourcePermissions.every(p => selectedPermissions.includes(p.id))
  }

  const isResourcePartiallySelected = (resource: string) => {
    const resourcePermissions = allPermissions.filter(p => p.resource === resource)
    const selectedCount = resourcePermissions.filter(p => selectedPermissions.includes(p.id)).length
    return selectedCount > 0 && selectedCount < resourcePermissions.length
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spin size="large" />
      </div>
    )
  }

  if (!admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">管理员不存在</p>
          <Link href="/admin/admins">
            <Button>返回列表</Button>
          </Link>
        </div>
      </div>
    )
  }

  const roleInfo = getRoleInfo(admin.role)
  const groupedPermissions = groupPermissionsByResource()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/admin/admins">
            <Button icon={<ArrowLeftOutlined />} className="mb-4">返回列表</Button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">权限管理</h1>
              <p className="text-gray-600 mt-1">为管理员分配功能权限</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <Card>
            <div className="flex items-center gap-4">
              <UserOutlined className="text-2xl text-gray-400" />
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-medium">{admin.name}</span>
                  <Tag color={roleInfo.color}>{roleInfo.text}</Tag>
                </div>
                <div className="text-sm text-gray-500 mt-1">{admin.email}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">当前权限数</div>
                <div className="text-2xl font-bold text-blue-600">{selectedPermissions.length}</div>
              </div>
            </div>
          </Card>
        </div>

        <AdminCard title="功能权限配置">
          <div className="space-y-6">
            {Object.entries(groupedPermissions).map(([resource, permissions]) => (
              <div key={resource} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={isResourceFullySelected(resource)}
                      indeterminate={isResourcePartiallySelected(resource)}
                      onChange={(e) => handleToggleResource(resource, e.target.checked)}
                    >
                      <span className="text-base font-medium text-gray-900">
                        {getResourceName(resource)}
                      </span>
                    </Checkbox>
                  </div>
                  <span className="text-sm text-gray-500">
                    {permissions.filter(p => selectedPermissions.includes(p.id)).length} / {permissions.length}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 ml-6">
                  {permissions.map(permission => (
                    <Checkbox
                      key={permission.id}
                      checked={selectedPermissions.includes(permission.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedPermissions([...selectedPermissions, permission.id])
                        } else {
                          setSelectedPermissions(selectedPermissions.filter(id => id !== permission.id))
                        }
                      }}
                    >
                      <span className="text-sm">
                        {getActionName(permission.action)}
                      </span>
                    </Checkbox>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <Divider />

          <div className="flex justify-end gap-3">
            <Link href="/admin/admins">
              <Button size="large">取消</Button>
            </Link>
            <Button
              type="primary"
              size="large"
              icon={<SaveOutlined />}
              onClick={handleSave}
              loading={saving}
            >
              保存权限
            </Button>
          </div>
        </AdminCard>
      </div>
    </div>
  )
}
