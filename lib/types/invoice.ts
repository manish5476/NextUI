export interface InvoiceItem {
  id: string
  product: string
  productDetails?: {
    _id: string
    title: string
    rate: number
    gstRate: number
  }
  quantity: number
  discount: number
  rate: number
  taxableValue: number
  gstRate: number
  gstAmount: number
  amount: number
}

export interface Invoice {
  _id?: string
  invoiceNumber: string
  invoiceDate: string
  dueDate?: string
  seller: string
  sellerDetails?: {
    _id: string
    name: string
    company: string
    address: string
    gstNumber: string
  }
  buyer: string
  buyerDetails?: {
    _id: string
    fullname: string
    address: string
    gstNumber?: string
  }
  items: InvoiceItem[]
  subTotal: number
  totalDiscount: number
  gst: number
  cess: number
  totalAmount: number
  taxableValue: number
  placeOfSupply: string
  roundUp: boolean
  roundDown: boolean
  paymentTerms?: string
  notes?: string
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled"
  metadata?: Record<string, any>
  createdAt?: string
  updatedAt?: string
}

export interface InvoiceFormData extends Omit<Invoice, "_id" | "createdAt" | "updatedAt"> {}

export interface DropdownOption {
  _id: string
  name?: string
  fullname?: string
  title?: string
  company?: string
}

export interface AutopopulateData {
  products: DropdownOption[]
  customers: DropdownOption[]
  sellers: DropdownOption[]
}
