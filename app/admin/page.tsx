
'use client'

import { useState, useEffect } from 'react'
import { Search } from 'lucide-react' 

interface FrontDeskUnit {
  id: string
  roomNumber: string
  status: 'AVAILABLE' | 'BOOKED' | 'OCCUPIED' | 'MAINTENANCE'
  roomId: string
  room: {
    name: string
    type: string
  }
}

export default function FrontDesk() {
  const [units, setUnits] = useState<FrontDeskUnit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<
    'ALL' | 'AVAILABLE' | 'BOOKED' | 'OCCUPIED' | 'MAINTENANCE'
  >('ALL')
  const [searchQuery, setSearchQuery] = useState('') // <-- New Search State

  useEffect(() => {
    fetchRooms()
  }, [])

  const fetchRooms = async () => {
    try {
      const res = await fetch('/api/front-desk')
      if (res.ok) {
        const data = await res.json()
        setUnits(data)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (unitId: string, newStatus: string) => {
    setUnits((prev) =>
      prev.map((u) =>
        u.id === unitId ? { ...u, status: newStatus as any } : u
      )
    )

    try {
      const res = await fetch('/api/front-desk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unitId, newStatus }),
      })

      if (!res.ok) throw new Error('Failed to update database')
    } catch (error) {
      alert('Status update failed. Reverting.')
      fetchRooms() // Re-fetch to fix the UI if the database failed
    }
  }

  const filteredUnits = units.filter((u) => {
    const matchesFilter = filter === 'ALL' ? true : u.status === filter
    const matchesSearch = u.roomNumber
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  if (isLoading)
    return <div className="p-12 text-center">Loading Front Desk...</div>

  return (
    <div className="p-8 md:p-12 min-h-screen bg-white">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-gray-900">
          Live Front Desk
        </h1>
        <p className="text-gray-500 mt-1">
          Manage physical room statuses and walk-in availability.
        </p>
      </div>

      
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-8">
        <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 w-full xl:w-auto hide-scrollbar">
          {['ALL', 'AVAILABLE', 'BOOKED', 'OCCUPIED', 'MAINTENANCE'].map(
            (statusOption) => (
              <button
                key={statusOption}
                onClick={() => setFilter(statusOption as any)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  filter === statusOption
                    ? 'bg-blue-700 text-white shadow-md' // Updated to match your boutique theme
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                {statusOption}
              </button>
            )
          )}
        </div>

        
        <div className="relative w-full xl:w-72 shrink-0">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search room number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg outline-none 
                        focus:ring-2 focus:ring-blue-700 focus:border-blue-800 transition-all text-sm shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredUnits.map((unit) => (
          <div
            key={unit.id}
            className={`bg-white border-2 rounded-xl p-5 shadow-sm transition-all ${
              unit.status === 'AVAILABLE'
                ? 'border-green-100 hover:border-green-300'
                : unit.status === 'BOOKED'
                  ? 'border-gray-200 opacity-90'
                  : unit.status === 'OCCUPIED'
                    ? 'border-blue-200 bg-blue-50/20'
                    : 'border-yellow-200 bg-yellow-50/30'
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-2xl font-bold text-gray-900">
                {unit.roomNumber}
              </h3>

              <div
                className={`h-3 w-3 rounded-full mt-2 shrink-0 ${
                  unit.status === 'AVAILABLE'
                    ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]'
                    : unit.status === 'BOOKED'
                      ? 'bg-gray-400'
                      : unit.status === 'OCCUPIED'
                        ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]'
                        : 'bg-yellow-400'
                }`}
              />
            </div>

            <div className="mb-4">
              <p className="text-sm font-medium text-gray-800 line-clamp-1">
                {unit.room?.name}
              </p>
              <p className="text-xs text-gray-500">{unit.room?.type}</p>
            </div>

            <select
              value={unit.status}
              onChange={(e) => handleStatusChange(unit.id, e.target.value)}
              className={`w-full text-sm p-2 rounded-lg border outline-none font-medium mt-auto ${
                unit.status === 'AVAILABLE'
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : unit.status === 'BOOKED'
                    ? 'bg-gray-100 border-gray-200 text-gray-700'
                    : unit.status === 'OCCUPIED'
                      ? 'bg-blue-50 border-blue-200 text-blue-800'
                      : 'bg-yellow-100 border-yellow-300 text-yellow-800'
              }`}
            >
              <option value="AVAILABLE">Available</option>
              <option value="OCCUPIED">Occupied (Checked In)</option>
              <option value="BOOKED">Booked</option>
              <option value="MAINTENANCE">Maintenance</option>
            </select>
          </div>
        ))}

        {filteredUnits.length === 0 && (
          <div className="col-span-full py-16 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Search className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              No rooms found
            </h3>
            <p className="text-gray-500">
              {searchQuery
                ? `No rooms matching "${searchQuery}" in ${filter} status.`
                : 'No rooms match the current filter.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
