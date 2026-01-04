import { prisma } from '../prisma'

// 动态导入支付宝 SDK，只在服务器端使用
const getAlipaySdk = async () => {
  if (typeof window === 'undefined') {
    const { AlipaySdk } = require('alipay-sdk')
    return AlipaySdk
  }
  throw new Error('支付宝 SDK 只能在服务器端使用')
}

interface AlipayConfig {
  appId: string
  privateKey: string
  publicKey: string
  gateway: string
}

class AlipayService {
  private sdk: any = null
  private config: AlipayConfig | null = null

  async initialize() {
    if (this.sdk) return this.sdk

    try {
      // 从数据库获取支付宝配置
      const paymentConfig = await prisma.paymentConfig.findUnique({
        where: { name: 'alipay' }
      })

      if (!paymentConfig?.enabled || !paymentConfig.config) {
        throw new Error('支付宝支付未配置或未启用')
      }

      const config = paymentConfig.config as any

      if (!config.appId || !config.privateKey || !config.publicKey) {
        throw new Error('支付宝配置信息不完整')
      }

      this.config = {
        appId: config.appId,
        privateKey: config.privateKey,
        publicKey: config.publicKey,
        gateway: config.gateway || 'https://openapi-sandbox.dl.alipaydev.com/gateway.do'
      }

      // 动态导入并初始化支付宝 SDK
      const AlipaySdk = await getAlipaySdk()
      this.sdk = new AlipaySdk({
        appId: this.config.appId,
        privateKey: this.config.privateKey,
        alipayPublicKey: this.config.publicKey,
        gateway: this.config.gateway,
        timeout: 30000, // 30秒超时
      })

      return this.sdk
    } catch (error) {
      console.error('初始化支付宝 SDK 失败:', error)
      throw error
    }
  }

  async createPayment(orderId: string, orderNumber: string, amount: number, subject: string, returnUrl: string) {
    try {
      const sdk = await this.initialize()
      if (!sdk) throw new Error('支付宝 SDK 未初始化')

      const bizContent = {
        out_trade_no: orderNumber,
        product_code: 'FAST_INSTANT_TRADE_PAY',
        total_amount: amount.toFixed(2),
        subject: subject,
        body: `Axiarz商品购买 - 订单号：${orderNumber}`,
        // 沙箱环境暂时不使用 passback_params，可能导致问题
        // passback_params: JSON.stringify({ orderId }),
      }

      console.log('🔄 正在创建支付宝支付订单...', { 
        orderNumber, 
        amount: amount.toFixed(2),
        returnUrl,
        notifyUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/callback`
      })

      const result = await sdk.pageExec('alipay.trade.page.pay', {
        bizContent,
        returnUrl,
        notifyUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/callback`,
      })

      console.log('✅ 支付宝支付订单创建成功', { orderNumber })
      return {
        paymentUrl: result,
        orderId,
        orderNumber,
        amount,
      }
    } catch (error: any) {
      console.error('❌ 创建支付宝支付订单失败:', {
        orderNumber,
        error: error.message,
        code: error.code,
        stack: error.stack
      })

      // 提供更有意义的错误信息
      if (error.message?.includes('timeout') || error.message?.includes('Timeout')) {
        throw new Error('网络请求超时，请检查网络连接后重试')
      } else if (error.message?.includes('ECONNREFUSED')) {
        throw new Error('无法连接到支付宝服务器，请稍后重试')
      } else if (error.code === 'UND_ERR_HEADERS_TIMEOUT') {
        throw new Error('支付宝响应超时，请重试支付')
      } else {
        throw new Error(`支付创建失败: ${error.message}`)
      }
    }
  }

  async verifyPayment(params: any) {
    try {
      const sdk = await this.initialize()
      if (!sdk) throw new Error('支付宝 SDK 未初始化')

      console.log('🔍 正在验证支付宝回调签名...', { outTradeNo: params.out_trade_no })

      // 验证签名
      const verified = sdk.checkNotifySign(params)

      if (!verified) {
        console.error('❌ 支付宝签名验证失败')
        throw new Error('支付宝签名验证失败')
      }

      console.log('✅ 支付宝签名验证成功', { outTradeNo: params.out_trade_no })

      return {
        verified: true,
        tradeStatus: params.trade_status,
        outTradeNo: params.out_trade_no,
        tradeNo: params.trade_no,
        totalAmount: params.total_amount,
      }
    } catch (error: any) {
      console.error('❌ 验证支付宝支付失败:', {
        error: error.message,
        outTradeNo: params.out_trade_no,
        tradeStatus: params.trade_status
      })
      throw error
    }
  }

  async refund(orderNumber: string, refundAmount: number, refundReason: string = '用户退款') {
    try {
      const sdk = await this.initialize()
      if (!sdk) throw new Error('支付宝 SDK 未初始化')

      const outRequestNo = `${orderNumber}_refund_${Date.now()}`

      const result = await sdk.execute('alipay.trade.refund', {
        bizContent: {
          out_trade_no: orderNumber,
          refund_amount: refundAmount.toFixed(2),
          out_request_no: outRequestNo,
          refund_reason: refundReason,
        },
      })

      return {
        refundResult: result,
        outRequestNo,
      }
    } catch (error) {
      console.error('支付宝退款失败:', error)
      throw error
    }
  }
}

// 导出单例实例
export const alipayService = new AlipayService()
export default alipayService
