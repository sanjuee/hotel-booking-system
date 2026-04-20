'use client'

import {
  Users,
  AlertCircle,
  BedDouble,
  CheckCircle2,
  XCircle,
  Calendar,
  ArrowRight,
  UserCircle,
  LogOut,
  Filter,
  Info,
  MessageSquare,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { DashboardData, FrontDeskRoomUnit } from '@/types'
import FrontDeskRoomCard from '@/components/admin/FrontDeskRoomCard'
import NewBookingForm from '@/components/admin/BookingForm'

export default function FrontDeskDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL')

  const [walkInCheckIn, setWalkInCheckIn] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [walkInCheckOut, setWalkInCheckOut] = useState('')

  const [walkInConfig, setWalkInConfig] = useState<{
    unitId: string
    roomNumber: string
    roomType: string
    price: number
    maxDate?: string
    checkOutDate?: string // Added so we can pass it to the modal
  } | null>(null)

  const [checkOutConfig, setCheckOutConfig] = useState<{
    bookingId: string
    guestName: string
    roomNumber: string
    checkInDate: string
    checkOutDate: string
    roomUnitId: string
  } | null>(null)

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/admin/front-desk')
      if (res.ok) {
        setData(await res.json())
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAction = async (
    bookingId: string,
    action: 'CHECK_IN' | 'CHECK_OUT' | 'NO_SHOW',
    roomUnitId?: string
  ) => {
    if (
      !confirm(
        `Are you sure you want to ${action.replace('_', ' ')} this guest?`
      )
    )
      return

    setIsProcessing(bookingId)
    try {
      const res = await fetch('/api/admin/front-desk/action', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, action, roomUnitId }),
      })

      if (!res.ok) throw new Error('Action failed')
      await fetchDashboard()
    } catch (error) {
      alert('Failed to process action. Please try again.')
    } finally {
      setIsProcessing(null)
    }
  }

  const handleRoomClick = (unit: FrontDeskRoomUnit, type: string) => {
    if (type === 'FREE' || type === 'FUTURE') {
      let maxDate = undefined
      if (type === 'FUTURE') {
        const nextBooking = unit.bookings?.find((b) => b.status === 'CONFIRMED')
        if (nextBooking) {
          maxDate = new Date(nextBooking.checkInDate)
            .toISOString()
            .split('T')[0]
        }
      }
      setWalkInConfig({
        unitId: unit.id,
        roomNumber: unit.roomNumber,
        roomType: unit.room.name,
        price: unit.room.price || 0,
        maxDate: maxDate,
        checkOutDate: walkInCheckOut, // 👈 Passes the searched date down to the modal!
      })
    } else if (type === 'OCCUPIED') {
      const activeBooking = unit.bookings?.find(
        (b) => b.status === 'CHECKED_IN'
      )
      if (activeBooking) {
        setCheckOutConfig({
          bookingId: activeBooking.id,
          guestName: activeBooking.guestName,
          roomNumber: unit.roomNumber,
          checkInDate: activeBooking.checkInDate,
          checkOutDate: activeBooking.checkOutDate,
          roomUnitId: unit.id,
        })
      }
    }
  }

  // --- THE SORTING & FILTERING ENGINE ---

  // 1. Bulletproof Local Date String (YYYY-MM-DD)
  const getLocalYYYYMMDD = (dateInput: Date | string) => {
    const d = new Date(dateInput)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const todayStr = getLocalYYYYMMDD(new Date())

  const uniqueTypes = Array.from(
    new Set(data?.liveRooms.map((r) => r.room?.name).filter(Boolean))
  )

  let filteredRooms = data?.liveRooms || []

  if (selectedCategory !== 'ALL') {
    filteredRooms = filteredRooms.filter(
      (r) => r.room?.name === selectedCategory
    )
  }
  if (selectedStatus !== 'ALL') {
    filteredRooms = filteredRooms.filter((r) => r.status === selectedStatus)
  }

  // Handle Walk-in Search Clashes
  if (walkInCheckIn && walkInCheckOut) {
    const searchStart = new Date(walkInCheckIn).getTime()
    const searchEnd = new Date(walkInCheckOut).getTime()

    if (searchEnd > searchStart) {
      filteredRooms = filteredRooms.filter((room) => {
        const hasClash = room.bookings?.some((b) => {
          if (b.status === 'CANCELLED' || b.status === 'CHECKED_OUT')
            return false

          const bStart = new Date(b.checkInDate).getTime()
          const bEnd = new Date(b.checkOutDate).getTime()
          return searchStart < bEnd && searchEnd > bStart
        })
        return !hasClash
      })
    }
  }

  const occupiedRooms = filteredRooms.filter((r) => r.status === 'OCCUPIED')
  const allAvailableRooms = filteredRooms.filter((r) => r.status === 'AVAILABLE')

  // Helper to ensure we always grab the CLOSEST incoming booking
  const getNextBooking = (room: FrontDeskRoomUnit) => {
    const confirmedBookings = room.bookings?.filter((b) => b.status === 'CONFIRMED') || []
    if (confirmedBookings.length === 0) return null
    
    // Sort ascending by date so [0] is always the soonest arrival
    confirmedBookings.sort((a, b) => new Date(a.checkInDate).getTime() - new Date(b.checkInDate).getTime())
    return confirmedBookings[0]
  }

  // Group 1: Incoming Today (High Danger)
  const incomingTodayRooms = allAvailableRooms.filter((room) => {
    const nextBooking = getNextBooking(room)
    if (!nextBooking) return false
    return getLocalYYYYMMDD(nextBooking.checkInDate) === todayStr
  })

  // Group 2: Future Booked (Medium Danger)
  const futureBookedRooms = allAvailableRooms.filter((room) => {
    const nextBooking = getNextBooking(room)
    if (!nextBooking) return false
    return getLocalYYYYMMDD(nextBooking.checkInDate) > todayStr
  })

  // Group 3: Completely Free (Zero Danger)
  const completelyFreeRooms = allAvailableRooms.filter((room) => {
    const hasIncoming = room.bookings?.some((b) => b.status === 'CONFIRMED')
    return !hasIncoming
  })

 

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen bg-slate-50">
        <div className="text-slate-500 font-medium flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          Loading Front Desk...
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 min-h-screen bg-slate-50/50 font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          Front Desk
        </h1>
        <p className="text-slate-500 mt-1">
          Real-time property overview and daily operations.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-8 space-y-6">
          {/* Walk-in Search Bar */}
          {/* Walk-in Search Bar */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-end">
            <div className="w-full md:flex-1">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                Walk-in Check In
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 text-slate-400" size={18} />
                <input
                  type="date"
                  min={walkInCheckIn}
                  value={walkInCheckIn}
                  onChange={(e) => setWalkInCheckIn(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                />
              </div>
            </div>
            <div className="w-full md:flex-1">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                Check Out
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 text-slate-400" size={18} />
                <input
                  type="date"
                  min={walkInCheckIn}
                  value={walkInCheckOut}
                  onChange={(e) => setWalkInCheckOut(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                />
              </div>
            </div>
            
            {/* Status Indicator & Undo Button Wrapper */}
            <div className="flex w-full md:w-auto gap-2">
              <div className={`flex-1 md:w-auto px-6 py-2 rounded-lg font-bold border flex items-center justify-center gap-2 h-[42px] shadow-sm text-sm transition-colors ${
                walkInCheckOut && walkInCheckOut > walkInCheckIn 
                  ? 'bg-green-50 text-green-700 border-green-200' 
                  : 'bg-slate-50 text-slate-400 border-slate-200'
              }`}>
                <CheckCircle2 size={16} /> 
                {walkInCheckOut && walkInCheckOut > walkInCheckIn ? 'Floor Plan Filtered!' : 'Enter Dates to Filter'}
              </div>

              {/* 🚨 THE NEW UNDO BUTTON */}
              {walkInCheckOut && (
                <button
                  onClick={() => {
                    setWalkInCheckIn(new Date().toISOString().split('T')[0]); // Reset to Today
                    setWalkInCheckOut(''); // Clear Check-Out
                  }}
                  title="Clear Dates"
                  className="px-3 py-2 bg-white border border-slate-200  rounded-lg  text-red-600 hover:border-red-200 transition-colors h-[42px] flex items-center justify-center animate-in fade-in zoom-in duration-200"
                >
                  <XCircle size={18} />
                </button>
              )}
            </div>
          </div>
          {/* 🚨 THE ACTIVE FILTER BANNER 🚨 */}
          {walkInCheckOut && walkInCheckOut > walkInCheckIn && (
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start gap-3 animate-in slide-in-from-top-2 fade-in duration-300 shadow-sm">
              <Info className="text-blue-500 mt-0.5 shrink-0" size={18} />
              <div>
                <h4 className="text-sm font-bold text-blue-900">
                  Showing future availability
                </h4>
                <p className="text-xs text-blue-700 mt-1 font-medium leading-relaxed">
                  The floor plan below is currently filtered to only show rooms that are completely available from <b>{new Date(walkInCheckIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</b> to <b>{new Date(walkInCheckOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</b>. 
                  Click the <b><XCircle className="inline mb-0.5 mx-0.5" size={14} /></b> button above to clear these dates and return to today's standard walk-in dashboard.
                </p>
              </div>
            </div>
          )}
          

          {/* --- FILTER BAR --- */}
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 text-slate-500 shrink-0">
              <Filter size={18} />
              <span className="font-bold text-sm">Filters:</span>
            </div>

            <div className="flex flex-col sm:flex-row w-full gap-4">
              <div className="w-full sm:flex-1 relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 text-sm text-slate-700 font-medium appearance-none cursor-pointer"
                >
                  <option value="ALL">All Room Types</option>
                  {uniqueTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                  <svg
                    className="w-4 h-4 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </div>
              </div>

              <div className="w-full sm:flex-1 relative">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 text-sm text-slate-700 font-medium appearance-none cursor-pointer"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="AVAILABLE">Available</option>
                  <option value="OCCUPIED">Occupied</option>
                  <option value="MAINTENANCE">Maintenance</option>
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                  <svg
                    className="w-4 h-4 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* LIVE FLOOR PLAN SECTIONS */}
          <div className="space-y-8">
            {/* Empty State */}
            {filteredRooms.length === 0 && (
              <div className="text-center py-16 bg-white rounded-xl border border-slate-200 shadow-sm">
                <p className="text-slate-500 font-medium mb-3 text-lg">
                  No rooms match your selected dates or filters.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('ALL')
                    setSelectedStatus('ALL')
                    setWalkInCheckOut('')
                  }}
                  className="bg-blue-50 text-blue-700 px-5 py-2 rounded-lg text-sm font-bold hover:bg-blue-100 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )}

            {/* SECTION 1: Completely Free */}
            {completelyFreeRooms.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-500"></span>
                  Completely Free (Best for Walk-ins)
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {completelyFreeRooms.map((unit) => (
                    <FrontDeskRoomCard
                      key={unit.id}
                      unit={unit}
                      type="FREE"
                      onClick={() => handleRoomClick(unit, 'FREE')}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 2: Future Booked */}
            {futureBookedRooms.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-orange-400"></span>
                  Available (But Future Booked)
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {futureBookedRooms.map((unit) => (
                    <FrontDeskRoomCard
                      key={unit.id}
                      unit={unit}
                      type="FUTURE"
                      onClick={() => handleRoomClick(unit, 'FUTURE')}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 3: Incoming Today */}
            {incomingTodayRooms.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500"></span>
                  Available (DO NOT SELL - Guest Arriving Today)
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 opacity-75">
                  {incomingTodayRooms.map((unit) => (
                    <FrontDeskRoomCard
                      key={unit.id}
                      unit={unit}
                      type="INCOMING_TODAY"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 4: Occupied */}
            {occupiedRooms.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                  Currently Occupied
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {occupiedRooms.map((unit) => (
                    <FrontDeskRoomCard
                      key={unit.id}
                      unit={unit}
                      type="OCCUPIED"
                      onClick={() => handleRoomClick(unit, 'OCCUPIED')}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* OPERATIONS LOG (RIGHT SIDEBAR) */}
        <div className="xl:col-span-4 space-y-6">
          {/* Arrivals Board */}
          {/* Arrivals Board */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 p-4 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Users size={18} className="text-blue-600" />
                Today's Arrivals
              </h3>
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
                {data?.arrivals.length || 0}
              </span>
            </div>

            <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
              {data?.arrivals.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-500">
                  No arrivals pending today.
                </div>
              ) : (
                data?.arrivals.map((booking) => (
                  <div
                    key={booking.id}
                    className="p-4 hover:bg-slate-50 transition-colors flex flex-col"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-bold text-slate-900">
                          {booking.guestName}
                        </div>
                        <div className="text-xs text-slate-500 font-medium">
                          Unit {booking.roomUnit.roomNumber} •{' '}
                          {booking.roomUnit.room.name}
                        </div>
                      </div>
                    </div>

                    {/* NEW: Special Requests Block */}
                    {booking.specialReq && booking.specialReq.trim() !== '' && (
                      <div className="mt-2 mb-3 bg-yellow-50 border border-yellow-200 rounded-lg p-2.5 flex gap-2 items-start">
                        <MessageSquare size={14} className="text-yellow-600 shrink-0 mt-0.5" />
                        <div className="text-xs text-yellow-800 font-medium leading-relaxed italic">
                          <span className="font-bold uppercase tracking-wider text-[10px] block mb-0.5 not-italic text-yellow-600">Special Request</span>
                          "{booking.specialReq}"
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() =>
                        handleAction(
                          booking.id,
                          'CHECK_IN',
                          booking.roomUnit.id
                        )
                      }
                      disabled={isProcessing === booking.id}
                      className="w-full mt-auto bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 border border-green-200 py-1.5 rounded-md text-sm font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isProcessing === booking.id ? (
                        'Processing...'
                      ) : (
                        <>
                          <CheckCircle2 size={16} /> Check In Guest
                        </>
                      )}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 p-4 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <LogOut size={18} className="text-orange-600" /> Today's
                Departures
              </h3>
              <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
                {data?.departures.length || 0}
              </span>
            </div>

            <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
              {data?.departures.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-500">
                  No departures expected today.
                </div>
              ) : (
                data?.departures.map((booking) => (
                  <div
                    key={booking.id}
                    className="p-4 hover:bg-orange-50/50 transition-colors"
                  >
                    <div className="font-bold text-slate-900">
                      {booking.guestName}
                    </div>
                    <div className="text-xs text-slate-500 font-medium mb-2">
                      Unit {booking.roomUnit.roomNumber} •{' '}
                      {booking.roomUnit.room.name}
                    </div>
                    <button
                      onClick={() =>
                        handleAction(
                          booking.id,
                          'CHECK_OUT',
                          booking.roomUnit.id
                        )
                      }
                      disabled={isProcessing === booking.id}
                      className="w-full bg-white text-orange-600 hover:bg-orange-50 border border-orange-200 py-1.5 rounded-md text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isProcessing === booking.id
                        ? 'Processing...'
                        : 'Check Out Guest'}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Action Center: No-Shows */}
          <div className="bg-white rounded-xl border border-red-100 shadow-sm overflow-hidden">
            <div className="bg-red-50 border-b border-red-100 p-4 flex items-center justify-between">
              <h3 className="font-bold text-red-900 flex items-center gap-2">
                <AlertCircle size={18} className="text-red-600" /> Pending
                No-Shows
              </h3>
              <span className="bg-red-100 text-red-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
                {data?.noShows.length || 0}
              </span>
            </div>

            <div className="divide-y divide-red-50 max-h-[300px] overflow-y-auto">
              {data?.noShows.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-500">
                  All clear. No pending alerts.
                </div>
              ) : (
                data?.noShows.map((booking) => (
                  <div
                    key={booking.id}
                    className="p-4 bg-white hover:bg-red-50/50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-bold text-slate-900">
                          {booking.guestName}
                        </div>
                        <div className="text-xs text-red-500 font-medium">
                          Missed Check-in:{' '}
                          {new Date(booking.checkInDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAction(booking.id, 'NO_SHOW')}
                      disabled={isProcessing === booking.id}
                      className="w-full mt-2 bg-white text-red-600 hover:bg-red-50 border border-red-200 py-1.5 rounded-md text-sm font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isProcessing === booking.id ? (
                        'Processing...'
                      ) : (
                        <>
                          <XCircle size={16} /> Confirm No-Show (Cancel)
                        </>
                      )}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      {walkInConfig && (
        <NewBookingForm
          setIsModalOpen={(isOpen) => {
            if (!isOpen) setWalkInConfig(null)
          }}
          onSuccess={() => {
            setWalkInConfig(null)
            fetchDashboard()
          }}
          initialRoomId={walkInConfig.unitId}
          initialRoomNumber={walkInConfig.roomNumber}
          initialRoomType={walkInConfig.roomType}
          initialTotalPrice={walkInConfig.price}
          initialCheckInDate={walkInCheckIn}
          // 🚨 Optionally pass the CheckOutDate if your BookingForm supports it!
          // initialCheckOutDate={walkInConfig.checkOutDate}
          maxCheckOutDate={walkInConfig.maxDate}
          isRoomReadOnly={true}
        />
      )}

      {checkOutConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-900">
                Confirm Check-Out
              </h2>
              <button
                onClick={() => setCheckOutConfig(null)}
                className="text-gray-400 hover:text-gray-700 transition-colors p-1 rounded-md hover:bg-gray-100"
              >
                <XCircle size={22} strokeWidth={2} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 relative">
                <div className="mb-4 pb-4 border-b border-gray-200 border-dashed">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">
                    Guest Name
                  </p>
                  <p className="font-bold text-lg text-gray-900">
                    {checkOutConfig.guestName}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">
                      Room Unit
                    </p>
                    <p className="font-semibold text-gray-900">
                      {checkOutConfig.roomNumber}
                    </p>
                  </div>
                  <div className="hidden sm:block"></div>

                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">
                      Check-In
                    </p>
                    <p className="font-medium text-gray-800">
                      {new Date(checkOutConfig.checkInDate).toLocaleDateString(
                        'en-US',
                        { month: 'short', day: 'numeric', year: 'numeric' }
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">
                      Check-Out
                    </p>
                    <p className="font-medium text-gray-800">
                      {new Date(checkOutConfig.checkOutDate).toLocaleDateString(
                        'en-US',
                        { month: 'short', day: 'numeric', year: 'numeric' }
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-500 text-center">
                This will mark the room as available and complete the guest's
                stay.
              </p>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setCheckOutConfig(null)}
                  className="flex-1 py-3 text-gray-600 font-medium bg-white border border-gray-200 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleAction(
                      checkOutConfig.bookingId,
                      'CHECK_OUT',
                      checkOutConfig.roomUnitId
                    )
                    setCheckOutConfig(null)
                  }}
                  className="flex-1 py-3 bg-[#ff0000c8] text-white font-medium hover:bg-[#bf0202c8] rounded-lg transition-all shadow-sm"
                >
                  Confirm Check-Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
