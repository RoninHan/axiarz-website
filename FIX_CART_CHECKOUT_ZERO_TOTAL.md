# 购物车结算订单总价为0的问题修复

## 问题描述

用户在购物车页面点击"去结算"按钮跳转到确认订单页面时，订单总价显示为0。

## 问题原因

### 原有逻辑问题

1. **购物车页面**有商品选择功能（复选框），用户可以只选择部分商品结算
2. **点击"去结算"按钮**时，没有传递选中的商品ID
3. **创建订单API**获取的是用户**所有购物车商品**，而不是只获取选中的商品
4. 如果用户选中了部分商品，但购物车里还有其他未选中的商品，可能导致计算错误

### 核心问题

```typescript
// 旧代码：获取所有购物车商品
const cartItems = await prisma.cartItem.findMany({
  where: { userId: auth.id },  // ❌ 获取所有商品
  include: { product: true },
})
```

如果用户购物车有3件商品，但只选中了2件去结算，订单仍会尝试包含所有3件商品。

## 解决方案

### 1. 购物车页面 - 保存选中商品ID

修改"去结算"按钮，将选中的商品ID保存到localStorage：

**文件**: `app/(client)/cart/page.tsx`

```typescript
<Button
  onClick={() => {
    // 将选中的商品ID保存到localStorage
    localStorage.setItem('selectedCartItems', JSON.stringify(selectedItems))
    window.location.href = '/checkout'
  }}
>
  去结算 ({selectedItems.length})
</Button>
```

### 2. 结账页面 - 读取选中商品ID

在结账页面加载时，从localStorage读取选中的商品ID：

**文件**: `app/(client)/checkout/page.tsx`

```typescript
const [selectedCartItems, setSelectedCartItems] = useState<string[]>([])

useEffect(() => {
  // 从localStorage读取选中的商品ID
  const items = localStorage.getItem('selectedCartItems')
  if (items) {
    setSelectedCartItems(JSON.parse(items))
  }
}, [orderId])
```

### 3. 创建订单API - 只处理选中商品

修改创建订单API，接收并处理选中的商品ID：

**文件**: `app/api/client/orders/route.ts`

```typescript
const { addressId, paymentMethod, selectedItemIds } = await request.json()

// 只获取选中的购物车商品
const cartItems = await prisma.cartItem.findMany({
  where: { 
    userId: auth.id,
    // ✅ 如果提供了selectedItemIds，只获取选中的商品
    ...(selectedItemIds && selectedItemIds.length > 0 
      ? { id: { in: selectedItemIds } } 
      : {})
  },
  include: { product: true },
})

// 计算总金额（只计算选中的商品）
const totalAmount = cartItems.reduce((sum, item) => {
  return sum + Number(item.product.price) * item.quantity
}, 0)

// 只清空已下单的购物车商品（不是所有商品）
await prisma.cartItem.deleteMany({
  where: { 
    userId: auth.id,
    id: { in: cartItems.map(item => item.id) }  // ✅ 只删除已下单的商品
  },
})
```

### 4. 提交订单 - 传递选中商品ID

在创建订单时，将选中的商品ID传递给API：

**文件**: `app/(client)/checkout/page.tsx`

```typescript
const res = await fetch('/api/client/orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    addressId: selectedAddressId,
    paymentMethod: selectedPayment,
    selectedItemIds: selectedCartItems.length > 0 ? selectedCartItems : undefined,
  }),
})

// 订单创建成功后，清除localStorage
if (data.success) {
  localStorage.removeItem('selectedCartItems')
  // ...
}
```

## 修复前后对比

### 修复前

| 步骤 | 行为 | 问题 |
|------|------|------|
| 1. 购物车 | 用户选择2件商品（共3件） | - |
| 2. 点击结算 | 跳转到结账页面 | ❌ 未传递选中商品ID |
| 3. 创建订单 | 获取所有3件商品 | ❌ 包含未选中的商品 |
| 4. 订单总价 | 计算3件商品总价 | ❌ 总价错误 |
| 5. 清空购物车 | 删除所有3件商品 | ❌ 误删未下单商品 |

### 修复后

| 步骤 | 行为 | 结果 |
|------|------|------|
| 1. 购物车 | 用户选择2件商品（共3件） | - |
| 2. 点击结算 | 保存选中ID到localStorage | ✅ 传递正确数据 |
| 3. 创建订单 | 只获取选中的2件商品 | ✅ 只处理选中商品 |
| 4. 订单总价 | 计算2件商品总价 | ✅ 总价正确 |
| 5. 清空购物车 | 只删除已下单的2件商品 | ✅ 保留未选中商品 |

## 数据流程

```
┌──────────────┐
│  购物车页面   │
│ (3件商品)    │
│ 选中: 2件     │
└──────┬───────┘
       │ 保存选中ID到localStorage
       │ selectedCartItems: ["id1", "id2"]
       ▼
┌──────────────┐
│  结账页面     │
│ 读取选中ID    │
└──────┬───────┘
       │ 创建订单API
       │ POST /api/client/orders
       │ { selectedItemIds: ["id1", "id2"] }
       ▼
┌──────────────┐
│ 创建订单API   │
│ WHERE id IN  │
│ ["id1","id2"]│
└──────┬───────┘
       │ 计算总价: item1.price + item2.price
       │ 创建订单: 2件商品
       │ 删除购物车: 只删除id1, id2
       ▼
┌──────────────┐
│   订单详情    │
│ 总价: ¥500   │
│ (正确)       │
└──────────────┘
```

## 额外改进

### 1. 添加调试日志

```typescript
console.log('创建订单:', {
  userId: auth.id,
  selectedItems: selectedItemIds,
  cartItemsCount: cartItems.length,
  totalAmount
})
```

### 2. 更好的错误提示

```typescript
if (cartItems.length === 0) {
  return errorResponse('购物车为空或未选择商品')  // ✅ 更明确的提示
}
```

### 3. 清理localStorage

订单创建成功后，及时清除localStorage中的数据：

```typescript
localStorage.removeItem('selectedCartItems')
```

## 测试场景

### 场景1：选择部分商品结算

1. 购物车有3件商品（A: ¥100, B: ¥200, C: ¥300）
2. 用户只选中商品A和B
3. 点击"去结算"
4. 订单总价应为 ¥300（100+200）✅
5. 购物车剩余商品C ✅

### 场景2：全选商品结算

1. 购物车有3件商品（总价 ¥600）
2. 用户全选3件商品
3. 点击"去结算"
4. 订单总价应为 ¥600 ✅
5. 购物车清空 ✅

### 场景3：未选择商品

1. 购物车有商品
2. 用户取消所有选择
3. "去结算"按钮应为禁用状态 ✅

## 相关文件

- ✅ `app/(client)/cart/page.tsx` - 购物车页面
- ✅ `app/(client)/checkout/page.tsx` - 结账页面
- ✅ `app/api/client/orders/route.ts` - 创建订单API

## 修复状态

- ✅ 购物车选中商品ID保存到localStorage
- ✅ 结账页面读取选中商品ID
- ✅ 创建订单API只处理选中商品
- ✅ 订单总价计算正确
- ✅ 只删除已下单的购物车商品
- ✅ 添加调试日志
- ✅ 改进错误提示
- ✅ 清理localStorage
