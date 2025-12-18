# 邮件服务配置说明

## 功能概述

已实现完整的邮件服务配置和管理功能，支持多种邮件服务提供商。

## 文件结构

### 后台管理页面
- `/app/admin/email-settings/page.tsx` - 邮件配置管理页面

### API路由
- `/app/api/admin/email-settings/route.ts` - 保存/读取邮件配置
- `/app/api/admin/email-settings/test/route.ts` - 发送测试邮件

### 核心库
- `/lib/email.ts` - 邮件发送核心功能

### 更新的文件
- `/app/api/auth/forgot-password/route.ts` - 集成邮件发送
- `/components/admin/AdminSidebar.tsx` - 添加邮件配置菜单

## 支持的邮件服务提供商

### 1. SMTP（通用）
支持所有标准SMTP服务，包括：
- Gmail
- Outlook / Hotmail
- QQ邮箱
- 163邮箱
- 企业邮箱等

### 2. SendGrid
专业的邮件发送服务，提供高送达率和详细的分析。

### 3. AWS SES
Amazon Simple Email Service，适合大规模邮件发送。

## 功能特性

### 安全性
- ✅ 敏感信息（密码、API Key）使用AES-256-CBC加密存储
- ✅ 加密密钥可通过环境变量配置
- ✅ 仅管理员可访问配置页面
- ✅ 密码字段使用密码输入框隐藏

### 配置管理
- ✅ 支持多种邮件服务商
- ✅ 统一的配置界面
- ✅ 配置存储在数据库中（Setting表）
- ✅ 启用/禁用邮件服务开关
- ✅ 发件人信息配置

### 测试功能
- ✅ 发送测试邮件验证配置
- ✅ 精美的HTML邮件模板
- ✅ 实时反馈发送结果

### 用户体验
- ✅ 现代化UI设计
- ✅ 常用邮件服务商配置参考
- ✅ 详细的配置说明
- ✅ 表单验证

## 使用指南

### 1. 访问配置页面
登录管理后台 → 侧边栏点击"邮件配置"

### 2. 配置SMTP（以Gmail为例）

#### 步骤1：启用两步验证
1. 访问 Google 账号设置
2. 安全 → 两步验证 → 启用

#### 步骤2：生成应用专用密码
1. 安全 → 应用专用密码
2. 选择"邮件"和设备
3. 生成并复制密码

#### 步骤3：填写配置
```
邮件服务提供商: SMTP（通用）
SMTP服务器: smtp.gmail.com
端口: 587
使用SSL/TLS: 关闭（TLS）或 465端口+开启（SSL）
用户名: your-email@gmail.com
密码: 应用专用密码
发件人邮箱: your-email@gmail.com
发件人名称: Axiarz
```

### 3. 配置QQ邮箱

#### 步骤1：开启SMTP服务
1. 登录QQ邮箱
2. 设置 → 账户 → POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV服务
3. 开启"POP3/SMTP服务"
4. 获取授权码

#### 步骤2：填写配置
```
邮件服务提供商: SMTP（通用）
SMTP服务器: smtp.qq.com
端口: 587 或 465
使用SSL/TLS: 开启（465端口）
用户名: your-qq@qq.com
密码: 授权码（不是QQ密码）
发件人邮箱: your-qq@qq.com
发件人名称: Axiarz
```

### 4. 配置SendGrid

