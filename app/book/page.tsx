'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Info, CheckCircle, Users, XCircle } from 'lucide-react'
import Image from 'next/image'
import { Room } from '@/types'

export default function BookingPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Get the initial room ID from the URL if it exists
  const initialRoomId = searchParams?.get('roomId') || ''

  const [rooms, setRooms] = useState<Room[]>([])
  const [selectedRoomId, setSelectedRoomId] = useState<string>(initialRoomId)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSoldOut, setIsSoldOut] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    guestName: '',
    email: '',
    phone: '',
    checkInDate: '',
    checkOutDate: '',
    specialReq: '',
  })

  // Find the full room object based on the selected ID
  const selectedRoom = rooms.find((room) => room.id === selectedRoomId)

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const response = await fetch('/api/rooms')
        if (!response.ok) throw Error('Error fetching rooms')
        const data = (await response.json()) as { rooms: Room[] }
        setRooms(data.rooms)
      } catch (error) {
        console.log(error)
      }
    }
    fetchRoom()
  }, [])

  let calculatedNights = 0
  let calculatedTotal = 0

  if (formData.checkInDate && formData.checkOutDate && selectedRoom) {
    const start = new Date(formData.checkInDate)
    const end = new Date(formData.checkOutDate)
    // Calculate difference in days
    calculatedNights = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (calculatedNights > 0) {
      calculatedTotal = calculatedNights * Number(selectedRoom.price)
    }
  }

  // Validation function
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!selectedRoomId) newErrors.roomId = 'Please select a room for your stay'

    if (!formData.guestName.trim())
      newErrors.guestName = 'Full name is required'

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required'
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else {
      const cleanPhone = formData.phone.replace(/[\s-]/g, '')
      const indianPhoneRegex = /^(?:\+91|91|0)?[6-9]\d{9}$/

      if (!indianPhoneRegex.test(cleanPhone)) {
        newErrors.phone = 'Please enter a valid Indian 10-digit number'
      }
    }

    if (!formData.checkInDate)
      newErrors.checkInDate = 'Check-in date is required'

    if (!formData.checkOutDate) {
      newErrors.checkOutDate = 'Check-out date is required'
    } else if (
      formData.checkInDate &&
      new Date(formData.checkOutDate) <= new Date(formData.checkInDate)
    ) {
      newErrors.checkOutDate = 'Check-out must be after check-in'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    setIsSubmitting(true)

    try {
      const payload = {
        ...formData,
        roomId: selectedRoomId,
        totalPrice: calculatedTotal,
      }

      const response = await fetch('/api/admin/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.status === 409) {
        setIsSoldOut(true)
        setIsSubmitting(false)
        return
      }

      if (!response.ok) throw new Error('Booking failed')

      setIsSuccess(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error) {
      console.error(error)
      alert('Something went wrong.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' })
    }
  }

  if (isSoldOut) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-lg w-full p-8 sm:p-12 bg-white shadow-xl rounded-2xl border border-gray-100 text-center animate-in fade-in zoom-in duration-500">
          <div className="mx-auto w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-6">
            <XCircle className="h-10 w-10 text-orange-500" strokeWidth={2} />
          </div>
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">
            Suite Unavailable
          </h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            We apologize,{' '}
            <span className="font-medium text-gray-900">
              {formData.guestName || 'Guest'}
            </span>
            . The{' '}
            <span className="font-medium text-gray-900">
              {selectedRoom?.name || 'selected suite'}
            </span>{' '}
            is no longer available for your chosen dates.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setIsSoldOut(false)}
              className="w-full bg-[#7A633F] text-white py-3.5 rounded-lg font-medium tracking-wide hover:bg-[#685333] transition-all shadow-md hover:shadow-lg"
            >
              Modify Dates or Suite
            </button>
            <button
              onClick={() => router.push('/')}
              className="w-full bg-white text-gray-600 border border-gray-200 py-3.5 rounded-lg font-medium tracking-wide hover:bg-gray-50 transition-all"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  // --- SUCCESS VIEW ---
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-lg w-full p-8 sm:p-12 bg-white shadow-xl rounded-2xl border border-gray-100 text-center animate-in fade-in zoom-in duration-500">
          <div className="mx-auto w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" strokeWidth={2} />
          </div>
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">
            Booking Confirmed!
          </h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Thank you,{' '}
            <span className="font-medium text-gray-900">
              {formData.guestName}
            </span>
            . Your reservation for the{' '}
            <span className="font-medium text-gray-900">
              {selectedRoom?.name}
            </span>{' '}
            has been successfully placed. We've sent the complete booking
            details to{' '}
            <strong className="text-gray-900">{formData.email}</strong>.
          </p>
          <button
            onClick={() => router.push('/')}
            className="w-full bg-[#7A633F] text-white py-3.5 rounded-lg font-medium tracking-wide hover:bg-[#685333] transition-all shadow-md hover:shadow-lg"
          >
            Return to Home
          </button>
        </div>
      </div>
    )
  }

  // --- FORM VIEW ---
  return (
    <div className="min-h-screen bg-[#FDFBF7] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto p-8 sm:p-10 bg-white shadow-xl rounded-2xl border border-gray-100">
        <div className="mb-8 border-b border-gray-100 pb-6">
          <h1 className="text-3xl font-serif font-bold text-gray-900">
            Complete Your Booking
          </h1>
          <p className="text-gray-500 mt-2 text-sm">
            Please provide your details to secure your reservation.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* Room Selection & Preview */}
          <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Your Suite *
            </label>
            <select
              value={selectedRoomId}
              onChange={(e) => {
                setSelectedRoomId(e.target.value)
                if (errors.roomId) setErrors({ ...errors, roomId: '' })
              }}
              className={`w-full p-3 rounded-lg border outline-none transition-all bg-white mb-4
                ${
                  errors.roomId
                    ? 'border-red-500 focus:ring-2 focus:ring-red-200'
                    : 'border-gray-300 focus:ring-2 focus:ring-[#8B6E4E] focus:border-[#8B6E4E]'
                }`}
            >
              <option value="" disabled>
                -- Choose a Room --
              </option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name} - ₹{Number(room.price).toLocaleString()}/night
                </option>
              ))}
            </select>
            {errors.roomId && (
              <p className="text-red-500 text-xs mt-1.5 mb-3 font-medium">
                {errors.roomId}
              </p>
            )}

            {/* Selected Room Preview Card */}
            {selectedRoom && (
              <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg border border-gray-100 shadow-sm animate-in fade-in duration-300">
                <div className="relative w-full sm:w-1/3 h-32 sm:h-auto rounded-md overflow-hidden shrink-0">
                  <Image
                    src={
                      selectedRoom.image ||
                      'https://via.placeholder.com/300x200?text=No+Image'
                    }
                    alt={selectedRoom.name}
                    fill
                    className="object-cover"
                    unoptimized={true}
                  />
                </div>
                <div className="flex flex-col justify-center">
                  <h3 className="font-serif font-bold text-gray-900 text-lg">
                    {selectedRoom.name}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-2">
                    {selectedRoom.type}
                  </p>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {selectedRoom.description}
                  </p>

                  <div className="flex items-center gap-4 mt-auto">
                    <span className="font-bold text-[#8B6E4E]">
                      ₹{Number(selectedRoom.price).toLocaleString()}{' '}
                      <span className="text-xs text-gray-500 font-normal">
                        /night
                      </span>
                    </span>
                    {selectedRoom.capacity && (
                      <span className="flex items-center gap-1 text-xs text-gray-500 font-medium">
                        <Users size={14} /> {selectedRoom.capacity} Guests
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Row 1: Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Full Name *
            </label>
            <input
              type="text"
              value={formData.guestName}
              onChange={(e) => handleChange('guestName', e.target.value)}
              placeholder="e.g. Jane Doe"
              className={`w-full p-3 rounded-lg border outline-none transition-all
                ${
                  errors.guestName
                    ? 'border-red-500 focus:ring-2 focus:ring-red-200'
                    : 'border-gray-300 focus:ring-2 focus:ring-[#8B6E4E] focus:border-[#8B6E4E]'
                }`}
            />
            {errors.guestName && (
              <p className="text-red-500 text-xs mt-1.5 font-medium">
                {errors.guestName}
              </p>
            )}
          </div>

          {/* Row 2: Email & Phone (Grid) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="jane@example.com"
                className={`w-full p-3 rounded-lg border outline-none transition-all
                  ${
                    errors.email
                      ? 'border-red-500 focus:ring-2 focus:ring-red-200'
                      : 'border-gray-300 focus:ring-2 focus:ring-[#8B6E4E] focus:border-[#8B6E4E]'
                  }`}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1.5 font-medium">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Phone Number *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+91 98765 43210"
                maxLength={15}
                className={`w-full p-3 rounded-lg border outline-none transition-all
                  ${
                    errors.phone
                      ? 'border-red-500 focus:ring-2 focus:ring-red-200'
                      : 'border-gray-300 focus:ring-2 focus:ring-[#8B6E4E] focus:border-[#8B6E4E]'
                  }`}
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1.5 font-medium">
                  {errors.phone}
                </p>
              )}
            </div>
          </div>

          {/* Row 3: Dates (Grid) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Check-in Date *
              </label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={formData.checkInDate}
                onChange={(e) => handleChange('checkInDate', e.target.value)}
                className={`w-full p-3 rounded-lg border outline-none transition-all bg-white
                  ${
                    errors.checkInDate
                      ? 'border-red-500 focus:ring-2 focus:ring-red-200'
                      : 'border-gray-300 focus:ring-2 focus:ring-[#8B6E4E] focus:border-[#8B6E4E]'
                  }`}
              />
              {errors.checkInDate && (
                <p className="text-red-500 text-xs mt-1.5 font-medium">
                  {errors.checkInDate}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Check-out Date *
              </label>
              <input
                type="date"
                min={
                  formData.checkInDate || new Date().toISOString().split('T')[0]
                }
                value={formData.checkOutDate}
                onChange={(e) => handleChange('checkOutDate', e.target.value)}
                className={`w-full p-3 rounded-lg border outline-none transition-all bg-white
                  ${
                    errors.checkOutDate
                      ? 'border-red-500 focus:ring-2 focus:ring-red-200'
                      : 'border-gray-300 focus:ring-2 focus:ring-[#8B6E4E] focus:border-[#8B6E4E]'
                  }`}
              />
              {errors.checkOutDate && (
                <p className="text-red-500 text-xs mt-1.5 font-medium">
                  {errors.checkOutDate}
                </p>
              )}
            </div>
          </div>

          {/* Row 4: Special Requests */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Special Requests (Optional)
            </label>
            <textarea
              rows={4}
              value={formData.specialReq}
              onChange={(e) => handleChange('specialReq', e.target.value)}
              placeholder="Allergies, dietary requirements, estimated arrival time..."
              className="w-full p-3 rounded-lg border border-gray-300 outline-none transition-all focus:ring-2 focus:ring-[#8B6E4E] focus:border-[#8B6E4E] resize-y"
            />
          </div>

          {/* Information Notice */}
          <div className="bg-[#8B6E4E]/5 border border-[#8B6E4E]/20 rounded-lg p-4 flex gap-3 items-start mt-8">
            <Info className="text-[#8B6E4E] shrink-0 mt-0.5" size={18} />
            <div className="text-sm text-gray-700 leading-relaxed">
              <p>
                Please ensure your <strong>email address</strong> and{' '}
                <strong>phone number</strong> are accurate. All booking
                confirmations, receipts, and arrival instructions will be sent
                exclusively to these contacts.
              </p>
            </div>
          </div>

          {/* 🚨 NEW: Dynamic Price Summary Block */}
          {calculatedNights > 0 && selectedRoom && (
            <div className="bg-[#FDFBF7] p-5 rounded-xl border border-[#8B6E4E]/20 flex justify-between items-center my-6 animate-in fade-in slide-in-from-bottom-2">
              <div>
                <p className="text-sm text-gray-500 font-medium">
                  Stay Duration
                </p>
                <p className="text-gray-900 font-bold">
                  {calculatedNights} Night{calculatedNights > 1 ? 's' : ''}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 font-medium">Total Cost</p>
                <p className="text-2xl font-serif font-bold text-[#8B6E4E]">
                  ₹{calculatedTotal.toLocaleString()}
                </p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || calculatedTotal === 0}
              className="w-full bg-[#7A633F] text-white py-3.5 rounded-lg font-medium tracking-wide hover:bg-[#685333] transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </>
              ) : (
                'Confirm Booking'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
