import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const checkInStr = searchParams.get('checkIn')
    const checkOutStr = searchParams.get('checkOut')
    const guests = parseInt(searchParams.get('guests') || '1') 

    if (!checkInStr || !checkOutStr) {
      return NextResponse.json({ error: "Dates are required." }, { status: 400 })
    }

    const start = new Date(checkInStr)
    const end = new Date(checkOutStr)

    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))

    // 1. Fetch all room categories and their physical units
    const categories = await prisma.room.findMany({
      include: {
        units: {
          where: {
            status: { not: 'MAINTENANCE' },
            bookings: {
              none: {
                AND: [
                  { checkInDate: { lt: end } },
                  { checkOutDate: { gt: start } },
                  { status: { in: ['CONFIRMED', 'CHECKED_IN'] } }
                ]
              }
            }
          }
        }
      }
    })

    // 2. THE LOGIC ENGINE: Calculate requirements per category
    const results = categories.map(category => {
      // Math: Total Guests / Capacity (e.g., 5 guests / 2 capacity = 3 rooms needed)
      const roomsNeeded = Math.ceil(guests / category.capacity)
      const roomsAvailable = category.units.length
      
      return {
        id: category.id,
        name: category.name,
        capacity: category.capacity,
        pricePerRoom: category.price,
        roomsNeeded: roomsNeeded,
        roomsAvailable: roomsAvailable,
        isAvailable: roomsAvailable >= roomsNeeded, 
        totalPrice: roomsNeeded * category.price
      }
    })

    return NextResponse.json({
      guests,
      checkIn: checkInStr,
      checkOut: checkOutStr,
      nights,
      results
    }, { status: 200 })

  } catch (error) {
    console.error("Search Error:", error)
    return NextResponse.json({ error: "Search failed" }, { status: 500 })
  }
}