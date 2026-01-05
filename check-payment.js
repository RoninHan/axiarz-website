const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkPaymentMethods() {
  try {
    console.log('正在检查支付配置...\n')
    
    const allConfigs = await prisma.paymentConfig.findMany()
    console.log('所有支付配置数量:', allConfigs.length)
    console.log('所有支付配置:')
    allConfigs.forEach(config => {
      console.log(`- ${config.displayName} (${config.name}): ${config.enabled ? '已启用' : '未启用'}`)
    })
    
    const enabledConfigs = await prisma.paymentConfig.findMany({
      where: { enabled: true },
      orderBy: { sortOrder: 'asc' }
    })
    
    console.log('\n已启用的支付配置数量:', enabledConfigs.length)
    if (enabledConfigs.length > 0) {
      console.log('已启用的支付配置:')
      enabledConfigs.forEach(config => {
        console.log(`- ${config.displayName} (${config.name})`)
      })
    } else {
      console.log('没有已启用的支付配置！')
      console.log('\n建议: 请登录管理后台 /admin/payment-configs 启用支付方式')
    }
  } catch (error) {
    console.error('检查失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkPaymentMethods()
