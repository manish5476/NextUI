import { BaseApiService } from "../../base-api.service"
import type { DropdownOption } from "@/lib/types"

export interface AutopopulateData {
  products: DropdownOption[]
  customers: DropdownOption[]
  sellers: DropdownOption[]
}

class AutopopulateService extends BaseApiService {
  private cache: Map<string, { data: any[]; timestamp: number }> = new Map()
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  private isCacheValid(key: string): boolean {
    const cached = this.cache.get(key)
    if (!cached) return false
    return Date.now() - cached.timestamp < this.CACHE_DURATION
  }

  async getModuleData(module: string): Promise<DropdownOption[]> {
    const cacheKey = module.toLowerCase()

    // Return cached data if valid
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)!.data
    }

    try {
      const response = await this.get<{ data: DropdownOption[] }>(`/v1/master-list/${module}`)
      const data = response.data || []

      // Cache the data
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      })

      return data
    } catch (error) {
      console.error(`Error fetching ${module} data:`, error)
      // Return cached data if available, even if expired
      const cached = this.cache.get(cacheKey)
      return cached?.data || []
    }
  }

  async searchModuleData(module: string, query: string): Promise<DropdownOption[]> {
    try {
      const response = await this.get<{ data: DropdownOption[] }>(
        `/v1/master-list/search/${module}?search=${encodeURIComponent(query)}`,
      )
      return response.data || []
    } catch (error) {
      console.error(`Error searching ${module} data:`, error)
      return []
    }
  }

  async getAllModulesData(): Promise<AutopopulateData> {
    try {
      const [products, customers, sellers] = await Promise.all([
        this.getModuleData("products"),
        this.getModuleData("customers"),
        this.getModuleData("sellers"),
      ])

      return {
        products,
        customers,
        sellers,
      }
    } catch (error) {
      console.error("Error fetching all modules data:", error)
      return {
        products: [],
        customers: [],
        sellers: [],
      }
    }
  }

  refreshModuleData(module: string): void {
    const cacheKey = module.toLowerCase()
    this.cache.delete(cacheKey)
    // Trigger fresh fetch
    this.getModuleData(module)
  }

  clearCache(): void {
    this.cache.clear()
  }
}

export const autopopulateService = new AutopopulateService()
