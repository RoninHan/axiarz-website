/**
 * 合同模板设计器页面
 */
'use client'

import React, { useState, useEffect } from 'react'
import { Button, message, Modal } from 'antd'
import { SaveOutlined, EyeOutlined, ReloadOutlined, PrinterOutlined } from '@ant-design/icons'
import { DndContext, DragEndEvent, DragOverEvent, closestCenter } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import ComponentPalette from '@/components/contract-template/ComponentPalette'
import TemplateCanvas from '@/components/contract-template/TemplateCanvas'
import PropertiesPanel from '@/components/contract-template/PropertiesPanel'
import { ContractTemplate, TemplateComponent, DEFAULT_TEMPLATE } from '@/types/contract-template'
import { renderContractTemplate } from '@/lib/contract-template-renderer'
import { printHtmlInNewWindow, wrapForPrint } from '@/lib/browser-print'
import { useRouter } from 'next/navigation'

export default function ContractTemplatePage() {
  const router = useRouter()
  const [template, setTemplate] = useState<ContractTemplate>(DEFAULT_TEMPLATE)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [previewHtml, setPreviewHtml] = useState<string>('')
  const [previewVisible, setPreviewVisible] = useState(false)

  // 加载已保存的模板
  useEffect(() => {
    loadTemplate()
  }, [])

  const loadTemplate = async () => {
    try {
      const response = await fetch('/api/admin/settings', {
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Type': 'admin'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        const savedTemplate = data.settings.find((s: any) => s.key === 'order_contract_template_json')
        
        if (savedTemplate && savedTemplate.value) {
          try {
            const parsed = JSON.parse(savedTemplate.value)
            setTemplate(parsed)
          } catch (err) {
            console.error('Failed to parse template:', err)
          }
        }
      }
    } catch (error) {
      console.error('Failed to load template:', error)
    }
  }

  const saveTemplate = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Type': 'admin'
        },
        body: JSON.stringify({
          settings: [
            {
              key: 'order_contract_template_json',
              value: JSON.stringify(template)
            }
          ]
        })
      })

      if (response.ok) {
        message.success('模板保存成功')
      } else {
        message.error('保存失败')
      }
    } catch (error) {
      console.error('Failed to save template:', error)
      message.error('保存失败')
    } finally {
      setLoading(false)
    }
  }

  const resetTemplate = () => {
    Modal.confirm({
      title: '确认重置',
      content: '确定要重置为默认模板吗？当前设计将会丢失。',
      onOk: () => {
        setTemplate(DEFAULT_TEMPLATE)
        setSelectedId(null)
        message.success('已重置为默认模板')
      }
    })
  }

  const previewTemplate = () => {
    // 生成模拟数据的预览
    const mockData = {
      orderNumber: 'ORD-2024-001',
      createdAt: new Date().toISOString(),
      status: 'paid',
      paymentStatus: 'paid',
      paymentMethod: 'alipay',
      user: {
        name: '张三',
        email: 'zhangsan@example.com',
        phone: '13800138000'
      },
      address: {
        name: '张三',
        phone: '13800138000',
        province: '广东省',
        city: '深圳市',
        district: '南山区',
        detail: '科技园南区深圳湾科技生态园10栋A座2001',
        postalCode: '518000'
      },
      items: [
        {
          product: { name: '测试商品 A', sku: 'SKU-001' },
          quantity: 2,
          price: 299.00
        },
        {
          product: { name: '测试商品 B', sku: 'SKU-002' },
          quantity: 1,
          price: 599.00
        }
      ],
      originalAmount: 1500.00,
      discountAmount: 303.00,
      totalAmount: 1197.00
    }

    // 使用模板渲染器生成HTML预览
    const html = renderContractTemplate(template, mockData)
    setPreviewHtml(html)
    setPreviewVisible(true)
  }

  const handlePrint = () => {
    // 生成模拟数据
    const mockData = {
      orderNumber: 'ORD-2024-001',
      createdAt: new Date().toISOString(),
      status: 'paid',
      paymentStatus: 'paid',
      paymentMethod: 'alipay',
      user: {
        name: '张三',
        email: 'zhangsan@example.com',
        phone: '13800138000'
      },
      address: {
        name: '张三',
        phone: '13800138000',
        province: '广东省',
        city: '深圳市',
        district: '南山区',
        detail: '科技园南区深圳湾科技生态园10栋A座2001',
        postalCode: '518000'
      },
      items: [
        {
          product: { name: '测试商品 A', sku: 'SKU-001' },
          quantity: 2,
          price: 299.00
        },
        {
          product: { name: '测试商品 B', sku: 'SKU-002' },
          quantity: 1,
          price: 599.00
        }
      ],
      originalAmount: 1500.00,
      discountAmount: 303.00,
      totalAmount: 1197.00
    }

    try {
      // 生成 HTML 内容
      const html = renderContractTemplate(template, mockData)
      const wrappedHtml = wrapForPrint(html, '合同模板预览')
      
      // 使用新的打印工具
      printHtmlInNewWindow(wrappedHtml, {
        title: '合同模板预览',
        delay: 500,
        onBeforePrint: () => {
          console.log('准备打印...')
        },
        onAfterPrint: () => {
          console.log('打印完成')
        }
      })
    } catch (error: any) {
      message.error(error.message || '打印失败')
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) return

    // 从组件库拖拽到画布
    if (active.id.toString().startsWith('palette-')) {
      const componentType = active.data.current?.type
      if (!componentType) return

      // 创建新组件
      const newComponent = createDefaultComponent(componentType)
      setTemplate(prev => ({
        ...prev,
        components: [...prev.components, newComponent]
      }))
      setSelectedId(newComponent.id)
      return
    }

    // 画布内组件重排序
    const oldIndex = template.components.findIndex(c => c.id === active.id)
    const newIndex = template.components.findIndex(c => c.id === over.id)

    if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
      setTemplate(prev => ({
        ...prev,
        components: arrayMove(prev.components, oldIndex, newIndex)
      }))
    }
  }

  const createDefaultComponent = (type: string): TemplateComponent => {
    const id = `${type}-${Date.now()}`
    
    const defaults: Record<string, any> = {
      text: { type, id, props: { content: '请输入文本内容', fontSize: 12, align: 'left', color: '#333' } },
      heading: { type, id, props: { content: '标题', level: 1, align: 'left', color: '#333' } },
      image: { type, id, props: { src: '', alt: '', width: 200, height: 200, align: 'center' } },
      divider: { type, id, props: { thickness: 1, color: '#dddddd', margin: 16 } },
      spacer: { type, id, props: { height: 20 } },
      orderInfo: { type, id, props: { title: '订单信息', fields: [
        { label: '订单号', field: 'orderNumber' },
        { label: '创建时间', field: 'createdAt' },
        { label: '订单状态', field: 'status' },
        { label: '支付状态', field: 'paymentStatus' }
      ]}},
      customerInfo: { type, id, props: { title: '客户信息', fields: [
        { label: '客户姓名', field: 'user.name' },
        { label: '电子邮箱', field: 'user.email' },
        { label: '联系电话', field: 'user.phone' }
      ]}},
      addressInfo: { type, id, props: { title: '收货地址' } },
      productTable: { type, id, props: {
        title: '商品明细',
        showIndex: true,
        headerColor: '#667eea',
        columns: [
          { header: 'SKU', field: 'product.sku', width: 100, align: 'left' },
          { header: '商品名称', field: 'product.name', width: 200, align: 'left' },
          { header: '数量', field: 'quantity', width: 80, align: 'center' },
          { header: '单价', field: 'price', width: 100, align: 'right' },
          { header: '小计', field: 'subtotal', width: 100, align: 'right' }
        ]
      }},
      totalAmount: { type, id, props: { align: 'right', showOriginal: true, showDiscount: true } },
      signature: { type, id, props: { label: '签名', width: 200, showDate: true } }
    }

    return defaults[type] || { type, id, props: {} }
  }

  const handleSelectComponent = (id: string) => {
    setSelectedId(id)
  }

  const handleDeleteComponent = (id: string) => {
    setTemplate(prev => ({
      ...prev,
      components: prev.components.filter(c => c.id !== id)
    }))
    if (selectedId === id) {
      setSelectedId(null)
    }
  }

  const handleUpdateComponent = (updates: Partial<TemplateComponent>) => {
    if (!selectedId) return

    setTemplate(prev => ({
      ...prev,
      components: prev.components.map(c =>
        c.id === selectedId ? { ...c, ...updates } : c
      )
    }))
  }

  const selectedComponent = template.components.find(c => c.id === selectedId) || null

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 顶部工具栏 */}
      <div style={{
        height: '60px',
        backgroundColor: '#fff',
        borderBottom: '1px solid #e0e0e0',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
          合同模板设计器
        </h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button icon={<ReloadOutlined />} onClick={resetTemplate}>
            重置
          </Button>
          <Button icon={<EyeOutlined />} onClick={previewTemplate}>
            预览
          </Button>
          <Button 
            icon={<PrinterOutlined />} 
            onClick={handlePrint}
          >
            打印
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={saveTemplate}
            loading={loading}
          >
            保存模板
          </Button>
        </div>
      </div>

      {/* 主内容区 */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <ComponentPalette />
          <TemplateCanvas
            components={template.components}
            selectedId={selectedId}
            onSelectComponent={handleSelectComponent}
            onDeleteComponent={handleDeleteComponent}
          />
          <PropertiesPanel
            component={selectedComponent}
            onUpdate={handleUpdateComponent}
          />
        </DndContext>
      </div>

      {/* 预览模态框 */}
      <Modal
        title="模板预览"
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        width={900}
        footer={[
          <Button key="print" icon={<PrinterOutlined />} onClick={handlePrint}>
            打印预览
          </Button>,
          <Button key="close" onClick={() => setPreviewVisible(false)}>
            关闭
          </Button>
        ]}
        style={{ top: 20 }}
        bodyStyle={{ 
          maxHeight: 'calc(100vh - 200px)', 
          overflowY: 'auto',
          padding: '24px',
          backgroundColor: '#f5f5f5'
        }}
      >
        <div 
          style={{
            backgroundColor: '#fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            borderRadius: '4px'
          }}
          dangerouslySetInnerHTML={{ __html: previewHtml }} 
        />
      </Modal>
    </div>
  )
}
