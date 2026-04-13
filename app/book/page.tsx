'use client'

import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Info, CheckCircle } from 'lucide-react' // <-- Added CheckCircle

export default function BookingPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const roomId = searchParams?.get('roomId') 

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false) // <-- New success state
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    guestName: '',
    email: '',
    phone: '',
    checkInDate: '',
    checkOutDate: '',
    specialReq: ''
  })

  // Validation function
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.guestName.trim()) newErrors.guestName = 'Full name is required'
    
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
    
    if (!formData.checkInDate) newErrors.checkInDate = 'Check-in date is required'
    
    if (!formData.checkOutDate) {
      newErrors.checkOutDate = 'Check-out date is required'
    } else if (formData.checkInDate && new Date(formData.checkOutDate) <= new Date(formData.checkInDate)) {
      newErrors.checkOutDate = 'Check-out must be after check-in'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault() 

    if (!roomId) {
      alert("Error: No room selected. Please go back and select a room.")
      return
    }

    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    setIsSubmitting(true)

    try {
      const payload = {...formData, roomId: roomId }
      const response = await fetch("/api/bookings",{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) throw new Error("Booking failed");

      // Trigger the success UI instead of the alert
      setIsSuccess(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })

    } catch (error) {
      console.error(error)
      alert("Something went wrong.")
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

  // --- SUCCESS VIEW ---
  // If the booking succeeds, render this card instead of the form.
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-lg w-full p-8 sm:p-12 bg-white shadow-xl rounded-2xl border border-gray-100 text-center animate-in fade-in zoom-in duration-500">
          <div className="mx-auto w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" strokeWidth={2} />
          </div>
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">Booking Confirmed!</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Thank you, <span className="font-medium text-gray-900">{formData.guestName}</span>. Your reservation has been successfully placed. We've sent the complete booking details and arrival instructions to <strong className="text-gray-900">{formData.email}</strong>.
          </p>
          <button 
            onClick={() => router.push("/")}
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
          <h1 className="text-3xl font-serif font-bold text-gray-900">Complete Your Booking</h1>
          <p className="text-gray-500 mt-2 text-sm">Please provide your details to secure your reservation.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6" noValidate> 
          
          {/* Row 1: Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
            <input 
              type="text" 
              value={formData.guestName}
              onChange={(e) => handleChange('guestName', e.target.value)}
              placeholder="e.g. Jane Doe"
              className={`w-full p-3 rounded-lg border outline-none transition-all
                ${errors.guestName 
                  ? 'border-red-500 focus:ring-2 focus:ring-red-200' 
                  : 'border-gray-300 focus:ring-2 focus:ring-[#8B6E4E] focus:border-[#8B6E4E]'}`}
            />
            {errors.guestName && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.guestName}</p>}
          </div>

          {/* Row 2: Email & Phone (Grid) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address *</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="jane@example.com"
                className={`w-full p-3 rounded-lg border outline-none transition-all
                  ${errors.email 
                    ? 'border-red-500 focus:ring-2 focus:ring-red-200' 
                    : 'border-gray-300 focus:ring-2 focus:ring-[#8B6E4E] focus:border-[#8B6E4E]'}`}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number *</label>
              <input 
                type="tel" 
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+91 98765 43210"
                maxLength={15}
                className={`w-full p-3 rounded-lg border outline-none transition-all
                  ${errors.phone 
                    ? 'border-red-500 focus:ring-2 focus:ring-red-200' 
                    : 'border-gray-300 focus:ring-2 focus:ring-[#8B6E4E] focus:border-[#8B6E4E]'}`}
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.phone}</p>}
            </div>
          </div>

          {/* Row 3: Dates (Grid) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Check-in Date *</label>
              <input 
                type="date" 
                min={new Date().toISOString().split('T')[0]} 
                value={formData.checkInDate}
                onChange={(e) => handleChange('checkInDate', e.target.value)}
                className={`w-full p-3 rounded-lg border outline-none transition-all bg-white
                  ${errors.checkInDate 
                    ? 'border-red-500 focus:ring-2 focus:ring-red-200' 
                    : 'border-gray-300 focus:ring-2 focus:ring-[#8B6E4E] focus:border-[#8B6E4E]'}`}
              />
              {errors.checkInDate && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.checkInDate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Check-out Date *</label>
              <input 
                type="date" 
                min={formData.checkInDate || new Date().toISOString().split('T')[0]}
                value={formData.checkOutDate}
                onChange={(e) => handleChange('checkOutDate', e.target.value)}
                className={`w-full p-3 rounded-lg border outline-none transition-all bg-white
                  ${errors.checkOutDate 
                    ? 'border-red-500 focus:ring-2 focus:ring-red-200' 
                    : 'border-gray-300 focus:ring-2 focus:ring-[#8B6E4E] focus:border-[#8B6E4E]'}`}
              />
              {errors.checkOutDate && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.checkOutDate}</p>}
            </div>
          </div>

          {/* Row 4: Special Requests */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Special Requests (Optional)</label>
            <textarea 
              rows={4}
              value={formData.specialReq}
              onChange={(e) => handleChange('specialReq', e.target.value)}
              placeholder="Allergies, dietary requirements, estimated arrival time..."
              className="w-full p-3 rounded-lg border border-gray-300 outline-none transition-all focus:ring-2 focus:ring-[#8B6E4E] focus:border-[#8B6E4E] resize-y"
            />
          </div>

          <div className="bg-[#8B6E4E]/5 border border-[#8B6E4E]/20 rounded-lg p-4 flex gap-3 items-start mt-8">
            <Info className="text-[#8B6E4E] shrink-0 mt-0.5" size={18} />
            <div className="text-sm text-gray-700 leading-relaxed">
              <p>
                Please ensure your <strong>email address</strong> and <strong>phone number</strong> are accurate. All booking confirmations, receipts, and arrival instructions will be sent exclusively to these contacts.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-[#7A633F] text-white py-3.5 rounded-lg font-medium tracking-wide hover:bg-[#685333] transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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