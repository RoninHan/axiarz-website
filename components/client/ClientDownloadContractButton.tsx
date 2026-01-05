/**
 * 客户端订单合同下载按钮
 * 使用客户端风格的 Button 组件
 */
'use client'

import { useState } from 'react'
import { message } from 'antd'
import { jsPDF } from 'jspdf'
import Button from '@/components/client/Button'
import { FilePdfOutlined } from '@ant-design/icons'

interface ClientDownloadContractButtonProps {
  orderId: string
  orderNumber: string
  buttonText?: string
  variant?: 'primary' | 'outline' | 'secondary'
  size?: 'small' | 'medium' | 'large'
  showIcon?: boolean
}

export default function ClientDownloadContractButton({
  orderId,
  orderNumber,
  buttonText = '下载合同',
  variant = 'outline',
  size = 'medium',
  showIcon = true
}: ClientDownloadContractButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleDownload = async () => {
    try {
      setLoading(true)
      message.loading({ content: '正在生成合同...', key: 'contract', duration: 0 })

      const response = await fetch(`/api/client/orders/${orderId}/contract`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Type': 'client',
        },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '下载失败')
      }

      const data = await response.json()
      
      console.log('[CLIENT Button] 收到合同数据:', {
        success: data.success,
        htmlLength: data.html?.length,
        debug: data._debug
      })
      
      if (!data.success || !data.html) {
        throw new Error('获取合同内容失败')
      }

      message.loading({ content: '正在转换为 PDF...', key: 'contract', duration: 0 })

      // 使用 jsPDF 的 html 方法生成 PDF（支持中文）
      const doc = new jsPDF('p', 'mm', 'a4')
      
      // 创建临时容器渲染 HTML
      const tempContainer = document.createElement('div')
      tempContainer.innerHTML = data.html
      tempContainer.style.position = 'absolute'
      tempContainer.style.left = '-9999px'
      tempContainer.style.top = '0'
      document.body.appendChild(tempContainer)

      // 生成 PDF
      await doc.html(tempContainer, {
        callback: function(doc) {
          // 保存 PDF 文件名格式：合同-订单号-日期.pdf
          const date = new Date().toISOString().split('T')[0]
          doc.save(`合同-${orderNumber}-${date}.pdf`)
          
          // 清理临时容器
          document.body.removeChild(tempContainer)
          
          message.success({ content: '合同下载成功！', key: 'contract', duration: 2 })
          setLoading(false)
        },
        x: 10,
        y: 10,
        width: 190,
        windowWidth: 800,
        html2canvas: {
          scale: 0.75,
          logging: false,
          useCORS: true,
        }
      })
      
    } catch (error: any) {
      console.error('下载合同失败:', error)
      message.error({ 
        content: error.message || '下载合同失败，请稍后重试', 
        key: 'contract',
        duration: 3
      })
      setLoading(false)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleDownload}
      disabled={loading}
    >
      {showIcon && <FilePdfOutlined className="mr-2" />}
      {loading ? '生成中...' : buttonText}
    </Button>
  )
}
