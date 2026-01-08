'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { message } from 'antd'
import { LeftOutlined, DownloadOutlined, PrinterOutlined } from '@ant-design/icons'
import Button from '@/components/client/Button'
import ProtectedRoute from '@/components/client/ProtectedRoute'
import { Order } from '@/types'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

function ContractPageContent() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [contractConfig, setContractConfig] = useState<any>(null)
  const contractRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadContractConfig()
    if (params.id) {
      fetchOrder(params.id as string)
    }
  }, [params.id])

  async function loadContractConfig() {
    try {
      const res = await fetch('/api/client/contract-config')
      const data = await res.json()
      if (data.success) {
        setContractConfig(data.config)
      }
    } catch (error) {
      console.error('加载合同配置失败:', error)
    }
  }

  async function fetchOrder(id: string) {
    try {
      setLoading(true)
      const res = await fetch(`/api/client/orders/${id}`, {
        headers: {
          'X-Auth-Type': 'client'
        }
      })
      const data = await res.json()
      if (data.success) {
        setOrder(data.data)
      } else {
        message.error('获取订单信息失败')
        router.push('/orders')
      }
    } catch (error) {
      console.error('获取订单详情失败:', error)
      message.error('获取订单信息失败')
      router.push('/orders')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!contractRef.current || !order) return
    
    try {
      setDownloading(true)
      message.loading({ content: '正在生成 PDF...', key: 'download', duration: 0 })

      // 使用 html2canvas 截图
      const canvas = await html2canvas(contractRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      })

      // 创建 PDF
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = canvas.width
      const imgHeight = canvas.height
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
      const imgX = (pdfWidth - imgWidth * ratio) / 2
      const imgY = 0

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio)
      
      const date = new Date().toISOString().split('T')[0]
      pdf.save(`合同-${order.orderNumber}-${date}.pdf`)
      
      message.success({ content: '下载成功！', key: 'download', duration: 2 })
    } catch (error) {
      console.error('下载失败:', error)
      message.error({ content: '下载失败，请重试', key: 'download', duration: 2 })
    } finally {
      setDownloading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading || !contractConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-orange mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      {/* 操作栏 - 不会被打印 */}
      <div className="bg-white border-b border-gray-200 print:hidden sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-accent-orange transition-colors"
          >
            <LeftOutlined />
            <span>返回订单详情</span>
          </button>
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="medium"
              onClick={handlePrint}
            >
              <PrinterOutlined className="mr-2" />
              打印合同
            </Button>
            <Button
              variant="primary"
              size="medium"
              onClick={handleDownload}
              disabled={downloading}
            >
              <DownloadOutlined className="mr-2" />
              {downloading ? '生成中...' : '下载 PDF'}
            </Button>
          </div>
        </div>
      </div>

      {/* 合同内容 */}
      <div className="py-8 print:py-0 print:m-0">
        <div 
          ref={contractRef}
          className="max-w-4xl mx-auto bg-white shadow-lg print:shadow-none print:max-w-full print:m-0"
          style={{ minHeight: '297mm' }} // A4 高度
        >
          {/* 合同头部 */}
          <div className="text-center border-b-2 border-gray-800 pb-6 mb-8 px-12 pt-12">
            <h1 className="text-4xl font-bold mb-4 text-gray-900">产品购销合同</h1>
            <div className="text-sm text-gray-600">
              合同编号：{order.orderNumber}
            </div>
          </div>

          <div className="px-12 pb-12">
            {/* 甲方（卖方）信息 */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4 text-gray-900">甲方（卖方）</h2>
              <div className="bg-gray-50 p-6 rounded-lg space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-600">公司名称：</span>
                    <span className="font-medium">{contractConfig.sellerName}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">联系电话：</span>
                    <span className="font-medium">{contractConfig.sellerPhone}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">税号：</span>
                    <span className="font-medium">{contractConfig.sellerTaxNumber}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">银行账户：</span>
                    <span className="font-medium">{contractConfig.sellerBankAccount}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-600">公司地址：</span>
                    <span className="font-medium">{contractConfig.sellerAddress}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 乙方（买方）信息 */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4 text-gray-900">乙方（买方）</h2>
              <div className="bg-gray-50 p-6 rounded-lg space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-600">姓名：</span>
                    <span className="font-medium">{order.user?.name || order.address?.name || '未提供'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">联系电话：</span>
                    <span className="font-medium">{order.user?.phone || order.address?.phone || '未提供'}</span>
                  </div>
                  {order.user?.email && (
                    <div className="col-span-2">
                      <span className="text-gray-600">电子邮箱：</span>
                      <span className="font-medium">{order.user.email}</span>
                    </div>
                  )}
                  <div className="col-span-2">
                    <span className="text-gray-600">收货地址：</span>
                    <span className="font-medium">
                      {order.address ? 
                        `${order.address.province}${order.address.city}${order.address.district}${order.address.detail}` : 
                        '未提供'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 产品清单 */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4 text-gray-900">产品清单</h2>
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-3 text-left">序号</th>
                    <th className="border border-gray-300 px-4 py-3 text-left">产品名称</th>
                    <th className="border border-gray-300 px-4 py-3 text-center">数量</th>
                    <th className="border border-gray-300 px-4 py-3 text-right">单价（元）</th>
                    <th className="border border-gray-300 px-4 py-3 text-right">小计（元）</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items?.map((item, index) => (
                    <tr key={item.id}>
                      <td className="border border-gray-300 px-4 py-3">{index + 1}</td>
                      <td className="border border-gray-300 px-4 py-3">
                        {item.product?.name || '未知产品'}
                        {item.product?.sku && (
                          <span className="text-gray-500 text-sm ml-2">({item.product.sku})</span>
                        )}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-center">{item.quantity}</td>
                      <td className="border border-gray-300 px-4 py-3 text-right">
                        ¥{Number(item.price).toFixed(2)}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-right font-medium">
                        ¥{(Number(item.price) * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 font-bold">
                    <td colSpan={4} className="border border-gray-300 px-4 py-3 text-right">
                      合计金额：
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-right text-lg text-accent-orange">
                      ¥{Number(order.totalAmount).toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* 合同条款 */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4 text-gray-900">合同条款</h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <div>
                  <p className="font-medium mb-2">一、产品质量</p>
                  <p className="pl-4 text-sm">{contractConfig.qualityClause}</p>
                </div>
                <div>
                  <p className="font-medium mb-2">二、交付时间</p>
                  <p className="pl-4 text-sm">{contractConfig.deliveryClause}</p>
                </div>
                <div>
                  <p className="font-medium mb-2">三、付款方式</p>
                  <p className="pl-4 text-sm">
                    {contractConfig.paymentClause}
                    <br/>
                    本订单付款方式：{order.paymentMethod === 'alipay' ? '支付宝' : order.paymentMethod === 'wechat' ? '微信支付' : '其他'}
                    <br/>
                    付款状态：{order.paymentStatus === 'paid' ? '已支付' : '待支付'}
                  </p>
                </div>
                <div>
                  <p className="font-medium mb-2">四、售后服务</p>
                  <p className="pl-4 text-sm">{contractConfig.afterSalesClause}</p>
                </div>
                <div>
                  <p className="font-medium mb-2">五、争议解决</p>
                  <p className="pl-4 text-sm">{contractConfig.disputeClause}</p>
                </div>
              </div>
            </div>

            {/* 签署信息 */}
            <div className="grid grid-cols-2 gap-8 mt-12 pt-8 border-t border-gray-300">
              <div>
                <p className="font-bold mb-6">甲方（卖方）</p>
                <div className="space-y-3">
                  <p>公司名称：{contractConfig.sellerName}</p>
                  <p>法定代表人：___________________</p>
                  <p>签署日期：{new Date(order.createdAt).toLocaleDateString('zh-CN')}</p>
                  <div className="mt-8">
                    <p>（盖章）</p>
                  </div>
                </div>
              </div>
              <div>
                <p className="font-bold mb-6">乙方（买方）</p>
                <div className="space-y-3">
                  <p>姓名：{order.user?.name || order.address?.name || '___________________'}</p>
                  <p>签名：___________________</p>
                  <p>签署日期：{new Date(order.createdAt).toLocaleDateString('zh-CN')}</p>
                </div>
              </div>
            </div>

            {/* 备注 */}
            {order.notes && (
              <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
                <p className="font-medium text-gray-900 mb-2">备注：</p>
                <p className="text-sm text-gray-700">{order.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 打印样式 */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          @page {
            size: A4;
            margin: 15mm;
          }
          * {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  )
}

export default function ContractPage() {
  return (
    <ProtectedRoute>
      <ContractPageContent />
    </ProtectedRoute>
  )
}
