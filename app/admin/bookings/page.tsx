'use client'

import { Booking } from '@/types'
import { useState, useEffect } from 'react'
import {
  Search,
  Plus,
  Calendar as CalendarIcon,
  Loader2,
  ArrowUpDown,
} from 'lucide-react' // <-- Added ArrowUpDown
import BookingForm from '@/components/admin/BookingForm'

export type SortOption =
  | 'DATE_ASC'
  | 'DATE_DESC'
  | 'PRICE_DESC'
  | 'PRICE_ASC'
  | 'NAME_ASC'

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<
    'ALL' | 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED'
  >('ALL')
  // <-- NEW: Sort State (Defaulting to upcoming check-ins first)
  const [sortBy, setSortBy] = useState<SortOption>('DATE_ASC')
  const [isModalOpen, setIsModalOpen] = useState(false)

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
    setUpdatingId(booking.id)

    try {
      const res = await fetch('/api/admin/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          action: actionName,
          roomUnitId: booking.roomUnit.id,
        }),
      })

      if (res.ok) {
        let newDisplayStatus = 'CONFIRMED'
        if (actionName === 'CHECK_IN') newDisplayStatus = 'CHECKED_IN'
        if (actionName === 'CHECK_OUT') newDisplayStatus = 'CHECKED_OUT'
        if (actionName === 'CANCEL') newDisplayStatus = 'CANCELLED'

        setBookings((prev) =>
          prev.map((b) =>
            b.id === booking.id ? { ...b, status: newDisplayStatus as any } : b
          )
        )
      } else {
        const errorData = await res.json()
        alert(errorData.error || 'Failed to update status')
        fetchBookings()
      }
    } catch (error) {
      alert('Network error: Failed to update status')
      fetchBookings()
    } finally {
      setUpdatingId(null)
    }
  }

  // <-- UPDATED: Filter AND Sort Engine
  const processedBookings = bookings
    .filter((b) => {
      const matchesSearch =
        b.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.roomUnit.roomNumber.includes(searchTerm)
      const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter

      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      // Sorting Logic
      switch (sortBy) {
        case 'DATE_ASC': // Upcoming first
          return (
            new Date(a.checkInDate).getTime() -
            new Date(b.checkInDate).getTime()
          )
        case 'DATE_DESC': // Furthest first
          return (
            new Date(b.checkInDate).getTime() -
            new Date(a.checkInDate).getTime()
          )
        case 'PRICE_DESC': // Highest price first
          return (b.totalPrice || 0) - (a.totalPrice || 0)
        case 'PRICE_ASC': // Lowest price first
          return (a.totalPrice || 0) - (b.totalPrice || 0)
        case 'NAME_ASC': // Alphabetical A-Z
          return a.guestName.localeCompare(b.guestName)
        default:
          return 0
      }
    })

  if (isLoading)
    return <div className="p-12 text-slate-500">Loading ledger...</div>

  return (
    <div className="p-8 md:p-12 min-h-screen bg-slate-50/50">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Bookings Ledger</h1>
          <p className="text-slate-500 mt-1">
            Manage reservations, check-ins, and cancellations.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm shrink-0"
        >
          <Plus size={18} /> New Booking
        </button>
      </div>

      {/* CONTROLS: Filters, Sort, & Search */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6">
        {/* STATUS FILTERS */}
        <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 w-full xl:w-auto hide-scrollbar">
          {['ALL', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED'].map(
            (status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status as any)}
                className={`px-4 py-2.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  statusFilter === status
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {status.replace('_', ' ')}
              </button>
            )
          )}
        </div>

        {/* RIGHT CONTROLS: Sort & Search */}
        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto shrink-0">
          {/* SORT DROPDOWN */}
          <div className="relative w-full sm:w-48 shrink-0">
            <ArrowUpDown
              className="absolute left-3 top-3 text-slate-400"
              size={18}
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full pl-10 pr-8 py-2.5 bg-white border border-slate-200 rounded-lg shadow-sm outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all text-slate-700 text-sm appearance-none cursor-pointer"
            >
              <option value="DATE_ASC">Upcoming First</option>
              <option value="DATE_DESC">Furthest First</option>
              <option value="PRICE_DESC">Highest Price</option>
              <option value="PRICE_ASC">Lowest Price</option>
              <option value="NAME_ASC">Name (A-Z)</option>
            </select>
            {/* Custom dropdown arrow to bypass ugly browser defaults */}
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
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

          {/* SEARCH BAR */}
          <div className="relative w-full sm:w-72 shrink-0">
            <Search
              className="absolute left-3 top-3 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search guest or room..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg shadow-sm outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all text-sm"
            />
          </div>
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-xs tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 whitespace-nowrap">Guest</th>
                <th className="px-6 py-4 whitespace-nowrap">Dates</th>
                <th className="px-6 py-4 whitespace-nowrap">Room</th>
                <th className="px-6 py-4 whitespace-nowrap">Total</th>
                <th className="px-6 py-4 whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {processedBookings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <p className="text-slate-500 font-medium">
                      No bookings found.
                    </p>
                    <p className="text-slate-400 text-xs mt-1">
                      Try adjusting your search or filters.
                    </p>
                  </td>
                </tr>
              ) : (
                processedBookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">
                        {booking.guestName}
                      </div>
                      <div className="text-xs text-slate-500">
                        {booking.phone}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <CalendarIcon size={14} className="text-slate-400" />
                        {new Date(
                          booking.checkInDate
                        ).toLocaleDateString()}{' '}
                        <span className="text-slate-400 mx-1">→</span>{' '}
                        {new Date(booking.checkOutDate).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-700 whitespace-nowrap">
                        Unit {booking.roomUnit.roomNumber}
                      </span>
                      <div className="text-xs text-slate-500 line-clamp-1 min-w-[120px]">
                        {booking.roomUnit.room.name}
                      </div>
                    </td>

                    <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                      ₹{booking.totalPrice?.toFixed(2)}
                    </td>

                    <td className="px-6 py-4">
                      {updatingId === booking.id ? (
                        <div className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border bg-slate-50 text-slate-500 border-slate-200">
                          <Loader2 size={12} className="animate-spin" />
                          UPDATING...
                        </div>
                      ) : booking.status === 'CONFIRMED' ? (
                        <select
                          value="CONFIRMED"
                          onChange={(e) =>
                            handleStatusChange(booking, e.target.value)
                          }
                          className="text-xs font-bold px-3 py-1.5 rounded-full border bg-blue-50 text-blue-700 border-blue-200 outline-none cursor-pointer"
                        >
                          <option value="CONFIRMED" disabled>
                            CONFIRMED
                          </option>
                          <option value="CHECK_IN">CHECK IN GUEST</option>
                          <option value="CANCEL">CANCEL BOOKING</option>
                        </select>
                      ) : booking.status === 'CHECKED_IN' ? (
                        <select
                          value="CHECKED_IN"
                          onChange={(e) =>
                            handleStatusChange(booking, e.target.value)
                          }
                          className="text-xs font-bold px-3 py-1.5 rounded-full border bg-green-50 text-green-700 border-green-200 outline-none cursor-pointer"
                        >
                          <option value="CHECKED_IN" disabled>
                            CHECKED IN
                          </option>
                          <option value="CHECK_OUT">CHECK OUT GUEST</option>
                        </select>
                      ) : booking.status === 'CHECKED_OUT' ? (
                        <span className="inline-block text-[10px] font-bold px-3 py-1.5 rounded-full border bg-slate-100 text-slate-600 border-slate-200 uppercase tracking-wider cursor-not-allowed whitespace-nowrap">
                          Checked Out
                        </span>
                      ) : (
                        <span className="inline-block text-[10px] font-bold px-3 py-1.5 rounded-full border bg-red-50 text-red-600 border-red-200 uppercase tracking-wider cursor-not-allowed whitespace-nowrap">
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
        <BookingForm
          setIsModalOpen={setIsModalOpen}
          onSuccess={fetchBookings}
          isCallInMode={true}
        />
      )}
    </div>
  )
}
