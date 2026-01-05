'use client'

import { Button, message } from 'antd'
import { FilePdfOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { jsPDF } from 'jspdf'

interface DownloadContractButtonProps {
  orderId: string
  orderNumber: string
  isAdmin?: boolean
  buttonText?: string
  type?: 'primary' | 'default' | 'dashed' | 'link' | 'text'
  size?: 'large' | 'middle' | 'small'
  icon?: boolean
}

export default function DownloadContractButton({
  orderId,
  orderNumber,
  isAdmin = false,
  buttonText = '下载合同',
  type = 'primary',
  size = 'middle',
  icon = true
}: DownloadContractButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleDownload = async () => {
    try {
      setLoading(true)
      
      // 根据是否是管理员选择不同的API端点
      const apiUrl = isAdmin 
        ? `/api/admin/orders/${orderId}/contract`
        : `/api/client/orders/${orderId}/contract`

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      
      // 添加认证类型标识
      if (isAdmin) {
        headers['X-Auth-Type'] = 'admin'
      } else {
        headers['X-Auth-Type'] = 'client'
      }

      const response = await fetch(apiUrl, {
        method: 'GET',
        credentials: 'include',
        headers,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '下载失败')
      }

      // 获取 HTML 内容
      const data = await response.json()
      
      console.log('[ADMIN Button] 收到合同数据:', {
        success: data.success,
        htmlLength: data.html?.length,
        debug: data._debug
      })
      
      if (!data.success || !data.html) {
        throw new Error('获取合同内容失败')
      }

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
          message.success('合同下载成功')
          setLoading(false)
        },
        x: 10,
        y: 10,
        width: 190,
        windowWidth: 800,
        html2canvas: {
          scale: 0.75
        }
      })
      
    } catch (error: any) {
      console.error('下载合同失败:', error)
      message.error(error.message || '下载合同失败，请稍后重试')
      setLoading(false)
    }
  }

  return (
    <Button
      type={type}
      size={size}
      icon={icon ? <FilePdfOutlined /> : undefined}
      loading={loading}
      onClick={handleDownload}
    >
      {buttonText}
    </Button>
  )
}
