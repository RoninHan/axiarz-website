import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdmin } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await verifyAdmin(req)
    if (!admin || admin.role !== 'super_admin') {
      return NextResponse.json({ success: false, error: '无权限' }, { status: 403 })
    }

    const targetAdmin = await prisma.admin.findUnique({
      where: { id: params.id },
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      }
    })

    if (!targetAdmin) {
      return NextResponse.json({ success: false, error: '管理员不存在' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: targetAdmin })
  } catch (error) {
    console.error('Error fetching admin:', error)
    return NextResponse.json({ success: false, error: '获取管理员信息失败' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await verifyAdmin(req)
    if (!admin || admin.role !== 'super_admin') {
      return NextResponse.json({ success: false, error: '无权限' }, { status: 403 })
    }

    const { name, email, role, status, isActive } = await req.json()

    // Cannot modify super_admin role
    const targetAdmin = await prisma.admin.findUnique({
      where: { id: params.id }
    })

    if (!targetAdmin) {
      return NextResponse.json({ success: false, error: '管理员不存在' }, { status: 404 })
    }

    if (targetAdmin.role === 'super_admin' && role && role !== 'super_admin') {
      return NextResponse.json({ success: false, error: '无法修改超级管理员的角色' }, { status: 400 })
    }

    // Check email uniqueness if email is being changed
    if (email && email !== targetAdmin.email) {
      const existing = await prisma.admin.findUnique({
        where: { email }
      })
      if (existing) {
        return NextResponse.json({ success: false, error: '邮箱已存在' }, { status: 400 })
      }
    }

    // Determine final status value
    let finalStatus = status
    if (typeof isActive === 'boolean') {
      finalStatus = isActive ? 'active' : 'disabled'
    }

    const updated = await prisma.admin.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(role && { role }),
        ...(finalStatus && { status: finalStatus })
      }
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('Error updating admin:', error)
    return NextResponse.json({ success: false, error: '更新管理员失败' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await verifyAdmin(req)
    if (!admin || admin.role !== 'super_admin') {
      return NextResponse.json({ success: false, error: '无权限' }, { status: 403 })
    }

    // Cannot delete self
    if (admin.id === params.id) {
      return NextResponse.json({ success: false, error: '不能删除自己' }, { status: 400 })
    }

    // Cannot delete super_admin
    const targetAdmin = await prisma.admin.findUnique({
      where: { id: params.id }
    })

    if (!targetAdmin) {
      return NextResponse.json({ success: false, error: '管理员不存在' }, { status: 404 })
    }

    if (targetAdmin.role === 'super_admin') {
      return NextResponse.json({ success: false, error: '不能删除超级管理员' }, { status: 400 })
    }

    await prisma.admin.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting admin:', error)
    return NextResponse.json({ success: false, error: '删除管理员失败' }, { status: 500 })
  }
}
