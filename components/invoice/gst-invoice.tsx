"use client"

import { useState, useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Trash2, Plus, Calculator } from "lucide-react"
import { autopopulateService } from "@/lib/services/modules/autopopulate/autopopulate.service"
import { invoiceService } from "@/lib/services/modules/invoice/invoice.service"
import type { Invoice, DropdownOption } from "@/lib/types"

const invoiceItemSchema = z.object({
  product: z.string().min(1, "Product is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  rate: z.number().min(0, "Rate must be positive"),
  discount: z.number().min(0, "Discount must be positive"),
  gstRate: z.number().min(0, "GST rate must be positive"),
  taxableValue: z.number(),
  gstAmount: z.number(),
  amount: z.number(),
})

const invoiceSchema = z.object({
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  invoiceDate: z.string().min(1, "Invoice date is required"),
  dueDate: z.string().optional(),
  seller: z.string().min(1, "Seller is required"),
  buyer: z.string().min(1, "Buyer is required"),
  items: z.array(invoiceItemSchema).min(1, "At least one item is required"),
  subTotal: z.number(),
  totalDiscount: z.number(),
  gst: z.number(),
  cess: z.number(),
  totalAmount: z.number(),
  roundUp: z.boolean(),
  roundDown: z.boolean(),
  notes: z.string().optional(),
})

type InvoiceFormData = z.infer<typeof invoiceSchema>

interface GstInvoiceProps {
  invoice?: Invoice
  onSave?: (invoice: Invoice) => void
  onCancel?: () => void
}

export function GstInvoice({ invoice, onSave, onCancel }: GstInvoiceProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [dropdownData, setDropdownData] = useState<{
    products: DropdownOption[]
    customers: DropdownOption[]
    sellers: DropdownOption[]
  }>({
    products: [],
    customers: [],
    sellers: [],
  })
  const { toast } = useToast()

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      invoiceNumber: invoice?.invoiceNumber || "",
      invoiceDate: invoice?.invoiceDate || new Date().toISOString().split("T")[0],
      dueDate: invoice?.dueDate || "",
      seller: invoice?.seller || "",
      buyer: invoice?.buyer || "",
      items: invoice?.items || [
        {
          product: "",
          quantity: 1,
          rate: 0,
          discount: 0,
          gstRate: 0,
          taxableValue: 0,
          gstAmount: 0,
          amount: 0,
        },
      ],
      subTotal: invoice?.subTotal || 0,
      totalDiscount: invoice?.totalDiscount || 0,
      gst: invoice?.gst || 0,
      cess: invoice?.cess || 0,
      totalAmount: invoice?.totalAmount || 0,
      roundUp: invoice?.roundUp || false,
      roundDown: invoice?.roundDown || false,
      notes: invoice?.notes || "",
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  })

  useEffect(() => {
    loadDropdownData()
  }, [])

  useEffect(() => {
    const subscription = form.watch(() => {
      calculateTotals()
    })
    return () => subscription.unsubscribe()
  }, [form])

  const loadDropdownData = async () => {
    try {
      const data = await autopopulateService.getAllModulesData()
      setDropdownData(data)
    } catch (error) {
      console.error("Error loading dropdown data:", error)
      toast({
        title: "Error",
        description: "Failed to load dropdown data",
        variant: "destructive",
      })
    }
  }

  const calculateItemAmount = (itemIndex: number) => {
    const items = form.getValues("items")
    const item = items[itemIndex]

    if (!item) return

    const quantity = item.quantity || 0
    const rate = item.rate || 0
    const discount = item.discount || 0
    const gstRate = item.gstRate || 0

    let taxableValue = quantity * rate
    if (discount > 0) {
      taxableValue -= (taxableValue * discount) / 100
    }

    const gstAmount = (taxableValue * gstRate) / 100
    const amount = taxableValue + gstAmount

    form.setValue(`items.${itemIndex}.taxableValue`, taxableValue)
    form.setValue(`items.${itemIndex}.gstAmount`, gstAmount)
    form.setValue(`items.${itemIndex}.amount`, amount)
  }

  const calculateTotals = () => {
    const items = form.getValues("items")
    const totalDiscount = form.getValues("totalDiscount") || 0
    const roundUp = form.getValues("roundUp")
    const roundDown = form.getValues("roundDown")

    let subTotal = 0
    let gst = 0
    let totalAmount = 0

    items.forEach((item, index) => {
      calculateItemAmount(index)
      subTotal += item.taxableValue || 0
      gst += item.gstAmount || 0
      totalAmount += item.amount || 0
    })

    if (totalDiscount > 0) {
      totalAmount -= totalDiscount
    }

    if (roundUp) {
      totalAmount = Math.ceil(totalAmount)
    } else if (roundDown) {
      totalAmount = Math.floor(totalAmount)
    }

    form.setValue("subTotal", subTotal)
    form.setValue("gst", gst)
    form.setValue("totalAmount", totalAmount)
  }

  const onProductChange = async (productId: string, itemIndex: number) => {
    try {
      const product = dropdownData.products.find((p) => p._id === productId)
      if (product) {
        // Assuming product has rate and gstRate properties
        form.setValue(`items.${itemIndex}.rate`, (product as any).rate || 0)
        form.setValue(`items.${itemIndex}.gstRate`, (product as any).gstRate || 0)
        calculateItemAmount(itemIndex)
      }
    } catch (error) {
      console.error("Error loading product details:", error)
    }
  }

  const addItem = () => {
    append({
      product: "",
      quantity: 1,
      rate: 0,
      discount: 0,
      gstRate: 0,
      taxableValue: 0,
      gstAmount: 0,
      amount: 0,
    })
  }

  const removeItem = (index: number) => {
    if (fields.length > 1) {
      remove(index)
    } else {
      toast({
        title: "Info",
        description: "At least one item is required",
      })
    }
  }

  const generateInvoiceNumber = () => {
    const buyer = form.getValues("buyer")
    if (!buyer) {
      toast({
        title: "Error",
        description: "Please select a buyer first",
        variant: "destructive",
      })
      return
    }

    const now = new Date()
    const datePart = now.toISOString().slice(0, 10).replace(/-/g, "")
    const timePart = now.toTimeString().slice(0, 8).replace(/:/g, "")
    const invoiceNumber = `${buyer.substring(0, 5)}_${datePart}_${timePart}`

    form.setValue("invoiceNumber", invoiceNumber)
  }

  const onSubmit = async (data: InvoiceFormData) => {
    setIsLoading(true)
    try {
      let result
      if (invoice?._id) {
        result = await invoiceService.updateInvoice(invoice._id, data)
      } else {
        result = await invoiceService.createInvoice(data)
      }

      toast({
        title: "Success",
        description: `Invoice ${invoice?._id ? "updated" : "created"} successfully`,
      })

      onSave?.(result)
    } catch (error) {
      console.error("Error saving invoice:", error)
      toast({
        title: "Error",
        description: "Failed to save invoice",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount)
  }

  return (
    <div className="bg-gray-100 text-gray-900 py-6 px-4 md:px-8 lg:px-12">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-purple-500">GST Invoice</h2>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Form Fields */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div>
                <Label htmlFor="invoiceNumber">Invoice No*</Label>
                <div className="flex gap-2">
                  <Input
                    id="invoiceNumber"
                    {...form.register("invoiceNumber")}
                    placeholder="Enter Invoice No"
                    className="flex-1"
                  />
                  <Button type="button" onClick={generateInvoiceNumber} size="sm" variant="outline">
                    <Calculator className="h-4 w-4" />
                  </Button>
                </div>
                {form.formState.errors.invoiceNumber && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.invoiceNumber.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="invoiceDate">Invoice Date*</Label>
                <Input id="invoiceDate" type="date" {...form.register("invoiceDate")} />
                {form.formState.errors.invoiceDate && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.invoiceDate.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <Input id="dueDate" type="date" {...form.register("dueDate")} />
              </div>

              <div>
                <Label>Billed By</Label>
                <Select onValueChange={(value) => form.setValue("seller", value)} value={form.getValues("seller")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Seller" />
                  </SelectTrigger>
                  <SelectContent>
                    {dropdownData.sellers.map((seller) => (
                      <SelectItem key={seller._id} value={seller._id}>
                        {seller.name || seller.fullname}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.seller && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.seller.message}</p>
                )}
              </div>

              <div>
                <Label>Billed To</Label>
                <Select onValueChange={(value) => form.setValue("buyer", value)} value={form.getValues("buyer")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Buyer" />
                  </SelectTrigger>
                  <SelectContent>
                    {dropdownData.customers.map((customer) => (
                      <SelectItem key={customer._id} value={customer._id}>
                        {customer.fullname || customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.buyer && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.buyer.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Items Table */}
        <Card>
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border border-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 text-left">Item</th>
                    <th className="p-2 text-left">GST (%)</th>
                    <th className="p-2 text-left">Qty</th>
                    <th className="p-2 text-left">Rate</th>
                    <th className="p-2 text-left">Discount (%)</th>
                    <th className="p-2 text-left">Taxable</th>
                    <th className="p-2 text-left">GST Amt</th>
                    <th className="p-2 text-left">Total</th>
                    <th className="p-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {fields.map((field, index) => (
                    <tr key={field.id} className="border-t hover:bg-gray-50">
                      <td className="p-2">
                        <Select
                          onValueChange={(value) => {
                            form.setValue(`items.${index}.product`, value)
                            onProductChange(value, index)
                          }}
                          value={form.getValues(`items.${index}.product`)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Product" />
                          </SelectTrigger>
                          <SelectContent>
                            {dropdownData.products.map((product) => (
                              <SelectItem key={product._id} value={product._id}>
                                {product.title || product.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          {...form.register(`items.${index}.gstRate`, { valueAsNumber: true })}
                          onChange={(e) => {
                            form.setValue(`items.${index}.gstRate`, Number.parseFloat(e.target.value) || 0)
                            calculateItemAmount(index)
                          }}
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          {...form.register(`items.${index}.quantity`, { valueAsNumber: true })}
                          onChange={(e) => {
                            form.setValue(`items.${index}.quantity`, Number.parseFloat(e.target.value) || 0)
                            calculateItemAmount(index)
                          }}
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          {...form.register(`items.${index}.rate`, { valueAsNumber: true })}
                          onChange={(e) => {
                            form.setValue(`items.${index}.rate`, Number.parseFloat(e.target.value) || 0)
                            calculateItemAmount(index)
                          }}
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          {...form.register(`items.${index}.discount`, { valueAsNumber: true })}
                          onChange={(e) => {
                            form.setValue(`items.${index}.discount`, Number.parseFloat(e.target.value) || 0)
                            calculateItemAmount(index)
                          }}
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          {...form.register(`items.${index}.taxableValue`, { valueAsNumber: true })}
                          readOnly
                          className="bg-gray-100"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          {...form.register(`items.${index}.gstAmount`, { valueAsNumber: true })}
                          readOnly
                          className="bg-gray-100"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          {...form.register(`items.${index}.amount`, { valueAsNumber: true })}
                          readOnly
                          className="bg-gray-100"
                        />
                      </td>
                      <td className="p-2 text-center">
                        <div className="flex gap-2 justify-center">
                          <Button
                            type="button"
                            onClick={addItem}
                            size="sm"
                            variant="outline"
                            className="text-green-600 bg-transparent"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            onClick={() => removeItem(index)}
                            size="sm"
                            variant="outline"
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Round Off Section */}
        <div className="flex items-center gap-6">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="roundUp"
              checked={form.getValues("roundUp")}
              onCheckedChange={(checked) => {
                form.setValue("roundUp", !!checked)
                if (checked) form.setValue("roundDown", false)
                calculateTotals()
              }}
            />
            <Label htmlFor="roundUp">Round Up</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="roundDown"
              checked={form.getValues("roundDown")}
              onCheckedChange={(checked) => {
                form.setValue("roundDown", !!checked)
                if (checked) form.setValue("roundUp", false)
                calculateTotals()
              }}
            />
            <Label htmlFor="roundDown">Round Down</Label>
          </div>
        </div>

        {/* Totals Section */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-md mb-2">Place of Supply</h3>
                <p>Gujarat, India</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Sub Total:</span>
                  <span>{formatCurrency(form.getValues("subTotal"))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">GST:</span>
                  <span>{formatCurrency(form.getValues("gst"))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">CESS:</span>
                  <span>{formatCurrency(form.getValues("cess"))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Discount:</span>
                  <Input
                    type="number"
                    {...form.register("totalDiscount", { valueAsNumber: true })}
                    onChange={(e) => {
                      form.setValue("totalDiscount", Number.parseFloat(e.target.value) || 0)
                      calculateTotals()
                    }}
                    className="w-24 text-right"
                  />
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total (INR):</span>
                  <span>{formatCurrency(form.getValues("totalAmount"))}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardContent className="p-6">
            <Label htmlFor="notes">Notes</Label>
            <Input id="notes" {...form.register("notes")} placeholder="Additional notes..." className="mt-2" />
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <Button type="submit" disabled={isLoading} className="bg-purple-600 hover:bg-purple-700">
            {isLoading ? "Saving..." : "Save & Continue"}
          </Button>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}
