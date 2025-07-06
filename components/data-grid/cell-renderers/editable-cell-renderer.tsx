"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface EditableCellRendererProps {
  value: any
  data: any
  colDef: any
  isEditing: boolean
  onValueChange: (newValue: any) => void
  cellType?: "text" | "number" | "email" | "textarea" | "select"
  selectOptions?: Array<{ value: string; label: string }>
}

export function EditableCellRenderer({
  value,
  data,
  colDef,
  isEditing,
  onValueChange,
  cellType = "text",
  selectOptions = [],
}: EditableCellRendererProps) {
  const [localValue, setLocalValue] = useState(value)

  useEffect(() => {
    setLocalValue(value)
  }, [value, isEditing])

  const handleChange = (newValue: any) => {
    setLocalValue(newValue)
    onValueChange(newValue)
  }

  if (!isEditing) {
    // Display mode
    if (cellType === "select" && selectOptions.length > 0) {
      const option = selectOptions.find((opt) => opt.value === value)
      return <span className="px-2 py-1">{option?.label || value}</span>
    }
    return <span className="px-2 py-1">{value}</span>
  }

  // Edit mode
  const baseClassName = "h-8 text-sm border-blue-500 focus:border-blue-600 bg-blue-50"

  switch (cellType) {
    case "textarea":
      return (
        <Textarea
          value={localValue || ""}
          onChange={(e) => handleChange(e.target.value)}
          className={`${baseClassName} min-h-[60px] resize-none`}
          autoFocus
        />
      )

    case "select":
      return (
        <Select value={localValue || ""} onValueChange={handleChange}>
          <SelectTrigger className={baseClassName}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {selectOptions.map((option) => (
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
          value={localValue || ""}
          onChange={(e) => handleChange(Number.parseFloat(e.target.value) || 0)}
          className={baseClassName}
          autoFocus
        />
      )

    case "email":
      return (
        <Input
          type="email"
          value={localValue || ""}
          onChange={(e) => handleChange(e.target.value)}
          className={baseClassName}
          autoFocus
        />
      )

    default:
      return (
        <Input
          type="text"
          value={localValue || ""}
          onChange={(e) => handleChange(e.target.value)}
          className={baseClassName}
          autoFocus
        />
      )
  }
}
