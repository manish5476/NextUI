"use client"

import { useState, useEffect } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { ColDef } from "ag-grid-community"
import type { EditableRowData, BulkEditData } from "../enhanced-types"

interface BulkEditModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (bulkData: BulkEditData) => void
  selectedRows: EditableRowData[]
  columnDefs: ColDef[]
}

export function BulkEditModal({ isOpen, onClose, onSave, selectedRows, columnDefs }: BulkEditModalProps) {
  const [bulkData, setBulkData] = useState<BulkEditData>({})
  const [selectedFields, setSelectedFields] = useState<Set<string>>(new Set())

  const editableColumns = columnDefs.filter((col) => col.editable && col.field !== "actions")

  useEffect(() => {
    if (isOpen) {
      setBulkData({})
      setSelectedFields(new Set())
    }
  }, [isOpen])

  const handleFieldToggle = (field: string, checked: boolean) => {
    const newSelectedFields = new Set(selectedFields)
    if (checked) {
      newSelectedFields.add(field)
    } else {
      newSelectedFields.delete(field)
      const newBulkData = { ...bulkData }
      delete newBulkData[field]
      setBulkData(newBulkData)
    }
    setSelectedFields(newSelectedFields)
  }

  const handleValueChange = (field: string, value: any) => {
    setBulkData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSave = () => {
    const filteredData: BulkEditData = {}
    selectedFields.forEach((field) => {
      if (bulkData[field] !== undefined) {
        filteredData[field] = bulkData[field]
      }
    })
    onSave(filteredData)
    onClose()
  }

  const renderInput = (column: ColDef) => {
    const field = column.field!
    const cellEditorParams = column.cellEditorParams || {}
    const type = cellEditorParams.type || "text"

    if (!selectedFields.has(field)) {
      return null
    }

    switch (type) {
      case "textarea":
        return (
          <Textarea
            value={bulkData[field] || ""}
            onChange={(e) => handleValueChange(field, e.target.value)}
            placeholder={`Enter ${column.headerName}`}
          />
        )

      case "select":
        const options = cellEditorParams.options || []
        return (
          <Select value={bulkData[field] || ""} onValueChange={(value) => handleValueChange(field, value)}>
            <SelectTrigger>
              <SelectValue placeholder={`Select ${column.headerName}`} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option: any) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case "number":
        return (
          <Input
            type="number"
            value={bulkData[field] || ""}
            onChange={(e) => handleValueChange(field, Number.parseFloat(e.target.value) || 0)}
            placeholder={`Enter ${column.headerName}`}
          />
        )

      case "email":
        return (
          <Input
            type="email"
            value={bulkData[field] || ""}
            onChange={(e) => handleValueChange(field, e.target.value)}
            placeholder={`Enter ${column.headerName}`}
          />
        )

      default:
        return (
          <Input
            type="text"
            value={bulkData[field] || ""}
            onChange={(e) => handleValueChange(field, e.target.value)}
            placeholder={`Enter ${column.headerName}`}
          />
        )
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Bulk Edit ({selectedRows.length} rows)</DialogTitle>
          <DialogDescription>
            Select the fields you want to update and enter the new values. Changes will be applied to all selected rows.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[50vh] pr-4">
          <div className="space-y-4">
            {editableColumns.map((column) => (
              <div key={column.field} className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={column.field}
                    checked={selectedFields.has(column.field!)}
                    onCheckedChange={(checked) => handleFieldToggle(column.field!, checked as boolean)}
                  />
                  <Label htmlFor={column.field} className="text-sm font-medium">
                    {column.headerName}
                  </Label>
                </div>
                {renderInput(column)}
              </div>
            ))}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={selectedFields.size === 0}>
            Apply Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
