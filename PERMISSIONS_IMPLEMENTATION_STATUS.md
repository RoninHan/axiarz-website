# 权限控制实施状态

## 实施概览

已完成所有主要管理员API路由的权限控制实施。系统现在使用基于资源和操作的权限模型，提供细粒度的访问控制。

## 核心权限系统

### 已创建的核心文件

1. **lib/permissions.ts** - 权限检查核心逻辑
   - `hasPermission()` - 检查单个权限
   - `getAdminPermissions()` - 获取管理员所有权限
   - `canAccessMenu()` - 菜单访问控制
   - `MENU_PERMISSIONS` - 菜单权限映射

2. **lib/api-middleware.ts** - API权限中间件
   - `checkApiPermission()` - API权限验证
   - `checkAdminAuth()` - 管理员身份验证

3. **hooks/usePermissions.ts** - 前端权限Hook
   - React组件权限检查钩子
   - 用于UI元素的条件渲染

## 已实施权限控制的API路由

### ✅ 用户管理 (User Management)
- **GET** `/api/admin/users` - `user.read`
- **PATCH** `/api/admin/users/[id]` - `user.update`

### ✅ 产品管理 (Product Management)
- **GET** `/api/admin/products` - `product.read`
- **POST** `/api/admin/products` - `product.create`
- **GET** `/api/admin/products/[id]` - `product.read`
- **PATCH** `/api/admin/products/[id]` - `product.update`
- **DELETE** `/api/admin/products/[id]` - `product.delete`

### ✅ 分类管理 (Category Management)
- **GET** `/api/admin/categories` - `category.read`
- **POST** `/api/admin/categories` - `category.create`
- **GET** `/api/admin/categories/[id]` - `category.read`
- **PATCH** `/api/admin/categories/[id]` - `category.update`
- **DELETE** `/api/admin/categories/[id]` - `category.delete`

### ✅ 订单管理 (Order Management)
- **GET** `/api/admin/orders` - `order.read`
- **GET** `/api/admin/orders/[id]` - `order.read`
- **PATCH** `/api/admin/orders/[id]` - `order.update`

### ✅ 优惠券管理 (Coupon Management)
- **GET** `/api/admin/coupons` - `coupon.read`
- **POST** `/api/admin/coupons` - `coupon.create`
- **GET** `/api/admin/coupons/[id]` - `coupon.read`
- **PATCH** `/api/admin/coupons/[id]` - `coupon.update`
- **DELETE** `/api/admin/coupons/[id]` - `coupon.delete`

### ✅ 文件管理 (File Management)
- **GET** `/api/admin/files` - `file.read`
- **POST** `/api/admin/files` - `file.create`
- **GET** `/api/admin/files/[id]` - `file.read`
- **DELETE** `/api/admin/files/[id]` - `file.delete`

### ✅ 支付配置 (Payment Config)
- **GET** `/api/admin/payment-configs/[id]` - `payment.read`
- **PATCH** `/api/admin/payment-configs/[id]` - `payment.update`
- **DELETE** `/api/admin/payment-configs/[id]` - `payment.delete`

### ✅ 退款管理 (Refund Management)
- **PATCH** `/api/admin/refund-requests/[id]` - `refund.update`

### ✅ 系统管理 (System Management)
- **GET** `/api/admin/stats` - `system.read` (统计数据)
- **GET** `/api/admin/solutions` - `system.read` (解决方案列表)
- **POST** `/api/admin/solutions` - `system.create` (创建解决方案)
- **GET** `/api/admin/settings` - `system.read` (系统设置)
- **PUT** `/api/admin/settings` - `system.update` (更新设置)
- **POST** `/api/admin/settings` - `system.update` (批量更新)

## 权限资源映射

系统使用以下资源类型进行权限控制：

| 资源 (Resource) | 操作 (Actions) | 描述 |
|---------------|---------------|------|
| `user` | create, read, update, delete | 用户管理 |
| `admin` | create, read, update, delete, manage | 管理员管理 |
| `product` | create, read, update, delete | 产品管理 |
| `category` | create, read, update, delete | 分类管理 |
| `order` | create, read, update, delete | 订单管理 |
| `payment` | create, read, update, delete | 支付配置 |
| `coupon` | create, read, update, delete | 优惠券管理 |
| `repair` | create, read, update, delete | 维修管理 |
| `invoice` | create, read, update, delete | 发票管理 |
| `refund` | create, read, update, delete | 退款管理 |
| `file` | create, read, update, delete | 文件管理 |
| `system` | create, read, update, delete, manage | 系统设置 |
| `courier` | create, read, update, delete | 快递公司 |

