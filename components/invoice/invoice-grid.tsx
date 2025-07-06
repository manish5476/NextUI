"use client"

import { useState, useEffect, useMemo } from "react"
import { AgGridReact } from "ag-grid-react"
import type { ColDef, GridReadyEvent, SelectionChangedEvent } from "ag-grid-community"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  Send,
  Download,
  RefreshCw,
  FileText,
  DollarSign,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import { invoiceService } from "@/lib/services/modules/invoice/invoice.service"
import { autopopulateService } from "@/lib/services/modules/autopopulate/autopopulate.service"
import type { Invoice, DropdownOption } from "@/lib/types"
import "ag-grid-community/styles/ag-grid.css"
import "ag-grid-community/styles/ag-theme-alpine.css"

interface InvoiceGridProps {
  onCreateInvoice: () => void
  onEditInvoice: (invoice: Invoice) => void
  onViewInvoice: (invoice: Invoice) => void
}

export function InvoiceGrid({ onCreateInvoice, onEditInvoice, onViewInvoice }: InvoiceGridProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRows, setSelectedRows] = useState<Invoice[]>([])
  const [customers, setCustomers] = useState<DropdownOption[]>([])
  const [sellers, setSellers] = useState<DropdownOption[]>([])
  const { toast } = useToast()

  useEffect(() => {
    loadInvoices()
    loadDropdownData()
  }, [])

  const loadInvoices = async () => {
    try {
      setLoading(true)
      const data = await invoiceService.getAllInvoices()
      setInvoices(data)
    } catch (error) {
      console.error("Error loading invoices:", error)
      toast({
        title: "Error",
        description: "Failed to load invoices",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadDropdownData = async () => {
    try {
      const [customersData, sellersData] = await Promise.all([
        autopopulateService.getModuleData("customers"),
        autopopulateService.getModuleData("sellers"),
      ])
      setCustomers(customersData)
      setSellers(sellersData)
    } catch (error) {
      console.error("Error loading dropdown data:", error)
    }
  }

  const handleDeleteInvoice = async (invoiceId: string) => {
    try {
      await invoiceService.deleteInvoice(invoiceId)
      toast({
        title: "Success",
        description: "Invoice deleted successfully",
      })
      loadInvoices()
    } catch (error) {
      console.error("Error deleting invoice:", error)
      toast({
        title: "Error",
        description: "Failed to delete invoice",
        variant: "destructive",
      })
    }
  }

  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) {
      toast({
        title: "Info",
        description: "Please select invoices to delete",
      })
      return
    }

    try {
      const ids = selectedRows.map((row) => row._id!).filter(Boolean)
      await invoiceService.bulkDeleteInvoices(ids)
      toast({
        title: "Success",
        description: `${selectedRows.length} invoices deleted successfully`,
      })
      setSelectedRows([])
      loadInvoices()
    } catch (error) {
      console.error("Error bulk deleting invoices:", error)
      toast({
        title: "Error",
        description: "Failed to delete invoices",
        variant: "destructive",
      })
    }
  }

  const getCustomerName = (customerId: string) => {
    const customer = customers.find((c) => c._id === customerId)
    return customer?.fullname || customer?.name || "Unknown Customer"
  }

  const getSellerName = (sellerId: string) => {
    const seller = sellers.find((s) => s._id === sellerId)
    return seller?.name || seller?.fullname || "Unknown Seller"
  }

  const StatusRenderer = ({ value }: { value: string }) => {
    const getStatusColor = (status: string) => {
      switch (status) {
        case "paid":
          return "bg-green-100 text-green-800"
        case "sent":
          return "bg-blue-100 text-blue-800"
        case "overdue":
          return "bg-red-100 text-red-800"
        case "draft":
          return "bg-gray-100 text-gray-800"
        default:
          return "bg-gray-100 text-gray-800"
      }
    }

    return <Badge className={getStatusColor(value)}>{value?.charAt(0).toUpperCase() + value?.slice(1)}</Badge>
  }

  const CurrencyRenderer = ({ value }: { value: number }) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(value || 0)
  }

  const DateRenderer = ({ value }: { value: string }) => {
    if (!value) return "-"
    return new Date(value).toLocaleDateString("en-IN")
  }

  const CustomerRenderer = ({ value }: { value: string }) => {
    return getCustomerName(value)
  }

  const SellerRenderer = ({ value }: { value: string }) => {
    return getSellerName(value)
  }

  const ActionRenderer = ({ data }: { data: Invoice }) => {
    return (
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => onViewInvoice(data)} title="View Invoice">
          <Eye className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="outline" onClick={() => onEditInvoice(data)} title="Edit Invoice">
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleDeleteInvoice(data._id!)}
          title="Delete Invoice"
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          title="Send Invoice"
          className="text-blue-600 hover:text-blue-700 bg-transparent"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  const columnDefs: ColDef[] = [
    {
      headerName: "Invoice No",
      field: "invoiceNumber",
      pinned: "left",
      width: 150,
      cellRenderer: ({ value }: { value: string }) => (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-blue-600" />
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
    {
      headerName: "Date",
      field: "invoiceDate",
      width: 120,
      cellRenderer: DateRenderer,
    },
    {
      headerName: "Due Date",
      field: "dueDate",
      width: 120,
      cellRenderer: DateRenderer,
    },
    {
      headerName: "Customer",
      field: "buyer",
      width: 180,
      cellRenderer: CustomerRenderer,
    },
    {
      headerName: "Seller",
      field: "seller",
      width: 150,
      cellRenderer: SellerRenderer,
    },
    {
      headerName: "Items",
      field: "items",
      width: 80,
      cellRenderer: ({ value }: { value: any[] }) => <span className="text-center">{value?.length || 0}</span>,
    },
    {
      headerName: "Sub Total",
      field: "subTotal",
      width: 120,
      cellRenderer: CurrencyRenderer,
    },
    {
      headerName: "GST",
      field: "gst",
      width: 100,
      cellRenderer: CurrencyRenderer,
    },
    {
      headerName: "Total Amount",
      field: "totalAmount",
      width: 140,
      cellRenderer: CurrencyRenderer,
      cellStyle: { fontWeight: "bold" },
    },
    {
      headerName: "Status",
      field: "status",
      width: 120,
      cellRenderer: StatusRenderer,
    },
    {
      headerName: "Created",
      field: "createdAt",
      width: 120,
      cellRenderer: DateRenderer,
    },
    {
      headerName: "Actions",
      field: "actions",
      width: 200,
      cellRenderer: ActionRenderer,
      pinned: "right",
      sortable: false,
      filter: false,
    },
  ]

  const defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    flex: 1,
    minWidth: 100,
  }

  const onGridReady = (params: GridReadyEvent) => {
    params.api.sizeColumnsToFit()
  }

  const onSelectionChanged = (event: SelectionChangedEvent) => {
    setSelectedRows(event.api.getSelectedRows())
  }

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalInvoices = invoices.length
    const totalAmount = invoices.reduce((sum, invoice) => sum + (invoice.totalAmount || 0), 0)
    const paidInvoices = invoices.filter((inv) => inv.status === "paid").length
    const overdueInvoices = invoices.filter((inv) => inv.status === "overdue").length

    return {
      totalInvoices,
      totalAmount,
      paidInvoices,
      overdueInvoices,
    }
  }, [invoices])

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Invoices</p>
                <p className="text-2xl font-bold">{summaryStats.totalInvoices}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold">
                  {new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                    notation: "compact",
                  }).format(summaryStats.totalAmount)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Paid Invoices</p>
                <p className="text-2xl font-bold text-green-600">{summaryStats.paidInvoices}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{summaryStats.overdueInvoices}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Bar */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Invoice Management</CardTitle>
            <div className="flex gap-2">
              <Button onClick={onCreateInvoice} className="bg-purple-600 hover:bg-purple-700">
                <Plus className="mr-2 h-4 w-4" />
                Create Invoice
              </Button>
              <Button variant="outline" onClick={loadInvoices}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              {selectedRows.length > 0 && (
                <>
                  <Button variant="outline" onClick={handleBulkDelete} className="text-red-600 bg-transparent">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Selected ({selectedRows.length})
                  </Button>
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export Selected
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="ag-theme-alpine" style={{ height: 600, width: "100%" }}>
            <AgGridReact
              columnDefs={columnDefs}
              rowData={invoices}
              defaultColDef={defaultColDef}
              onGridReady={onGridReady}
              onSelectionChanged={onSelectionChanged}
              rowSelection="multiple"
              suppressRowClickSelection={true}
              pagination={true}
              paginationPageSize={20}
              loading={loading}
              animateRows={true}
              enableCellTextSelection={true}
              suppressMenuHide={true}
              getRowId={(params) => params.data._id}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
