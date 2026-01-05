import { prisma } from '../lib/prisma'

async function main() {
  const companies = [
    { name: '顺丰速运', code: 'SF', website: 'https://www.sf-express.com', phone: '95338', sortOrder: 1, status: 'active' },
    { name: '中通快递', code: 'ZTO', website: 'https://www.zto.com', phone: '95311', sortOrder: 2, status: 'active' },
    { name: '圆通速递', code: 'YTO', website: 'https://www.yto.net.cn', phone: '95554', sortOrder: 3, status: 'active' },
    { name: '申通快递', code: 'STO', website: 'https://www.sto.cn', phone: '95543', sortOrder: 4, status: 'active' },
    { name: '韵达快递', code: 'YD', website: 'https://www.yundaex.com', phone: '95546', sortOrder: 5, status: 'active' },
    { name: '京东物流', code: 'JD', website: 'https://www.jdl.com', phone: '950616', sortOrder: 6, status: 'active' },
    { name: '邮政EMS', code: 'EMS', website: 'https://www.ems.com.cn', phone: '11183', sortOrder: 7, status: 'active' }
  ]
  
  console.log('开始添加物流公司数据...')
  
  for (const company of companies) {
    try {
      const existing = await prisma.courierCompany.findFirst({
        where: { code: company.code }
      })
      
      if (!existing) {
        await prisma.courierCompany.create({ data: company })
        console.log(`✓ 添加: ${company.name}`)
      } else {
        console.log(`- 跳过（已存在）: ${company.name}`)
      }
    } catch (error) {
      console.error(`✗ 添加失败: ${company.name}`, error)
    }
  }
  
  console.log('物流公司数据添加完成！')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
