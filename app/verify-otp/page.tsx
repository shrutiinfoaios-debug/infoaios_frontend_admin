"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ArrowLeft, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { API_BASE_URL } from '../../config';

export default function VerifyOTPPage() {
  const router = useRouter()
  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-purple-100 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl shadow-lg mb-4">
            <span className="text-2xl font-bold text-white">U</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Verify OTP</h1>
        </div>

        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl text-center">Enter OTP</CardTitle>
            <CardDescription className="text-center">
              We've sent a 6-digit code to <strong>{email}</strong>
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form  className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">OTP Code</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="h-12 text-center text-2xl tracking-widest"
                  maxLength={6}
                  required
                />
              </div>

              <Button type="submit" disabled={isLoading || otp.length !== 6} className="w-full h-12 bg-[#6F42C1] hover:bg-[#5A2D91]">
                {isLoading ? "Verifying..." : "Verify OTP"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/forgot-password"
                className="inline-flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to forgot password
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
