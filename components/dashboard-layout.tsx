"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import Link from "next/link"

import {
  Home,
  Phone,
  Calendar,
  ShoppingBag,
  CreditCard,
  MessageSquare,
  Users,
  Settings,

  ChevronDown,
  User,
  LogOut,
  Utensils,
  UserPlus,
  Volume2,
  QrCode,
  Edit,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"

import DarkModeToggle from "@/components/dark-mode-toggle"

const navigationItems = [
  { title: "All Admins", icon: Users, href: "/dashboard" },
  { title: "Add Admins", icon: UserPlus, href: "/add-users" },
  
  { title: "Settings", icon: Settings, href: "/settings" }
]

interface DashboardLayoutProps {
  children: React.ReactNode
  activeItem?: string
  cafeName?: string
  ownerName?: string
}

export default function DashboardLayout({
  children,
  activeItem = "Dashboard",
  cafeName = "",
  ownerName = "",
}: DashboardLayoutProps) {
  const [userName] = useState(ownerName)
  const [userCafeName] = useState(cafeName)
  const [userDetails, setUserDetails] = useState<any>(null)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    // Get user details from localStorage
    const storedUserDetails = localStorage.getItem('userDetailsAdmin')
    if (storedUserDetails) {
      try {
        setUserDetails(JSON.parse(storedUserDetails))
      } catch (error) {
        console.error('Error parsing user details from localStorage:', error)
        setUserDetails(null)
      }
    }
  }, [])



  return (
    <SidebarProvider>
      <Sidebar className="border-r border-slate-200 dark:border-slate-700">
        <SidebarHeader className="border-b border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6F42C1] text-white font-bold text-lg">
              I
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 truncate">InfoAios</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Super Admin</p>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={item.title === activeItem}
                      className="w-full justify-start"
                    >
                      {/* ✅ NEXT.JS SPA NAVIGATION (NO PAGE RELOAD) */}
                      <Link href={item.href} className="flex items-center gap-3">
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        <span className="truncate">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <SidebarInset>
        {/* Top Navbar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 dark:border-slate-700 bg-background px-4 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="h-6 hidden sm:block" />
            <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 truncate">
              {activeItem}
            </h2>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <DarkModeToggle />

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2 sm:px-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-[#6F42C1] text-white text-sm font-semibold">
                      {userDetails?.username ? userDetails.username.charAt(0).toUpperCase() : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:block truncate max-w-20 lg:max-w-32">
                    {userDetails?.username || userName}
                  </span>
                  <ChevronDown className="h-4 w-4 flex-shrink-0" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-64">
                {/* Profile Section */}
                <div className="px-3 py-2 border-b">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-[#6F42C1] text-white text-sm font-semibold">
                        {userDetails?.username ? userDetails.username.charAt(0).toUpperCase() : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{userDetails?.username || 'User'}</p>
                      <p className="text-xs text-muted-foreground truncate">{userDetails?.email || ''}</p>
                    </div>
                  </div>
                  {userDetails && (
                    <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                      <p><strong>Restaurant:</strong> {userDetails.restaurantName}</p>
                      <p><strong>Phone:</strong> {userDetails.phoneNumber}</p>
                      <p><strong>Tables:</strong> {userDetails.noOfTables}</p>
                    </div>
                  )}
                </div>

                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => {
                    localStorage.removeItem("adminLoggedIn")
                    localStorage.removeItem("token")
                    localStorage.removeItem("userDetailsAdmin")
                    localStorage.removeItem("userDetails")

                    if (typeof window !== "undefined") {
                      delete (window as any).ADMIN_KEY
                    }

                    window.location.href = "/login"
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Content */}
        <main className="bg-background text-foreground min-h-[calc(100vh-4rem)] overflow-x-auto">
          <div className="p-4 sm:p-6">{children}</div>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200 dark:border-slate-700 bg-background px-4 sm:px-6 py-4">
          <p className="text-center text-xs sm:text-sm text-muted-foreground">
            Powered by <span className="font-semibold text-[#6F42C1]">InfoAios</span> — Automating Hospitality
          </p>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  )
}
