import { BaseApiService } from "../../base-api.service"
import type { Invoice, InvoiceFormData, ApiResponse, PaginatedResponse, InvoiceItem } from "@/lib/types"

export class InvoiceService extends BaseApiService {
  // Get all invoices
  async getAllInvoices(filterParams?: Record<string, any>): Promise<ApiResponse<PaginatedResponse<Invoice>>> {
    return this.get<ApiResponse<PaginatedResponse<Invoice>>>("/v1/invoices", { params: filterParams })
  }

  // Get invoice by ID
  async getInvoiceById(id: string): Promise<ApiResponse<Invoice>> {
    return this.get<ApiResponse<Invoice>>(`/v1/invoices/${id}`)
  }

  // Create new invoice
  async createNewInvoice(data: InvoiceFormData): Promise<ApiResponse<Invoice>> {
    // Generate invoice number if not provided
    if (!data.invoiceNumber) {
      data.invoiceNumber = this.generateInvoiceNumber(data.buyer)
    }

    return this.post<ApiResponse<Invoice>>("/v1/invoices", data)
  }

  // Update invoice
  async updateInvoice(id: string, data: Partial<InvoiceFormData>): Promise<ApiResponse<Invoice>> {
    return this.patch<ApiResponse<Invoice>>(`/v1/invoices/${id}`, data)
  }

  // Delete invoice
  async deleteInvoice(id: string): Promise<ApiResponse<void>> {
    return this.delete<ApiResponse<void>>(`/v1/invoices/${id}`)
  }

  // Delete multiple invoices
  async deleteInvoices(ids: string[]): Promise<ApiResponse<void>> {
    return this.delete<ApiResponse<void>>("/v1/invoices/deletemany", { ids })
  }

  // Get product sales data
  async getProductSales(data: any): Promise<ApiResponse<any>> {
    return this.post<ApiResponse<any>>("/v1/invoices/productSales", data)
  }

  // Generate invoice number
  private generateInvoiceNumber(customerId: string): string {
    const now = new Date()
    const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`
    const timePart = `${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}`
    return `${customerId.substring(0, 5)}_${datePart}_${timePart}`
  }

  // Calculate item amount
  static calculateItemAmount(item: Partial<InvoiceItem>): {
    taxableValue: number
    gstAmount: number
    amount: number
  } {
    const quantity = item.quantity || 0
    const rate = item.rate || 0
    const discount = item.discount || 0
    const gstRate = item.gstRate || 0

    let taxableValue = quantity * rate

    // Apply discount if any
    if (discount > 0) {
      taxableValue -= (taxableValue * discount) / 100
    }

    const gstAmount = (taxableValue * gstRate) / 100
    const amount = taxableValue + gstAmount

    return {
      taxableValue: Math.round(taxableValue * 100) / 100,
      gstAmount: Math.round(gstAmount * 100) / 100,
      amount: Math.round(amount * 100) / 100,
    }
  }

  // Calculate invoice totals
  static calculateInvoiceTotals(
    items: InvoiceItem[],
    totalDiscount = 0,
    roundUp = false,
    roundDown = false,
  ): {
    subTotal: number
    gst: number
    totalAmount: number
    taxableValue: number
  } {
    let subTotal = 0
    let gst = 0
    let totalAmount = 0
    let taxableValue = 0

    items.forEach((item) => {
      const calculations = this.calculateItemAmount(item)
      subTotal += calculations.taxableValue
      gst += calculations.gstAmount
      totalAmount += calculations.amount
      taxableValue += calculations.taxableValue
    })

    // Apply total discount
    if (totalDiscount > 0) {
      totalAmount -= totalDiscount
    }

    // Apply rounding
    if (roundUp) {
      totalAmount = Math.ceil(totalAmount)
    } else if (roundDown) {
      totalAmount = Math.floor(totalAmount)
    }

    return {
      subTotal: Math.round(subTotal * 100) / 100,
      gst: Math.round(gst * 100) / 100,
      totalAmount: Math.round(totalAmount * 100) / 100,
      taxableValue: Math.round(taxableValue * 100) / 100,
    }
  }
}

// Export singleton instance
export const invoiceService = new InvoiceService()
