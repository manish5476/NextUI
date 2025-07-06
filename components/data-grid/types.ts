import type React from "react"
import type { ColDef, GridOptions, GridReadyEvent } from "ag-grid-community"

export interface EditableRowData {
  id: string | number
  [key: string]: any
}

export interface ActionButtonsConfig {
  showEdit?: boolean
  showDelete?: boolean
  showSave?: boolean
  showCancel?: boolean
  customActions?: Array<{
    label: string
    icon?: React.ReactNode
    onClick: (data: any) => void
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  }>
}

export interface EditableAgGridProps {
  // Data props
  data: EditableRowData[]
  loading?: boolean
  error?: string | null

  // Column configuration
  columnDefs: ColDef[]

  // Action configuration
  actionButtons?: ActionButtonsConfig

  // Event handlers
  onSave?: (data: EditableRowData, originalData: EditableRowData) => Promise<void> | void
  onDelete?: (data: EditableRowData) => Promise<void> | void
  onCancel?: (data: EditableRowData) => void
  onRowEdit?: (data: EditableRowData) => void

  // Grid configuration
  gridOptions?: GridOptions
  pagination?: boolean
  paginationPageSize?: number
  paginationPageSizeSelector?: number[]

  // UI configuration
  height?: string | number
  className?: string

  // Grid events
  onGridReady?: (event: GridReadyEvent) => void
  onSelectionChanged?: () => void
}

export interface EditingState {
  [key: string]: {
    isEditing: boolean
    originalData: EditableRowData
    currentData: EditableRowData
  }
}
