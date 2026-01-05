# 新功能快速测试指南

## 准备工作

1. ✅ 数据库迁移已完成
2. ✅ Prisma Client已生成
3. ✅ 所有API已创建

## 测试步骤

### 一、测试管理员为用户充值

#### 使用Postman/Thunder Client测试

```bash
POST http://localhost:3000/api/admin/wallet/recharge
```

**Headers:**
```
Cookie: token=<管理员token>
Content-Type: application/json
```

**Body:**
```json
{
  "userId": "用户ID",
  "amount": 100,
  "description": "测试充值"
}
```

**预期结果:**
```json
{
  "success": true,
  "data": {
    "wallet": {
      "balance": 100.00
    },
    "transaction": {
      "type": "RECHARGE",
      "amount": 100.00,
      "status": "completed"
    }
  },
  "message": "充值成功"
}
```

---

### 二、测试优惠券系统

#### 1. 创建优惠券（管理员）

```bash
POST http://localhost:3000/api/admin/coupons
```

**Body - 固定金额优惠券:**
```json
{
  "code": "SAVE50",
  "name": "50元优惠券",
  "type": "fixed",
  "value": 50,
  "minAmount": 100,
  "totalCount": 100,
  "validFrom": "2026-01-01T00:00:00Z",
  "validTo": "2026-12-31T23:59:59Z",
  "description": "全场通用50元优惠券"
}
```

**Body - 百分比优惠券:**
```json
{
  "code": "DISCOUNT10",
  "name": "9折优惠券",
  "type": "percent",
  "value": 10,
  "minAmount": 200,
  "maxDiscount": 50,
  "totalCount": 100,
  "validFrom": "2026-01-01T00:00:00Z",
  "validTo": "2026-12-31T23:59:59Z",
  "description": "全场9折，最高减50元"
}
```

#### 2. 发放优惠券给用户

```bash
POST http://localhost:3000/api/admin/coupons/{优惠券ID}/distribute
```

**Body:**
```json
{
  "userIds": ["user-id-1", "user-id-2"]
}
```

#### 3. 用户查看优惠券

```bash
GET http://localhost:3000/api/client/coupons
```

**Headers:**
```
Cookie: token=<用户token>
```

#### 4. 使用优惠券下单

```bash
POST http://localhost:3000/api/client/orders
```

**Body:**
```json
{
  "addressId": "地址ID",
  "paymentMethod": "alipay",
  "selectedItemIds": ["cart-item-1"],
  "userCouponId": "用户优惠券ID"
}
```

**系统会自动:**
1. 验证优惠券有效性
2. 计算折扣金额
3. 标记优惠券为已使用
4. 更新优惠券使用次数

---

### 三、测试维修工单系统

#### 1. 设置最大维修次数（管理员）

```bash
POST http://localhost:3000/api/admin/settings
```

**Body:**
```json
{
  "key": "max_repair_count",
  "value": "3",
  "description": "每个订单最大维修次数"
}
```

#### 2. 用户创建维修工单

```bash
POST http://localhost:3000/api/client/repairs
```

**Headers:**
```
Cookie: token=<用户token>
```

**Body:**
```json
{
  "orderId": "已收货的订单ID",
  "productName": "iPhone 14 Pro",
  "issue": "屏幕出现黑点，影响使用体验",
  "images": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg"
  ]
}
```

**验证点:**
- ❌ 未收货订单会被拒绝
- ❌ 超过3次维修会被拒绝
- ✅ 符合条件的订单可以创建工单

#### 3. 用户查看维修工单列表

```bash
GET http://localhost:3000/api/client/repairs
```

#### 4. 管理员查看所有维修工单

```bash
GET http://localhost:3000/api/admin/repairs?status=pending
```

**状态筛选:**
- `pending` - 待处理
- `processing` - 处理中
- `completed` - 已完成
- `rejected` - 已拒绝

#### 5. 管理员处理维修工单

```bash
PATCH http://localhost:3000/api/admin/repairs/{工单ID}
```

**Body:**
```json
{
  "status": "processing",
  "adminReply": "我们已收到您的维修请求，正在安排维修",
  "solution": "将为您更换新的屏幕组件"
}
```

**完成维修:**
```json
{
  "status": "completed",
  "adminReply": "维修已完成",
  "solution": "已更换屏幕，问题已解决"
}
```

---

## 完整测试流程

### 场景1: 固定金额优惠券

