/**
 * 订单合同功能测试脚本
 * 
 * 使用方法:
 * 1. 确保已有测试订单数据
 * 2. 在浏览器控制台运行此脚本
 * 3. 或创建一个测试页面引入此函数
 */

/**
 * 测试下载合同功能
 */
async function testDownloadContract(orderId: string, isAdmin: boolean = false) {
  try {
    console.log('开始测试下载合同功能...')
    console.log('订单ID:', orderId)
    console.log('管理员模式:', isAdmin)
    
    const apiUrl = isAdmin 
      ? `/api/admin/orders/${orderId}/contract`
      : `/api/client/orders/${orderId}/contract`
    
    console.log('请求URL:', apiUrl)
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      credentials: 'include',
    })
    
    console.log('响应状态:', response.status)
    console.log('响应头:', Object.fromEntries(response.headers.entries()))
    
    if (!response.ok) {
      const data = await response.json()
      console.error('❌ 下载失败:', data.error)
      return false
    }
    
    const blob = await response.blob()
    console.log('✅ PDF生成成功')
    console.log('文件大小:', (blob.size / 1024).toFixed(2), 'KB')
    console.log('文件类型:', blob.type)
    
    // 自动下载
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Test_Contract_${Date.now()}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    console.log('✅ 合同下载成功')
    return true
  } catch (error) {
    console.error('❌ 测试失败:', error)
    return false
  }
}

/**
 * 测试合同内容格式
 */
function testContractDataFormat() {
  console.log('测试合同数据格式...')
  
  const testData = {
    orderNumber: 'ORD-TEST-001',
    createdAt: new Date(),
    user: {
      name: '测试用户',
      email: 'test@example.com',
      phone: '13800138000'
    },
    address: {
      name: '张三',
      phone: '13800138000',
      province: '广东省',
      city: '深圳市',
      district: '南山区',
      detail: '科技园XX路XX号',
      postalCode: '518000'
    },
    items: [
      {
        product: {
          name: '测试产品A',
          sku: 'TEST-001'
        },
        quantity: 2,
        price: 100.00
      },
      {
        product: {
          name: '测试产品B',
          sku: 'TEST-002'
        },
        quantity: 1,
        price: 150.00
      }
    ],
    originalAmount: 350.00,
    discountAmount: 50.00,
    totalAmount: 300.00,
    paymentMethod: 'alipay',
    paymentStatus: 'paid',
    status: 'shipped',
    notes: '这是一个测试订单的备注信息'
  }
  
  console.log('✅ 测试数据格式正确')
  console.log('测试数据:', testData)
  return testData
}

/**
 * 批量测试多个订单
 */
async function testBatchDownload(orderIds: string[], isAdmin: boolean = false) {
  console.log('开始批量测试...')
  console.log('订单数量:', orderIds.length)
  
  const results = []
  
  for (let i = 0; i < orderIds.length; i++) {
    console.log(`\n测试订单 ${i + 1}/${orderIds.length}`)
    const success = await testDownloadContract(orderIds[i], isAdmin)
    results.push({ orderId: orderIds[i], success })
    
    // 避免请求过快
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  const successCount = results.filter(r => r.success).length
  console.log(`\n批量测试完成: ${successCount}/${orderIds.length} 成功`)
  return results
}

// 导出测试函数
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testDownloadContract,
    testContractDataFormat,
    testBatchDownload
  }
}

// 浏览器环境下挂载到window
if (typeof window !== 'undefined') {
  (window as any).orderContractTest = {
    testDownloadContract,
    testContractDataFormat,
    testBatchDownload
  }
  
  console.log('✅ 订单合同测试工具已加载')
  console.log('使用方法:')
  console.log('1. orderContractTest.testDownloadContract("订单ID", false)')
  console.log('2. orderContractTest.testContractDataFormat()')
  console.log('3. orderContractTest.testBatchDownload(["订单ID1", "订单ID2"], false)')
}
