"use client"

import { useState } from "react"
import { GstInvoice } from "@/components/invoice/gst-invoice"
import { InvoiceGrid } from "@/components/invoice/invoice-grid"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import type { Invoice } from "@/lib/types"

type ViewMode = "grid" | "create" | "edit" | "view"

export default function BillingPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)

  const handleCreateInvoice = () => {
    setSelectedInvoice(null)
    setViewMode("create")
  }

  const handleEditInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setViewMode("edit")
  }

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setViewMode("view")
  }

  const handleSaveInvoice = (invoice: Invoice) => {
    // Handle successful save
    setViewMode("grid")
    setSelectedInvoice(null)
  }

  const handleCancel = () => {
    setViewMode("grid")
    setSelectedInvoice(null)
  }

  const renderContent = () => {
    switch (viewMode) {
      case "create":
        return (
          <div>
            <div className="mb-6">
              <Button variant="ghost" onClick={handleCancel} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Invoices
              </Button>
              <h1 className="text-3xl font-bold">Create New Invoice</h1>
            </div>
            <GstInvoice onSave={handleSaveInvoice} onCancel={handleCancel} />
          </div>
        )

      case "edit":
        return (
          <div>
            <div className="mb-6">
              <Button variant="ghost" onClick={handleCancel} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Invoices
              </Button>
              <h1 className="text-3xl font-bold">Edit Invoice</h1>
            </div>
            <GstInvoice invoice={selectedInvoice!} onSave={handleSaveInvoice} onCancel={handleCancel} />
          </div>
        )

      case "view":
        return (
          <div>
            <div className="mb-6">
              <Button variant="ghost" onClick={handleCancel} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Invoices
              </Button>
              <h1 className="text-3xl font-bold">View Invoice</h1>
            </div>
            {/* Invoice view component would go here */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Invoice #{selectedInvoice?.invoiceNumber}</h2>
              <p>Invoice view component will be implemented here.</p>
            </div>
          </div>
        )

      default:
        return (
          <div>
            <h1 className="text-3xl font-bold mb-6">Billing & Invoices</h1>
            <InvoiceGrid
              onCreateInvoice={handleCreateInvoice}
              onEditInvoice={handleEditInvoice}
              onViewInvoice={handleViewInvoice}
            />
          </div>
        )
    }
  }

  return <div className="container mx-auto py-6">{renderContent()}</div>
}
