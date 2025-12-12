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
  description: string | null
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
  status: string
  totalAmount: number
  paymentMethod: string | null
  paymentStatus: string
  shippingInfo: string | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
  user?: User
  address?: Address
  items?: OrderItem[]
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
  district: string
  detail: string
  postalCode: string | null
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
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

