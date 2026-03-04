"use client"
import { cn } from "@/lib/utils"
import { Calendar, MapPin, Clock, Users } from "lucide-react"

interface Event {
  id: string
  title: string
  date: string
  time: string
  location: string
  attendees: number
  type: "meeting" | "activity" | "competition" | "training"
}

const eventTypeColors: Record<Event["type"], { bg: string; text: string; border: string }> = {
  meeting: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200" },
  activity: { bg: "bg-green-50", text: "text-green-600", border: "border-green-200" },
  competition: { bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-200" },
  training: { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-200" },
}

const eventTypeLabels: Record<Event["type"], string> = {
  meeting: "Họp",
  activity: "Hoạt động",
  competition: "Thi đua",
  training: "Huấn luyện",
}

interface UpcomingEventsProps {
  title: string
  events: Event[]
}

export function UpcomingEvents({ title, events }: UpcomingEventsProps) {
  return (
    <div className="rounded-2xl bg-card p-6 shadow-sm border border-border/50">
      <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>
      <div className="space-y-3">
        {events.map((event) => {
          const colors = eventTypeColors[event.type]
          return (
            <div
              key={event.id}
              className={cn(
                "rounded-xl p-4 border transition-all hover:shadow-md cursor-pointer",
                colors.bg,
                colors.border,
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={cn(
                        "text-xs font-medium px-2 py-0.5 rounded-full",
                        colors.bg,
                        colors.text,
                        "bg-white/50",
                      )}
                    >
                      {eventTypeLabels[event.type]}
                    </span>
                  </div>
                  <h4 className="font-medium text-foreground truncate">{event.title}</h4>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{event.time}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      <span>{event.attendees} người</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
