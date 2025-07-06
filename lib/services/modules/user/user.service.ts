import { BaseApiService } from "../../base-api.service"
import type { User, ApiResponse, PaginatedResponse } from "@/lib/types"

export class UserService extends BaseApiService {
  // Get current user data
  static async getUserData(): Promise<ApiResponse<User>> {
    const service = new UserService()
    return service.get<ApiResponse<User>>("/v1/users/me")
  }

  // Get all users (admin only)
  static async getAllUsers(filterParams?: Record<string, any>): Promise<ApiResponse<PaginatedResponse<User>>> {
    const service = new UserService()
    return service.get<ApiResponse<PaginatedResponse<User>>>("/v1/users/allusers", { params: filterParams })
  }

  // Update user password
  static async updatePassword(data: {
    currentPassword: string
    password: string
    passwordConfirm: string
  }): Promise<ApiResponse<void>> {
    const service = new UserService()
    return service.patch<ApiResponse<void>>("/v1/users/updatePassword", data)
  }

  // Delete current user
  static async deleteUser(): Promise<ApiResponse<void>> {
    const service = new UserService()
    return service.delete<ApiResponse<void>>("/v1/users/me")
  }

  // Update user profile
  static async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    const service = new UserService()
    return service.patch<ApiResponse<User>>("/v1/users/profile", data)
  }
}
