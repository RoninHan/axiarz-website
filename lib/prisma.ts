import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// 数据库连接检测
export async function checkDatabaseConnection() {
  try {
    await prisma.$connect()
    console.log('✅ 数据库连接成功')
    return true
  } catch (error) {
    console.error('❌ 数据库连接失败:', error)
    return false
  }
}

// 数据库初始化检测
export async function checkDatabaseInitialized() {
  try {
    // 检查表是否存在
    await prisma.$queryRaw`SELECT 1 FROM users LIMIT 1`
    await prisma.$queryRaw`SELECT 1 FROM admins LIMIT 1`
    await prisma.$queryRaw`SELECT 1 FROM payment_configs LIMIT 1`
    console.log('✅ 数据库表已存在')
    return true
  } catch (error) {
    console.log('ℹ️  数据库表不存在，需要初始化')
    return false
  }
}

