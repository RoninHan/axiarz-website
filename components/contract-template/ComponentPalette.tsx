/**
 * 组件面板 - 可拖拽的组件列表
 */
'use client'

import React from 'react'
import { useDraggable } from '@dnd-kit/core'
import { 
  FileTextOutlined, 
  FontSizeOutlined, 
  PictureOutlined, 
  LineOutlined, 
  ColumnHeightOutlined,
  FileSearchOutlined,
  UserOutlined,
  EnvironmentOutlined,
  TableOutlined,
  DollarOutlined,
  EditOutlined
} from '@ant-design/icons'
import { TemplateComponentType } from '@/types/contract-template'

interface ComponentItem {
  type: TemplateComponentType
  label: string
  icon: React.ReactNode
  description: string
}

const COMPONENT_ITEMS: ComponentItem[] = [
  {
    type: 'text',
    label: '文本',
    icon: <FileTextOutlined />,
    description: '普通文本段落'
  },
  {
    type: 'heading',
    label: '标题',
    icon: <FontSizeOutlined />,
    description: '大标题 (H1-H6)'
  },
  {
    type: 'image',
    label: '图片',
    icon: <PictureOutlined />,
    description: '插入图片'
  },
  {
    type: 'divider',
    label: '分隔线',
    icon: <LineOutlined />,
    description: '水平分隔线'
  },
  {
    type: 'spacer',
    label: '间距',
    icon: <ColumnHeightOutlined />,
    description: '空白间距'
  },
  {
    type: 'orderInfo',
    label: '订单信息',
    icon: <FileSearchOutlined />,
    description: '订单号、日期、状态等'
  },
  {
    type: 'customerInfo',
    label: '客户信息',
    icon: <UserOutlined />,
    description: '客户姓名、邮箱、电话'
  },
  {
    type: 'addressInfo',
    label: '地址信息',
    icon: <EnvironmentOutlined />,
    description: '收货地址详情'
  },
  {
    type: 'productTable',
    label: '商品表格',
    icon: <TableOutlined />,
    description: '商品列表明细表'
  },
  {
    type: 'totalAmount',
    label: '总金额',
    icon: <DollarOutlined />,
    description: '订单总金额汇总'
  },
  {
    type: 'signature',
    label: '签名栏',
    icon: <EditOutlined />,
    description: '签名区域'
  }
]

interface DraggableComponentProps {
  item: ComponentItem
}

function DraggableComponent({ item }: DraggableComponentProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${item.type}`,
    data: { type: item.type }
  })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`component-item ${isDragging ? 'dragging' : ''}`}
      style={{
        padding: '12px',
        margin: '8px 0',
        backgroundColor: isDragging ? '#e6f7ff' : '#fff',
        border: '1px solid #d9d9d9',
        borderRadius: '4px',
        cursor: 'grab',
        transition: 'all 0.2s',
        userSelect: 'none'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
        <span style={{ fontSize: '18px', marginRight: '8px', color: '#1890ff' }}>
          {item.icon}
        </span>
        <span style={{ fontWeight: 'bold' }}>{item.label}</span>
      </div>
      <div style={{ fontSize: '12px', color: '#999', marginLeft: '26px' }}>
        {item.description}
      </div>
    </div>
  )
}

export default function ComponentPalette() {
  return (
    <div style={{
      width: '250px',
      height: '100%',
      backgroundColor: '#fafafa',
      borderRight: '1px solid #e0e0e0',
      padding: '16px',
      overflowY: 'auto'
    }}>
      <h3 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: 'bold' }}>
        组件库
      </h3>
      <div>
        {COMPONENT_ITEMS.map(item => (
          <DraggableComponent key={item.type} item={item} />
        ))}
      </div>
    </div>
  )
}
