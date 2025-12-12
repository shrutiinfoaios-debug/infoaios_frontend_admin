"use client"

import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true'

    if (!isLoggedIn) {
      // Not logged in
      if (pathname !== '/login') {
        router.replace('/login')
      } else {
        setIsAuthenticated(false)
        setIsLoading(false)
      }
    } else {
      // Logged in
      if (pathname === '/login') {
      -        router.replace('/dashboard')
      } else {
        setIsAuthenticated(true)
        setIsLoading(false)
      }
    }
  }, [pathname, router])

  // Show loading or nothing while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-purple-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-slate-300">Loading...</p>
        </div>
      </div>
    )
  }

  // Only render children if authenticated and not on login page
  if (isAuthenticated && pathname !== '/login') {
    return <>{children}</>
  }

  // For login page, render children regardless of auth status
  if (pathname === '/login') {
    return <>{children}</>
  }

  // Don't render anything if not authenticated and not on login page
  return null
}
