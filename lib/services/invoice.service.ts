import { apiClient } from "@/lib/api/api-client"
import type { Invoice, ApiResponse, PaginatedResponse } from "@/lib/types"

export class InvoiceService {
  // Get all invoices
  static async getAllInvoices(): Promise<ApiResponse<PaginatedResponse<Invoice>>> {
    return apiClient.get<ApiResponse<PaginatedResponse<Invoice>>>("/v1/invoices")
  }

  // Get invoice by ID
  static async getInvoiceById(id: string): Promise<ApiResponse<Invoice>> {
    return apiClient.get<ApiResponse<Invoice>>(`/v1/invoices/${id}`)
  }

  // Create new invoice
  static async createInvoice(data: Omit<Invoice, "id" | "createdAt" | "updatedAt">): Promise<ApiResponse<Invoice>> {
    return apiClient.post<ApiResponse<Invoice>>("/v1/invoices", data)
  }

  // Update invoice
  static async updateInvoice(id: string, data: Partial<Invoice>): Promise<ApiResponse<Invoice>> {
    return apiClient.patch<ApiResponse<Invoice>>(`/v1/invoices/${id}`, data)
  }

  // Delete invoices
  static async deleteInvoices(ids: string[]): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>("/v1/invoices/deletemany", { ids })
  }

  // Get product sales data
  static async getProductSales(data: any): Promise<ApiResponse<any>> {
    return apiClient.post<ApiResponse<any>>("/v1/invoices/productSales", data)
  }
}
