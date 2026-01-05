# 新功能说明文档

## 功能概述

本次更新新增三个主要功能：
1. **后台管理员为用户充值**
2. **优惠券管理系统**
3. **维修工单系统**

---

## 一、后台管理员为用户充值

### 功能描述
管理员可以在后台直接为用户钱包充值，无需用户通过支付网关。

### API接口

**POST** `/api/admin/wallet/recharge`

**请求参数:**
```json
{
  "userId": "用户ID",
  "amount": 100.00,
  "description": "管理员充值备注"
}
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "wallet": {
      "id": "xxx",
      "userId": "xxx",
      "balance": 1100.00,
      "frozen": 0
    },
    "transaction": {
      "id": "xxx",
      "type": "RECHARGE",
      "amount": 100.00,
      "balance": 1100.00,
      "description": "管理员充值 ¥100",
      "status": "completed"
    }
  },
  "message": "充值成功"
}
```

### 业务逻辑
1. 验证管理员权限
2. 验证充值金额 > 0
3. 获取或创建用户钱包
4. 更新钱包余额
5. 创建交易记录（type: RECHARGE, status: completed）

---

## 二、优惠券管理系统

### 数据库模型

#### Coupon（优惠券模板）
```prisma
model Coupon {
  id          String   @id @default(uuid())
  code        String   @unique        // 优惠券代码
  name        String                  // 优惠券名称
  type        String                  // fixed(固定金额), percent(百分比)
  value       Decimal                 // 折扣值
  minAmount   Decimal  @default(0)    // 最低消费金额
  maxDiscount Decimal?                // 最大折扣金额（百分比优惠券用）
  totalCount  Int                     // 总发放数量
  usedCount   Int      @default(0)    // 已使用数量
  validFrom   DateTime                // 有效期开始
  validTo     DateTime                // 有效期结束
  status      String   @default("active") // active, inactive
  description String?                 // 优惠券描述
}
```

#### UserCoupon（用户优惠券）
```prisma
model UserCoupon {
  id        String    @id @default(uuid())
  userId    String
  couponId  String
  orderId   String?   @unique           // 使用的订单ID
  status    String    @default("unused") // unused, used, expired
  usedAt    DateTime?                   // 使用时间
}
```

### API接口

#### 1. 后台管理

**GET** `/api/admin/coupons` - 获取所有优惠券
**POST** `/api/admin/coupons` - 创建优惠券

创建优惠券参数:
```json
{
  "code": "NEWUSER50",
  "name": "新用户50元优惠券",
  "type": "fixed",           // 或 "percent"
  "value": 50,               // 固定金额50元 或 百分比10（表示10%）
  "minAmount": 100,          // 最低消费100元
  "maxDiscount": 100,        // 百分比优惠券最大折扣100元（可选）
  "totalCount": 1000,        // 发放1000张
  "validFrom": "2026-01-01T00:00:00Z",
  "validTo": "2026-12-31T23:59:59Z",
  "description": "新用户专享，全场通用"
}
```

**GET** `/api/admin/coupons/{id}` - 获取单个优惠券详情
**PATCH** `/api/admin/coupons/{id}` - 更新优惠券
**DELETE** `/api/admin/coupons/{id}` - 删除优惠券

**POST** `/api/admin/coupons/{id}/distribute` - 发放优惠券给用户

发放参数:
```json
{
  "userIds": ["user-id-1", "user-id-2", "user-id-3"]
}
```

#### 2. 客户端

**GET** `/api/client/coupons?status=unused` - 获取用户的优惠券列表

状态筛选:
- `unused` - 未使用
- `used` - 已使用
- `expired` - 已过期

响应示例:
```json
{
  "success": true,
  "data": [
    {
      "id": "user-coupon-id",
      "userId": "xxx",
      "status": "unused",
      "coupon": {
        "code": "NEWUSER50",
        "name": "新用户50元优惠券",
        "type": "fixed",
        "value": 50,
        "minAmount": 100,
        "validFrom": "2026-01-01T00:00:00Z",
        "validTo": "2026-12-31T23:59:59Z",
        "description": "新用户专享，全场通用"
      }
    }
  ]
}
```

### 优惠券类型

#### 1. 固定金额优惠券 (type: fixed)
- `value`: 直接减免的金额
- 例如: value=50 表示减免50元

#### 2. 百分比优惠券 (type: percent)
- `value`: 折扣百分比
- `maxDiscount`: 最大折扣金额（可选）
- 例如: value=10, maxDiscount=50 表示打9折，最多减免50元

### 使用流程

1. **管理员创建优惠券模板**
   - 设置优惠券代码、名称、类型、折扣值
   - 设置使用条件（最低消费金额）
   - 设置发放数量和有效期

2. **管理员发放优惠券**
   - 选择优惠券
   - 选择目标用户
   - 批量发放

3. **用户查看优惠券**
   - 在个人中心查看可用优惠券
   - 系统自动标记过期优惠券

