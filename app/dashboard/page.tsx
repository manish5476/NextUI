"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AuthService } from "@/lib/services/auth.service"
import { Users, Package, FileText, DollarSign } from "lucide-react"

export default function DashboardPage() {
  const [user, setUser] = useState(AuthService.getUser())

  useEffect(() => {
    const currentUser = AuthService.getUser()
    setUser(currentUser)
  }, [])

  const stats = [
    {
      title: "Total Customers",
      value: "1,234",
      description: "+20.1% from last month",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Products",
      value: "856",
      description: "+15.3% from last month",
      icon: Package,
      color: "text-green-600",
    },
    {
      title: "Invoices",
      value: "2,341",
      description: "+12.5% from last month",
      icon: FileText,
      color: "text-purple-600",
    },
    {
      title: "Revenue",
      value: "₹45,231",
      description: "+8.2% from last month",
      icon: DollarSign,
      color: "text-yellow-600",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name || "User"}!</h1>
        <p className="text-muted-foreground">Here's what's happening with your business today.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your recent business activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New customer registered</p>
                  <p className="text-xs text-muted-foreground">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-600 rounded-full mr-3"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Invoice #1234 paid</p>
                  <p className="text-xs text-muted-foreground">5 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-purple-600 rounded-full mr-3"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New product added</p>
                  <p className="text-xs text-muted-foreground">10 minutes ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks you might want to perform</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors">
              <div className="font-medium">Create Invoice</div>
              <div className="text-sm text-muted-foreground">Generate a new invoice</div>
            </button>
            <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors">
              <div className="font-medium">Add Customer</div>
              <div className="text-sm text-muted-foreground">Register a new customer</div>
            </button>
            <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors">
              <div className="font-medium">Add Product</div>
              <div className="text-sm text-muted-foreground">Add a new product to inventory</div>
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
