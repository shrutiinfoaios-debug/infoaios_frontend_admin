"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/sign_in`
      const formData = new URLSearchParams()
      formData.append('email', email)
      formData.append('password', password)
      formData.append('userRoleType', '0')
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      })

      if (response.ok) {
        const data = await response.json()
          console.log(data);
          
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', data.token)
          localStorage.setItem('adminLoggedIn', 'true')
          if (data.userdetails) {
            localStorage.setItem('userDetailsAdmin', JSON.stringify(data.userdetails))
          }

        }
        router.push("/dashboard")
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Login failed')
      }
    } catch (error) {
      console.error("Login error:", error)
      alert("An error occurred during login: " + (error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }




  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-purple-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4">
      {/* Subtle dotted background pattern */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%239C92AC' fillOpacity='0.03'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        }}
      />

      <div className="w-full max-w-md relative z-10">
        {/* Logo and Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl shadow-lg mb-4">
            <span className="text-2xl font-bold text-white">I</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">InfoAios</h1>
          <p className="text-gray-600 dark:text-slate-300">AI Assistant for Restaurants</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm dark:bg-slate-800/80 dark:backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-semibold text-center text-gray-900 dark:text-white">Welcome back</CardTitle>
            <CardDescription className="text-center text-gray-600 dark:text-slate-300">
              Sign in to your restaurant dashboard
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-slate-300">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 border-gray-200 dark:border-slate-600 focus:border-purple-500 focus:ring-purple-500 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-400"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-slate-300">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-12 border-gray-200 dark:border-slate-600 focus:border-purple-500 focus:ring-purple-500 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
                    suppressHydrationWarning={true}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>



              {/* Login Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-[#6F42C1] hover:bg-[#5A2D91] text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Sign in
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </Button>
            </form>


          </CardContent>
        </Card>


      
        {/* Features Preview */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-white/50 dark:bg-slate-700/50 rounded-lg backdrop-blur-sm">
            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-800 rounded-lg flex items-center justify-center mx-auto mb-2">
              <span className="text-purple-600 dark:text-purple-300 text-sm">📞</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-slate-300 font-medium">AI Call Handling</p>
          </div>
          <div className="p-3 bg-white/50 dark:bg-slate-700/50 rounded-lg backdrop-blur-sm">
            <div className="w-8 h-8 bg-teal-100 dark:bg-teal-800 rounded-lg flex items-center justify-center mx-auto mb-2">
              <span className="text-teal-600 dark:text-teal-300 text-sm">📅</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-slate-300 font-medium">Smart Bookings</p>
          </div>
          <div className="p-3 bg-white/50 dark:bg-slate-700/50 rounded-lg backdrop-blur-sm">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center mx-auto mb-2">
              <span className="text-blue-600 dark:text-blue-300 text-sm">📊</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-slate-300 font-medium">Analytics</p>
          </div>
        </div>
      </div>
    </div>
  )
}
