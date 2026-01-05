# 前端权限控制使用指南

## 概述

本系统提供了完整的前端权限控制方案，包括页面级权限、组件级权限和按钮级权限控制。

## 组件说明

### 1. PermissionGuard - 页面级权限保护

用于保护整个页面或页面的主要部分。

#### 使用方法

```tsx
import PermissionGuard from '@/components/admin/PermissionGuard'

export default function UsersPage() {
  return (
    <PermissionGuard resource="user" action="read">
      {/* 页面内容 */}
      <div>用户管理页面</div>
    </PermissionGuard>
  )
}
```

#### Props

| 参数 | 类型 | 默认值 | 说明 |
|-----|------|--------|------|
| resource | string | - | 资源名称（如 'user', 'product'） |
| action | string | 'read' | 操作类型（'create', 'read', 'update', 'delete', 'manage'） |
| requireSuperAdmin | boolean | false | 是否只允许超级管理员访问 |
| fallback | ReactNode | - | 无权限时显示的内容（默认显示403页面） |
| children | ReactNode | - | 有权限时显示的内容 |

#### 示例

```tsx
// 1. 基本使用 - 需要 user.read 权限
<PermissionGuard resource="user" action="read">
  <UserList />
</PermissionGuard>

// 2. 多个操作 - 需要 product.create 权限
<PermissionGuard resource="product" action="create">
  <CreateProductForm />
</PermissionGuard>

// 3. 超级管理员专属
<PermissionGuard requireSuperAdmin>
  <AdminManagementPage />
</PermissionGuard>

// 4. 自定义无权限提示
<PermissionGuard 
  resource="order" 
  action="update"
  fallback={<div>您没有编辑订单的权限</div>}
>
  <OrderEditForm />
</PermissionGuard>
```

### 2. PermissionButton - 按钮级权限控制

用于控制按钮或其他小组件的显示。

#### 使用方法

```tsx
import PermissionButton from '@/components/admin/PermissionButton'

export default function UserList() {
  return (
    <div>
      <PermissionButton resource="user" action="create">
        <Button type="primary">创建用户</Button>
      </PermissionButton>
      
      <PermissionButton resource="user" action="delete">
        <Button danger>删除用户</Button>
      </PermissionButton>
    </div>
  )
}
```

#### Props

| 参数 | 类型 | 默认值 | 说明 |
|-----|------|--------|------|
| resource | string | - | 资源名称 |
| action | string | 'read' | 操作类型 |
| requireSuperAdmin | boolean | false | 是否只允许超级管理员 |
| fallback | ReactNode | null | 无权限时显示的内容（默认不显示） |
| children | ReactNode | - | 有权限时显示的内容 |

#### 示例

```tsx
// 1. 创建按钮
<PermissionButton resource="product" action="create">
  <Button type="primary" icon={<PlusOutlined />}>
    创建产品
  </Button>
</PermissionButton>

// 2. 编辑按钮
<PermissionButton resource="product" action="update">
  <Button icon={<EditOutlined />}>编辑</Button>
</PermissionButton>

// 3. 删除按钮
<PermissionButton resource="product" action="delete">
  <Button danger icon={<DeleteOutlined />}>删除</Button>
</PermissionButton>

// 4. 超级管理员专属按钮
<PermissionButton requireSuperAdmin>
  <Button type="primary">管理员设置</Button>
</PermissionButton>

// 5. 无权限时显示禁用按钮
<PermissionButton 
  resource="order" 
  action="update"
  fallback={<Button disabled>编辑订单</Button>}
>
  <Button type="primary">编辑订单</Button>
</PermissionButton>
```

### 3. usePermissions Hook - 自定义权限检查

用于在组件中进行细粒度的权限检查。

#### 使用方法

```tsx
import { usePermissions } from '@/hooks/usePermissions'

export default function ProductPage() {
  const { 
    hasPermission, 
    hasAnyPermission, 
    hasAllPermissions, 
    isSuperAdmin, 
    canAccessMenu 
  } = usePermissions()

  return (
    <div>
      {hasPermission('product', 'create') && (
        <Button>创建产品</Button>
      )}
      
      {isSuperAdmin && (
        <Button>超级管理员功能</Button>
      )}
    </div>
  )
}
```

#### 返回值

| 函数 | 参数 | 返回值 | 说明 |
|-----|------|--------|------|
| hasPermission | (resource, action?) | boolean | 检查是否有指定权限 |
| hasAnyPermission | (permissions[]) | boolean | 检查是否有任一权限 |
| hasAllPermissions | (permissions[]) | boolean | 检查是否有所有权限 |
| isSuperAdmin | () | boolean | 是否是超级管理员 |
| canAccessMenu | (path) | boolean | 是否可以访问指定菜单 |

#### 示例

```tsx
const { hasPermission, isSuperAdmin, hasAnyPermission } = usePermissions()

// 1. 单个权限检查
if (hasPermission('product', 'create')) {
  showCreateButton()
}

// 2. 任一权限检查
if (hasAnyPermission([
  { resource: 'product', action: 'create' },
  { resource: 'product', action: 'update' }
])) {
  showEditInterface()
}

// 3. 超级管理员检查
if (isSuperAdmin) {
  showAdminPanel()
}

// 4. 条件渲染
return (
  <>
    {hasPermission('user', 'read') && <UserList />}
    {hasPermission('user', 'create') && <CreateUserButton />}
    {hasPermission('user', 'update') && <EditUserButton />}
    {hasPermission('user', 'delete') && <DeleteUserButton />}
  </>
)
```

