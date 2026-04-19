// app/api/admin/front-desk/action/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: Request) {
  try {
    const { bookingId, action, roomUnitId } = await request.json();

    // 1. CHECK IN -> Room becomes OCCUPIED
    if (action === 'CHECK_IN') {
      await prisma.$transaction([
        prisma.booking.update({ where: { id: bookingId }, data: { status: 'CHECKED_IN' } }),
        prisma.roomUnit.update({ where: { id: roomUnitId }, data: { status: 'OCCUPIED' } })
      ]);
      return NextResponse.json({ message: "Checked In Successfully" }, { status: 200 });
    }

    // 2. CHECK OUT -> Room becomes DIRTY (or AVAILABLE)
    if (action === 'CHECK_OUT') {
      await prisma.$transaction([
        // End the financial booking
        prisma.booking.update({ 
          where: { id: bookingId }, 
          data: { status: 'CHECKED_OUT' } 
        }),
        // Instantly free up the physical room for the next walk-in
        prisma.roomUnit.update({ 
          where: { id: roomUnitId }, 
          data: { status: 'AVAILABLE' } 
        })
      ]);
      return NextResponse.json({ message: "Checked Out Successfully" }, { status: 200 });
    }

    // 3. NO-SHOW or CANCEL -> Only update the Booking Ledger. 
    // Do NOT touch the RoomUnit because a future cancellation doesn't affect the physical room today.
    if (action === 'NO_SHOW' || action === 'CANCEL') {
      await prisma.booking.update({
        where: { id: bookingId },
        data: { status: action }
      });
      return NextResponse.json({ message: "Booking Cancelled" }, { status: 200 });
    }

    return NextResponse.json({ error: "Invalid Action" }, { status: 400 });

  } catch (error) {
    console.error("Action Error:", error);
    return NextResponse.json({ error: "Failed to process action" }, { status: 500 });
  }
}