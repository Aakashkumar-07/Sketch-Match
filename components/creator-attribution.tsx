"use client"

import { Sparkles } from "lucide-react"

export function CreatorAttribution() {
  return (
    <div className="fixed bottom-4 left-4 z-10">
      <div className="bg-card/80 backdrop-blur-sm border border-border rounded-lg p-2 shadow-lg">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground px-2 py-0.5">
          <Sparkles className="h-3 w-3" />
          <span className="font-medium">Sketch Match</span>
          <span className="text-muted-foreground/60">v1.0</span>
        </div>
      </div>
    </div>
  )
}
