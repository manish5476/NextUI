import { apiClient } from "@/lib/api/api-client"
import type { Customer, ApiResponse, PaginatedResponse } from "@/lib/types"

export class CustomerService {
  // Get all customers
  static async getAllCustomers(): Promise<ApiResponse<PaginatedResponse<Customer>>> {
    return apiClient.get<ApiResponse<PaginatedResponse<Customer>>>("/v1/customers")
  }

  // Get customer by ID
  static async getCustomerById(id: string): Promise<ApiResponse<Customer>> {
    return apiClient.get<ApiResponse<Customer>>(`/v1/customers/${id}`)
  }

  // Create new customer
  static async createCustomer(data: Omit<Customer, "id" | "createdAt" | "updatedAt">): Promise<ApiResponse<Customer>> {
    return apiClient.post<ApiResponse<Customer>>("/v1/customers", data)
  }

  // Update customer
  static async updateCustomer(id: string, data: Partial<Customer>): Promise<ApiResponse<Customer>> {
    return apiClient.patch<ApiResponse<Customer>>(`/v1/customers/${id}`, data)
  }

  // Delete customers
  static async deleteCustomers(ids: string[]): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>("/v1/customers/deletemany", { ids })
  }

  // Get customer dropdown data
  static async getCustomerDropdown(): Promise<ApiResponse<Array<{ id: string; name: string }>>> {
    return apiClient.get<ApiResponse<Array<{ id: string; name: string }>>>("/v1/customers/customerDropDown")
  }

  // Upload profile image
  static async uploadProfileImage(customerId: string, formData: FormData): Promise<ApiResponse<{ imageUrl: string }>> {
    return apiClient.upload<ApiResponse<{ imageUrl: string }>>(`/v1/customers/${customerId}/profile-image`, formData)
  }
}
