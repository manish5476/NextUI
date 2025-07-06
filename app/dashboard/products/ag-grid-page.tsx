"use client"

import { useState, useEffect, useCallback } from "react"
import { ProductService } from "@/lib/services/product.service"
import type { Product } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { AgGridWrapper } from "@/components/data-grid/ag-grid-wrapper"
import type { ColDef, GridReadyEvent } from "ag-grid-community"

export default function ProductsAgGridPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRows, setSelectedRows] = useState<Product[]>([])
  const { toast } = useToast()

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await ProductService.getAllProducts()
      if (response.success) {
        setProducts(response.data.data)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProduct = async (id: string) => {
    try {
      await ProductService.deleteProduct(id)
      setProducts(products.filter((product) => product.id !== id))
      toast({
        title: "Success",
        description: "Product deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      })
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedRows.length === 0) return

    try {
      const ids = selectedRows.map((row) => row.id)
      await ProductService.deleteProducts(ids)
      setProducts(products.filter((product) => !ids.includes(product.id)))
      setSelectedRows([])
      toast({
        title: "Success",
        description: `${ids.length} products deleted successfully`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete selected products",
        variant: "destructive",
      })
    }
  }

  const ActionsCellRenderer = (params: any) => {
    return (
      <div className="flex space-x-2 py-2">
        <Button variant="outline" size="sm" onClick={() => console.log("Edit", params.data.id)}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => handleDeleteProduct(params.data.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  const StatusCellRenderer = (params: any) => {
    const inStock = params.value > 0
    return <Badge variant={inStock ? "default" : "destructive"}>{inStock ? "In Stock" : "Out of Stock"}</Badge>
  }

  const PriceCellRenderer = (params: any) => {
    return `$${params.value.toFixed(2)}`
  }

  const columnDefs: ColDef[] = [
    {
      headerName: "Name",
      field: "name",
      checkboxSelection: true,
      headerCheckboxSelection: true,
      minWidth: 200,
    },
    {
      headerName: "Category",
      field: "category",
      minWidth: 150,
    },
    {
      headerName: "Price",
      field: "price",
      cellRenderer: PriceCellRenderer,
      minWidth: 120,
    },
    {
      headerName: "Stock",
      field: "stock",
      minWidth: 100,
    },
    {
      headerName: "Status",
      field: "stock",
      cellRenderer: StatusCellRenderer,
      minWidth: 120,
    },
    {
      headerName: "Description",
      field: "description",
      minWidth: 200,
      tooltipField: "description",
    },
    {
      headerName: "Actions",
      cellRenderer: ActionsCellRenderer,
      minWidth: 150,
      sortable: false,
      filter: false,
    },
  ]

  const onGridReady = useCallback((event: GridReadyEvent) => {
    // Grid is ready
  }, [])

  const onSelectionChanged = useCallback(() => {
    const selectedNodes = event.api?.getSelectedNodes() || []
    const selectedData = selectedNodes.map((node) => node.data)
    setSelectedRows(selectedData)
  }, [])

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products (AG Grid)</h1>
          <p className="text-muted-foreground">Manage your product inventory with advanced data grid</p>
        </div>
        <div className="flex space-x-2">
          {selectedRows.length > 0 && (
            <Button variant="destructive" onClick={handleDeleteSelected}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Selected ({selectedRows.length})
            </Button>
          )}
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Products</CardTitle>
          <CardDescription>Advanced data grid with sorting, filtering, and selection</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <AgGridWrapper
            rowData={filteredProducts}
            columnDefs={columnDefs}
            loading={loading}
            onGridReady={onGridReady}
            onSelectionChanged={onSelectionChanged}
            gridOptions={{
              rowHeight: 60,
              headerHeight: 50,
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
