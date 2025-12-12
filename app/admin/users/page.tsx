'use client'

import { useEffect, useState } from 'react'
import AdminCard from '@/components/admin/AdminCard'
import AdminButton from '@/components/admin/AdminButton'
import Input from '@/components/client/Input'
import { User } from '@/types'

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [statusFilter])

  async function fetchUsers() {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (statusFilter) params.append('status', statusFilter)

      const res = await fetch(`/api/admin/users?${params}`)
      const data = await res.json()
      if (data.success) {
        setUsers(data.data)
      }
    } catch (error) {
      console.error('获取用户失败:', error)
    } finally {
      setLoading(false)
    }
  }

  async function toggleUserStatus(userId: string, currentStatus: string) {
    try {
      const newStatus = currentStatus === 'active' ? 'disabled' : 'active'
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await res.json()
      if (data.success) {
        await fetchUsers()
      } else {
        alert(data.error || '操作失败')
      }
    } catch (error) {
      console.error('更新用户状态失败:', error)
      alert('操作失败')
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-title-large font-title">用户管理</h1>
      </div>

      <AdminCard>
        <div className="flex gap-4 mb-6">
          <Input
            placeholder="搜索用户..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />
          <select
            className="input"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">全部状态</option>
            <option value="active">启用</option>
            <option value="disabled">禁用</option>
          </select>
          <AdminButton onClick={fetchUsers}>搜索</AdminButton>
        </div>

        {loading ? (
          <div className="text-center py-12">加载中...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-medium">
                  <th className="text-left py-3 px-4 text-body font-medium">邮箱</th>
                  <th className="text-left py-3 px-4 text-body font-medium">姓名</th>
                  <th className="text-left py-3 px-4 text-body font-medium">电话</th>
                  <th className="text-left py-3 px-4 text-body font-medium">状态</th>
                  <th className="text-left py-3 px-4 text-body font-medium">注册时间</th>
                  <th className="text-left py-3 px-4 text-body font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-neutral-medium">
                    <td className="py-3 px-4 text-body">{user.email}</td>
                    <td className="py-3 px-4 text-body">{user.name || '-'}</td>
                    <td className="py-3 px-4 text-body">{user.phone || '-'}</td>
                    <td className="py-3 px-4 text-body">
                      <span className={user.status === 'active' ? 'text-green-600' : 'text-red-600'}>
                        {user.status === 'active' ? '启用' : '禁用'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-body text-caption">
                      {new Date(user.createdAt).toLocaleDateString('zh-CN')}
                    </td>
                    <td className="py-3 px-4">
                      <AdminButton
                        variant={user.status === 'active' ? 'danger' : 'primary'}
                        onClick={() => toggleUserStatus(user.id, user.status)}
                      >
                        {user.status === 'active' ? '禁用' : '启用'}
                      </AdminButton>
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

