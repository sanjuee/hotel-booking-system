import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // 1. Get Midnight Today and Midnight Tomorrow for precise date filtering
    const now = new Date()
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    )
    const startOfTomorrow = new Date(startOfToday)
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1)

    // 2. FETCH ARRIVALS (Bookings starting today that are still CONFIRMED)
    const arrivals = await prisma.booking.findMany({
      where: {
        checkInDate: { gte: startOfToday, lt: startOfTomorrow },
        status: 'CONFIRMED',
      },
      include: { roomUnit: { include: { room: true } } },
    })

    // 3. FETCH NO-SHOWS (Bookings from yesterday or older that never checked in)
    const noShows = await prisma.booking.findMany({
      where: {
        checkInDate: { lt: startOfToday },
        status: 'CONFIRMED', // Still confirmed, but the date passed!
      },
      include: { roomUnit: { include: { room: true } } },
    })

    // 4. FETCH CURRENT LIVE ROOM STATUS (For the Walk-in grid)
    const liveRooms = await prisma.roomUnit.findMany({
      include: {
        room: true,
        // Optional: Include the current active booking to show the guest name
        bookings: {
          where: { status: { in: ['CHECKED_IN', 'CONFIRMED']}},
        },
      },
      orderBy: { roomNumber: 'asc' },
    })

    return NextResponse.json({ arrivals, noShows, liveRooms }, { status: 200 })
  } catch (error) {
    console.error('Front Desk API Error:', error)
    return NextResponse.json(
      { error: 'Failed to load dashboard' },
      { status: 500 }
    )
  }
}
