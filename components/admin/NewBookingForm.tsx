'use client'

import { useState, useEffect } from "react"
import { X } from "lucide-react"

// 1. Define all the optional configuration props
interface BookingFormProps {
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onSuccess?: () => void;            // To refresh the parent page's data
  initialCheckInDate?: string; 
  initialRoomId?: string;      
  initialRoomNumber?: string;      
  initialRoomType?: string;      
  initialTotalPrice?: number;  
  maxCheckOutDate?: string;    
  isRoomReadOnly?: boolean;    
}

export default function NewBookingForm({ 
  setIsModalOpen,
  onSuccess,
  initialCheckInDate = '',
  initialRoomId = '',
  initialRoomNumber = '',
  initialRoomType = '',
  initialTotalPrice = 0,
  maxCheckOutDate,
  isRoomReadOnly = false
}: BookingFormProps) {

  // 2. Initialize state using the passed-in props
  const [formData, setFormData] = useState({
    guestName: '',
    email: '',
    phone: '',
    checkInDate: initialCheckInDate, 
    checkOutDate: '',
    totalPrice: initialTotalPrice > 0 ? initialTotalPrice.toString() : '',
    roomUnitId: initialRoomId
  })

  // 3. State to hold the dropdown options
  const [availableUnits, setAvailableUnits] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 4. Fetch the physical rooms for the dropdown when the modal opens
  useEffect(() => {
    // Only bother fetching if we actually need the dropdown
    if (!isRoomReadOnly) {
      fetch('/api/admin/front-desk')
        .then(res => res.json())
        .then(data => setAvailableUnits(data.liveRooms || []))
        .catch(err => console.error("Failed to fetch units", err))
    }
  }, [isRoomReadOnly])

  const handleCreateBooking = async (e: React.FormEvent) => { // Fixed to FormEvent
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const res = await fetch('/api/admin/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (!res.ok) throw new Error("Failed to create booking")
      
      if (onSuccess) onSuccess() // Trigger parent refresh!
      setIsModalOpen(false)      // Close the modal
      
    } catch (error: any) {
      alert(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
        
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">
            {isRoomReadOnly ? 'Walk-in Registration' : 'New Call-in Booking'}
          </h2>
          <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700">
            <X size={24} />
          </button>
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
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
              <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-600" />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Check In</label>
              <input required type="date" value={formData.checkInDate} onChange={e => setFormData({...formData, checkInDate: e.target.value})} className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-600" />
            </div>
            
            {/* 🚨 UPDATED CHECK OUT DATE */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Check Out</label>
              <input 
                required 
                type="date" 
                max={maxCheckOutDate} // Uses the HTML max attribute to block overlapping dates
                value={formData.checkOutDate} 
                onChange={e => setFormData({...formData, checkOutDate: e.target.value})} 
                className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-600" 
              />
              {maxCheckOutDate && (
                <p className="text-[10px] font-bold text-red-500 mt-1 uppercase">Must check out by {maxCheckOutDate}</p>
              )}
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Total Price (₹)</label>
              <input required type="number" step="0.01" value={formData.totalPrice} onChange={e => setFormData({...formData, totalPrice: e.target.value})} className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-600" />
            </div>
            
            {/* 🚨 UPDATED ROOM SELECTOR */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Assign Physical Room</label>
              {isRoomReadOnly ? (
                // Walk-in Mode: Block the receptionist from changing the room
                <input 
                  type="text" 
                  disabled 
                  value={`${initialRoomNumber} (${initialRoomType})`} 
                  className="w-full p-2.5 border bg-slate-100 text-slate-500 rounded-lg font-medium cursor-not-allowed" 
                />
              ) : (
                // Call-in Mode: Let the receptionist pick any available room
                <select required value={formData.roomUnitId} onChange={e => setFormData({...formData, roomUnitId: e.target.value})} className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-600 bg-white">
                  <option value="">Select a unit...</option>
                  {availableUnits.map(unit => (
                    <option key={unit.id} value={unit.id}>Unit {unit.roomNumber} ({unit.room?.name})</option>
                  ))}
                </select>
              )}
            </div>

          </div>
          
          <div className="pt-4 flex justify-end gap-3 mt-6 border-t border-slate-100">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
              {isSubmitting ? 'Processing...' : 'Confirm Booking'}
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}