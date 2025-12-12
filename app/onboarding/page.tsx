"use client"

import { useState } from "react"
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Store,
  Clock,
  Phone,
  MapPin,
  Users,
  Utensils,
  Bot,
  Mic,
  CheckCircle,
  Sparkles,
  Calendar,
  Plus,
  X,
  Info,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface RestaurantData {
  // Step 1: Basic Info
  name: string
  type: string
  description: string
  address: string
  city: string
  state: string
  pincode: string

  // Step 2: Contact & Hours
  phone: string
  email: string
  website: string
  capacity: string
  hours: {
    [key: string]: { open: string; close: string; closed: boolean }
  }

  // Step 3: Menu Setup
  menuCategories: string[]
  specialties: string[]
  dietaryOptions: string[]

  // Step 4: AI Configuration
  aiName: string
  aiPersonality: string
  languages: string[]
  autoBooking: boolean
  orderTaking: boolean

  // Step 5: Phone Setup
  businessPhone: string
  aiPhoneNumber: string
  callForwarding: boolean
}

const steps = [
  {
    id: 1,
    title: "Restaurant Details",
    description: "Tell us about your restaurant",
    icon: Store,
  },
  {
    id: 2,
    title: "Contact & Hours",
    description: "Business hours and contact info",
    icon: Clock,
  },
  {
    id: 3,
    title: "Menu Setup",
    description: "Configure your menu basics",
    icon: Utensils,
  },
  {
    id: 4,
    title: "AI Assistant",
    description: "Customize your AI helper",
    icon: Bot,
  },
  {
    id: 5,
    title: "Phone Setup",
    description: "Configure call handling",
    icon: Phone,
  },
]

const restaurantTypes = [
  "Fine Dining",
  "Casual Dining",
  "Fast Food",
  "Café",
  "Bakery",
  "Bar & Grill",
  "Food Truck",
  "Pizzeria",
  "Indian Restaurant",
  "Chinese Restaurant",
  "Italian Restaurant",
  "Other",
]

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

const defaultMenuCategories = ["Appetizers", "Main Course", "Desserts", "Beverages", "Soups", "Salads", "Specials"]

const aiPersonalities = [
  { value: "friendly", label: "Friendly & Welcoming", description: "Warm and approachable tone" },
  { value: "professional", label: "Professional", description: "Formal and efficient communication" },
  { value: "casual", label: "Casual & Fun", description: "Relaxed and conversational style" },
  { value: "elegant", label: "Elegant & Sophisticated", description: "Refined and polished interaction" },
]

