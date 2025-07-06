"use client"

import { useState, useCallback, useMemo, useRef, useEffect } from "react"
import { AgGridReact } from "ag-grid-react"
import type { ColDef, GridReadyEvent, IRowNode } from "ag-grid-community"
import "ag-grid-community/styles/ag-grid.css"
import "ag-grid-community/styles/ag-theme-alpine.css"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, RefreshCw, Edit, Trash2, Download, Settings, Filter } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ActionButtonsRenderer } from "./cell-renderers/action-buttons-renderer"
import { EditableCellRenderer } from "./cell-renderers/editable-cell-renderer"
import { BulkEditModal } from "./modals/bulk-edit-modal"
import { DeleteConfirmationModal } from "./modals/delete-confirmation-modal"
import { ExportModal } from "./modals/export-modal"
import { ColumnCustomizationModal } from "./modals/column-customization-modal"
import { AdvancedFilterModal } from "./modals/advanced-filter-modal"
import type {
  EnhancedAgGridProps,
  EditableRowData,
  EditingState,
  BulkEditData,
  ExportOptions,
  ColumnVisibilitySettings,
  FilterCondition,
} from "./enhanced-types"

const STORAGE_KEYS = {
  COLUMN_VISIBILITY: "ag-grid-column-visibility",
  FILTER_CONDITIONS: "ag-grid-filter-conditions",
}

