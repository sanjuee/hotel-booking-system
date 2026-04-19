import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        roomUnit: {
          include: { room: true } // Pull in the physical room number AND the category name
        }
      },
      orderBy: { checkInDate: 'desc' } // Newest bookings first
    });
    return NextResponse.json(bookings, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}

// 2. UPDATE BOOKING STATUS (e.g., Cancel a booking)
export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json();
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status }
    });
    return NextResponse.json(updatedBooking, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}

// 3. CREATE MANUAL CALL-IN BOOKING
export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    const newBooking = await prisma.booking.create({
      data: {
        guestName: data.guestName,
        email: data.email || 'N/A', 
        phone: data.phone,
        checkInDate: new Date(data.checkInDate),
        checkOutDate: new Date(data.checkOutDate),
        totalPrice: parseFloat(data.totalPrice),
        status: 'CONFIRMED',
        roomUnitId: data.roomUnitId,
        specialReq: data.specialReq || null
      },
      include: {
        roomUnit: { include: { room: true } }
      }
    });
    
    return NextResponse.json(newBooking, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create manual booking" }, { status: 500 });
  }
}

