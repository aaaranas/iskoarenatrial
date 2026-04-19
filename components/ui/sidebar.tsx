"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const Sidebar = React.forwardRef<HTMLDivElement, React.ComponentProps<"header">>(
  ({ className, ...props }, ref) => (
    <header
      ref={ref}
      className={cn(
        "sticky top-0 z-50 flex h-16 w-full items-center border-b bg-background px-4 md:px-6",
        className
      )}
      {...props}
    />
  )
)
Sidebar.displayName = "Topbar"

const TopbarNav = ({ className, ...props }: React.ComponentProps<"nav">) => (
  <nav className={cn("flex items-center gap-6", className)} {...props} />
)

export { Sidebar, TopbarNav }
