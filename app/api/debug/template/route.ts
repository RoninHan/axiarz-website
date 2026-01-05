import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const tplJson = await prisma.setting.findUnique({ where: { key: 'order_contract_template_json' } })
    const tplText = await prisma.setting.findUnique({ where: { key: 'order_contract_template' } })
    
    return NextResponse.json({
      success: true,
      templates: {
        json: {
          exists: !!tplJson,
          type: typeof tplJson?.value,
          length: typeof tplJson?.value === 'string' ? tplJson.value.length : 0,
          preview: typeof tplJson?.value === 'string' ? tplJson.value.substring(0, 200) : null
        },
        text: {
          exists: !!tplText,
          type: typeof tplText?.value,
          length: typeof tplText?.value === 'string' ? tplText.value.length : 0,
          preview: typeof tplText?.value === 'string' ? tplText.value.substring(0, 200) : null
        }
      }
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
