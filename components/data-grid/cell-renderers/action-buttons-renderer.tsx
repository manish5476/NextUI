"use client"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Save, X, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { ActionButtonsConfig, EditableRowData } from "../types"

interface ActionButtonsRendererProps {
  data: EditableRowData
  isEditing: boolean
  actionButtons: ActionButtonsConfig
  onEdit: (data: EditableRowData) => void
  onSave: (data: EditableRowData) => void
  onCancel: (data: EditableRowData) => void
  onDelete: (data: EditableRowData) => void
}

export function ActionButtonsRenderer({
  data,
  isEditing,
  actionButtons,
  onEdit,
  onSave,
  onCancel,
  onDelete,
}: ActionButtonsRendererProps) {
  const { showEdit = true, showDelete = true, showSave = true, showCancel = true, customActions = [] } = actionButtons

  if (isEditing) {
    return (
      <div className="flex items-center gap-1 py-1">
        {showSave && (
          <Button size="sm" variant="default" onClick={() => onSave(data)} className="h-7 px-2">
            <Save className="h-3 w-3" />
          </Button>
        )}
        {showCancel && (
          <Button size="sm" variant="outline" onClick={() => onCancel(data)} className="h-7 px-2">
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    )
  }

  const allActions = [
    ...(showEdit
      ? [
          {
            label: "Edit",
            icon: <Edit className="h-3 w-3" />,
            onClick: () => onEdit(data),
            variant: "outline" as const,
          },
        ]
      : []),
    ...(showDelete
      ? [
          {
            label: "Delete",
            icon: <Trash2 className="h-3 w-3" />,
            onClick: () => onDelete(data),
            variant: "destructive" as const,
          },
        ]
      : []),
    ...customActions,
  ]

  if (allActions.length <= 2) {
    return (
      <div className="flex items-center gap-1 py-1">
        {allActions.map((action, index) => (
          <Button
            key={index}
            size="sm"
            variant={action.variant || "outline"}
            onClick={action.onClick}
            className="h-7 px-2"
            title={action.label}
          >
            {action.icon}
          </Button>
        ))}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1 py-1">
      {allActions.slice(0, 1).map((action, index) => (
        <Button
          key={index}
          size="sm"
          variant={action.variant || "outline"}
          onClick={action.onClick}
          className="h-7 px-2"
          title={action.label}
        >
          {action.icon}
        </Button>
      ))}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="outline" className="h-7 px-2 bg-transparent">
            <MoreHorizontal className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {allActions.slice(1).map((action, index) => (
            <DropdownMenuItem key={index} onClick={action.onClick}>
              {action.icon}
              <span className="ml-2">{action.label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
