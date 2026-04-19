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
} from 'lucide-react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { DashboardData, FrontDeskRoomUnit } from '@/types'
import FrontDeskRoomCard from '@/components/admin/FrontDeskRoomCard'
import NewBookingForm from '@/components/admin/NewBookingForm'

export default function FrontDeskDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState<string | null>(null)

  // Walk-in Engine State
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

  // The Action Handler (The Hands)
  const handleAction = async (
    bookingId: string,
    action: 'CHECK_IN' | 'NO_SHOW',
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

      // Refresh the dashboard to get the latest live statuses
      await fetchDashboard()
    } catch (error) {
      alert('Failed to process action. Please try again.')
    } finally {
      setIsProcessing(null)
    }
  }

  const handleRoomClick = (unit: FrontDeskRoomUnit, type: string) => {
    let maxDate = undefined

    // If it's a FUTURE booked room, calculate the exact max date they must check out
    if (type === 'FUTURE') {
      const nextBooking = unit.bookings?.find((b) => b.status === 'CONFIRMED')
      if (nextBooking) {
        maxDate = new Date(nextBooking.checkInDate).toISOString().split('T')[0]
      }
    }
    setWalkInConfig({
      unitId: unit.id,
      roomNumber: unit.roomNumber,
      roomType: unit.room.name,
      price: unit.room.price || 0, // Fallback to 0 if price isn't fetched
      maxDate: maxDate,
    })
  }

  // --- THE SORTING ENGINE ---
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const occupiedRooms =
    data?.liveRooms.filter((r) => r.status === 'OCCUPIED') || []

  const allAvailableRooms =
    data?.liveRooms.filter((r) => r.status === 'AVAILABLE') || []

  // Group 1: Incoming Today (High Danger)
  const incomingTodayRooms = allAvailableRooms.filter((room) => {
    const nextBooking = room.bookings?.find((b) => b.status === 'CONFIRMED')
    if (!nextBooking) return false
    const checkIn = new Date(nextBooking.checkInDate)
    return checkIn.getTime() === today.getTime()
  })

  // Group 2: Future Booked (Medium Danger)
  const futureBookedRooms = allAvailableRooms.filter((room) => {
    const nextBooking = room.bookings?.find((b) => b.status === 'CONFIRMED')
    if (!nextBooking) return false
    const checkIn = new Date(nextBooking.checkInDate)
    return checkIn.getTime() > today.getTime()
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
          Loading Live Dashboard...
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 min-h-screen bg-slate-50/50 font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          Live Front Desk
        </h1>
        <p className="text-slate-500 mt-1">
          Real-time property overview and daily operations.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* ========================================= */}
        {/* PILLAR 1 & 2: FLOOR PLAN & WALK-IN ENGINE */}
        {/* ========================================= */}
        <div className="xl:col-span-8 space-y-6">
          {/* Walk-in Search Bar */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-end">
            <div className="w-full md:flex-1">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                Walk-in Check In (Today)
              </label>
              <div className="relative">
                <Calendar
                  className="absolute left-3 top-2.5 text-slate-400"
                  size={18}
                />
                <input
                  type="date"
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
                <Calendar
                  className="absolute left-3 top-2.5 text-slate-400"
                  size={18}
                />
                <input
                  type="date"
                  value={walkInCheckOut}
                  onChange={(e) => setWalkInCheckOut(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                />
              </div>
            </div>
            <Link
              href="/admin/bookings"
              className="w-full md:w-auto bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 h-[42px] shadow-sm text-sm"
            >
              Start Walk-in <ArrowRight size={16} />
            </Link>
          </div>

          {/* Live Floor Plan Grid */}
          {/* LIVE FLOOR PLAN SECTIONS */}
          <div className="space-y-8">
            {/* SECTION 1: Completely Free */}
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
                {completelyFreeRooms.length === 0 && (
                  <p className="text-sm text-slate-500 col-span-full">
                    No completely free rooms available.
                  </p>
                )}
              </div>
            </div>

            {/* SECTION 2: Future Booked */}
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
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ========================================= */}
        {/* PILLAR 3: OPERATIONS LOG (RIGHT SIDEBAR)  */}
        {/* ========================================= */}
        <div className="xl:col-span-4 space-y-6">
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
                    className="p-4 hover:bg-slate-50 transition-colors"
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
                    <button
                      onClick={() =>
                        handleAction(
                          booking.id,
                          'CHECK_IN',
                          booking.roomUnit.id
                        )
                      }
                      disabled={isProcessing === booking.id}
                      className="w-full mt-2 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 border border-green-200 py-1.5 rounded-md text-sm font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
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

          {/* Action Center: No-Shows */}
          <div className="bg-white rounded-xl border border-red-100 shadow-sm overflow-hidden">
            <div className="bg-red-50 border-b border-red-100 p-4 flex items-center justify-between">
              <h3 className="font-bold text-red-900 flex items-center gap-2">
                <AlertCircle size={18} className="text-red-600" />
                Pending No-Shows
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
      {walkInConfig && (
        <NewBookingForm
          // We convert the boolean setter to just clear the config state
          setIsModalOpen={(isOpen) => {
            if (!isOpen) setWalkInConfig(null)
          }}
          onSuccess={() => {
            setWalkInConfig(null)
            fetchDashboard() // Refresh the grid to show the room as OCCUPIED instantly!
          }}
          initialRoomId={walkInConfig.unitId}
          initialRoomNumber = {walkInConfig.roomNumber}
          initialRoomType = {walkInConfig.roomType}
          initialTotalPrice={walkInConfig.price}
          initialCheckInDate={new Date().toISOString().split('T')[0]} // Forces Today's Date
          maxCheckOutDate={walkInConfig.maxDate} // Passes the safety lock if needed
          isRoomReadOnly={true} // Locks the dropdown so they don't change the room
        />
      )}
    </div>
  )
}
