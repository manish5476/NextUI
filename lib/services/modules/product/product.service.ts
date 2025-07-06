import { BaseApiService } from "../../base-api.service"
import type { Product, ProductFilter, ProductStats } from "../../../types/product"

export class ProductService extends BaseApiService {
  private readonly endpoint = "/products"

  // Get all products with optional filtering
  async getAllProducts(filter?: ProductFilter): Promise<{
    data: Product[]
    total: number
    page: number
    limit: number
  }> {
    const params = new URLSearchParams()

    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, value.toString())
        }
      })
    }

    const queryString = params.toString()
    const url = queryString ? `${this.endpoint}?${queryString}` : this.endpoint

    return this.get(url)
  }

  // Get product by ID
  async getProductById(id: string): Promise<Product> {
    return this.get(`${this.endpoint}/${id}`)
  }

  // Create new product
  async createProduct(product: Omit<Product, "_id">): Promise<Product> {
    // Calculate price and GST amount before sending
    const productData = this.calculatePricing(product)
    return this.post(this.endpoint, productData)
  }

  // Update product
  async updateProduct(id: string, product: Partial<Product>): Promise<Product> {
    // Recalculate pricing if rate or gstRate changed
    const productData = this.calculatePricing(product)
    return this.put(`${this.endpoint}/${id}`, productData)
  }

  // Delete product
  async deleteProduct(id: string): Promise<void> {
    return this.delete(`${this.endpoint}/${id}`)
  }

  // Bulk delete products
  async bulkDeleteProducts(ids: string[]): Promise<void> {
    return this.post(`${this.endpoint}/bulk-delete`, { ids })
  }

  // Bulk update products
  async bulkUpdateProducts(updates: { id: string; data: Partial<Product> }[]): Promise<Product[]> {
    const processedUpdates = updates.map((update) => ({
      ...update,
      data: this.calculatePricing(update.data),
    }))
    return this.post(`${this.endpoint}/bulk-update`, { updates: processedUpdates })
  }

  // Upload product image
  async uploadProductImage(file: File): Promise<{ url: string }> {
    const formData = new FormData()
    formData.append("image", file)
    return this.post("/upload/product-image", formData)
  }

  // Get product statistics
  async getProductStats(): Promise<ProductStats> {
    return this.get(`${this.endpoint}/stats`)
  }

  // Search products
  async searchProducts(query: string): Promise<Product[]> {
    return this.get(`${this.endpoint}/search?q=${encodeURIComponent(query)}`)
  }

  // Get products by category
  async getProductsByCategory(category: string): Promise<Product[]> {
    return this.get(`${this.endpoint}/category/${encodeURIComponent(category)}`)
  }

  // Get low stock products
  async getLowStockProducts(threshold = 10): Promise<Product[]> {
    return this.get(`${this.endpoint}/low-stock?threshold=${threshold}`)
  }

  // Update stock quantity
  async updateStock(id: string, quantity: number): Promise<Product> {
    return this.patch(`${this.endpoint}/${id}/stock`, { stock: quantity })
  }

  // Calculate pricing helper method
  private calculatePricing(product: Partial<Product>): Partial<Product> {
    const result = { ...product }

    if (result.rate !== undefined && result.gstRate !== undefined) {
      // Calculate GST amount
      result.gstAmount = (result.rate * result.gstRate) / 100

      // Calculate price (rate + GST)
      result.price = result.rate + result.gstAmount

      // Calculate final price (price - discount)
      if (result.discountPercentage && result.discountPercentage > 0) {
        const discountAmount = (result.price * result.discountPercentage) / 100
        result.finalPrice = result.price - discountAmount
      } else {
        result.finalPrice = result.price
      }
    }

    return result
  }

  // Export products to CSV
  async exportProducts(filter?: ProductFilter): Promise<Blob> {
    const params = new URLSearchParams()

    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, value.toString())
        }
      })
    }

    const queryString = params.toString()
    const url = queryString ? `${this.endpoint}/export?${queryString}` : `${this.endpoint}/export`

    return this.getBlob(url)
  }

  // Import products from CSV
  async importProducts(file: File): Promise<{ success: number; errors: string[] }> {
    const formData = new FormData()
    formData.append("file", file)
    return this.post(`${this.endpoint}/import`, formData)
  }
}

// Export singleton instance
export const productService = new ProductService()