export default function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const [restaurantData, setRestaurantData] = useState<RestaurantData>({
    name: "",
    type: "",
    description: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
    email: "",
    website: "",
    capacity: "",
    hours: {
      Monday: { open: "09:00", close: "22:00", closed: false },
      Tuesday: { open: "09:00", close: "22:00", closed: false },
      Wednesday: { open: "09:00", close: "22:00", closed: false },
      Thursday: { open: "09:00", close: "22:00", closed: false },
      Friday: { open: "09:00", close: "22:00", closed: false },
      Saturday: { open: "09:00", close: "22:00", closed: false },
      Sunday: { open: "09:00", close: "22:00", closed: false },
    },
    menuCategories: [],
    specialties: [],
    dietaryOptions: [],
    aiName: "InfoAios Assistant",
    aiPersonality: "friendly",
    languages: ["English"],
    autoBooking: true,
    orderTaking: false,
    businessPhone: "",
    aiPhoneNumber: "",
    callForwarding: true,
  })

  const updateData = (field: string, value: any) => {
    setRestaurantData((prev) => ({ ...prev, [field]: value }))
  }

  const updateHours = (day: string, field: string, value: string | boolean) => {
    setRestaurantData((prev) => ({
      ...prev,
      hours: {
        ...prev.hours,
        [day]: { ...prev.hours[day], [field]: value },
      },
    }))
  }

  const addToArray = (field: keyof RestaurantData, value: string) => {
    const currentArray = restaurantData[field] as string[]
    if (!currentArray.includes(value) && value.trim()) {
      updateData(field, [...currentArray, value.trim()])
    }
  }

  const removeFromArray = (field: keyof RestaurantData, value: string) => {
    const currentArray = restaurantData[field] as string[]
    updateData(
      field,
      currentArray.filter((item) => item !== value),
    )
  }

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const completeSetup = async () => {
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsLoading(false)
    setIsComplete(true)
  }

  const progress = (currentStep / steps.length) * 100

  // Current step's icon component
  const CurrentIcon = steps[currentStep - 1].icon

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">🎉 Welcome to InfoAios!</h1>

            <p className="text-lg text-gray-600 mb-8">
              Your restaurant <strong>{restaurantData.name}</strong> is now ready to automate hospitality with AI!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="p-4 bg-purple-50 rounded-lg">
                <Phone className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">AI Calls Ready</p>
                <p className="text-xs text-gray-600">Your AI assistant is configured</p>
              </div>
              <div className="p-4 bg-teal-50 rounded-lg">
                <Calendar className="h-6 w-6 text-teal-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Bookings Active</p>
                <p className="text-xs text-gray-600">Table reservations enabled</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <Sparkles className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Dashboard Ready</p>
                <p className="text-xs text-gray-600">Analytics and insights available</p>
              </div>
            </div>

            <div className="space-y-4">
              <Button
                size="lg"
                className="w-full bg-[#6F42C1] hover:bg-[#5A2D91] h-12"
                onClick={() => (window.location.href = "/")}
              >
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <Button variant="outline" size="lg" className="w-full h-12 bg-transparent">
                Schedule Training Call
                <Phone className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl shadow-lg mb-4">
              <span className="text-2xl font-bold text-white">I</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Setup Your Restaurant</h1>
            <p className="text-gray-600">Let's get your AI assistant configured in just a few steps</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                      currentStep > step.id
                        ? "bg-green-500 border-green-500 text-white"
                        : currentStep === step.id
                          ? "bg-purple-600 border-purple-600 text-white"
                          : "bg-white border-gray-300 text-gray-400"
                    }`}
                  >
                    {currentStep > step.id ? <Check className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`hidden md:block w-20 h-0.5 ml-4 ${
                        currentStep > step.id ? "bg-green-500" : "bg-gray-300"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-sm text-gray-600 mt-2">
              <span>
                Step {currentStep} of {steps.length}
              </span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
          </div>

          {/* Step Content */}
          <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                {CurrentIcon && <CurrentIcon className="h-6 w-6 text-purple-600" />}
                {steps[currentStep - 1].title}
              </CardTitle>
              <CardDescription>{steps[currentStep - 1].description}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Step 1: Restaurant Details */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Restaurant Name *</Label>
                      <Input
                        id="name"
                        placeholder="e.g., Basil the Other Side"
                        value={restaurantData.name}
                        onChange={(e) => updateData("name", e.target.value)}
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Restaurant Type *</Label>
                      <Select value={restaurantData.type} onValueChange={(value) => updateData("type", value)}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {restaurantTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Brief description of your restaurant, cuisine, and atmosphere..."
                      value={restaurantData.description}
                      onChange={(e) => updateData("description", e.target.value)}
                      rows={3}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-purple-600" />
                      Address
                    </h3>

                    <div className="space-y-2">
                      <Label htmlFor="address">Street Address *</Label>
                      <Input
                        id="address"
                        placeholder="123 Main Street"
                        value={restaurantData.address}
                        onChange={(e) => updateData("address", e.target.value)}
                        className="h-12"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          placeholder="Mumbai"
                          value={restaurantData.city}
                          onChange={(e) => updateData("city", e.target.value)}
                          className="h-12"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State *</Label>
                        <Input
                          id="state"
                          placeholder="Maharashtra"
                          value={restaurantData.state}
                          onChange={(e) => updateData("state", e.target.value)}
                          className="h-12"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pincode">PIN Code *</Label>
                        <Input
                          id="pincode"
                          placeholder="808101"
                          value={restaurantData.pincode}
                          onChange={(e) => updateData("pincode", e.target.value)}
                          className="h-12"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Contact & Hours */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Phone className="h-5 w-5 text-purple-600" />
                      Contact Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          placeholder="+91 98765 43210"
                          value={restaurantData.phone}
                          onChange={(e) => updateData("phone", e.target.value)}
                          className="h-12"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="contact@restaurant.com"
                          value={restaurantData.email}
                          onChange={(e) => updateData("email", e.target.value)}
                          className="h-12"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="website">Website (Optional)</Label>
                        <Input
                          id="website"
                          placeholder="https://restaurant.com"
                          value={restaurantData.website}
                          onChange={(e) => updateData("website", e.target.value)}
                          className="h-12"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="capacity">Seating Capacity</Label>
                        <Input
                          id="capacity"
                          placeholder="50"
                          value={restaurantData.capacity}
                          onChange={(e) => updateData("capacity", e.target.value)}
                          className="h-12"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Clock className="h-5 w-5 text-purple-600" />
                      Business Hours
                    </h3>

                    <div className="space-y-3">
                      {daysOfWeek.map((day) => (
                        <div key={day} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                          <div className="w-20">
                            <Label className="text-sm font-medium">{day}</Label>
                          </div>

                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={!restaurantData.hours[day].closed}
                              onCheckedChange={(checked) => updateHours(day, "closed", !checked)}
                            />
                            <Label className="text-sm">Open</Label>
                          </div>

                          {!restaurantData.hours[day].closed && (
                            <>
                              <Input
                                type="time"
                                value={restaurantData.hours[day].open}
                                onChange={(e) => updateHours(day, "open", e.target.value)}
                                className="w-32"
                              />
                              <span className="text-gray-500">to</span>
                              <Input
                                type="time"
                                value={restaurantData.hours[day].close}
                                onChange={(e) => updateHours(day, "close", e.target.value)}
                                className="w-32"
                              />
                            </>
                          )}

                          {restaurantData.hours[day].closed && <span className="text-gray-500 italic">Closed</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Menu Setup */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Utensils className="h-5 w-5 text-purple-600" />
                      Menu Categories
                    </h3>

                    <p className="text-sm text-gray-600">
                      Select the main categories for your menu. You can add specific items later.
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {defaultMenuCategories.map((category) => (
                        <div key={category} className="flex items-center space-x-2">
                          <Checkbox
                            checked={restaurantData.menuCategories.includes(category)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                addToArray("menuCategories", category)
                              } else {
                                removeFromArray("menuCategories", category)
                              }
                            }}
                          />
                          <Label className="text-sm">{category}</Label>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-2 mt-4">
                      {restaurantData.menuCategories.map((category) => (
                        <Badge key={category} variant="secondary" className="flex items-center gap-1">
                          {category}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => removeFromArray("menuCategories", category)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Specialties & Signature Dishes</h3>
                    <p className="text-sm text-gray-600">What are your restaurant's signature dishes or specialties?</p>

                    <div className="flex gap-2">
                      <Input
                        placeholder="e.g., Butter Chicken, Margherita Pizza"
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            addToArray("specialties", e.currentTarget.value)
                            e.currentTarget.value = ""
                          }
                        }}
                        className="h-12"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={(e) => {
                          const input = e.currentTarget.previousElementSibling as HTMLInputElement
                          addToArray("specialties", input.value)
                          input.value = ""
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {restaurantData.specialties.map((specialty) => (
                        <Badge key={specialty} className="flex items-center gap-1">
                          {specialty}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => removeFromArray("specialties", specialty)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Dietary Options</h3>
                    <p className="text-sm text-gray-600">What dietary preferences do you cater to?</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {["Vegetarian", "Vegan", "Gluten-Free", "Halal", "Jain", "Keto", "Sugar-Free", "Organic"].map(
                        (option) => (
                          <div key={option} className="flex items-center space-x-2">
                            <Checkbox
                              checked={restaurantData.dietaryOptions.includes(option)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  addToArray("dietaryOptions", option)
                                } else {
                                  removeFromArray("dietaryOptions", option)
                                }
                              }}
                            />
                            <Label className="text-sm">{option}</Label>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: AI Configuration */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Bot className="h-5 w-5 text-purple-600" />
                      AI Assistant Configuration
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="aiName">AI Assistant Name</Label>
                        <Input
                          id="aiName"
                          placeholder="InfoAios Assistant"
                          value={restaurantData.aiName}
                          onChange={(e) => updateData("aiName", e.target.value)}
                          className="h-12"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Primary Language</Label>
                        <Select
                          value={restaurantData.languages[0]}
                          onValueChange={(value) => updateData("languages", [value])}
                        >
                          <SelectTrigger className="h-12">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="English">English</SelectItem>
                            <SelectItem value="Hindi">Hindi</SelectItem>
                            <SelectItem value="Marathi">Marathi</SelectItem>
                            <SelectItem value="Tamil">Tamil</SelectItem>
                            <SelectItem value="Bengali">Bengali</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">AI Personality</h3>
                    <p className="text-sm text-gray-600">Choose how your AI assistant should interact with customers</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {aiPersonalities.map((personality) => (
                        <Card
                          key={personality.value}
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            restaurantData.aiPersonality === personality.value
                              ? "ring-2 ring-purple-500 bg-purple-50"
                              : "hover:bg-gray-50"
                          }`}
                          onClick={() => updateData("aiPersonality", personality.value)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-4 h-4 rounded-full border-2 ${
                                  restaurantData.aiPersonality === personality.value
                                    ? "bg-purple-500 border-purple-500"
                                    : "border-gray-300"
                                }`}
                              />
                              <div>
                                <h4 className="font-medium">{personality.label}</h4>
                                <p className="text-sm text-gray-600">{personality.description}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">AI Capabilities</h3>
                    <p className="text-sm text-gray-600">Configure what your AI assistant can do</p>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-5 w-5 text-purple-600" />
                          <div>
                            <h4 className="font-medium">Automatic Table Booking</h4>
                            <p className="text-sm text-gray-600">AI can book tables automatically</p>
                          </div>
                        </div>
                        <Checkbox
                          checked={restaurantData.autoBooking}
                          onCheckedChange={(checked) => updateData("autoBooking", checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Utensils className="h-5 w-5 text-purple-600" />
                          <div>
                            <h4 className="font-medium">Order Taking</h4>
                            <p className="text-sm text-gray-600">AI can take food orders over phone</p>
                          </div>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-4 w-4 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Requires menu setup completion</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Checkbox
                          checked={restaurantData.orderTaking}
                          onCheckedChange={(checked) => updateData("orderTaking", checked)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Phone Setup */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Phone className="h-5 w-5 text-purple-600" />
                      Phone Configuration
                    </h3>

                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-blue-900">How it works</h4>
                          <p className="text-sm text-blue-800">
                            We'll provide you with a dedicated AI phone number that can handle calls 24/7. You can also
                            forward your existing business calls to this number.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="businessPhone">Current Business Phone</Label>
                        <Input
                          id="businessPhone"
                          placeholder="+91 98765 43210"
                          value={restaurantData.businessPhone}
                          onChange={(e) => updateData("businessPhone", e.target.value)}
                          className="h-12"
                        />
                        <p className="text-sm text-gray-600">Your existing restaurant phone number</p>
                      </div>

                      <div className="space-y-2">
                        <Label>AI Phone Number</Label>
                        <div className="p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                          <div className="text-center">
                            <Mic className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">
                              We'll assign a dedicated AI phone number after setup completion
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Format: +91 XXXXX XXXXX</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium">Call Forwarding</h4>
                          <p className="text-sm text-gray-600">
                            Forward calls from your business number to AI when busy
                          </p>
                        </div>
                        <Checkbox
                          checked={restaurantData.callForwarding}
                          onCheckedChange={(checked) => updateData("callForwarding", checked)}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Call Handling Settings</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="p-4">
                        <div className="text-center">
                          <Clock className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                          <h4 className="font-medium">Business Hours</h4>
                          <p className="text-sm text-gray-600">AI active during business hours</p>
                          <Badge variant="secondary" className="mt-2">
                            Configured
                          </Badge>
                        </div>
                      </Card>

                      <Card className="p-4">
                        <div className="text-center">
                          <Users className="h-8 w-8 text-teal-600 mx-auto mb-2" />
                          <h4 className="font-medium">After Hours</h4>
                          <p className="text-sm text-gray-600">Take messages and bookings</p>
                          <Badge variant="secondary" className="mt-2">
                            Auto-enabled
                          </Badge>
                        </div>
                      </Card>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="h-12 px-6 bg-transparent"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            {currentStep < steps.length ? (
              <Button
                onClick={nextStep}
                className="h-12 px-6 bg-[#6F42C1] hover:bg-[#5A2D91]"
                disabled={
                  (currentStep === 1 && (!restaurantData.name || !restaurantData.type)) ||
                  (currentStep === 2 && (!restaurantData.phone || !restaurantData.email))
                }
              >
                Next Step
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={completeSetup}
                disabled={isLoading}
                className="h-12 px-6 bg-green-600 hover:bg-green-700"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Setting up...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Complete Setup
                    <CheckCircle className="h-4 w-4" />
                  </div>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
