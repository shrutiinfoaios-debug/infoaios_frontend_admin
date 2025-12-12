"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import {
  MessageSquare,
  Search,
  Filter,
  Star,
  CalendarDays,
  RefreshCw,
  Heart,
  ThumbsUp,
  Meh,
  ThumbsDown,
  MessageCircle,
  SlidersHorizontal,
  X,
} from "lucide-react"

import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { API_BASE_URL } from "@/config"

type Feedback = {
  id: string
  username: string
  customer: string
  rating: number
  category: string
  category2: string
  comments: string
  orderId: string
  date: string
  isVisible: boolean
}

const ratingFilters = [
  { value: "all", label: "All Ratings" },
  { value: "5", label: "⭐⭐⭐⭐⭐ (5 stars)" },
  { value: "4", label: "⭐⭐⭐⭐ (4 stars)" },
  { value: "3", label: "⭐⭐⭐ (3 stars)" },
  { value: "2", label: "⭐⭐ (2 stars)" },
  { value: "1", label: "⭐ (1 star)" },
]

const sentimentFilters = [
  { value: "all", label: "All Sentiments", color: "bg-slate-100 text-slate-700" },
  { value: "positive", label: "Positive 😊", color: "bg-green-100 text-green-800" },
  { value: "neutral", label: "Neutral 😐", color: "bg-yellow-100 text-yellow-800" },
  { value: "negative", label: "Negative 😞", color: "bg-red-100 text-red-800" },
]

