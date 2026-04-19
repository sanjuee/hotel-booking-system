import { FrontDeskRoomUnit } from "@/types";
import { UserCircle } from "lucide-react";

export default function FrontDeskRoomCard({ 
  unit, 
  type,
  onClick 
}: { 
  unit: FrontDeskRoomUnit; 
  type: string;
  onClick?: () => void; 
}) {
  
  const nextBooking = unit.bookings?.find((b: any) => b.status === 'CONFIRMED');

  const isClickable = type === 'FREE' || type === 'FUTURE';

  return (
    <div 
      onClick={isClickable ? onClick : undefined} 
      className={`relative p-4 rounded-xl border transition-all ${isClickable ? 'cursor-pointer hover:scale-[1.02]' : ''} ${
        type === 'FREE' ? 'bg-white border-green-200 hover:border-green-400 hover:shadow-md' :
        type === 'FUTURE' ? 'bg-orange-50/50 border-orange-200 hover:border-orange-400 hover:shadow-md' :
        type === 'INCOMING_TODAY' ? 'bg-red-50 border-red-200' :
        'bg-blue-50 border-blue-200' // Occupied
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-2xl font-black text-slate-900 tracking-tighter">{unit.roomNumber}</span>
      </div>
      
      <p className="text-xs font-medium text-slate-500 line-clamp-1">{unit.room.name}</p>

      {type === 'FUTURE' && nextBooking && (
        <div className="mt-3 pt-3 border-t border-orange-100">
          <p className="text-xs font-bold text-orange-600 uppercase tracking-wider">
           <span className="font-semibold"> Booked for: </span> {new Date(nextBooking.checkInDate).toLocaleDateString()}
          </p>
          <p className="text-xs font-bold text-orange-600 capitalize tracking-wider">
           <span className="uppercase font-semibold"> by: </span>  {nextBooking.guestName}
          </p>
        </div>
      )}

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