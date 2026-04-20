import { FrontDeskRoomUnit } from '@/types'
import { UserCircle, Calendar } from 'lucide-react'

export default function FrontDeskRoomCard({
  unit,
  type,
  onClick,
}: {
  unit: FrontDeskRoomUnit
  type: string
  onClick?: () => void
}) {
  const nextBooking = unit.bookings?.find((b: any) => b.status === 'CONFIRMED')
  const occupiedBook = unit.bookings?.find(
    (b: any) => b.status === 'CHECKED_IN'
  )

  return (
    <div
      onClick={onClick}
      className={`relative p-4 rounded-xl border transition-all  cursor-pointer hover:scale-[1.02]
        ${
          type === 'FREE'
            ? 'bg-white border-green-200 hover:border-green-400 hover:shadow-md'
            : type === 'FUTURE'
              ? 'bg-orange-50/50 border-orange-200 hover:border-orange-400 hover:shadow-md'
              : type === 'INCOMING_TODAY'
                ? 'bg-red-50 border-red-200'
                : 'bg-blue-50 border-blue-200' // Occupied
        }`}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-2xl font-black text-slate-900 tracking-tighter">
          {unit.roomNumber}
        </span>
      </div>

      <p className="text-xs font-medium text-slate-500 line-clamp-1">
        {unit.room.name}
      </p>

      {type === 'FUTURE' && nextBooking && (
        <div className="mt-3 pt-3 border-t border-orange-100 flex flex-col gap-2">
          {/* Guest Name */}
          <p className="text-xs font-bold text-orange-900 truncate flex items-center gap-1.5">
            <UserCircle size={14} className="text-orange-500 shrink-0" />
            {nextBooking.guestName || 'Upcoming Guest'}
          </p>

          {/* Check-In → Check-Out Dates */}
          <div className="text-[11px] font-medium text-orange-700/80 flex items-center gap-1.5">
            <Calendar size={13} className="text-orange-400 shrink-0" />

            <span>
              {new Date(nextBooking.checkInDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </span>

            <span className="text-orange-300 mx-0.5">→</span>

            <span>
              {new Date(nextBooking.checkOutDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>
      )}

      {type === 'OCCUPIED' && unit.bookings?.[0] && (
        <div className="mt-3 pt-3 border-t border-blue-100 flex flex-col gap-2">
          {/* Guest Name */}
          <p className="text-xs font-bold text-blue-900 truncate flex items-center gap-1.5">
            <UserCircle size={14} className="text-blue-500 shrink-0" />
            {occupiedBook?.guestName || 'Guest'}
          </p>

          {/* Check-In → Check-Out Dates */}
          <div className="text-[11px] font-medium text-blue-700/80 flex items-center gap-1.5">
            <Calendar size={13} className="text-blue-400 shrink-0" />

            <span>
              {occupiedBook?.checkInDate
                ? new Date(occupiedBook.checkInDate).toLocaleDateString(
                    'en-US',
                    { month: 'short', day: 'numeric' }
                  )
                : 'TBD'}
            </span>

            <span className="text-blue-300 mx-0.5">→</span>

            <span>
              {occupiedBook?.checkOutDate
                ? new Date(occupiedBook.checkOutDate).toLocaleDateString(
                    'en-US',
                    { month: 'short', day: 'numeric' }
                  )
                : 'TBD'}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
