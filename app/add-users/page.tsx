"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input" // Keep Input for other fields
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, User, Building, MapPin, Mail, Phone, Lock, Eye, EyeOff, AlertCircle, X } from "lucide-react"

export default function AddUsersPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phoneNumber: "",
    password: "",
    restaurantName: "",
    restaurantAddress: "",
  })
  const [tableTypes, setTableTypes] = useState<Array<{ _id: string; typeName: string; status: boolean; createdAt: string }>>([]) // fetched table types from API

  const [currentSelectedTableTypeId, setCurrentSelectedTableTypeId] = useState<string>("") // For the dropdown selection
  const [selectedTableTypes, setSelectedTableTypes] = useState<Array<{ // user selected table types with counts
    id: string,
    name: string,
    status: boolean,
    noOfTables: string
  }>>([]) // user selected table types with counts

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string | undefined>>({}) // Allow undefined for clearing errors
  
  useEffect(() => {
    // fetch table types on mount
    const fetchTableTypes = async () => {
      try {
        const token = localStorage.getItem('token')
        const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/tabletype/tabletype_list`
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `JWT ${token}`
          }
        })
        if (!response.ok) {
          console.error('Failed to fetch table types:', response.status, response.statusText)
          return
        }
        const data = await response.json()
        setTableTypes(data)
      } catch (error) {
        console.error('Error fetching table types:', error)
      }
    }
    fetchTableTypes()
  }, [])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = "admin name  is required"
    } else if (formData.username.length < 3) {
      newErrors.username = "admin name  must be at least 3 characters"
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    // Phone validation
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required"
    } else if (!phoneRegex.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Please enter a valid phone number"
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    // Restaurant name validation
    if (!formData.restaurantName.trim()) {
      newErrors.restaurantName = "Restaurant name is required"
    }

    // Restaurant address validation
    if (!formData.restaurantAddress.trim()) {
      newErrors.restaurantAddress = "Restaurant address is required"
    }

    // Selected table types validation
    if (selectedTableTypes.length === 0) {
      newErrors.selectedTableTypes = "At least one table type must be added."
    } else {
      selectedTableTypes.forEach((type) => {
        if (!type.noOfTables.trim()) {
          newErrors[`noOfTables_${type.id}`] = `Number of tables for ${type.name} is required.`
        } else if (isNaN(Number(type.noOfTables)) || Number(type.noOfTables) <= 0) {
          newErrors[`noOfTables_${type.id}`] = `Please enter a valid number of tables for ${type.name}.`
        }
      })
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAddTableType = () => {
    if (!currentSelectedTableTypeId) return

    const typeToAdd = tableTypes.find(type => type._id === currentSelectedTableTypeId)
    if (typeToAdd && !selectedTableTypes.some(st => st.id === typeToAdd._id)) {
      setSelectedTableTypes(prev => [
        ...prev,
        {
          id: typeToAdd._id,
          name: typeToAdd.typeName,
          status: typeToAdd.status,
          noOfTables: "" // Initialize with empty string
        }
      ])
      setCurrentSelectedTableTypeId("") // Reset dropdown
      if (errors.selectedTableTypes) {
        setErrors(prev => ({ ...prev, selectedTableTypes: undefined }))
      }
    }
  }

  const handleRemoveTableType = (id: string) => {
    setSelectedTableTypes(prev => prev.filter(type => type.id !== id))
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[`noOfTables_${id}`]; // Clear specific error for this table type
      if (selectedTableTypes.length === 1 && newErrors.selectedTableTypes) { // If this was the last one
        newErrors.selectedTableTypes = "At least one table type must be added.";
      }
      return newErrors;
    });
  }

  const handleTableTypeCountChange = (id: string, value: string) => {
    setSelectedTableTypes(prev =>
      prev.map(type =>
        type.id === id ? { ...type, noOfTables: value } : type
      )
    )
    setErrors(prev => {
      const newErrors = { ...prev };
      if (newErrors[`noOfTables_${id}`]) {
        delete newErrors[`noOfTables_${id}`];
      }
      return newErrors;
    });
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined // Set to undefined to clear the error
      }))
    }
  }

  const getClientIP = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json')
      const data = await response.json()
      return data.ip
    } catch (error) {
      console.error('Error getting IP:', error)
      return 'unknown'
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/register`
      const formDataToSend = new URLSearchParams()
      formDataToSend.append('username', formData.username)
      formDataToSend.append('email', formData.email)
      formDataToSend.append('phoneNumber', formData.phoneNumber)
      formDataToSend.append('restaurantName', formData.restaurantName)
      formDataToSend.append('restaurantAddress', formData.restaurantAddress)
      formDataToSend.append('password', formData.password)

      // 1. Calculate total number of tables
      const totalTables = selectedTableTypes.reduce((sum, type) => {
        const count = parseInt(type.noOfTables, 10);
        return sum + (isNaN(count) ? 0 : count);
      }, 0);
      formDataToSend.append('noOfTables', String(totalTables));

      // Append selected table types
      selectedTableTypes.forEach((type, index) => {
        formDataToSend.append(`tableTypes[${index}]['id']`, type.id)
        formDataToSend.append(`tableTypes[${index}]['name']`, type.name)
        formDataToSend.append(`tableTypes[${index}]['status']`, String(type.status)) // Convert boolean to string
        formDataToSend.append(`tableTypes[${index}]['noOfTables']`, type.noOfTables)
      })

      // 2. Add createdBy from localStorage
      const userDetailsAdminString = localStorage.getItem('userDetailsAdmin');
      if (userDetailsAdminString) {
        const userDetailsAdmin = JSON.parse(userDetailsAdminString);
        if (userDetailsAdmin && userDetailsAdmin._id) {
          formDataToSend.append('createdBy', userDetailsAdmin._id);
        }
      }
      formDataToSend.append('userRoleType', '1')
      const token = localStorage.getItem('token')
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `JWT ${token}`
        },
        body: formDataToSend.toString(),
      })

      if (!response.ok) {
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to create admin')
        } else {
          const textResponse = await response.text()
          console.error('Server returned non-JSON response:', textResponse)
          throw new Error(`Server error: ${response.status} ${response.statusText}`)
        }
      }

      const data = await response.json()

      console.log("admin created:", data)

      // Store token in localStorage as array of objects
      const existingTokens = JSON.parse(localStorage.getItem('adminTokens') || '[]')
      const newToken = {
        username: formData.username,
        token: data.token,
        status: 'active', // Default status
        createdAt: new Date().toISOString()
      }
      existingTokens.push(newToken)
      localStorage.setItem('adminTokens', JSON.stringify(existingTokens))

      // Reset form
      setFormData({
        username: "",
        email: "",
        phoneNumber: "",
        password: "",
        restaurantName: "",
        restaurantAddress: ""
      })
      setSelectedTableTypes([]) // Reset selected table types

      alert("admin created successfully!")
      router.push("/dashboard")
    } catch (error) {
      console.error("Error creating admin:", error)
      alert(`Failed to create admin: ${(error as Error).message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout activeItem="Add Users">
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6  bg-card/50 from-purple-50 via-white to-purple-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-foreground overflow-x-hidden">
        <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center justify-center gap-3">
              <Users className="h-8 w-8 text-[#6F42C1]" />
              Add Admin
            </h1>
            <p className="text-gray-600 dark:text-gray-300">Add new admins to your restaurant system</p>
          </div>

          <Card className="shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl font-semibold text-center text-gray-900 dark:text-white">Add Admin Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-6">
                    {/* Username Field */}
                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        admin Name
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="username"
                          type="text"
                          placeholder="Enter admin name"
                          value={formData.username}
                          onChange={(e) => handleInputChange("username", e.target.value)}
                          required
                          className={`pl-10 h-12 border-gray-200 focus:border-purple-500 focus:ring-purple-500 rounded-lg ${errors.username ? 'border-red-500' : ''}`}
                        />
                        {errors.username && (
                          <div className="flex items-center gap-1 mt-1 text-red-600 text-xs">
                            <AlertCircle className="h-3 w-3" />
                            {errors.username}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Restaurant Name Field */}
                    <div className="space-y-2">
                      <Label htmlFor="restaurantName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Restaurant Name
                      </Label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="restaurantName"
                          type="text"
                          placeholder="Enter restaurant name"
                          value={formData.restaurantName}
                          onChange={(e) => handleInputChange("restaurantName", e.target.value)}
                          required
                          className={`pl-10 h-12 border-gray-200 focus:border-purple-500 focus:ring-purple-500 rounded-lg ${errors.restaurantName ? 'border-red-500' : ''}`}
                        />
                        {errors.restaurantName && (
                          <div className="flex items-center gap-1 mt-1 text-red-600 text-xs">
                            <AlertCircle className="h-3 w-3" />
                            {errors.restaurantName}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Restaurant Address Field */}
                    <div className="space-y-2">
                      <Label htmlFor="restaurantAddress" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Restaurant Address
                      </Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="restaurantAddress"
                          type="text"
                          placeholder="Enter restaurant address"
                          value={formData.restaurantAddress}
                          onChange={(e) => handleInputChange("restaurantAddress", e.target.value)}
                          required
                          className={`pl-10 h-12 border-gray-200 focus:border-purple-500 focus:ring-purple-500 rounded-lg ${errors.restaurantAddress ? 'border-red-500' : ''}`}
                        />
                        {errors.restaurantAddress && (
                          <div className="flex items-center gap-1 mt-1 text-red-600 text-xs">
                            <AlertCircle className="h-3 w-3" />
                            {errors.restaurantAddress}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Table Types Configuration */}
                    <div className="space-y-4 col-span-1 md:col-span-2">
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Configure Table Types
                      </Label>
                      <div className="flex gap-2 items-center">
                        <Select
                          onValueChange={setCurrentSelectedTableTypeId}
                          value={currentSelectedTableTypeId}
                        >
                          <SelectTrigger className="w-full h-12 border-gray-200 focus:border-purple-500 focus:ring-purple-500 rounded-lg">
                            <SelectValue placeholder="Select a table type" />
                          </SelectTrigger>
                          <SelectContent>
                            {tableTypes.map(type => (
                              <SelectItem
                                key={type._id}
                                value={type._id}
                                disabled={selectedTableTypes.some(st => st.id === type._id)}
                              >
                                {type.typeName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button type="button" onClick={handleAddTableType} disabled={!currentSelectedTableTypeId}>
                          Add
                        </Button>
                      </div>
                      {errors.selectedTableTypes && (
                        <div className="flex items-center gap-1 mt-1 text-red-600 text-xs">
                          <AlertCircle className="h-3 w-3" />
                          {errors.selectedTableTypes}
                        </div>
                      )}

                      <div className="space-y-3 mt-4">
                        {selectedTableTypes.map(type => (
                          <div key={type.id} className="flex items-center gap-2 p-3 border rounded-lg bg-gray-50 dark:bg-gray-700">
                            <span className="font-medium flex-1">{type.name}</span>
                            <div className="relative w-24">
                              <Input
                                type="number"
                                placeholder="Count"
                                value={type.noOfTables}
                                onChange={(e) => handleTableTypeCountChange(type.id, e.target.value)}
                                className={`h-10 text-center ${errors[`noOfTables_${type.id}`] ? 'border-red-500' : ''}`}
                              />
                              {errors[`noOfTables_${type.id}`] && (
                                <div className="absolute -bottom-5 left-0 text-red-600 text-xs whitespace-nowrap">
                                  {errors[`noOfTables_${type.id}`]}
                                </div>
                              )}
                            </div>
                            <Button type="button" variant="destructive" size="icon" onClick={() => handleRemoveTableType(type.id)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Email Field */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email Address
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter email address"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          required
                          className={`pl-10 h-12 border-gray-200 focus:border-purple-500 focus:ring-purple-500 rounded-lg ${errors.email ? 'border-red-500' : ''}`}
                        />
                        {errors.email && (
                          <div className="flex items-center gap-1 mt-1 text-red-600 text-xs">
                            <AlertCircle className="h-3 w-3" />
                            {errors.email}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Phone Number Field */}
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Phone Number
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="phoneNumber"
                          type="tel"
                          placeholder="Enter phone number"
                          value={formData.phoneNumber}
                          onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                          required
                          className={`pl-10 h-12 border-gray-200 focus:border-purple-500 focus:ring-purple-500 rounded-lg ${errors.phoneNumber ? 'border-red-500' : ''}`}
                        />
                        {errors.phoneNumber && (
                          <div className="flex items-center gap-1 mt-1 text-red-600 text-xs">
                            <AlertCircle className="h-3 w-3" />
                            {errors.phoneNumber}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter password"
                          value={formData.password}
                          onChange={(e) => handleInputChange("password", e.target.value)}
                          required
                          className={`pl-10 pr-10 h-12 border-gray-200 focus:border-purple-500 focus:ring-purple-500 rounded-lg ${errors.password ? 'border-red-500' : ''}`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          suppressHydrationWarning={true}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                        {errors.password && (
                          <div className="flex items-center gap-1 mt-1 text-red-600 text-xs">
                            <AlertCircle className="h-3 w-3" />
                            {errors.password}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-[#6F42C1] hover:bg-[#5A2D91] text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Adding admin...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        Add admin
                        <Users className="h-4 w-4" />
                      </div>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/dashboard")}
                    className="w-full sm:w-auto bg-transparent border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
          </CardContent>
        </Card>
        </div>
      </main>
    </DashboardLayout>
  )
}