## 完整页面示例

### 示例 1: 用户管理页面

```tsx
'use client'

import { useState } from 'react'
import { Button, Table } from 'antd'
import PermissionGuard from '@/components/admin/PermissionGuard'
import PermissionButton from '@/components/admin/PermissionButton'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'

export default function UsersPage() {
  const [users, setUsers] = useState([])

  return (
    <PermissionGuard resource="user" action="read">
      <div>
        <div style={{ marginBottom: 16 }}>
          <PermissionButton resource="user" action="create">
            <Button type="primary" icon={<PlusOutlined />}>
              创建用户
            </Button>
          </PermissionButton>
        </div>

        <Table
          dataSource={users}
          columns={[
            { title: 'ID', dataIndex: 'id' },
            { title: '邮箱', dataIndex: 'email' },
            { title: '姓名', dataIndex: 'name' },
            {
              title: '操作',
              render: (_, record) => (
                <Space>
                  <PermissionButton resource="user" action="update">
                    <Button icon={<EditOutlined />}>编辑</Button>
                  </PermissionButton>
                  
                  <PermissionButton resource="user" action="delete">
                    <Button danger icon={<DeleteOutlined />}>删除</Button>
                  </PermissionButton>
                </Space>
              ),
            },
          ]}
        />
      </div>
    </PermissionGuard>
  )
}
```

### 示例 2: 产品管理页面

```tsx
'use client'

import { usePermissions } from '@/hooks/usePermissions'
import PermissionGuard from '@/components/admin/PermissionGuard'
import PermissionButton from '@/components/admin/PermissionButton'

export default function ProductsPage() {
  const { hasPermission, isSuperAdmin } = usePermissions()

  return (
    <PermissionGuard resource="product" action="read">
      <div>
        <h1>产品管理</h1>
        
        {/* 使用 PermissionButton 控制按钮显示 */}
        <PermissionButton resource="product" action="create">
          <Button type="primary">创建产品</Button>
        </PermissionButton>

        {/* 使用 Hook 进行条件渲染 */}
        {hasPermission('product', 'update') && (
          <Button>批量编辑</Button>
        )}

        {/* 超级管理员专属功能 */}
        {isSuperAdmin && (
          <Button danger>危险操作</Button>
        )}
      </div>
    </PermissionGuard>
  )
}
```

### 示例 3: 管理员管理页面（仅超级管理员）

```tsx
'use client'

import PermissionGuard from '@/components/admin/PermissionGuard'

export default function AdminsPage() {
  return (
    <PermissionGuard requireSuperAdmin>
      <div>
        <h1>管理员管理</h1>
        <p>此页面仅限超级管理员访问</p>
      </div>
    </PermissionGuard>
  )
}
```

## 资源和操作列表

### 资源类型 (Resources)

| 资源 | 说明 |
|-----|------|
| user | 用户管理 |
| admin | 管理员管理 |
| product | 产品管理 |
| category | 分类管理 |
| order | 订单管理 |
| payment | 支付配置 |
| coupon | 优惠券管理 |
| repair | 维修管理 |
| invoice | 发票管理 |
| refund | 退款管理 |
| file | 文件管理 |
| system | 系统设置 |
| courier | 快递公司 |

### 操作类型 (Actions)

| 操作 | 说明 |
|-----|------|
| create | 创建 |
| read | 读取/查看 |
| update | 更新/编辑 |
| delete | 删除 |
| manage | 完全管理（包含所有操作） |

## 最佳实践

1. **页面级保护**: 在页面组件的最外层使用 `PermissionGuard`
2. **按钮级控制**: 对创建、编辑、删除等操作按钮使用 `PermissionButton`
3. **细粒度控制**: 在需要复杂逻辑判断时使用 `usePermissions` Hook
4. **超级管理员**: 使用 `requireSuperAdmin` 属性保护敏感功能
5. **用户体验**: 对于无权限的功能，建议隐藏而不是禁用，以提供更好的用户体验

## 注意事项

1. 前端权限控制主要用于UI展示，**不能替代后端权限验证**
2. 所有API路由都必须使用 `checkApiPermission` 进行后端权限检查
3. 超级管理员 (`super_admin`) 自动拥有所有权限
4. 权限检查是异步的，组件会在验证权限时显示加载状态
5. 确保所有需要权限的页面都包裹在 `PermissionGuard` 中

## 调试技巧

1. 检查当前用户权限:
```tsx
const { hasPermission } = usePermissions()
console.log('Has user.read:', hasPermission('user', 'read'))
```

2. 查看用户信息和权限:
```bash
# 在浏览器控制台执行
fetch('/api/auth/me').then(r => r.json()).then(console.log)
```

3. 临时禁用权限检查（仅用于开发）:
```tsx
// 注释掉权限检查
// <PermissionGuard resource="user" action="read">
  <YourComponent />
// </PermissionGuard>
```
