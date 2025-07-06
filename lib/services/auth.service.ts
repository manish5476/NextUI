import { BaseApiService } from "./base-api.service"

export interface LoginRequest {
  email: string
  password: string
}

export interface SignupRequest {
  name: string
  email: string
  password: string
  passwordConfirm: string
  role?: "user" | "staff" | "admin" | "superAdmin"
}

export interface User {
  _id: string
  name: string
  email: string
  role: "user" | "staff" | "admin" | "superAdmin"
  photo?: string
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface LoginResponse {
  status: string
  token: string
  data: {
    user: User
  }
}

export interface ApiResponse<T> {
  status: string
  data: T
}

export class AuthService extends BaseApiService {
  // Login
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    const service = new AuthService()
    console.log("AuthService.login - Making login request to:", service.baseUrl + "/v1/users/login")

    const response = await service.post<LoginResponse>("/v1/users/login", credentials)

    if (response.token) {
      AuthService.setAuthToken(response.token)
      AuthService.setUser(response.data.user)
    }

    return response
  }

  // Signup
  static async signup(userData: SignupRequest): Promise<LoginResponse> {
    const service = new AuthService()
    console.log("AuthService.signup - Making signup request to:", service.baseUrl + "/v1/users/signup")

    const response = await service.post<LoginResponse>("/v1/users/signup", userData)

    if (response.token) {
      AuthService.setAuthToken(response.token)
      AuthService.setUser(response.data.user)
    }

    return response
  }

  // Forgot Password
  static async forgotPassword(email: string): Promise<ApiResponse<{ message: string }>> {
    const service = new AuthService()
    console.log("AuthService.forgotPassword - Making request to:", service.baseUrl + "/v1/users/forgotPassword")

    return service.post<ApiResponse<{ message: string }>>("/v1/users/forgotPassword", { email })
  }

  // Reset Password
  static async resetPassword(
    token: string,
    passwords: { password: string; passwordConfirm: string },
  ): Promise<LoginResponse> {
    const service = new AuthService()
    console.log("AuthService.resetPassword - Making request to:", service.baseUrl + `/v1/users/resetPassword/${token}`)

    const response = await service.patch<LoginResponse>(`/v1/users/resetPassword/${token}`, passwords)

    if (response.token) {
      AuthService.setAuthToken(response.token)
      AuthService.setUser(response.data.user)
    }

    return response
  }

  // Update Password
  static async updatePassword(passwords: {
    currentPassword: string
    password: string
    passwordConfirm: string
  }): Promise<LoginResponse> {
    const service = new AuthService()
    console.log("AuthService.updatePassword - Making request to:", service.baseUrl + "/v1/users/updatePassword")

    const response = await service.patch<LoginResponse>("/v1/users/updatePassword", passwords)

    if (response.token) {
      AuthService.setAuthToken(response.token)
      AuthService.setUser(response.data.user)
    }

    return response
  }

  // Get Current User
  static async getCurrentUser(): Promise<ApiResponse<User>> {
    const service = new AuthService()
    console.log("AuthService.getCurrentUser - Making request to:", service.baseUrl + "/v1/users/me")

    return service.get<ApiResponse<User>>("/v1/users/me")
  }

  // Token Management
  static setAuthToken(token: string): void {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("authToken", token)
      localStorage.setItem("authToken", token) // Backup in localStorage
      console.log("Auth token stored successfully")
    }
  }

  static getAuthToken(): string | null {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("authToken") || localStorage.getItem("authToken")
    }
    return null
  }

  static removeAuthToken(): void {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("authToken")
      localStorage.removeItem("authToken")
      sessionStorage.removeItem("user")
      localStorage.removeItem("user")
      console.log("Auth tokens cleared")
    }
  }

  // User Management
  static setUser(user: User): void {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("user", JSON.stringify(user))
      localStorage.setItem("user", JSON.stringify(user)) // Backup in localStorage
      console.log("User data stored successfully")
    }
  }

  static getUser(): User | null {
    if (typeof window !== "undefined") {
      const userStr = sessionStorage.getItem("user") || localStorage.getItem("user")
      if (userStr) {
        try {
          return JSON.parse(userStr)
        } catch (error) {
          console.error("Error parsing user data:", error)
          AuthService.removeAuthToken()
          return null
        }
      }
    }
    return null
  }

  // Authentication Check
  static isAuthenticated(): boolean {
    const token = AuthService.getAuthToken()
    if (!token) {
      console.log("No auth token found")
      return false
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]))
      const isExpired = payload.exp * 1000 < Date.now()

      if (isExpired) {
        console.log("Token expired")
        AuthService.logout()
        return false
      }

      console.log("User is authenticated")
      return true
    } catch (error) {
      console.error("Error checking token:", error)
      AuthService.logout()
      return false
    }
  }

  // Logout
  static logout(): void {
    console.log("Logging out user")
    AuthService.removeAuthToken()
    if (typeof window !== "undefined") {
      window.location.href = "/auth/login"
    }
  }

  // Role Check
  static hasRole(requiredRole: string): boolean {
    const user = AuthService.getUser()
    if (!user) return false

    const roleHierarchy = {
      user: 1,
      staff: 2,
      admin: 3,
      superAdmin: 4,
    }

    const userLevel = roleHierarchy[user.role as keyof typeof roleHierarchy] || 0
    const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0

    return userLevel >= requiredLevel
  }
}
