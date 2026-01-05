import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateContractHTML } from '@/lib/order-contract-html'
import { renderContractTemplate } from '@/lib/contract-template-renderer'
import { ContractTemplate } from '@/types/contract-template'
import { getAuthFromRequest } from '@/lib/api-utils'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 验证用户身份
    const auth = getAuthFromRequest(request)
    if (!auth) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      )
    }

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

    // 验证订单所属（用户只能下载自己的订单合同，管理员可以下载所有订单）
    if (auth.type === 'user' && order.userId !== auth.id) {
      return NextResponse.json(
        { success: false, error: '无权访问此订单' },
        { status: 403 }
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

    // 读取自定义合同模板（如果存在）
    let htmlContent: string
    let templateUsed = 'unknown'
    try {
      // 尝试加载可视化模板
      const tplJson = await prisma.setting.findUnique({ where: { key: 'order_contract_template_json' } })
      if (tplJson && typeof tplJson.value === 'string') {
        const template: ContractTemplate = JSON.parse(tplJson.value)
        htmlContent = renderContractTemplate(template, contractData)
        templateUsed = 'json-template'
        console.log(`[CLIENT Contract] 使用可视化模板 (${template.components.length} 组件)`)
      } else {
        // 回退到简单文本模板
        const tpl = await prisma.setting.findUnique({ where: { key: 'order_contract_template' } })
        const textTemplate = tpl && typeof tpl.value === 'string' ? tpl.value : undefined
        htmlContent = generateContractHTML(contractData, textTemplate)
        templateUsed = textTemplate ? 'text-template' : 'default-template'
        console.log(`[CLIENT Contract] 使用${textTemplate ? '文本' : '默认'}模板`)
      }
    } catch (e) {
      console.error('[CLIENT Contract] 读取合同模板失败:', e)
      // 使用默认模板
      htmlContent = generateContractHTML(contractData)
      templateUsed = 'default-fallback'
      console.log('[CLIENT Contract] 回退到默认模板')
    }

    // 返回 HTML 内容（让前端使用 jsPDF 的 html 方法生成 PDF）
    console.log(`[CLIENT Contract] 返回合同 HTML，订单: ${order.orderNumber}，模板: ${templateUsed}，HTML 长度: ${htmlContent.length}`)
    return new NextResponse(JSON.stringify({ 
      success: true, 
      html: htmlContent,
      orderNumber: order.orderNumber,
      _debug: {
        templateUsed,
        htmlLength: htmlContent.length
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  } catch (error: any) {
    console.error('生成订单合同PDF失败:', error)
    return NextResponse.json(
      { success: false, error: error.message || '生成订单合同失败' },
      { status: 500 }
    )
  }
}
