"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import type { Product } from "@/lib/types/product"
import { productService } from "@/lib/services/modules/product/product.service"
import { Loader2, Upload, Calculator, Package, DollarSign, Info } from "lucide-react"

interface ProductMasterProps {
  productId?: string
  onSave?: (product: Product) => void
  onCancel?: () => void
}

export function ProductMaster({ productId, onSave, onCancel }: ProductMasterProps) {
  const router = useRouter()
  const { toast } = useToast()

  const [product, setProduct] = useState<Partial<Product>>({
    title: "",
    description: "",
    category: "",
    brand: "",
    sku: "",
    thumbnail: "",
    tags: [],
    rate: 0,
    gstRate: 18,
    discountPercentage: 0,
    stock: 0,
    availabilityStatus: "In Stock",
    minimumOrderQuantity: 1,
    weight: 0,
    warrantyInformation: "",
    shippingInformation: "",
    returnPolicy: "",
  })

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [imageUploading, setImageUploading] = useState(false)
  const [tagsInput, setTagsInput] = useState("")
  const [calculatedValues, setCalculatedValues] = useState({
    gstAmount: 0,
    price: 0,
    finalPrice: 0,
  })

  const availabilityOptions = [
    { value: "In Stock", label: "In Stock" },
    { value: "Low Stock", label: "Low Stock" },
    { value: "Out of Stock", label: "Out of Stock" },
  ]

  useEffect(() => {
    if (productId) {
      loadProduct()
    }
  }, [productId])

  useEffect(() => {
    calculatePricing()
  }, [product.rate, product.gstRate, product.discountPercentage])

  useEffect(() => {
    if (Array.isArray(product.tags)) {
      setTagsInput(product.tags.join(", "))
    }
  }, [product.tags])

  const loadProduct = async () => {
    if (!productId) return

    setLoading(true)
    try {
      const data = await productService.getProductById(productId)
      setProduct(data)
      toast({
        title: "Product loaded",
        description: "Product data has been loaded successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load product data.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const calculatePricing = () => {
    const rate = Number(product.rate) || 0
    const gstRate = Number(product.gstRate) || 0
    const discountPercentage = Number(product.discountPercentage) || 0

    const gstAmount = (rate * gstRate) / 100
    const price = rate + gstAmount
    const discountAmount = (price * discountPercentage) / 100
    const finalPrice = price - discountAmount

    setCalculatedValues({
      gstAmount: Number(gstAmount.toFixed(2)),
      price: Number(price.toFixed(2)),
      finalPrice: Number(finalPrice.toFixed(2)),
    })
  }

  const handleInputChange = (field: keyof Product, value: any) => {
    setProduct((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleTagsChange = (value: string) => {
    setTagsInput(value)
    const tags = value
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag !== "")
    handleInputChange("tags", tags)
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setImageUploading(true)
    try {
      const result = await productService.uploadProductImage(file)
      handleInputChange("thumbnail", result.url)
      toast({
        title: "Image uploaded",
        description: "Product image has been uploaded successfully.",
      })
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setImageUploading(false)
    }
  }

  const validateForm = (): boolean => {
    const required = ["title", "description", "category", "brand", "sku", "thumbnail"]
    const missing = required.filter((field) => !product[field as keyof Product])

    if (missing.length > 0) {
      toast({
        title: "Validation Error",
        description: `Please fill in all required fields: ${missing.join(", ")}`,
        variant: "destructive",
      })
      return false
    }

    if (Number(product.rate) <= 0) {
      toast({
        title: "Validation Error",
        description: "Rate must be greater than 0",
        variant: "destructive",
      })
      return false
    }

    if (Number(product.stock) < 0) {
      toast({
        title: "Validation Error",
        description: "Stock cannot be negative",
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const handleSave = async () => {
    if (!validateForm()) return

    setSaving(true)
    try {
      const productData = {
        ...product,
        gstAmount: calculatedValues.gstAmount,
        price: calculatedValues.price,
        finalPrice: calculatedValues.finalPrice,
      }

      let savedProduct: Product
      if (productId) {
        savedProduct = await productService.updateProduct(productId, productData)
        toast({
          title: "Product updated",
          description: "Product has been updated successfully.",
        })
      } else {
        savedProduct = await productService.createProduct(productData as Omit<Product, "_id">)
        toast({
          title: "Product created",
          description: "Product has been created successfully.",
        })
      }

      if (onSave) {
        onSave(savedProduct)
      } else {
        router.push("/dashboard/products")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${productId ? "update" : "create"} product.`,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      router.push("/dashboard/products")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{productId ? "Edit Product" : "Create Product"}</h1>
          <p className="text-muted-foreground">
            {productId ? "Update product information" : "Add a new product to your inventory"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {productId ? "Update Product" : "Create Product"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>Essential product details and description</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={product.title || ""}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Enter product title"
                  maxLength={200}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU *</Label>
                <Input
                  id="sku"
                  value={product.sku || ""}
                  onChange={(e) => handleInputChange("sku", e.target.value)}
                  placeholder="Enter product SKU"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={product.description || ""}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Enter product description"
                rows={3}
                maxLength={500}
              />
            </div>
          </CardContent>
        </Card>

        {/* Categorization */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Categorization
            </CardTitle>
            <CardDescription>Product category, brand, and tags</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Input
                  id="category"
                  value={product.category || ""}
                  onChange={(e) => handleInputChange("category", e.target.value)}
                  placeholder="Enter product category"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand">Brand *</Label>
                <Input
                  id="brand"
                  value={product.brand || ""}
                  onChange={(e) => handleInputChange("brand", e.target.value)}
                  placeholder="Enter product brand"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                value={tagsInput}
                onChange={(e) => handleTagsChange(e.target.value)}
                placeholder="Enter tags separated by commas"
              />
              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {product.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Pricing
            </CardTitle>
            <CardDescription>Product pricing and tax information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rate">Base Rate * (Pre-GST)</Label>
                <Input
                  id="rate"
                  type="number"
                  value={product.rate || ""}
                  onChange={(e) => handleInputChange("rate", Number(e.target.value))}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gstRate">GST Rate (%) *</Label>
                <Input
                  id="gstRate"
                  type="number"
                  value={product.gstRate || ""}
                  onChange={(e) => handleInputChange("gstRate", Number(e.target.value))}
                  placeholder="18"
                  min="0"
                  max="100"
                  step="0.01"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discountPercentage">Discount (%)</Label>
                <Input
                  id="discountPercentage"
                  type="number"
                  value={product.discountPercentage || ""}
                  onChange={(e) => handleInputChange("discountPercentage", Number(e.target.value))}
                  placeholder="0"
                  min="0"
                  max="100"
                  step="0.01"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={product.weight || ""}
                  onChange={(e) => handleInputChange("weight", Number(e.target.value))}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            {/* Calculated Values */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Calculated Values
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">GST Amount:</span>
                  <div className="font-medium">₹{calculatedValues.gstAmount.toFixed(2)}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Price (Post-GST):</span>
                  <div className="font-medium">₹{calculatedValues.price.toFixed(2)}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Final Price:</span>
                  <div className="font-semibold text-lg">₹{calculatedValues.finalPrice.toFixed(2)}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inventory & Media */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory & Media</CardTitle>
            <CardDescription>Stock information and product images</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stock">Stock Quantity *</Label>
                <Input
                  id="stock"
                  type="number"
                  value={product.stock || ""}
                  onChange={(e) => handleInputChange("stock", Number(e.target.value))}
                  placeholder="0"
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="availabilityStatus">Availability Status *</Label>
                <Select
                  value={product.availabilityStatus}
                  onValueChange={(value) => handleInputChange("availabilityStatus", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {availabilityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="minimumOrderQuantity">Minimum Order Quantity</Label>
                <Input
                  id="minimumOrderQuantity"
                  type="number"
                  value={product.minimumOrderQuantity || ""}
                  onChange={(e) => handleInputChange("minimumOrderQuantity", Number(e.target.value))}
                  placeholder="1"
                  min="1"
                />
              </div>
            </div>

            <Separator />

            {/* Image Upload */}
            <div className="space-y-4">
              <Label>Product Image *</Label>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Input
                    value={product.thumbnail || ""}
                    onChange={(e) => handleInputChange("thumbnail", e.target.value)}
                    placeholder="Enter image URL or upload an image"
                  />
                </div>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={imageUploading}
                  />
                  <Button variant="outline" disabled={imageUploading}>
                    {imageUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    Upload
                  </Button>
                </div>
              </div>
              {product.thumbnail && (
                <div className="relative w-32 h-32 border rounded-lg overflow-hidden">
                  <img
                    src={product.thumbnail || "/placeholder.svg"}
                    alt="Product preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
            <CardDescription>Warranty, shipping, and return policy details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="warrantyInformation">Warranty Information</Label>
              <Textarea
                id="warrantyInformation"
                value={product.warrantyInformation || ""}
                onChange={(e) => handleInputChange("warrantyInformation", e.target.value)}
                placeholder="Enter warranty details"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shippingInformation">Shipping Information</Label>
              <Textarea
                id="shippingInformation"
                value={product.shippingInformation || ""}
                onChange={(e) => handleInputChange("shippingInformation", e.target.value)}
                placeholder="Enter shipping details"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="returnPolicy">Return Policy</Label>
              <Textarea
                id="returnPolicy"
                value={product.returnPolicy || ""}
                onChange={(e) => handleInputChange("returnPolicy", e.target.value)}
                placeholder="Enter return policy"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
