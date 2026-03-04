"use client";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom"

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  url?: string;
  bgColor: string;
  onClick?: () => void;
}

interface QuickActionsProps {
  title: string;
  actions: QuickAction[];
}
export function QuickActions({ title, actions }: QuickActionsProps) {
  const navigate = useNavigate()

  return (
    <div className="rounded-2xl bg-card p-6 shadow-sm border border-border/50">
      <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => {
              if (action.onClick) action.onClick()
              else if (action.url) navigate(action.url)
            }}
            className="flex flex-col items-center gap-2 rounded-xl p-4 transition-all hover:scale-105 hover:shadow-md bg-muted/50 hover:bg-muted"
          >
            <div className={cn("rounded-xl p-3", action.bgColor)}>
              <action.icon className={cn("h-5 w-5", action.color)} />
            </div>
            <span className="text-sm font-medium text-foreground text-center">
              {action.title}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}