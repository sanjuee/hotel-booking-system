"use client"

import { useState, useRef, useEffect, forwardRef } from "react"
import { useRouter } from "next/navigation"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

interface CustomInputProps {
    value?: string;
    onClick?: () => void;
    label: string;
}

const DateCustomInput = forwardRef<HTMLButtonElement, CustomInputProps>(
    ({ value, onClick, label }, ref) => (
        <button
            type="button"
            onClick={onClick}
            ref={ref}
            className="w-full h-full text-left px-5 py-4 md:py-6 hover:bg-gray-50 transition-colors flex flex-col justify-center cursor-pointer"
        >
            <span className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1 md:mb-2 pointer-events-none">
                {label}
            </span>
            <span className="font-headline text-xl md:text-2xl text-gray-800 outline-none tracking-tighter w-full bg-transparent pointer-events-none">
                {value || 'Select Date'}
            </span>
        </button>
    )
)
DateCustomInput.displayName = "DateCustomInput";

// 🚨 NEW: Added props so the Search Page can pre-fill the bar!
interface SearchBarProps {
    initialCheckIn?: Date;
    initialCheckOut?: Date;
    initialGuests?: number;
}

export default function SearchAvailabilityBar({ 
    initialCheckIn, 
    initialCheckOut, 
    initialGuests 
}: SearchBarProps) {
    const router = useRouter()
    
    // Default check-out to tomorrow if no initial prop is passed
    const defaultCheckOut = new Date();
    defaultCheckOut.setDate(defaultCheckOut.getDate() + 1);

    const [checkInDate, setCheckInDate] = useState<Date | null>(initialCheckIn || new Date());
    const [checkOutDate, setCheckOutDate] = useState<Date | null>(initialCheckOut || defaultCheckOut);
    const [guests, setGuests] = useState(initialGuests || 2);
    
    const [isGuestMenuOpen, setIsGuestMenuOpen] = useState(false);
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

    // 🚨 THE URL UPDATER
    const handleSearch = () => {
        if (!checkInDate || !checkOutDate) {
            alert("Please select both check-in and check-out dates.");
            return;
        }

        const inStr = checkInDate.toISOString().split('T')[0];
        const outStr = checkOutDate.toISOString().split('T')[0];

        // Push the user to the dedicated Search Page
        router.push(`/search?checkIn=${inStr}&checkOut=${outStr}&guests=${guests}`);
    }

    return (
        
        <div className="flex flex-col md:flex-row items-stretch rounded-2xl shadow-xl border border-gray-100 w-full  bg-white overflow-visible">
            
            {/* Check In */}
            <div className="flex-1 border-b md:border-b-0 md:border-r border-gray-100 min-w-40 rounded-t-2xl md:rounded-tr-none md:rounded-l-2xl overflow-hidden">
                <DatePicker
                    selected={checkInDate}
                    onChange={(date : Date | null) => setCheckInDate(date)}
                    selectsStart
                    startDate={checkInDate}
                    endDate={checkOutDate}
                    minDate={new Date()}
                    dateFormat="MMM d, yyyy"
                    wrapperClassName="w-full h-full" 
                    customInput={<DateCustomInput label="Check-In" />}
                />
            </div>

            {/* Check Out */}
            <div className="flex-1 border-b md:border-b-0 md:border-r border-gray-100 min-w-40 overflow-hidden">
                <DatePicker
                    selected={checkOutDate}
                    onChange={(date : Date | null) => setCheckOutDate(date)}
                    selectsEnd
                    startDate={checkInDate}
                    endDate={checkOutDate}
                    minDate={checkInDate || new Date()}
                    dateFormat="MMM d, yyyy"
                    wrapperClassName="w-full h-full" 
                    customInput={<DateCustomInput label="Check-Out" />}
                />
            </div>

            {/* Guests Section */}
            <div 
                ref={guestRef}
                className="flex-1 px-5 py-4 md:py-6 cursor-pointer group relative min-w-[150px] hover:bg-gray-50 transition-colors border-b md:border-b-0 md:border-r border-gray-100" 
                onClick={() => setIsGuestMenuOpen(!isGuestMenuOpen)}
            >
                <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1 md:mb-2 group-hover:text-blue-600 transition-colors cursor-pointer">
                    Guests
                </label>
                <p className="font-headline text-xl md:text-2xl text-gray-800 select-none">
                    {guests} Guest{guests !== 1 ? 's' : ''} 
                </p>

                {isGuestMenuOpen && (
                    <div 
                        className="absolute top-full left-0 mt-2 w-full sm:w-64 bg-white border border-gray-200 rounded-xl shadow-xl p-5 z-[100] flex flex-col gap-5 cursor-default"
                        onClick={(e) => e.stopPropagation()} 
                    >
                        <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-800">Total Guests</span>
                            <div className="flex items-center gap-3">
                                <button onClick={() => setGuests(Math.max(1, guests - 1))} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100">-</button>
                                <span className="w-4 text-center font-medium">{guests}</span>
                                <button onClick={() => setGuests(guests + 1)} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100">+</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Submit Button */}
            <button 
                onClick={handleSearch} 
                className="bg-secondary text-on-secondary px-8 py-5 md:py-6 uppercase tracking-widest font-medium text-l rounded-b-2xl md:rounded-r-2xl md:rounded-bl-none hover:brightness-90 hover:cursor-pointer transition-all flex items-center justify-center md:min-w-[200px]"
            >
                Search Availability
            </button>
        </div>
    )
}