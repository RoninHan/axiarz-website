const fetch = require('node-fetch')

async function testAPI() {
  try {
    const response = await fetch('http://localhost:3000/api/client/payment-methods')
    const data = await response.json()
    
    console.log('API 响应状态:', response.status)
    console.log('API 响应数据:')
    console.log(JSON.stringify(data, null, 2))
    
    if (data.success && data.data) {
      console.log('\n支付方式数量:', data.data.length)
      if (data.data.length > 0) {
        console.log('第一个支付方式:', data.data[0])
      }
    }
  } catch (error) {
    console.error('测试失败:', error.message)
  }
}

testAPI()