4. **用户使用优惠券**
   - 下单时选择可用优惠券
   - 系统验证优惠券有效性
   - 计算折扣金额
   - 订单创建成功后，优惠券状态变为"已使用"

### 订单模型变更

```prisma
model Order {
  originalAmount Decimal?  // 原始金额（使用优惠券前）
  discountAmount Decimal?  // 优惠金额
  couponId       String?   // 使用的优惠券ID
  totalAmount    Decimal   // 最终支付金额
  // ...
  userCoupon     UserCoupon?
}
```

### 折扣计算逻辑

```typescript
// 固定金额
if (coupon.type === 'fixed') {
  discountAmount = coupon.value  // 直接减免
}

// 百分比折扣
if (coupon.type === 'percent') {
  discountAmount = originalAmount * coupon.value / 100
  
  // 如果有最大折扣限制
  if (coupon.maxDiscount) {
    discountAmount = Math.min(discountAmount, coupon.maxDiscount)
  }
}

// 最终支付金额
totalAmount = Math.max(0, originalAmount - discountAmount)
```

---

## 三、维修工单系统

### 功能描述
用户可以对已收货的订单提交维修工单，管理员处理维修请求。每个订单的维修次数有限制（默认3次，可后台设置）。

### 数据库模型

#### RepairOrder（维修工单）
```prisma
model RepairOrder {
  id            String    @id @default(uuid())
  userId        String
  orderId       String                      // 关联的订单ID
  orderNumber   String    @unique           // 维修工单号
  productName   String                      // 产品名称
  issue         String                      // 问题描述
  images        String[]  @default([])      // 问题图片
  status        String    @default("pending") // pending, processing, completed, rejected
  adminReply    String?                     // 管理员回复
  solution      String?                     // 解决方案
  completedAt   DateTime?                   // 完成时间
}
```

#### SystemSetting（系统设置）
```prisma
model SystemSetting {
  id          String   @id @default(uuid())
  key         String   @unique
  value       String                        // JSON格式
  description String?
}
```

**维修次数限制设置:**
- key: `max_repair_count`
- value: `3` (默认值)

### API接口

#### 1. 客户端

**GET** `/api/client/repairs` - 获取用户的维修工单列表

响应示例:
```json
{
  "success": true,
  "data": [
    {
      "id": "repair-id",
      "userId": "xxx",
      "orderId": "xxx",
      "orderNumber": "REP1704441234ABCD",
      "productName": "iPhone 14 Pro",
      "issue": "屏幕出现黑点",
      "images": ["image-url-1", "image-url-2"],
      "status": "pending",
      "adminReply": null,
      "solution": null,
      "order": {
        "orderNumber": "ORD1704123456789",
        "createdAt": "2026-01-01T00:00:00Z"
      },
      "createdAt": "2026-01-04T00:00:00Z"
    }
  ]
}
```

**POST** `/api/client/repairs` - 创建维修工单

请求参数:
```json
{
  "orderId": "订单ID",
  "productName": "iPhone 14 Pro",
  "issue": "屏幕出现黑点，影响使用",
  "images": ["image-url-1", "image-url-2"]
}
```

**验证规则:**
1. 订单必须存在且属于该用户
2. 订单状态必须是 `delivered`（已收货）
3. 订单维修次数不能超过系统设置的最大次数

#### 2. 后台管理

**GET** `/api/admin/repairs?status=pending` - 获取所有维修工单

状态筛选:
- `pending` - 待处理
- `processing` - 处理中
- `completed` - 已完成
- `rejected` - 已拒绝

**GET** `/api/admin/repairs/{id}` - 获取单个维修工单详情

**PATCH** `/api/admin/repairs/{id}` - 更新维修工单状态

更新参数:
```json
{
  "status": "processing",
  "adminReply": "我们已收到您的维修请求，正在安排处理",
  "solution": "将为您更换新的屏幕"
}
```

当status更新为 `completed` 时，系统会自动设置 `completedAt` 时间。

### 维修工单状态

| 状态 | 说明 |
|------|------|
| pending | 待处理 - 用户刚提交，等待管理员处理 |
| processing | 处理中 - 管理员已开始处理 |
| completed | 已完成 - 维修已完成 |
| rejected | 已拒绝 - 不符合维修条件，管理员拒绝 |

### 业务流程

```
用户提交维修工单
    ↓
系统验证
 - 订单状态必须是已收货
 - 维修次数未超限
    ↓
创建工单（status: pending）
    ↓
管理员查看工单
    ↓
管理员更新状态为"处理中"
添加回复和解决方案
    ↓
维修完成，更新状态为"已完成"
设置completedAt时间
```

### 限制说明

**每个订单的维修次数限制:**
- 默认: 3次
- 可通过系统设置修改
- 超过限制后无法继续提交维修工单

