"use client"

import { useState, useEffect, ReactNode } from "react"
import {
  Phone,
  Clock,
  Search,
  Filter,
  CalendarDays,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageSquare,
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  Play,
} from "lucide-react"

import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import React from "react"
import { API_BASE_URL } from "@/config"

type CallLog = {
  userRestaurantId: string
  callerName: string
  callerNumber: string
  callDuration: string | number
  callConversation: string
  callType: string
  purpose: string
  _id: string
  calledAt: string
  receiverNumber?: string
  status?: string
  restaurantDetails?: { restaurantName?: string }[]
  createdAt?: string
}

export default function CallLogsPage() {
  const [callLogs, setCallLogs] = useState<CallLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFilter, setDateFilter] = useState("today")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [outcomeFilter, setOutcomeFilter] = useState("all")
  const [callTypeFilter, setCallTypeFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchCallLogs = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const restaurantId = urlParams.get('restaurant_id')
        const token = localStorage.getItem('token');

        if (!restaurantId || !token) {
          console.error('Missing restaurantId or token');
          setLoading(false);
          return;
        }

        const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/calllog/calllog_list?restaurant_id=${restaurantId}`;

        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `JWT ${token}`,
          },
        });

      if (response.ok) {
        const data = await response.json();
        const mappedData = data.map((item: any) => ({
          userRestaurantId: item.userRestaurantId,
          callerName: item.callerName,
          callerNumber: item.callerNumber,
          callDuration: item.callDuration,
          callConversation: item.callConversation,
          callType: item.callType,
          purpose: item.purpose,
          _id: item._id,
          calledAt: item.calledAt,
        }));
        setCallLogs(mappedData);
      } else {
        console.error('Failed to fetch call logs');
      }
      } catch (error) {
        console.error('Error fetching call logs:', error);
        setError('Failed to load call logs');
      } finally {
        setLoading(false);
      }
    };

    fetchCallLogs();

    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchCallLogs, 10000);

    return () => clearInterval(interval);
  }, [])





  const getCallIcon = (callType: string) => callType === "Incoming" ? PhoneIncoming : PhoneOutgoing

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed": return "bg-green-100 text-green-800 hover:bg-green-100"
      case "Missed": return "bg-red-100 text-red-800 hover:bg-red-100"
      default: return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed": return CheckCircle
      case "Missed": return XCircle
      default: return MessageSquare
    }
  }

  const getDateRange = (filter: string) => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay())
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)

    switch (filter) {
      case "today":
        return {
          start: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
          end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59)
        }
      case "yesterday":
        return {
          start: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate()),
          end: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59)
        }
      case "week":
        return {
          start: weekStart,
          end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59)
        }
      case "month":
        return {
          start: monthStart,
          end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59)
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

  const filteredCalls = callLogs.filter((call: CallLog) => {
    const matchesSearch =
      (call._id && call._id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (call.callerNumber && call.callerNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (call.receiverNumber && call.receiverNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (call.restaurantDetails && call.restaurantDetails[0]?.restaurantName && call.restaurantDetails[0].restaurantName.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesStatus = outcomeFilter === "all" || (call.status && call.status.toLowerCase().includes(outcomeFilter.toLowerCase()))

    // Date filtering (using createdAt for date)
    const matchesDate = (() => {
      if (dateFilter === "all") return true
      const dateRange = getDateRange(dateFilter)
      if (!dateRange) return true

      const callDate = new Date(call.createdAt ?? "")
      const normalizedCallDate = new Date(callDate.getFullYear(), callDate.getMonth(), callDate.getDate())
      const normalizedStart = new Date(dateRange.start.getFullYear(), dateRange.start.getMonth(), dateRange.start.getDate())
      const normalizedEnd = new Date(dateRange.end.getFullYear(), dateRange.end.getMonth(), dateRange.end.getDate())
      return normalizedCallDate >= normalizedStart && normalizedCallDate <= normalizedEnd
    })()

    return matchesSearch && matchesStatus && matchesDate
  })

  // Pagination logic
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCalls = filteredCalls.slice(indexOfFirstItem, indexOfLastItem);

  const getCallStats = () => {
    const totalCalls = filteredCalls.length
    const successfulCalls = filteredCalls.filter(
      (call) => call.status === "Completed",
    ).length
    const totalTables = new Set(filteredCalls.map(call => call.callerNumber)).size // Using callerNumber as unique identifier

    return {
      total: totalCalls,
      successful: successfulCalls,
      successRate: totalCalls > 0 ? Math.round((successfulCalls / totalCalls) * 100) : 0,
      tables: totalTables,
    }
  }

  const stats = getCallStats()

  return (
    <DashboardLayout activeItem="Call Logs">
      <main className="flex-1 space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6 bg-background text-foreground">
        {/* Page Header */}
        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-2 sm:gap-3">
            <Phone className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-[#6F42C1]" />
            Call Logs & AI Analysis
          </h1>
          <p className="text-xs sm:text-sm lg:text-base text-muted-foreground">Monitor all customer interactions and AI performance</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          <Card className="bg-card dark:bg-slate-900 shadow-md border-0 rounded-xl transition-shadow hover:shadow-lg duration-300 ease-in-out">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Calls</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">{stats.total}</p>
                </div>
                <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
                  <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card dark:bg-slate-900 shadow-md border-0 rounded-xl transition-shadow hover:shadow-lg duration-300 ease-in-out">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Callers</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">{stats.tables}</p>
                </div>
                <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card dark:bg-slate-900 shadow-md border-0 rounded-xl transition-shadow hover:shadow-lg duration-300 ease-in-out">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Successful</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">{stats.successful}</p>
                </div>
                <div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
         </Card>

          <Card className="bg-card dark:bg-slate-900 shadow-md border-0 rounded-xl transition-shadow hover:shadow-lg duration-300 ease-in-out">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Success Rate</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">{stats.successRate}%</p>
                </div>
                <div className="p-1.5 sm:p-2 bg-orange-100 rounded-lg">
                  <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters Section */}
        <Card className="bg-card shadow-sm border-0 rounded-xl mx-0">
          <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground text-base sm:text-lg lg:text-xl">
              <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-[#6F42C1]" />
              Search & Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {/* Search */}
              <div className="space-y-2">
                <Label htmlFor="search" className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Search Calls
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search by RestaurantName, caller, or receiver..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 text-xs sm:text-sm"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <Label htmlFor="outcomeFilter" className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Call Status
                </Label>
                <Select value={outcomeFilter} onValueChange={setOutcomeFilter}>
                  <SelectTrigger id="outcomeFilter" className="text-xs sm:text-sm">
                    <CheckCircle className="h-4 w-4 mr-2 text-slate-500" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="missed">Missed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Filter */}
              <div className="space-y-2">
                <Label htmlFor="dateFilter" className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Date Range
                </Label>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger id="dateFilter" className="text-xs sm:text-sm">
                    <CalendarDays className="h-4 w-4 mr-2 text-slate-500" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Dates</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="yesterday">Yesterday</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="last-month">Last Month</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {dateFilter === "custom" && (
                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm font-medium text-muted-foreground">Start Date</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="text-xs sm:text-sm"
                  />
                </div>
              )}
              {dateFilter === "custom" && (
                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm font-medium text-muted-foreground">End Date</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="text-xs sm:text-sm"
                  />
                </div>
              )}

              {/* Actions */}
              <div className="space-y-2">
                <Label className="text-xs sm:text-sm font-medium text-muted-foreground">Actions</Label>
                <Button
                  variant="outline"
                  className="w-full bg-transparent text-xs sm:text-sm"
                  onClick={() => {
                    setSearchQuery("")
                    setOutcomeFilter("all")
                    setCallTypeFilter("all")
                    setDateFilter("today")
                    setStartDate("")
                    setEndDate("")
                  }}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call Logs Table */}
        <Card className="bg-card shadow-sm border-0 rounded-xl mx-0">
          <CardHeader>
            <div className="flex items-center justify-between">
          <CardTitle className="text-foreground text-base sm:text-lg lg:text-xl">Call History</CardTitle>
              <Badge variant="secondary" className="bg-muted text-muted-foreground text-xs sm:text-sm">
                {filteredCalls.length} calls found
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {filteredCalls.length > 0 ? (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <Table className=" bg-card/50 rounded-lg">
                    <TableHeader>
                      <TableRow className="border-border bg-muted">
                       
                        <TableHead className="font-semibold text-muted-foreground min-w-[120px]">Caller Name</TableHead>
                        <TableHead className="font-semibold text-muted-foreground min-w-[120px]">Caller Number</TableHead>
                        <TableHead className="font-semibold text-muted-foreground min-w-[100px]">Call Duration</TableHead>
                        <TableHead className="font-semibold text-muted-foreground min-w-[150px]">Call Conversation</TableHead>
                        <TableHead className="font-semibold text-muted-foreground min-w-[100px]">Call Type</TableHead>
                        <TableHead className="font-semibold text-muted-foreground min-w-[100px]">Purpose</TableHead>
                       
                        <TableHead className="font-semibold text-muted-foreground min-w-[120px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentCalls.map((call, index) => (
                    <TableRow key={`${call._id}-${index}`} className="border-border transition-colors">

                          <TableCell className="text-xs sm:text-sm">{call.callerName}</TableCell>
                          <TableCell className="text-xs sm:text-sm">{call.callerNumber}</TableCell>
                          <TableCell className="text-xs sm:text-sm">{call.callDuration}</TableCell>
                          <TableCell className="text-xs sm:text-sm truncate max-w-[150px]" title={call.callConversation}>{call.callConversation}</TableCell>
                          <TableCell className="text-xs sm:text-sm">{call.callType}</TableCell>
                          <TableCell className="text-xs sm:text-sm">{call.purpose}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 sm:gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 px-2 sm:px-3 bg-transparent text-xs sm:text-sm"
                              onClick={() => alert(`Playing call ${call._id}`)}
                            >
                              <Play className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-3">
              {currentCalls.map((call, index) => (
                    <Card key={`${call._id}-${index}`} className="bg-card dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 rounded-lg">
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between mb-3">
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-slate-900 dark:text-white truncate text-sm">{call.callerName}</h3>
                            <p className="text-xs text-slate-600 dark:text-slate-300 truncate">{call.callerNumber}</p>
                          </div>
                          <Badge className="border-0 font-medium flex items-center gap-1 flex-shrink-0 text-xs">
                            {call.callType}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                          <div>
                            <span className="font-medium text-slate-700 dark:text-slate-300">Call Duration:</span>
                            <span className="ml-1 text-slate-600 dark:text-slate-300 truncate">{call.callDuration}</span>
                          </div>
                          <div>
                            <span className="font-medium text-slate-700 dark:text-slate-300">Conversation:</span>
                            <span className="ml-1 text-slate-600 dark:text-slate-300 truncate block" title={call.callConversation}>{call.callConversation}</span>
                          </div>
                          <div>
                            <span className="font-medium text-slate-700 dark:text-slate-300">Purpose:</span>
                            <span className="ml-1 text-slate-600 dark:text-slate-300 truncate">{call.purpose}</span>
                          </div>
                          <div>
                            <span className="font-medium text-slate-700 dark:text-slate-300">Called At:</span>
                            <span className="ml-1 text-slate-600 dark:text-slate-300 truncate block">{new Date(call.calledAt).toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500 dark:text-slate-400 truncate">ID: {call._id}</span>
                          <div className="flex items-center gap-1 flex-shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0 hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-colors"
                            onClick={() => alert(`Playing call ${call._id}`)}
                          >
                            <Play className="h-4 w-4" />
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
                  <span className="text-sm text-muted-foreground">Page {currentPage} of {Math.ceil(filteredCalls.length / itemsPerPage)}</span>
                  <Button onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredCalls.length / itemsPerPage)))} disabled={currentPage === Math.ceil(filteredCalls.length / itemsPerPage)} variant="outline" size="sm">Next</Button>
                </div>
              </>
            ) : (
              /* Empty State */
              <div className="text-center py-8 sm:py-12 lg:py-16">
                <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 lg:mb-6">
                  <Phone className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-muted-foreground" />
                </div>
                <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-foreground mb-2">No Call Logs Found</h3>
                <p className="text-xs sm:text-sm lg:text-base text-muted-foreground mb-4 sm:mb-6 max-w-md mx-auto">
                  {searchQuery || outcomeFilter !== "all" || callTypeFilter !== "all"
                    ? "No calls match your current filters. Try adjusting your search criteria."
                    : "No calls have been recorded yet. Call logs will appear here once customers start calling."}
                </p>
                {(searchQuery || outcomeFilter !== "all" || callTypeFilter !== "all") && (
                  <Button
                    variant="outline"
                    className="text-xs sm:text-sm"
                    onClick={() => {
                      setSearchQuery("")
                      setOutcomeFilter("all")
                      setCallTypeFilter("all")
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

      </main>
    </DashboardLayout>
  )
}