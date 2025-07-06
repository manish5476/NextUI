import { BaseApiService } from "../../base-api.service"
import type { ApiResponse, PaginatedResponse } from "@/lib/types"
import type { Customer, CreateCustomerRequest } from "@/lib/types/customer"

export class CustomerService extends BaseApiService {
  // Get all customers with pagination and filters
  static async getAllCustomers(params?: {
    page?: number
    limit?: number
    search?: string
    status?: string
    sortBy?: string
    sortOrder?: "asc" | "desc"
  }): Promise<{
    status: string
    statusCode: number
    results: number
    data: Customer[]
  }> {
    const service = new CustomerService()
    return service.get<{
      status: string
      statusCode: number
      results: number
      data: Customer[]
    }>("/v1/customers", { params })
  }

  // Get customer by ID with full details
  static async getCustomerById(id: string): Promise<ApiResponse<Customer>> {
    const service = new CustomerService()
    return service.get<ApiResponse<Customer>>(`/v1/customers/${id}`)
  }

  // Create new customer
  static async createCustomer(data: CreateCustomerRequest): Promise<ApiResponse<Customer>> {
    const service = new CustomerService()
    return service.post<ApiResponse<Customer>>("/v1/customers", data)
  }

  // Update customer
  static async updateCustomer(id: string, data: Partial<CreateCustomerRequest>): Promise<ApiResponse<Customer>> {
    const service = new CustomerService()
    return service.patch<ApiResponse<Customer>>(`/v1/customers/${id}`, data)
  }

  // Delete single customer
  static async deleteCustomer(id: string): Promise<ApiResponse<void>> {
    const service = new CustomerService()
    return service.delete<ApiResponse<void>>(`/v1/customers/${id}`)
  }

  // Delete multiple customers
  static async deleteCustomers(ids: string[]): Promise<ApiResponse<void>> {
    const service = new CustomerService()
    return service.delete<ApiResponse<void>>("/v1/customers/deletemany", { ids })
  }

  // Get customer dropdown data
  static async getCustomerDropdown(): Promise<
    ApiResponse<Array<{ _id: string; fullname: string; phoneNumbers: any[] }>>
  > {
    const service = new CustomerService()
    return service.get<ApiResponse<Array<{ _id: string; fullname: string; phoneNumbers: any[] }>>>(
      "/v1/customers/customerDropDown",
    )
  }

  // Upload profile image
  static async uploadProfileImage(formData: FormData, customerId?: string): Promise<ApiResponse<{ imageUrl: string }>> {
    const service = new CustomerService()
    return service.upload<ApiResponse<{ imageUrl: string }>>(`/v1/image/postImages`, formData)
  }

  // Get customer statistics
  static async getCustomerStats(): Promise<
    ApiResponse<{
      totalCustomers: number
      activeCustomers: number
      totalRevenue: number
      averageOrderValue: number
    }>
  > {
    const service = new CustomerService()
    return service.get<ApiResponse<any>>("/v1/customers/stats")
  }
}
