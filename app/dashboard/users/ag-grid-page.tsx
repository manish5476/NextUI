"use client"

import { useState, useEffect, useCallback } from "react"
import { UserService } from "@/lib/services/user.service"
import type { User } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { AgGridWrapper } from "@/components/data-grid/ag-grid-wrapper"
import type { ColDef, GridReadyEvent } from "ag-grid-community"

export default function UsersAgGridPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await UserService.getAllUsers()
      if (response.success) {
        setUsers(response.data.data)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const RoleCellRenderer = (params: any) => {
    const getRoleBadgeVariant = (role: string) => {
      switch (role) {
        case "admin":
          return "destructive"
        case "seller":
          return "default"
        default:
          return "secondary"
      }
    }

    return <Badge variant={getRoleBadgeVariant(params.value)}>{params.value}</Badge>
  }

  const DateCellRenderer = (params: any) => {
    return new Date(params.value).toLocaleDateString()
  }

  const ActionsCellRenderer = (params: any) => {
    return (
      <div className="flex space-x-2 py-2">
        <Button variant="outline" size="sm" onClick={() => console.log("Edit", params.data.id)}>
          Edit
        </Button>
      </div>
    )
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
      headerName: "Email",
      field: "email",
      minWidth: 250,
    },
    {
      headerName: "Role",
      field: "role",
      cellRenderer: RoleCellRenderer,
      minWidth: 120,
    },
    {
      headerName: "Created At",
      field: "createdAt",
      cellRenderer: DateCellRenderer,
      minWidth: 150,
    },
    {
      headerName: "Actions",
      cellRenderer: ActionsCellRenderer,
      minWidth: 120,
      sortable: false,
      filter: false,
    },
  ]

  const onGridReady = useCallback((event: GridReadyEvent) => {
    // Grid is ready
  }, [])

  const onSelectionChanged = useCallback(() => {
    // Handle selection changes
  }, [])

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users (AG Grid)</h1>
          <p className="text-muted-foreground">Manage your application users with advanced data grid</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>Advanced data grid with sorting, filtering, and selection</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <AgGridWrapper
            rowData={filteredUsers}
            columnDefs={columnDefs}
            loading={loading}
            onGridReady={onGridReady}
            onSelectionChanged={onSelectionChanged}
          />
        </CardContent>
      </Card>
    </div>
  )
}
