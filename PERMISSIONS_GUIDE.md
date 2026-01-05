# 权限控制系统使用指南

## 概述

本系统实现了基于角色和权限的访问控制（RBAC），支持细粒度的功能权限管理。

## 权限结构

### 权限组成
每个权限由两部分组成：
- **resource**: 资源名称（如 `user`, `product`, `order`）
- **action**: 操作类型（`create`, `read`, `update`, `delete`, `manage`）

### 特殊权限
- `manage`: 完全管理权限，包含该资源的所有操作
- 超级管理员（`super_admin`）：拥有所有权限，无需单独分配

## 后端 API 权限控制

### 方法 1: 使用权限中间件（推荐）

```typescript
import { checkApiPermission } from '@/lib/api-middleware'

export async function GET(req: NextRequest) {
  // 检查权限
  const authCheck = await checkApiPermission(req, 'user', 'read')
  if (!authCheck.authorized) {
    return authCheck.response! // 返回 401 或 403 错误
  }

  // authCheck.admin 包含当前登录的管理员信息
  const { admin } = authCheck

  // 继续处理业务逻辑
  // ...
}
```

### 方法 2: 仅验证登录（超级管理员专属功能）

```typescript
import { checkAdminAuth } from '@/lib/api-middleware'

export async function GET(req: NextRequest) {
  // 仅限超级管理员访问
  const authCheck = await checkAdminAuth(req, 'super_admin')
  if (!authCheck.authorized) {
    return authCheck.response!
  }

  // 继续处理
  // ...
}
```

### 方法 3: 手动检查权限

```typescript
import { verifyAdmin } from '@/lib/auth'
import { hasPermission } from '@/lib/permissions'

export async function POST(req: NextRequest) {
  const admin = await verifyAdmin(req)
  if (!admin) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }

  const canCreate = await hasPermission(admin.id, 'product', 'create')
  if (!canCreate) {
    return NextResponse.json({ error: '无权限' }, { status: 403 })
  }

  // 继续处理
  // ...
}
```

## 前端权限控制

### 使用 Hook

```typescript
import { usePermissions } from '@/hooks/usePermissions'

export default function ProductPage() {
  const { hasPermission, isSuperAdmin, loading } = usePermissions()

  if (loading) return <div>加载中...</div>

  // 检查单个权限
  const canCreate = hasPermission('product', 'create')
  const canUpdate = hasPermission('product', 'update')

  return (
    <div>
      {canCreate && (
        <Button onClick={handleCreate}>创建商品</Button>
      )}
      
      {canUpdate && (
        <Button onClick={handleEdit}>编辑</Button>
      )}

      {isSuperAdmin() && (
        <Button danger>危险操作（仅超管）</Button>
      )}
    </div>
  )
}
```

### 菜单显示/隐藏

侧边栏组件 `AdminSidebar.tsx` 已自动根据权限过滤菜单项：

```typescript
const hasMenuPermission = (resource: string, action: string = 'read'): boolean => {
  if (!currentUser) return false
  if (currentUser.role === 'super_admin') return true
  
  return currentUser.permissions?.some(
    p => p.resource === resource && (p.action === action || p.action === 'manage')
  ) || false
}

const menuItems = [
  { 
    key: '/admin/users', 
    label: '用户管理', 
    icon: <UserOutlined />, 
    show: hasMenuPermission('user') 
  },
  // ...
].filter(item => item.show)
```

### 条件渲染按钮

```typescript
import { usePermissions } from '@/hooks/usePermissions'

export default function OrderList() {
  const { hasPermission } = usePermissions()

  const canUpdateOrder = hasPermission('order', 'update')
  const canDeleteOrder = hasPermission('order', 'delete')

  return (
    <Table
      dataSource={orders}
      columns={[
        // ...其他列
        {
          title: '操作',
          render: (_, record) => (
            <Space>
              {canUpdateOrder && (
                <Button size="small" onClick={() => handleEdit(record)}>
                  编辑
                </Button>
              )}
              {canDeleteOrder && (
                <Button 
                  size="small" 
                  danger 
                  onClick={() => handleDelete(record.id)}
                >
                  删除
                </Button>
              )}
            </Space>
          )
        }
      ]}
    />
  )
}
```

## 权限配置

### 当前可用的资源和权限

| 资源 | 权限 | 说明 |
|-----|------|------|
| `user` | create, read, update, delete | 用户管理 |
| `admin` | create, read, update, delete, manage | 管理员管理 |
| `product` | create, read, update, delete | 商品管理 |
| `category` | create, read, update, delete | 分类管理 |
| `order` | create, read, update, delete | 订单管理 |
| `payment` | read, manage | 支付管理 |
| `coupon` | create, read, update, delete | 优惠券管理 |
| `repair` | read, update | 维修管理 |
| `invoice` | create, read, update, delete | 发票管理 |
| `refund` | read, update | 退款管理 |
| `file` | create, read, delete | 文件管理 |
| `system` | manage | 系统设置 |
| `courier` | create, read, update, delete | 物流管理 |

### 菜单与权限映射

| 菜单路径 | 所需权限 |
|---------|---------|
| `/admin` | 无（所有管理员可访问） |
| `/admin/users` | user.read |
| `/admin/admins` | 仅超级管理员 |
| `/admin/products` | product.read |
| `/admin/orders` | order.read |
| `/admin/coupons` | coupon.read |
| `/admin/settings` | system.manage |

## 实际应用示例

### 示例 1: 商品管理页面

