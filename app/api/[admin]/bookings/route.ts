import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendBookingEmails } from '@/lib/email'
import { Booking } from '@/types'

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

//  UPDATE BOOKING STATUS (e.g., Cancel a booking)
export async function PATCH(request: Request) {
  try {
    const { bookingId, action, roomUnitId } = await request.json()

    let newStatus: 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED' = 'CONFIRMED'
    if (action === 'CHECK_IN') newStatus = 'CHECKED_IN'
    if (action === 'CHECK_OUT') newStatus = 'CHECKED_OUT'
    if (action === 'CANCEL') newStatus = 'CANCELLED'

    let result;

    // 🚨 Run specific transactions based on the action so TypeScript knows exactly what to expect
    if (action === 'CHECK_IN' && roomUnitId) {
      result = await prisma.$transaction([
        prisma.booking.update({ where: { id: bookingId }, data: { status: newStatus } }),
        prisma.roomUnit.update({ where: { id: roomUnitId }, data: { status: 'OCCUPIED' } })
      ]);
    } 
    else if (action === 'CHECK_OUT' && roomUnitId) {
      result = await prisma.$transaction([
        prisma.booking.update({ where: { id: bookingId }, data: { status: newStatus } }),
        prisma.roomUnit.update({ where: { id: roomUnitId }, data: { status: 'AVAILABLE' } })
      ]);
    } 
    else {
      // For CANCEL or just updating a booking without touching the physical room
      const singleUpdate = await prisma.booking.update({ 
        where: { id: bookingId }, 
        data: { status: newStatus } 
      });
      result = [singleUpdate]; // Wrap in array to match the return format below
    }

    // Return the updated booking (which is the first item in the result array)
    return NextResponse.json(result[0], { status: 200 })

  } catch (error) {
    console.error("Status Update Error:", error)
    return NextResponse.json(
      { error: 'Failed to update status' },
      { status: 500 }
    )
  }
}

// New Booking (ONLINE & MANUAL)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      guestName,
      email,
      phone,
      checkInDate,
      checkOutDate,
      roomId,
      roomUnitId,
      status,
      specialReq, // guest's special requests
    } = body

    //  DATE & NIGHTS CALCULATION
    const start = new Date(checkInDate)
    const end = new Date(checkOutDate)
    const nights = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (nights <= 0) {
      return NextResponse.json(
        { error: 'Invalid date range. Check-out must be after check-in.' },
        { status: 400 }
      )
    }

    let assignedUnitId = roomUnitId
    let basePrice = 0

    // THE AUTO-ALLOCATOR & PRICE ENGINE
    if (assignedUnitId) {
      //  FRONT DESK ( If physical Unit was manually selected)
      const unit = await prisma.roomUnit.findUnique({
        where: { id: assignedUnitId },
        include: { room: true },
      })

      if (!unit) {
        return NextResponse.json(
          { error: 'Room unit not found.' },
          { status: 404 }
        )
      }
      basePrice = unit.room.price
    } else {
      //  PUBLIC / CALL-IN (Category was selected, need to auto-allocate)
      if (!roomId) {
        return NextResponse.json(
          { error: 'Room category is required for auto-allocation.' },
          { status: 400 }
        )
      }

      // fetching the category to get the base price
      const category = await prisma.room.findUnique({
        where: { id: roomId },
      })

      if (!category) {
        return NextResponse.json(
          { error: 'Room category not found.' },
          { status: 404 }
        )
      }
      basePrice = category.price

      //  finding an empty physical room for these dates
      const availableUnit = await prisma.roomUnit.findFirst({
        where: {
          roomId: roomId,
          status: { not: 'MAINTENANCE' },
          bookings: {
            none: {
              AND: [
                { checkInDate: { lt: end } },
                { checkOutDate: { gt: start } },
                { status: { in: ['CONFIRMED', 'CHECKED_IN'] } },
              ],
            },
          },
        },
      })

      // If no rooms available, throw the Sold Out error
      if (!availableUnit) {
        return NextResponse.json(
          { error: 'Sorry, this room type is sold out for these dates.' },
          { status: 409 }
        )
      }

      assignedUnitId = availableUnit.id
    }

    //  PRICE CALCULATION
    const securedTotalPrice = nights * basePrice

    //  CREATE THE BOOKING
    const newBooking = await prisma.booking.create({
      data: {
        guestName,
        email,
        phone,
        checkInDate: start,
        checkOutDate: end,
        totalPrice: securedTotalPrice, // Saving the server-calculated price
        status: status || 'CONFIRMED',
        roomUnitId: assignedUnitId,
        specialReq: specialReq || null,
      },
      // Include the relation data so we can pass it to the email template
      include: {
        roomUnit: {
          include: {
            room: true,
          },
        },
      },
    })

    //  EMAIL TRIGGER
    // Only email the guest if this is a future reservation
    if (newBooking.status === 'CONFIRMED' && newBooking.email) {
      try {
        await sendBookingEmails(
          newBooking as any, // Cast to bypass slight Prisma vs Custom type strictness
          newBooking.roomUnit.roomNumber,
          newBooking.roomUnit.room.name
        )
      } catch (emailError) {
        console.error(
          'Non-fatal error: Failed to send confirmation email.',
          emailError
        )
      }
    }

    return NextResponse.json(newBooking, { status: 201 })
  } catch (error) {
    console.error('Booking Creation Error:', error)
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}
