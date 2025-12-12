"use client"

import { useState, useEffect } from "react"
import {
  ShoppingBag,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  CalendarDays,
  RefreshCw,
  Phone,
  MessageSquare,
  User,
  DollarSign,
  Package,
  Truck,
  ChefHat,
  Eye,
  Edit,
  Trash2,
} from "lucide-react"
import { API_BASE_URL } from "@/config"
import axios from "axios"

import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
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

const getLocalDateString = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFilter, setDateFilter] = useState("today")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [sourceFilter, setSourceFilter] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)
  const [orderToDelete, setOrderToDelete] = useState<any | null>(null)
  const [orderToEdit, setOrderToEdit] = useState<any | null>(null)
  const [editedOrder, setEditedOrder] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [userIdFilter, setUserIdFilter] = useState<string | null>(null)
  const [restaurantName, setRestaurantName] = useState<string | null>(null)
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [menuCategories, setMenuCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [selectedMenuItem, setSelectedMenuItem] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // New state to track loading of view order API
  const [viewLoading, setViewLoading] = useState(false);

  const adminKey = (window as any).ADMIN_KEY || localStorage.getItem('adminKey')

  // New handler for View button click to fetch order details from API
  const handleViewClick = async (id: string) => {
    try {
      setViewLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found in localStorage');
        setViewLoading(false);
        return;
      }
      const url = `${API_BASE_URL}/order/view_order/${id}`;
      const response = await axios.post(url, null, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `JWT ${token}`,
        },
      });
      setSelectedOrder(response.data);
    } catch (error) {
      console.error('Error fetching order details:', error);
    } finally {
      setViewLoading(false);
    }
  };