1. 管理员创建50元优惠券（最低消费100元）
2. 管理员发放给用户A
3. 用户A购物车添加商品（总价120元）
4. 用户A下单时选择优惠券
5. **预期结果:**
   - originalAmount: 120
   - discountAmount: 50
   - totalAmount: 70

### 场景2: 百分比优惠券

1. 管理员创建10%优惠券（9折，最高减50元）
2. 管理员发放给用户B
3. 用户B购物车添加商品（总价600元）
4. 用户B下单时选择优惠券
5. **预期结果:**
   - originalAmount: 600
   - discountAmount: 50（600 * 10% = 60，但最高50）
   - totalAmount: 550

### 场景3: 维修工单限制

1. 设置最大维修次数为3
2. 用户对订单ORD123提交第1次维修 ✅
3. 用户对订单ORD123提交第2次维修 ✅
4. 用户对订单ORD123提交第3次维修 ✅
5. 用户对订单ORD123提交第4次维修 ❌
   - **错误:** "该订单已达到最大维修次数（3次）"

---

## 数据库检查

### 查看优惠券使用情况

```sql
SELECT 
  c.code,
  c.name,
  c.totalCount,
  c.usedCount,
  COUNT(uc.id) as distributed_count,
  COUNT(CASE WHEN uc.status = 'used' THEN 1 END) as actually_used
FROM coupons c
LEFT JOIN user_coupons uc ON c.id = uc.couponId
GROUP BY c.id;
```

### 查看订单优惠券使用

```sql
SELECT 
  o.orderNumber,
  o.originalAmount,
  o.discountAmount,
  o.totalAmount,
  c.code as coupon_code,
  c.name as coupon_name
FROM orders o
LEFT JOIN user_coupons uc ON o.id = uc.orderId
LEFT JOIN coupons c ON uc.couponId = c.id
WHERE o.discountAmount > 0;
```

### 查看维修工单统计

```sql
SELECT 
  o.orderNumber,
  COUNT(r.id) as repair_count
FROM orders o
LEFT JOIN repair_orders r ON o.id = r.orderId
GROUP BY o.id
HAVING COUNT(r.id) > 0
ORDER BY repair_count DESC;
```

---

## 常见问题排查

### 优惠券相关

**问题:** 优惠券无法使用
**检查清单:**
- [ ] 优惠券状态是否为 `active`
- [ ] 当前时间是否在有效期内
- [ ] 订单金额是否满足最低消费
- [ ] 优惠券是否已被使用
- [ ] 优惠券是否属于该用户

### 维修工单相关

**问题:** 无法创建维修工单
**检查清单:**
- [ ] 订单状态是否为 `delivered`
- [ ] 订单是否属于该用户
- [ ] 维修次数是否已达上限
- [ ] 系统设置是否正确配置

### 充值相关

**问题:** 充值失败
**检查清单:**
- [ ] 管理员权限是否正确
- [ ] 充值金额是否大于0
- [ ] 用户ID是否存在

---

## 下一步开发

### 必须开发的前端页面

#### 后台管理
1. **用户管理页面** - 添加充值按钮
2. **优惠券管理页面** - 创建、编辑、发放优惠券
3. **维修工单管理页面** - 查看和处理工单
4. **系统设置页面** - 配置维修次数等

#### 客户端
1. **我的优惠券页面** - 查看可用优惠券
2. **结账页面** - 添加优惠券选择器
3. **订单详情页** - 添加"申请维修"按钮
4. **维修工单列表** - 查看维修记录
5. **创建维修工单页面** - 提交维修申请

---

## API路由清单

### 后台管理API

```
POST   /api/admin/wallet/recharge              # 为用户充值
GET    /api/admin/coupons                      # 优惠券列表
POST   /api/admin/coupons                      # 创建优惠券
GET    /api/admin/coupons/{id}                 # 优惠券详情
PATCH  /api/admin/coupons/{id}                 # 更新优惠券
DELETE /api/admin/coupons/{id}                 # 删除优惠券
POST   /api/admin/coupons/{id}/distribute      # 发放优惠券
GET    /api/admin/repairs                      # 维修工单列表
GET    /api/admin/repairs/{id}                 # 维修工单详情
PATCH  /api/admin/repairs/{id}                 # 处理维修工单
POST   /api/admin/settings                     # 更新系统设置
```

### 客户端API

```
GET    /api/client/coupons                     # 我的优惠券
POST   /api/client/orders                      # 创建订单（支持优惠券）
GET    /api/client/repairs                     # 我的维修工单
POST   /api/client/repairs                     # 创建维修工单
```

---

## 成功！

所有后端功能已完成，可以开始测试和前端开发了！🎉
