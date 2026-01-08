// 用户类型
export interface User {
  id: string
  email: string
  name: string | null
  phone: string | null
  avatar: string | null
  status: string
  createdAt: Date
  updatedAt: Date
}

// 管理员类型
export interface Admin {
  id: string
  email: string
  name: string
  role: string
  status: string
  createdAt: Date
  updatedAt: Date
}

// 分类类型
export interface Category {
  id: string
  name: string
  description: string | null
  sortOrder: number
  status: string
  createdAt: Date
  updatedAt: Date
}

// 产品类型
export interface Product {
  id: string
  name: string
  sku?: string | null
  description: string | null
  content?: string | null
  price: number
  stock: number
  image: string | null
  images: string[]
  categoryId: string | null
  category?: Category | null
  status: string
  featured: boolean
  createdAt: Date
  updatedAt: Date
}

// 订单类型
export interface Order {
  id: string
  userId: string
  addressId: string
  orderNumber: string
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  totalAmount: number
  originalAmount?: number | null
  discountAmount?: number | null
  couponId?: string | null
  paymentMethod: string | null
  paymentStatus: string
  shippingInfo: string | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
  user?: User
  address?: Address
  items?: OrderItem[]
  invoice?: Invoice | null
}

// 订单项类型
export interface OrderItem {
  id: string
  orderId: string
  productId: string
  quantity: number
  price: number
  product?: Product
}

// 地址类型
export interface Address {
  id: string
  userId: string
  name: string
  phone: string
  province: string
  city: string
  district?: string  // 区县字段现在是可选的
  detail: string
  postalCode: string | null
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}

// 发票类型
export interface Invoice {
  id: string
  orderId: string
  type: 'personal' | 'company'
  title: string
  taxNumber?: string | null
  email?: string | null
  status: 'pending' | 'processing' | 'completed' | 'rejected'
  invoiceNumber?: string | null
  invoiceUrl?: string | null
  rejectionReason?: string | null
  createdAt: Date
  updatedAt: Date
}

// 退款申请类型
export interface RefundRequest {
  id: string
  orderId: string
  userId: string
  reason: string
  amount: number
  refundMethod: 'original' | 'bank'
  bankName?: string | null
  bankAccount?: string | null
  accountName?: string | null
  status: 'pending' | 'approved' | 'rejected' | 'completed'
  adminNote?: string | null
  refundTime?: Date | null
  createdAt: Date
  updatedAt: Date
  order?: Order
  user?: User
}

// 购物车项类型
export interface CartItem {
  id: string
  userId: string
  productId: string
  quantity: number
  product?: Product
}

// 支付配置类型
export interface PaymentConfig {
  id: string
  name: string
  displayName: string
  enabled: boolean
  sortOrder: number
  config: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

// 文件类型
export interface FileItem {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  url: string
  uploadedById: string | null
  createdAt: Date
}

// 系统设置类型
export interface Setting {
  id: string
  key: string
  value: any
  createdAt: Date
  updatedAt: Date
}

// 品牌优势类型
export interface BrandAdvantage {
  id: string
  title: string
  description: string
  icon: string
  sortOrder: number
}

// 客户口碑/评价类型
export interface Testimonial {
  id: string
  name: string
  avatar?: string
  rating: number
  content: string
  sortOrder: number
}

// 解决方案类型
export interface Solution {
  id: string
  title: string
  slug: string
  description: string | null
  content: string
  coverImage: string | null
  status: string
  sortOrder: number
  createdAt: Date
  updatedAt: Date
}

// 帮助文章类型
export interface HelpArticle {
  id: string
  title: string
  slug: string
  category: string
  content: string
  excerpt: string | null
  status: string
  sortOrder: number
  viewCount: number
  featured: boolean
  createdAt: Date
  updatedAt: Date
}

// API 响应类型
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// JWT Payload
export interface JWTPayload {
  id: string
  email: string
  role: string
  type: 'user' | 'admin'
}
