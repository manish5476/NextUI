"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Download } from "lucide-react"
import type { ColDef } from "ag-grid-community"
import type { ExportOptions } from "../enhanced-types"

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
  onExport: (options: ExportOptions) => void
  columnDefs: ColDef[]
  hasSelectedRows: boolean
}

export function ExportModal({ isOpen, onClose, onExport, columnDefs, hasSelectedRows }: ExportModalProps) {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: "csv",
    fileName: "export",
    selectedColumns: columnDefs.filter((col) => col.field !== "actions").map((col) => col.field!),
    includeHeaders: true,
    selectedRowsOnly: false,
  })

  const availableColumns = columnDefs.filter((col) => col.field !== "actions")

  const handleColumnToggle = (field: string, checked: boolean) => {
    setExportOptions((prev) => ({
      ...prev,
      selectedColumns: checked
        ? [...(prev.selectedColumns || []), field]
        : (prev.selectedColumns || []).filter((col) => col !== field),
    }))
  }

  const handleExport = () => {
    onExport(exportOptions)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Data
          </DialogTitle>
          <DialogDescription>Configure your export settings and download the data.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="format">Format</Label>
            <Select
              value={exportOptions.format}
              onValueChange={(value: "csv" | "excel") => setExportOptions((prev) => ({ ...prev, format: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fileName">File Name</Label>
            <Input
              id="fileName"
              value={exportOptions.fileName}
              onChange={(e) => setExportOptions((prev) => ({ ...prev, fileName: e.target.value }))}
              placeholder="Enter file name"
            />
          </div>

          <div className="space-y-2">
            <Label>Columns to Export</Label>
            <ScrollArea className="h-32 border rounded-md p-2">
              <div className="space-y-2">
                {availableColumns.map((column) => (
                  <div key={column.field} className="flex items-center space-x-2">
                    <Checkbox
                      id={column.field}
                      checked={exportOptions.selectedColumns?.includes(column.field!) || false}
                      onCheckedChange={(checked) => handleColumnToggle(column.field!, checked as boolean)}
                    />
                    <Label htmlFor={column.field} className="text-sm">
                      {column.headerName}
                    </Label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeHeaders"
                checked={exportOptions.includeHeaders}
                onCheckedChange={(checked) =>
                  setExportOptions((prev) => ({ ...prev, includeHeaders: checked as boolean }))
                }
              />
              <Label htmlFor="includeHeaders" className="text-sm">
                Include Headers
              </Label>
            </div>

            {hasSelectedRows && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="selectedRowsOnly"
                  checked={exportOptions.selectedRowsOnly}
                  onCheckedChange={(checked) =>
                    setExportOptions((prev) => ({ ...prev, selectedRowsOnly: checked as boolean }))
                  }
                />
                <Label htmlFor="selectedRowsOnly" className="text-sm">
                  Export Selected Rows Only
                </Label>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleExport}>Export</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
