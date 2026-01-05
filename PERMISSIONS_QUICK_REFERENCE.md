# 权限控制快速参考

## 🎯 常用权限资源

| 资源 | 说明 |
|-----|------|
| user | 用户 |
| product | 产品 |
| category | 分类 |
| order | 订单 |
| coupon | 优惠券 |
| file | 文件 |
| payment | 支付 |
| refund | 退款 |
| system | 系统 |

## 🔧 后端API权限

### 基本模式
```typescript
import { checkApiPermission } from '@/lib/api-middleware'

export async function GET(request: NextRequest) {
  const authCheck = await checkApiPermission(request, 'resource', 'action')
  if (!authCheck.authorized) return authCheck.response!
  
  // 使用 authCheck.admin.id
  const data = await getData()
  return successResponse(data)
}
```

### 常用操作
```typescript
// 读取
checkApiPermission(request, 'product', 'read')

// 创建
checkApiPermission(request, 'product', 'create')

// 更新
checkApiPermission(request, 'product', 'update')

// 删除
checkApiPermission(request, 'product', 'delete')

// 完全管理
checkApiPermission(request, 'system', 'manage')
```

## 🎨 前端权限控制

### 1. 页面保护
```tsx
import PermissionGuard from '@/components/admin/PermissionGuard'

<PermissionGuard resource="product" action="read">
  <YourPage />
</PermissionGuard>
```

### 2. 按钮控制
```tsx
import PermissionButton from '@/components/admin/PermissionButton'

<PermissionButton resource="product" action="create">
  <Button>创建</Button>
</PermissionButton>
```

### 3. Hook使用
```tsx
import { usePermissions } from '@/hooks/usePermissions'

const { hasPermission, isSuperAdmin } = usePermissions()

if (hasPermission('product', 'create')) {
  // 显示创建按钮
}

if (isSuperAdmin) {
  // 显示管理员功能
}
```

## 🔑 超级管理员

### 仅超级管理员访问
```tsx
<PermissionGuard requireSuperAdmin>
  <AdminPanel />
</PermissionGuard>

<PermissionButton requireSuperAdmin>
  <Button>管理员设置</Button>
</PermissionButton>
```

## 📋 完整示例

### 页面示例
```tsx
'use client'
import PermissionGuard from '@/components/admin/PermissionGuard'
import PermissionButton from '@/components/admin/PermissionButton'

export default function ProductsPage() {
  return (
    <PermissionGuard resource="product" action="read">
      <div>
        <PermissionButton resource="product" action="create">
          <Button type="primary">创建产品</Button>
        </PermissionButton>
        
        <PermissionButton resource="product" action="update">
          <Button>编辑</Button>
        </PermissionButton>
        
        <PermissionButton resource="product" action="delete">
          <Button danger>删除</Button>
        </PermissionButton>
      </div>
    </PermissionGuard>
  )
}
```

### API示例
```typescript
import { NextRequest } from 'next/server'
import { checkApiPermission } from '@/lib/api-middleware'
import { successResponse, errorResponse } from '@/lib/api-utils'
import { prisma } from '@/lib/prisma'

// 获取列表
export async function GET(request: NextRequest) {
  const authCheck = await checkApiPermission(request, 'product', 'read')
  if (!authCheck.authorized) return authCheck.response!

  const products = await prisma.product.findMany()
  return successResponse(products)
}

// 创建
export async function POST(request: NextRequest) {
  const authCheck = await checkApiPermission(request, 'product', 'create')
  if (!authCheck.authorized) return authCheck.response!

  const data = await request.json()
  const product = await prisma.product.create({ data })
  return successResponse(product)
}

// 更新
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authCheck = await checkApiPermission(request, 'product', 'update')
  if (!authCheck.authorized) return authCheck.response!

  const data = await request.json()
  const product = await prisma.product.update({
    where: { id: params.id },
    data
  })
  return successResponse(product)
}

// 删除
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authCheck = await checkApiPermission(request, 'product', 'delete')
  if (!authCheck.authorized) return authCheck.response!

  await prisma.product.delete({ where: { id: params.id } })
  return successResponse(null, '删除成功')
}
```

## ⚠️ 注意事项

1. **后端验证必须**: 前端权限仅用于UI，不能替代后端验证
2. **使用authCheck.admin**: 替代旧的 `auth.id`，使用 `authCheck.admin.id`
3. **超级管理员**: `super_admin` 角色自动拥有所有权限
4. **更新imports**: 
   - ✅ `import { checkApiPermission } from '@/lib/api-middleware'`
   - ❌ `import { getAuthFromRequest } from '@/lib/api-utils'`

## 📖 完整文档

- [后端权限指南](./PERMISSIONS_GUIDE.md)
- [前端权限指南](./FRONTEND_PERMISSIONS_GUIDE.md)
- [完整实施报告](./PERMISSIONS_COMPLETE_REPORT.md)
