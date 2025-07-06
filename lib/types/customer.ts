export interface CustomerPhone {
  number: string
  type: "home" | "mobile" | "work"
  primary: boolean
}

export interface CustomerAddress {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
  type: "billing" | "shipping" | "home" | "work"
  isDefault: boolean
}

export interface CustomerCartItem {
  productId: {
    _id: string
    title: string
    description: string
    price: number
    image?: string
  }
  quantity: number
  invoiceIds: Array<{
    _id: string
    invoiceDate: string
    totalAmount: number
    status: "pending" | "paid" | "overdue" | "cancelled"
  }>
}

export interface CustomerPayment {
  _id: string
  transactionId: string
  amount: number
  status: "pending" | "completed" | "failed" | "refunded"
  method: "cash" | "card" | "upi" | "bank_transfer" | "cheque"
  createdAt: string
}

export interface Customer {
  _id: string
  fullname: string
  email: string
  profileImg?: string
  status: "active" | "inactive" | "pending" | "suspended" | "blocked"
  mobileNumber: string
  phoneNumbers: CustomerPhone[]
  addresses: CustomerAddress[]
  cart: {
    items: CustomerCartItem[]
  }
  guaranteerId?: string
  guaranteer?: {
    _id: string
    fullname: string
    phoneNumbers: CustomerPhone[]
  }
  totalPurchasedAmount: number
  remainingAmount: number
  paymentHistory: CustomerPayment[]
  metadata: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface CreateCustomerRequest {
  fullname: string
  email: string
  status: string
  phoneNumbers: CustomerPhone[]
  addresses: CustomerAddress[]
  guaranteerId?: string
  profileImg?: string
}
