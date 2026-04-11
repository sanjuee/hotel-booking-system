"use client"

import RoomDetailCard from "@/components/RoomDetailCard"
import Header from "@/components/layout/Header"
import { useEffect, useState } from "react"
import { Room } from "@/types"

export default function RoomDetails() {
    const [rooms, setRooms] = useState<Room[]>([])
    // 1. Add loading state
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchRoom = async() => {
            try {
                const response = await fetch("/api/rooms")
                if (!response.ok) throw Error("Error fetching rooms");
                const data = await response.json() as { rooms : Room[] }
                setRooms(data.rooms)
            } catch (error) {
                console.log(error)
            } finally {
                // 2. Ensure loading is turned off whether the fetch succeeds or fails
                setIsLoading(false)
            }
        }
        fetchRoom()
    }, [])

    return (
        <div className="min-h-screen bg-[#FDFBF7]">
            <Header/>
            
            {/* Added container padding to keep cards nicely framed */}
            <main className="pt-25 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                <section className="flex flex-col gap-6">
                    {isLoading ? (
                        // 3. Render Skeleton Loaders (Mapping 3 fake cards)
                        [...Array(3)].map((_, index) => (
                            <div 
                                key={index} 
                                className="flex flex-col md:flex-row border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm animate-pulse"
                            >
                                {/* LEFT SECTION: Skeleton Image */}
                                <div className="md:w-1/3 relative min-h-[250px] bg-gray-200"></div>

                                {/* CENTER SECTION: Skeleton Text & Amenities */}
                                <div className="p-6 md:w-1/2 flex-1 flex flex-col justify-center">
                                    {/* Title */}
                                    <div className="h-7 bg-gray-200 rounded-md w-2/3 mb-4"></div>
                                    
                                    {/* Description Lines */}
                                    <div className="space-y-2 mt-2">
                                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                                        <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                                    </div>
                                    
                                    {/* Amenities Row */}
                                    <div className="flex flex-wrap gap-3 mt-8">
                                        {[...Array(4)].map((_, i) => (
                                            <div key={i} className="w-10 h-10 bg-gray-200 rounded"></div>
                                        ))}
                                    </div>
                                </div>

                                {/* RIGHT SECTION: Skeleton Button */}
                                <div className="p-6 border-t md:border-t-0 md:border-l border-gray-200 flex flex-col justify-center items-center md:w-56">
                                    <div className="h-11 bg-gray-200 w-full rounded-full"></div>
                                </div>
                            </div>
                        ))
                    ) : rooms.length === 0 ? (
                        // 4. Empty State
                        <div className="text-center py-20">
                            <span className="text-4xl mb-4 block">🛏️</span>
                            <h3 className="text-lg font-medium text-gray-900">No rooms available</h3>
                            <p className="text-gray-500 mt-1">Please check back later.</p>
                        </div>
                    ) : (
                        // 5. Actual Data State
                        rooms.map((room) => (
                            <RoomDetailCard key={room.id} room={room} />
                        ))
                    )}
                </section>
            </main>
        </div>
    )
}