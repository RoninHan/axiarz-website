import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { JWTPayload } from '@/types'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production'

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (error) {
    return null
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

// 验证管理员权限
export async function verifyAdminAuth(req: NextRequest) {
  try {
    // 从 cookie 中获取 token
    const token = req.cookies.get('token')?.value
    
    console.log('=== verifyAdminAuth Debug ===')
    console.log('Token from cookie:', token ? `${token.substring(0, 20)}...` : 'null')
    
    if (!token) {
      throw new Error('未登录')
    }

    // 验证 token
    const payload = verifyToken(token)
    console.log('Token payload:', payload)
    
    if (!payload) {
      throw new Error('Token 无效')
    }

    // 根据 type 判断查询哪个表
    if (payload.type === 'admin') {
      // 查询 Admin 表
      console.log('Looking for admin with id:', payload.id)
      const admin = await prisma.admin.findUnique({
        where: { id: payload.id },
      })

      console.log('Admin found:', admin ? `${admin.email}` : 'null')

      if (!admin) {
        throw new Error('管理员不存在')
      }

      if (admin.status !== 'active') {
        throw new Error('账户已被禁用')
      }

      console.log('=== Admin Auth Success ===')
      return admin
    } else {
      // 普通用户没有管理权限
      throw new Error('权限不足')
    }
  } catch (error) {
    console.error('=== Auth Failed ===', error)
    throw error
  }
}