## 菜单权限控制

### 已实施菜单权限过滤
- `components/admin/AdminSidebar.tsx` - 根据用户权限动态显示/隐藏菜单项
- 超级管理员可以看到所有菜单
- 普通管理员只能看到有权限的菜单

### 菜单路由权限映射
```typescript
const MENU_PERMISSIONS = {
  '/admin/users': { resource: 'user', action: 'read' },
  '/admin/admins': { resource: 'admin', action: 'read' },
  '/admin/products': { resource: 'product', action: 'read' },
  '/admin/categories': { resource: 'category', action: 'read' },
  '/admin/orders': { resource: 'order', action: 'read' },
  '/admin/coupons': { resource: 'coupon', action: 'read' },
  '/admin/files': { resource: 'file', action: 'read' },
  '/admin/payment-configs': { resource: 'payment', action: 'read' },
  '/admin/settings': { resource: 'system', action: 'manage' },
}
```

## 待完成的API路由

以下路由仍使用旧的认证模式，需要迁移到新的权限系统：

### ⏳ 需要更新的路由
- `/api/admin/coupons/[id]/distribute` - 优惠券分发
- `/api/admin/repairs` - 维修列表
- `/api/admin/repairs/[id]` - 维修详情
- `/api/admin/courier-companies` - 快递公司列表 (注意: schema中缺少此模型)
- `/api/admin/courier-companies/[id]` - 快递公司详情
- `/api/admin/invoices` - 发票列表 (注意: schema中缺少此模型)
- `/api/admin/invoices/[id]` - 发票详情
- `/api/admin/wallet/recharge` - 钱包充值
- `/api/admin/solutions/[id]` - 解决方案详情
- `/api/admin/help-articles` - 帮助文章

## 使用指南

### 在API路由中使用权限检查

```typescript
import { checkApiPermission } from '@/lib/api-middleware'

export async function GET(request: NextRequest) {
  // 检查权限
  const authCheck = await checkApiPermission(request, 'product', 'read')
  if (!authCheck.authorized) return authCheck.response!

  try {
    // 业务逻辑
    // 使用 authCheck.admin 访问当前管理员信息
    const products = await prisma.product.findMany()
    return successResponse(products)
  } catch (error) {
    return errorResponse('获取失败', 500)
  }
}
```

### 在前端组件中使用权限

```typescript
import { usePermissions } from '@/hooks/usePermissions'

export default function ProductPage() {
  const { hasPermission, isSuperAdmin } = usePermissions()

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

## 代码模式迁移

### 旧模式 (已弃用)
```typescript
const auth = getAuthFromRequest(request)
if (!auth || auth.type !== 'admin') {
  return errorResponse('未授权', 401)
}
// 使用 auth.id
```

### 新模式 (推荐)
```typescript
const authCheck = await checkApiPermission(request, 'resource', 'action')
if (!authCheck.authorized) return authCheck.response!
// 使用 authCheck.admin.id
```

## 注意事项

1. **超级管理员** (`super_admin` 角色) 自动拥有所有权限
2. **权限检查顺序**：先检查认证 → 检查超级管理员 → 检查具体权限
3. **菜单权限**：使用 `canAccessMenu()` 而不是 `hasPermission()` 来检查菜单访问
4. **资源命名**：确保使用正确的资源名称（参考上面的资源映射表）

## 相关文档

- **PERMISSIONS_GUIDE.md** - 详细使用指南
- **PERMISSIONS_COMPLETED.md** - 实施总结
- **ADMIN_MANAGEMENT.md** - 管理员系统文档
- **scripts/assign-role-permissions.ts** - 角色权限分配脚本

## 已知问题

1. **Schema缺失**: `courierCompany` 和 `invoice` 模型在 Prisma schema 中不存在
   - 需要在数据库schema中添加这些模型
   - 或者删除相关的API路由

2. **CSS警告**: `app/globals.css` 中的 Tailwind 指令警告
   - 这些是正常的Tailwind CSS语法，可以忽略

## 实施进度

- ✅ 核心权限系统: 100%
- ✅ 前端权限Hook: 100%
- ✅ 菜单权限过滤: 100%
- ✅ 主要API路由: ~85%
- ⏳ 次要API路由: ~50%

## 下一步行动

1. 更新剩余的API路由以使用新的权限系统
2. 添加缺失的Prisma模型或清理相关代码
3. 为不同角色创建权限模板
4. 添加单元测试验证权限逻辑
5. 更新前端页面以使用权限Hook进行UI控制

---
最后更新: 2024
状态: 核心功能已完成，次要功能进行中