export default function FeedbackPage() {
  const [searchInput, setSearchInput] = useState("")
  const [ratingFilter, setRatingFilter] = useState("all")
  const [sentimentFilter, setSentimentFilter] = useState("all")
  const [dateRange, setDateRange] = useState("today")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // New state for dialog
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const adminKey = (window as any).ADMIN_KEY || localStorage.getItem('adminKey')

  // Fetch feedbacks from API

  const searchParams = useSearchParams()
  const restaurantId = searchParams.get("restaurantId")
  const restaurantName = searchParams.get("restaurantName")

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const token = localStorage.getItem("token")

        if (!restaurantId || !token) {
          console.error("Missing restaurantId or token")
          setIsLoading(false)
          return
        }

        const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/feedback/feedback_list?restaurantId=${restaurantId}`

        const response = await fetch(apiUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `JWT ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          const mappedData = data.map((item: any) => ({
            id: item._id,
            username: item.createdBy || "Unknown",
            customer: item.createdBy || "Unknown",
            rating: item.rating || 0,
            category: "General", // Default category since not in API
            category2: "General", // Default category since not in API
            comments: item.comment || "",
            orderId: item.orderId || "",
            date: item.createdAt
              ? new Date(item.createdAt).toISOString().split("T")[0]
              : new Date().toISOString().split("T")[0],
            isVisible: item.isVisible !== undefined ? item.isVisible : true, // Default to true if not provided
          }))
          setFeedbacks(mappedData)
        } else {
          console.error("Failed to fetch feedbacks")
        }
      } catch (error) {
        console.error("Error fetching feedbacks:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFeedbacks()

    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchFeedbacks, 10000)

    return () => clearInterval(interval)
  }, [restaurantId])

  const handleEditVisibility = async (feedback: Feedback) => {
    const token = localStorage.getItem("token")
    if (!token) {
      console.error("No token found in localStorage")
      alert("Authentication error. Please log in again.")
      return
    }

    const newVisibility = !feedback.isVisible
    const body = new URLSearchParams()
    body.append("isVisible", String(newVisibility))

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/feedback/hide_show_feedback/${feedback.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `JWT ${token}`,
          },
          body: body.toString(),
        }
      )

      if (response.ok) {
        // Update the state locally to reflect the change immediately
        setFeedbacks(prevFeedbacks =>
          prevFeedbacks.map(f => (f.id === feedback.id ? { ...f, isVisible: newVisibility } : f))
        )
      }
    } catch (error) {
      console.error("Error updating feedback visibility:", error)
    }
  }

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchInput, ratingFilter, sentimentFilter, dateRange])

  // Helper function to get date range for filtering
  const getDateRange = (filter: string) => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay())
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)

    switch (filter) {
      case "today":
        return {
          start: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
          end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59),
        }
      case "yesterday":
        return {
          start: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate()),
          end: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59),
        }
      case "tomorrow":
        return {
          start: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate()),
          end: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 23, 59, 59),
        }
      case "last7days":
        return {
          start: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7),
          end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59),
        }
      case "last30days":
        return {
          start: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 30),
          end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59),
        }
      case "last-month":
        const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1)
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 1)
        return {
          start: lastMonthStart,
          end: lastMonthEnd
        }
      case "custom":
        if (startDate && endDate) {
          const start = new Date(startDate)
          const end = new Date(endDate)
          end.setHours(23, 59, 59, 999) // Include the entire end date
          return { start, end }
        }
        return null
      default:
        return null
    }
  }

  // First filter the data
  const allFilteredFeedback = feedbacks.filter((feedback: Feedback) => {
    const matchesSearch =
      feedback.customer.toLowerCase().includes(searchInput.toLowerCase()) ||
      feedback.id.toString().includes(searchInput)
    const matchesRating = ratingFilter === "all" || feedback.rating.toString() === ratingFilter

    // Date filtering
    const matchesDate = (() => {
      if (dateRange === "all") return true
      const dateRangeObj = getDateRange(dateRange)
      if (!dateRangeObj) return true
      const feedbackDate = new Date(feedback.date)
      const normalizedFeedbackDate = new Date(feedbackDate.getFullYear(), feedbackDate.getMonth(), feedbackDate.getDate())
      const normalizedStart = new Date(dateRangeObj.start.getFullYear(), dateRangeObj.start.getMonth(), dateRangeObj.start.getDate())
      const normalizedEnd = new Date(dateRangeObj.end.getFullYear(), dateRangeObj.end.getMonth(), dateRangeObj.end.getDate())
      return normalizedFeedbackDate >= normalizedStart && normalizedFeedbackDate <= normalizedEnd
    })()

    return matchesSearch && matchesRating && matchesDate
  })

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentFeedback = allFilteredFeedback.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(allFilteredFeedback.length / itemsPerPage);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star key={index} className={`h-4 w-4 ${index < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
    ))
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "Positive":
        return <ThumbsUp className="h-3 w-3" />
      case "Negative":
        return <ThumbsDown className="h-3 w-3" />
      default:
        return <Meh className="h-3 w-3" />
    }
  }

  const getAverageRating = () => {
    const total = allFilteredFeedback.reduce((sum: number, feedback: Feedback) => sum + feedback.rating, 0)
    return allFilteredFeedback.length > 0 ? (total / allFilteredFeedback.length).toFixed(1) : "0.0"
  }

  const getSentimentCounts = () => {
    // Since we removed sentiment, we'll calculate based on rating
    const positive = allFilteredFeedback.filter((f: Feedback) => f.rating >= 4).length
    const neutral = allFilteredFeedback.filter((f: Feedback) => f.rating === 3).length
    const negative = allFilteredFeedback.filter((f: Feedback) => f.rating <= 2).length
    return { positive, neutral, negative }
  }

  const sentimentCounts = getSentimentCounts()

  const clearAllFilters = () => {
    setSearchInput("")
    setRatingFilter("all")
    setSentimentFilter("all")
    setDateRange("all")
  }

  const handleRefresh = () => {
    setSearchInput("")
    setRatingFilter("all")
    setSentimentFilter("all")
    setDateRange("all")
    setCurrentPage(1)
  }

  const hasActiveFilters = searchInput || ratingFilter !== "all" || sentimentFilter !== "all" || dateRange !== "all"

  // Filter Sidebar Component
  const FilterSidebar = () => (
    <div className="space-y-6">


      {/* Rating Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2 dark:text-slate-300">
          <Star className="h-4 w-4 " />
          Filter by Rating
        </Label>
        <div className="space-y-2">
          {ratingFilters.map((filter) => (
            <div key={filter.value} className="flex items-center space-x-2 ">
              <input
                type="radio"
                id={`rating-${filter.value}`}
                name="rating"
                value={filter.value}
                checked={ratingFilter === filter.value}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="w-4 h-4 text-[#6F42C1] border-gray-300 focus:ring-[#6F42C1]"
              />
              <Label htmlFor={`rating-${filter.value}`} className="dark:text-slate-300 text-sm text-slate-700 cursor-pointer">
                {filter.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Sentiment Filter */}
      <div className="space-y-3">
        <Label className="dark:text-slate-300 text-sm font-semibold text-slate-700 flex items-center gap-2">
          <ThumbsUp className="h-4 w-4" />
          Filter by Sentiment
        </Label>
        <div className="space-y-2">
          {sentimentFilters.map((filter) => (
            <div key={filter.value} className="flex items-center space-x-2">
              <input
                type="radio"
                id={`sentiment-${filter.value}`}
                name="sentiment"
                value={filter.value}
                checked={sentimentFilter === filter.value}
                onChange={(e) => setSentimentFilter(e.target.value)}
                className="w-4 h-4 text-[#6F42C1] border-gray-300 focus:ring-[#6F42C1]"
              />
              <Label htmlFor={`sentiment-${filter.value}`} className="dark:text-slate-300 text-sm text-slate-700 cursor-pointer">
                {filter.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Date Range Filter */}
      <div className="space-y-3">
        <Label className="dark:text-slate-300 text-sm font-semibold text-slate-700 flex items-center gap-2">
          <CalendarDays className="h-4 w-4" />
          Date Range
        </Label>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Dates</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="yesterday">Yesterday</SelectItem>
            <SelectItem value="tomorrow">Tomorrow</SelectItem>
            <SelectItem value="last7days">Last 7 days</SelectItem>
            <SelectItem value="last30days">Last 30 days</SelectItem>
            <SelectItem value="last-month">Last Month</SelectItem>
            <SelectItem value="custom">Custom Range</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {dateRange === "custom" && (
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2 dark:text-slate-300">
            <CalendarDays className="h-4 w-4" />
            Custom Date Range
          </Label>
          <div className="space-y-2">
            <Label htmlFor="startDate" className="dark:text-slate-300 text-sm text-slate-700">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate" className="dark:text-slate-300 text-sm text-slate-700">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full"
            />
          </div>
        </div>
      )}

      <Separator />

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="outline"
          onClick={clearAllFilters}
          className="w-full bg-transparent border-red-200 text-red-600 hover:bg-red-50"
        >
          <X className="h-4 w-4 mr-2" />
          Clear All Filters
        </Button>
      )}

      {/* Refresh Button */}
      <Button variant="outline" className="w-full bg-transparent" onClick={handleRefresh}>
        <RefreshCw className="h-4 w-4 mr-2" />
        Refresh Data
      </Button>
    </div>
  )

  return (
    <DashboardLayout activeItem="Feedback">
      {/* Main Content */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Left Filter Sidebar - Desktop Only */}
        <div className="hidden lg:block w-80 border-r border-border bg-card flex-shrink-0 h-full">
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Filter className="h-5 w-5 text-primary" />
              Filters & Options
            </h2>
          </div>
          <div className="p-6 overflow-y-auto h-[calc(100vh-8rem)]">
            <FilterSidebar />
          </div>
        </div>

        {/* Main Dashboard Content Area */}
        <div className="flex-1 overflow-y-auto">
          <main className="p-3 sm:p-6 space-y-4 sm:space-y-6 bg-background text-foreground min-h-full">
            {/* Page Header with Mobile Filter Button */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-2">
                <h1 className="text-xl sm:text-3xl font-bold text-foreground flex items-center gap-2 sm:gap-3">
                  <MessageSquare className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                  Customer Feedback
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground">Monitor customer satisfaction and improve your restaurant experience</p>
              </div>

              {/* Mobile Filter Button */}
              <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden bg-transparent">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filters
                    {hasActiveFilters && (
                      <Badge className="ml-2 bg-[#6F42C1] text-white text-xs px-1.5 py-0.5">
                        {
                          [ratingFilter !== "all", sentimentFilter !== "all", dateRange !== "all"].filter(
                            Boolean,
                          ).length
                        }
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                      <Filter className="h-5 w-5 text-[#6F42C1]" />
                      Filters & Options
                    </SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterSidebar />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
              <Card className="bg-background shadow-sm border border-border rounded-xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Average Rating</p>
                      <p className="text-2xl font-bold text-foreground">{getAverageRating()}</p>
                    </div>
                    <div className="p-2 bg-muted rounded-lg">
                      <Star className="h-5 w-5 text-yellow-600 fill-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-background shadow-sm border border-border rounded-xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Positive</p>
                      <p className="text-2xl font-bold text-green-600">{sentimentCounts.positive}</p>
                    </div>
                    <div className="p-2 bg-muted rounded-lg">
                      <ThumbsUp className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-background shadow-sm border border-border rounded-xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Neutral</p>
                      <p className="text-2xl font-bold text-yellow-600">{sentimentCounts.neutral}</p>
                    </div>
                    <div className="p-2 bg-muted rounded-lg">
                      <Meh className="h-5 w-5 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-background shadow-sm border border-border rounded-xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Negative</p>
                      <p className="text-2xl font-bold text-red-600">{sentimentCounts.negative}</p>
                    </div>
                    <div className="p-2 bg-muted rounded-lg">
                      <ThumbsDown className="h-5 w-5 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <Card className="bg-blue-50 border-blue-200 ">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-blue-800">
                      <Filter className="h-4 w-4" />
                      <span className="font-medium">Active Filters:</span>
                      {searchInput && <Badge variant="secondary">Search: "{searchInput}"</Badge>}
                      {ratingFilter !== "all" && <Badge variant="secondary">Rating: {ratingFilter} stars</Badge>}
                      {sentimentFilter !== "all" && <Badge variant="secondary">Sentiment: {sentimentFilter}</Badge>}
                      {dateRange !== "all" && <Badge variant="secondary">Date: {dateRange}</Badge>}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Clear All
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Search Bar */}
            <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by ownername or ID..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10 text-sm"
                />
              </div>
            </div>

            {/* Feedback Grid */}
            {currentFeedback.length > 0 ? (
              <>
                <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-4 sm:gap-6">
                  {currentFeedback.map((feedback: Feedback) => (
                  <Card
                    key={feedback.id}
                    className="bg-card shadow-sm border border-border rounded-xl hover:shadow-md transition-all duration-200 hover:scale-[1.02] dark:text-slate-300"
                  >
                    <CardContent className="p-3 sm:p-6">
                      {/* Header */}
                      <div className="flex flex-col gap-2 mb-3 sm:mb-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                            <AvatarFallback className="bg-[#6F42C1] text-white text-xs sm:text-sm">
                              {feedback.customer === "Anonymous"
                                ? "?"
                                : feedback.customer
                                    .split(" ")
                                    .map((n: string) => n[0])
                                    .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base truncate">{feedback.customer}</h3>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-300">
                              {feedback.date}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                          <Badge variant="outline" className="text-xs">{feedback.category}</Badge>
                          <Badge variant="outline" className="text-xs">{feedback.category2}</Badge>
                        </div>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center gap-2 mb-2 sm:mb-3">
                        <div className="flex items-center gap-1">{renderStars(feedback.rating)}</div>
                        <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">{feedback.rating}.0 out of 5</span>
                      </div>

                      {/* Comments */}
                      <p className="text-slate-700 leading-relaxed mb-3 sm:mb-4 break-words dark:text-slate-300 text-sm sm:text-base">{feedback.comments}</p>

                      {/* Order ID and Date */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 mb-3 sm:mb-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                        <span><strong>Order ID:</strong> {feedback.orderId}</span>
                        <span><strong>Date:</strong> {feedback.date}</span>
                      </div>

                      {/* Footer with Actions */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2 pt-3 border-t border-slate-100">
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 sm:flex-none text-blue-600 hover:text-blue-800 hover:bg-blue-50 text-xs sm:text-sm"
                            onClick={() => handleEditVisibility(feedback)}>
                            {feedback.isVisible ? "Hide" : "Show"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 sm:flex-none text-green-600 hover:text-green-800 hover:bg-green-50 text-xs sm:text-sm"
                            onClick={() => {
                              setSelectedFeedback(feedback)
                              setIsDialogOpen(true)
                            }}
                          >
                            View
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                </div>
                {/* Pagination Controls */}
                <div className="mt-6 flex justify-center items-center space-x-2">
                  <Button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} variant="outline" size="sm">Previous</Button>
                  <span className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</span>
                  <Button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} variant="outline" size="sm">Next</Button>
                </div>
              </>
            ) : (
              /* Empty State */
              <Card className="bg-card shadow-sm border-0 rounded-xl">
                <CardContent className="p-12">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Heart className="h-10 w-10 text-slate-400" />
                    </div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">No Feedback Found</h3>
                      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        {hasActiveFilters
                          ? "No feedback matches your current filters. Try adjusting your search criteria."
                          : "Your customers haven't left any feedback yet. Feedback from calls and interactions will appear here."}
                      </p>
                      {hasActiveFilters && (
                        <Button variant="outline" onClick={clearAllFilters} className="bg-transparent">
                          Clear All Filters
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
          </main>
        </div>
      </div>

      {/* Dialog for feedback details */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader className="flex items-center gap-4 pb-2 border-b border-muted">
            <div className="flex items-center justify-center rounded-full bg-[#6F42C1] h-12 w-12 text-white font-bold text-lg">
              {selectedFeedback?.customer
                .split(" ")
                .map((n: string) => n[0])
                .join("")}
            </div>
            <DialogTitle className="text-xl font-semibold">Feedback Details</DialogTitle>
            <DialogClose />
          </DialogHeader>
          {selectedFeedback && (
            <div className="grid grid-cols-1 gap-y-4 mt-4 text-sm text-foreground">
              <div className="flex items-center gap-2">
                <span className="font-medium">adminname:</span>
                <span className="truncate">{selectedFeedback.username}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Customer:</span>
                <span className="truncate">{selectedFeedback.customer}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Rating:</span>
                <span>{selectedFeedback.rating} / 5</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Category:</span>
                <span>{selectedFeedback.category} / {selectedFeedback.category2}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Order ID:</span>
                <span>{selectedFeedback.orderId}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Date:</span>
                <span>{selectedFeedback.date}</span>
              </div>
              <div className="p-4 bg-muted rounded-md border border-border text-foreground text-sm leading-relaxed">
                <p><span className="font-semibold">Comments:</span></p>
                <p>{selectedFeedback.comments}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </DashboardLayout>
  )
}
