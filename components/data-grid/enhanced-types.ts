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

export interface BulkEditData {
  [columnField: string]: any
}

export interface FilterCondition {
  field: string
  operator:
    | "equals"
    | "contains"
    | "startsWith"
    | "endsWith"
    | "greaterThan"
    | "lessThan"
    | "greaterThanOrEqual"
    | "lessThanOrEqual"
    | "notEquals"
  value: any
  logicalOperator?: "AND" | "OR"
}

export interface ExportOptions {
  format: "csv" | "excel"
  fileName: string
  selectedColumns?: string[]
  includeHeaders: boolean
  selectedRowsOnly: boolean
}

export interface ColumnVisibilitySettings {
  [columnField: string]: boolean
}

export interface EnhancedAgGridProps {
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
  onBulkSave?: (bulkData: BulkEditData, selectedRows: EditableRowData[]) => Promise<void> | void
  onBulkDelete?: (selectedRows: EditableRowData[]) => Promise<void> | void
  onExport?: (options: ExportOptions, data: EditableRowData[]) => Promise<void> | void

  // Grid configuration
  gridOptions?: GridOptions
  pagination?: boolean
  paginationPageSize?: number
  paginationPageSizeSelector?: number[]

  // UI configuration
  height?: string | number
  className?: string
  enableBulkEdit?: boolean
  enableExport?: boolean
  enableColumnCustomization?: boolean
  enableAdvancedFiltering?: boolean

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
