/**
 * 属性面板 - 编辑选中组件的属性
 */
'use client'

import React from 'react'
import { Form, Input, InputNumber, Select, Switch, ColorPicker, Button } from 'antd'
import { TemplateComponent } from '@/types/contract-template'
import { Color } from 'antd/es/color-picker'

const { TextArea } = Input
const { Option } = Select

interface PropertiesPanelProps {
  component: TemplateComponent | null
  onUpdate: (updates: Partial<TemplateComponent>) => void
}

export default function PropertiesPanel({ component, onUpdate }: PropertiesPanelProps) {
  const [form] = Form.useForm()

  React.useEffect(() => {
    if (component) {
      form.setFieldsValue({
        ...component.props,
        ...component.styles
      })
    }
  }, [component, form])

  if (!component) {
    return (
      <div style={{
        width: '300px',
        height: '100%',
        backgroundColor: '#fafafa',
        borderLeft: '1px solid #e0e0e0',
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center', color: '#999' }}>
          <p>请选择一个组件</p>
          <p style={{ fontSize: '12px' }}>在画布中点击组件查看其属性</p>
        </div>
      </div>
    )
  }

  const handleChange = (changedValues: any) => {
    onUpdate({
      props: { ...component.props, ...changedValues }
    })
  }

  const renderFormFields = () => {
    switch (component.type) {
      case 'text':
        return (
          <>
            <Form.Item label="内容" name="content">
              <TextArea rows={4} placeholder="输入文本内容" />
            </Form.Item>
            <Form.Item label="字体大小" name="fontSize">
              <InputNumber min={8} max={72} placeholder="12" />
            </Form.Item>
            <Form.Item label="对齐方式" name="align">
              <Select placeholder="选择对齐方式">
                <Option value="left">左对齐</Option>
                <Option value="center">居中</Option>
                <Option value="right">右对齐</Option>
              </Select>
            </Form.Item>
            <Form.Item label="颜色" name="color">
              <Input placeholder="#333333" />
            </Form.Item>
            <Form.Item label="加粗" name="bold" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item label="斜体" name="italic" valuePropName="checked">
              <Switch />
            </Form.Item>
          </>
        )

      case 'heading':
        return (
          <>
            <Form.Item label="标题内容" name="content">
              <Input placeholder="输入标题" />
            </Form.Item>
            <Form.Item label="标题级别" name="level">
              <Select placeholder="选择标题级别">
                {[1, 2, 3, 4, 5, 6].map(l => (
                  <Option key={l} value={l}>H{l}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label="对齐方式" name="align">
              <Select placeholder="选择对齐方式">
                <Option value="left">左对齐</Option>
                <Option value="center">居中</Option>
                <Option value="right">右对齐</Option>
              </Select>
            </Form.Item>
            <Form.Item label="颜色" name="color">
              <Input placeholder="#333333" />
            </Form.Item>
          </>
        )

      case 'image':
        return (
          <>
            <Form.Item label="图片地址" name="src">
              <Input placeholder="https://example.com/image.png" />
            </Form.Item>
            <Form.Item label="替代文字" name="alt">
              <Input placeholder="图片描述" />
            </Form.Item>
            <Form.Item label="宽度 (px)" name="width">
              <InputNumber min={50} max={1000} placeholder="auto" />
            </Form.Item>
            <Form.Item label="高度 (px)" name="height">
              <InputNumber min={50} max={1000} placeholder="auto" />
            </Form.Item>
            <Form.Item label="对齐方式" name="align">
              <Select placeholder="选择对齐方式">
                <Option value="left">左对齐</Option>
                <Option value="center">居中</Option>
                <Option value="right">右对齐</Option>
              </Select>
            </Form.Item>
          </>
        )

      case 'divider':
        return (
          <>
            <Form.Item label="粗细 (px)" name="thickness">
              <InputNumber min={1} max={10} placeholder="1" />
            </Form.Item>
            <Form.Item label="颜色" name="color">
              <Input placeholder="#dddddd" />
            </Form.Item>
            <Form.Item label="边距 (px)" name="margin">
              <InputNumber min={0} max={100} placeholder="16" />
            </Form.Item>
          </>
        )

      case 'spacer':
        return (
          <>
            <Form.Item label="高度 (px)" name="height">
              <InputNumber min={5} max={200} placeholder="20" />
            </Form.Item>
          </>
        )

      case 'orderInfo':
        return (
          <>
            <Form.Item label="标题" name="title">
              <Input placeholder="订单信息" />
            </Form.Item>
            <div style={{ marginBottom: '16px', color: '#666', fontSize: '12px' }}>
              可用字段: orderNumber (订单号), createdAt (创建时间), status (状态), paymentStatus (支付状态)
            </div>
          </>
        )

      case 'customerInfo':
        return (
          <>
            <Form.Item label="标题" name="title">
              <Input placeholder="客户信息" />
            </Form.Item>
            <div style={{ marginBottom: '16px', color: '#666', fontSize: '12px' }}>
              可用字段: user.name (姓名), user.email (邮箱), user.phone (电话)
            </div>
          </>
        )

      case 'addressInfo':
        return (
          <>
            <Form.Item label="标题" name="title">
              <Input placeholder="收货地址" />
            </Form.Item>
            <div style={{ marginBottom: '16px', color: '#666', fontSize: '12px' }}>
              包含: 收件人、电话、省市区、详细地址、邮编
            </div>
          </>
        )

      case 'productTable':
        return (
          <>
            <Form.Item label="标题" name="title">
              <Input placeholder="商品明细" />
            </Form.Item>
            <Form.Item label="表头颜色" name="headerColor">
              <Input placeholder="#667eea" />
            </Form.Item>
            <Form.Item label="显示序号" name="showIndex" valuePropName="checked">
              <Switch />
            </Form.Item>
            <div style={{ marginBottom: '16px', color: '#666', fontSize: '12px' }}>
              默认列: SKU、商品名称、数量、单价、小计
            </div>
          </>
        )

      case 'totalAmount':
        return (
          <>
            <Form.Item label="对齐方式" name="align">
              <Select placeholder="选择对齐方式">
                <Option value="left">左对齐</Option>
                <Option value="center">居中</Option>
                <Option value="right">右对齐</Option>
              </Select>
            </Form.Item>
            <Form.Item label="显示原价" name="showOriginal" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item label="显示优惠" name="showDiscount" valuePropName="checked">
              <Switch />
            </Form.Item>
          </>
        )

      case 'signature':
        return (
          <>
            <Form.Item label="标签" name="label">
              <Input placeholder="签名" />
            </Form.Item>
            <Form.Item label="宽度 (px)" name="width">
              <InputNumber min={100} max={400} placeholder="200" />
            </Form.Item>
            <Form.Item label="显示日期" name="showDate" valuePropName="checked">
              <Switch />
            </Form.Item>
          </>
        )

      default:
        return <div>未知组件类型</div>
    }
  }

  return (
    <div style={{
      width: '300px',
      height: '100%',
      backgroundColor: '#fafafa',
      borderLeft: '1px solid #e0e0e0',
      padding: '16px',
      overflowY: 'auto'
    }}>
      <h3 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: 'bold' }}>
        属性设置
      </h3>

      <Form
        form={form}
        layout="vertical"
        onValuesChange={handleChange}
      >
        {renderFormFields()}
      </Form>
    </div>
  )
}
