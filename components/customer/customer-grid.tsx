"use client"

import { useState, useEffect, useCallback } from "react"
import { EnhancedAgGrid } from "@/components/data-grid/enhanced-ag-grid"
import { CustomerService } from "@/lib/services/modules/customer/customer.service"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import type { ColDef } from "ag-grid-community"
import type { Customer } from "@/lib/types/customer"
import type { EditableRowData, BulkEditData, ExportOptions } from "@/components/data-grid/enhanced-types"

interface CustomerGridProps {
  onEdit: (customer: Customer) => void
  onView: (customer: Customer) => void
  onDelete: () => void
}

export function CustomerGrid({ onEdit, onView, onDelete }: CustomerGridProps) {
  const [customers, setCustomers] = useState<EditableRowData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const loadCustomers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await CustomerService.getAllCustomers({
        page: 1,
        limit: 100,
      })

      if (response.status === 'success') {
        // Transform data to match EditableRowData format
        const transformedCustomers = response.data.map(customer => ({
          ...customer,
          id: customer._id 
        }))
        console.log('Transformed customers:', transformedCustomers)
        setCustomers(transformedCustomers)
      } else {
        setError("Failed to load customers")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load customers")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCustomers()
  }, [loadCustomers])

  const columnDefs: ColDef[] = [
    {
      headerName: "Customer",
      field: "fullname",
      cellRenderer: (params: any) => {
        const customer = params.data as Customer
        return (
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={customer.profileImg || "/placeholder.svg"} alt={customer.fullname} />
              <AvatarFallback>
                {customer.fullname
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{customer.fullname}</div>
              <div className="text-sm text-muted-foreground">{customer.email}</div>
            </div>
          </div>
        )
      },
      width: 250,
      pinned: "left",
    },
    {
      headerName: "Phone",
      field: "mobileNumber",
      cellRenderer: (params: any) => {
        const customer = params.data as Customer
        const primaryPhone = customer.phoneNumbers.find((p) => p.primary)
        return primaryPhone ? primaryPhone.number : customer.mobileNumber || "N/A"
      },
      width: 150,
    },
    {
      headerName: "Status",
      field: "status",
      cellRenderer: (params: any) => {
        const status = params.value as string
        const variant =
          status === "active"
            ? "default"
            : status === "inactive"
              ? "secondary"
              : status === "pending"
                ? "outline"
                : status === "suspended"
                  ? "destructive"
                  : "secondary"

        return (
          <Badge variant={variant as any} className="capitalize">
            {status}
          </Badge>
        )
      },
      width: 120,
    },
    {
      headerName: "Total Purchased",
      field: "totalPurchasedAmount",
      cellRenderer: (params: any) => `₹${params.value?.toLocaleString() || 0}`,
      width: 150,
      type: "numericColumn",
    },
    {
      headerName: "Remaining Amount",
      field: "remainingAmount",
      cellRenderer: (params: any) => {
        const amount = params.value || 0
        const color = amount > 0 ? "text-red-600" : "text-green-600"
        return <span className={color}>₹{amount.toLocaleString()}</span>
      },
      width: 150,
      type: "numericColumn",
    },
    {
      headerName: "Addresses",
      field: "addresses",
      cellRenderer: (params: any) => {
        const addresses = params.value as any[]
        return addresses?.length || 0
      },
      width: 100,
      type: "numericColumn",
    },
    {
      headerName: "Created Date",
      field: "createdAt",
      cellRenderer: (params: any) => {
        return new Date(params.value).toLocaleDateString()
      },
      width: 130,
    },
  ]

  const handleSave = async (data: EditableRowData, originalData: EditableRowData) => {
    try {
      const response = await CustomerService.updateCustomer(data._id as string, {
        fullname: data.fullname,
        email: data.email,
        status: data.status,
      })

      if (response.success) {
        await loadCustomers()
        toast({
          title: "Success",
          description: "Customer updated successfully",
        })
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Failed to update customer")
    }
  }

  const handleDelete = async (data: EditableRowData) => {
    try {
      const response = await CustomerService.deleteCustomer(data._id as string)

      if (response.success) {
        await loadCustomers()
        onDelete()
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Failed to delete customer")
    }
  }

  const handleBulkSave = async (bulkData: BulkEditData, selectedRows: EditableRowData[]) => {
    try {
      const updatePromises = selectedRows.map((row) => CustomerService.updateCustomer(row._id as string, bulkData))

      await Promise.all(updatePromises)
      await loadCustomers()
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Failed to update customers")
    }
  }

  const handleBulkDelete = async (selectedRows: EditableRowData[]) => {
    try {
      const ids = selectedRows.map((row) => row._id as string)
      const response = await CustomerService.deleteCustomers(ids)

      if (response.success) {
        await loadCustomers()
        onDelete()
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Failed to delete customers")
    }
  }

  const handleExport = async (options: ExportOptions, data: EditableRowData[]) => {
    // Custom export logic can be implemented here
    console.log("Exporting customers:", options, data)
  }

  const handleRowEdit = (data: EditableRowData) => {
    onEdit(data as unknown as Customer)
  }

  const actionButtons = {
    showEdit: true,
    showDelete: true,
    customActions: [
      {
        label: "View Details",
        icon: "👁️",
        onClick: (data: any) => onView(data as Customer),
        variant: "outline" as const,
      },
    ],
  }

  console.log('Current customers state:', customers)
  console.log('Loading state:', loading)
  console.log('Error state:', error)
  console.log('Column definitions:', columnDefs)

  return (
    <div className="space-y-4">
      {/* Debug info */}
      {customers.length > 0 && (
        <div className="p-4 bg-blue-50 border rounded">
          <p>Debug: {customers.length} customers loaded</p>
          <p>First customer: {customers[0]?.fullname}</p>
        </div>
      )}
      <EnhancedAgGrid
        data={customers}
        loading={loading}
        error={error}
        columnDefs={columnDefs}
        actionButtons={actionButtons}
        onSave={handleSave}
        onDelete={handleDelete}
        onBulkSave={handleBulkSave}
        onBulkDelete={handleBulkDelete}
        onExport={handleExport}
        onRowEdit={handleRowEdit}
        height={600}
        enableBulkEdit={true}
        enableExport={true}
        enableColumnCustomization={true}
        enableAdvancedFiltering={true}
        pagination={true}
        paginationPageSize={20}
        paginationPageSizeSelector={[10, 20, 50, 100]}
      />
    </div>
  )
}
