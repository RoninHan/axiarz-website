import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdmin } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function GET(req: NextRequest) {
  try {
    const admin = await verifyAdmin(req)
    if (!admin || admin.role !== 'super_admin') {
      return NextResponse.json({ success: false, error: '无权限' }, { status: 403 })
    }

    const admins = await prisma.admin.findMany({
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const adminsWithCount = admins.map(a => ({
      ...a,
      permissionCount: a.permissions.length,
      permissions: undefined
    }))

    return NextResponse.json({ success: true, data: adminsWithCount })
  } catch (error) {
    console.error('Error fetching admins:', error)
    return NextResponse.json({ success: false, error: '获取管理员列表失败' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await verifyAdmin(req)
    if (!admin || admin.role !== 'super_admin') {
      return NextResponse.json({ success: false, error: '无权限' }, { status: 403 })
    }

    const { name, email, password, role } = await req.json()

    if (!name || !email || !password || !role) {
      return NextResponse.json({ success: false, error: '缺少必填字段' }, { status: 400 })
    }

    // Check if email already exists
    const existing = await prisma.admin.findUnique({
      where: { email }
    })

    if (existing) {
      return NextResponse.json({ success: false, error: '邮箱已存在' }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create admin
    const newAdmin = await prisma.admin.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        status: 'active'
      }
    })

    return NextResponse.json({ success: true, data: newAdmin })
  } catch (error) {
    console.error('Error creating admin:', error)
    return NextResponse.json({ success: false, error: '创建管理员失败' }, { status: 500 })
  }
}
