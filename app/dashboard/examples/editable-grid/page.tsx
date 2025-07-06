"use client"

import { useState } from "react"
import { EditableAgGrid } from "@/components/data-grid/editable-ag-grid"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { ColDef } from "ag-grid-community"
import type { EditableRowData } from "@/components/data-grid/types"

// Sample data
const initialData: EditableRowData[] = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    age: 30,
    department: "Engineering",
    salary: 75000,
    status: "active",
    notes: "Senior developer with 5 years experience",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    age: 28,
    department: "Marketing",
    salary: 65000,
    status: "active",
    notes: "Marketing specialist",
  },
  {
    id: 3,
    name: "Bob Johnson",
    email: "bob@example.com",
    age: 35,
    department: "Sales",
    salary: 70000,
    status: "inactive",
    notes: "Sales manager",
  },
  {
    id: 4,
    name: "Alice Brown",
    email: "alice@example.com",
    age: 32,
    department: "HR",
    salary: 60000,
    status: "active",
    notes: "HR coordinator",
  },
]

export default function EditableGridExample() {
  const [data, setData] = useState<EditableRowData[]>(initialData)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Column definitions with editable configuration
  const columnDefs: ColDef[] = [
    {
      headerName: "Name",
      field: "name",
      editable: true,
      minWidth: 150,
    },
    {
      headerName: "Email",
      field: "email",
      editable: true,
      cellEditorParams: { type: "email" },
      minWidth: 200,
    },
    {
      headerName: "Age",
      field: "age",
      editable: true,
      cellEditorParams: { type: "number" },
      width: 100,
    },
    {
      headerName: "Department",
      field: "department",
      editable: true,
      cellEditorParams: {
        type: "select",
        options: [
          { value: "Engineering", label: "Engineering" },
          { value: "Marketing", label: "Marketing" },
          { value: "Sales", label: "Sales" },
          { value: "HR", label: "Human Resources" },
          { value: "Finance", label: "Finance" },
        ],
      },
      minWidth: 150,
    },
    {
      headerName: "Salary",
      field: "salary",
      editable: true,
      cellEditorParams: { type: "number" },
      valueFormatter: (params) => `$${params.value?.toLocaleString() || 0}`,
      minWidth: 120,
    },
    {
      headerName: "Status",
      field: "status",
      editable: true,
      cellEditorParams: {
        type: "select",
        options: [
          { value: "active", label: "Active" },
          { value: "inactive", label: "Inactive" },
          { value: "pending", label: "Pending" },
        ],
      },
      cellRenderer: (params: any) => {
        const status = params.value
        const colorMap = {
          active: "bg-green-100 text-green-800",
          inactive: "bg-red-100 text-red-800",
          pending: "bg-yellow-100 text-yellow-800",
        }
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${colorMap[status as keyof typeof colorMap] || ""}`}
          >
            {status}
          </span>
        )
      },
      width: 120,
    },
    {
      headerName: "Notes",
      field: "notes",
      editable: true,
      cellEditorParams: { type: "textarea" },
      minWidth: 200,
      tooltipField: "notes",
    },
  ]

  // Event handlers
  const handleSave = async (updatedData: EditableRowData, originalData: EditableRowData) => {
    // Simulate API call
    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Update local data
    setData((prevData) => prevData.map((item) => (item.id === updatedData.id ? updatedData : item)))

    setLoading(false)
    console.log("Saved:", { updatedData, originalData })
  }

  const handleDelete = async (rowData: EditableRowData) => {
    // Simulate API call
    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Remove from local data
    setData((prevData) => prevData.filter((item) => item.id !== rowData.id))

    setLoading(false)
    console.log("Deleted:", rowData)
  }

  const handleCancel = (originalData: EditableRowData) => {
    console.log("Cancelled editing:", originalData)
  }

  const handleRowEdit = (data: EditableRowData) => {
    console.log("Started editing:", data)
  }

  const handleAddNew = () => {
    const newId = Math.max(...data.map((d) => Number(d.id))) + 1
    const newRow: EditableRowData = {
      id: newId,
      name: "",
      email: "",
      age: 0,
      department: "Engineering",
      salary: 0,
      status: "pending",
      notes: "",
    }
    setData((prevData) => [...prevData, newRow])

    toast({
      title: "New Row Added",
      description: "Click Edit to start editing the new row",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Editable AG Grid Example</h1>
          <p className="text-muted-foreground">
            Comprehensive example with inline editing, action buttons, and custom cell renderers
          </p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Row
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Employee Management</CardTitle>
          <CardDescription>
            Click Edit to modify rows, use different input types, and see real-time validation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EditableAgGrid
            data={data}
            loading={loading}
            columnDefs={columnDefs}
            onSave={handleSave}
            onDelete={handleDelete}
            onCancel={handleCancel}
            onRowEdit={handleRowEdit}
            actionButtons={{
              showEdit: true,
              showDelete: true,
              showSave: true,
              showCancel: true,
              customActions: [
                {
                  label: "View Details",
                  icon: <span>👁️</span>,
                  onClick: (data) => {
                    toast({
                      title: "View Details",
                      description: `Viewing details for ${data.name}`,
                    })
                  },
                  variant: "outline",
                },
              ],
            }}
            pagination={true}
            paginationPageSize={10}
            paginationPageSizeSelector={[5, 10, 20, 50]}
            height={500}
          />
        </CardContent>
      </Card>

      {/* Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold">Editing Rows:</h4>
            <p className="text-sm text-muted-foreground">
              Click the Edit button to enable inline editing. Editable cells will be highlighted in blue.
            </p>
          </div>
          <div>
            <h4 className="font-semibold">Cell Types:</h4>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>
                <strong>Text:</strong> Name field - standard text input
              </li>
              <li>
                <strong>Email:</strong> Email field - email validation
              </li>
              <li>
                <strong>Number:</strong> Age, Salary - numeric input
              </li>
              <li>
                <strong>Select:</strong> Department, Status - dropdown selection
              </li>
              <li>
                <strong>Textarea:</strong> Notes - multi-line text input
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold">Actions:</h4>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>
                <strong>Edit:</strong> Enable editing mode for the row
              </li>
              <li>
                <strong>Save:</strong> Save changes and exit editing mode
              </li>
              <li>
                <strong>Cancel:</strong> Discard changes and exit editing mode
              </li>
              <li>
                <strong>Delete:</strong> Remove the row from the grid
              </li>
              <li>
                <strong>View Details:</strong> Custom action example
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
