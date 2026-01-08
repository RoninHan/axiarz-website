import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateContractHTML } from '@/lib/order-contract-html'
import { checkApiPermission } from '@/lib/api-middleware'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // 检查管理员权限
  const authCheck = await checkApiPermission(request, 'order', 'read')
  if (!authCheck.authorized) return authCheck.response!

  try {
    // 获取订单详情
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true
          }
        },
        address: true,
        items: {
          include: {
            product: {
              select: {
                name: true,
                sku: true
              }
            }
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json(
        { success: false, error: '订单不存在' },
        { status: 404 }
      )
    }

    // 准备合同数据
    const contractData = {
      orderNumber: order.orderNumber,
      createdAt: order.createdAt,
      user: {
        name: order.user.name || undefined,
        email: order.user.email,
        phone: order.user.phone || undefined
      },
      address: {
        name: order.address.name,
        phone: order.address.phone,
        province: order.address.province,
        city: order.address.city,
        district: order.address.district,
        detail: order.address.detail,
        postalCode: order.address.postalCode || undefined
      },
      items: order.items.map(item => ({
        product: {
          name: item.product.name,
          sku: item.product.sku || undefined
        },
        quantity: item.quantity,
        price: parseFloat(item.price.toString())
      })),
      originalAmount: order.originalAmount ? parseFloat(order.originalAmount.toString()) : undefined,
      discountAmount: order.discountAmount ? parseFloat(order.discountAmount.toString()) : undefined,
      totalAmount: parseFloat(order.totalAmount.toString()),
      paymentMethod: order.paymentMethod || undefined,
      paymentStatus: order.paymentStatus,
      status: order.status,
      notes: order.notes || undefined
    }

    // 生成合同HTML
    const htmlContent = generateContractHTML(contractData)

    // 返回 HTML 内容（让前端使用 jsPDF 的 html 方法生成 PDF）
    console.log(`[ADMIN Contract] 返回合同 HTML，订单: ${order.orderNumber}，HTML 长度: ${htmlContent.length}`)
    return new NextResponse(JSON.stringify({ 
      success: true, 
      html: htmlContent,
      orderNumber: order.orderNumber
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  } catch (error: any) {
    console.error('生成订单合同HTML失败:', error)
    return NextResponse.json(
      { success: false, error: error.message || '生成订单合同失败' },
      { status: 500 }
    )
  }
}