'use client'

import { Booking } from '@/types'
import { useState, useEffect } from 'react'
import { Search, Plus, Calendar as CalendarIcon } from 'lucide-react'
import NewBookingForm from '@/components/admin/NewBookingForm'

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Notice how clean this is now! We deleted all the formData and availableUnits state 
  // because the NewBookingForm component handles all of that internally now.

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/admin/bookings')
      if (res.ok) setBookings(await res.json())
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (booking: Booking, actionName: string) => {
    try {
      const res = await fetch('/api/admin/front-desk/action', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          bookingId: booking.id, 
          action: actionName, 
          roomUnitId: booking.roomUnit.id  
        })
      })

      if (res.ok) {
        let newDisplayStatus = 'CONFIRMED';
        if (actionName === 'CHECK_IN') newDisplayStatus = 'CHECKED_IN';
        if (actionName === 'CHECK_OUT') newDisplayStatus = 'CHECKED_OUT';
        if (actionName === 'CANCEL') newDisplayStatus = 'CANCELLED';
        
        setBookings(prev => prev.map(b => 
          b.id === booking.id ? { ...b, status: newDisplayStatus as any } : b
        ))
      } else {
        const errorData = await res.json()
        alert(errorData.error || "Failed to update status")
        fetchBookings() // Revert UI on failure
      }
    } catch (error) {
      alert("Network error: Failed to update status")
      fetchBookings() // Revert UI on failure
    }
  }

  const filteredBookings = bookings.filter(b => 
    b.guestName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.roomUnit.roomNumber.includes(searchTerm)
  )

  if (isLoading) return <div className="p-12 text-slate-500">Loading ledger...</div>

  return (
    <div className="p-8 md:p-12 min-h-screen bg-slate-50/50">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Bookings Ledger</h1>
          <p className="text-slate-500 mt-1">Manage reservations, check-ins, and cancellations.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
        >
          <Plus size={18} /> Call-in Booking
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="mb-6 relative max-w-md">
        <Search className="absolute left-3 top-3 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Search by guest name or room number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg shadow-sm outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all"
        />
      </div>

      {/* DATA TABLE */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-xs tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Guest</th>
                <th className="px-6 py-4">Dates</th>
                <th className="px-6 py-4">Room</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBookings.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No bookings found.</td></tr>
              ) : (
                filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors">
                    
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{booking.guestName}</div>
                      <div className="text-xs text-slate-500">{booking.phone}</div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <CalendarIcon size={14} className="text-slate-400" />
                        {new Date(booking.checkInDate).toLocaleDateString()} <span className="text-slate-400 mx-1">→</span> {new Date(booking.checkOutDate).toLocaleDateString()}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-700">Unit {booking.roomUnit.roomNumber}</span>
                      <div className="text-xs text-slate-500 line-clamp-1">{booking.roomUnit.room.name}</div>
                    </td>
                    
                    <td className="px-6 py-4 font-medium text-slate-900">
                      ₹{booking.totalPrice?.toFixed(2)}
                    </td>
                    
                    <td className="px-6 py-4">
                      {/* 🚨 THE DYNAMIC STATUS ENGINE 🚨 */}
                      
                      {booking.status === 'CONFIRMED' ? (
                        <select
                          value="CONFIRMED" // Display current state
                          onChange={(e) => handleStatusChange(booking, e.target.value)}
                          className="text-xs font-bold px-3 py-1.5 rounded-full border bg-blue-50 text-blue-700 border-blue-200 outline-none cursor-pointer"
                        >
                          <option value="CONFIRMED" disabled>CONFIRMED</option>
                          <option value="CHECK_IN">CHECK IN GUEST</option>
                          <option value="CANCEL">CANCEL BOOKING</option>
                        </select>
                      ) : booking.status === 'CHECKED_IN' ? (
                        <select
                          value="CHECKED_IN" // Display current state
                          onChange={(e) => handleStatusChange(booking, e.target.value)}
                          className="text-xs font-bold px-3 py-1.5 rounded-full border bg-green-50 text-green-700 border-green-200 outline-none cursor-pointer"
                        >
                          <option value="CHECKED_IN" disabled>CHECKED IN</option>
                          <option value="CHECK_OUT">CHECK OUT GUEST</option>
                        </select>
                      ) : booking.status === 'CHECKED_OUT' ? (
                        // Terminal state: Read-only badge
                        <span className="text-[10px] font-bold px-3 py-1.5 rounded-full border bg-slate-100 text-slate-600 border-slate-200 uppercase tracking-wider cursor-not-allowed">
                          Checked Out
                        </span>
                      ) : (
                        // Terminal state: Read-only badge (CANCELLED)
                        <span className="text-[10px] font-bold px-3 py-1.5 rounded-full border bg-red-50 text-red-600 border-red-200 uppercase tracking-wider cursor-not-allowed">
                          Cancelled
                        </span>
                      )}
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CALL-IN BOOKING MODAL */}
      {isModalOpen && (
        <NewBookingForm 
          setIsModalOpen={setIsModalOpen} 
          onSuccess={fetchBookings} 
        />
      )}
    </div>
  )
}