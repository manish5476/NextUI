"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Users, UserCheck, DollarSign, TrendingUp } from "lucide-react"
import { CustomerService } from "@/lib/services/modules/customer/customer.service"
import { CustomerGrid } from "@/components/customer/customer-grid"
import { CustomerMaster } from "@/components/customer/customer-master"
import { CustomerView } from "@/components/customer/customer-view"
import { useToast } from "@/hooks/use-toast"
import type { Customer } from "@/lib/types/customer"

export default function CustomersPage() {
  const [activeTab, setActiveTab] = useState("grid")
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isCreateMode, setIsCreateMode] = useState(false)
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
  })
  const { toast } = useToast()

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const response = await CustomerService.getCustomerStats()
      if (response.success) {
        setStats(response.data)
      }
    } catch (error) {
      console.error("Failed to load customer stats:", error)
    }
  }

  const handleCreateCustomer = () => {
    setSelectedCustomer(null)
    setIsCreateMode(true)
    setActiveTab("master")
  }

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setIsCreateMode(false)
    setActiveTab("master")
  }

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setActiveTab("view")
  }

  const handleCustomerSaved = (customer: Customer) => {
    toast({
      title: "Success",
      description: `Customer ${isCreateMode ? "created" : "updated"} successfully`,
    })
    setActiveTab("grid")
    setSelectedCustomer(null)
    setIsCreateMode(false)
    loadStats()
  }

  const handleCustomerDeleted = () => {
    toast({
      title: "Success",
      description: "Customer deleted successfully",
    })
    loadStats()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customer Management</h1>
          <p className="text-muted-foreground">Manage your customers, view details, and track their activities</p>
        </div>
        <Button onClick={handleCreateCustomer}>
          <Plus className="mr-2 h-4 w-4" />
          Add Customer
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">All registered customers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCustomers}</div>
            <p className="text-xs text-muted-foreground">Currently active customers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">From all customers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.averageOrderValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Per customer order</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="grid">Customer Grid</TabsTrigger>
          <TabsTrigger value="master">{isCreateMode ? "Create Customer" : "Edit Customer"}</TabsTrigger>
          {selectedCustomer && <TabsTrigger value="view">Customer Details</TabsTrigger>}
        </TabsList>

        <TabsContent value="grid" className="space-y-4">
          <CustomerGrid onEdit={handleEditCustomer} onView={handleViewCustomer} onDelete={handleCustomerDeleted} />
        </TabsContent>

        <TabsContent value="master" className="space-y-4">
          <CustomerMaster
            customer={selectedCustomer}
            isCreateMode={isCreateMode}
            onSave={handleCustomerSaved}
            onCancel={() => setActiveTab("grid")}
          />
        </TabsContent>

        {selectedCustomer && (
          <TabsContent value="view" className="space-y-4">
            <CustomerView customer={selectedCustomer} onEdit={() => handleEditCustomer(selectedCustomer)} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
