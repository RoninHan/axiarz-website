import { prisma } from '../lib/prisma'

/**
 * 为不同角色预设权限模板
 */
async function assignRolePermissions() {
  console.log('开始配置角色权限...\n')

  // 获取所有权限
  const allPermissions = await prisma.permission.findMany()
  
  const permissionMap = new Map<string, string>(
    allPermissions.map((p: any) => [`${p.resource}.${p.action}`, p.id])
  )

  // 定义角色权限模板
  const roleTemplates = {
    sales: {
      name: '销售角色',
      permissions: [
        'user.read',
        'user.create',
        'product.read',
        'category.read',
        'order.read',
        'order.create',
        'order.update',
        'coupon.read',
        'file.read',
        'file.create',
      ]
    },
    support: {
      name: '售后角色',
      permissions: [
        'user.read',
        'order.read',
        'order.update',
        'repair.read',
        'repair.update',
        'refund.read',
        'refund.update',
        'invoice.read',
        'invoice.create',
        'file.read',
        'file.create',
      ]
    },
    service: {
      name: '客服角色',
      permissions: [
        'user.read',
        'order.read',
        'repair.read',
        'repair.update',
        'file.read',
        'file.create',
      ]
    },
    admin: {
      name: '普通管理员',
      permissions: [
        'user.read',
        'user.create',
        'user.update',
        'product.read',
        'product.create',
        'product.update',
        'category.read',
        'category.create',
        'category.update',
        'order.read',
        'order.update',
        'coupon.read',
        'coupon.create',
        'coupon.update',
        'file.read',
        'file.create',
        'file.delete',
      ]
    }
  }

  // 查找现有管理员
  const admins = await prisma.admin.findMany({
    where: {
      role: {
        in: ['sales', 'support', 'service', 'admin']
      }
    }
  })

  console.log(`找到 ${admins.length} 个需要配置权限的管理员\n`)

  for (const admin of admins) {
    const template = roleTemplates[admin.role as keyof typeof roleTemplates]
    if (!template) continue

    console.log(`配置 ${admin.name} (${admin.email}) - ${template.name}`)

    // 删除现有权限
    await prisma.adminPermission.deleteMany({
      where: { adminId: admin.id }
    })

    // 分配新权限
    const permissionIds: string[] = []
    for (const permName of template.permissions) {
      const permId = permissionMap.get(permName)
      if (permId) {
        permissionIds.push(permId)
      } else {
        console.log(`  ⚠️  权限不存在: ${permName}`)
      }
    }

    if (permissionIds.length > 0) {
      await prisma.adminPermission.createMany({
        data: permissionIds.map(permissionId => ({
          adminId: admin.id,
          permissionId
        }))
      })
      console.log(`  ✅ 已分配 ${permissionIds.length} 个权限`)
    }

    console.log()
  }

  console.log('权限配置完成！')
}

async function main() {
  try {
    await assignRolePermissions()
  } catch (error) {
    console.error('配置失败:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
