export interface Product {
  _id?: string
  title: string
  slug?: string
  description: string
  category: string
  tags: string[]
  brand: string
  sku: string
  thumbnail: string
  images?: string[]
  rate: number
  price?: number
  gstRate: number
  gstAmount?: number
  discountPercentage?: number
  finalPrice?: number
  stock: number
  availabilityStatus: "In Stock" | "Low Stock" | "Out of Stock"
  weight?: number
  dimensions?: {
    width: number
    height: number
    depth: number
  }
  warrantyInformation?: string
  shippingInformation?: string
  returnPolicy?: string
  minimumOrderQuantity?: number
  reviews?: ProductReview[]
  rating?: number
  meta?: {
    createdAt: Date
    updatedAt: Date
    barcode?: string
    qrCode?: string
  }
}

export interface ProductReview {
  _id?: string
  rating: number
  comment: string
  date: Date
  reviewerName: string
  reviewerEmail: string
}

export interface ProductFilter {
  search?: string
  category?: string
  brand?: string
  minPrice?: number
  maxPrice?: number
  availabilityStatus?: string
  inStock?: boolean
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export interface ProductStats {
  totalProducts: number
  inStock: number
  lowStock: number
  outOfStock: number
  totalValue: number
  averagePrice: number
}
