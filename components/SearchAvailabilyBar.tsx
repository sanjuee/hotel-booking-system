"use client"

import { useState, useRef, useEffect } from "react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

export default function SearchAvailabiltyBar(){

    const [checkInDate, setCheckInDate] = useState<Date | null>(new Date());
    const [checkOutDate, setCheckOutDate] = useState<Date | null>(new Date());

    // Guest States
    const [adults, setAdults] = useState(2);
    const [children, setChildren] = useState(0);
    const [isGuestMenuOpen, setIsGuestMenuOpen] = useState(false);
    
    // Ref for closing the dropdown when clicking outside
    const guestRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (guestRef.current && !guestRef.current.contains(event.target as Node)) {
                setIsGuestMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="flex flex-col md:flex-row items-stretch rounded-2xl shadow-xl border border-outline w-full lg:w-auto z-10 relative bg-white">
                    {/* Check In */}
                    <div className="flex-1 px-5  py-4  md:py-6 border-b md:border-b-0 md:border-r border-outline min-w-40">
                        <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1 md:mb-2">Check-In</label>
                        <DatePicker
                            selected={checkInDate}
                            onChange={(date : Date | null) => setCheckInDate(date)}
                            selectsStart
                            startDate={checkInDate}
                            endDate={checkOutDate}
                            dateFormat="MMM d, yyyy"
                            className="font-headline text-xl md:text-2xl text-gray-800 outline-none tracking-tighter w-full bg-transparent cursor-pointer"
                        />
                    </div>

                    {/* Check Out */}
                    <div className="flex-1 px-5 py-4 md:py-6 border-b md:border-b-0 md:border-r border-outline min-w-40">
                        <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1 md:mb-2">Check-Out</label>
                        <DatePicker
                            selected={checkOutDate}
                            onChange={(date : Date | null) => setCheckOutDate(date)}
                            selectsEnd
                            startDate={checkInDate}
                            endDate={checkOutDate}
                            minDate={checkInDate || undefined}
                            dateFormat="MMM d, yyyy"
                            className="font-headline text-xl md:text-2xl text-gray-800 outline-none tracking-tighter w-full bg-transparent cursor-pointer"
                        />
                    </div>

                    {/* Interactive Guests Section */}
                    <div 
                        ref={guestRef}
                        className="flex-1 px-5 py-4 md:py-6 cursor-pointer group relative min-w-[150px]" 
                        onClick={() => setIsGuestMenuOpen(!isGuestMenuOpen)}
                    >
                        <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1 md:mb-2
                                             group-hover:text-secondary transition-colors">
                            Guests
                        </label>
                        <p className="font-headline text-xl md:text-2xl text-gray-800 select-none">
                            {adults} Adult{adults !== 1 ? 's' : ''} 
                            {children > 0 && <span className="text-base md:text-lg">, {children} Child{children !== 1 ? 'ren' : ''}</span>}
                        </p>

                        {/* Guest Dropdown Menu */}
                        {isGuestMenuOpen && (
                            <div 
                                className="absolute top-full left-0 mt-2 w-full sm:w-64 bg-white border border-gray-200 rounded-xl shadow-xl p-5 z-50 
                                            flex flex-col gap-5 cursor-default"
                                onClick={(e) => e.stopPropagation()} 
                            >
                                {/* Adults Counter */}
                                <div className="flex justify-between items-center">
                                    <span className="font-medium text-gray-800">Adults</span>
                                    <div className="flex items-center gap-3">
                                        <button 
                                            onClick={() => setAdults(Math.max(1, adults - 1))} 
                                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 
                                                        hover:bg-gray-100 transition-colors"
                                        >
                                            -
                                        </button>
                                        <span className="w-4 text-center font-medium">{adults}</span>
                                        <button 
                                            onClick={() => setAdults(adults + 1)} 
                                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 
                                                        hover:bg-gray-100 transition-colors"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                {/* Children Counter */}
                                <div className="flex justify-between items-center">
                                    <div className="flex flex-col">
                                        <span className="font-medium text-gray-800">Children</span>
                                        <span className="text-[10px] text-gray-400">Ages 2-12</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button 
                                            onClick={() => setChildren(Math.max(0, children - 1))} 
                                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 
                                                    hover:bg-gray-100 transition-colors"
                                        >
                                            -
                                        </button>
                                        <span className="w-4 text-center font-medium">{children}</span>
                                        <button 
                                            onClick={() => setChildren(children + 1)} 
                                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 
                                                        hover:bg-gray-100 transition-colors"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button className="bg-secondary text-on-secondary px-8 py-5 md:py-6 uppercase tracking-widest font-medium text-l rounded-b-2xl 
                                    md:rounded-r-2xl  md:rounded-bl-none hover:brightness-90 hover:cursor-pointer transition-all flex items-center justify-center md:min-w-[200px]">
                        Search Availability
                    </button>
                </div>
    )
}