import { environment } from "@/lib/config/environment"

export interface RequestConfig extends RequestInit {
  params?: Record<string, string | number | boolean>
}

class ApiClient {
  private baseUrl: string
  private defaultHeaders: HeadersInit

  constructor() {
    this.baseUrl = environment.apiUrl
    this.defaultHeaders = {
      "Content-Type": "application/json",
    }
  }

  private async request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    const { params, headers, ...restConfig } = config

    // Build URL with query parameters
    let url = `${this.baseUrl}${endpoint}`
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value))
        }
      })
      if (searchParams.toString()) {
        url += `?${searchParams.toString()}`
      }
    }

    // Get auth token from session storage or cookies
    const token = this.getAuthToken()
    const user = this.getUserInfo()

    const requestHeaders: HeadersInit = {
      ...this.defaultHeaders,
      ...headers,
    }

    // Add auth headers if available
    if (token && !endpoint.includes("/auth/login") && !endpoint.includes("/signup")) {
      requestHeaders["Authorization"] = `Bearer ${token}`
    }

    if (user && !endpoint.includes("/auth/login") && !endpoint.includes("/signup")) {
      requestHeaders["User"] = user
    }

    try {
      const response = await fetch(url, {
        ...restConfig,
        headers: requestHeaders,
      })

      // Log request/response for debugging
      console.log(`${restConfig.method || "GET"} ${url}`, {
        status: response.status,
        statusText: response.statusText,
      })

      if (!response.ok) {
        await this.handleError(response)
      }

      const contentType = response.headers.get("content-type")
      if (contentType && contentType.includes("application/json")) {
        return await response.json()
      }

      return response.text() as unknown as T
    } catch (error) {
      console.error("API Request failed:", error)
      throw error
    }
  }

  private async handleError(response: Response): Promise<never> {
    let errorMessage = "An unknown error occurred"
    let errorSummary = "Error"

    switch (response.status) {
      case 400:
        errorMessage = "Bad Request: The request could not be understood or was missing required parameters."
        errorSummary = "Bad Request"
        break
      case 401:
        errorMessage = "Unauthorized: Access is denied due to invalid credentials."
        errorSummary = "Unauthorized"
        break
      case 403:
        errorMessage = "Forbidden: You do not have permission to access this resource."
        errorSummary = "Forbidden"
        break
      case 404:
        errorMessage = "Not Found: The requested resource could not be found."
        errorSummary = "Not Found"
        break
      case 405:
        errorMessage = "Method Not Allowed: The HTTP method used is not allowed for this endpoint."
        errorSummary = "Method Not Allowed"
        break
      case 408:
        errorMessage = "Request Timeout: The server took too long to respond."
        errorSummary = "Request Timeout"
        break
      case 409:
        errorMessage =
          "Conflict: The request could not be processed due to a conflict with the current state of the resource."
        errorSummary = "Conflict"
        break
      case 413:
        errorMessage = "Payload Too Large: The request payload is too large for the server to process."
        errorSummary = "Payload Too Large"
        break
      case 415:
        errorMessage = "Unsupported Media Type: The server does not support the media type transmitted in the request."
        errorSummary = "Unsupported Media Type"
        break
      case 429:
        errorMessage = "Too Many Requests: You have sent too many requests in a short period."
        errorSummary = "Rate Limit Exceeded"
        break
      case 500:
        errorMessage = "Internal Server Error: Something went wrong on the server."
        errorSummary = "Server Error"
        break
      case 502:
        errorMessage = "Bad Gateway: The server received an invalid response from the upstream server."
        errorSummary = "Bad Gateway"
        break
      case 503:
        errorMessage =
          "Service Unavailable: The server is currently unable to handle the request due to maintenance or overloading."
        errorSummary = "Service Unavailable"
        break
      case 504:
        errorMessage = "Gateway Timeout: The server did not receive a timely response from the upstream server."
        errorSummary = "Gateway Timeout"
        break
      default:
        errorMessage = `Unexpected Error (Status ${response.status}): ${response.statusText}`
        errorSummary = "Unexpected Error"
        break
    }

    const error = new Error(errorMessage)
    error.name = errorSummary
    throw error
  }

  private getAuthToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
    }
    return null
  }

  private getUserInfo(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("userKey") || sessionStorage.getItem("userKey")
    }
    return null
  }

  // HTTP Methods
  async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: "GET" })
  }

  async post<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async patch<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: "DELETE",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  // File upload method
  async upload<T>(endpoint: string, formData: FormData, config?: Omit<RequestConfig, "headers">): Promise<T> {
    const token = this.getAuthToken()
    const headers: HeadersInit = {}

    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    return this.request<T>(endpoint, {
      ...config,
      method: "POST",
      body: formData,
      headers: {
        ...headers,
        ...config?.headers,
      },
    })
  }
}

export const apiClient = new ApiClient()
