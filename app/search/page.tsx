'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import {
  Users,
  BedDouble,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import SearchAvailabiltyBar from '@/components/SearchAvailabilityBar' // Ensure path is correct
import Link from 'next/link'
import Header from '@/components/layout/Header'

interface SearchResult {
  id: string
  name: string
  capacity: number
  pricePerRoom: number
  roomsNeeded: number
  roomsAvailable: number
  isAvailable: boolean
  totalPrice: number
}

// 🚨 We wrap the core logic in a component to safely use useSearchParams in Next.js
function SearchResultsEngine() {
  const searchParams = useSearchParams()

  // Extract parameters from the URL
  const checkInStr = searchParams.get('checkIn')
  const checkOutStr = searchParams.get('checkOut')
  const guestsStr = searchParams.get('guests')

  const [isSearching, setIsSearching] = useState(true)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searchNights, setSearchNights] = useState<number>(0)

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!checkInStr || !checkOutStr) {
        setIsSearching(false)
        return
      }

      setIsSearching(true)
      try {
        const res = await fetch(
          `/api/check-availability?checkIn=${checkInStr}&checkOut=${checkOutStr}&guests=${guestsStr || '2'}`
        )
        if (!res.ok) throw new Error('Search failed')

        const data = await res.json()
        setSearchNights(data.nights)
        setSearchResults(data.results)
      } catch (error) {
        console.error(error)
        alert('Failed to fetch availability.')
      } finally {
        setIsSearching(false)
      }
    }

    fetchAvailability()
  }, [checkInStr, checkOutStr, guestsStr])

  // Parse values for the Search Bar props
  const initialCheckIn = checkInStr ? new Date(checkInStr) : new Date()
  const initialCheckOut = checkOutStr ? new Date(checkOutStr) : undefined
  const parsedGuests = guestsStr ? parseInt(guestsStr) : 2

  return (
    <div >
      <Header />
      <div className="max-w-6xl mt-32 px-4 py-24 ">

        <SearchAvailabiltyBar
          initialCheckIn={initialCheckIn}
          initialCheckOut={initialCheckOut}
          initialGuests={parsedGuests}
        />
        {/* Loading State */}
        {isSearching && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <Loader2 className="animate-spin mb-4 text-[#1e3a8a]" size={40} />
            <p className="font-medium">Searching for the best rooms...</p>
          </div>
        )}

        {/* Error/Empty State */}
        {!isSearching && (!checkInStr || !checkOutStr) && (
          <div className="text-center py-20 text-gray-500">
            <p className="text-xl font-medium">
              Please enter your dates above to search for rooms.
            </p>
          </div>
        )}

        {/* The Results Grid */}
        {!isSearching && searchResults.length > 0 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ">
            <h3 className="text-3xl font-serif font-bold  text-gray-900 mb-8 flex items-center gap-3 ">
              Available Suites
              <span className="text-sm font-sans font-normal text-gray-600 bg-gray-100 px-4 py-1.5 rounded-full">
                {searchNights} Night{searchNights !== 1 ? 's' : ''} •{' '}
                {parsedGuests} Guest{parsedGuests !== 1 ? 's' : ''}
              </span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {searchResults.map((category) => (
                <div
                  key={category.id}
                  className={`bg-white rounded-2xl shadow-sm border ${category.isAvailable ? 'border-gray-200 hover:border-[#1e3a8a]/30 hover:shadow-xl' : 'border-gray-100 opacity-75'} overflow-hidden transition-all flex flex-col`}
                >
                  {/* Room Header */}
                  <div className="p-6 pb-4 border-b border-gray-100">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-xl font-bold text-gray-900 font-serif">
                        {category.name}
                      </h4>
                      {category.isAvailable ? (
                        <span className="bg-green-50 text-green-700 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-md flex items-center gap-1">
                          <CheckCircle2 size={12} /> Available
                        </span>
                      ) : (
                        <span className="bg-red-50 text-red-600 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-md flex items-center gap-1">
                          <AlertCircle size={12} /> Sold Out
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Users size={16} /> Max {category.capacity}/room
                      </span>
                      <span className="flex items-center gap-1">
                        <BedDouble size={16} /> ₹{category.pricePerRoom}/night
                      </span>
                    </div>
                  </div>

                  {/* Math/Allocation Section */}
                  <div className="p-6 bg-gray-50/50 flex-grow flex flex-col">
                    <div className="bg-white p-4 rounded-xl border border-gray-100 mb-6">
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">
                        Your Requirement
                      </p>
                      <p className="text-gray-800 font-medium text-sm">
                        To fit{' '}
                        <strong className="text-gray-900">
                          {parsedGuests} guests
                        </strong>
                        , you need{' '}
                        <strong className="text-gray-900 text-lg">
                          {category.roomsNeeded} Room
                          {category.roomsNeeded !== 1 ? 's' : ''}
                        </strong>
                        .
                      </p>
                    </div>

                    {/* Action Area */}
                    <div className="mt-auto pt-2 border-t border-gray-200">
                      {category.isAvailable ? (
                        <div className="flex items-center justify-between gap-4 pt-4">
                          <div>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                              Total Price
                            </p>
                            <p className="text-2xl font-bold text-[#1e3a8a]">
                              ₹
                              {(
                                category.totalPrice * searchNights
                              ).toLocaleString()}
                            </p>
                          </div>
                          <Link
                            href={`/book?roomId=${category.id}`}
                            className="bg-secondary text-on-secondary px-8 py-3 rounded-xl font-medium tracking-wide 
                                                                hover:brightness-90 hover:cursor-pointer transition-all duration-300 shadow-sm text-sm"
                          >
                            Book Now
                          </Link>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-4 pt-4">
                          <div>
                            <p className="text-sm font-medium text-red-600">
                              Not enough rooms.
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              Only {category.roomsAvailable} left.
                            </p>
                          </div>
                          <button
                            disabled
                            className="bg-gray-00 text-gray-700 px-6 py-3 rounded-xl font-medium cursor-not-allowed"
                          >
                            Unavailable
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function SearchPage() {
    return (
        <div className="min-h-screen bg-[#FDFBF7]">
            <div className="h-48 bg-[#1e3a8a] w-full"></div> 
            <Suspense fallback={<div className="p-20 text-center">Loading search...</div>}>
                <SearchResultsEngine />
            </Suspense>
        </div>
    )
}