```typescript
'use client'

import { useState, useEffect } from 'react'
import { Button, Table, Space, message } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { usePermissions } from '@/hooks/usePermissions'

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const { hasPermission, loading } = usePermissions()

  const canCreate = hasPermission('product', 'create')
  const canUpdate = hasPermission('product', 'update')
  const canDelete = hasPermission('product', 'delete')

  const fetchProducts = async () => {
    const res = await fetch('/api/admin/products')
    const data = await res.json()
    if (data.success) {
      setProducts(data.data)
    } else {
      message.error(data.error || '加载失败')
    }
  }

  useEffect(() => {
    if (!loading) {
      fetchProducts()
    }
  }, [loading])

  if (loading) return <div>加载中...</div>

  return (
    <div>
      <div className="mb-4">
        {canCreate && (
          <Button type="primary" icon={<PlusOutlined />}>
            创建商品
          </Button>
        )}
      </div>

      <Table
        dataSource={products}
        columns={[
          { title: '名称', dataIndex: 'name' },
          { title: '价格', dataIndex: 'price' },
          {
            title: '操作',
            render: (_, record) => (
              <Space>
                {canUpdate && (
                  <Button 
                    size="small" 
                    icon={<EditOutlined />}
                    onClick={() => handleEdit(record)}
                  >
                    编辑
                  </Button>
                )}
                {canDelete && (
                  <Button 
                    size="small" 
                    danger 
                    icon={<DeleteOutlined />}
                    onClick={() => handleDelete(record.id)}
                  >
                    删除
                  </Button>
                )}
              </Space>
            )
          }
        ]}
      />
    </div>
  )
}
```

### 示例 2: API 路由权限控制

```typescript
// app/api/admin/products/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkApiPermission } from '@/lib/api-middleware'

// 获取商品详情
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authCheck = await checkApiPermission(req, 'product', 'read')
  if (!authCheck.authorized) return authCheck.response!

  const product = await prisma.product.findUnique({
    where: { id: params.id }
  })

  return NextResponse.json({ success: true, data: product })
}

// 更新商品
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authCheck = await checkApiPermission(req, 'product', 'update')
  if (!authCheck.authorized) return authCheck.response!

  const data = await req.json()
  const product = await prisma.product.update({
    where: { id: params.id },
    data
  })

  return NextResponse.json({ success: true, data: product })
}

// 删除商品
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authCheck = await checkApiPermission(req, 'product', 'delete')
  if (!authCheck.authorized) return authCheck.response!

  await prisma.product.delete({
    where: { id: params.id }
  })

  return NextResponse.json({ success: true })
}
```

### 示例 3: 条件按钮组

```typescript
import { Space, Button } from 'antd'
import { usePermissions } from '@/hooks/usePermissions'

export default function OrderActions({ order }) {
  const { hasPermission } = usePermissions()

  const actions = [
    {
      label: '发货',
      permission: { resource: 'order', action: 'update' },
      onClick: () => handleShip(order.id),
      show: order.status === 'paid'
    },
    {
      label: '退款',
      permission: { resource: 'refund', action: 'update' },
      onClick: () => handleRefund(order.id),
      danger: true
    },
    {
      label: '取消',
      permission: { resource: 'order', action: 'delete' },
      onClick: () => handleCancel(order.id),
      danger: true
    }
  ]

  return (
    <Space>
      {actions
        .filter(action => 
          !action.show === false && 
          hasPermission(action.permission.resource, action.permission.action)
        )
        .map((action, index) => (
          <Button
            key={index}
            size="small"
            danger={action.danger}
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        ))
      }
    </Space>
  )
}
```

## 最佳实践

### 1. API 层面必须验证权限
不要仅依赖前端权限控制，API 必须验证权限。

❌ **错误示例**:
```typescript
export async function DELETE(req, { params }) {
  // 没有权限检查，任何人都可以删除！
  await prisma.product.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
```

✅ **正确示例**:
```typescript
export async function DELETE(req, { params }) {
  const authCheck = await checkApiPermission(req, 'product', 'delete')
  if (!authCheck.authorized) return authCheck.response!
  
  await prisma.product.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
```

### 2. 前端提供良好的用户体验
隐藏用户没有权限的功能，而不是显示后再提示无权限。

✅ **推荐做法**:
```typescript
{hasPermission('product', 'delete') && (
  <Button danger onClick={handleDelete}>删除</Button>
)}
```

### 3. 合理使用 `manage` 权限
如果某个角色需要对某个资源的所有操作权限，使用 `manage` 而不是分配多个权限。

### 4. 超级管理员例外
超级管理员自动拥有所有权限，无需在代码中特殊处理。

```typescript
// 不需要这样写
if (user.role === 'super_admin' || hasPermission('user', 'delete')) {
  // ...
}

// 直接检查权限即可（超管会自动通过）
if (hasPermission('user', 'delete')) {
  // ...
}
```

## 调试技巧

### 查看当前用户权限

在浏览器控制台：
```javascript
fetch('/api/auth/me')
  .then(r => r.json())
  .then(d => console.table(d.data.permissions))
```

### 测试特定权限

```typescript
import { hasPermission } from '@/lib/permissions'

// 在 API 路由中
const result = await hasPermission(adminId, 'product', 'create')
console.log('Has permission:', result)
```

## 常见问题

### Q: 为什么超级管理员也看不到某个菜单？
A: 检查菜单配置中的 `show` 属性，可能被硬编码为 `false` 或有其他条件限制。

### Q: API 返回 403 但前端显示了按钮？
A: 前端和后端权限检查不一致，确保使用相同的 resource 和 action 名称。

### Q: 如何给某个角色批量分配权限？
A: 在权限管理页面 (`/admin/admins/[id]/permissions`) 可以勾选整个资源的所有权限。

### Q: `manage` 权限和其他权限的区别？
A: `manage` 包含该资源的所有操作。如果有 `product.manage`，则自动拥有 `product.create/read/update/delete`。
