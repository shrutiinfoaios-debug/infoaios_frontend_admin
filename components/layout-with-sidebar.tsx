"use client"

import type { ReactNode } from "react"
import SidebarNavigation from "./sidebar-navigation"

interface LayoutWithSidebarProps {
  children: ReactNode
  cafeName?: string
  ownerName?: string
  onLogout?: () => void
}

export default function LayoutWithSidebar({ children, cafeName, ownerName, onLogout }: LayoutWithSidebarProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <SidebarNavigation cafeName={cafeName} ownerName={ownerName} onLogout={onLogout} />

      {/* Main Content */}
      <main className="md:ml-64 min-h-screen">
        <div className="pt-16 md:pt-0">{children}</div>
      </main>
    </div>
  )
}
