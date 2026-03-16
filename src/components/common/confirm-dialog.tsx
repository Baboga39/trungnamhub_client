'use client'

import { AlertCircle, Trash2, CheckCircle2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  message?: string
  icon?: 'trash' | 'warning' | 'success'
  iconColor?: 'red' | 'yellow' | 'blue' | 'green'
  cancelText?: string
  confirmText?: string
  isLoading?: boolean
  isDangerous?: boolean
  onConfirm: () => void | Promise<void>
  onCancel?: () => void
  children?: React.ReactNode
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  message,
  icon = 'warning',
  iconColor = 'red',
  cancelText = 'Hủy',
  confirmText = 'Xác nhận',
  isLoading = false,
  isDangerous = false,
  onConfirm,
  onCancel,
  children,
}: ConfirmDialogProps) {
  const handleConfirm = async () => {
    try {
      await onConfirm()
      onOpenChange(false)
    } catch (error) {
      console.error('[v0] Error in confirm dialog:', error)
    }
  }

  const handleCancel = () => {
    onCancel?.()
    onOpenChange(false)
  }

  const iconBackgroundMap = {
    red: 'bg-gradient-to-br from-red-50 to-red-100',
    yellow: 'bg-gradient-to-br from-yellow-50 to-yellow-100',
    blue: 'bg-gradient-to-br from-blue-50 to-blue-100',
    green: 'bg-gradient-to-br from-green-50 to-green-100',
  }

  const iconColorClassMap = {
    red: 'text-red-600',
    yellow: 'text-yellow-600',
    blue: 'text-blue-600',
    green: 'text-green-600',
  }

  const confirmButtonMap = {
    red: isDangerous
      ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg hover:shadow-xl'
      : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl',
    yellow: 'bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 shadow-lg hover:shadow-xl',
    blue: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl',
    green: 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl',
  }

  const getIcon = () => {
    switch (icon) {
      case 'trash':
        return <Trash2 className="w-8 h-8" />
      case 'warning':
        return <AlertCircle className="w-8 h-8" />
      case 'success':
        return <CheckCircle2 className="w-8 h-8" />
      default:
        return <AlertCircle className="w-8 h-8" />
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white rounded-2xl shadow-2xl border-0 overflow-hidden">
        {/* Top accent bar */}
        <div className={cn(
          'absolute top-0 left-0 right-0 h-1 bg-gradient-to-r',
          iconColor === 'red' ? 'from-red-500 to-red-600' :
          iconColor === 'yellow' ? 'from-yellow-500 to-yellow-600' :
          iconColor === 'blue' ? 'from-blue-500 to-blue-600' :
          'from-green-500 to-green-600'
        )} />

        <div className="pt-8 px-6 pb-6 space-y-6">
          {/* Icon section */}
          <div className="flex justify-center">
            <div className={cn(
              'inline-flex items-center justify-center w-16 h-16 rounded-full transition-transform duration-300 hover:scale-110',
              iconBackgroundMap[iconColor]
            )}>
              <div className={iconColorClassMap[iconColor]}>
                {getIcon()}
              </div>
            </div>
          </div>

          {/* Content section */}
          <div className="text-center space-y-3">
            <h2 className="text-2xl font-bold text-slate-900 leading-tight">
              {title}
            </h2>
            {description && (
              <p className="text-base text-slate-600 leading-relaxed">
                {description}
              </p>
            )}
            {message && (
              <div className={cn(
                'mt-4 p-4 rounded-xl border-l-4',
                iconColor === 'red' ? 'bg-red-50 border-red-300 text-red-800' :
                iconColor === 'yellow' ? 'bg-yellow-50 border-yellow-300 text-yellow-800' :
                iconColor === 'blue' ? 'bg-blue-50 border-blue-300 text-blue-800' :
                'bg-green-50 border-green-300 text-green-800',
                'text-sm font-medium'
              )}>
                {message}
              </div>
            )}
          </div>

          {children}

          {/* Button section */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="flex-1 px-4 py-3 rounded-lg border-2 border-slate-200 text-slate-900 font-semibold hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className={cn(
                'flex-1 px-4 py-3 rounded-lg font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed',
                confirmButtonMap[iconColor]
              )}
            >
              {isLoading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {isLoading ? 'Đang xử lý...' : confirmText}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
