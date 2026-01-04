// 测试支付宝集成（不发送真实请求）
const { AlipaySdk } = require('alipay-sdk')

console.log('🧪 测试支付宝SDK集成和配置...')

try {
  // 测试SDK实例化
  const sdk = new AlipaySdk({
    appId: 'test_app_id',
    privateKey: 'test_private_key',
    alipayPublicKey: 'test_public_key',
    gateway: 'https://openapi-sandbox.dl.alipaydev.com/gateway.do',
    timeout: 30000,
  })

  console.log('✅ SDK实例化成功')
  console.log('📍 使用网关:', 'https://openapi-sandbox.dl.alipaydev.com/gateway.do')
  console.log('⏱️ 超时设置:', '30秒')

  // 测试方法存在性
  const methods = ['pageExec', 'exec', 'checkNotifySign']
  methods.forEach(method => {
    if (typeof sdk[method] === 'function') {
      console.log(`✅ ${method} 方法存在`)
    } else {
      console.log(`❌ ${method} 方法不存在`)
    }
  })

  // 测试参数构建
  const testBizContent = {
    out_trade_no: 'TEST123456',
    product_code: 'FAST_INSTANT_TRADE_PAY',
    total_amount: '99.00',
    subject: '测试商品',
    body: '测试商品购买',
  }

  console.log('📋 测试业务参数构建:')
  console.log(JSON.stringify(testBizContent, null, 2))

  console.log('🎉 支付宝SDK集成配置验证完成！')

} catch (error) {
  console.error('❌ SDK测试失败:', error.message)
  process.exit(1)
}
