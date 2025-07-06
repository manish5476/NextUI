"use client"

import { useState, useCallback, useMemo, useRef } from "react"
import { AgGridReact } from "ag-grid-react"
import type { ColDef, GridReadyEvent } from "ag-grid-community"
import "ag-grid-community/styles/ag-grid.css"
import "ag-grid-community/styles/ag-theme-alpine.css"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ActionButtonsRenderer } from "./cell-renderers/action-buttons-renderer"
import { EditableCellRenderer } from "./cell-renderers/editable-cell-renderer"
import type { EditableAgGridProps, EditableRowData, EditingState } from "./types"

export function EditableAgGrid({
  data,
  loading = false,
  error = null,
  columnDefs,
  actionButtons = {},
  onSave,
  onDelete,
  onCancel,
  onRowEdit,
  gridOptions = {},
  pagination = true,
  paginationPageSize = 20,
  paginationPageSizeSelector = [10, 20, 50, 100],
  height = 400,
  className = "ag-theme-alpine",
  onGridReady,
  onSelectionChanged,
}: EditableAgGridProps) {
  const [editingState, setEditingState] = useState<EditingState>({})
  const [isProcessing, setIsProcessing] = useState(false)
  const gridRef = useRef<AgGridReact>(null)
  const { toast } = useToast()

  // Enhanced column definitions with action buttons and editable cells
  const enhancedColumnDefs = useMemo(() => {
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

    const editableColumns = columnDefs.map((colDef) => {
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

    return [...editableColumns, actionColumn]
  }, [columnDefs, editingState, actionButtons])

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

        // Update the grid data
        const gridApi = gridRef.current?.api
        if (gridApi) {
          const rowNode = gridApi.getRowNode(String(data.id))
          if (rowNode) {
            rowNode.setData(editState.currentData)
          }
        }

        // Exit edit mode
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

      // Revert to original data
      const gridApi = gridRef.current?.api
      if (gridApi) {
        const rowNode = gridApi.getRowNode(String(data.id))
        if (rowNode) {
          rowNode.setData(editState.originalData)
        }
      }

      // Exit edit mode
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

  const handleGridReady = useCallback(
    (event: GridReadyEvent) => {
      onGridReady?.(event)
    },
    [onGridReady],
  )

  const handleRefresh = useCallback(() => {
    // Clear editing state and refresh grid
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
      rowSelection: "multiple",
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
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {Object.keys(editingState).length > 0 && (
            <div className="text-sm text-muted-foreground">{Object.keys(editingState).length} row(s) being edited</div>
          )}
        </div>
        <div className="flex items-center space-x-2">
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
          rowData={data}
          columnDefs={enhancedColumnDefs}
          gridOptions={defaultGridOptions}
          onGridReady={handleGridReady}
          onSelectionChanged={onSelectionChanged}
        />
      </div>
    </div>
  )
}
