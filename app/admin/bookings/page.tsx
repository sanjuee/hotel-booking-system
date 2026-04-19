

// FIX THE Handleststuschange and Remove NO-SHOW from all files

'use client'

import { Booking } from '@/types'
import { useState, useEffect } from 'react'
import { Search, Plus, X, Calendar as CalendarIcon } from 'lucide-react'

// Define our complex nested type based on the Prisma include


export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [availableUnits, setAvailableUnits] = useState<any[]>([])
  
  // Form State
  const [formData, setFormData] = useState({
    guestName: '', email: '', phone: '', checkInDate: '', 
    checkOutDate: '', totalPrice: '', roomUnitId: ''
  })

  useEffect(() => {
    fetchBookings()
    fetchRoomUnits() // Fetch physical rooms for the manual booking dropdown
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

  const fetchRoomUnits = async () => {
    try {
      // Reusing the front-desk API to get all physical units
      const res = await fetch('/api/front-desk') 
      if (res.ok) setAvailableUnits(await res.json())
    } catch (error) {
      console.error(error)
    }
  }

  const handleStatusChange = async (booking: Booking, newStatus: string) => {
    try {
      const res = await fetch('/api/admin/front-desk/action', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        // FIX 1: Matched the backend variable names
        body: JSON.stringify({ 
          bookingId: booking.id, 
          action: newStatus, 
          roomUnitId: booking.roomUnit.id  
        })
      })

      if (res.ok){
        // We map the action back to the display status (e.g., 'CANCEL' -> 'CANCELLED')
        const displayStatus = newStatus === 'CANCEL' ? 'CANCELLED' 
                            : newStatus === 'NO_SHOW' ? 'CANCELLED' 
                            : newStatus;

        setBookings(prev => prev.map(b => b.id === booking.id ? { ...b, status: displayStatus as any } : b))
      } else {
        const errorData = await res.json()
        alert(errorData.error || "Failed to update status")
        fetchBookings() // Revert on failure
      }
    } catch (error) {
      alert("Network error: Failed to update status")
      fetchBookings() // Revert on failure
    }
  }

  const handleCreateBooking = async (e: React.SubmitEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/admin/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (!res.ok) throw new Error("Failed to create booking")
      
      const newBooking = await res.json()
      setBookings([newBooking, ...bookings]) // Add to top of list
      setIsModalOpen(false)
      setFormData({ guestName: '', email: '', phone: '', checkInDate: '', checkOutDate: '', totalPrice: '', roomUnitId: '' })
    } catch (error) {
      alert(error)
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
          <p className="text-slate-500 mt-1">Manage reservations, cancellations, and call-in guests.</p>
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
                      ₹{booking.totalPrice.toFixed(2)}
                    </td>
                    
                    <td className="px-6 py-4">
                      <select
                        value={booking.status}
                        onChange={(e) => handleStatusChange(booking, e.target.value)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-full border outline-none appearance-none cursor-pointer ${
                          booking.status === 'CONFIRMED' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          booking.status === 'CHECKED_IN' ? 'bg-green-50 text-green-700 border-green-200' :
                          booking.status === 'CANCELLED' || 'NO_SHOW' ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="CHECKED_IN">CHECKED IN</option>
                        <option value="CHECKED_OUT">CHECKED OUT</option>
                        <option value="CANCELLED">CANCELLED</option>
                        <option value="NO_SHOW">NO-SHOW</option>
                      </select>
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
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">New Call-in Booking</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleCreateBooking} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Guest Name</label>
                  <input required type="text" value={formData.guestName} onChange={e => setFormData({...formData, guestName: e.target.value})} className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-600" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone</label>
                  <input required type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-600" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Check In</label>
                  <input required type="date" value={formData.checkInDate} onChange={e => setFormData({...formData, checkInDate: e.target.value})} className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-600" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Check Out</label>
                  <input required type="date" value={formData.checkOutDate} onChange={e => setFormData({...formData, checkOutDate: e.target.value})} className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-600" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Total Price (₹)</label>
                  <input required type="number" step="0.01" value={formData.totalPrice} onChange={e => setFormData({...formData, totalPrice: e.target.value})} className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-600" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Assign Physical Room</label>
                  <select required value={formData.roomUnitId} onChange={e => setFormData({...formData, roomUnitId: e.target.value})} className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-600 bg-white">
                    <option value="">Select a unit...</option>
                    {availableUnits.map(unit => (
                      <option key={unit.id} value={unit.id}>Unit {unit.roomNumber} ({unit.room?.name})</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="pt-4 flex justify-end gap-3 mt-6 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">Confirm Booking</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}