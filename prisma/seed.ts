import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('开始初始化数据库...')

  // 创建初始管理员账号
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@axiarz.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456'
  const adminName = process.env.ADMIN_NAME || 'Super Admin'

  const hashedPassword = await bcrypt.hash(adminPassword, 10)

  // 检查管理员是否已存在
  const existingAdmin = await prisma.admin.findUnique({
    where: { email: adminEmail },
  })

  if (!existingAdmin) {
    const admin = await prisma.admin.create({
      data: {
        email: adminEmail,
        name: adminName,
        password: hashedPassword,
        role: 'super_admin',
        status: 'active',
      },
    })
    console.log('✅ 创建初始管理员账号:', admin.email)
  } else {
    console.log('ℹ️  管理员账号已存在:', adminEmail)
  }

  // 创建默认权限
  const permissions = [
    { name: 'user:read', description: '查看用户', resource: 'user', action: 'read' },
    { name: 'user:manage', description: '管理用户', resource: 'user', action: 'manage' },
    { name: 'product:read', description: '查看产品', resource: 'product', action: 'read' },
    { name: 'product:manage', description: '管理产品', resource: 'product', action: 'manage' },
    { name: 'order:read', description: '查看订单', resource: 'order', action: 'read' },
    { name: 'order:manage', description: '管理订单', resource: 'order', action: 'manage' },
    { name: 'payment:manage', description: '管理支付配置', resource: 'payment', action: 'manage' },
    { name: 'system:manage', description: '系统管理', resource: 'system', action: 'manage' },
  ]

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: perm,
    })
  }
  console.log('✅ 创建默认权限')

  // 为超级管理员分配所有权限
  const superAdmin = await prisma.admin.findUnique({
    where: { email: adminEmail },
  })

  if (superAdmin) {
    const allPermissions = await prisma.permission.findMany()
    for (const perm of allPermissions) {
      await prisma.adminPermission.upsert({
        where: {
          adminId_permissionId: {
            adminId: superAdmin.id,
            permissionId: perm.id,
          },
        },
        update: {},
        create: {
          adminId: superAdmin.id,
          permissionId: perm.id,
        },
      })
    }
    console.log('✅ 为超级管理员分配所有权限')
  }

  // 创建默认支付配置（未启用状态）
  const paymentConfigs = [
    {
      name: 'alipay',
      displayName: '支付宝',
      enabled: false,
      sortOrder: 1,
      config: {
        appId: '',
        privateKey: '',
        publicKey: '',
        gateway: 'https://openapi.alipay.com/gateway.do',
      },
    },
    {
      name: 'wechat',
      displayName: '微信支付',
      enabled: false,
      sortOrder: 2,
      config: {
        appId: '',
        mchId: '',
        apiKey: '',
        notifyUrl: '',
      },
    },
    {
      name: 'paypal',
      displayName: 'PayPal',
      enabled: false,
      sortOrder: 3,
      config: {
        clientId: '',
        clientSecret: '',
        mode: 'sandbox', // sandbox or live
      },
    },
  ]

  for (const config of paymentConfigs) {
    await prisma.paymentConfig.upsert({
      where: { name: config.name },
      update: {},
      create: config,
    })
  }
  console.log('✅ 创建默认支付配置')

  // 创建默认分类
  const defaultCategories = [
    { name: '电子产品', description: '各类电子科技产品', sortOrder: 1 },
    { name: '智能设备', description: '智能家居和智能设备', sortOrder: 2 },
    { name: '配件', description: '各类配件和周边产品', sortOrder: 3 },
  ]

  const categoryMap: Record<string, string> = {}
  for (const cat of defaultCategories) {
    const existing = await prisma.category.findUnique({
      where: { name: cat.name },
    })
    if (!existing) {
      const created = await prisma.category.create({
        data: cat,
      })
      categoryMap[cat.name] = created.id
    } else {
      categoryMap[cat.name] = existing.id
    }
  }
  console.log('✅ 创建默认分类')

  // 创建示例产品（如果不存在）
  const sampleProducts = [
    {
      name: '科技产品 A',
      description: '这是一款高性能的科技产品，采用最新技术，性能卓越。',
      price: 999.00,
      stock: 100,
      image: '/images/product-1.jpg',
      images: ['/images/product-1.jpg', '/images/product-1-2.jpg'],
      categoryId: categoryMap['电子产品'],
      status: 'active',
      featured: true,
    },
    {
      name: '科技产品 B',
      description: '创新设计，智能便捷，满足您的各种需求。',
      price: 1299.00,
      stock: 50,
      image: '/images/product-2.jpg',
      images: ['/images/product-2.jpg'],
      categoryId: categoryMap['智能设备'],
      status: 'active',
      featured: true,
    },
    {
      name: '科技产品 C',
      description: '高品质材料，精湛工艺，值得信赖。',
      price: 799.00,
      stock: 80,
      image: '/images/product-3.jpg',
      images: ['/images/product-3.jpg'],
      categoryId: categoryMap['配件'],
      status: 'active',
      featured: false,
    },
  ]

  for (const product of sampleProducts) {
    const existing = await prisma.product.findFirst({
      where: { name: product.name },
    })
    if (!existing) {
      await prisma.product.create({
        data: product,
      })
    }
  }
  console.log('✅ 创建示例产品')

  // 创建默认系统设置
  const defaultSettings = [
    {
      key: 'logo',
      value: '',
    },
    {
      key: 'companyName',
      value: 'Axiarz',
    },
    {
      key: 'heroImage',
      value: '',
    },
    {
      key: 'brandAdvantages',
      value: [
        {
          icon: '✓',
          title: '高品质',
          description: '采用优质材料，精湛工艺，确保每一件产品都达到最高标准。',
          sortOrder: 1,
        },
        {
          icon: '⚡',
          title: '高性能',
          description: '采用最新技术，性能卓越，满足您的各种需求。',
          sortOrder: 2,
        },
        {
          icon: '❤',
          title: '值得信赖',
          description: '完善的售后服务，专业的客户支持，让您购买无忧。',
          sortOrder: 3,
        },
      ],
    },
    {
      key: 'testimonials',
      value: [
        {
          name: '张先生',
          avatar: '',
          rating: 5,
          content: '产品质量非常好，性能卓越，完全超出预期。售后服务也很到位，值得推荐！',
          sortOrder: 1,
        },
        {
          name: '李女士',
          avatar: '',
          rating: 5,
          content: '这是我买过最满意的产品，设计精美，功能强大，使用体验极佳！',
          sortOrder: 2,
        },
        {
          name: '王先生',
          avatar: '',
          rating: 5,
          content: '性价比很高，客服服务态度好，发货速度快，包装也很仔细。',
          sortOrder: 3,
        },
      ],
    },
  ]

  for (const setting of defaultSettings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    })
  }
  console.log('✅ 创建默认系统设置')

  console.log('🎉 数据库初始化完成！')
}

main()
  .catch((e) => {
    console.error('❌ 数据库初始化失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

