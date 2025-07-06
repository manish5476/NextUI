export interface User {
  _id: string
  name: string
  email: string
  role: "user" | "staff" | "admin" | "superAdmin"
  photo?: string
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface Customer {
  _id: string
  name: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  pincode: string
  gstNumber?: string
  createdAt: string
  updatedAt: string
}

export interface Product {
  _id: string
  name: string
  description: string
  price: number
  category: string
  brand: string
  model: string
  stock: number
  sku: string
  images: string[]
  specifications: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface Invoice {
  _id: string
  invoiceNumber: string
  customerId: string
  customer: Customer
  items: InvoiceItem[]
  subtotal: number
  tax: number
  discount: number
  total: number
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled"
  dueDate: string
  createdAt: string
  updatedAt: string
}

export interface InvoiceItem {
  productId: string
  product: Product
  quantity: number
  price: number
  total: number
}

export interface Payment {
  _id: string
  invoiceId: string
  invoice: Invoice
  amount: number
  method: "cash" | "card" | "upi" | "bank_transfer" | "cheque"
  status: "pending" | "completed" | "failed" | "refunded"
  transactionId?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface Seller {
  _id: string
  name: string
  email: string
  phone: string
  company: string
  address: string
  gstNumber: string
  panNumber: string
  bankDetails: {
    accountNumber: string
    ifscCode: string
    bankName: string
    accountHolderName: string
  }
  createdAt: string
  updatedAt: string
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface LoginRequest {
  email: string
  password: string
}

export interface SignupRequest {
  name: string
  email: string
  password: string
  passwordConfirm: string
  role?: "user" | "staff" | "admin" | "superAdmin"
}

export interface LoginResponse {
  token: string
  data: {
    user: User
  }
}
