import { NextRequest } from 'next/server'
import { initializeDatabase } from '@/lib/db-init'
import { successResponse, errorResponse } from '@/lib/api-utils'

export async function POST(request: NextRequest) {
  try {
    await initializeDatabase()
    return successResponse(null, '数据库初始化成功')
  } catch (error: any) {
    return errorResponse(error.message || '数据库初始化失败', 500)
  }
}

