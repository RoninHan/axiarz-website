import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdmin } from '@/lib/auth'

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await verifyAdmin(req)
    if (!admin || admin.role !== 'super_admin') {
      return NextResponse.json({ success: false, error: '无权限' }, { status: 403 })
    }

    const { permissionIds } = await req.json()

    if (!Array.isArray(permissionIds)) {
      return NextResponse.json({ success: false, error: '权限ID必须是数组' }, { status: 400 })
    }

    // Check if admin exists
    const targetAdmin = await prisma.admin.findUnique({
      where: { id: params.id }
    })

    if (!targetAdmin) {
      return NextResponse.json({ success: false, error: '管理员不存在' }, { status: 404 })
    }

    // Cannot modify super_admin permissions
    if (targetAdmin.role === 'super_admin') {
      return NextResponse.json({ success: false, error: '不能修改超级管理员的权限' }, { status: 400 })
    }

    // Delete existing permissions
    await prisma.adminPermission.deleteMany({
      where: { adminId: params.id }
    })

    // Create new permissions
    if (permissionIds.length > 0) {
      await prisma.adminPermission.createMany({
        data: permissionIds.map((permissionId: string) => ({
          adminId: params.id,
          permissionId
        }))
      })
    }

    // Return updated admin with permissions
    const updated = await prisma.admin.findUnique({
      where: { id: params.id },
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      }
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('Error updating admin permissions:', error)
    return NextResponse.json({ success: false, error: '更新权限失败' }, { status: 500 })
  }
}
