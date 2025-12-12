"use client"

import { useState, useEffect, useRef } from "react"
import {
  Users,
  Copy,
  Edit,
  Trash,
  Ban,
  Eye,
  QrCode,
  MessageSquare,
  Mic,
  ShoppingBag,
  Calendar,
  Utensils,
  RefreshCw,
  Search,
  Filter,
  Phone,
  AlertCircle,
  PhoneIcon,
  X,
  CreditCard
} from "lucide-react"

import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Link from "next/link"

// @ts-ignore
import QRCode from "qrcode"
import { API_BASE_URL } from "@/config"


type TableType = {
  id: string;
  name: string;
  status: boolean;
  noOfTables: string;
};

type ApiTableType = {
  "'id'": string;
  "'name'": string;
  "'status'": string;
  "'noOfTables'": string;
} & TableType; // Allows for both quoted and unquoted keys during transition


type User = {
  _id: string
  username: string
  email: string
  phoneNumber: string
  restaurantName: string
  restaurantAddress: string
  token: string
  expiresAt: string
  status: "active" | "blocked"
  noOfTables: number
  createdAt: string
  tableTypes?: ApiTableType[]
  lastPaymentDate: string
  subscriptionEndDate?: string
}

const DashboardPage = () => {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "blocked">("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [userToView, setUserToView] = useState<User | null>(null)
  const [userToEdit, setUserToEdit] = useState<User | null>(null)
  const [editedUser, setEditedUser] = useState<Partial<User>>({})
  const [allTableTypes, setAllTableTypes] = useState<Array<{ _id: string; typeName: string; status: boolean }>>([]);
  const [editedSelectedTableTypes, setEditedSelectedTableTypes] = useState<TableType[]>([]);
  const [editCurrentSelectedTableTypeId, setEditCurrentSelectedTableTypeId] = useState<string>("");
  const [editErrors, setEditErrors] = useState<Record<string, string | undefined>>({});

  const [scannerDialogOpen, setScannerDialogOpen] = useState(false)
  const [audioDialogOpen, setAudioDialogOpen] = useState(false)
  const [qrCodes, setQrCodes] = useState<Record<string, string>>({})
  const [subscriptionDialogOpen, setSubscriptionDialogOpen] = useState(false)
  const [selectedUserForSubscription, setSelectedUserForSubscription] = useState<User | null>(null)


  const usersPerPage = 10

  const tableDataByUser: Record<string, Record<string, { name: string; capacity: number; status: string; orders: string[] }>> = {
    "johndoe": {
      "1": { name: "Table 1", capacity: 4, status: "occupied", orders: ["Pizza Margherita", "Coke"] },
      "2": { name: "Table 2", capacity: 6, status: "free", orders: [] },
      "3": { name: "Table 3", capacity: 2, status: "occupied", orders: ["Burger", "Fries"] },
    },
    "janesmith": {
      "1": { name: "Table A", capacity: 4, status: "reserved", orders: [] },
      "2": { name: "Table B", capacity: 6, status: "occupied", orders: ["Pasta", "Wine"] },
      "3": { name: "Table C", capacity: 2, status: "free", orders: [] },
    },
    "bobjohnson": {
      "1": { name: "Table X", capacity: 4, status: "occupied", orders: ["Chicken Curry", "Rice"] },
      "2": { name: "Table Y", capacity: 8, status: "free", orders: [] },
      "3": { name: "Table Z", capacity: 2, status: "occupied", orders: ["Naan", "Lassi"] },
    },
    "alicebrown": {
      "1": { name: "Table Alpha", capacity: 4, status: "free", orders: [] },
      "2": { name: "Table Beta", capacity: 6, status: "occupied", orders: ["Salad", "Coffee"] },
      "3": { name: "Table Gamma", capacity: 2, status: "reserved", orders: [] },
    },
  }
  const adminKey = (window as any).ADMIN_KEY || localStorage.getItem('adminKey')
      console.log('Admin key:', adminKey) 
  useEffect(() => {
    const fetchAllTableTypes = async () => {
      try {
        const token = localStorage.getItem('token');
        const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/tabletype/tabletype_list`;
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `JWT ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setAllTableTypes(data);
        } else {
          console.error('Failed to fetch all table types');
        }
      } catch (error) {
        console.error('Error fetching all table types:', error);
      }
    };

    fetchAllTableTypes();


    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found in localStorage');
          setIsLoading(false);
          return;
        }
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/users_list`, {
          method: 'GET',
          headers: {
            'Authorization': `JWT ${token}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        });
        if (response.ok) {
          const userData = await response.json();
          setUsers(userData);
        } else {
          console.error('Failed to fetch users');
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();

    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchUsers, 10000);

    return () => clearInterval(interval);
  }, []);

  // Filter users based on search query and status filter
  useEffect(() => {
    let filtered = users;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user =>
        (user.username?.toLowerCase() || '').includes(query) ||
        (user.restaurantName?.toLowerCase() || '').includes(query) ||
        (user.email?.toLowerCase() || '').includes(query)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    setFilteredUsers(filtered);
  }, [users, searchQuery, statusFilter]);

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);


  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }






  const handleBlockUnblock = async (user: User) => {
    const newStatus = user.status === 'active' ? 'blocked' : 'active'
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${user._id}`, {
        method: 'PUT',
        headers: {
          'x-admin-key': adminKey || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })
      if (response.ok) {
          // Update local state
        setUsers(users.map(u => u._id === user._id ? { ...u, status: newStatus as "active" | "blocked" } : u))

        // Update localStorage
        const adminTokens = JSON.parse(localStorage.getItem('adminTokens') || '[]')
        const updatedTokens = adminTokens.map((token: any) =>
          token.username === user.username ? { ...token, status: newStatus } : token
        )
        localStorage.setItem('adminTokens', JSON.stringify(updatedTokens))
      } else {
        console.error('Failed to update user status')
      }
    } catch (error) {
      console.error('Error updating user status:', error)
    }
  }


  const handleViewClick = async (user: User) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found in localStorage');
        setUserToView(user); // fallback to existing data
        return;
      }
      const formData = new URLSearchParams();
      formData.append('user_id', user._id);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/user_profile`, {
        method: 'POST',
        headers: {
          'Authorization': `JWT ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });
      if (response.ok) {
        const userData = await response.json();
        setUserToView(userData.data || user); // fallback to existing data if data is not available
      } else {
        console.error('Failed to fetch user details');
        setUserToView(user); // fallback to existing data
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      setUserToView(user); // fallback to existing data
    }
  }

  const handleViewClose = () => {
    setUserToView(null)
  }

  const handleEditClick = (user: User) => {
    setUserToEdit(user)
    // The user object from the list might not have tableTypes, so we fetch it or use what's there.
    // Assuming user object from list API has tableTypes.
    // The keys from backend have single quotes, we need to normalize them.
    const normalizedTableTypes = (user.tableTypes || []).map(tt => ({
      id: tt["'id'"] || tt.id,
      name: tt["'name'"] || tt.name,
      noOfTables: String(tt["'noOfTables'"] || tt.noOfTables || ''),
      status: (tt["'status'"] === 'true') || tt.status || false,
    }));
    setEditedSelectedTableTypes(normalizedTableTypes);
    setEditedUser(user)
  }

  const handleEditClose = () => {
    setUserToEdit(null)
    setEditedUser({})
  }
  const handleEditAddTableType = () => {
    if (!editCurrentSelectedTableTypeId) return;

    const typeToAdd = allTableTypes.find(type => type._id === editCurrentSelectedTableTypeId);
    if (typeToAdd && !editedSelectedTableTypes.some(st => st.id === typeToAdd._id)) {
      setEditedSelectedTableTypes(prev => [
        ...prev,
        {
          id: typeToAdd._id,
          name: typeToAdd.typeName,
          status: typeToAdd.status,
          noOfTables: "" // Initialize with empty string
        }
      ]);
      setEditCurrentSelectedTableTypeId(""); // Reset dropdown
    }
  };

  const handleEditRemoveTableType = (id: string) => {
    setEditedSelectedTableTypes(prev => prev.filter(type => type.id !== id));
  };

  const handleEditTableTypeCountChange = (id: string, value: string) => {
    setEditedSelectedTableTypes(prev =>
      prev.map(type =>
        type.id === id ? { ...type, noOfTables: value } : type
      )
    );
  };

  const handleEditSave = async () => {
    if (userToEdit) {
      const newErrors: Record<string, string> = {};
      if (!editedUser.username?.trim()) newErrors.username = "Username is required";
      if (!editedUser.email?.trim()) newErrors.email = "Email is required";
      if (!editedUser.phoneNumber?.trim()) newErrors.phoneNumber = "Phone number is required";
      if (!editedUser.restaurantName?.trim()) newErrors.restaurantName = "Restaurant name is required";
      if (!editedUser.restaurantAddress?.trim()) newErrors.restaurantAddress = "Restaurant address is required";

      if (editedSelectedTableTypes.length === 0) {
        newErrors.selectedTableTypes = "At least one table type must be added.";
      } else {
        editedSelectedTableTypes.forEach((type) => {
          if (!type.noOfTables.trim() || isNaN(Number(type.noOfTables)) || Number(type.noOfTables) <= 0) {
            newErrors[`noOfTables_${type.id}`] = `Invalid count for ${type.name}.`;
          }
        });
      }

      setEditErrors(newErrors);
      if (Object.keys(newErrors).length > 0) {
        return;
      }

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found in localStorage');
          return;
        }
        const formData = new URLSearchParams();
        formData.append('username', editedUser.username!);
        formData.append('email', editedUser.email!);
        formData.append('phoneNumber', editedUser.phoneNumber!);
        formData.append('restaurantName', editedUser.restaurantName!);
        formData.append('restaurantAddress', editedUser.restaurantAddress!);

        const totalTables = editedSelectedTableTypes.reduce((sum, type) => {
          const count = parseInt(type.noOfTables, 10);
          return sum + (isNaN(count) ? 0 : count);
        }, 0);
        formData.append('noOfTables', String(totalTables));

        editedSelectedTableTypes.forEach((type, index) => {
          formData.append(`tableTypes[${index}]['id']`, type.id);
          formData.append(`tableTypes[${index}]['name']`, type.name);
          formData.append(`tableTypes[${index}]['status']`, String(type.status));
          formData.append(`tableTypes[${index}]['noOfTables']`, type.noOfTables);
        });

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/update_user_profile/${userToEdit._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `JWT ${token}`,
          },
          body: formData.toString(),
        });

        if (response.ok) {
          // Refresh the entire user list to get the latest data
          const refreshResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/users_list`, {
            method: 'GET',
            headers: {
              'Authorization': `JWT ${token}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          });
          if (refreshResponse.ok) {
            const refreshedUsers = await refreshResponse.json();
            setUsers(refreshedUsers);
          }
          handleEditClose();
        } else {
          const errorData = await response.json();
          console.error('Failed to update user:', errorData);
          alert(`Failed to update admin: ${errorData.error || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Error updating user:', error);
        alert(`An error occurred: ${(error as Error).message}`);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEditedUser(prev => ({ ...prev, [name]: value }))
    if (editErrors[name]) {
      setEditErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  }

  const handleTableScanner = (user: User) => {
    setScannerDialogOpen(true)
    generateAllQRCodes(user.username)
  }

  const generateAllQRCodes = async (username: string) => {
    const newQrCodes: Record<string, string> = {}
    const userTableData = tableDataByUser[username] || tableDataByUser["johndoe"]

    for (const [tableId, table] of Object.entries(userTableData)) {
      const qrData = JSON.stringify({
        tableId: tableId,
        tableName: table.name,
        capacity: table.capacity,
        status: table.status,
        orders: table.orders,
        restaurant: username
      })

      try {
        const url = await QRCode.toDataURL(qrData, {
          width: 150,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        })
        newQrCodes[tableId] = url
      } catch (err) {
        console.error('Error generating QR code for table', tableId, err)
      }
    }

    setQrCodes(newQrCodes)
  }



  function handleMenusClick(user: User): void {
    throw new Error("Function not implemented.")
  }

  function handleOrdersClick(user: User): void {
    throw new Error("Function not implemented.")
  }

  function handleBookingsClick(user: User): void {
    throw new Error("Function not implemented.")
  }

  const handleSubscriptionClick = (user: User) => {
    setSelectedUserForSubscription(user)
    setSubscriptionDialogOpen(true)
  }

  return (
    <DashboardLayout activeItem="Dashboard">
      <div className=" sm:p-4 lg:p-6">
        {/* All Users Table */}
        <Card className="bg-card shadow-lg border border-border/50 rounded-2xl mx-2 sm:mx-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-background to-muted/30 border-b border-border/50 px-4 py-5 sm:px-6 sm:py-6">
            <CardTitle className="flex items-center gap-3 text-foreground text-lg sm:text-xl lg:text-2xl font-bold">
              <div className="p-2 bg-[#6F42C1]/10 rounded-lg">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-[#6F42C1]" />
              </div>
              All Admins
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Search and Filter Controls */}
            {!isLoading && users.length > 0 && (
              <div className="mb-6 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Search Input */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, restaurant, or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Status Filter */}
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "blocked")}
                      className="px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      <option value="all">Show All</option>
                      <option value="active">Show Enabled</option>
                      <option value="blocked">Show Disabled</option>
                    </select>
                  </div>
                </div>

                {/* Results Count */}
                <div className="text-sm text-muted-foreground">
                  Showing {filteredUsers.length} of {users.length} admins
                </div>
              </div>
            )}

            {isLoading ? (
              <div className="text-center py-8 sm:py-12 lg:py-16 px-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 lg:mb-6 animate-spin">
                  <RefreshCw className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-slate-400" />
                </div>
                <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-slate-900 dark:text-white mb-2">Loading Admins...</h3>
                <p className="text-xs sm:text-sm lg:text-base text-slate-500 dark:text-slate-400">Please wait while we fetch the admin data.</p>
              </div>
            ) : filteredUsers.length > 0 ? (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto rounded-lg border border-border/50 bg-card/50">
                  <Table className="w-full">
                    <TableHeader className="bg-muted/30">
                      <TableRow key="header-row" className="border-border hover:bg-muted/50">
                        <TableHead className="font-bold text-foreground whitespace-nowrap min-w-[120px] px-4 py-3 text-sm">Owner Name</TableHead>
                        <TableHead className="font-bold text-foreground whitespace-nowrap hidden md:table-cell min-w-[150px] px-4 py-3 text-sm">Restaurant</TableHead>
                        <TableHead className="font-bold text-foreground whitespace-nowrap hidden lg:table-cell min-w-[100px] px-4 py-3 text-sm">Tables</TableHead>
                      
                        <TableHead className="font-bold text-foreground whitespace-nowrap hidden xl:table-cell min-w-[140px] px-4 py-3 text-sm">Last Payment</TableHead>
                       
                        <TableHead className="font-bold text-foreground whitespace-nowrap hidden lg:table-cell min-w-[120px] px-4 py-3 text-sm">Contact</TableHead>
                        <TableHead className="font-bold text-foreground whitespace-nowrap min-w-[80px] px-4 py-3 text-sm">Status</TableHead>
                        <TableHead className="font-bold text-foreground whitespace-nowrap min-w-[200px] px-4 py-3 text-sm">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentUsers.map((user, index) => (
                        <TableRow key={user._id || `user-${index}`} className="border-border hover:bg-muted/70 transition-all duration-200 group">
                          <TableCell className="font-semibold text-foreground whitespace-nowrap px-4 py-4">
                            <div className="flex flex-col">
                              <span className="text-sm">{user.username}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-foreground whitespace-nowrap hidden md:table-cell px-4 py-4">
                            <span className="text-sm font-medium">{user.restaurantName}</span>
                          </TableCell>
                          <TableCell className="text-foreground whitespace-nowrap hidden lg:table-cell px-4 py-4">
                            <span className="text-sm font-medium">{user.noOfTables}</span>
                          </TableCell>
                         
                          <TableCell className="text-foreground whitespace-nowrap hidden xl:table-cell px-4 py-4">
                            <span className="text-sm font-medium">{user.lastPaymentDate || '0'}</span>
                          </TableCell>
                        
                          <TableCell className="text-foreground whitespace-nowrap hidden lg:table-cell px-4 py-4">
                            <span className="text-sm font-medium">{user.phoneNumber}</span>
                          </TableCell>
                          <TableCell className="px-4 py-4">
                            <Badge
                              variant="secondary"
                              className={`whitespace-nowrap border-0 text-xs font-medium px-2 py-1 ${
                                user.status === 'active'
                                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-300'
                                  : 'bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300'
                              }`}
                            >
                              {user.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-4 py-4">
                            <div className="flex items-center gap-1 flex-wrap">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 transition-colors" onClick={() => handleViewClick(user)}>
                                      <Eye className="h-3 w-3" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>View Details</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-900/20 transition-colors" onClick={() => handleEditClick(user)}>
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Edit admin</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                           
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-yellow-50 hover:text-yellow-600 dark:hover:bg-yellow-900/20 transition-colors" onClick={() => handleBlockUnblock(user)}>
                                      <Ban className="h-3 w-3" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Block/Unblock</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-purple-50 hover:text-purple-600 dark:hover:bg-purple-900/20 transition-colors" onClick={() => handleTableScanner(user)}>
                                      <QrCode className="h-3 w-3" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Table Scanner</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Link href={`/menus?restaurant_id=${user._id}&restaurantName=${encodeURIComponent(user.restaurantName)}`}>
                                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-900/20 transition-colors">
                                        <Utensils className="h-3 w-3" />
                                      </Button>
                                    </Link>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Menus</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Link href={`/orders?userId=${user._id}&restaurantName=${encodeURIComponent(user.restaurantName)}`}>
                                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-900/20 transition-colors">
                                        <ShoppingBag className="h-3 w-3" />
                                      </Button>
                                    </Link>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Orders</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Link href={`/bookings?restaurant_id=${user._id}&restaurantName=${encodeURIComponent(user.restaurantName)}`}>
                                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 transition-colors">
                                        <Calendar className="h-3 w-3" />
                                      </Button>
                                    </Link>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Bookings</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Link href={`/call-logs?restaurant_id=${user._id}&restaurantName=${encodeURIComponent(user.restaurantName)}`}>
                                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-purple-50 hover:text-purple-600 dark:hover:bg-purple-900/20 transition-colors">
                                        <Phone className="h-3 w-3" />
                                      </Button>
                                    </Link>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Call Logs</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
<Link href={`/feedback?restaurantId=${user._id}&restaurantName=${encodeURIComponent(user.restaurantName)}`}>
                                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 transition-colors">
                                        <MessageSquare className="h-3 w-3" />
                                      </Button>
                                    </Link>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Feedback</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-900/20 transition-colors" onClick={() => handleSubscriptionClick(user)}>
                                      <CreditCard className="h-3 w-3" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Subscription</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4 mt-4">
                  {currentUsers.map((user, index) => (
                    <Card key={user._id || `user-${index}`} className="bg-card shadow-md border border-border/50 rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-200">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-4">
                          <div className="min-w-0 flex-1">
                            <h3 className="font-bold text-foreground text-base truncate mb-1">{user.username}</h3>
                            <p className="text-sm text-muted-foreground truncate font-medium">{user.restaurantName}</p>
                          </div>
                          <Badge
                            variant="secondary"
                            className={`whitespace-nowrap border-0 text-xs font-medium px-2 py-1 ml-3 flex-shrink-0 ${
                              user.status === 'active'
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-300'
                                : 'bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300'
                            }`}
                          >
                            {user.status}
                          </Badge>
                        </div>

                        <div className="space-y-2 text-sm mb-4 border-t border-border/30 pt-3">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-muted-foreground">Email:</span>
                            <span className="text-foreground break-words text-right max-w-[60%]">{user.email}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-muted-foreground">Phone:</span>
                            <span className="text-foreground">{user.phoneNumber}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-muted-foreground">Tables:</span>
                            <span className="text-foreground">{user.noOfTables}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-muted-foreground">Created:</span>
                            <span className="text-foreground text-xs">{user.createdAt || '0'}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-muted-foreground">Last Payment:</span>
                            <span className="text-foreground text-xs">{user.lastPaymentDate || '0'}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-muted-foreground">Subscription End:</span>
                            <span className="text-foreground text-xs">{user.expiresAt || '0'}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-1 flex-wrap border-t border-border/30 pt-3">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-9 w-9 p-0 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 dark:hover:bg-blue-900/20 transition-colors"
                                  onClick={() => handleViewClick(user)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>View Details</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-9 w-9 p-0 hover:bg-green-50 hover:text-green-600 hover:border-green-300 dark:hover:bg-green-900/20 transition-colors"
                                  onClick={() => handleEditClick(user)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Edit admin</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-9 w-9 p-0 hover:bg-yellow-50 hover:text-yellow-600 hover:border-yellow-300 dark:hover:bg-yellow-900/20 transition-colors"
                                  onClick={() => handleBlockUnblock(user)}
                                >
                                  <Ban className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Block/Unblock</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-9 w-9 p-0 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-300 dark:hover:bg-purple-900/20 transition-colors"
                                  onClick={() => handleTableScanner(user)}
                                >
                                  <QrCode className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Table Scanner</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Link href={`/conversation?userId=${user._id}&username=${user.username}`}>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-9 w-9 p-0 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300 dark:hover:bg-indigo-900/20 transition-colors"
                                  >
                                    <Mic className="h-4 w-4" />
                                  </Button>
                                </Link>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Conversation</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Link href={`/menus?restaurant_id=${user._id}&restaurantName=${encodeURIComponent(user.restaurantName)}`}>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-9 w-9 p-0 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300 dark:hover:bg-orange-900/20 transition-colors"
                                  >
                                    <Utensils className="h-4 w-4" />
                                  </Button>
                                </Link>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Menus</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Link href={`/orders?userId=${user._id}&restaurantName=${encodeURIComponent(user.restaurantName)}`}>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-9 w-9 p-0 hover:bg-green-50 hover:text-green-600 hover:border-green-300 dark:hover:bg-green-900/20 transition-colors"
                                  >
                                    <ShoppingBag className="h-4 w-4" />
                                  </Button>
                                </Link>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Orders</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Link href={`/bookings?restaurant_id=${user._id}&restaurantName=${encodeURIComponent(user.restaurantName)}`}>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-9 w-9 p-0 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 dark:hover:bg-blue-900/20 transition-colors"
                                      >
                                        <Calendar className="h-4 w-4" />
                                      </Button>
                                    </Link>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Bookings</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Link href={`/call-logs?restaurant_id=${user._id}&restaurantName=${encodeURIComponent(user.restaurantName)}`}>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-9 w-9 p-0 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-300 dark:hover:bg-purple-900/20 transition-colors"
                                      >
                                        <Phone className="h-4 w-4" />
                                      </Button>
                                    </Link>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Call Logs</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-9 w-9 p-0 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300 dark:hover:bg-indigo-900/20 transition-colors"
                                      onClick={() => handleSubscriptionClick(user)}
                                    >
                                      <CreditCard className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Subscription</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Pagination Controls */}
                <div className="mt-6 flex justify-center items-center space-x-2">
                  <Button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} variant="outline" size="sm">Previous</Button>
                  <span className="text-sm text-muted-foreground">Page {currentPage} of {Math.ceil(filteredUsers.length / usersPerPage)}</span>
                  <Button onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredUsers.length / usersPerPage)))} disabled={currentPage === Math.ceil(filteredUsers.length / usersPerPage)} variant="outline" size="sm">Next</Button>
                </div>
              </>
            ) : (
              <div className="text-center py-6 sm:py-8 lg:py-12">
                <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 lg:mb-6">
                  <Users className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-slate-400" />
                </div>
                <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-slate-900 dark:text-white mb-2">No admins Found</h3>
                <p className="text-xs sm:text-sm lg:text-base text-slate-500 dark:text-slate-400">No admin  have been added yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

 

      {/* View User Dialog */}
      {userToView && (
        <Dialog open={!!userToView} onOpenChange={(open) => !open && handleViewClose()}>
          <DialogContent className="max-w-sm sm:max-w-md lg:max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg lg:text-xl flex items-center gap-2">
                <Eye className="h-5 w-5 text-[#6F42C1]" />
                {userToView.username} - Admin Details
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm lg:text-base">
                Complete profile and restaurant information
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-3 sm:py-4">
              {/* User Details Section */}
              <Card className="bg-card shadow-sm border border-border/50 rounded-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm sm:text-base font-semibold text-foreground">admin Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-muted-foreground">ID</Label>
                      <p className="text-sm font-mono bg-muted/50 px-2 py-1 rounded text-foreground">{userToView._id}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-muted-foreground">admin name</Label>
                      <p className="text-sm text-foreground">{userToView.username}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-muted-foreground">Email</Label>
                      <p className="text-sm text-foreground break-words">{userToView.email}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-muted-foreground">Phone</Label>
                      <p className="text-sm text-foreground">{userToView.phoneNumber}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-muted-foreground">Restaurant</Label>
                      <p className="text-sm text-foreground break-words">{userToView.restaurantName}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-muted-foreground">Address</Label>
                      <p className="text-sm text-foreground break-words">{userToView.restaurantAddress}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-muted-foreground">Tables</Label>
                      <p className="text-sm text-foreground">{userToView.noOfTables}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-muted-foreground">Created Date</Label>
                      <p className="text-sm text-foreground">{userToView.createdAt ? new Date(userToView.createdAt).toISOString().split('T')[0] : '0'}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-muted-foreground">Last Payment Date</Label>
                      <p className="text-sm text-foreground">{userToView.lastPaymentDate || '0'}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-muted-foreground">Subscription End Date</Label>
                      <p className="text-sm text-foreground">{userToView.expiresAt || '0'}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-muted-foreground">Status</Label>
                      <Badge variant={userToView.status === 'active' ? 'default' : 'destructive'} className="text-xs">
                        {userToView.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-muted-foreground">Token</Label>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-mono bg-muted/50 px-2 py-1 rounded text-foreground break-all flex-1">{userToView.token}</p>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(userToView.token)}
                              className="flex-shrink-0 h-7 w-7 p-0 hover:bg-primary/10 hover:text-primary transition-colors"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Copy Token</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tables Section */}
              
            </div>
            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
              <Button onClick={handleViewClose} className="w-full sm:w-auto text-xs sm:text-sm">Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit User Dialog */}
      {userToEdit && (
        <Dialog open={!!userToEdit} onOpenChange={(open) => !open && handleEditClose()}>
          <DialogContent className="max-w-sm sm:max-w-md lg:max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg lg:text-xl">Edit {userToEdit.username}</DialogTitle>
              <DialogDescription className="text-xs sm:text-sm lg:text-base">
                Make changes to the admin profile here. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Owner Name</Label>
                  <Input id="username" name="username" value={editedUser.username || ''} onChange={handleInputChange} className={editErrors.username ? 'border-red-500' : ''} />
                  {editErrors.username && <p className="text-red-600 text-xs">{editErrors.username}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="restaurantName">Restaurant Name</Label>
                  <Input id="restaurantName" name="restaurantName" value={editedUser.restaurantName || ''} onChange={handleInputChange} className={editErrors.restaurantName ? 'border-red-500' : ''} />
                  {editErrors.restaurantName && <p className="text-red-600 text-xs">{editErrors.restaurantName}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="restaurantAddress">Restaurant Address</Label>
                  <Input id="restaurantAddress" name="restaurantAddress" value={editedUser.restaurantAddress || ''} onChange={handleInputChange} className={editErrors.restaurantAddress ? 'border-red-500' : ''} />
                  {editErrors.restaurantAddress && <p className="text-red-600 text-xs">{editErrors.restaurantAddress}</p>}
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" value={editedUser.email || ''} onChange={handleInputChange} className={editErrors.email ? 'border-red-500' : ''} />
                  {editErrors.email && <p className="text-red-600 text-xs">{editErrors.email}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone</Label>
                  <Input id="phoneNumber" name="phoneNumber" type="tel" value={editedUser.phoneNumber || ''} onChange={handleInputChange} className={editErrors.phoneNumber ? 'border-red-500' : ''} />
                  {editErrors.phoneNumber && <p className="text-red-600 text-xs">{editErrors.phoneNumber}</p>}
                </div>
              </div>

              {/* Table Types Configuration (Full Width) */}
              <div className="space-y-4 md:col-span-2">
                <Label>Configure Table Types</Label>
                <div className="flex gap-2 items-center">
                  <Select onValueChange={setEditCurrentSelectedTableTypeId} value={editCurrentSelectedTableTypeId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a table type" />
                    </SelectTrigger>
                    <SelectContent>
                      {allTableTypes.map(type => (
                        <SelectItem
                          key={type._id}
                          value={type._id}
                          disabled={editedSelectedTableTypes.some(st => st.id === type._id)}
                        >
                          {type.typeName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="button" onClick={handleEditAddTableType} disabled={!editCurrentSelectedTableTypeId}>
                    Add
                  </Button>
                </div>
                {editErrors.selectedTableTypes && (
                  <div className="flex items-center gap-1 mt-1 text-red-600 text-xs">
                    <AlertCircle className="h-3 w-3" />
                    {editErrors.selectedTableTypes}
                  </div>
                )}

                <div className="space-y-3 mt-4">
                  {editedSelectedTableTypes.map(type => (
                    <div key={type.id} className="flex items-center gap-2 p-3 border rounded-lg bg-gray-50 dark:bg-gray-700">
                      <span className="font-medium flex-1">{type.name}</span>
                      <div className="relative w-24">
                        <Input
                          type="number"
                          placeholder="Count"
                          value={type.noOfTables}
                          onChange={(e) => handleEditTableTypeCountChange(type.id, e.target.value)}
                          className={`h-10 text-center ${editErrors[`noOfTables_${type.id}`] ? 'border-red-500' : ''}`}
                        />
                        {editErrors[`noOfTables_${type.id}`] && (
                          <div className="absolute -bottom-5 left-0 text-red-600 text-xs whitespace-nowrap">
                            {editErrors[`noOfTables_${type.id}`]}
                          </div>
                        )}
                      </div>
                      <Button type="button" variant="destructive" size="icon" onClick={() => handleEditRemoveTableType(type.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
              <Button variant="outline" onClick={handleEditClose} className="w-full sm:w-auto text-xs sm:text-sm">Cancel</Button>
              <Button onClick={handleEditSave} className="w-full sm:w-auto text-xs sm:text-sm">Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Table Scanner Dialog */}
      <Dialog open={scannerDialogOpen} onOpenChange={setScannerDialogOpen}>
        <DialogContent className="max-w-sm sm:max-w-md lg:max-w-2xl mx-4">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg lg:text-xl">Table Scanner</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm lg:text-base">
              Select a table and scan QR code
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 sm:space-y-6 max-h-60 sm:max-h-80 lg:max-h-96 overflow-y-auto">
            <div className="text-center">
              <h3 className="text-base sm:text-lg lg:text-xl font-semibold mb-3 sm:mb-4">Table QR Codes</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {Object.entries(qrCodes).map(([tableId, qrCodeUrl]) => {
                const userTableData = tableDataByUser[Object.keys(tableDataByUser).find(key => tableDataByUser[key][tableId]) || "johndoe"]
                const table = userTableData ? userTableData[tableId] : null
                return table ? (
                  <div key={tableId} className="border rounded-lg p-3 sm:p-4 bg-white dark:bg-slate-800 shadow-sm">
                    <div className="text-center mb-2 sm:mb-3">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">{table.name}</h4>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-300">{table.capacity} seats • {table.status}</p>
                    </div>
                    {qrCodeUrl && (
                      <div className="flex justify-center mb-2 sm:mb-3">
                        <img
                          src={qrCodeUrl}
                          alt={`QR Code for ${table.name}`}
                          className="border rounded w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28"
                        />
                      </div>
                    )}
                    <div className="text-xs text-gray-600 dark:text-slate-300">
                      <p><strong>Orders:</strong> {table.orders.length > 0 ? table.orders.join(", ") : "No orders"}</p>
                    </div>
                  </div>
                ) : null
              })}
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
            <Button onClick={() => setScannerDialogOpen(false)} className="w-full sm:w-auto text-xs sm:text-sm">Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Audio Conversation Dialog */}
      <Dialog open={audioDialogOpen} onOpenChange={setAudioDialogOpen}>
        <DialogContent className="max-w-sm sm:max-w-md lg:max-w-2xl mx-4">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg lg:text-xl">Audio Conversation</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm lg:text-base">
              Start an audio conversation
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 sm:space-y-4">
            <div className="text-center p-6 sm:p-8 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg">
              <Mic className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-gray-400 dark:text-slate-500 mb-3 sm:mb-4" />
              <p className="text-gray-600 dark:text-slate-300 text-sm sm:text-base">Audio conversation feature coming soon...</p>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-2">This will allow real-time audio communication</p>
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
            <Button onClick={() => setAudioDialogOpen(false)} className="w-full sm:w-auto text-xs sm:text-sm">Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Subscription Dialog */}
      <Dialog open={subscriptionDialogOpen} onOpenChange={setSubscriptionDialogOpen}>
        <DialogContent className="max-w-sm sm:max-w-md lg:max-w-2xl mx-4">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg lg:text-xl flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-[#6F42C1]" />
              Subscription Details - {selectedUserForSubscription?.username}
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm lg:text-base">
              View subscription information for this admin
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-3 sm:py-4">
            <Card className="bg-card shadow-sm border border-border/50 rounded-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm sm:text-base font-semibold text-foreground">Subscription Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-muted-foreground">Plan Type</Label>
                    <p className="text-sm text-foreground">Premium Plan</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-muted-foreground">Status</Label>
                    <Badge variant="default" className="text-xs">Active</Badge>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-muted-foreground">Start Date</Label>
                    <p className="text-sm text-foreground">2024-01-15</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-muted-foreground">End Date</Label>
                    <p className="text-sm text-foreground">2024-12-15</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-muted-foreground">Billing Cycle</Label>
                    <p className="text-sm text-foreground">Monthly</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-muted-foreground">Amount</Label>
                    <p className="text-sm text-foreground">$99.99</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-muted-foreground">Features</Label>
                    <p className="text-sm text-foreground">Unlimited Tables, Priority Support</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-muted-foreground">Auto Renewal</Label>
                    <p className="text-sm text-foreground">Enabled</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
            <Button onClick={() => setSubscriptionDialogOpen(false)} className="w-full sm:w-auto text-xs sm:text-sm">Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </DashboardLayout>
  )
}

export default DashboardPage