import { BaseApiService } from "../../base-api.service"
import type { Seller, ApiResponse, PaginatedResponse } from "@/lib/types"

export class SellerService extends BaseApiService {
  // Get seller by ID
  static async getSellerById(id: string): Promise<ApiResponse<Seller>> {
    const service = new SellerService()
    return service.get<ApiResponse<Seller>>(`/v1/sellers/${id}`)
  }

  // Create new seller
  static async createSeller(data: Omit<Seller, "_id" | "createdAt" | "updatedAt">): Promise<ApiResponse<Seller>> {
    const service = new SellerService()
    return service.post<ApiResponse<Seller>>("/v1/sellers", data)
  }

  // Get all sellers
  static async getAllSellers(filterParams?: Record<string, any>): Promise<ApiResponse<PaginatedResponse<Seller>>> {
    const service = new SellerService()
    return service.get<ApiResponse<PaginatedResponse<Seller>>>("/v1/sellers", { params: filterParams })
  }

  // Update seller
  static async updateSeller(id: string, data: Partial<Seller>): Promise<ApiResponse<Seller>> {
    const service = new SellerService()
    return service.patch<ApiResponse<Seller>>(`/v1/sellers/${id}`, data)
  }
}
