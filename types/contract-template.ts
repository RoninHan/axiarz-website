// 合同模板组件类型定义

export type TemplateComponentType = 
  | 'text'           // 文本块
  | 'heading'        // 标题
  | 'image'          // 图片
  | 'divider'        // 分割线
  | 'spacer'         // 空白间隔
  | 'orderInfo'      // 订单信息
  | 'customerInfo'   // 客户信息
  | 'addressInfo'    // 收货地址
  | 'productTable'   // 产品明细表格
  | 'totalAmount'    // 金额汇总
  | 'signature'      // 签名区域

export interface TemplateComponent {
  id: string
  type: TemplateComponentType
  props: Record<string, any>
  styles?: Record<string, any>
}

// 文本组件
export interface TextComponent extends TemplateComponent {
  type: 'text'
  props: {
    content: string      // 支持 {{placeholder}} 占位符
    align?: 'left' | 'center' | 'right'
    fontSize?: number
    color?: string
    bold?: boolean
    italic?: boolean
  }
}

// 标题组件
export interface HeadingComponent extends TemplateComponent {
  type: 'heading'
  props: {
    content: string
    level: 1 | 2 | 3 | 4
    align?: 'left' | 'center' | 'right'
    color?: string
  }
}

// 图片组件
export interface ImageComponent extends TemplateComponent {
  type: 'image'
  props: {
    src: string          // URL 或占位符
    alt?: string
    width?: number
    height?: number
    align?: 'left' | 'center' | 'right'
  }
}

// 分割线组件
export interface DividerComponent extends TemplateComponent {
  type: 'divider'
  props: {
    color?: string
    thickness?: number
    margin?: number
  }
}

// 空白间隔组件
export interface SpacerComponent extends TemplateComponent {
  type: 'spacer'
  props: {
    height: number
  }
}

// 订单信息组件
export interface OrderInfoComponent extends TemplateComponent {
  type: 'orderInfo'
  props: {
    title?: string
    fields: Array<{
      label: string
      field: string      // 例如: orderNumber, createdAt, status
    }>
    layout?: 'vertical' | 'horizontal'
  }
}

// 客户信息组件
export interface CustomerInfoComponent extends TemplateComponent {
  type: 'customerInfo'
  props: {
    title?: string
    fields: Array<{
      label: string
      field: string      // 例如: user.name, user.email
    }>
  }
}

// 收货地址组件
export interface AddressInfoComponent extends TemplateComponent {
  type: 'addressInfo'
  props: {
    title?: string
    format?: 'full' | 'compact'
  }
}

// 产品表格组件
export interface ProductTableComponent extends TemplateComponent {
  type: 'productTable'
  props: {
    title?: string
    columns: Array<{
      header: string
      field: string      // 例如: product.name, quantity, price
      width?: number
      align?: 'left' | 'center' | 'right'
    }>
    showIndex?: boolean
    headerColor?: string
    borderColor?: string
  }
}

// 金额汇总组件
export interface TotalAmountComponent extends TemplateComponent {
  type: 'totalAmount'
  props: {
    title?: string
    showOriginal?: boolean
    showDiscount?: boolean
    align?: 'left' | 'right'
  }
}

// 签名区域组件
export interface SignatureComponent extends TemplateComponent {
  type: 'signature'
  props: {
    label?: string
    showDate?: boolean
    width?: number
  }
}

// 完整的模板定义
export interface ContractTemplate {
  id: string
  name: string
  description?: string
  components: TemplateComponent[]
  styles?: {
    pageSize?: 'A4' | 'Letter'
    margin?: number
    fontFamily?: string
    backgroundColor?: string
  }
  createdAt?: Date
  updatedAt?: Date
}

// 默认模板
export const DEFAULT_TEMPLATE: ContractTemplate = {
  id: 'default',
  name: '默认合同模板',
  components: [
    {
      id: 'heading-1',
      type: 'heading',
      props: {
        content: '订单合同',
        level: 1,
        align: 'center',
        color: '#667eea'
      }
    },
    {
      id: 'text-1',
      type: 'text',
      props: {
        content: 'AXIARZ Technology Co., Ltd.',
        align: 'center',
        fontSize: 12,
        color: '#666'
      }
    },
    {
      id: 'divider-1',
      type: 'divider',
      props: {
        color: '#667eea',
        thickness: 2,
        margin: 20
      }
    },
    {
      id: 'orderinfo-1',
      type: 'orderInfo',
      props: {
        title: '订单信息',
        fields: [
          { label: '订单号', field: 'orderNumber' },
          { label: '下单时间', field: 'createdAt' },
          { label: '订单状态', field: 'status' },
          { label: '支付状态', field: 'paymentStatus' }
        ]
      }
    },
    {
      id: 'customerinfo-1',
      type: 'customerInfo',
      props: {
        title: '客户信息',
        fields: [
          { label: '姓名', field: 'user.name' },
          { label: '邮箱', field: 'user.email' },
          { label: '电话', field: 'user.phone' }
        ]
      }
    },
    {
      id: 'addressinfo-1',
      type: 'addressInfo',
      props: {
        title: '收货地址',
        format: 'full'
      }
    },
    {
      id: 'producttable-1',
      type: 'productTable',
      props: {
        title: '商品明细',
        showIndex: true,
        columns: [
          { header: 'SKU', field: 'product.sku', align: 'center', width: 100 },
          { header: '产品名称', field: 'product.name', align: 'left' },
          { header: '数量', field: 'quantity', align: 'center', width: 80 },
          { header: '单价', field: 'price', align: 'right', width: 100 },
          { header: '小计', field: 'subtotal', align: 'right', width: 120 }
        ],
        headerColor: '#667eea',
        borderColor: '#ddd'
      }
    },
    {
      id: 'totalamount-1',
      type: 'totalAmount',
      props: {
        showOriginal: true,
        showDiscount: true,
        align: 'right'
      }
    },
    {
      id: 'spacer-1',
      type: 'spacer',
      props: {
        height: 40
      }
    },
    {
      id: 'signature-1',
      type: 'signature',
      props: {
        label: '客户签名',
        showDate: true,
        width: 200
      }
    },
    {
      id: 'text-footer',
      type: 'text',
      props: {
        content: '本合同具有法律效力，请妥善保管',
        align: 'center',
        fontSize: 10,
        color: '#999'
      }
    }
  ],
  styles: {
    pageSize: 'A4',
    margin: 20,
    fontFamily: 'Microsoft YaHei, SimSun, Arial, sans-serif',
    backgroundColor: '#ffffff'
  }
}
