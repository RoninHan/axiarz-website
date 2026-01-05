import { prisma } from '../lib/prisma'

async function removeDuplicates() {
  try {
    // 获取所有权限
    const permissions = await prisma.permission.findMany({
      orderBy: [
        { createdAt: 'asc' } // 保留最早创建的
      ]
    })

    console.log(`总共 ${permissions.length} 个权限记录`)

    // 按 resource + action 分组
    const grouped = new Map<string, any[]>()
    permissions.forEach(p => {
      const key = `${p.resource}.${p.action}`
      if (!grouped.has(key)) {
        grouped.set(key, [])
      }
      grouped.get(key)!.push(p)
    })

    console.log(`\n去重后应该有 ${grouped.size} 个权限\n`)

    // 找出重复的并删除
    let deleteCount = 0
    for (const [key, items] of grouped.entries()) {
      if (items.length > 1) {
        console.log(`发现重复权限: ${key} (${items.length} 个)`)
        // 保留第一个（最早创建的），删除其余
        const toDelete = items.slice(1)
        for (const item of toDelete) {
          console.log(`  删除: ${item.id} - ${item.name}`)
          await prisma.permission.delete({
            where: { id: item.id }
          })
          deleteCount++
        }
      }
    }

    console.log(`\n总共删除了 ${deleteCount} 个重复权限`)

    // 显示最终结果
    const finalPermissions = await prisma.permission.findMany({
      orderBy: [
        { resource: 'asc' },
        { action: 'asc' }
      ]
    })

    console.log(`\n清理后剩余 ${finalPermissions.length} 个权限:`)
    finalPermissions.forEach(p => {
      console.log(`  ${p.resource}.${p.action} - ${p.name}`)
    })

  } catch (error) {
    console.error('错误:', error)
  } finally {
    await prisma.$disconnect()
  }
}

removeDuplicates()
