"use client"

import { useState, useEffect, useCallback } from "react"
import { EnhancedAgGrid } from "@/components/data-grid/enhanced-ag-grid"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import type { Product, ProductFilter } from "@/lib/types/product"
import { productService } from "@/lib/services/modules/product/product.service"
import type { ColDef, CellValueChangedEvent } from "ag-grid-community"
import { Plus, Search, Package, DollarSign, Warehouse } from "lucide-react"

interface ProductGridProps {
  onProductSelect?: (product: Product) => void
  onProductEdit?: (product: Product) => void
  onProductCreate?: () => void
}

export function ProductGrid({ onProductSelect, onProductEdit, onProductCreate }: ProductGridProps) {
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState<ProductFilter>({
    page: 1,
    limit: 50,
    sortBy: "createdAt",
    sortOrder: "desc",
  })

  // Column definitions for AG Grid
  const columnDefs: ColDef[] = [
    {
      field: "thumbnail",
      headerName: "Image",
      width: 80,
      cellRenderer: (params: any) => {
        if (params.value) {
          return `<img src="${params.value}" alt="Product" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;" />`
        }
        return '<div style="width: 40px; height: 40px; background: #f3f4f6; border-radius: 4px; display: flex; align-items: center; justify-content: center;"><span style="font-size: 12px; color: #6b7280;">No Image</span></div>'
      },
      sortable: false,
      filter: false,
      resizable: false,
    },
    {
      field: "title",
      headerName: "Product Title",
      flex: 2,
      minWidth: 200,
      editable: true,
      cellEditor: "agTextCellEditor",
      cellEditorParams: {
        maxLength: 200,
      },
    },
    {
      field: "sku",
      headerName: "SKU",
      width: 120,
      editable: true,
    },
    {
      field: "category",
      headerName: "Category",
      width: 130,
      editable: true,
    },
    {
      field: "brand",
      headerName: "Brand",
      width: 120,
      editable: true,
    },
    {
      field: "rate",
      headerName: "Base Rate",
      width: 110,
      editable: true,
      cellEditor: "agNumberCellEditor",
      cellEditorParams: {
        min: 0,
        precision: 2,
      },
      valueFormatter: (params) => (params.value ? `₹${Number(params.value).toFixed(2)}` : "₹0.00"),
    },
    {
      field: "gstRate",
      headerName: "GST %",
      width: 80,
      editable: true,
      cellEditor: "agNumberCellEditor",
      cellEditorParams: {
        min: 0,
        max: 100,
        precision: 2,
      },
      valueFormatter: (params) => (params.value ? `${params.value}%` : "0%"),
    },
    {
      field: "price",
      headerName: "Price",
      width: 110,
      valueFormatter: (params) => (params.value ? `₹${Number(params.value).toFixed(2)}` : "₹0.00"),
    },
    {
      field: "finalPrice",
      headerName: "Final Price",
      width: 120,
      valueFormatter: (params) => (params.value ? `₹${Number(params.value).toFixed(2)}` : "₹0.00"),
      cellStyle: { fontWeight: "bold" },
    },
    {
      field: "stock",
      headerName: "Stock",
      width: 90,
      editable: true,
      cellEditor: "agNumberCellEditor",
      cellEditorParams: {
        min: 0,
      },
      cellRenderer: (params: any) => {
        const stock = params.value || 0
        let color = "bg-green-100 text-green-800"
        if (stock === 0) color = "bg-red-100 text-red-800"
        else if (stock < 10) color = "bg-yellow-100 text-yellow-800"

        return `<span class="px-2 py-1 rounded-full text-xs font-medium ${color}">${stock}</span>`
      },
    },
    {
      field: "availabilityStatus",
      headerName: "Status",
      width: 120,
      editable: true,
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: ["In Stock", "Low Stock", "Out of Stock"],
      },
      cellRenderer: (params: any) => {
        const status = params.value
        let color = "bg-gray-100 text-gray-800"

        switch (status) {
          case "In Stock":
            color = "bg-green-100 text-green-800"
            break
          case "Low Stock":
            color = "bg-yellow-100 text-yellow-800"
            break
          case "Out of Stock":
            color = "bg-red-100 text-red-800"
            break
        }

        return `<span class="px-2 py-1 rounded-full text-xs font-medium ${color}">${status || "Unknown"}</span>`
      },
    },
    {
      field: "discountPercentage",
      headerName: "Discount %",
      width: 110,
      editable: true,
      cellEditor: "agNumberCellEditor",
      cellEditorParams: {
        min: 0,
        max: 100,
        precision: 2,
      },
      valueFormatter: (params) => (params.value ? `${params.value}%` : "0%"),
    },
  ]

  // Load products
  const loadProducts = useCallback(async () => {
    setLoading(true)
    try {
      const response = await productService.getAllProducts(filter)
      setProducts(response.data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load products.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [filter, toast])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setFilter((prev) => ({
      ...prev,
      search: query || undefined,
      page: 1,
    }))
  }

  // Handle cell value changes (inline editing)
  const handleCellValueChanged = async (event: CellValueChangedEvent) => {
    const { data, colDef, newValue, oldValue } = event

    if (newValue === oldValue) return

    try {
      const field = colDef.field as keyof Product
      const updatedData = { ...data, [field]: newValue }

      // Recalculate pricing if rate or gstRate changed
      if (field === "rate" || field === "gstRate" || field === "discountPercentage") {
        const rate = Number(updatedData.rate) || 0
        const gstRate = Number(updatedData.gstRate) || 0
        const discountPercentage = Number(updatedData.discountPercentage) || 0

        const gstAmount = (rate * gstRate) / 100
        const price = rate + gstAmount
        const discountAmount = (price * discountPercentage) / 100
        const finalPrice = price - discountAmount

        updatedData.gstAmount = Number(gstAmount.toFixed(2))
        updatedData.price = Number(price.toFixed(2))
        updatedData.finalPrice = Number(finalPrice.toFixed(2))

        // Update the grid data
        event.node.setData(updatedData)
      }

      await productService.updateProduct(data._id, updatedData)

      toast({
        title: "Product updated",
        description: `${field} has been updated successfully.`,
      })
    } catch (error) {
      // Revert the change
      event.node.setDataValue(colDef.field!, oldValue)
      toast({
        title: "Update failed",
        description: "Failed to update product. Changes have been reverted.",
        variant: "destructive",
      })
    }
  }

  // Handle row selection
  const handleRowSelection = (selectedRows: Product[]) => {
    if (selectedRows.length > 0 && onProductSelect) {
      onProductSelect(selectedRows[0])
    }
  }

  // Handle row double click (edit)
  const handleRowDoubleClick = (product: Product) => {
    if (onProductEdit) {
      onProductEdit(product)
    }
  }

  // Handle delete
  const handleDelete = async (products: Product[]) => {
    try {
      const ids = products.map((p) => p._id!).filter(Boolean)
      if (ids.length === 1) {
        await productService.deleteProduct(ids[0])
      } else {
        await productService.bulkDeleteProducts(ids)
      }

      toast({
        title: "Products deleted",
        description: `${ids.length} product(s) have been deleted successfully.`,
      })

      loadProducts()
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "Failed to delete products.",
        variant: "destructive",
      })
    }
  }

  // Handle export
  const handleExport = async () => {
    try {
      const blob = await productService.exportProducts(filter)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `products-${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Export successful",
        description: "Products have been exported to CSV.",
      })
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export products.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Products</h2>
          <p className="text-muted-foreground">Manage your product inventory</p>
        </div>
        <Button onClick={onProductCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Package className="h-4 w-4" />
            <span>{products.length} products</span>
          </div>
          <div className="flex items-center gap-1">
            <Warehouse className="h-4 w-4" />
            <span>{products.filter((p) => p.availabilityStatus === "In Stock").length} in stock</span>
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="h-4 w-4" />
            <span>₹{products.reduce((sum, p) => sum + (p.finalPrice || 0), 0).toFixed(2)} total value</span>
          </div>
        </div>
      </div>

      {/* Enhanced AG Grid */}
      <EnhancedAgGrid
        data={products}
        columnDefs={columnDefs}
        loading={loading}
        onCellValueChanged={handleCellValueChanged}
        onSelectionChanged={handleRowSelection}
        onRowDoubleClicked={handleRowDoubleClick}
        onDelete={handleDelete}
        onExport={handleExport}
        enableBulkEdit={true}
        enableExport={true}
        enableColumnCustomization={true}
        enableAdvancedFilter={true}
        rowSelection="multiple"
        pagination={true}
        paginationPageSize={50}
        className="h-[600px]"
      />
    </div>
  )
}
