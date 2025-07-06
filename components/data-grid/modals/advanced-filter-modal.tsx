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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, Trash2, Filter } from "lucide-react"
import type { ColDef } from "ag-grid-community"
import type { FilterCondition } from "../enhanced-types"

interface AdvancedFilterModalProps {
  isOpen: boolean
  onClose: () => void
  onApply: (conditions: FilterCondition[]) => void
  columnDefs: ColDef[]
  currentConditions: FilterCondition[]
}

const OPERATORS = [
  { value: "equals", label: "Equals" },
  { value: "notEquals", label: "Not Equals" },
  { value: "contains", label: "Contains" },
  { value: "startsWith", label: "Starts With" },
  { value: "endsWith", label: "Ends With" },
  { value: "greaterThan", label: "Greater Than" },
  { value: "lessThan", label: "Less Than" },
  { value: "greaterThanOrEqual", label: "Greater Than or Equal" },
  { value: "lessThanOrEqual", label: "Less Than or Equal" },
]

export function AdvancedFilterModal({
  isOpen,
  onClose,
  onApply,
  columnDefs,
  currentConditions,
}: AdvancedFilterModalProps) {
  const [conditions, setConditions] = useState<FilterCondition[]>(
    currentConditions.length > 0 ? currentConditions : [{ field: "", operator: "equals", value: "" }],
  )

  const availableColumns = columnDefs.filter((col) => col.field !== "actions")

  const addCondition = () => {
    setConditions([...conditions, { field: "", operator: "equals", value: "", logicalOperator: "AND" }])
  }

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index))
  }

  const updateCondition = (index: number, updates: Partial<FilterCondition>) => {
    setConditions(conditions.map((condition, i) => (i === index ? { ...condition, ...updates } : condition)))
  }

  const handleApply = () => {
    const validConditions = conditions.filter((condition) => condition.field && condition.value !== "")
    onApply(validConditions)
    onClose()
  }

  const handleClear = () => {
    setConditions([{ field: "", operator: "equals", value: "" }])
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Advanced Filters
          </DialogTitle>
          <DialogDescription>Create complex filter conditions to refine your data view.</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[50vh] pr-4">
          <div className="space-y-4">
            {conditions.map((condition, index) => (
              <div key={index} className="space-y-3 p-4 border rounded-lg">
                {index > 0 && (
                  <div className="flex items-center gap-2">
                    <Select
                      value={condition.logicalOperator || "AND"}
                      onValueChange={(value: "AND" | "OR") => updateCondition(index, { logicalOperator: value })}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AND">AND</SelectItem>
                        <SelectItem value="OR">OR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-3">
                    <Select value={condition.field} onValueChange={(value) => updateCondition(index, { field: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select field" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableColumns.map((column) => (
                          <SelectItem key={column.field} value={column.field!}>
                            {column.headerName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-3">
                    <Select
                      value={condition.operator}
                      onValueChange={(value: any) => updateCondition(index, { operator: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {OPERATORS.map((operator) => (
                          <SelectItem key={operator.value} value={operator.value}>
                            {operator.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-5">
                    <Input
                      value={condition.value}
                      onChange={(e) => updateCondition(index, { value: e.target.value })}
                      placeholder="Enter value"
                    />
                  </div>

                  <div className="col-span-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeCondition(index)}
                      disabled={conditions.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex justify-between">
          <Button variant="outline" onClick={addCondition}>
            <Plus className="mr-2 h-4 w-4" />
            Add Condition
          </Button>
          <Button variant="outline" onClick={handleClear}>
            Clear All
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleApply}>Apply Filters</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
