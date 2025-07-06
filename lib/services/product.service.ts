import { BaseApiService } from "./base-api.service"
import type { Product, ApiResponse, PaginatedResponse } from "@/lib/types"

export class ProductService extends BaseApiService {
  // Get all products with optional filters
  static async getAllProducts(filterParams?: Record<string, any>): Promise<ApiResponse<PaginatedResponse<Product>>> {
    const service = new ProductService()
    return service.get<ApiResponse<PaginatedResponse<Product>>>("/v1/products", { params: filterParams })
  }

  // Get product by ID
  static async getProductById(id: string): Promise<ApiResponse<Product>> {
    const service = new ProductService()
    return service.get<ApiResponse<Product>>(`/v1/products/${id}`)
  }

  // Create new product
  static async createProduct(data: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<ApiResponse<Product>> {
    const service = new ProductService()
    return service.post<ApiResponse<Product>>("/v1/products", data)
  }

  // Update product
  static async updateProduct(id: string, data: Partial<Product>): Promise<ApiResponse<Product>> {
    const service = new ProductService()
    return service.patch<ApiResponse<Product>>(`/v1/products/${id}`, data)
  }

  // Delete single product
  static async deleteProduct(id: string): Promise<ApiResponse<void>> {
    const service = new ProductService()
    return service.delete<ApiResponse<void>>(`/v1/products/${id}`)
  }

  // Delete multiple products
  static async deleteProducts(ids: string[]): Promise<ApiResponse<void>> {
    const service = new ProductService()
    return service.delete<ApiResponse<void>>("/v1/products/deletemany", { ids })
  }

  // Get autopopulate data
  static async getAutopopulateData(): Promise<ApiResponse<any>> {
    const service = new ProductService()
    return service.get<ApiResponse<any>>("/v1/products/autopopulate")
  }
}