#### 步骤1：注册并获取API Key
1. 注册 [SendGrid](https://sendgrid.com) 账号
2. Settings → API Keys
3. Create API Key
4. 选择"Full Access"
5. 复制API Key

#### 步骤2：填写配置
```
邮件服务提供商: SendGrid
API Key: SG.xxxxxxxxxxxxx
发件人邮箱: noreply@yourdomain.com
发件人名称: Axiarz
```

#### 步骤3：验证发件人
在SendGrid后台验证发件人邮箱或域名。

### 5. 配置AWS SES

#### 步骤1：创建IAM用户
1. AWS Console → IAM → Users → Add User
2. 设置访问类型为"Programmatic access"
3. 附加策略: AmazonSESFullAccess
4. 保存 Access Key ID 和 Secret Access Key

#### 步骤2：验证邮箱/域名
1. AWS Console → SES → Verified identities
2. 添加并验证发件人邮箱或域名

#### 步骤3：填写配置
```
邮件服务提供商: AWS SES
AWS区域: us-east-1（或您的区域）
Access Key ID: AKIA...
Secret Access Key: xxxxx
发件人邮箱: noreply@yourdomain.com
发件人名称: Axiarz
```

## 测试邮件

### 发送测试
1. 在配置页面底部"测试邮箱地址"字段输入邮箱
2. 点击"发送测试"按钮
3. 检查收件箱（及垃圾邮件文件夹）

### 测试邮件内容
- 精美的HTML模板
- 包含公司Logo和品牌色
- 响应式设计
- 纯文本备用版本

## 邮件模板

### 重置密码邮件
自动在用户请求重置密码时发送，包含：
- 个性化问候
- 重置密码按钮（带链接）
- 备用文本链接
- 安全提示
- 过期时间说明

### 自定义邮件模板
在 `/lib/email.ts` 中使用 `sendEmail()` 函数：

```typescript
import { sendEmail } from '@/lib/email'

await sendEmail({
  to: 'user@example.com',
  subject: '订单确认',
  html: `
    <h2>订单已确认</h2>
    <p>您的订单 #12345 已确认...</p>
  `,
  text: '订单已确认\n\n您的订单 #12345 已确认...'
})
```

## 环境变量

### 可选配置
在 `.env` 文件中添加：

```env
# 邮件配置加密密钥（32字符）
EMAIL_ENCRYPTION_KEY=your-32-character-encryption-key

# 应用URL（用于重置密码链接）
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# SendGrid（可选，推荐在配置页面设置）
SENDGRID_API_KEY=SG.xxxxx

# AWS SES（可选，推荐在配置页面设置）
AWS_SES_REGION=us-east-1
AWS_SES_ACCESS_KEY_ID=AKIA...
AWS_SES_SECRET_ACCESS_KEY=xxxxx
```

## 数据库

### Setting表结构
邮件配置存储在 `settings` 表中：
```
key: 'email_config'
value: JSON字符串（加密敏感信息）
description: '邮件服务配置'
```

## API使用

### 获取配置
```typescript
GET /api/admin/email-settings
Authorization: Bearer <admin-token>
```

### 保存配置
```typescript
POST /api/admin/email-settings
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "provider": "smtp",
  "smtpHost": "smtp.gmail.com",
  "smtpPort": 587,
  "smtpUser": "your-email@gmail.com",
  "smtpPassword": "your-password",
  "smtpSecure": false,
  "fromEmail": "noreply@yourdomain.com",
  "fromName": "Axiarz",
  "enabled": true
}
```

### 发送测试邮件
```typescript
POST /api/admin/email-settings/test
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "email": "test@example.com"
}
```

## 安全建议

### 生产环境
1. ✅ 设置强加密密钥（32字符随机字符串）
2. ✅ 使用专用邮件账号，不使用个人邮箱
3. ✅ 定期轮换API密钥
4. ✅ 启用邮件服务商的安全功能（SPF、DKIM、DMARC）
5. ✅ 监控邮件发送量和失败率
6. ✅ 实施发送频率限制

### Gmail特别说明
- 必须启用两步验证
- 使用应用专用密码，不使用账号密码
- 注意每日发送限制（免费账号：500封/天）

### SendGrid优势
- 高送达率
- 详细的发送统计
- 免费套餐：100封/天
- 不需要复杂配置

## 故障排查

### 常见问题

#### 1. "Authentication failed"
- 检查用户名和密码是否正确
- Gmail需要使用应用专用密码
- QQ/163需要使用授权码

#### 2. "Connection timeout"
- 检查SMTP服务器地址和端口
- 检查网络防火墙设置
- 尝试切换TLS/SSL设置

#### 3. "Certificate error"
- 465端口需要启用SSL
- 587端口使用TLS（不启用SSL）

#### 4. SendGrid "Unauthorized"
- 检查API Key是否正确
- 确认API Key有发送权限
- 验证发件人邮箱

#### 5. "Recipient not verified" (AWS SES)
- 沙盒模式下只能发送到已验证的邮箱
- 申请移出沙盒模式

### 调试模式
在开发环境下，邮件发送错误会详细记录在控制台。

## 邮件模板定制

### 修改重置密码邮件
编辑 `/lib/email.ts` 中的 `sendPasswordResetEmail` 函数：

```typescript
export async function sendPasswordResetEmail(
  email: string,
  resetToken: string
): Promise<EmailResult> {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`

  return sendEmail({
    to: email,
    subject: '重置密码',
    html: `
      <!-- 自定义HTML模板 -->
    `,
    text: `
      <!-- 纯文本版本 -->
    `
  })
}
```

### 添加新邮件类型
在 `/lib/email.ts` 中添加新函数：

```typescript
// 订单确认邮件
export async function sendOrderConfirmationEmail(
  email: string,
  orderNumber: string
): Promise<EmailResult> {
  return sendEmail({
    to: email,
    subject: `订单确认 - ${orderNumber}`,
    html: `<!-- HTML内容 -->`,
    text: `<!-- 纯文本内容 -->`
  })
}
```

## 性能优化

### 建议
1. 使用后台任务队列处理邮件发送
2. 实施发送速率限制
3. 缓存邮件配置（减少数据库查询）
4. 使用邮件服务商的批量发送API
5. 监控发送失败并重试

## 下一步

### 计划功能
- [ ] 邮件模板管理界面
- [ ] 邮件发送历史记录
- [ ] 邮件发送统计
- [ ] 邮件队列和重试机制
- [ ] 订单通知邮件
- [ ] 欢迎邮件
- [ ] 营销邮件功能

## 测试清单

管理员功能：
- [ ] 访问邮件配置页面
- [ ] 配置SMTP服务
- [ ] 保存配置
- [ ] 发送测试邮件
- [ ] 切换不同的邮件服务商
- [ ] 启用/禁用邮件服务

用户功能：
- [ ] 请求重置密码
- [ ] 收到重置密码邮件
- [ ] 邮件中的链接可点击
- [ ] 使用链接重置密码成功

## 技术栈

- **Nodemailer** - SMTP邮件发送
- **SendGrid** - 专业邮件服务（可选）
- **AWS SDK** - AWS SES集成（可选）
- **Crypto** - 配置加密
- **Ant Design** - UI组件库
- **Prisma** - 数据库ORM
