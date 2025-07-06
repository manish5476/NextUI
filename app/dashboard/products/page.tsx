"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ProductGrid } from "@/components/product/product-grid"
import { ProductMaster } from "@/components/product/product-master"
import { ProductView } from "@/components/product/product-view"
import type { Product } from "@/lib/types/product"
import { Plus, Grid, List } from "lucide-react"

type ViewMode = "grid" | "create" | "edit" | "view"

export default function ProductsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const handleProductCreate = () => {
    setSelectedProduct(null)
    setViewMode("create")
  }

  const handleProductEdit = (product: Product) => {
    setSelectedProduct(product)
    setViewMode("edit")
  }

  const handleProductView = (product: Product) => {
    setSelectedProduct(product)
    setViewMode("view")
  }

  const handleProductSave = (product: Product) => {
    setSelectedProduct(product)
    setViewMode("view")
  }

  const handleBackToGrid = () => {
    setSelectedProduct(null)
    setViewMode("grid")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Product Management</h1>
          <p className="text-muted-foreground">Manage your product inventory, pricing, and availability</p>
        </div>
        {viewMode === "grid" && (
          <Button onClick={handleProductCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        )}
      </div>

      {/* Content */}
      {viewMode === "grid" && (
        <Tabs defaultValue="grid" className="space-y-4">
          <TabsList>
            <TabsTrigger value="grid" className="flex items-center gap-2">
              <Grid className="h-4 w-4" />
              Grid View
            </TabsTrigger>
            <TabsTrigger value="table" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              Table View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="grid">
            <ProductGrid
              onProductSelect={handleProductView}
              onProductEdit={handleProductEdit}
              onProductCreate={handleProductCreate}
            />
          </TabsContent>

          <TabsContent value="table">
            <ProductGrid
              onProductSelect={handleProductView}
              onProductEdit={handleProductEdit}
              onProductCreate={handleProductCreate}
            />
          </TabsContent>
        </Tabs>
      )}

      {viewMode === "create" && <ProductMaster onSave={handleProductSave} onCancel={handleBackToGrid} />}

      {viewMode === "edit" && selectedProduct && (
        <ProductMaster productId={selectedProduct._id} onSave={handleProductSave} onCancel={handleBackToGrid} />
      )}

      {viewMode === "view" && selectedProduct && (
        <ProductView productId={selectedProduct._id!} onEdit={handleProductEdit} onClose={handleBackToGrid} />
      )}
    </div>
  )
}
