"use client"

import { useMemo } from "react"
import { AgGridReact } from "ag-grid-react"
import type { ColDef, GridReadyEvent, GridOptions } from "ag-grid-community"
import "ag-grid-community/styles/ag-grid.css"
import "ag-grid-community/styles/ag-theme-alpine.css"

interface AgGridWrapperProps {
  rowData: any[]
  columnDefs: ColDef[]
  loading?: boolean
  onGridReady?: (event: GridReadyEvent) => void
  onSelectionChanged?: () => void
  gridOptions?: GridOptions
  className?: string
}

export function AgGridWrapper({
  rowData,
  columnDefs,
  loading = false,
  onGridReady,
  onSelectionChanged,
  gridOptions,
  className = "ag-theme-alpine",
}: AgGridWrapperProps) {
  const defaultGridOptions: GridOptions = useMemo(
    () => ({
      pagination: true,
      paginationPageSize: 20,
      rowSelection: "multiple",
      suppressRowClickSelection: true,
      animateRows: true,
      enableRangeSelection: true,
      enableCellTextSelection: true,
      suppressMenuHide: true,
      defaultColDef: {
        sortable: true,
        filter: true,
        resizable: true,
        minWidth: 100,
      },
      ...gridOptions,
    }),
    [gridOptions],
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className={`${className} h-96 w-full`}>
      <AgGridReact
        rowData={rowData}
        columnDefs={columnDefs}
        gridOptions={defaultGridOptions}
        onGridReady={onGridReady}
        onSelectionChanged={onSelectionChanged}
      />
    </div>
  )
}