export function EnhancedAgGrid({
  data,
  loading = false,
  error = null,
  columnDefs,
  actionButtons = {},
  onSave,
  onDelete,
  onCancel,
  onRowEdit,
  onBulkSave,
  onBulkDelete,
  onExport,
  gridOptions = {},
  pagination = true,
  paginationPageSize = 20,
  paginationPageSizeSelector = [10, 20, 50, 100],
  height = 400,
  className = "ag-theme-alpine",
  enableBulkEdit = true,
  enableExport = true,
  enableColumnCustomization = true,
  enableAdvancedFiltering = true,
  onGridReady,
  onSelectionChanged,
}: EnhancedAgGridProps) {
  const [editingState, setEditingState] = useState<EditingState>({})
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedRows, setSelectedRows] = useState<EditableRowData[]>([])
  const [filteredData, setFilteredData] = useState<EditableRowData[]>(data)

  // Modal states
  const [showBulkEditModal, setShowBulkEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [showColumnModal, setShowColumnModal] = useState(false)
  const [showFilterModal, setShowFilterModal] = useState(false)

  // Settings states
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibilitySettings>({})
  const [filterConditions, setFilterConditions] = useState<FilterCondition[]>([])

  const gridRef = useRef<AgGridReact>(null)
  const { toast } = useToast()

  // Load settings from localStorage
  useEffect(() => {
    const savedColumnVisibility = localStorage.getItem(STORAGE_KEYS.COLUMN_VISIBILITY)
    const savedFilterConditions = localStorage.getItem(STORAGE_KEYS.FILTER_CONDITIONS)

    if (savedColumnVisibility) {
      setColumnVisibility(JSON.parse(savedColumnVisibility))
    } else {
      // Initialize with all columns visible
      const defaultVisibility: ColumnVisibilitySettings = {}
      columnDefs.forEach((col) => {
        if (col.field && col.field !== "actions") {
          defaultVisibility[col.field] = true
        }
      })
      setColumnVisibility(defaultVisibility)
    }

    if (savedFilterConditions) {
      setFilterConditions(JSON.parse(savedFilterConditions))
    }
  }, [columnDefs])

  // Apply filters to data
  useEffect(() => {
    let filtered = [...data]

    if (filterConditions.length > 0) {
      filtered = data.filter((row) => {
        return filterConditions.every((condition, index) => {
          const fieldValue = row[condition.field]
          const conditionValue = condition.value

          let matches = false
          switch (condition.operator) {
            case "equals":
              matches = String(fieldValue).toLowerCase() === String(conditionValue).toLowerCase()
              break
            case "notEquals":
              matches = String(fieldValue).toLowerCase() !== String(conditionValue).toLowerCase()
              break
            case "contains":
              matches = String(fieldValue).toLowerCase().includes(String(conditionValue).toLowerCase())
              break
            case "startsWith":
              matches = String(fieldValue).toLowerCase().startsWith(String(conditionValue).toLowerCase())
              break
            case "endsWith":
              matches = String(fieldValue).toLowerCase().endsWith(String(conditionValue).toLowerCase())
              break
            case "greaterThan":
              matches = Number(fieldValue) > Number(conditionValue)
              break
            case "lessThan":
              matches = Number(fieldValue) < Number(conditionValue)
              break
            case "greaterThanOrEqual":
              matches = Number(fieldValue) >= Number(conditionValue)
              break
            case "lessThanOrEqual":
              matches = Number(fieldValue) <= Number(conditionValue)
              break
          }

          if (index === 0) return matches

          const logicalOp = condition.logicalOperator || "AND"
          const prevResult = filterConditions
            .slice(0, index)
            .every((prevCondition) => applyCondition(row, prevCondition))

          return logicalOp === "AND" ? prevResult && matches : prevResult || matches
        })
      })
    }

    setFilteredData(filtered)
  }, [data, filterConditions])

  const applyCondition = (row: EditableRowData, condition: FilterCondition): boolean => {
    const fieldValue = row[condition.field]
    const conditionValue = condition.value

    switch (condition.operator) {
      case "equals":
        return String(fieldValue).toLowerCase() === String(conditionValue).toLowerCase()
      case "notEquals":
        return String(fieldValue).toLowerCase() !== String(conditionValue).toLowerCase()
      case "contains":
        return String(fieldValue).toLowerCase().includes(String(conditionValue).toLowerCase())
      case "startsWith":
        return String(fieldValue).toLowerCase().startsWith(String(conditionValue).toLowerCase())
      case "endsWith":
        return String(fieldValue).toLowerCase().endsWith(String(conditionValue).toLowerCase())
      case "greaterThan":
        return Number(fieldValue) > Number(conditionValue)
      case "lessThan":
        return Number(fieldValue) < Number(conditionValue)
      case "greaterThanOrEqual":
        return Number(fieldValue) >= Number(conditionValue)
      case "lessThanOrEqual":
        return Number(fieldValue) <= Number(conditionValue)
      default:
        return true
    }
  }

  // Enhanced column definitions with visibility and action buttons
  const enhancedColumnDefs = useMemo(() => {
    console.log('Column visibility state:', columnVisibility)
    console.log('Original columnDefs:', columnDefs)
    console.log('Data length:', data.length)
    const actionColumn: ColDef = {
      headerName: "Actions",
      field: "actions",
      cellRenderer: (params: any) => {
        const isEditing = editingState[params.data.id]?.isEditing || false
        return (
          <ActionButtonsRenderer
            data={params.data}
            isEditing={isEditing}
            actionButtons={actionButtons}
            onEdit={handleEdit}
            onSave={handleSave}
            onCancel={handleCancel}
            onDelete={handleDelete}
          />
        )
      },
      width: 120,
      minWidth: 120,
      maxWidth: 150,
      sortable: false,
      filter: false,
      resizable: false,
      pinned: "right",
    }

    const visibleColumns = columnDefs
      // Temporarily disable column visibility filtering to debug
      // .filter((colDef) => columnVisibility[colDef.field!] !== false)
      .map((colDef) => {
        if (colDef.editable) {
          return {
            ...colDef,
            cellRenderer: (params: any) => {
              const isEditing = editingState[params.data.id]?.isEditing || false
              return (
                <EditableCellRenderer
                  value={params.value}
                  data={params.data}
                  colDef={colDef}
                  isEditing={isEditing}
                  onValueChange={(newValue) => handleCellValueChange(params.data.id, colDef.field!, newValue)}
                  cellType={colDef.cellEditorParams?.type || "text"}
                  selectOptions={colDef.cellEditorParams?.options || []}
                />
              )
            },
            cellClass: (params: any) => {
              const isEditing = editingState[params.data.id]?.isEditing || false
              return isEditing ? "ag-cell-editing" : ""
            },
          }
        }
        return colDef
      })

    return [...visibleColumns, actionColumn]
  }, [columnDefs, columnVisibility, editingState, actionButtons])

  // Event handlers
  const handleEdit = useCallback(
    (data: EditableRowData) => {
      setEditingState((prev) => ({
        ...prev,
        [data.id]: {
          isEditing: true,
          originalData: { ...data },
          currentData: { ...data },
        },
      }))
      onRowEdit?.(data)
    },
    [onRowEdit],
  )

  const handleSave = useCallback(
    async (data: EditableRowData) => {
      if (!onSave) return

      const editState = editingState[data.id]
      if (!editState) return

      setIsProcessing(true)
      try {
        await onSave(editState.currentData, editState.originalData)

        const gridApi = gridRef.current?.api
        if (gridApi) {
          const rowNode = gridApi.getRowNode(String(data.id))
          if (rowNode) {
            rowNode.setData(editState.currentData)
          }
        }

        setEditingState((prev) => {
          const newState = { ...prev }
          delete newState[data.id]
          return newState
        })

        toast({
          title: "Success",
          description: "Row updated successfully",
        })
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to save changes",
          variant: "destructive",
        })
      } finally {
        setIsProcessing(false)
      }
    },
    [editingState, onSave, toast],
  )

  const handleCancel = useCallback(
    (data: EditableRowData) => {
      const editState = editingState[data.id]
      if (!editState) return

      const gridApi = gridRef.current?.api
      if (gridApi) {
        const rowNode = gridApi.getRowNode(String(data.id))
        if (rowNode) {
          rowNode.setData(editState.originalData)
        }
      }

      setEditingState((prev) => {
        const newState = { ...prev }
        delete newState[data.id]
        return newState
      })

      onCancel?.(editState.originalData)
    },
    [editingState, onCancel],
  )

  const handleDelete = useCallback(
    async (data: EditableRowData) => {
      if (!onDelete) return

      setIsProcessing(true)
      try {
        await onDelete(data)
        toast({
          title: "Success",
          description: "Row deleted successfully",
        })
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to delete row",
          variant: "destructive",
        })
      } finally {
        setIsProcessing(false)
      }
    },
    [onDelete, toast],
  )

  const handleCellValueChange = useCallback((rowId: string | number, field: string, newValue: any) => {
    setEditingState((prev) => {
      const editState = prev[rowId]
      if (!editState) return prev

      return {
        ...prev,
        [rowId]: {
          ...editState,
          currentData: {
            ...editState.currentData,
            [field]: newValue,
          },
        },
      }
    })
  }, [])

  const handleSelectionChanged = useCallback(() => {
    const gridApi = gridRef.current?.api
    if (gridApi) {
      const selectedNodes = gridApi.getSelectedNodes()
      const selectedData = selectedNodes.map((node: IRowNode) => node.data)
      setSelectedRows(selectedData)
    }
    onSelectionChanged?.()
  }, [onSelectionChanged])

  const handleGridReady = useCallback(
    (event: GridReadyEvent) => {
      onGridReady?.(event)
    },
    [onGridReady],
  )

  // Bulk operations
  const handleBulkEdit = () => {
    if (selectedRows.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select rows to edit",
        variant: "destructive",
      })
      return
    }
    setShowBulkEditModal(true)
  }

  const handleBulkSave = async (bulkData: BulkEditData) => {
    if (!onBulkSave) return

    setIsProcessing(true)
    try {
      await onBulkSave(bulkData, selectedRows)
      toast({
        title: "Success",
        description: `${selectedRows.length} rows updated successfully`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update rows",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBulkDelete = () => {
    if (selectedRows.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select rows to delete",
        variant: "destructive",
      })
      return
    }
    setShowDeleteModal(true)
  }

  const handleConfirmBulkDelete = async () => {
    if (!onBulkDelete) return

    setIsProcessing(true)
    try {
      await onBulkDelete(selectedRows)
      setShowDeleteModal(false)
      toast({
        title: "Success",
        description: `${selectedRows.length} rows deleted successfully`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete rows",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Export functionality
  const handleExport = async (options: ExportOptions) => {
    const dataToExport = options.selectedRowsOnly ? selectedRows : filteredData
    const columnsToExport = options.selectedColumns || []

    if (onExport) {
      await onExport(options, dataToExport)
    } else {
      // Default export implementation
      exportToCSV(dataToExport, columnsToExport, options)
    }

    toast({
      title: "Export Complete",
      description: `Data exported as ${options.format.toUpperCase()}`,
    })
  }

  const exportToCSV = (data: EditableRowData[], columns: string[], options: ExportOptions) => {
    const headers = options.includeHeaders
      ? columns.map((col) => columnDefs.find((def) => def.field === col)?.headerName || col)
      : []

    const csvContent = [
      ...(options.includeHeaders ? [headers.join(",")] : []),
      ...data.map((row) => columns.map((col) => `"${row[col] || ""}"`).join(",")),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `${options.fileName}.${options.format}`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Column customization
  const handleColumnVisibilityChange = (settings: ColumnVisibilitySettings) => {
    setColumnVisibility(settings)
    localStorage.setItem(STORAGE_KEYS.COLUMN_VISIBILITY, JSON.stringify(settings))
  }

  // Advanced filtering
  const handleApplyFilters = (conditions: FilterCondition[]) => {
    setFilterConditions(conditions)
    localStorage.setItem(STORAGE_KEYS.FILTER_CONDITIONS, JSON.stringify(conditions))
  }

  const handleClearFilters = () => {
    setFilterConditions([])
    localStorage.removeItem(STORAGE_KEYS.FILTER_CONDITIONS)
  }

  const handleRefresh = useCallback(() => {
    setEditingState({})
    const gridApi = gridRef.current?.api
    if (gridApi) {
      gridApi.refreshCells({ force: true })
    }
  }, [])

  const defaultGridOptions = useMemo(
    () => ({
      pagination,
      paginationPageSize,
      paginationPageSizeSelector,
      rowSelection: "multiple" as const,
      suppressRowClickSelection: true,
      animateRows: true,
      enableRangeSelection: true,
      enableCellTextSelection: true,
      suppressMenuHide: true,
      getRowId: (params: any) => params.data.id,
      defaultColDef: {
        sortable: true,
        filter: true,
        resizable: true,
        minWidth: 100,
      },
      ...gridOptions,
    }),
    [gridOptions, pagination, paginationPageSize, paginationPageSizeSelector],
  )

  if (error) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={handleRefresh} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-2">
          {Object.keys(editingState).length > 0 && (
            <div className="text-sm text-muted-foreground">{Object.keys(editingState).length} row(s) being edited</div>
          )}
          {selectedRows.length > 0 && (
            <div className="text-sm text-muted-foreground">{selectedRows.length} row(s) selected</div>
          )}
          {filterConditions.length > 0 && (
            <div className="text-sm text-blue-600">{filterConditions.length} filter(s) active</div>
          )}
        </div>

        <div className="flex items-center space-x-2 flex-wrap">
          {/* Bulk operations */}
          {enableBulkEdit && selectedRows.length > 0 && (
            <>
              <Button onClick={handleBulkEdit} variant="outline" size="sm">
                <Edit className="mr-2 h-4 w-4" />
                Bulk Edit
              </Button>
              <Button onClick={handleBulkDelete} variant="outline" size="sm">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Selected
              </Button>
            </>
          )}

          {/* Export */}
          {enableExport && (
            <Button onClick={() => setShowExportModal(true)} variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          )}

          {/* Column customization */}
          {enableColumnCustomization && (
            <Button onClick={() => setShowColumnModal(true)} variant="outline" size="sm">
              <Settings className="mr-2 h-4 w-4" />
              Columns
            </Button>
          )}

          {/* Advanced filtering */}
          {enableAdvancedFiltering && (
            <>
              <Button onClick={() => setShowFilterModal(true)} variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
              {filterConditions.length > 0 && (
                <Button onClick={handleClearFilters} variant="outline" size="sm">
                  Clear Filters
                </Button>
              )}
            </>
          )}

          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Grid */}
      <div className={`${className} relative`} style={{ height }}>
        {loading && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        )}
        {isProcessing && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
            <div className="bg-white p-4 rounded-lg shadow-lg flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Processing...</span>
            </div>
          </div>
        )}
        <AgGridReact
          ref={gridRef}
          rowData={filteredData}
          columnDefs={enhancedColumnDefs}
          gridOptions={defaultGridOptions}
          onGridReady={handleGridReady}
          onSelectionChanged={handleSelectionChanged}
        />
      </div>

      {/* Modals */}
      <BulkEditModal
        isOpen={showBulkEditModal}
        onClose={() => setShowBulkEditModal(false)}
        onSave={handleBulkSave}
        selectedRows={selectedRows}
        columnDefs={columnDefs}
      />

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmBulkDelete}
        selectedRows={selectedRows}
        isDeleting={isProcessing}
      />

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExport}
        columnDefs={columnDefs}
        hasSelectedRows={selectedRows.length > 0}
      />

      <ColumnCustomizationModal
        isOpen={showColumnModal}
        onClose={() => setShowColumnModal(false)}
        onSave={handleColumnVisibilityChange}
        columnDefs={columnDefs}
        currentSettings={columnVisibility}
      />

      <AdvancedFilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={handleApplyFilters}
        columnDefs={columnDefs}
        currentConditions={filterConditions}
      />
    </div>
  )
}
