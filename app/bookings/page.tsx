"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import axios from "axios"
import { API_BASE_URL } from "@/config"
import {
  Calendar,
  Filter,
  Plus,
  CalendarDays,
  RefreshCw,
  Search,
  Edit,
  Trash2,
  Eye,
} from "lucide-react"

import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"


export default function BookingsPage() {
  const [bookings, setBookings] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFilter, setDateFilter] = useState("today")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [bookingToDelete, setBookingToDelete] = useState<any | null>(null)
  const [bookingToView, setBookingToView] = useState<any | null>(null)
  const [bookingToEdit, setBookingToEdit] = useState<any | null>(null)
  const [editedBooking, setEditedBooking] = useState<any | null>(null)

  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1);

  const searchParams = useSearchParams()
  const restaurantId = searchParams.get('restaurant_id')
  const restaurantName = searchParams.get('restaurantName')

  const adminKey = (window as any).ADMIN_KEY || localStorage.getItem('adminKey')

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(false)
        if (restaurantId) {
          // Fetch bookings for specific restaurant
          const token = localStorage.getItem('token');
          if (!token) {
            console.error('No token found in localStorage');
            setLoading(false);
            return;
          }
          const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/booking/booking_list?restaurantId=${restaurantId}`, {
            headers: {
              'Authorization': `JWT ${token}`,
            },
          });
          setBookings(response.data);
        } else {
          // Fetch all bookings (original logic)
          const response = await fetch(`${API_BASE_URL}/admin/bookings`, {
            headers: {
              'x-admin-key': adminKey || '',
            }
          });
          if (response.ok) {
            const bookingsData = await response.json();
            setBookings(bookingsData);
          } else {
            console.error('Failed to fetch bookings');
          }
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();

    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchBookings, 5000);

    return () => clearInterval(interval);
  }, [restaurantId])

  // Form state removed as add booking functionality is removed

  // Helper function to get date range
  const getDateRange = (filter: string) => {
    const now = new Date()
    switch (filter) {
      case "today":
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        return { start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
      case "tomorrow":
        const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
        return { start: tomorrow, end: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000) }
      case "week":
        const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())
        const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000)
        return { start: weekStart, end: weekEnd }
      case "month":
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1)
        return { start: monthStart, end: monthEnd }
      case "last-month":
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1)
        return { start: lastMonthStart, end: lastMonthEnd }
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

  const handleDeleteClick = (booking: any) => {
    setBookingToDelete(booking)
  }

const handleDeleteConfirm = async () => {
    if (bookingToDelete) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found in localStorage');
          return;
        }
        const urlBase = process.env.NEXT_PUBLIC_API_BASE_URL || API_BASE_URL;
        const response = await fetch(`${urlBase}/booking/delete_booking/${bookingToDelete._id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `JWT ${token}`,
          },
        });
        if (response.ok) {
          setBookings(bookings.filter((booking) => booking._id !== bookingToDelete._id));
          setBookingToDelete(null);
        } else {
          console.error('Failed to delete booking');
        }
      } catch (error) {
        console.error('Error deleting booking:', error);
      }
    }
  }

  const handleDeleteCancel = () => {
    setBookingToDelete(null)
  }

  const handleViewClick = async (booking: any) => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found in localStorage');
      return;
    }
    try {
      setLoading(true);
      const urlBase = process.env.NEXT_PUBLIC_API_BASE_URL || API_BASE_URL;
      const response = await axios.post(
        `${urlBase}/booking/view_booking/${booking._id}`,
        {},
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `JWT ${token}`,
          },
        }
      );
      setBookingToView(response.data);
    } catch (error) {
      console.error('Error fetching booking details:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleViewClose = () => {
    setBookingToView(null)
  }

  // On clicking edit, set editedBooking with mapped fields to match form
  const handleEditClick = (booking: any) => {
    // Map booking fields to form fields expected by user task
    setBookingToEdit(booking)
    setEditedBooking({
      status: booking.status || '',
      tableNo: booking.tableNumber || booking.tableNo || '',
      customerPhone: booking.customerPhone || '',
      customerName: booking.customerName || '',
      noOfPerson: booking.noOfPerson || booking.partySize || '',
      bookingTime: booking.bookingTime || booking.time || '',
      _id: booking._id, // Keep id for reference
    })
  }

  // Close edit dialog and clear states
  const handleEditClose = () => {
    setBookingToEdit(null)
    setEditedBooking(null)
  }

  // Helper to convert object to x-www-form-urlencoded string
  function toUrlEncoded(obj: any) {
    return Object.keys(obj)
      .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k]))
      .join('&');
  }

  const handleEditSave = async () => {
    if (bookingToEdit && editedBooking) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found in localStorage');
          return;
        }

        // Prepare data according to user request with specified keys
        const formData = {
          status: editedBooking.status,
          tableNo: editedBooking.tableNo,
          customerPhone: editedBooking.customerPhone,
          customerName: editedBooking.customerName,
          noOfPerson: editedBooking.noOfPerson,
          bookingTime: editedBooking.bookingTime,
        };

        // Convert to x-www-form-urlencoded
        const bodyData = toUrlEncoded(formData);

        const urlBase = process.env.NEXT_PUBLIC_API_BASE_URL || API_BASE_URL;

        const response = await fetch(`${urlBase}/booking/update_booking/${bookingToEdit._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `JWT ${token}`,
          },
          body: bodyData,
        });

        if (response.ok) {
          // NOTE: Backend response format is unknown, handle minimally by refreshing bookings list
          const refreshResponse = await fetch(`${urlBase}/booking/booking_list?restaurantId=${restaurantId}`, {
            headers: {
              'Authorization': `JWT ${token}`,
            }
          });

          if (refreshResponse.ok) {
            const refreshedBookings = await refreshResponse.json();
            setBookings(refreshedBookings);
          } else {
            console.error('Failed to refresh bookings after update');
          }
        } else {
          console.error('Failed to update booking');
        }
      } catch (error) {
        console.error('Error updating booking:', error);
      } finally {
        handleEditClose();
      }
    }
  }

  // Update editedBooking state on input change for both input and select components
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEditedBooking((prev: any) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setEditedBooking((prev: any) => ({ ...prev, [name]: value }));
  };



  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking._id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.userId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.customerPhone?.includes(searchQuery)

    // Fix: Exclude bookings with past dates from pending status
    const bookingDate = new Date(booking.date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const isPastDate = bookingDate < today

    let matchesTab = false
    if (activeTab === "all") {
      matchesTab = true
    } else if (activeTab === "pending") {
      // Show only pending bookings with date today or future
      matchesTab = booking.status?.toLowerCase() === activeTab && !isPastDate
    } else {
      matchesTab = booking.status?.toLowerCase() === activeTab
    }

    const dateRange = getDateRange(dateFilter)
    const matchesDate = dateFilter === "all" || !dateRange || (() => {
      // Use createdAt for date filtering since that's what's displayed in the table
      const bookingDate = new Date(booking.createdAt)
      const normalizedBookingDate = new Date(bookingDate.getFullYear(), bookingDate.getMonth(), bookingDate.getDate())
      const normalizedStart = new Date(dateRange.start.getFullYear(), dateRange.start.getMonth(), dateRange.start.getDate())
      const normalizedEnd = new Date(dateRange.end.getFullYear(), dateRange.end.getMonth(), dateRange.end.getDate())
      return normalizedBookingDate >= normalizedStart && normalizedBookingDate < normalizedEnd
    })()

    return matchesSearch && matchesTab && matchesDate
  })

  // Pagination logic
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBookings = filteredBookings.slice(indexOfFirstItem, indexOfLastItem);

  // handleAddBooking removed as add booking functionality is removed

  const statusCounts = {
    all: bookings.length,
    confirmed: bookings.filter((b) => b.status === "Confirmed").length,
    pending: bookings.filter((b) => b.status === "Pending").length,
    cancelled: bookings.filter((b) => b.status === "Cancelled").length,
  }

  return (
    <DashboardLayout activeItem="Bookings">
      <main className="flex-1 space-y-4 sm:space-y-6 p-3 sm:p-6 bg-background text-foreground">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-xl sm:text-3xl font-bold text-foreground flex items-center gap-2 sm:gap-3">
              <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              {restaurantName ? `${restaurantName} - Bookings` : 'Table Bookings'}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">Manage restaurant reservations and table assignments</p>
          </div>

          {/* Add Booking button removed as per user request */}
          {/* Add Booking dialog removed as per user request */}
        </div>

        {/* Filters Section */}
        <Card className="bg-card shadow-sm border-0 rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Filter className="h-5 w-5 text-primary" />
              Search & Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="search" className="text-sm font-medium text-muted-foreground">
                  Search Bookings
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search by Restaurantname, Customer Name, or phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-background text-foreground border-border focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Date Range</Label>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger id="dateFilter" className="bg-background text-foreground border-border focus:ring-primary focus:border-primary">
                    <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background text-foreground border-border">
                    <SelectItem value="all">All Dates</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="tomorrow">Tomorrow</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="last-month">Last Month</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {dateFilter === "custom" && (
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Start Date</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-background text-foreground border-border focus:ring-primary focus:border-primary"
                  />
                </div>
              )}
              {dateFilter === "custom" && (
                <div className="space-y-2">
                  <Label className="text-muted-foreground">End Date</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-background text-foreground border-border focus:ring-primary focus:border-primary"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label className="text-muted-foreground">Actions</Label>
                <Button variant="outline" className="w-full bg-transparent border-border text-foreground hover:bg-primary hover:text-white dark:hover:bg-white dark:hover:text-black"  disabled={loading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 max-w-2xl">
            <TabsTrigger value="all">All ({statusCounts.all})</TabsTrigger>
            <TabsTrigger value="confirmed">Confirmed ({statusCounts.confirmed})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({statusCounts.pending})</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled ({statusCounts.cancelled})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <Card className="bg-card shadow-sm border-0 rounded-xl">
              <CardContent>
                {loading ? (
                  <p>Loading bookings...</p>
                ) : filteredBookings.length > 0 ? (
                  <>
                    {/* Desktop Table View */}
                    <div className="hidden lg:block overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted text-foreground">
                            <TableHead className="min-w-[120px]">Customer Name</TableHead>
                            <TableHead className="min-w-[100px]">Phone</TableHead>
                            <TableHead className="min-w-[60px]">Table</TableHead>
                            <TableHead className="min-w-[70px]">Time</TableHead>
                            <TableHead className="min-w-[90px]">Date</TableHead>
                            <TableHead className="min-w-[80px]">Status</TableHead>
                            <TableHead className="min-w-[80px]">Party Size</TableHead>
                            <TableHead className="min-w-[120px]">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {currentBookings.map((booking) => (
                            <TableRow key={booking._id} className="hover:bg-muted/50 text-foreground">
                              <TableCell>{booking.customerName}</TableCell>
                              <TableCell>{booking.customerPhone}</TableCell>
                              <TableCell>{booking.tableNo}</TableCell>
                              <TableCell>{booking.bookingTime}</TableCell>
                              <TableCell>{new Date(booking.createdAt).toLocaleDateString()}</TableCell>
                              <TableCell>{booking.status}</TableCell>
                              <TableCell>{booking.noOfPerson}</TableCell>
                              <TableCell className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  aria-label="View booking"
                                  onClick={() => handleViewClick(booking)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  aria-label="Edit booking"
                                  onClick={() => handleEditClick(booking)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  aria-label="Delete booking"
                                  onClick={() => handleDeleteClick(booking)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="lg:hidden space-y-3">
                      {currentBookings.map((booking) => (
                        <Card key={booking._id} className="bg-card dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 rounded-lg">
                          <CardContent className="p-3">
                            <div className="flex items-start justify-between mb-3">
                              <div className="min-w-0 flex-1">
                                <h3 className="font-semibold text-slate-900 dark:text-white truncate text-sm">{booking.userId}</h3>
                                <p className="text-xs text-slate-600 dark:text-slate-300 truncate">{booking.customerName}</p>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Table {booking.tableNo}</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  booking.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                                  booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {booking.status}
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                              <div>
                                <span className="font-medium text-slate-700 dark:text-slate-300">Phone:</span>
                                <span className="ml-1 text-slate-600 dark:text-slate-300 truncate block">{booking.customerPhone}</span>
                              </div>
                              <div>
                                <span className="font-medium text-slate-700 dark:text-slate-300">Time:</span>
                                <span className="ml-1 text-slate-600 dark:text-slate-300 truncate">{booking.bookingTime}</span>
                              </div>
                              <div>
                                <span className="font-medium text-slate-700 dark:text-slate-300">Date:</span>
                                <span className="ml-1 text-slate-600 dark:text-slate-300 truncate">{new Date(booking.createdAt).toLocaleDateString()}</span>
                              </div>
                              <div>
                                <span className="font-medium text-slate-700 dark:text-slate-300">Party Size:</span>
                                <span className="ml-1 text-slate-600 dark:text-slate-300">{booking.noOfPerson}</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="text-xs text-slate-500 dark:text-slate-400 truncate">ID: {booking._id}</span>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 w-8 p-0 hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-colors"
                                  onClick={() => handleViewClick(booking)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 w-8 p-0 hover:bg-green-500 hover:text-white hover:border-green-500 transition-colors"
                                  onClick={() => handleEditClick(booking)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 w-8 p-0 hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors"
                                  onClick={() => handleDeleteClick(booking)}
                                >
                                  <Trash2 className="h-4 w-4" />
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
                      <span className="text-sm text-muted-foreground">Page {currentPage} of {Math.ceil(filteredBookings.length / itemsPerPage)}</span>
                      <Button onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredBookings.length / itemsPerPage)))} disabled={currentPage === Math.ceil(filteredBookings.length / itemsPerPage)} variant="outline" size="sm">Next</Button>
                    </div>
                  </>
                ) : (
                  <p>No {restaurantId ? `${restaurantName || 'admin'} ` : ''}bookings found.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Delete Confirmation Dialog */}
      {bookingToDelete && (
        <AlertDialog open={!!bookingToDelete} onOpenChange={(open) => !open && handleDeleteCancel()}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the booking.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleDeleteCancel}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* View Booking Dialog */}
      {bookingToView && (
        <Dialog open={!!bookingToView} onOpenChange={(open) => !open && handleViewClose()}>
          <DialogContent className="max-w-md sm:max-w-lg lg:max-w-2xl mx-4 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 border-0 shadow-2xl">
            <DialogHeader className="pb-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center rounded-full bg-gradient-to-br from-[#6F42C1] to-[#8B5CF6] h-16 w-16 text-white font-bold text-xl shadow-lg">
                  {bookingToView.customerName
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .toUpperCase()}
                </div>
                <div className="flex-1">
                  <DialogTitle className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-1">
                    Booking Details
                  </DialogTitle>
                  <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                    ID: {bookingToView._id}
                  </p>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold mt-2 ${
                    bookingToView.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                    bookingToView.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {bookingToView.status}
                  </div>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4 mt-6 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">ID</Label>
                  <p className="text-sm text-slate-900 dark:text-white font-mono">{bookingToView._id}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">adminname</Label>
                  <p className="text-sm text-slate-900 dark:text-white">{bookingToView.username}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">Customer Name</Label>
                  <p className="text-sm text-slate-900 dark:text-white">{bookingToView.customerName}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">Phone</Label>
                  <p className="text-sm text-slate-900 dark:text-white">{bookingToView.customerPhone}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">Table</Label>
                  <p className="text-sm text-slate-900 dark:text-white">{bookingToView.tableNo || bookingToView.bookingId}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">Time</Label>
                  <p className="text-sm text-slate-900 dark:text-white">{bookingToView.bookingTime}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">Date</Label>
                  <p className="text-sm text-slate-900 dark:text-white">{new Date(bookingToView.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">Status</Label>
                  <p className="text-sm text-slate-900 dark:text-white">{bookingToView.status}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">Party Size</Label>
                  <p className="text-sm text-slate-900 dark:text-white">{bookingToView.noOfPerson}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">Created At</Label>
                  <p className="text-sm text-slate-900 dark:text-white">{bookingToView.createdAt}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
              <Button
                variant="outline"
                onClick={handleViewClose}
                className="px-6 py-2 text-sm font-medium"
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Booking Dialog */}
      {bookingToEdit && editedBooking && (
        <Dialog open={!!bookingToEdit} onOpenChange={(open) => !open && handleEditClose()}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Booking #{bookingToEdit._id}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customerName">Customer Name</Label>
                    <Input id="customerName" name="customerName" value={editedBooking.customerName || ''} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerPhone">Phone Number</Label>
                    <Input id="customerPhone" name="customerPhone" type="tel" value={editedBooking.customerPhone || ''} onChange={handleInputChange} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bookingTime">Booking Time</Label>
                    <Input id="bookingTime" name="bookingTime" type="text" value={editedBooking.bookingTime || ''} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="noOfPerson">Number of Guests</Label>
                    <Input id="noOfPerson" name="noOfPerson" type="number" value={editedBooking.noOfPerson || ''} onChange={handleInputChange} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tableNo">Table</Label>
                  <Input id="tableNo" name="tableNo" type="number" value={editedBooking.tableNo || ''} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={editedBooking.status || ''} 
                    onValueChange={(value) => handleSelectChange('status', value)}
                  >
                    <SelectTrigger id="status-select">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Confirmed">Confirmed</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleEditClose}>Cancel</Button>
              <Button onClick={handleEditSave}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

    </DashboardLayout>
  )
}
