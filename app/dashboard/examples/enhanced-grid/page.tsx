"use client"

import { useState } from "react"
import { EnhancedAgGrid } from "@/components/data-grid/enhanced-ag-grid"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { ColDef } from "ag-grid-community"
import type { EditableRowData, BulkEditData, ExportOptions } from "@/components/data-grid/enhanced-types"

// Enhanced sample data
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
    joinDate: "2019-01-15",
    location: "New York",
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
    joinDate: "2020-03-22",
    location: "Los Angeles",
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
    joinDate: "2018-07-10",
    location: "Chicago",
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
    joinDate: "2021-05-18",
    location: "Miami",
  },
  {
    id: 5,
    name: "Charlie Wilson",
    email: "charlie@example.com",
    age: 29,
    department: "Engineering",
    salary: 80000,
    status: "active",
    notes: "Full-stack developer",
    joinDate: "2020-09-01",
    location: "Seattle",
  },
  {
    id: 6,
    name: "Diana Prince",
    email: "diana@example.com",
    age: 31,
    department: "Finance",
    salary: 72000,
    status: "active",
    notes: "Financial analyst",
    joinDate: "2019-11-12",
    location: "Boston",
  },
]

export default function EnhancedGridExample() {
  const [data, setData] = useState<EditableRowData[]>(initialData)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Enhanced column definitions
  const columnDefs: ColDef[] = [
    {
      headerName: "Name",
      field: "name",
      editable: true,
      minWidth: 150,
      checkboxSelection: true,
      headerCheckboxSelection: true,
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
      headerName: "Join Date",
      field: "joinDate",
      editable: true,
      cellEditorParams: { type: "date" },
      valueFormatter: (params) => {
        if (params.value) {
          return new Date(params.value).toLocaleDateString()
        }
        return ""
      },
      minWidth: 120,
    },
    {
      headerName: "Location",
      field: "location",
      editable: true,
      cellEditorParams: {
        type: "select",
        options: [
          { value: "New York", label: "New York" },
          { value: "Los Angeles", label: "Los Angeles" },
          { value: "Chicago", label: "Chicago" },
          { value: "Miami", label: "Miami" },
          { value: "Seattle", label: "Seattle" },
          { value: "Boston", label: "Boston" },
        ],
      },
      minWidth: 120,
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
    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setData((prevData) => prevData.map((item) => (item.id === updatedData.id ? updatedData : item)))

    setLoading(false)
    console.log("Saved:", { updatedData, originalData })
  }

  const handleDelete = async (rowData: EditableRowData) => {
    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 500))

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

  const handleBulkSave = async (bulkData: BulkEditData, selectedRows: EditableRowData[]) => {
    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setData((prevData) =>
      prevData.map((item) => {
        if (selectedRows.some((row) => row.id === item.id)) {
          return { ...item, ...bulkData }
        }
        return item
      }),
    )

    setLoading(false)
    console.log("Bulk saved:", { bulkData, selectedRows })
  }

  const handleBulkDelete = async (selectedRows: EditableRowData[]) => {
    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const idsToDelete = selectedRows.map((row) => row.id)
    setData((prevData) => prevData.filter((item) => !idsToDelete.includes(item.id)))

    setLoading(false)
    console.log("Bulk deleted:", selectedRows)
  }

  const handleExport = async (options: ExportOptions, dataToExport: EditableRowData[]) => {
    console.log("Exporting:", { options, dataToExport })
    // Custom export logic can be implemented here
    toast({
      title: "Export Started",
      description: `Exporting ${dataToExport.length} rows as ${options.format.toUpperCase()}`,
    })
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
      joinDate: new Date().toISOString().split("T")[0],
      location: "New York",
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
          <h1 className="text-3xl font-bold tracking-tight">Enhanced AG Grid Example</h1>
          <p className="text-muted-foreground">
            Complete example with bulk operations, export, column customization, and advanced filtering
          </p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Row
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Employee Management System</CardTitle>
          <CardDescription>
            Advanced data grid with all enhanced features: bulk edit, export, column customization, and filtering
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EnhancedAgGrid
            data={data}
            loading={loading}
            columnDefs={columnDefs}
            onSave={handleSave}
            onDelete={handleDelete}
            onCancel={handleCancel}
            onRowEdit={handleRowEdit}
            onBulkSave={handleBulkSave}
            onBulkDelete={handleBulkDelete}
            onExport={handleExport}
            actionButtons={{
              showEdit: true,
              showDelete: true,
              showSave: true,
              showCancel: true,
              customActions: [
                {
                  label: "View Profile",
                  icon: <span>👤</span>,
                  onClick: (data) => {
                    toast({
                      title: "View Profile",
                      description: `Viewing profile for ${data.name}`,
                    })
                  },
                  variant: "outline",
                },
              ],
            }}
            enableBulkEdit={true}
            enableExport={true}
            enableColumnCustomization={true}
            enableAdvancedFiltering={true}
            pagination={true}
            paginationPageSize={10}
            paginationPageSizeSelector={[5, 10, 20, 50]}
            height={600}
          />
        </CardContent>
      </Card>

      {/* Feature Documentation */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Bulk Operations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <h4 className="font-semibold">Bulk Edit:</h4>
              <p className="text-sm text-muted-foreground">
                Select multiple rows and click "Bulk Edit" to modify common fields across all selected rows.
              </p>
            </div>
            <div>
              <h4 className="font-semibold">Bulk Delete:</h4>
              <p className="text-sm text-muted-foreground">
                Select multiple rows and click "Delete Selected" to remove them with confirmation.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Export Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <h4 className="font-semibold">Format Options:</h4>
              <p className="text-sm text-muted-foreground">Export data as CSV or Excel with customizable options.</p>
            </div>
            <div>
              <h4 className="font-semibold">Column Selection:</h4>
              <p className="text-sm text-muted-foreground">Choose which columns to include in the export.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Column Customization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <h4 className="font-semibold">Show/Hide Columns:</h4>
              <p className="text-sm text-muted-foreground">
                Click "Columns" to customize which columns are visible in the grid.
              </p>
            </div>
            <div>
              <h4 className="font-semibold">Persistent Settings:</h4>
              <p className="text-sm text-muted-foreground">Column visibility settings are saved in local storage.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Advanced Filtering</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <h4 className="font-semibold">Multiple Conditions:</h4>
              <p className="text-sm text-muted-foreground">
                Create complex filters with multiple conditions using AND/OR logic.
              </p>
            </div>
            <div>
              <h4 className="font-semibold">Various Operators:</h4>
              <p className="text-sm text-muted-foreground">
                Use operators like equals, contains, greater than, etc. for precise filtering.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
