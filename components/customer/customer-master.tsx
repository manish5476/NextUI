"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, Edit, Upload, Save, X } from "lucide-react"
import { CustomerService } from "@/lib/services/modules/customer/customer.service"
import { useToast } from "@/hooks/use-toast"
import type { Customer, CustomerPhone, CustomerAddress, CreateCustomerRequest } from "@/lib/types/customer"

interface CustomerMasterProps {
  customer?: Customer | null
  isCreateMode: boolean
  onSave: (customer: Customer) => void
  onCancel: () => void
}

export function CustomerMaster({ customer, isCreateMode, onSave, onCancel }: CustomerMasterProps) {
  const [formData, setFormData] = useState<CreateCustomerRequest>({
    fullname: "",
    email: "",
    status: "active",
    phoneNumbers: [],
    addresses: [],
    guaranteerId: "",
    profileImg: "",
  })

  const [phoneDialog, setPhoneDialog] = useState(false)
  const [addressDialog, setAddressDialog] = useState(false)
  const [editingPhoneIndex, setEditingPhoneIndex] = useState(-1)
  const [editingAddressIndex, setEditingAddressIndex] = useState(-1)
  const [newPhone, setNewPhone] = useState<CustomerPhone>({ number: "", type: "mobile", primary: false })
  const [newAddress, setNewAddress] = useState<CustomerAddress>({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
    type: "home",
    isDefault: false,
  })
  const [guarantorOptions, setGuarantorOptions] = useState<any[]>([])
  const [selectedGuarantor, setSelectedGuarantor] = useState<any>(null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  const { toast } = useToast()

  useEffect(() => {
    if (customer && !isCreateMode) {
      setFormData({
        fullname: customer.fullname,
        email: customer.email,
        status: customer.status,
        phoneNumbers: customer.phoneNumbers,
        addresses: customer.addresses,
        guaranteerId: customer.guaranteerId || "",
        profileImg: customer.profileImg || "",
      })
      setSelectedGuarantor(customer.guaranteer)
    }
    loadGuarantors()
  }, [customer, isCreateMode])

  const loadGuarantors = async () => {
    try {
      const response = await CustomerService.getCustomerDropdown()
      if (response.success) {
        setGuarantorOptions(response.data)
      }
    } catch (error) {
      console.error("Failed to load guarantors:", error)
    }
  }

  const handleInputChange = (field: keyof CreateCustomerRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      const formDataUpload = new FormData()
      formDataUpload.append("image", file)

      const response = await CustomerService.uploadProfileImage(formDataUpload)
      if (response.success) {
        handleInputChange("profileImg", response.data.imageUrl)
        toast({
          title: "Success",
          description: "Profile image uploaded successfully",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleAddPhone = () => {
    if (!newPhone.number || !newPhone.type) {
      toast({
        title: "Error",
        description: "Please enter phone number and type",
        variant: "destructive",
      })
      return
    }

    const updatedPhones = [...formData.phoneNumbers]

    if (editingPhoneIndex >= 0) {
      updatedPhones[editingPhoneIndex] = newPhone
    } else {
      // If this is primary, make others non-primary
      if (newPhone.primary) {
        updatedPhones.forEach((phone) => (phone.primary = false))
      }
      updatedPhones.push(newPhone)
    }

    handleInputChange("phoneNumbers", updatedPhones)
    setPhoneDialog(false)
    setNewPhone({ number: "", type: "mobile", primary: false })
    setEditingPhoneIndex(-1)
  }

  const handleEditPhone = (index: number) => {
    setNewPhone(formData.phoneNumbers[index])
    setEditingPhoneIndex(index)
    setPhoneDialog(true)
  }

  const handleDeletePhone = (index: number) => {
    const updatedPhones = formData.phoneNumbers.filter((_, i) => i !== index)
    handleInputChange("phoneNumbers", updatedPhones)
  }

  const handleAddAddress = () => {
    if (!newAddress.street || !newAddress.city) {
      toast({
        title: "Error",
        description: "Please enter street and city",
        variant: "destructive",
      })
      return
    }

    const updatedAddresses = [...formData.addresses]

    if (editingAddressIndex >= 0) {
      updatedAddresses[editingAddressIndex] = newAddress
    } else {
      // If this is default, make others non-default
      if (newAddress.isDefault) {
        updatedAddresses.forEach((address) => (address.isDefault = false))
      }
      updatedAddresses.push(newAddress)
    }

    handleInputChange("addresses", updatedAddresses)
    setAddressDialog(false)
    setNewAddress({
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "India",
      type: "home",
      isDefault: false,
    })
    setEditingAddressIndex(-1)
  }

  const handleEditAddress = (index: number) => {
    setNewAddress(formData.addresses[index])
    setEditingAddressIndex(index)
    setAddressDialog(true)
  }

  const handleDeleteAddress = (index: number) => {
    const updatedAddresses = formData.addresses.filter((_, i) => i !== index)
    handleInputChange("addresses", updatedAddresses)
  }

  const handleSave = async () => {
    if (!formData.fullname || !formData.email) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      setSaving(true)
      let response

      if (isCreateMode) {
        response = await CustomerService.createCustomer(formData)
      } else {
        response = await CustomerService.updateCustomer(customer!._id, formData)
      }

      if (response.success) {
        onSave(response.data)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save customer",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {isCreateMode ? "Create New Customer" : "Edit Customer"}
          </h2>
          <p className="text-muted-foreground">
            {isCreateMode ? "Add a new customer to your system" : "Update customer information"}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={onCancel}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Save Customer"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Column - Profile & Basic Info */}
        <div className="space-y-6">
          {/* Profile Image */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Image</CardTitle>
              <CardDescription>Upload customer profile picture</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={formData.profileImg || "/placeholder.svg"} alt={formData.fullname} />
                  <AvatarFallback>
                    {formData.fullname
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase() || "CU"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Label htmlFor="profile-image" className="cursor-pointer">
                    <Button variant="outline" disabled={uploading} asChild>
                      <span>
                        <Upload className="mr-2 h-4 w-4" />
                        {uploading ? "Uploading..." : "Upload Image"}
                      </span>
                    </Button>
                  </Label>
                  <Input
                    id="profile-image"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Customer personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullname">Full Name *</Label>
                <Input
                  id="fullname"
                  value={formData.fullname}
                  onChange={(e) => handleInputChange("fullname", e.target.value)}
                  placeholder="Enter full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Enter email address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Guarantor */}
          <Card>
            <CardHeader>
              <CardTitle>Guarantor</CardTitle>
              <CardDescription>Select a guarantor for this customer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Guarantor</Label>
                <Select
                  value={formData.guaranteerId}
                  onValueChange={(value) => {
                    handleInputChange("guaranteerId", value)
                    const guarantor = guarantorOptions.find((g) => g._id === value)
                    setSelectedGuarantor(guarantor)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select guarantor" />
                  </SelectTrigger>
                  <SelectContent>
                    {guarantorOptions.map((guarantor) => (
                      <SelectItem key={guarantor._id} value={guarantor._id}>
                        {guarantor.fullname}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedGuarantor && (
                <div className="p-3 border rounded-lg bg-muted/50">
                  <p className="font-medium">{selectedGuarantor.fullname}</p>
                  {selectedGuarantor.phoneNumbers?.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground">Phone Numbers:</p>
                      {selectedGuarantor.phoneNumbers.map((phone: any, index: number) => (
                        <p key={index} className="text-sm">
                          {phone.number}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Contact Info */}
        <div className="space-y-6">
          {/* Phone Numbers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Phone Numbers
                <Button size="sm" onClick={() => setPhoneDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Phone
                </Button>
              </CardTitle>
              <CardDescription>Manage customer phone numbers</CardDescription>
            </CardHeader>
            <CardContent>
              {formData.phoneNumbers.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Number</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Primary</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formData.phoneNumbers.map((phone, index) => (
                      <TableRow key={index}>
                        <TableCell>{phone.number}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {phone.type}
                          </Badge>
                        </TableCell>
                        <TableCell>{phone.primary && <Badge>Primary</Badge>}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" onClick={() => handleEditPhone(index)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleDeletePhone(index)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
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
              <CardTitle className="flex items-center justify-between">
                Addresses
                <Button size="sm" onClick={() => setAddressDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Address
                </Button>
              </CardTitle>
              <CardDescription>Manage customer addresses</CardDescription>
            </CardHeader>
            <CardContent>
              {formData.addresses.length > 0 ? (
                <div className="space-y-4">
                  {formData.addresses.map((address, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="capitalize">
                              {address.type}
                            </Badge>
                            {address.isDefault && <Badge>Default</Badge>}
                          </div>
                          <p className="font-medium">{address.street}</p>
                          <p className="text-sm text-muted-foreground">
                            {address.city}, {address.state} {address.zipCode}
                          </p>
                          <p className="text-sm text-muted-foreground">{address.country}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" onClick={() => handleEditAddress(index)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDeleteAddress(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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
      </div>

      {/* Phone Dialog */}
      <Dialog open={phoneDialog} onOpenChange={setPhoneDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPhoneIndex >= 0 ? "Edit Phone Number" : "Add Phone Number"}</DialogTitle>
            <DialogDescription>Enter the phone number details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone-number">Phone Number *</Label>
              <Input
                id="phone-number"
                value={newPhone.number}
                onChange={(e) => setNewPhone((prev) => ({ ...prev, number: e.target.value }))}
                placeholder="Enter phone number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone-type">Type *</Label>
              <Select
                value={newPhone.type}
                onValueChange={(value: any) => setNewPhone((prev) => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="home">Home</SelectItem>
                  <SelectItem value="mobile">Mobile</SelectItem>
                  <SelectItem value="work">Work</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="primary-phone"
                checked={newPhone.primary}
                onCheckedChange={(checked) => setNewPhone((prev) => ({ ...prev, primary: !!checked }))}
              />
              <Label htmlFor="primary-phone">Set as primary number</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPhoneDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddPhone}>{editingPhoneIndex >= 0 ? "Update" : "Add"} Phone</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Address Dialog */}
      <Dialog open={addressDialog} onOpenChange={setAddressDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingAddressIndex >= 0 ? "Edit Address" : "Add Address"}</DialogTitle>
            <DialogDescription>Enter the address details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="street">Street *</Label>
              <Textarea
                id="street"
                value={newAddress.street}
                onChange={(e) => setNewAddress((prev) => ({ ...prev, street: e.target.value }))}
                placeholder="Enter street address"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={newAddress.city}
                  onChange={(e) => setNewAddress((prev) => ({ ...prev, city: e.target.value }))}
                  placeholder="Enter city"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  value={newAddress.state}
                  onChange={(e) => setNewAddress((prev) => ({ ...prev, state: e.target.value }))}
                  placeholder="Enter state"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="zipCode">ZIP Code *</Label>
                <Input
                  id="zipCode"
                  value={newAddress.zipCode}
                  onChange={(e) => setNewAddress((prev) => ({ ...prev, zipCode: e.target.value }))}
                  placeholder="Enter ZIP code"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <Input
                  id="country"
                  value={newAddress.country}
                  onChange={(e) => setNewAddress((prev) => ({ ...prev, country: e.target.value }))}
                  placeholder="Enter country"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address-type">Type *</Label>
              <Select
                value={newAddress.type}
                onValueChange={(value: any) => setNewAddress((prev) => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="billing">Billing</SelectItem>
                  <SelectItem value="shipping">Shipping</SelectItem>
                  <SelectItem value="home">Home</SelectItem>
                  <SelectItem value="work">Work</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="default-address"
                checked={newAddress.isDefault}
                onCheckedChange={(checked) => setNewAddress((prev) => ({ ...prev, isDefault: !!checked }))}
              />
              <Label htmlFor="default-address">Set as default address</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddressDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddAddress}>{editingAddressIndex >= 0 ? "Update" : "Add"} Address</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
