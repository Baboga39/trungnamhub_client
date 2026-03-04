"use client";

import type React from "react";
import { useState, useEffect, useCallback, useRef } from "react";
import { parse } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Switch } from "../ui/switch";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  CalendarIcon,
  Loader2,
  Save,
  User,
  Mail,
  Phone,
  Hash,
  FileText,
  CheckCircle2,
  AlertCircle,
  Upload,
  Eye,
  EyeOff,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "../../libs/utils";

export type FieldType =
  | "text"
  | "email"
  | "number"
  | "textarea"
  | "select"
  | "date"
  | "switch"
  | "phone"
  | "file";

export interface FormField {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: { value: string; label: string }[]; // For select fields
  validation?: (value: any) => string | null; // Custom validation
  defaultValue?: any;
  description?: string;
  gridColumn?: string; // For responsive grid layout (e.g., "span 2")
  dependsOn?: { field: string; value: any }; // Show field only if another field has specific value
  accept?: string; // For file input (e.g., "image/*")
}

export interface CommonFormProps<T = any> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  fields: FormField[];
  initialData?: T | null;
  onSubmit: (data: T) => Promise<void>;
  submitButtonText?: string;
  cancelButtonText?: string;
  isLoading?: boolean;
  mode?: "create" | "edit";
}

