"use client"

import type React from "react"

import { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  HomeIcon,
  PhoneIcon,
  CalendarIcon,
  ShoppingBagIcon,
  CreditCardIcon,
  ChatBubbleLeftRightIcon,
  UsersIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  XMarkIcon,
  Bars3Icon,
  QrCodeIcon,
} from "@heroicons/react/24/outline"

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

const navigation: NavigationItem[] = [
  { name: "All Admins", href: "/dashboard", icon: HomeIcon },
  { name: "Add Admins", href: "/add-users", icon: UsersIcon },

  { name: "Orders", href: "/orders", icon: ShoppingBagIcon },
  { name: "Billing", href: "/billing", icon: CreditCardIcon },
  { name: "Feedback", href: "/feedback", icon: ChatBubbleLeftRightIcon },
  { name: "Settings", href: "/settings", icon: Cog6ToothIcon },

  { name: "Team", href: "/team", icon: UsersIcon },
]

interface SidebarNavigationProps {
  cafeName?: string
  ownerName?: string
  onLogout?: () => void
}

export default function SidebarNavigation({
  cafeName = "Basil the Other Side",
  ownerName = "Rajesh",
  onLogout,
}: SidebarNavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const handleLogout = () => {
    if (onLogout) {
      onLogout()
    } else {
      // Default logout behavior
      console.log("Logging out...")
      // Clear localStorage on logout
      localStorage.removeItem('token')
      localStorage.removeItem('adminLoggedIn')
  
      localStorage.removeItem('userDetailsAdmin')
      // You can implement your logout logic here
    }
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  const isActive = (href: string) => {
    return pathname === href
  }

  // Desktop Sidebar Component
  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="flex flex-col h-full justify-between p-4 bg-[color:var(--sidebar-background)] shadow-lg">
      {/* Header */}
      <div className="space-y-6">
        {/* Mobile Close Button */}
        {isMobile && (
          <div className="flex justify-end">
            <button
              onClick={closeMobileMenu}
              className="p-2 rounded-md text-[color:var(--sidebar-foreground)] hover:text-[color:var(--sidebar-primary-foreground)] hover:bg-[color:var(--sidebar-accent)] focus:outline-none focus:ring-2 focus:ring-purple-300"
              aria-label="Close menu"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        )}

        {/* Brand Logo */}
        <div className="flex items-center gap-3 px-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 text-white font-bold text-lg shadow-md">
            I
          </div>
          <div>
            <h2 className="text-lg font-bold text-[color:var(--sidebar-foreground)]">InfoAios</h2>
            <p className="text-xs text-[color:var(--sidebar-muted-foreground)]">Restaurant Assistant</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1" role="navigation" aria-label="Main navigation">
          {navigation.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={isMobile ? closeMobileMenu : undefined}
                className={`
                  flex items-center gap-3 py-2 px-3 rounded-md transition-all duration-200
                  hover:bg-[color:var(--sidebar-accent)] focus:outline-none focus:ring-2 focus:ring-purple-300
                  ${
                    active
                      ? "bg-[color:var(--sidebar-primary)] text-[color:var(--sidebar-primary-foreground)] font-semibold border-l-4 border-purple-600"
                      : "text-[color:var(--sidebar-foreground)] hover:text-[color:var(--sidebar-primary)]"
                  }
                `}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="h-5 w-5 flex-shrink-0" aria-label={item.name} />
                <span className="text-sm font-medium">{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Footer */}
          <div className="space-y-4 border-t border-[color:var(--sidebar-border)] pt-4">
        {/* Café Info */}
          <div className="px-3 py-2 bg-[color:var(--sidebar-accent)] rounded-lg">
            <p className="text-sm font-medium text-[color:var(--sidebar-primary-foreground)] truncate">{cafeName}</p>
            <p className="text-xs text-[color:var(--sidebar-muted-foreground)]">Owner: {ownerName}</p>
          </div>

        {/* Logout Button */}
          <button
          onClick={handleLogout}
          className="
            flex items-center gap-3 w-full py-2 px-3 rounded-md text-left
            text-[color:var(--sidebar-foreground)] hover:bg-[color:var(--destructive)] hover:text-[color:var(--destructive-foreground)]
            transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-300
          "
          aria-label="Log out"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5 flex-shrink-0" />
          <span className="text-sm font-medium">Log Out</span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="
          md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-lg
          text-gray-600 hover:text-purple-700 hover:bg-purple-50
          focus:outline-none focus:ring-2 focus:ring-purple-300
        "
        aria-label="Open menu"
      >
        <Bars3Icon className="h-6 w-6" />
      </button>

      {/* Desktop Sidebar */}
      <aside className="hidden md:block fixed left-0 top-0 w-64 h-full z-40">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={closeMobileMenu}
            aria-hidden="true"
          />

          {/* Sidebar Drawer */}
          <aside
            className={`
              relative w-64 h-full bg-white transform transition-transform duration-300 ease-in-out
              ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
            `}
          >
            <SidebarContent isMobile={true} />
          </aside>
        </div>
      )}

      {/* Main Content Spacer for Desktop */}
      <div className="hidden md:block w-64 flex-shrink-0" aria-hidden="true" />
    </>
  )
}
