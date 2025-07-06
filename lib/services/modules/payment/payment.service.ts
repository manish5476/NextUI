import { BaseApiService } from "../../base-api.service"
import type { Payment, ApiResponse, PaginatedResponse } from "@/lib/types"

export class PaymentService extends BaseApiService {
  // Get all payments
  static async getAllPayments(filterParams?: Record<string, any>): Promise<ApiResponse<PaginatedResponse<Payment>>> {
    const service = new PaymentService()
    return service.get<ApiResponse<PaginatedResponse<Payment>>>("/v1/payments", { params: filterParams })
  }

  // Get payment by ID
  static async getPaymentById(id: string): Promise<ApiResponse<Payment>> {
    const service = new PaymentService()
    return service.get<ApiResponse<Payment>>(`/v1/payments/${id}`)
  }

  // Create new payment
  static async createPayment(data: Omit<Payment, "_id" | "createdAt" | "updatedAt">): Promise<ApiResponse<Payment>> {
    const service = new PaymentService()
    return service.post<ApiResponse<Payment>>("/v1/payments", data)
  }

  // Update payment
  static async updatePayment(id: string, data: Partial<Payment>): Promise<ApiResponse<Payment>> {
    const service = new PaymentService()
    return service.patch<ApiResponse<Payment>>(`/v1/payments/${id}`, data)
  }

  // Delete payments
  static async deletePayments(ids: string[]): Promise<ApiResponse<void>> {
    const service = new PaymentService()
    return service.delete<ApiResponse<void>>("/v1/payments/deletemany", { ids })
  }
}