useEffect(() => {
  const fetchOrders = async () => {
    try {
      setLoading(false)
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found in localStorage');
        setLoading(false);
        return;
      }
      const url = `${API_BASE_URL}/order/order_list${userIdFilter ? `?restaurant_id=${userIdFilter}` : ''}`;
      const response = await axios.get(url, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `JWT ${token}`,
        },
      });
      // Sort orders by createdAt descending (newest first)
      const sortedOrders = response.data.sort((a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setOrders(sortedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  fetchOrders();

  // Auto-refresh every 10 seconds
  const interval = setInterval(fetchOrders, 10000);

  return () => clearInterval(interval);
}, [userIdFilter])

  // Helper function to get date range
  const getDateRange = (filter: string) => {
    const now = new Date()
    switch (filter) {
      case "today":
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        return { start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
      case "yesterday":
        const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
        return { start: yesterday, end: new Date(yesterday.getTime() + 24 * 60 * 60 * 1000) }
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

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order._id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.orderId?.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerPhone?.includes(searchQuery)

    const matchesTab = activeTab === "all" || order.status.toLowerCase().replace(" ", "-") === activeTab
    const matchesSource = sourceFilter === "all" || order.source.toLowerCase().includes(sourceFilter.toLowerCase())

    const dateRange = getDateRange(dateFilter)
    const orderDate = new Date(order.createdAt)
    const matchesDate = dateFilter === "all" || !dateRange || (() => {
      const normalizedOrderDate = new Date(orderDate.getFullYear(), orderDate.getMonth(), orderDate.getDate())
      const normalizedStart = new Date(dateRange.start.getFullYear(), dateRange.start.getMonth(), dateRange.start.getDate())
      const normalizedEnd = new Date(dateRange.end.getFullYear(), dateRange.end.getMonth(), dateRange.end.getDate())
      return normalizedOrderDate >= normalizedStart && normalizedOrderDate < normalizedEnd
    })()

    const matchesUserId = !userIdFilter || order.userRestaurantId === userIdFilter

    return matchesSearch && matchesTab && matchesSource && matchesDate && matchesUserId
  })

  // Pagination logic
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);

  // Calculate status counts based on current filters (excluding tab filter)
  const filteredOrdersForCounts = orders.filter((order) => {
    const matchesSearch =
      order._id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.orderId?.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerPhone?.includes(searchQuery)

    const matchesSource = sourceFilter === "all" || order.source.toLowerCase().includes(sourceFilter.toLowerCase())

    const dateRange = getDateRange(dateFilter)
    const orderDate = new Date(order.createdAt)
    const matchesDate = dateFilter === "all" || !dateRange || (() => {
      const normalizedOrderDate = new Date(orderDate.getFullYear(), orderDate.getMonth(), orderDate.getDate())
      const normalizedStart = new Date(dateRange.start.getFullYear(), dateRange.start.getMonth(), dateRange.start.getDate())
      const normalizedEnd = new Date(dateRange.end.getFullYear(), dateRange.end.getMonth(), dateRange.end.getDate())
      return normalizedOrderDate >= normalizedStart && normalizedOrderDate < normalizedEnd
    })()

    const matchesUserId = !userIdFilter || order.userRestaurantId === userIdFilter

    return matchesSearch && matchesSource && matchesDate && matchesUserId
  })

  const statusCounts = {
    all: filteredOrdersForCounts.length,
    preparing: filteredOrdersForCounts.filter((o) => o.status === "Preparing").length,
    "out-for-delivery": filteredOrdersForCounts.filter((o) => o.status === "Out for Delivery").length,
    delivered: filteredOrdersForCounts.filter((o) => o.status === "Delivered").length,
    cancelled: filteredOrdersForCounts.filter((o) => o.status === "Cancelled").length,
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Preparing":
        return ChefHat;
      case "Out for Delivery":
        return Truck;
      case "Delivered":
        return CheckCircle;
      case "Cancelled":
        return XCircle;
      default:
        return Clock;
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Preparing":
        return "bg-yellow-100 text-yellow-800";
      case "Out for Delivery":
        return "bg-blue-100 text-blue-800";
      case "Delivered":
        return "bg-green-100 text-green-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "UPI":
        return "📱"
      case "Card":
        return "💳"
      case "Cash":
        return "💵"
      default:
        return "💰"
    }
  }

  const getTotalRevenue = () => {
    return filteredOrders.reduce((sum, order) => sum + order.totalBill, 0)
  }

  const handleDeleteClick = (order: any) => {
    setOrderToDelete(order)
  }

const handleDeleteConfirm = async () => {
    if (orderToDelete) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/order/delete_order/${orderToDelete._id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `JWT ${token}`,
          },
        });
        if (response.ok) {
          setOrders(orders.filter((order) => order._id !== orderToDelete._id));
          setOrderToDelete(null);
        } else {
          console.error('Failed to delete order');
        }
      } catch (error) {
        console.error('Error deleting order:', error);
      }
    }
  }

  const handleDeleteCancel = () => {
    setOrderToDelete(null)
  }

  const handleEditClick = (order: any) => {
    setOrderToEdit(order)
    setEditedOrder({...order})
  }

  const handleEditClose = () => {
    setOrderToEdit(null)
    setEditedOrder(null)
  }

  const handleEditSave = async () => {
    if (!orderToEdit || !editedOrder) return;

    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      params.append('userRestaurantId', editedOrder.userRestaurantId);
      params.append('status', editedOrder.status);
      params.append('totalBill', editedOrder.totalBill.toString());
      params.append('tableNumber', editedOrder.tableNumber);
      params.append('customerPhone', editedOrder.customerPhone);
      params.append('customerName', editedOrder.customerName);

      editedOrder.orderedItems.forEach((item: any, index: number) => {
        params.append(`orderedItems[${index}][itemName]`, item.itemName || item["'itemName'"]);
        params.append(`orderedItems[${index}][qty]`, item.qty || item["'qty'"]);
        params.append(`orderedItems[${index}][price]`, item.price);
        params.append(`orderedItems[${index}][menuid]`, item.menuId || item._id);
      });

      const response = await axios.put(`${API_BASE_URL}/order/update_order/${orderToEdit._id}`, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `JWT ${token}`,
        },
      });

      const updatedOrder = response.data;
      setOrders(orders.map(order => order._id === orderToEdit._id ? { ...updatedOrder, ...response.data.order } : order));
      handleEditClose();
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const newValue = name === 'totalBill' ? (parseFloat(value) || 0) : value;
    setEditedOrder((prev: any) => ({ ...prev, [name]: newValue }));
  }

  const handleItemQuantityChange = (itemIndex: number, change: number) => {
    if (!editedOrder) return;

    const updatedItems = [...editedOrder.orderedItems];
    const itemToUpdate = updatedItems[itemIndex];

    if (!itemToUpdate) return;

    const currentQty = parseInt(String(itemToUpdate.qty || itemToUpdate["'qty'"] || 0), 10);
    const newQty = currentQty + change; // This will now perform correct math

    if (newQty <= 0) {
      // If quantity becomes 0 or less, remove the item
      handleItemDelete(itemIndex);
    } else {
      updatedItems[itemIndex] = { ...itemToUpdate, qty: newQty };
      recalculateTotalBill(updatedItems);
    }
  };

  const handleItemDelete = (itemIndex: number) => {
    if (!editedOrder) return;
    const updatedItems = editedOrder.orderedItems.filter((_: any, index: number) => index !== itemIndex);
    recalculateTotalBill(updatedItems);
  };

  const recalculateTotalBill = (items: any[]) => {
    let newTotalBill = items.reduce((total, item) => {
      const price = parseFloat(item.price) || 0;
      const qty = parseInt(item.qty || item["'qty'"], 10) || 0;
      return total + (price * qty);
    }, 0);

    // Ensure totalBill is never NaN
    setEditedOrder((prev: any) => ({ ...prev, orderedItems: items, totalBill: isNaN(newTotalBill) ? 0 : newTotalBill }));
  };

  const handleAddItemToOrder = () => {
    if (!editedOrder || !selectedMenuItem) return;

    const itemToAdd = menuItems.find(item => item._id === selectedMenuItem);
    if (!itemToAdd) return;

    const existingItemIndex = editedOrder.orderedItems.findIndex((item: any) => (item.menuId || item._id) === itemToAdd._id);

    let updatedItems;
    if (existingItemIndex > -1) {
      // Item already exists, increment quantity
      updatedItems = [...editedOrder.orderedItems];
      const currentQty = updatedItems[existingItemIndex].qty || updatedItems[existingItemIndex]["'qty'"] || 0;
      updatedItems[existingItemIndex] = { ...updatedItems[existingItemIndex], qty: currentQty + 1 };
    } else {
      // Add new item
      updatedItems = [...editedOrder.orderedItems, { ...itemToAdd, qty: 1, menuId: itemToAdd._id }];
    }

    recalculateTotalBill(updatedItems);
    resetAddItemState();
  };

  const fetchMenuCategories = async () => {
    if (!editedOrder) return;
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      params.append('restaurant_id', editedOrder.userRestaurantId);

      const response = await axios.post(`${API_BASE_URL}/menucategory/menucategory_list`, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `JWT ${token}`,
        },
      });
      setMenuCategories(response.data);
      setIsAddingItem(true);
    } catch (error) {
      console.error('Error fetching menu categories:', error);
    }
  };

  const resetAddItemState = () => {
    setIsAddingItem(false);
    setSelectedCategory(null);
    setMenuItems([]);
    setSelectedMenuItem(null);
  };


  return (
    <DashboardLayout activeItem="Orders">
      <main className="flex-1 space-y-4 sm:space-y-6 bg-background text-foreground">
        {/* Page Header */}
        <div className="space-y-2 px-2 sm:px-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-2 sm:gap-3">
            <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-primary flex-shrink-0" />
            <span className="truncate">Order Management</span>
          </h1>
          <p className="text-xs sm:text-sm lg:text-base text-muted-foreground">Track and manage all customer orders in real-time</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 px-2 sm:px-0">
          <Card className="bg-card dark:bg-slate-900 shadow-md border-0 rounded-xl transition-shadow hover:shadow-lg duration-300 ease-in-out">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold text-foreground">{filteredOrders.length}</p>
                </div>
                <div className="p-2 bg-muted rounded-lg">
                  <ShoppingBag className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card dark:bg-slate-900 shadow-md border-0 rounded-xl transition-shadow hover:shadow-lg duration-300 ease-in-out">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Revenue</p>
                  <p className="text-2xl font-bold text-foreground">₹{getTotalRevenue().toLocaleString()}</p>
                </div>
                <div className="p-2 bg-muted rounded-lg">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card dark:bg-slate-900 shadow-md border-0 rounded-xl transition-shadow hover:shadow-lg duration-300 ease-in-out">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Preparing</p>
                  <p className="text-2xl font-bold text-yellow-600">{statusCounts.preparing}</p>
                </div>
                <div className="p-2 bg-muted rounded-lg">
                  <ChefHat className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card dark:bg-slate-900 shadow-md border-0 rounded-xl transition-shadow hover:shadow-lg duration-300 ease-in-out">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Out for Delivery</p>
                  <p className="text-2xl font-bold text-blue-600">{statusCounts["out-for-delivery"]}</p>
                </div>
                <div className="p-2 bg-muted rounded-lg">
                  <Truck className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters Section */}
        <Card className="bg-card shadow-sm border-0 rounded-xl mx-2 sm:mx-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              Search & Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Search */}
              <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                <Label htmlFor="search" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Search Orders
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-400" />
                  <Input
                    id="search"
                    placeholder="Search by ID, name, or phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Date Filter */}
              <div className="space-y-2">
                <Label htmlFor="dateFilter" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Date Range
                </Label>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger id="dateFilter">
                    <CalendarDays className="h-4 w-4 mr-2 text-slate-500 dark:text-slate-400" />
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
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Start Date</Label>
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
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">End Date</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-background text-foreground border-border focus:ring-primary focus:border-primary"
                  />
                </div>
              )}

              {/* Actions */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Actions</Label>
                <Button variant="outline" className="w-full bg-transparent" disabled={loading} onClick={() => window.location.reload()}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 max-w-full lg:max-w-3xl h-auto p-1 mx-2 sm:mx-0">
            <TabsTrigger value="all" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <span className="hidden sm:inline">All</span>
              <span className="sm:hidden">All</span>
              <Badge variant="secondary" className="bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 text-xs">
                {statusCounts.all}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="preparing" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <span className="hidden sm:inline">Preparing</span>
              <span className="sm:hidden">Prep</span>
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 text-xs">
                {statusCounts.preparing}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="out-for-delivery" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <span className="hidden sm:inline">Out for Delivery</span>
              <span className="sm:hidden">Out</span>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 text-xs">
                {statusCounts["out-for-delivery"]}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="delivered" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <span className="hidden sm:inline">Delivered</span>
              <span className="sm:hidden">Done</span>
              <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-xs">
                {statusCounts.delivered}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="cancelled" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <span className="hidden sm:inline">Cancelled</span>
              <span className="sm:hidden">Cancel</span>
              <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 text-xs">
                {statusCounts.cancelled}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4 sm:mt-6">
            <Card className="bg-card shadow-sm border-0 rounded-xl mx-2 sm:mx-0">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <CardTitle className="text-base sm:text-lg lg:text-xl text-slate-900 dark:text-white">
                    {userIdFilter && restaurantName
                      ? `${restaurantName} - Orders`
                      : userIdFilter
                      ? `Orders for Admin ${userIdFilter}`
                      : activeTab === "all"
                      ? "All Orders"
                      : `${activeTab
                          .split("-")
                          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                          .join(" ")} Orders`}
                  </CardTitle>
                  <Badge variant="secondary" className="bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 w-fit text-xs sm:text-sm">
                    {filteredOrders.length} {userIdFilter ? `orders for ${restaurantName || 'this admin'}` : 'orders found'}
                  </Badge>
                </div>
              </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 sm:py-12 lg:py-16 px-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 lg:mb-6 animate-spin">
                  <RefreshCw className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-slate-400" />
                </div>
                <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-slate-900 dark:text-white mb-2">Loading Orders...</h3>
                <p className="text-xs sm:text-sm lg:text-base text-slate-500 dark:text-slate-400">Please wait while we fetch the order data.</p>
              </div>
            ) : filteredOrders.length > 0 ? (
                  <>
                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted  border-slate-200">
                           
                            <TableHead className="font-semibold text-slate-700 dark:text-slate-300 min-w-[100px]">Order ID</TableHead>
                            <TableHead className="font-semibold text-slate-700 dark:text-slate-300 min-w-[120px]">Customer</TableHead>
                            <TableHead className="font-semibold text-slate-700 dark:text-slate-300 min-w-[150px]">Items</TableHead>
                            <TableHead className="font-semibold text-slate-700 dark:text-slate-300 min-w-[80px]">Total</TableHead>
                            <TableHead className="font-semibold text-slate-700 dark:text-slate-300 min-w-[120px]">Status</TableHead>
                            <TableHead className="font-semibold text-slate-700 dark:text-slate-300 min-w-[80px]">Table</TableHead>
                            <TableHead className="font-semibold text-slate-700 dark:text-slate-300 min-w-[100px]">Date</TableHead>
                            <TableHead className="font-semibold text-slate-700 dark:text-slate-300 min-w-[180px]">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {currentOrders.map((order) => {
                            const StatusIcon = getStatusIcon(order.status);
                            const statusColor = getStatusColor(order.status);
                            return (
                              <TableRow key={order._id} className="border-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                              
                                <TableCell className="font-semibold text-slate-900 dark:text-white">{order.orderId}</TableCell>
                                <TableCell className="font-medium text-slate-900 dark:text-white">{order.customerName}</TableCell>
                                <TableCell className="text-sm text-slate-500 dark:text-slate-300 max-w-32 truncate">{order.orderedItems.map((item: any) => `${item.itemName || item["'itemName'"]} (${item.qty || item["'qty'"]})`).join(", ")}</TableCell>
                                <TableCell className="font-semibold text-slate-900 dark:text-white">₹{order.totalBill}</TableCell>
                                <TableCell>
                                  <Badge
                                    className={`${statusColor} border-0 font-medium flex items-center gap-1 w-fit`}
                                    style={{ transition: "background-color 0.3s ease" }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.backgroundColor = "#ffffff";
                                      e.currentTarget.style.color = "#000000";
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.backgroundColor = "";
                                      e.currentTarget.style.color = "";
                                    }}
                                  >
                                    <StatusIcon className="h-3 w-3" />
                                    {order.status === "true" ? "Preparing" : order.status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-sm text-slate-500 dark:text-slate-300">{order.tableNumber}</TableCell>
                                <TableCell className="text-sm text-slate-500 dark:text-slate-300">{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell>
                                <div className="flex flex-col gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 px-2 w-full hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-colors bg-transparent"
                                    onClick={() => handleEditClick(order)}
                                  >
                                    <Edit className="h-4 w-4 mr-1" />
                                    Edit
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 px-2 w-full hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors bg-transparent"
                                    onClick={() => handleDeleteClick(order)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Delete
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 px-2 w-full hover:bg-[#6F42C1] hover:text-white hover:border-[#6F42C1] transition-colors bg-transparent"
                                    onClick={() => handleViewClick(order._id)}
                                  >
                                    <Eye className="h-4 w-4 mr-1" />
                                    View
                                  </Button>
                                </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-4">
                      {currentOrders.map((order) => {
                        const StatusIcon = getStatusIcon(order.status);
                        const statusColor = getStatusColor(order.status);
                        return (
                          <Card key={order._id} className="bg-card dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 rounded-lg">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h3 className="font-semibold text-slate-900 dark:text-white">{order.orderId}</h3>
                                  <p className="text-sm text-slate-600 dark:text-slate-300">{order.customerName}</p>
                                </div>
                                <Badge
                                  className={`${statusColor} border-0 font-medium text-xs`}
                                >
                                  <StatusIcon className="h-3 w-3 mr-1" />
                                  {order.status}
                                </Badge>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm mb-3">
                                <div>
                                  <span className="font-medium text-slate-700 dark:text-slate-300">Total:</span>
                                  <span className="ml-1 font-semibold text-slate-900 dark:text-white">₹{order.totalBill}</span>
                                </div>
                                <div>
                                  <span className="font-medium text-slate-700 dark:text-slate-300">Table:</span>
                                  <span className="ml-1 text-slate-600 dark:text-slate-300">{order.tableNumber}</span>
                                </div>
                                <div className="col-span-1 sm:col-span-2">
                                  <span className="font-medium text-slate-700 dark:text-slate-300">Items:</span>
                                  <span className="ml-1 text-slate-600 dark:text-slate-300 break-words">{order.orderedItems.map((item: any) => `${item.itemName || item["'itemName'"]} (${item.qty || item["'qty'"]})`).join(", ")}</span>
                                </div>
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-500 dark:text-slate-400">{new Date(order.createdAt).toLocaleDateString()}</span>
                                <div className="flex items-center gap-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 w-8 p-0 hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-colors"
                                    onClick={() => handleEditClick(order)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 w-8 p-0 hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors"
                                    onClick={() => handleDeleteClick(order)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 w-8 p-0 hover:bg-[#6F42C1] hover:text-white hover:border-[#6F42C1] transition-colors"
                                    onClick={() => setSelectedOrder(order)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>

                    {/* Pagination Controls */}
                    <div className="mt-6 flex justify-center items-center space-x-2">
                      <Button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} variant="outline" size="sm">Previous</Button>
                      <span className="text-sm text-muted-foreground">Page {currentPage} of {Math.ceil(filteredOrders.length / itemsPerPage)}</span>
                      <Button onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredOrders.length / itemsPerPage)))} disabled={currentPage === Math.ceil(filteredOrders.length / itemsPerPage)} variant="outline" size="sm">Next</Button>
                    </div>
                  </>
                ) : (
                  /* Empty State */
                  <div className="text-center py-8 sm:py-12 lg:py-16 px-4">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 lg:mb-6">
                      <ShoppingBag className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-slate-400" />
                    </div>
                    <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-slate-900 dark:text-white mb-2">No Orders Found</h3>
                    <p className="text-xs sm:text-sm lg:text-base text-slate-500 dark:text-slate-400 mb-3 sm:mb-4 lg:mb-6 max-w-md mx-auto">
                      {searchQuery || activeTab !== "all" || sourceFilter !== "all"
                        ? "No orders match your current filters. Try adjusting your search criteria."
                        : "No orders have been placed yet. New orders will appear here."}
                    </p>
                    {(searchQuery || activeTab !== "all" || sourceFilter !== "all" || userIdFilter) && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSearchQuery("")
                          setActiveTab("all")
                          setSourceFilter("all")
                          setUserIdFilter(null)
                          setRestaurantName(null)
                          // Clear URL parameters
                          const url = new URL(window.location.href);
                          url.searchParams.delete('userId');
                          url.searchParams.delete('restaurantName');
                          window.history.replaceState({}, '', url.toString());
                        }}
                        className="w-full sm:w-auto text-xs sm:text-sm"
                      >
                        Clear Filters
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {selectedOrder && (
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-sm sm:max-w-md lg:max-w-lg mx-4">
            <DialogHeader className="flex items-center gap-2 sm:gap-4 pb-2 border-b border-muted">
              <div className="flex items-center justify-center rounded-full bg-[#6F42C1] h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-white font-bold text-sm sm:text-base lg:text-lg flex-shrink-0">
                {selectedOrder.customerName
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")}
              </div>
              <DialogTitle className="text-base sm:text-lg lg:text-xl font-semibold truncate">
                Order Details - {selectedOrder.orderId}
              </DialogTitle>
              <DialogDescription className="sr-only">
                Detailed information for order {selectedOrder.orderId}.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 gap-y-2 sm:gap-y-3 lg:gap-y-4 mt-4 text-xs sm:text-sm lg:text-sm text-foreground max-h-60 sm:max-h-80 overflow-y-auto">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 sm:h-5 sm:w-5 text-[#6F42C1] flex-shrink-0" />
                <span className="font-medium">Restaurant ID:</span>
                <span className="truncate">{selectedOrder.userRestaurantId}</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 sm:h-5 sm:w-5 text-[#6F42C1] flex-shrink-0" />
                <span className="font-medium">Order ID:</span>
                <span className="truncate">{selectedOrder.orderId}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 sm:h-5 sm:w-5 text-[#6F42C1] flex-shrink-0" />
                <span className="font-medium">Customer Name:</span>
                <span className="truncate">{selectedOrder.customerName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-[#6F42C1] flex-shrink-0" />
                <span className="font-medium">Customer Phone:</span>
                <span className="truncate">{selectedOrder.customerPhone}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-[#6F42C1] flex-shrink-0" />
                <span className="font-medium">Status:</span>
                <Badge className={`${getStatusColor(selectedOrder.status)} border-0 hover:bg-white text-xs`}>{selectedOrder.status}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-[#6F42C1] flex-shrink-0" />
                <span className="font-medium">Total Amount:</span>
                <span>₹{selectedOrder.totalBill}</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5 text-[#6F42C1] flex-shrink-0" />
                <span className="font-medium">Date:</span>
                <span className="truncate">{new Date(selectedOrder.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 sm:h-5 sm:w-5 text-[#6F42C1] flex-shrink-0" />
                <span className="font-medium">Table Number:</span>
                <span className="truncate">{selectedOrder.tableNumber}</span>
              </div>
            </div>
            <div className="mt-3 sm:mt-4 lg:mt-6 space-y-2 sm:space-y-3 lg:space-y-4">
              <div className="p-2 sm:p-3 lg:p-4 bg-muted rounded-md border border-border text-foreground text-xs sm:text-sm leading-relaxed">
                <p><span className="font-semibold">Items:</span></p>
                <p className="break-words">{selectedOrder.orderedItems.map((item: any) => `${item.itemName || item["'itemName'"]} (${item.qty || item["'qty'"]})`).join(", ")}</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {orderToDelete && (
        <AlertDialog open={!!orderToDelete} onOpenChange={(open) => !open && handleDeleteCancel()}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the order.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleDeleteCancel}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {orderToEdit && (
        <Dialog open={!!orderToEdit} onOpenChange={(open) => !open && handleEditClose()}>
          <DialogContent className="max-w-sm sm:max-w-md lg:max-w-lg mx-4">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg lg:text-xl">Edit Order {orderToEdit.orderId}</DialogTitle>
              <DialogDescription className="sr-only">
                Modify the details of order {orderToEdit.orderId} and save the changes.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 lg:gap-4 py-3 sm:py-4 max-h-60 sm:max-h-80 overflow-y-auto">

              <div className="space-y-2 col-span-1 sm:col-span-2">
                <Label htmlFor="customerName" className="text-sm">Customer Name</Label>
                <Input id="customerName" name="customerName" value={editedOrder.customerName} onChange={handleInputChange} />
              </div>
              <div className="space-y-2 col-span-1 sm:col-span-2">
                <Label htmlFor="customerPhone" className="text-sm">Customer Phone</Label>
                <Input id="customerPhone" name="customerPhone" value={editedOrder.customerPhone} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalBill" className="text-sm">Total Amount</Label>
                <Input id="totalBill" name="totalBill" type="number" value={editedOrder.totalBill} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tableNumber" className="text-sm">Table Number</Label>
                <Input id="tableNumber" name="tableNumber" value={editedOrder.tableNumber} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="createdAt" className="text-sm">Date</Label>
                <Input id="createdAt" name="createdAt" type="date" value={new Date(editedOrder.createdAt).toISOString().split('T')[0]} onChange={handleInputChange} />
              </div>
              <div className="space-y-2 col-span-1 sm:col-span-2">
                <Label htmlFor="status" className="text-sm">Status</Label>
                <Select value={editedOrder.status} onValueChange={(value) => handleInputChange({ target: { name: 'status', value } } as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Preparing">Preparing</SelectItem>
                    <SelectItem value="Out for Delivery">Out for Delivery</SelectItem>
                    <SelectItem value="Delivered">Delivered</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 col-span-1 sm:col-span-2">
                <Label className="text-sm">Items</Label>
                {editedOrder.orderedItems.length === 0 && (
                  <p className="text-xs text-muted-foreground py-2">No items in this order.</p>
                )}
                {editedOrder.orderedItems.map((item: any, index: number) => {
                  const itemName = item.itemName || item["'itemName'"];
                  const itemQty = item.qty || item["'qty'"];
                  const itemPrice = item.price || 0;
                  const itemId = item._id || `temp-${index}`;

                  return (
                    <div key={itemId} className="flex items-center justify-between border border-border rounded p-2 mb-2">
                      <div className="flex flex-col flex-grow">
                        <span className="font-semibold">{itemName}</span>
                        <span className="text-sm text-muted-foreground">Price: ₹{itemPrice}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="outline" onClick={() => handleItemQuantityChange(index, -1)}>-</Button>
                        <span className="w-6 text-center">{itemQty}</span>
                        <Button size="sm" variant="outline" onClick={() => handleItemQuantityChange(index, 1)}>+</Button>
                        <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-800" onClick={() => handleItemDelete(index)}>
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}

                {isAddingItem ? (
                  <div className="space-y-3 pt-2">
                    <Select onValueChange={async (categoryId) => {
                      setSelectedCategory(categoryId);
                      try {
                        const token = localStorage.getItem('token');
                        const params = new URLSearchParams();
                        params.append('restaurant_id', editedOrder.userRestaurantId);
                        const response = await axios.post(`${API_BASE_URL}/menuitem/menuitem_list`, params, {
                          headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Authorization': `JWT ${token}` },
                        });
                        const categoryItems = response.data.find((cat: any) => cat._id === categoryId);
                        setMenuItems(categoryItems ? categoryItems.menulist : []);
                      } catch (error) {
                        console.error("Failed to fetch menu items", error);
                      }
                    }}>
                      <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                      <SelectContent>
                        {menuCategories.map(cat => <SelectItem key={cat._id} value={cat._id}>{cat.categoryName}</SelectItem>)}
                      </SelectContent>
                    </Select>

                    {selectedCategory && (
                       <Select onValueChange={setSelectedMenuItem}>
                         <SelectTrigger><SelectValue placeholder="Select an item" /></SelectTrigger>
                         <SelectContent>
                           {menuItems.map(item => <SelectItem key={item._id} value={item._id}>{item.itemName} - ₹{item.price}</SelectItem>)}
                         </SelectContent>
                       </Select>
                    )}
                    <div className="flex gap-2">
                       <Button className="w-full" onClick={handleAddItemToOrder} disabled={!selectedMenuItem}>Add to Order</Button>
                       <Button variant="outline" className="w-full" onClick={resetAddItemState}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <Button variant="outline" className="w-full mt-2" onClick={fetchMenuCategories}>Add Item</Button>
                )}
              </div>
            </div>
            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
              <Button variant="outline" onClick={handleEditClose} className="w-full sm:w-auto text-xs sm:text-sm">Cancel</Button>
              <Button onClick={() => {
                // This is a placeholder for the final save logic
                console.log("Saving changes for:", editedOrder);
                handleEditSave();
              }} className="w-full sm:w-auto text-xs sm:text-sm">Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

    </DashboardLayout>
  );
}
