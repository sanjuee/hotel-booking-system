import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        roomUnit: {
          include: { room: true }, // Pull in the physical room number AND the category name
        },
      },
      orderBy: { checkInDate: 'desc' }, // Newest bookings first
    })
    return NextResponse.json(bookings, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}

// 2. UPDATE BOOKING STATUS (e.g., Cancel a booking)
export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json()
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status },
    })
    return NextResponse.json(updatedBooking, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update status' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      guestName,
      email,
      phone,
      checkInDate,
      checkOutDate,
      totalPrice,
      roomId,
      roomUnitId,
      status,
    } = body

    const start = new Date(checkInDate)
    const end = new Date(checkOutDate)

    let assignedUnitId = roomUnitId

    // 🚨 THE AUTO-ALLOCATOR 🚨
    // If no specific unit was provided, the system must find one automatically
    if (!assignedUnitId) {
      if (!roomId) {
        return NextResponse.json(
          { error: 'Room category is required for public bookings' },
          { status: 400 }
        )
      }

      const availableUnit = await prisma.roomUnit.findFirst({
        where: {
          roomId: roomId, // Must be the category the guest requested (e.g., Deluxe)
          status: { not: 'MAINTENANCE' }, // Don't assign broken rooms
          bookings: {
            none: {
              // The Overlap Formula: Ignore rooms that have overlapping confirmed bookings
              AND: [
                { checkInDate: { lt: end } },
                { checkOutDate: { gt: start } },
                { status: { in: ['CONFIRMED', 'CHECKED_IN'] } },
              ],
            },
          },
        },
      })

      if (!availableUnit) {
        return NextResponse.json(
          { error: 'Sorry, this room type is sold out for these dates.' },
          { status: 409 }
        )
      }

      assignedUnitId = availableUnit.id
    }

    // Create the booking with either the manually picked ID or the auto-allocated ID
    const newBooking = await prisma.booking.create({
      data: {
        guestName,
        email,
        phone,
        checkInDate: start,
        checkOutDate: end,
        totalPrice: parseFloat(totalPrice),
        status: status || 'CONFIRMED',
        roomUnitId: assignedUnitId,
      },
    })

    return NextResponse.json(newBooking, { status: 201 })
  } catch (error) {
    console.error('Booking Creation Error:', error)
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}
