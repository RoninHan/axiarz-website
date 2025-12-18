# 密码重置功能说明

## 功能概述

已实现完整的密码重置功能，包括前端页面和后端API。

## 文件结构

### API路由
- `/app/api/auth/forgot-password/route.ts` - 发送重置密码链接
- `/app/api/auth/reset-password/route.ts` - 重置密码

### 前端页面
- `/app/(client)/forgot-password/page.tsx` - 忘记密码页面
- `/app/(client)/reset-password/page.tsx` - 重置密码页面

### 数据库
- 添加了 `resetToken` 和 `resetTokenExpiry` 字段到 User 模型
- 迁移文件：`20251216141614_add_password_reset_fields`

## 使用流程

### 1. 用户请求重置密码
- 访问 `/forgot-password` 页面
- 输入注册的邮箱地址
- 点击"发送重置链接"

### 2. 系统处理
- 验证邮箱是否存在（防止邮箱枚举攻击，始终返回成功消息）
- 生成随机令牌（32字节）
- 将令牌哈希后保存到数据库
- 设置令牌过期时间（1小时）
- **注意**：当前未集成邮件服务，开发环境下令牌会显示在控制台

### 3. 用户重置密码
- 访问 `/reset-password?token=<重置令牌>` 页面
- 输入新密码（至少6位）
- 确认新密码
- 点击"重置密码"

### 4. 系统验证
- 验证令牌是否有效且未过期
- 验证密码格式
- 更新密码（bcrypt加密）
- 清除重置令牌

## 功能特点

### 安全性
- ✅ 令牌使用 SHA-256 哈希存储
- ✅ 令牌有效期1小时
- ✅ 防止邮箱枚举攻击（统一返回消息）
- ✅ 密码使用 bcrypt 加密
- ✅ 使用后令牌自动失效

### 用户体验
- ✅ 现代化UI设计，与登录/注册页面风格一致
- ✅ 实时密码强度指示器
- ✅ 表单验证和错误提示
- ✅ 成功后自动跳转到登录页面
- ✅ 清晰的步骤说明和提示信息

### 页面特性
- ✅ 渐变背景和装饰元素
- ✅ 毛玻璃效果卡片
- ✅ 响应式设计
- ✅ 加载状态和禁用按钮
- ✅ Ant Design组件集成

## 待实现功能

### 邮件服务集成
需要集成邮件服务提供商（如 SendGrid、AWS SES、Nodemailer等）：

\`\`\`typescript
// 在 /app/api/auth/forgot-password/route.ts 中
const resetUrl = \`\${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=\${resetToken}\`

await sendEmail({
  to: email,
  subject: '重置密码',
  html: \`
    <h2>重置密码</h2>
    <p>您请求重置密码，请点击下面的链接：</p>
    <a href="\${resetUrl}">重置密码</a>
    <p>链接有效期为1小时。</p>
    <p>如果您没有请求重置密码，请忽略此邮件。</p>
  \`
})
\`\`\`

### 环境变量配置
需要在 `.env` 文件中添加：

\`\`\`
NEXT_PUBLIC_APP_URL=http://localhost:3000
# 邮件服务配置（根据选择的服务）
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-password
# 或使用 SendGrid
SENDGRID_API_KEY=your-api-key
\`\`\`

## 开发模式测试

在开发环境下，重置令牌会显示在：
1. 服务器控制台日志
2. API响应中（仅开发环境）
3. 浏览器Message提示（10秒）

可以手动构造重置链接进行测试：
\`\`\`
http://localhost:3000/reset-password?token=<令牌>
\`\`\`

## 使用示例

### 1. 测试忘记密码流程
\`\`\`bash
# 1. 访问忘记密码页面
http://localhost:3000/forgot-password

# 2. 输入邮箱：user@example.com
# 3. 查看控制台获取令牌
# 4. 访问重置页面：
http://localhost:3000/reset-password?token=<从控制台获取的令牌>

# 5. 输入新密码并确认
# 6. 成功后自动跳转到登录页面
\`\`\`

### 2. API调用示例
\`\`\`javascript
// 请求重置密码
const response = await fetch('/api/auth/forgot-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@example.com' })
})

// 重置密码
const response = await fetch('/api/auth/reset-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    token: 'reset-token-here',
    password: 'newPassword123' 
  })
})
\`\`\`

## 错误处理

### 常见错误
- ❌ "无效或已过期的重置令牌" - 令牌已使用或超过1小时
- ❌ "请输入有效的邮箱地址" - 邮箱格式不正确
- ❌ "密码长度至少6位" - 密码太短
- ❌ "两次输入的密码不一致" - 密码确认不匹配

## 安全建议

1. **生产环境配置**
   - 移除开发环境下的令牌显示
   - 配置实际的邮件服务
   - 使用HTTPS
   - 设置合理的令牌过期时间

2. **监控和日志**
   - 记录重置密码请求
   - 监控异常重置尝试
   - 实施速率限制

3. **用户通知**
   - 密码重置成功后发送确认邮件
   - 检测到可疑活动时通知用户

## 相关文件修改

- ✅ Prisma Schema - 添加重置令牌字段
- ✅ 数据库迁移 - 应用schema变更
- ✅ API路由 - 实现重置逻辑
- ✅ 前端页面 - 用户界面
- ✅ 登录页面 - 添加"忘记密码"链接

## 测试清单

- [ ] 输入不存在的邮箱（应显示成功消息）
- [ ] 输入有效邮箱并获取令牌
- [ ] 使用令牌重置密码
- [ ] 尝试使用过期令牌
- [ ] 尝试使用已使用的令牌
- [ ] 密码强度验证
- [ ] 密码确认匹配验证
- [ ] 成功重置后使用新密码登录
