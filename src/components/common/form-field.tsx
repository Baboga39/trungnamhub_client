"use client"

import type { ReactNode } from "react"
import { Label } from "../ui/label"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { cn } from "@/lib/utils"

export interface FormFieldProps {
  label: string
  name: string
  type?: "text" | "email" | "password" | "number" | "date" | "textarea" | "select"
  placeholder?: string
  value?: string | number
  onChange?: (value: string) => void
  error?: string
  required?: boolean
  disabled?: boolean
  options?: { label: string; value: string }[]
  rows?: number
  className?: string
  icon?: ReactNode
}

export function FormField({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  options = [],
  rows = 4,
  className,
  icon,
}: FormFieldProps) {
  const renderInput = () => {
    switch (type) {
      case "textarea":
        return (
          <Textarea
            id={name}
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            disabled={disabled}
            rows={rows}
            className={cn(
              "rounded-xl border-slate-200 focus:border-[#60A5FA] focus:ring-[#60A5FA] resize-none",
              error && "border-red-500 focus:border-red-500 focus:ring-red-500",
            )}
          />
        )

      case "select":
        return (
          <Select value={value?.toString()} onValueChange={onChange} disabled={disabled}>
            <SelectTrigger
              className={cn(
                "rounded-xl border-slate-200 focus:border-[#60A5FA] focus:ring-[#60A5FA] h-11",
                error && "border-red-500 focus:border-red-500 focus:ring-red-500",
              )}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      default:
        return (
          <div className="relative">
            {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>}
            <Input
              id={name}
              name={name}
              type={type}
              placeholder={placeholder}
              value={value}
              onChange={(e) => onChange?.(e.target.value)}
              disabled={disabled}
              className={cn(
                "rounded-xl border-slate-200 focus:border-[#60A5FA] focus:ring-[#60A5FA] h-11",
                icon && "pl-10",
                error && "border-red-500 focus:border-red-500 focus:ring-red-500",
              )}
            />
          </div>
        )
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={name} className="text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {renderInput()}
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  )
}
