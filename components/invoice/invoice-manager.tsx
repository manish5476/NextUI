"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, Eye } from "lucide-react"
import { InvoicePrint } from "./invoice-print"
import { useToast } from "@/hooks/use-toast"

interface InvoiceItem {
  id: string
  title: string
  hsnSac: string
  quantity: number
  rate: number
  discount: number
  taxableValue: number
  gstRate: number
  gstAmount: number
  amount: number
}

interface BuyerDetails {
  fullname: string
  gstin: string
  addresses: Array<{
    street: string
    city: string
    state: string
    country: string
    zipCode: string
  }>
}

interface InvoiceData {
  id: string
  invoiceNumber: string
  invoiceDate: string
  dueDate: string
  buyerDetails: BuyerDetails
  items: InvoiceItem[]
  itemDetails: Array<{ title: string }>
  subTotal: number
  totalDiscount: number
  gst: number
  cess: number
  totalAmount: number
  notes: string
  upiId: string
}

export function InvoiceManager() {
  const [showPreview, setShowPreview] = useState(false)
  const { toast } = useToast()

  // Sample invoice data
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    id: "1",
    invoiceNumber: "INV-2024-001",
    invoiceDate: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    buyerDetails: {
      fullname: "John Doe",
      gstin: "27AABCU9603R1ZX",
      addresses: [
        {
          street: "123 Main Street",
          city: "Mumbai",
          state: "Maharashtra",
          country: "India",
          zipCode: "400001",
        },
      ],
    },
    items: [
      {
        id: "1",
        title: "Samsung Galaxy S24",
        hsnSac: "85171200",
        quantity: 1,
        rate: 75000,
        discount: 5000,
        taxableValue: 70000,
        gstRate: 18,
        gstAmount: 12600,
        amount: 82600,
      },
      {
        id: "2",
        title: "Wireless Earbuds",
        hsnSac: "85183000",
        quantity: 2,
        rate: 3000,
        discount: 500,
        taxableValue: 5500,
        gstRate: 18,
        gstAmount: 990,
        amount: 6490,
      },
    ],
    itemDetails: [{ title: "Samsung Galaxy S24" }, { title: "Wireless Earbuds" }],
    subTotal: 75500,
    totalDiscount: 5500,
    gst: 13590,
    cess: 0,
    totalAmount: 89090,
    notes: "Thank you for your business! Please make payment within 15 days.",
    upiId: "shivamelectronics@paytm",
  })

  const handlePreview = () => {
    setShowPreview(true)
  }

  const updateInvoiceField = (field: keyof InvoiceData, value: any) => {
    setInvoiceData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const updateBuyerField = (field: keyof BuyerDetails, value: any) => {
    setInvoiceData((prev) => ({
      ...prev,
      buyerDetails: {
        ...prev.buyerDetails,
        [field]: value,
      },
    }))
  }

  const updateBuyerAddress = (field: string, value: string) => {
    setInvoiceData((prev) => ({
      ...prev,
      buyerDetails: {
        ...prev.buyerDetails,
        addresses: [
          {
            ...prev.buyerDetails.addresses[0],
            [field]: value,
          },
        ],
      },
    }))
  }

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      title: "",
      hsnSac: "",
      quantity: 1,
      rate: 0,
      discount: 0,
      taxableValue: 0,
      gstRate: 18,
      gstAmount: 0,
      amount: 0,
    }

    setInvoiceData((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
      itemDetails: [...prev.itemDetails, { title: "" }],
    }))
  }

  const removeItem = (index: number) => {
    setInvoiceData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
      itemDetails: prev.itemDetails.filter((_, i) => i !== index),
    }))
  }

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    setInvoiceData((prev) => {
      const newItems = [...prev.items]
      newItems[index] = { ...newItems[index], [field]: value }

      // Recalculate amounts
      const item = newItems[index]
      const taxableValue = item.rate * item.quantity - item.discount
      const gstAmount = (taxableValue * item.gstRate) / 100
      const amount = taxableValue + gstAmount

      newItems[index] = {
        ...item,
        taxableValue,
        gstAmount,
        amount,
      }

      // Recalculate totals
      const subTotal = newItems.reduce((sum, item) => sum + item.rate * item.quantity, 0)
      const totalDiscount = newItems.reduce((sum, item) => sum + item.discount, 0)
      const gst = newItems.reduce((sum, item) => sum + item.gstAmount, 0)
      const totalAmount = newItems.reduce((sum, item) => sum + item.amount, 0)

      return {
        ...prev,
        items: newItems,
        subTotal,
        totalDiscount,
        gst,
        totalAmount,
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoice Generator</h1>
          <p className="text-muted-foreground">Create and print professional invoices</p>
        </div>
        <Button onClick={handlePreview}>
          <Eye className="mr-2 h-4 w-4" />
          Preview Invoice
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Invoice Details */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
            <CardDescription>Basic invoice information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="invoiceNumber">Invoice Number</Label>
                <Input
                  id="invoiceNumber"
                  value={invoiceData.invoiceNumber}
                  onChange={(e) => updateInvoiceField("invoiceNumber", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="upiId">UPI ID</Label>
                <Input
                  id="upiId"
                  value={invoiceData.upiId}
                  onChange={(e) => updateInvoiceField("upiId", e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="invoiceDate">Invoice Date</Label>
                <Input
                  id="invoiceDate"
                  type="date"
                  value={invoiceData.invoiceDate}
                  onChange={(e) => updateInvoiceField("invoiceDate", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={invoiceData.dueDate}
                  onChange={(e) => updateInvoiceField("dueDate", e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={invoiceData.notes}
                onChange={(e) => updateInvoiceField("notes", e.target.value)}
                placeholder="Additional notes or terms..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Buyer Details */}
        <Card>
          <CardHeader>
            <CardTitle>Buyer Details</CardTitle>
            <CardDescription>Customer information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="buyerName">Full Name</Label>
              <Input
                id="buyerName"
                value={invoiceData.buyerDetails.fullname}
                onChange={(e) => updateBuyerField("fullname", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="gstin">GSTIN</Label>
              <Input
                id="gstin"
                value={invoiceData.buyerDetails.gstin}
                onChange={(e) => updateBuyerField("gstin", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="street">Street</Label>
                <Input
                  id="street"
                  value={invoiceData.buyerDetails.addresses[0]?.street || ""}
                  onChange={(e) => updateBuyerAddress("street", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={invoiceData.buyerDetails.addresses[0]?.city || ""}
                  onChange={(e) => updateBuyerAddress("city", e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={invoiceData.buyerDetails.addresses[0]?.state || ""}
                  onChange={(e) => updateBuyerAddress("state", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={invoiceData.buyerDetails.addresses[0]?.country || ""}
                  onChange={(e) => updateBuyerAddress("country", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="zipCode">Zip Code</Label>
                <Input
                  id="zipCode"
                  value={invoiceData.buyerDetails.addresses[0]?.zipCode || ""}
                  onChange={(e) => updateBuyerAddress("zipCode", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Items */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Invoice Items</CardTitle>
              <CardDescription>Add products or services</CardDescription>
            </div>
            <Button onClick={addItem} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {invoiceData.items.map((item, index) => (
              <div key={item.id} className="grid grid-cols-12 gap-2 items-end p-4 border rounded-lg">
                <div className="col-span-3">
                  <Label>Item Description</Label>
                  <Input
                    value={item.title}
                    onChange={(e) => updateItem(index, "title", e.target.value)}
                    placeholder="Product name"
                  />
                </div>
                <div className="col-span-2">
                  <Label>HSN/SAC</Label>
                  <Input
                    value={item.hsnSac}
                    onChange={(e) => updateItem(index, "hsnSac", e.target.value)}
                    placeholder="HSN code"
                  />
                </div>
                <div className="col-span-1">
                  <Label>Qty</Label>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, "quantity", Number.parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="col-span-2">
                  <Label>Rate</Label>
                  <Input
                    type="number"
                    value={item.rate}
                    onChange={(e) => updateItem(index, "rate", Number.parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="col-span-2">
                  <Label>Discount</Label>
                  <Input
                    type="number"
                    value={item.discount}
                    onChange={(e) => updateItem(index, "discount", Number.parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="col-span-1">
                  <Label>GST %</Label>
                  <Select
                    value={item.gstRate.toString()}
                    onValueChange={(value) => updateItem(index, "gstRate", Number.parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0%</SelectItem>
                      <SelectItem value="5">5%</SelectItem>
                      <SelectItem value="12">12%</SelectItem>
                      <SelectItem value="18">18%</SelectItem>
                      <SelectItem value="28">28%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-1">
                  <Button onClick={() => removeItem(index)} variant="outline" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="mt-6 bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Sub Total:</span>
                  <span>₹{invoiceData.subTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Discount:</span>
                  <span>₹{invoiceData.totalDiscount.toLocaleString()}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>GST:</span>
                  <span>₹{invoiceData.gst.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total Amount:</span>
                  <span>₹{invoiceData.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Modal */}
      {showPreview && (
        <InvoicePrint invoiceData={invoiceData} showPreview={true} onClose={() => setShowPreview(false)} />
      )}
    </div>
  )
}
