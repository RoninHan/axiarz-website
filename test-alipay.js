// 简单的支付宝SDK测试脚本
const { AlipaySdk } = require('alipay-sdk')

console.log('🧪 测试支付宝SDK集成...')

try {
  // 测试SDK实例化
  const sdk = new AlipaySdk({
    appId: 'test_app_id',
    privateKey: 'test_private_key',
    alipayPublicKey: 'test_public_key',
    gateway: 'https://openapi.alipay.com/gateway.do'
  })

  console.log('✅ SDK实例化成功')

  // 测试exec方法是否存在
  if (typeof sdk.exec === 'function') {
    console.log('✅ SDK exec方法存在')
  } else {
    console.log('❌ SDK exec方法不存在')
  }

  // 测试checkNotifySign方法是否存在
  if (typeof sdk.checkNotifySign === 'function') {
    console.log('✅ SDK checkNotifySign方法存在')
  } else {
    console.log('❌ SDK checkNotifySign方法不存在')
  }

  console.log('🎉 支付宝SDK集成测试完成！')

} catch (error) {
  console.error('❌ SDK测试失败:', error.message)
  process.exit(1)
}
