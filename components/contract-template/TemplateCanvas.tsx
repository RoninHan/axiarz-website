/**
 * 模板画布 - 拖放区域和组件排序
 */
'use client'

import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { DeleteOutlined, DragOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import { TemplateComponent } from '@/types/contract-template'

interface SortableComponentProps {
  component: TemplateComponent
  index: number
  isSelected: boolean
  onSelect: () => void
  onDelete: () => void
}

function SortableComponent({ component, index, isSelected, onSelect, onDelete }: SortableComponentProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: component.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  const getComponentPreview = () => {
    switch (component.type) {
      case 'text':
        return <div style={{ fontSize: component.props.fontSize || 12 }}>{component.props.content || '文本内容'}</div>
      case 'heading':
        const HeadingTag = `h${component.props.level || 1}` as keyof JSX.IntrinsicElements
        return <HeadingTag style={{ margin: 0, fontSize: 20 - (component.props.level || 1) * 2 }}>{component.props.content || '标题'}</HeadingTag>
      case 'image':
        return <div style={{ color: '#999' }}>🖼️ 图片: {component.props.src || '未设置'}</div>
      case 'divider':
        return <hr style={{ borderColor: component.props.color || '#ddd', margin: '8px 0' }} />
      case 'spacer':
        return <div style={{ color: '#999' }}>↕️ 间距: {component.props.height || 20}px</div>
      case 'orderInfo':
        return <div style={{ color: '#1890ff' }}>📋 {component.props.title || '订单信息'}</div>
      case 'customerInfo':
        return <div style={{ color: '#1890ff' }}>👤 {component.props.title || '客户信息'}</div>
      case 'addressInfo':
        return <div style={{ color: '#1890ff' }}>📍 {component.props.title || '地址信息'}</div>
      case 'productTable':
        return <div style={{ color: '#1890ff' }}>📊 {component.props.title || '商品表格'}</div>
      case 'totalAmount':
        return <div style={{ color: '#ff4d4f' }}>💰 总金额</div>
      case 'signature':
        return <div style={{ color: '#999' }}>✍️ {component.props.label || '签名'}</div>
      default:
        return <div>未知组件</div>
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={`canvas-component ${isSelected ? 'selected' : ''}`}
    >
      <div style={{
        padding: '12px',
        margin: '8px 0',
        backgroundColor: isSelected ? '#e6f7ff' : '#fff',
        border: isSelected ? '2px solid #1890ff' : '1px solid #d9d9d9',
        borderRadius: '4px',
        cursor: 'pointer',
        position: 'relative',
        transition: 'all 0.2s'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ flex: 1, marginRight: '8px' }}>
            {getComponentPreview()}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button
              {...listeners}
              {...attributes}
              type="text"
              size="small"
              icon={<DragOutlined />}
              style={{ cursor: 'grab' }}
            />
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

interface TemplateCanvasProps {
  components: TemplateComponent[]
  selectedId: string | null
  onSelectComponent: (id: string) => void
  onDeleteComponent: (id: string) => void
}

export default function TemplateCanvas({
  components,
  selectedId,
  onSelectComponent,
  onDeleteComponent
}: TemplateCanvasProps) {
  const { setNodeRef } = useDroppable({
    id: 'canvas-droppable'
  })

  return (
    <div style={{
      flex: 1,
      height: '100%',
      backgroundColor: '#fff',
      padding: '16px',
      overflowY: 'auto'
    }}>
      <div style={{
        marginBottom: '16px',
        paddingBottom: '12px',
        borderBottom: '1px solid #e0e0e0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
          模板画布
        </h3>
        <span style={{ color: '#999', fontSize: '12px' }}>
          {components.length} 个组件
        </span>
      </div>

      <div
        ref={setNodeRef}
        style={{
          minHeight: '500px',
          border: '2px dashed #d9d9d9',
          borderRadius: '4px',
          padding: '16px',
          backgroundColor: '#fafafa'
        }}
      >
        {components.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#999'
          }}>
            <p style={{ fontSize: '16px', marginBottom: '8px' }}>拖拽组件到此处开始设计</p>
            <p style={{ fontSize: '12px' }}>从左侧组件库中选择组件并拖拽到这里</p>
          </div>
        ) : (
          <SortableContext items={components.map(c => c.id)} strategy={verticalListSortingStrategy}>
            {components.map((component, index) => (
              <SortableComponent
                key={component.id}
                component={component}
                index={index}
                isSelected={selectedId === component.id}
                onSelect={() => onSelectComponent(component.id)}
                onDelete={() => onDeleteComponent(component.id)}
              />
            ))}
          </SortableContext>
        )}
      </div>
    </div>
  )
}
