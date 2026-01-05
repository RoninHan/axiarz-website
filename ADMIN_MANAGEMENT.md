# 管理员用户管理系统

## 概述

本系统实现了完整的管理员用户管理和权限授权功能，支持超级管理员为普通管理员分配功能权限。

## 角色层级

系统支持5种管理员角色，分为3个层级：

### 第一级（超级管理员）
- **super_admin (超级管理员)**: 拥有系统所有权限，可以管理其他管理员和分配权限

### 第二级（普通管理员）
- **admin (普通管理员)**: 需要由超级管理员授权特定功能权限

### 第三级（专业角色）
- **sales (销售)**: 销售相关功能权限
- **support (售后)**: 售后服务相关功能权限
- **service (客服)**: 客服相关功能权限

## 主要功能

### 1. 管理员列表 (`/admin/admins`)

**功能特性：**
- 查看所有管理员信息（姓名、邮箱、角色、状态、权限数量、创建时间）
- 仅超级管理员可以访问
- 角色标签颜色区分：
  - 红色：超级管理员
  - 蓝色：普通管理员
  - 绿色：销售
  - 橙色：售后
  - 紫色：客服
- 显示角色层级（一级、二级、三级）

**操作功能：**
- ✅ 创建新管理员
- ✅ 编辑管理员信息（姓名、邮箱、角色）
- ✅ 切换管理员状态（启用/禁用）
- ✅ 删除管理员（保护：不能删除自己和超级管理员）
- ✅ 管理权限（跳转到权限配置页面）

### 2. 权限管理 (`/admin/admins/[id]/permissions`)

**功能特性：**
- 按资源分组显示所有权限
- 支持全选/取消全选某个资源的所有权限
- 显示半选状态（部分权限被选中）
- 实时显示已分配权限数量
- 不能修改超级管理员的权限

**支持的权限资源：**
- 用户管理 (user)
- 管理员管理 (admin)
- 商品管理 (product)
- 分类管理 (category)
- 订单管理 (order)
- 支付管理 (payment)
- 优惠券管理 (coupon)
- 维修管理 (repair)
- 发票管理 (invoice)
- 退款管理 (refund)
- 文件管理 (file)
- 系统设置 (system)
- 物流管理 (courier)

**权限操作类型：**
- create: 创建
- read: 查看
- update: 编辑
- delete: 删除
- manage: 完全管理

## API 端点

### 管理员管理
- `GET /api/admin/admins` - 获取管理员列表
- `POST /api/admin/admins` - 创建新管理员
- `GET /api/admin/admins/[id]` - 获取管理员详情
- `PATCH /api/admin/admins/[id]` - 更新管理员信息
- `DELETE /api/admin/admins/[id]` - 删除管理员

### 权限管理
- `GET /api/admin/permissions` - 获取所有权限列表
- `PUT /api/admin/admins/[id]/permissions` - 更新管理员权限

## 安全控制

### 访问控制
- ✅ 所有管理员管理功能仅限超级管理员访问
- ✅ API层面验证super_admin角色
- ✅ UI层面隐藏非授权操作

### 数据保护
- ✅ 不能删除自己的账号
- ✅ 不能删除超级管理员账号
- ✅ 不能禁用自己的账号
- ✅ 不能修改超级管理员的权限
- ✅ 不能将超级管理员降级为其他角色
- ✅ 密码使用bcrypt加密存储

### 数据验证
- ✅ 邮箱唯一性检查
- ✅ 必填字段验证
- ✅ 角色合法性验证

## 数据库架构

### Admin 表
```prisma
model Admin {
  id          String   @id @default(uuid())
  name        String
  email       String   @unique
  password    String
  role        String   @default("admin") 
              // super_admin(超级管理员), admin(普通管理员), 
              // sales(销售), support(售后), service(客服)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  permissions AdminPermission[]
  files       File[]
}
```

### Permission 表
```prisma
model Permission {
  id          String   @id @default(uuid())
  name        String   @unique
  description String?
  resource    String   // user, product, order, payment, system, etc.
  action      String   // create, read, update, delete, manage
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  admins AdminPermission[]
}
```

### AdminPermission 表（关联表）
```prisma
model AdminPermission {
  id           String   @id @default(uuid())
  adminId      String
  permissionId String
  createdAt    DateTime @default(now())

  admin      Admin      @relation(fields: [adminId], references: [id], onDelete: Cascade)
  permission Permission @relation(fields: [permissionId], references: [id], onDelete: Cascade)
}
```

## 初始化

### 权限数据初始化
运行以下命令初始化43个基础权限：

```bash
npx tsx prisma/seed-permissions.ts
```

这将创建所有资源和操作的权限组合。

## 导航集成

管理员管理已添加到后台侧边栏菜单：
- 位置：用户管理之后
- 图标：TeamOutlined
- 标签：管理员管理
- 路径：/admin/admins

## 使用流程

### 创建管理员
1. 超级管理员登录系统
2. 点击侧边栏"管理员管理"
3. 点击"添加管理员"按钮
4. 填写信息：
   - 姓名
   - 邮箱（唯一）
   - 密码
   - 角色（admin/sales/support/service）
5. 点击"提交"创建

### 分配权限
1. 在管理员列表中点击"权限管理"按钮
2. 查看按资源分组的权限列表
3. 勾选需要授予的权限
   - 可以点击资源名称全选该资源的所有权限
   - 可以单独勾选某个具体操作
4. 点击"保存权限"

### 管理管理员
- **编辑**：修改姓名、邮箱、角色
- **启用/禁用**：通过状态开关快速切换
- **删除**：永久删除管理员账号（会同时删除其权限关联）

## 注意事项

1. 超级管理员（super_admin）：
   - 拥有所有权限，无需单独分配
   - 不能被删除
   - 不能被禁用
   - 不能修改权限
   - 不能降级角色

2. 权限继承：
   - 权限通过AdminPermission表显式授予
   - 没有隐式继承关系
   - 每个管理员的权限独立管理

3. 密码安全：
   - 使用bcrypt加密（成本因子：10）
   - 创建时必须提供密码
   - 编辑时不显示密码字段（如需修改密码需单独功能）

## 后续优化建议

- [ ] 添加批量操作（批量启用/禁用/删除）
- [ ] 添加权限模板（预设常用权限组合）
- [ ] 添加操作日志（记录管理员操作历史）
- [ ] 添加密码修改功能
- [ ] 添加管理员活动状态追踪
- [ ] 添加权限使用统计
- [ ] 添加角色权限预设（不同角色的默认权限）

## 完成状态

✅ 数据模型设计  
✅ 管理员列表页面  
✅ 权限管理页面  
✅ 管理员CRUD API  
✅ 权限查询和分配API  
✅ 权限数据初始化脚本  
✅ 侧边栏菜单集成  
✅ 角色显示和层级标识  
✅ 安全控制和数据验证  
