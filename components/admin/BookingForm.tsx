'use client'

import { useState, useEffect } from 'react'
import { X, CheckCircle2, CalendarDays } from 'lucide-react'

// 1. Define all the optional configuration props
interface BookingFormProps {
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>
  onSuccess?: () => void // To refresh the parent page's data
  initialCheckInDate?: string
  initialRoomId?: string
  initialRoomNumber?: string
  initialRoomType?: string
  initialTotalPrice?: number
  maxCheckOutDate?: string
  isRoomReadOnly?: boolean
}

export default function BookingForm({
  setIsModalOpen,
  onSuccess,
  initialCheckInDate = '',
  initialRoomId = '',
  initialRoomNumber = '',
  initialRoomType = '',
  initialTotalPrice = 0,
  maxCheckOutDate,
  isRoomReadOnly = false,
}: BookingFormProps) {
  // 2. Initialize state using the passed-in props
  const [formData, setFormData] = useState({
    guestName: '',
    email: '',
    phone: '',
    checkInDate: initialCheckInDate,
    checkOutDate: '',
    totalPrice: initialTotalPrice > 0 ? initialTotalPrice.toString() : '',
    roomUnitId: initialRoomId,
  })

  // 3. State to hold the dropdown options
  const [availableUnits, setAvailableUnits] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 🚨 SMART DATE CALCULATION
  const today = new Date().toISOString().split('T')[0];
  const isWalkIn = formData.checkInDate === today;

  // 4. Fetch the physical rooms for the dropdown when the modal opens
  useEffect(() => {
    // Only bother fetching if we actually need the dropdown
    if (!isRoomReadOnly) {
      fetch('/api/admin/front-desk')
        .then((res) => res.json())
        .then((data) => setAvailableUnits(data.liveRooms || []))
        .catch((err) => console.error('Failed to fetch units', err))
    }
  }, [isRoomReadOnly])

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const res = await fetch('/api/admin/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // 🚨 DYNAMIC PAYLOAD: Send the correct status based on the date!
        body: JSON.stringify({
          ...formData,
          status: isWalkIn ? 'CHECKED_IN' : 'CONFIRMED'
        }),
      })

      if (!res.ok) throw new Error('Failed to create booking')

      if (onSuccess) onSuccess() // Trigger parent refresh!
      setIsModalOpen(false) // Close the modal
    } catch (error: any) {
      alert(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* DYNAMIC HEADER */}
        <div className={`flex justify-between items-center px-6 py-5 border-b transition-colors ${
          isWalkIn ? 'bg-green-50 border-green-100' : 'bg-slate-50/50 border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            {isWalkIn ? (
              <div className="p-2 bg-green-100 text-green-600 rounded-full">
                <CheckCircle2 size={24} />
              </div>
            ) : (
              <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
                <CalendarDays size={24} />
              </div>
            )}
            <div>
              <h2 className={`text-lg font-bold ${isWalkIn ? 'text-green-900' : 'text-slate-900'}`}>
                {isWalkIn ? 'Direct Walk-in Check-In' : 'New Future Booking'}
              </h2>
              <p className={`text-sm mt-0.5 font-medium ${isWalkIn ? 'text-green-700' : 'text-slate-500'}`}>
                {isWalkIn
                  ? 'Guest is arriving today. They will be checked in immediately.'
                  : 'Create a confirmed reservation for a future date.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsModalOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleCreateBooking} className="p-6">
          {/* FORM GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
            
            {/* Guest Info Section */}
            <div className="col-span-1 sm:col-span-2 pb-2 border-b border-slate-100 mb-2">
              <h3 className="text-sm font-medium text-slate-900 uppercase tracking-wider">
                Guest Information
              </h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Guest Name</label>
              <input required type="text" placeholder="e.g. Jane Doe" value={formData.guestName} onChange={(e) => setFormData({ ...formData, guestName: e.target.value })} className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm shadow-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number</label>
              <input required inputMode='numeric' type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm shadow-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
            </div>

            <div className="col-span-1 sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
              <input required type="email" placeholder="jane@example.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm shadow-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
            </div>

            {/* Stay Info Section */}
            <div className="col-span-1 sm:col-span-2 pb-2 border-b border-slate-100 mt-2 mb-2">
              <h3 className="text-sm font-medium text-slate-900 uppercase tracking-wider">
                Stay Details
              </h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Check In</label>
              <input required type="date" min={today} value={formData.checkInDate} onChange={(e) => setFormData({ ...formData, checkInDate: e.target.value })} className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm shadow-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Check Out</label>
              <input required type="date" max={maxCheckOutDate} value={formData.checkOutDate} onChange={(e) => setFormData({ ...formData, checkOutDate: e.target.value })} className={`w-full px-3 py-2.5 bg-white border rounded-lg text-sm shadow-sm text-slate-700 outline-none ${ maxCheckOutDate && formData.checkOutDate > maxCheckOutDate ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500' }`} />
              {maxCheckOutDate && (
                <p className="text-[11px] text-red-500 mt-1.5 font-bold uppercase flex items-center gap-1">Must check out by {maxCheckOutDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Total Price (₹)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-slate-500 sm:text-sm font-medium">₹</span>
                </div>
                <input required type="number" step="0.01" placeholder="0.00" value={formData.totalPrice} onChange={(e) => setFormData({ ...formData, totalPrice: e.target.value })} className="w-full pl-7 pr-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm shadow-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Assign Physical Room</label>
              {isRoomReadOnly ? (
                <input type="text" disabled value={`${initialRoomNumber} (${initialRoomType})`} className="w-full px-3 py-2.5 border border-slate-200 bg-slate-50 text-slate-500 font-medium rounded-lg text-sm shadow-inner cursor-not-allowed" />
              ) : (
                <select required value={formData.roomUnitId} onChange={(e) => setFormData({ ...formData, roomUnitId: e.target.value })} className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm shadow-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                  <option value="" className="text-slate-500">Select an available unit...</option>
                  {availableUnits.map((unit) => (
                    <option key={unit.id} value={unit.id}>Unit {unit.roomNumber} • {unit.room?.name}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* DYNAMIC FOOTER ACTIONS */}
          <div className="pt-5 mt-8 border-t border-slate-200 flex justify-end gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2.5 bg-white text-slate-700 text-sm font-bold border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className={`px-5 py-2.5 text-white text-sm font-bold rounded-lg transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center min-w-[160px] ${
              isWalkIn ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
            }`}>
              {isSubmitting ? 'Processing...' : isWalkIn ? 'Confirm & Check In' : 'Confirm Future Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}