"use client"

import type { ReactNode, FormEvent } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Loader2 } from "lucide-react"

interface FormProps {
  title?: string
  description?: string
  children: ReactNode
  onSubmit: (e: FormEvent) => void
  submitText?: string
  cancelText?: string
  onCancel?: () => void
  isLoading?: boolean
  className?: string
}

export function Form({
  title,
  description,
  children,
  onSubmit,
  submitText = "Lưu",
  cancelText = "Hủy",
  onCancel,
  isLoading = false,
  className,
}: FormProps) {
  return (
    <Card className="border-0 shadow-lg bg-white rounded-3xl overflow-hidden">
      {(title || description) && (
        <CardHeader className="pb-5 pt-6 px-6 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100">
          {title && <CardTitle className="text-2xl font-bold text-slate-800">{title}</CardTitle>}
          {description && <CardDescription className="text-slate-500 mt-1">{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent className="p-6">
        <form onSubmit={onSubmit} className={className}>
          <div className="space-y-5">{children}</div>

          <div className="flex items-center gap-3 mt-6 pt-6 border-t border-slate-100">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
                className="rounded-xl border-slate-200 hover:bg-slate-50 bg-transparent"
              >
                {cancelText}
              </Button>
            )}
            <Button
              type="submit"
              disabled={isLoading}
              className="rounded-xl bg-gradient-to-r from-[#60A5FA] to-[#93C5FD] hover:from-[#3B82F6] hover:to-[#60A5FA] text-white shadow-md hover:shadow-lg transition-all"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {submitText}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
