"use client"

import DashboardHomepage from "@/components/dashboard-homepage"
import LayoutWithSidebar from "@/components/layout-with-sidebar"

export default function DashboardDemo() {
  const handleLogout = () => {
    console.log("User logged out")
    // Implement logout logic here
  }

  return (
    <LayoutWithSidebar cafeName="Basil the Other Side" ownerName="Rajesh Kumar" onLogout={handleLogout}>
      <DashboardHomepage cafeName="Basil the Other Side" ownerName="Rajesh Kumar" />
    </LayoutWithSidebar>
  )
}
