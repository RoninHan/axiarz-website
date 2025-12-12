// 服务端数据库初始化脚本
import { initializeDatabase } from './db-init'

// 在服务端调用时使用
export async function initDatabaseOnServer() {
  try {
    await initializeDatabase()
  } catch (error) {
    console.error('数据库初始化失败:', error)
    throw error
  }
}

