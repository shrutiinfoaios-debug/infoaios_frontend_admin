"use client"

import LayoutWithSidebar from "@/components/layout-with-sidebar"

export default function ExamplePage() {
  const handleLogout = () => {
    // Implement your logout logic here
    console.log("User logged out")
    // For example: router.push('/login')
  }

  return (
    <LayoutWithSidebar cafeName="Basil the Other Side" ownerName="Rajesh Kumar" onLogout={handleLogout}>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>

          {/* Sample Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Today's Calls</h2>
              <p className="text-3xl font-bold text-purple-600">47</p>
              <p className="text-sm text-gray-500">+12% from yesterday</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Bookings</h2>
              <p className="text-3xl font-bold text-purple-600">23</p>
              <p className="text-sm text-gray-500">+8% from yesterday</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Revenue</h2>
              <p className="text-3xl font-bold text-purple-600">₹12,450</p>
              <p className="text-sm text-gray-500">+22% from yesterday</p>
            </div>
          </div>

          {/* Sample Table */}
          <div className="mt-8 bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div>
                    <p className="font-medium text-gray-900">New booking from Rajesh Kumar</p>
                    <p className="text-sm text-gray-500">Table for 4 people at 7:30 PM</p>
                  </div>
                  <span className="text-sm text-gray-500">2 minutes ago</span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div>
                    <p className="font-medium text-gray-900">Order completed</p>
                    <p className="text-sm text-gray-500">₹850 - Butter Chicken & Naan</p>
                  </div>
                  <span className="text-sm text-gray-500">5 minutes ago</span>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-gray-900">AI handled customer inquiry</p>
                    <p className="text-sm text-gray-500">Menu information provided</p>
                  </div>
                  <span className="text-sm text-gray-500">8 minutes ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LayoutWithSidebar>
  )
}
