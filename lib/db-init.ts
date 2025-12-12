import { exec } from 'child_process'
import { promisify } from 'util'
import { checkDatabaseConnection, checkDatabaseInitialized } from './prisma'
import { prisma } from './prisma'

const execAsync = promisify(exec)

export async function initializeDatabase() {
  console.log('🔍 检查数据库连接...')
  const connected = await checkDatabaseConnection()
  if (!connected) {
    throw new Error('数据库连接失败，请检查 DATABASE_URL 配置')
  }

  console.log('🔍 检查数据库表...')
  const initialized = await checkDatabaseInitialized()

  if (!initialized) {
    console.log('📦 开始初始化数据库表...')
    try {
      // 运行 Prisma migrate
      await execAsync('npx prisma migrate deploy')
      console.log('✅ 数据库表创建成功')

      // 运行 seed 脚本
      console.log('🌱 开始填充初始数据...')
      try {
        await execAsync('npx tsx prisma/seed.ts')
        console.log('✅ 初始数据填充完成')
      } catch (seedError) {
        console.warn('⚠️  初始数据填充警告（可能已存在）:', seedError)
      }
    } catch (error) {
      console.error('❌ 数据库初始化失败:', error)
      throw error
    }
  } else {
    console.log('ℹ️  数据库已初始化，跳过初始化步骤')
  }
}