**示例:**
```
订单 ORD123 已提交 2 次维修
用户再次提交 → 成功（第3次）

订单 ORD456 已提交 3 次维修
用户再次提交 → 失败（超过限制）
错误信息: "该订单已达到最大维修次数（3次）"
```

---

## 系统设置管理

### 可配置项

**维修次数限制:**
```typescript
// POST /api/admin/settings
{
  "key": "max_repair_count",
  "value": "3",
  "description": "每个订单最大维修次数"
}
```

**其他可扩展设置:**
- 优惠券相关限制
- 充值相关规则
- 等等...

---

## 数据库迁移

已完成的数据库变更:
```bash
npx prisma db push
npx prisma generate
```

新增表:
- ✅ `coupons` - 优惠券模板
- ✅ `user_coupons` - 用户优惠券
- ✅ `repair_orders` - 维修工单
- ✅ `system_settings` - 系统设置

Order表新增字段:
- ✅ `originalAmount` - 原始金额
- ✅ `discountAmount` - 优惠金额
- ✅ `couponId` - 使用的优惠券ID

User表新增关系:
- ✅ `coupons` - 用户优惠券
- ✅ `repairOrders` - 维修工单

---

## API权限说明

### 管理员权限 (type: 'admin')
- ✅ 为用户充值
- ✅ 创建/编辑/删除优惠券
- ✅ 发放优惠券
- ✅ 查看所有维修工单
- ✅ 处理维修工单
- ✅ 修改系统设置

### 用户权限 (type: 'user')
- ✅ 查看自己的优惠券
- ✅ 使用优惠券下单
- ✅ 创建维修工单
- ✅ 查看自己的维修工单

---

## 下一步开发建议

### 前端页面开发

1. **后台管理页面**
   - [ ] 用户钱包管理页面（充值功能）
   - [ ] 优惠券管理页面（创建、发放、查看）
   - [ ] 维修工单管理页面（查看、处理）
   - [ ] 系统设置页面（维修次数等配置）

2. **客户端页面**
   - [ ] 我的优惠券页面
   - [ ] 结账时选择优惠券
   - [ ] 订单详情添加"申请维修"按钮
   - [ ] 维修工单列表页面
   - [ ] 创建维修工单表单

### 功能增强

1. **优惠券**
   - [ ] 优惠券兑换码功能
   - [ ] 优惠券分享功能
   - [ ] 优惠券使用统计
   - [ ] 自动发放优惠券（注册、生日等）

2. **维修工单**
   - [ ] 维修进度跟踪
   - [ ] 邮件/短信通知
   - [ ] 维修评价功能
   - [ ] 维修费用功能

3. **通用**
   - [ ] 操作日志记录
   - [ ] 数据统计报表
   - [ ] 导出功能

---

## 测试建议

### 优惠券测试用例

1. 创建固定金额优惠券（50元）
2. 创建百分比优惠券（10%，最高50元）
3. 发放给测试用户
4. 测试订单金额不满足最低消费
5. 测试优惠券过期
6. 测试优惠券已使用
7. 测试折扣计算准确性

### 维修工单测试用例

1. 测试未收货订单无法申请维修
2. 测试订单维修次数限制
3. 测试管理员处理流程
4. 测试状态流转
5. 测试修改系统设置（维修次数）

---

## API文件清单

### 已创建的API文件

**管理员API:**
- ✅ `app/api/admin/wallet/recharge/route.ts` - 为用户充值
- ✅ `app/api/admin/coupons/route.ts` - 优惠券列表和创建
- ✅ `app/api/admin/coupons/[id]/route.ts` - 优惠券详情/编辑/删除
- ✅ `app/api/admin/coupons/[id]/distribute/route.ts` - 发放优惠券
- ✅ `app/api/admin/repairs/route.ts` - 维修工单列表
- ✅ `app/api/admin/repairs/[id]/route.ts` - 维修工单详情和处理

**客户端API:**
- ✅ `app/api/client/coupons/route.ts` - 用户优惠券列表
- ✅ `app/api/client/repairs/route.ts` - 用户维修工单列表和创建
- ✅ `app/api/client/orders/route.ts` - 已修改，支持优惠券

**系统设置:**
- ✅ `app/api/admin/settings/route.ts` - 系统设置管理（已存在）

---

## 注意事项

1. **数据一致性**: 使用事务确保优惠券使用、订单创建、库存扣减的原子性
2. **优惠券验证**: 严格验证优惠券的有效性、归属、使用状态
3. **维修限制**: 确保维修次数限制在系统设置可调
4. **权限控制**: 所有API都有严格的权限验证
5. **错误处理**: 提供清晰的错误信息给用户

---

## 总结

本次更新实现了三个核心功能，为电商系统增加了更完善的用户服务能力：

1. **充值功能** - 方便管理员为用户补偿或奖励
2. **优惠券系统** - 支持营销活动，提升用户转化
3. **维修工单** - 完善售后服务，提升用户满意度

所有功能都已完成API开发，数据库迁移已完成，下一步需要开发前端页面。
