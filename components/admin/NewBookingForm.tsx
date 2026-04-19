'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

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

export default function NewBookingForm({
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
    // Fixed to FormEvent
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const res = await fetch('/api/admin/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
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
        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-slate-200 bg-slate-50/50">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {isRoomReadOnly ? 'Walk-in Registration' : 'New Call-in Booking'}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {isRoomReadOnly
                ? 'Register a guest for a physical room.'
                : 'Create a new reservation in the system.'}
            </p>
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
              <h3 className="text-sm font-medium text-slate-900">
                Guest Information
              </h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Guest Name
              </label>
              <input
                required
                type="text"
                placeholder="e.g. Jane Doe"
                value={formData.guestName}
                onChange={(e) =>
                  setFormData({ ...formData, guestName: e.target.value })
                }
                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm shadow-sm placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Phone Number
              </label>
              <input
                required
                inputMode='numeric'
                type="tel"
                placeholder=""
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm shadow-sm placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>

            <div className="col-span-1 sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email Address
              </label>
              <input
                required
                type="email"
                placeholder="jane@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm shadow-sm placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>

            {/* Stay Info Section */}
            <div className="col-span-1 sm:col-span-2 pb-2 border-b border-slate-100 mt-2 mb-2">
              <h3 className="text-sm font-medium text-slate-900">
                Stay Details
              </h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Check In
              </label>
              <input
                required
                type="date"
                value={formData.checkInDate}
                onChange={(e) =>
                  setFormData({ ...formData, checkInDate: e.target.value })
                }
                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm shadow-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Check Out
              </label>
              <input
                required
                type="date"
                max={maxCheckOutDate}
                value={formData.checkOutDate}
                onChange={(e) =>
                  setFormData({ ...formData, checkOutDate: e.target.value })
                }
                className={`w-full px-3 py-2.5 bg-white border rounded-lg text-sm shadow-sm text-slate-700 outline-none transition-all ${
                  maxCheckOutDate && formData.checkOutDate > maxCheckOutDate
                    ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                    : 'border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                }`}
              />
              {maxCheckOutDate && (
                <p className="text-xs text-red-500 mt-1.5 font-medium flex items-center gap-1">
                  Must check out by {maxCheckOutDate}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Total Price (₹)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-slate-500 sm:text-sm">₹</span>
                </div>
                <input
                  required
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.totalPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, totalPrice: e.target.value })
                  }
                  className="w-full pl-7 pr-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm shadow-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Assign Physical Room
              </label>
              {isRoomReadOnly ? (
                <input
                  type="text"
                  disabled
                  value={`${initialRoomNumber} (${initialRoomType})`}
                  className="w-full px-3 py-2.5 border border-slate-200 bg-slate-50 text-slate-500 rounded-lg text-sm shadow-inner cursor-not-allowed"
                />
              ) : (
                <select
                  required
                  value={formData.roomUnitId}
                  onChange={(e) =>
                    setFormData({ ...formData, roomUnitId: e.target.value })
                  }
                  className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm shadow-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                >
                  <option value="" className="text-slate-500">
                    Select an available unit...
                  </option>
                  {availableUnits.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      Unit {unit.roomNumber} • {unit.room?.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* FOOTER ACTIONS */}
          <div className="pt-5 mt-8 border-t border-slate-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-white text-slate-700 text-sm font-medium border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center min-w-[140px]"
            >
              {isSubmitting ? 'Processing...' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
