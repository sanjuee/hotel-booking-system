'use client'

import { useState, useEffect } from 'react'
import { X, CheckCircle2, CalendarDays, AlertTriangle } from 'lucide-react'
import { Room } from '@/types'

interface BookingFormProps {
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>
  onSuccess?: () => void 
  initialCheckInDate?: string
  initialRoomId?: string
  initialRoomNumber?: string
  initialRoomType?: string
  initialTotalPrice?: number // 👈 Used as the Base Price for Front Desk walk-ins!
  maxCheckOutDate?: string
  isRoomReadOnly?: boolean
  isCallInMode?: boolean 
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
  isCallInMode = false, 
}: BookingFormProps) {
  
  const [formData, setFormData] = useState({
    guestName: '',
    email: '',
    phone: '',
    checkInDate: initialCheckInDate,
    checkOutDate: '',
    totalPrice: initialTotalPrice > 0 ? initialTotalPrice.toString() : '',
    roomUnitId: initialRoomId,
    roomId: '', 
  })

  // 🚨 REMOVED the obsolete availableUnits state!
  const [roomCategories, setRoomCategories] = useState<Room[]>([]) 
  const [isSubmitting, setIsSubmitting] = useState(false)

  const today = new Date().toISOString().split('T')[0];
  const isWalkIn = formData.checkInDate === today;
  const isBlockedWalkIn = isCallInMode && isWalkIn;

  // 1. DATA FETCHER: Only fetch Categories, and ONLY if we are in Call-In mode.
  useEffect(() => {
    if (isCallInMode) {
      fetch('/api/admin/room-categories')
        .then((res) => res.json())
        .then((data) => setRoomCategories(data))
        .catch((err) => console.error('Failed to fetch categories', err))
    }
  }, [isCallInMode])

  // 2. 🚨 THE GLOBAL PRICE ENGINE 🚨
  // Automatically calculates total price for BOTH Call-ins and Front Desk walk-ins!
  useEffect(() => {
    if (formData.checkInDate && formData.checkOutDate) {
      const start = new Date(formData.checkInDate);
      const end = new Date(formData.checkOutDate);
      const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      
      if (nights > 0) {
        let currentBasePrice = 0;
        
        if (isCallInMode && formData.roomId) {
          // If Call-In: Find the price of the selected category
          const selectedCat = roomCategories.find(cat => cat.id === formData.roomId);
          if (selectedCat) currentBasePrice = selectedCat.price;
        } else if (!isCallInMode) {
          // If Front Desk: Use the initial price passed in from the room card
          currentBasePrice = initialTotalPrice;
        }

        // Only update if we have a valid base price
        if (currentBasePrice > 0) {
          setFormData(prev => ({ ...prev, totalPrice: String(nights * currentBasePrice) }));
        }
      } else {
        // Clear price if dates are invalid/backwards
        setFormData(prev => ({ ...prev, totalPrice: '' }));
      }
    }
  }, [formData.checkInDate, formData.checkOutDate, formData.roomId, isCallInMode, roomCategories, initialTotalPrice]);

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isBlockedWalkIn) return; 
    setIsSubmitting(true)

    try {
      const res = await fetch('/api/admin/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          status: isCallInMode ? 'CONFIRMED' : (isWalkIn ? 'CHECKED_IN' : 'CONFIRMED')
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create booking')

      if (onSuccess) onSuccess() 
      setIsModalOpen(false) 
    } catch (error: any) {
      alert(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        <div className={`flex justify-between items-center px-6 py-5 border-b transition-colors shrink-0 ${
          !isCallInMode && isWalkIn ? 'bg-green-50 border-green-100' : 'bg-slate-50/50 border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            {(!isCallInMode && isWalkIn) ? (
              <div className="p-2 bg-green-100 text-green-600 rounded-full"><CheckCircle2 size={24} /></div>
            ) : (
              <div className="p-2 bg-blue-100 text-blue-600 rounded-full"><CalendarDays size={24} /></div>
            )}
            <div>
              <h2 className={`text-lg font-bold ${!isCallInMode && isWalkIn ? 'text-green-900' : 'text-slate-900'}`}>
                {isCallInMode ? 'New Call-in Booking' : (isWalkIn ? 'Direct Walk-in Check-In' : 'New Future Booking')}
              </h2>
              <p className={`text-sm mt-0.5 font-medium ${!isCallInMode && isWalkIn ? 'text-green-700' : 'text-slate-500'}`}>
                {isCallInMode 
                  ? 'Auto-allocate a room for a future caller.' 
                  : (isWalkIn ? 'Guest is arriving today. They will be checked in immediately.' : 'Create a confirmed reservation for a future date.')}
              </p>
            </div>
          </div>
          <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"><X size={20} /></button>
        </div>

        <form onSubmit={handleCreateBooking} className="flex flex-col overflow-hidden">
          
          <div className="p-6 overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
              
              <div className="col-span-1 sm:col-span-2 pb-2 border-b border-slate-100 mb-2">
                <h3 className="text-sm font-medium text-slate-900 uppercase tracking-wider">Guest Information</h3>
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

              <div className="col-span-1 sm:col-span-2 pb-2 border-b border-slate-100 mt-2 mb-2">
                <h3 className="text-sm font-medium text-slate-900 uppercase tracking-wider">Stay Details</h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Check In</label>
                <input required type="date" min={today} value={formData.checkInDate} onChange={(e) => setFormData({ ...formData, checkInDate: e.target.value })} className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm shadow-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Check Out</label>
                <input required type="date" max={maxCheckOutDate} value={formData.checkOutDate} onChange={(e) => setFormData({ ...formData, checkOutDate: e.target.value })} className={`w-full px-3 py-2.5 bg-white border rounded-lg text-sm shadow-sm text-slate-700 outline-none ${ maxCheckOutDate && formData.checkOutDate > maxCheckOutDate ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500' }`} />
                {maxCheckOutDate && <p className="text-[11px] text-red-500 mt-1.5 font-bold uppercase flex items-center gap-1">Must check out by {maxCheckOutDate}</p>}
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
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  {isCallInMode ? 'Select Room Category' : 'Assign Physical Room'}
                </label>
                
                {/* 🚨 REMOVED the obsolete Physical Unit dropdown. Now it strictly toggles between Category Select or Read-Only! */}
                {isCallInMode ? (
                  <select required value={formData.roomId} onChange={(e) => setFormData({ ...formData, roomId: e.target.value })} className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm shadow-sm outline-none focus:border-blue-500 focus:ring-1">
                    <option value="">Select a category...</option>
                    {roomCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name} - Base: ₹{cat.price}</option>
                    ))}
                  </select>
                ) : (
                  <input type="text" disabled value={`Unit ${initialRoomNumber} (${initialRoomType})`} className="w-full px-3 py-2.5 border border-slate-200 bg-slate-50 text-slate-500 font-medium rounded-lg text-sm shadow-inner cursor-not-allowed" />
                )}
              </div>

              {isBlockedWalkIn && (
                <div className="col-span-1 sm:col-span-2 p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-start gap-3 mt-2 animate-in slide-in-from-bottom-2">
                  <AlertTriangle className="text-orange-500 mt-0.5 shrink-0" size={20} />
                  <div>
                    <h4 className="text-sm font-bold text-orange-900">Please use the Front Desk</h4>
                    <p className="text-xs text-orange-700 mt-1 font-medium leading-relaxed">
                      Because this guest is arriving <b>today</b>, they need a physical room assignment immediately. Please close this modal, go to the <b className="text-orange-900">Live Front Desk</b> tab, and click an available green room to check them in.
                    </p>
                  </div>
                </div>
              )}

            </div>
          </div>

          <div className="px-6 py-5 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 shrink-0">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2.5 bg-white text-slate-700 text-sm font-bold border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting || isBlockedWalkIn} 
              className={`px-5 py-2.5 text-white text-sm font-bold rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[160px] ${
                isBlockedWalkIn ? 'bg-slate-400' : (!isCallInMode && isWalkIn ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700')
              }`}
            >
              {isSubmitting ? 'Processing...' : (isBlockedWalkIn ? 'Action Blocked' : (!isCallInMode && isWalkIn ? 'Confirm & Check In' : 'Confirm Auto-Allocation'))}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}