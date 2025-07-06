"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Edit, Phone, MapPin, ShoppingCart, CreditCard, Eye } from "lucide-react"
import type { Customer } from "@/lib/types/customer"

interface CustomerViewProps {
  customer: Customer
  onEdit: () => void
}

export function CustomerView({ customer, onEdit }: CustomerViewProps) {
  const [invoiceDialog, setInvoiceDialog] = useState(false)
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>("")

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "default"
      case "inactive":
        return "secondary"
      case "pending":
        return "outline"
      case "suspended":
        return "destructive"
      case "blocked":
        return "destructive"
      case "paid":
        return "default"
      case "overdue":
        return "destructive"
      case "cancelled":
        return "secondary"
      case "completed":
        return "default"
      case "failed":
        return "destructive"
      case "refunded":
        return "outline"
      default:
        return "secondary"
    }
  }

  const handleViewInvoice = (invoiceId: string) => {
    setSelectedInvoiceId(invoiceId)
    setInvoiceDialog(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={customer.profileImg || "/placeholder.svg"} alt={customer.fullname} />
            <AvatarFallback className="text-lg">
              {customer.fullname
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{customer.fullname}</h1>
            <p className="text-muted-foreground">{customer.email}</p>
            <Badge variant={getStatusColor(customer.status) as any} className="mt-2 capitalize">
              {customer.status}
            </Badge>
          </div>
        </div>
        <Button onClick={onEdit}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Customer
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Purchased</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{customer.totalPurchasedAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Lifetime purchases</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining Amount</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${customer.remainingAmount > 0 ? "text-red-600" : "text-green-600"}`}>
              ₹{customer.remainingAmount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Outstanding balance</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Phone Numbers</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customer.phoneNumbers.length}</div>
            <p className="text-xs text-muted-foreground">Contact numbers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Addresses</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customer.addresses.length}</div>
            <p className="text-xs text-muted-foreground">Saved addresses</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Personal Details</TabsTrigger>
          <TabsTrigger value="cart">Cart & Orders</TabsTrigger>
          <TabsTrigger value="payments">Payment History</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Phone Numbers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Phone className="h-5 w-5" />
                  <span>Phone Numbers</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {customer.phoneNumbers.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Number</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Primary</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customer.phoneNumbers.map((phone, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{phone.number}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {phone.type}
                            </Badge>
                          </TableCell>
                          <TableCell>{phone.primary && <Badge>Primary</Badge>}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No phone numbers added</p>
                )}
              </CardContent>
            </Card>

            {/* Addresses */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Addresses</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {customer.addresses.length > 0 ? (
                  <div className="space-y-4">
                    {customer.addresses.map((address, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="capitalize">
                              {address.type}
                            </Badge>
                            {address.isDefault && <Badge>Default</Badge>}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="font-medium">{address.street}</p>
                          <p className="text-sm text-muted-foreground">
                            {address.city}, {address.state} {address.zipCode}
                          </p>
                          <p className="text-sm text-muted-foreground">{address.country}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No addresses added</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Guarantor Information */}
          {customer.guaranteer && (
            <Card>
              <CardHeader>
                <CardTitle>Guarantor Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 border rounded-lg bg-muted/50">
                  <p className="font-medium text-lg">{customer.guaranteer.fullname}</p>
                  {customer.guaranteer.phoneNumbers?.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-muted-foreground mb-2">Phone Numbers:</p>
                      <div className="space-y-1">
                        {customer.guaranteer.phoneNumbers.map((phone, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <Badge variant="outline" className="capitalize">
                              {phone.type}
                            </Badge>
                            <span className="text-sm">{phone.number}</span>
                            {phone.primary && <Badge>Primary</Badge>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="cart" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cart Items & Orders</CardTitle>
              <CardDescription>Customer's cart items and order history</CardDescription>
            </CardHeader>
            <CardContent>
              {customer.cart?.items?.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {customer.cart.items.map((item, index) => (
                    <Card key={index} className="overflow-hidden">
                      <div className="aspect-video bg-muted flex items-center justify-center">
                        <ShoppingCart className="h-12 w-12 text-muted-foreground" />
                      </div>
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <h3 className="font-semibold">{item.productId.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">{item.productId.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold">₹{item.productId.price.toLocaleString()}</span>
                            <Badge variant="outline">Qty: {item.quantity}</Badge>
                          </div>
                        </div>
                        {item.invoiceIds?.length > 0 && (
                          <div className="mt-4 space-y-2">
                            <p className="text-sm font-medium">Invoices:</p>
                            {item.invoiceIds.map((invoice, invoiceIndex) => (
                              <div
                                key={invoiceIndex}
                                className="flex items-center justify-between p-2 bg-muted rounded"
                              >
                                <div>
                                  <p className="text-sm font-medium">₹{invoice.totalAmount.toLocaleString()}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(invoice.invoiceDate).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Badge variant={getStatusColor(invoice.status) as any}>
                                    {invoice.status}
                                  </Badge>
                                  <Button size="sm" variant="outline" onClick={() => handleViewInvoice(invoice._id)}>
                                    <Eye className="h-3 w-3" />
                                  </Button>
                                </div>
                                
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No items in cart</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>All payment transactions for this customer</CardDescription>
            </CardHeader>
            <CardContent>
              {customer.paymentHistory?.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {customer.paymentHistory.map((payment, index) => (
                    <Card key={index} className="relative overflow-hidden">
                      <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-green-300 via-blue-500 to-purple-600" />
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <CreditCard className="h-5 w-5 text-muted-foreground" />
                            <span className="font-medium">Payment</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(payment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Transaction ID</span>
                            <Badge variant="outline" className="text-xs">
                              {payment.transactionId}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Method</span>
                            <Badge variant="outline" className="capitalize">
                              {payment.method}
                            </Badge>
                          </div>
                          <div className="pt-2">
                            <div className="text-2xl font-bold">₹{payment.amount.toLocaleString()}</div>
                            <Badge variant={getStatusColor(payment.status) as any} className="mt-2">
                              {payment.status}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No payment history</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Invoice Dialog */}
      <Dialog open={invoiceDialog} onOpenChange={setInvoiceDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <p>Invoice ID: {selectedInvoiceId}</p>
            {/* Here you would load and display the actual invoice component */}
            <p className="text-muted-foreground">Invoice details would be loaded here...</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
