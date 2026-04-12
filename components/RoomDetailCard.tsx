// components/RoomCard.tsx
import { Room } from '../types'
import Image from 'next/image'
import Link from 'next/link'

export default function RoomCard({ room }: { room: Room }) {
  return (
    <div className="flex flex-col md:flex-row border border-outline rounded-lg overflow-hidden bg-background shadow-sm hover:shadow-md transition">
      
      {/* 1. LEFT SECTION: Image Container */}
      <div className="md:w-1/3 relative min-h-[250px] ">
        <Image 
          src={room.image} 
          alt={room.name} 
          fill
          className="absolute inset-0 w-full h-full object-cover" 
        />
      </div>

      {/* 2. CENTER SECTION: Text and Amenities */}
      <div className="p-6 md:w-1/2 flex-1">
        <h2 className="text-2xl font-semibold text-foreground font-headline">{room.name}</h2>
        <p className="text-primary mt-3 text-sm leading-relaxed">
          {room.description}
        </p>
        
        {/* Amenities Row */}
        <div className="flex flex-wrap gap-3 mt-6">
          {room.amenities.map((amenity, index) => (
            <div 
              key={index} 
              className="w-10 h-10 border border-outline rounded flex items-center justify-center text-secondary text-xs"
              title={amenity}
            >
              {/* In a real app, you would map 'amenity' to an actual SVG icon here */}
              [Icon]
            </div>
          ))}
        </div>
      </div>

      {/* 3. RIGHT SECTION: Booking Action */}
      <div className="p-6 border-t md:border-t-0 md:border-l border-outline flex flex-col justify-center items-center md:w-56">
        {/* Using opacity-90 for hover state instead of a hardcoded lighter color */}
        <Link   href={`/book?roomId=${room.id}`}
                className="flex justify-center bg-secondary text-on-secondary px-8 py-2.5 rounded-full font-medium shadow-sm hover:opacity-90 transition 
                    w-full"
        >
          Book Now
        </Link>
      </div>

    </div>
  )
}