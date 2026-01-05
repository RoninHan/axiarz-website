import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('开始初始化权限...')

  const permissions = [
    // 用户管理
    { name: 'user.create', resource: 'user', action: 'create', description: '创建用户' },
    { name: 'user.read', resource: 'user', action: 'read', description: '查看用户' },
    { name: 'user.update', resource: 'user', action: 'update', description: '编辑用户' },
    { name: 'user.delete', resource: 'user', action: 'delete', description: '删除用户' },

    // 管理员管理
    { name: 'admin.create', resource: 'admin', action: 'create', description: '创建管理员' },
    { name: 'admin.read', resource: 'admin', action: 'read', description: '查看管理员' },
    { name: 'admin.update', resource: 'admin', action: 'update', description: '编辑管理员' },
    { name: 'admin.delete', resource: 'admin', action: 'delete', description: '删除管理员' },
    { name: 'admin.manage', resource: 'admin', action: 'manage', description: '完全管理管理员' },

    // 商品管理
    { name: 'product.create', resource: 'product', action: 'create', description: '创建商品' },
    { name: 'product.read', resource: 'product', action: 'read', description: '查看商品' },
    { name: 'product.update', resource: 'product', action: 'update', description: '编辑商品' },
    { name: 'product.delete', resource: 'product', action: 'delete', description: '删除商品' },

    // 分类管理
    { name: 'category.create', resource: 'category', action: 'create', description: '创建分类' },
    { name: 'category.read', resource: 'category', action: 'read', description: '查看分类' },
    { name: 'category.update', resource: 'category', action: 'update', description: '编辑分类' },
    { name: 'category.delete', resource: 'category', action: 'delete', description: '删除分类' },

    // 订单管理
    { name: 'order.create', resource: 'order', action: 'create', description: '创建订单' },
    { name: 'order.read', resource: 'order', action: 'read', description: '查看订单' },
    { name: 'order.update', resource: 'order', action: 'update', description: '编辑订单' },
    { name: 'order.delete', resource: 'order', action: 'delete', description: '删除订单' },

    // 支付管理
    { name: 'payment.read', resource: 'payment', action: 'read', description: '查看支付信息' },
    { name: 'payment.manage', resource: 'payment', action: 'manage', description: '管理支付配置' },

    // 优惠券管理
    { name: 'coupon.create', resource: 'coupon', action: 'create', description: '创建优惠券' },
    { name: 'coupon.read', resource: 'coupon', action: 'read', description: '查看优惠券' },
    { name: 'coupon.update', resource: 'coupon', action: 'update', description: '编辑优惠券' },
    { name: 'coupon.delete', resource: 'coupon', action: 'delete', description: '删除优惠券' },

    // 维修管理
    { name: 'repair.read', resource: 'repair', action: 'read', description: '查看维修工单' },
    { name: 'repair.update', resource: 'repair', action: 'update', description: '处理维修工单' },

    // 发票管理
    { name: 'invoice.create', resource: 'invoice', action: 'create', description: '创建发票' },
    { name: 'invoice.read', resource: 'invoice', action: 'read', description: '查看发票' },
    { name: 'invoice.update', resource: 'invoice', action: 'update', description: '编辑发票' },
    { name: 'invoice.delete', resource: 'invoice', action: 'delete', description: '删除发票' },

    // 退款管理
    { name: 'refund.read', resource: 'refund', action: 'read', description: '查看退款申请' },
    { name: 'refund.update', resource: 'refund', action: 'update', description: '处理退款申请' },

    // 文件管理
    { name: 'file.create', resource: 'file', action: 'create', description: '上传文件' },
    { name: 'file.read', resource: 'file', action: 'read', description: '查看文件' },
    { name: 'file.delete', resource: 'file', action: 'delete', description: '删除文件' },

    // 系统设置
    { name: 'system.manage', resource: 'system', action: 'manage', description: '管理系统设置' },

    // 物流管理
    { name: 'courier.create', resource: 'courier', action: 'create', description: '创建物流公司' },
    { name: 'courier.read', resource: 'courier', action: 'read', description: '查看物流公司' },
    { name: 'courier.update', resource: 'courier', action: 'update', description: '编辑物流公司' },
    { name: 'courier.delete', resource: 'courier', action: 'delete', description: '删除物流公司' },
  ]

  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { name: permission.name },
      update: {},
      create: permission
    })
  }

  console.log(`成功初始化 ${permissions.length} 个权限`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
