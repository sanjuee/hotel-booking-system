import { RoomUnit } from "@/types";
import { UserCircle } from "lucide-react";

export default function FrontDeskRoomCard({ unit, type }: { unit: RoomUnit, type: string }) {
  
  // Find the next incoming booking to show the date
  const nextBooking = unit.bookings?.find((b: any) => b.status === 'CONFIRMED');

  return (
    <div className={`relative p-4 rounded-xl border transition-all ${
      type === 'FREE' ? 'bg-white border-green-200 hover:border-green-400 hover:shadow-md' :
      type === 'FUTURE' ? 'bg-orange-50/50 border-orange-200' :
      type === 'INCOMING_TODAY' ? 'bg-red-50 border-red-200' :
      'bg-blue-50 border-blue-200' // Occupied
    }`}>
      <div className="flex justify-between items-start mb-2">
        <span className="text-2xl font-black text-slate-900 tracking-tighter">{unit.roomNumber}</span>
      </div>
      
      <p className="text-xs font-medium text-slate-500 line-clamp-1">{unit.room.name}</p>

      {/* Logic to show the Future Booking Date */}
      {type === 'FUTURE' && nextBooking && (
        <div className="mt-3 pt-3 border-t border-orange-100">
          <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">
            Booked for: {new Date(nextBooking.checkInDate).toLocaleDateString()}
          </span>
        </div>
      )}

      {/* Logic to show the Active Guest Name */}
      {type === 'OCCUPIED' && unit.bookings?.[0] && (
        <div className="mt-3 pt-3 border-t border-blue-100 flex items-center gap-1.5">
          <UserCircle size={14} className="text-blue-500" />
          <span className="text-xs font-bold text-blue-900 truncate">
            {unit.bookings.find((b:any) => b.status === 'CHECKED_IN')?.guestName || 'Guest'}
          </span>
        </div>
      )}
    </div>
  )
}