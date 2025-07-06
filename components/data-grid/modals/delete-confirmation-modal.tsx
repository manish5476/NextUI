"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"
import type { EditableRowData } from "../enhanced-types"

interface DeleteConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  selectedRows: EditableRowData[]
  isDeleting?: boolean
}

export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  selectedRows,
  isDeleting = false,
}: DeleteConfirmationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Confirm Deletion
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {selectedRows.length} row{selectedRows.length > 1 ? "s" : ""}? This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-gray-50 rounded-lg p-3 max-h-32 overflow-y-auto">
            <div className="text-sm text-gray-600">
              <strong>Rows to be deleted:</strong>
            </div>
            <ul className="mt-2 space-y-1">
              {selectedRows.slice(0, 5).map((row, index) => (
                <li key={row.id} className="text-sm">
                  • {row.name || row.title || `Row ${row.id}`}
                </li>
              ))}
              {selectedRows.length > 5 && (
                <li className="text-sm text-gray-500">... and {selectedRows.length - 5} more</li>
              )}
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
