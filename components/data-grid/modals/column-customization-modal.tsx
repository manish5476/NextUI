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
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Settings } from "lucide-react"
import type { ColDef } from "ag-grid-community"
import type { ColumnVisibilitySettings } from "../enhanced-types"

interface ColumnCustomizationModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (settings: ColumnVisibilitySettings) => void
  columnDefs: ColDef[]
  currentSettings: ColumnVisibilitySettings
}

export function ColumnCustomizationModal({
  isOpen,
  onClose,
  onSave,
  columnDefs,
  currentSettings,
}: ColumnCustomizationModalProps) {
  const [settings, setSettings] = useState<ColumnVisibilitySettings>(currentSettings)

  useEffect(() => {
    setSettings(currentSettings)
  }, [currentSettings, isOpen])

  const availableColumns = columnDefs.filter((col) => col.field !== "actions")

  const handleToggle = (field: string, visible: boolean) => {
    setSettings((prev) => ({
      ...prev,
      [field]: visible,
    }))
  }

  const handleSave = () => {
    onSave(settings)
    onClose()
  }

  const handleReset = () => {
    const defaultSettings: ColumnVisibilitySettings = {}
    availableColumns.forEach((col) => {
      defaultSettings[col.field!] = true
    })
    setSettings(defaultSettings)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Customize Columns
          </DialogTitle>
          <DialogDescription>Select which columns to show or hide in the grid.</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-64 pr-4">
          <div className="space-y-3">
            {availableColumns.map((column) => (
              <div key={column.field} className="flex items-center space-x-2">
                <Checkbox
                  id={column.field}
                  checked={settings[column.field!] !== false}
                  onCheckedChange={(checked) => handleToggle(column.field!, checked as boolean)}
                />
                <Label htmlFor={column.field} className="text-sm font-medium">
                  {column.headerName}
                </Label>
              </div>
            ))}
          </div>
        </ScrollArea>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={handleReset}>
            Reset to Default
          </Button>
          <div className="space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
