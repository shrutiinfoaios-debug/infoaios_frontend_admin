"use client"

import React from "react"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import {
  Eye,
  Edit,
  Trash,
  Search,
  RefreshCw,
  Plus
} from "lucide-react"

import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Label } from "@/components/ui/label"
import { API_BASE_URL } from "@/config"

type MenuItem = {
  _id: string
  itemName: string
  price: number
  category?: string
  description?: string
  image?: string
}

const MenusPage = () => {
  const searchParams = useSearchParams()
  const restaurantId = searchParams.get('restaurant_id')
  const restaurantName = searchParams.get('restaurantName')

  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [filteredMenuItems, setFilteredMenuItems] = useState<MenuItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [menuItemToDelete, setMenuItemToDelete] = useState<MenuItem | null>(null)
  const [menuItemToView, setMenuItemToView] = useState<MenuItem | null>(null)
  const [menuItemToEdit, setMenuItemToEdit] = useState<MenuItem | null>(null)
  const [addMenuDialogOpen, setAddMenuDialogOpen] = useState(false)
  const [menuCategories, setMenuCategories] = useState<any[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(false)
  const [newMenuItem, setNewMenuItem] = useState({
    itemName: '',
    price: '',
    category: '',
    categoryId: '',
    status: 'true'
  })
  const [isAddingMenuItem, setIsAddingMenuItem] = useState(false)
  const [newCategory, setNewCategory] = useState({
    categoryName: '',
    status: 'true'
  })
  const [isAddingCategory, setIsAddingCategory] = useState(false)

  useEffect(() => {
    if (restaurantId) {
      fetchMenuItems()

      // Auto-refresh every 10 seconds
      const interval = setInterval(fetchMenuItems, 10000)

      return () => clearInterval(interval)
    }
  }, [restaurantId])

  useEffect(() => {
    const filtered = menuItems.filter(item =>
      item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (selectedCategory && item.category === selectedCategory)
    )
    setFilteredMenuItems(filtered)
  }, [menuItems, searchQuery, selectedCategory])

  // Pagination logic
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMenuItems = filteredMenuItems.slice(indexOfFirstItem, indexOfLastItem);

  const fetchMenuItems = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        console.error('No token found in localStorage')
        setIsLoading(false)
        return
      }

      const response = await fetch(`${API_BASE_URL}/menuitem/menuitem_list`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `JWT ${token}`,
        },
        body: new URLSearchParams({
          restaurant_id: restaurantId!,
        }).toString(),
      })

      if (response.ok) {
        const data = await response.json()
        // Flatten the menu items from categories
        const allItems = data.flatMap((category: any) =>
          category.menulist ? category.menulist.map((item: any) => ({
            ...item,
            category: category.categoryName || 'Uncategorized'
          })) : []
        )
        setMenuItems(allItems)
      } else {
        console.error('Failed to fetch menu items')
      }
    } catch (error) {
      console.error('Error fetching menu items:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteClick = (menuItem: MenuItem) => {
    setMenuItemToDelete(menuItem)
  }

  const handleDeleteConfirm = async () => {
    if (menuItemToDelete) {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          console.error('No token found in localStorage')
          return
        }

        const response = await fetch(`${API_BASE_URL}/menuitem/delete/${menuItemToDelete._id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `JWT ${token}`,
          }
        })

        if (response.ok) {
          setMenuItems(menuItems.filter(item => item._id !== menuItemToDelete._id))
        } else {
          console.error('Failed to delete menu item')
        }
      } catch (error) {
        console.error('Error deleting menu item:', error)
      }
      setMenuItemToDelete(null)
    }
  }

  const handleDeleteCancel = () => {
    setMenuItemToDelete(null)
  }

  const handleViewClick = (menuItem: MenuItem) => {
    setMenuItemToView(menuItem)
  }

  const handleViewClose = () => {
    setMenuItemToView(null)
  }

  const handleEditClick = (menuItem: MenuItem) => {
    setMenuItemToEdit(menuItem)
  }

  const handleEditClose = () => {
    setMenuItemToEdit(null)
  }

  const handleEditSave = async (updatedItem: MenuItem) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        console.error('No token found in localStorage')
        return
      }

      const response = await fetch(`${API_BASE_URL}/menuitem/update/${updatedItem._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `JWT ${token}`,
        },
        body: JSON.stringify(updatedItem),
      })

      if (response.ok) {
        setMenuItems(menuItems.map(item => item._id === updatedItem._id ? updatedItem : item))
        setMenuItemToEdit(null)
      } else {
        console.error('Failed to update menu item')
      }
    } catch (error) {
      console.error('Error updating menu item:', error)
    }
  }

  const handleRefresh = () => {
    setIsLoading(true)
    fetchMenuItems()
  }

  const handleAddMenuClick = async () => {
    setAddMenuDialogOpen(true)
    setIsLoadingCategories(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        console.error('No token found in localStorage')
        setIsLoadingCategories(false)
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/menucategory/menucategory_list`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `JWT ${token}`,
        },
        body: new URLSearchParams({
          restaurant_id: restaurantId!,
        }).toString(),
      })

      if (response.ok) {
        const data = await response.json()
        setMenuCategories(data)
      } else {
        console.error('Failed to fetch menu categories')
      }
    } catch (error) {
      console.error('Error fetching menu categories:', error)
    } finally {
      setIsLoadingCategories(false)
    }
  }

  const handleAddCategory = async () => {
    if (!newCategory.categoryName.trim()) {
      alert('Please enter a category name')
      return
    }

    setIsAddingCategory(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        console.error('No token found in localStorage')
        return
      }

      const formData = new URLSearchParams()
      formData.append('userRestaurantId', restaurantId!)
    
      formData.append('categoryName', newCategory.categoryName)
      formData.append('status', newCategory.status)
      formData.append('created_by', restaurantId!) // all admin me jiske menu par click kiya or _id bheji hai menu page me vo _id

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/menucategory/create_menucategory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `JWT ${token}`,
        },
        body: formData.toString(),
      })

      if (response.ok) {
        // Refresh categories
        const token = localStorage.getItem('token')
        if (token) {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/menucategory/menucategory_list`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Authorization': `JWT ${token}`,
            },
            body: new URLSearchParams({
              restaurant_id: restaurantId!,
            }).toString(),
          })
          if (response.ok) {
            const data = await response.json()
            setMenuCategories(data)
          }
        }
        // Reset form
        setNewCategory({
          categoryName: '',
          status: 'true'
        })
        alert('Category added successfully!')
      } else {
        console.error('Failed to add category')
        alert('Failed to add category. Please try again.')
      }
    } catch (error) {
      console.error('Error adding category:', error)
      alert('An error occurred while adding the category.')
    } finally {
      setIsAddingCategory(false)
    }
  }

  const handleAddMenuSave = async () => {
    if (!newMenuItem.itemName.trim() || !newMenuItem.price.trim() || !newMenuItem.categoryId) {
      alert('Please fill in all required fields')
      return
    }

    setIsAddingMenuItem(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        console.error('No token found in localStorage')
        return
      }

      const formData = new URLSearchParams()
      formData.append('userRestaurantId', restaurantId!)

      formData.append('itemName', newMenuItem.itemName)
      formData.append('status', newMenuItem.status)
      formData.append('created_by', restaurantId!) // menu par click kiya or menu me id send ki vo _id
      formData.append('categoryId', newMenuItem.categoryId)
      formData.append('price', newMenuItem.price)

       const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/menuitem/create_menuitem`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `JWT ${token}`,
        },
        body: formData.toString(),
      })

      if (response.ok) {
        // Refresh the menu items list
        fetchMenuItems()
        // Reset form and close dialog
        setNewMenuItem({
          itemName: '',
          price: '',
          category: '',
          categoryId: '',

          status: 'true'
        })
        setAddMenuDialogOpen(false)
      } else {
        console.error('Failed to add menu item')
        alert('Failed to add menu item. Please try again.')
      }
    } catch (error) {
      console.error('Error adding menu item:', error)
      alert('An error occurred while adding the menu item.')
    } finally {
      setIsAddingMenuItem(false)
    }
  }

  return (
    <DashboardLayout activeItem="Dashboard">
      <div className="sm:p-4 lg:p-6">
        <Card className="bg-card shadow-lg border border-border/50 rounded-2xl mx-2 sm:mx-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-background to-muted/30 border-b border-border/50 px-4 py-5 sm:px-6 sm:py-6">
            <CardTitle className="flex items-center gap-3 text-foreground text-lg sm:text-xl lg:text-2xl font-bold">
              <div className="p-2 bg-[#6F42C1]/10 rounded-lg">
                <Search className="h-5 w-5 sm:h-6 sm:w-6 text-[#6F42C1]" />
              </div>
              {restaurantName ? `${restaurantName} - Menus` : 'Restaurant Menus'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {isLoading ? (
              <div className="text-center py-8 sm:py-12 lg:py-16 px-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 lg:mb-6 animate-spin">
                  <RefreshCw className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-slate-400" />
                </div>
                <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-slate-900 dark:text-white mb-2">Loading Menu Items...</h3>
                <p className="text-xs sm:text-sm lg:text-base text-slate-500 dark:text-slate-400">Please wait while we fetch the menu data.</p>
              </div>
            ) : (
              <>
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search menu items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">All Categories</option>
                  {Array.from(new Set(menuItems.map(item => item.category).filter(Boolean))).map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <Button variant="outline" size="sm" onClick={handleRefresh} className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
                <Button variant="default" size="sm" onClick={handleAddMenuClick} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Menu
                </Button>
              </div>
            </div>

            {filteredMenuItems.length > 0 ? (
              <>
                <div className="overflow-x-auto rounded-lg border border-border/50 bg-card/50">
                  <Table className="w-full">
                    <TableHeader className="bg-muted/30">
                      <TableRow key="header-row" className="border-border hover:bg-muted/50">
                        <TableHead className="font-bold text-foreground whitespace-nowrap min-w-[150px] px-4 py-3 text-sm">Item Name</TableHead>
                        <TableHead className="font-bold text-foreground whitespace-nowrap min-w-[100px] px-4 py-3 text-sm">Price</TableHead>
                        <TableHead className="font-bold text-foreground whitespace-nowrap min-w-[120px] px-4 py-3 text-sm">Category</TableHead>
                        <TableHead className="font-bold text-foreground whitespace-nowrap min-w-[150px] px-4 py-3 text-sm">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentMenuItems.map((item, index) => (
                        <TableRow key={item._id || `item-${index}`} className="border-border hover:bg-muted/70 transition-all duration-200 group">
                          <TableCell className="font-semibold text-foreground whitespace-nowrap px-4 py-4">
                            {item.itemName}
                          </TableCell>
                          <TableCell className="text-foreground whitespace-nowrap px-4 py-4">
                            ₹{item.price}
                          </TableCell>
                          <TableCell className="text-foreground whitespace-nowrap px-4 py-4">
                            {item.category}
                          </TableCell>

                          <TableCell className="px-4 py-4">
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 transition-colors" onClick={() => handleViewClick(item)}>
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-900/20 transition-colors" onClick={() => handleEditClick(item)}>
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 transition-colors" onClick={() => handleDeleteClick(item)}>
                                <Trash className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {/* Pagination Controls */}
                <div className="mt-6 flex justify-center items-center space-x-2">
                  <Button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} variant="outline" size="sm">Previous</Button>
                  <span className="text-sm text-muted-foreground">Page {currentPage} of {Math.ceil(filteredMenuItems.length / itemsPerPage)}</span>
                  <Button onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredMenuItems.length / itemsPerPage)))} disabled={currentPage === Math.ceil(filteredMenuItems.length / itemsPerPage)} variant="outline" size="sm">Next</Button>
                </div>
              </>
            ) : (
              <div className="text-center py-6 sm:py-8 lg:py-12">
                <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 lg:mb-6">
                  <Search className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-slate-400" />
                </div>
                <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-slate-900 dark:text-white mb-2">No Menu Items Found</h3>
                <p className="text-xs sm:text-sm lg:text-base text-slate-500 dark:text-slate-400">No menu items have been added yet.</p>
              </div>
            )}
            </>
          )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      {menuItemToDelete && (
        <AlertDialog open={!!menuItemToDelete} onOpenChange={(open) => !open && handleDeleteCancel()}>
          <AlertDialogContent className="max-w-sm sm:max-w-md mx-4">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-base sm:text-lg lg:text-xl">Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription className="text-xs sm:text-sm lg:text-base">
                This action cannot be undone. This will permanently delete the menu item
                and remove it from the menu.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
              <AlertDialogCancel onClick={handleDeleteCancel} className="w-full sm:w-auto text-xs sm:text-sm">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm} className="w-full sm:w-auto text-xs sm:text-sm">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* View Menu Item Dialog */}
      {menuItemToView && (
        <Dialog open={!!menuItemToView} onOpenChange={(open) => !open && handleViewClose()}>
          <DialogContent className="max-w-sm sm:max-w-md lg:max-w-lg mx-4">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg lg:text-xl">{menuItemToView.itemName}</DialogTitle>
              <DialogDescription className="text-xs sm:text-sm lg:text-base">
                Menu item details
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-3 sm:py-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-muted-foreground">Item Name</Label>
                  <p className="text-sm text-foreground">{menuItemToView.itemName}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-muted-foreground">Price</Label>
                  <p className="text-sm text-foreground">₹{menuItemToView.price}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-muted-foreground">Category</Label>
                  <p className="text-sm text-foreground">{menuItemToView.category}</p>
                </div>
                {menuItemToView.description && (
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-muted-foreground">Description</Label>
                    <p className="text-sm text-foreground">{menuItemToView.description}</p>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
              <Button onClick={handleViewClose} className="w-full sm:w-auto text-xs sm:text-sm">Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Menu Item Dialog */}
      {menuItemToEdit && (
        <Dialog open={!!menuItemToEdit} onOpenChange={(open) => !open && handleEditClose()}>
          <DialogContent className="max-w-sm sm:max-w-md lg:max-w-lg mx-4">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg lg:text-xl">Edit Menu Item</DialogTitle>
              <DialogDescription className="text-xs sm:text-sm lg:text-base">
                Update the menu item details
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-3 sm:py-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-muted-foreground">Item Name</Label>
                  <Input
                    value={menuItemToEdit.itemName}
                    onChange={(e) => setMenuItemToEdit({ ...menuItemToEdit, itemName: e.target.value })}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-muted-foreground">Price</Label>
                  <Input
                    type="number"
                    value={menuItemToEdit.price}
                    onChange={(e) => setMenuItemToEdit({ ...menuItemToEdit, price: parseFloat(e.target.value) })}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-muted-foreground">Category</Label>
                  <Input
                    value={menuItemToEdit.category || ''}
                    onChange={(e) => setMenuItemToEdit({ ...menuItemToEdit, category: e.target.value })}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-muted-foreground">Description</Label>
                  <Input
                    value={menuItemToEdit.description || ''}
                    onChange={(e) => setMenuItemToEdit({ ...menuItemToEdit, description: e.target.value })}
                    className="text-sm"
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
              <Button onClick={handleEditClose} variant="outline" className="w-full sm:w-auto text-xs sm:text-sm">Cancel</Button>
              <Button onClick={() => handleEditSave(menuItemToEdit)} className="w-full sm:w-auto text-xs sm:text-sm">Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Menu Dialog */}
      <Dialog open={addMenuDialogOpen} onOpenChange={setAddMenuDialogOpen}>
        <DialogContent className="max-w-sm sm:max-w-md lg:max-w-2xl mx-4">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg lg:text-xl flex items-center gap-2">
              <Plus className="h-5 w-5 text-[#6F42C1]" />
              Add New Menu Item
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm lg:text-base">
              Select a category and add menu item details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-3 sm:py-4">
            {isLoadingCategories ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3 animate-spin">
                  <RefreshCw className="h-4 w-4 text-slate-400" />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Loading categories...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="itemName">Item Name</Label>
                    <Input
                      id="itemName"
                      value={newMenuItem.itemName}
                      onChange={(e) => setNewMenuItem({ ...newMenuItem, itemName: e.target.value })}
                      placeholder="Enter item name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price</Label>
                    <Input
                      id="price"
                      type="number"
                      value={newMenuItem.price}
                      onChange={(e) => setNewMenuItem({ ...newMenuItem, price: e.target.value })}
                      placeholder="Enter price"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <select
                      id="category"
                      value={newMenuItem.categoryId}
                      onChange={(e) => {
                        const selectedCategory = menuCategories.find(cat => cat._id === e.target.value)
                        setNewMenuItem({
                          ...newMenuItem,
                          categoryId: e.target.value,
                          category: selectedCategory ? selectedCategory.categoryName : ''
                        })
                      }}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="">Select a category</option>
                      {menuCategories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.categoryName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <select
                      id="status"
                      value={newMenuItem.status}
                      onChange={(e) => setNewMenuItem({ ...newMenuItem, status: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>

                </div>

                {/* Add New Category Section */}
                <div className="border-t border-border pt-4 mt-4">
                  <h3 className="text-sm font-medium text-foreground mb-3">Add New Category</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="categoryName">Category Name</Label>
                      <Input
                        id="categoryName"
                        value={newCategory.categoryName}
                        onChange={(e) => setNewCategory({ ...newCategory, categoryName: e.target.value })}
                        placeholder="Enter category name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="categoryStatus">Status</Label>
                      <select
                        id="categoryStatus"
                        value={newCategory.status}
                        onChange={(e) => setNewCategory({ ...newCategory, status: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-3">
                    <Button
                      onClick={handleAddCategory}
                      disabled={isAddingCategory}
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto"
                    >
                      {isAddingCategory ? 'Adding...' : 'Add Category'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
            <Button onClick={() => setAddMenuDialogOpen(false)} variant="outline" className="w-full sm:w-auto text-xs sm:text-sm">Cancel</Button>
            <Button onClick={handleAddMenuSave} disabled={isAddingMenuItem} className="w-full sm:w-auto text-xs sm:text-sm">
              {isAddingMenuItem ? 'Adding...' : 'Submit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}

export default MenusPage