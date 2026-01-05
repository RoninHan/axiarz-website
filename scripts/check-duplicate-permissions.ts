import { prisma } from '../lib/prisma'

async function check() {
  const permissions = await prisma.permission.findMany({
    orderBy: [
      { resource: 'asc' },
      { action: 'asc' }
    ]
  })
  
  console.log('总权限数:', permissions.length)
  console.log('\n所有权限:')
  permissions.forEach(p => {
    console.log(`  ${p.resource}.${p.action} - ${p.name}`)
  })
  
  // 检查重复
  const duplicates = new Map<string, any[]>()
  permissions.forEach(p => {
    const key = `${p.resource}.${p.action}`
    if (!duplicates.has(key)) {
      duplicates.set(key, [])
    }
    duplicates.get(key)!.push(p)
  })
  
  console.log('\n重复的权限:')
  let hasDuplicates = false
  duplicates.forEach((items, key) => {
    if (items.length > 1) {
      hasDuplicates = true
      console.log(`  ${key}: ${items.length} 个`)
      items.forEach(item => {
        console.log(`    - ID: ${item.id}, Name: ${item.name}`)
      })
    }
  })
  
  if (!hasDuplicates) {
    console.log('  没有重复')
  }
  
  await prisma.$disconnect()
}

check()