export function CommonForm<T extends Record<string, any>>({
  open,
  onOpenChange,
  title,
  description,
  fields,
  initialData,
  onSubmit,
  submitButtonText = "Lưu",
  cancelButtonText = "Hủy",
  isLoading = false,
  mode = "create",
}: CommonFormProps<T>) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [isDragging, setIsDragging] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const validationTimers = useRef<Record<string, NodeJS.Timeout>>({});

  // Initialize form data when dialog opens or initialData changes
  useEffect(() => {
    if (open) {
      const initialFormData: Record<string, any> = {};
      fields.forEach((field) => {
        if (initialData && initialData[field.name] !== undefined) {
          initialFormData[field.name] = initialData[field.name];
        } else if (field.defaultValue !== undefined) {
          initialFormData[field.name] = field.defaultValue;
        } else {
          initialFormData[field.name] = field.type === "switch" ? false : "";
        }
      });
      setFormData(initialFormData);
      setErrors({});
      setSubmitStatus("idle");
    }
  }, [open, initialData, fields]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;

      // Ctrl+S or Cmd+S to save
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        formRef.current?.requestSubmit();
      }

      // Esc to close
      if (e.key === "Escape") {
        onOpenChange(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  const validateField = (field: FormField, value: any): string | null => {
    if (field.required && !value && value !== 0 && value !== false) {
      return `${field.label} là bắt buộc`;
    }

    if (field.validation) {
      return field.validation(value);
    }

    if (field.type === "email" && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return "Email không hợp lệ";
      }
    }

    if (field.type === "phone" && value) {
      const phoneRegex = /^[0-9]{10,11}$/;
      if (!phoneRegex.test(value.replace(/\s/g, ""))) {
        return "Số điện thoại không hợp lệ";
      }
    }

    return null;
  };

  const handleChange = useCallback(
    (fieldName: string, value: any) => {
      setFormData((prev) => ({ ...prev, [fieldName]: value }));

      // Clear error when user starts typing
      if (errors[fieldName]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[fieldName];
          return newErrors;
        });
      }

      // Debounced validation (300ms delay)
      if (validationTimers.current[fieldName]) {
        clearTimeout(validationTimers.current[fieldName]);
      }

      validationTimers.current[fieldName] = setTimeout(() => {
        const field = fields.find((f) => f.name === fieldName);
        if (field) {
          const error = validateField(field, value);
          if (error) {
            setErrors((prev) => ({ ...prev, [fieldName]: error }));
          }
        }
      }, 300);
    },
    [errors, fields],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const newErrors: Record<string, string> = {};
    fields.forEach((field) => {
      // Skip validation for hidden fields (field dependencies)
      if (field.dependsOn) {
        const dependentValue = formData[field.dependsOn.field];
        if (dependentValue !== field.dependsOn.value) {
          return;
        }
      }

      const error = validateField(field, formData[field.name]);
      if (error) {
        newErrors[field.name] = error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSubmitStatus("error");
      setTimeout(() => setSubmitStatus("idle"), 600);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData as T);
      setSubmitStatus("success");
      setTimeout(() => {
        setSubmitStatus("idle");
      }, 800);
    } catch (error) {
      console.error("Form submission error:", error);
      setSubmitStatus("error");
      setTimeout(() => setSubmitStatus("idle"), 600);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldIcon = (type: FieldType) => {
    switch (type) {
      case "email":
        return <Mail className="h-4 w-4 text-muted-foreground/60" />;
      case "phone":
        return <Phone className="h-4 w-4 text-muted-foreground/60" />;
      case "number":
        return <Hash className="h-4 w-4 text-muted-foreground/60" />;
      case "textarea":
        return <FileText className="h-4 w-4 text-muted-foreground/60" />;
      case "file":
        return <Upload className="h-4 w-4 text-muted-foreground/60" />;
      case "text":
      default:
        return <User className="h-4 w-4 text-muted-foreground/60" />;
    }
  };

  const handleFileChange = (fieldName: string, files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0];
      handleChange(fieldName, file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent, fieldName: string) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileChange(fieldName, e.dataTransfer.files);
  };

  const renderField = (field: FormField) => {
    const value = formData[field.name];
    const error = errors[field.name];
    const hasValue = value != null && value !== "";

    if (field.dependsOn) {
      const dependentValue = formData[field.dependsOn.field];
      if (dependentValue !== field.dependsOn.value) {
        return null;
      }
    }

    switch (field.type) {
      case "text":
      case "email":
      case "phone":
        return (
          <div className="relative group">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10">
              {getFieldIcon(field.type)}
            </div>
            <Input
              type={field.type === "email" ? "email" : "text"}
              value={value || ""}
              onChange={(e) => handleChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              disabled={field.disabled}
              className={cn(
                "h-11 pl-10 pr-10 rounded-lg border transition-all duration-200",
                "bg-white text-foreground placeholder:text-muted-foreground/50",
                "focus:border-primary focus:ring-2 focus:ring-primary/20",
                "hover:border-muted-foreground/40",
                error &&
                  "border-destructive focus:border-destructive focus:ring-destructive/20",
              )}
            />
            {hasValue && !error && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 animate-in fade-in zoom-in duration-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </div>
            )}
            {error && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 animate-in fade-in zoom-in duration-200">
                <AlertCircle className="h-4 w-4 text-destructive" />
              </div>
            )}
          </div>
        );

      case "password": {
        const [showPassword, setShowPassword] = useState(false);
        const isPassword = field.type === "password";

        return (
          <div className="relative group">
            {/* Icon bên trái */}
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10">
              {getFieldIcon(field.type)}
            </div>

            {/* Input */}
            <Input
              type={
                isPassword
                  ? showPassword
                    ? "text"
                    : "password"
                  : field.type === "email"
                    ? "email"
                    : "text"
              }
              value={value || ""}
              onChange={(e) => handleChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              disabled={field.disabled}
              className={cn(
                "h-11 pl-10 pr-10 rounded-lg border transition-all duration-200",
                "bg-white text-foreground placeholder:text-muted-foreground/50",
                "focus:border-primary focus:ring-2 focus:ring-primary/20",
                "hover:border-muted-foreground/40",
                error &&
                  "border-destructive focus:border-destructive focus:ring-destructive/20",
              )}
            />

            {/* Biểu tượng con mắt (chỉ cho password) */}
            {isPassword && (
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 hover:text-primary transition"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            )}

            {/* Icon trạng thái */}
            {!isPassword && hasValue && !error && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 animate-in fade-in zoom-in duration-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </div>
            )}
            {error && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 animate-in fade-in zoom-in duration-200">
                <AlertCircle className="h-4 w-4 text-destructive" />
              </div>
            )}
          </div>
        );
      }
      case "number":
        return (
          <div className="relative group">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10">
              <Hash className="h-4 w-4 text-muted-foreground/60" />
            </div>
            <Input
              type="number"
              value={value ?? ""}
              onChange={(e) =>
                handleChange(
                  field.name,
                  e.target.value ? Number(e.target.value) : "",
                )
              }
              placeholder={field.placeholder}
              disabled={field.disabled}
              className={cn(
                "h-11 pl-10 pr-10 rounded-lg border transition-all duration-200",
                "bg-white text-foreground placeholder:text-muted-foreground/50",
                "focus:border-primary focus:ring-2 focus:ring-primary/20",
                "hover:border-muted-foreground/40",
                error &&
                  "border-destructive focus:border-destructive focus:ring-destructive/20",
              )}
            />
            {hasValue && !error && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 animate-in fade-in zoom-in duration-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </div>
            )}
          </div>
        );

      case "textarea":
        return (
          <div className="relative group">
            <div className="absolute left-3.5 top-3 z-10">
              <FileText className="h-4 w-4 text-muted-foreground/60" />
            </div>
            <Textarea
              value={value || ""}
              onChange={(e) => handleChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              disabled={field.disabled}
              rows={4}
              className={cn(
                "pl-10 pr-10 pt-3 rounded-lg border transition-all duration-200 resize-none",
                "bg-white text-foreground placeholder:text-muted-foreground/50",
                "focus:border-primary focus:ring-2 focus:ring-primary/20",
                "hover:border-muted-foreground/40",
                error &&
                  "border-destructive focus:border-destructive focus:ring-destructive/20",
              )}
            />
            {hasValue && !error && (
              <div className="absolute right-3 top-3 animate-in fade-in zoom-in duration-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </div>
            )}
          </div>
        );

      case "select":
        return (
          <Select
            value={value || ""}
            onValueChange={(val) => handleChange(field.name, val)}
            disabled={field.disabled}
          >
            <SelectTrigger
              className={cn(
                "h-11 rounded-lg border transition-all duration-200",
                "bg-white text-foreground",
                "focus:border-primary focus:ring-2 focus:ring-primary/20",
                "hover:border-muted-foreground/40",
                error &&
                  "border-destructive focus:border-destructive focus:ring-destructive/20",
              )}
            >
              <SelectValue placeholder={field.placeholder || "Chọn..."} />
            </SelectTrigger>
            <SelectContent className="rounded-lg">
              {field.options?.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="rounded-md"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "date":
        let dateObj: Date | null = null;
        if (value) {
          // Thử parse dd/MM/yyyy (backend trả về string này)
          const parsed = parse(value, "dd/MM/yyyy", new Date());
          if (!isNaN(parsed.getTime())) {
            dateObj = parsed;
          } else {
            // fallback nếu value là ISO string
            const d = new Date(value);
            if (!isNaN(d.getTime())) {
              dateObj = d;
            }
          }
        }

        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                disabled={field.disabled}
                className={cn(
                  "w-full h-11 rounded-lg border justify-start text-left font-normal transition-all duration-200",
                  !dateObj && "text-muted-foreground/50",
                  error && "border-destructive",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground/60" />
                {dateObj
                  ? format(dateObj, "dd/MM/yyyy", { locale: vi })
                  : field.placeholder || "Chọn ngày"}
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-auto p-0 rounded-lg" align="start">
              <Calendar
                mode="single"
                selected={dateObj || undefined}
                onSelect={(date) => {
                  if (date) {
                    // luôn lưu dd/MM/yyyy vào formData
                    handleChange(field.name, format(date, "dd/MM/yyyy"));
                  }
                }}
                captionLayout="dropdown"
                fromYear={1950}
                toYear={new Date().getFullYear()}
                defaultMonth={value || new Date(2000, 0)}
                initialFocus
                locale={vi}
              />
            </PopoverContent>
          </Popover>
        );

      case "switch":
        return (
          <div className="flex items-center justify-between h-11 px-4 rounded-lg border border-border bg-white transition-all duration-200 hover:border-muted-foreground/40">
            <span className="text-sm font-medium text-foreground">
              {value ? "Đang bật" : "Đang tắt"}
            </span>
            <Switch
              checked={value || false}
              onCheckedChange={(checked) => handleChange(field.name, checked)}
              disabled={field.disabled}
            />
          </div>
        );

      case "file":
        return (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, field.name)}
            className={cn(
              "relative border-2 border-dashed rounded-lg transition-all duration-200",
              "hover:border-primary/50 hover:bg-muted/30",
              isDragging && "border-primary bg-primary/5",
              error && "border-destructive",
            )}
          >
            <input
              type="file"
              id={field.name}
              accept={field.accept}
              onChange={(e) => handleFileChange(field.name, e.target.files)}
              disabled={field.disabled}
              className="sr-only"
            />
            <label
              htmlFor={field.name}
              className="flex flex-col items-center justify-center px-6 py-8 cursor-pointer"
            >
              <Upload className="h-8 w-8 text-muted-foreground/60 mb-3" />
              {value ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">
                    {value.name}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      handleChange(field.name, null);
                    }}
                    className="p-1 hover:bg-muted rounded-full transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-sm text-foreground mb-1">
                    <span className="font-semibold">Click để chọn</span> hoặc
                    kéo thả file
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {field.accept || "Tất cả file"}
                  </p>
                </>
              )}
            </label>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl border shadow-lg p-0",
          "animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 duration-300",
          submitStatus === "error" && "animate-shake",
        )}
      >
        <div className="overflow-y-auto max-h-[90vh] p-8">
          <DialogHeader className="space-y-2 mb-8">
            <DialogTitle className="text-2xl font-semibold text-primary tracking-tight">
              {title}
            </DialogTitle>
            {description && (
              <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
                {description}
              </DialogDescription>
            )}
            <p className="text-xs text-muted-foreground/70 pt-2">
              Nhấn{" "}
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">
                Ctrl+S
              </kbd>{" "}
              để lưu,{" "}
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">
                Esc
              </kbd>{" "}
              để đóng
            </p>
          </DialogHeader>

          <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {fields.map((field) => {
                // Skip rendering if field has dependencies that aren't met
                if (field.dependsOn) {
                  const dependentValue = formData[field.dependsOn.field];
                  if (dependentValue !== field.dependsOn.value) {
                    return null;
                  }
                }

                return (
                  <div
                    key={field.name}
                    className={cn(
                      "space-y-2 animate-in fade-in-0 slide-in-from-bottom-2 duration-300",
                      field.gridColumn && `md:col-${field.gridColumn}`,
                    )}
                    style={
                      field.gridColumn
                        ? { gridColumn: field.gridColumn }
                        : undefined
                    }
                  >
                    <Label
                      htmlFor={field.name}
                      className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5"
                    >
                      {field.label}
                      {field.required && (
                        <span className="text-destructive">*</span>
                      )}
                    </Label>
                    {renderField(field)}
                    {field.description && (
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {field.description}
                      </p>
                    )}
                    {errors[field.name] && (
                      <p className="text-xs text-destructive font-medium flex items-center gap-1.5 bg-destructive/5 px-2.5 py-1.5 rounded-md animate-in fade-in-0 slide-in-from-top-1 duration-200">
                        <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                        {errors[field.name]}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-3 pt-6 mt-8 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="h-10 px-6 rounded-lg border hover:bg-muted/50 transition-all duration-200 font-medium"
              >
                {cancelButtonText}
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || isLoading}
                className={cn(
                  "h-10 px-6 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow transition-all duration-200 font-medium",
                )}
              >
                {isSubmitting || isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {submitButtonText}
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
