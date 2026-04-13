import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendBookingEmails } from "@/lib/email"

export async function POST(request: Request){
    try {
        const body = await request.json()

        const availableUnit = await prisma.roomUnit.findFirst({
            where: {
                roomId: body.roomId,
                status: 'AVAILABLE'
            }
        })

        if (!availableUnit) {
            return NextResponse.json(
                { error: "Sorry, there are no available rooms in this category right now."},
                { status: 400 }
            )
        }

        const roomCategory = await prisma.room.findUnique({
            where: { id: body.roomId }
        })
        
        if (!roomCategory) throw new Error("Room category not found");

        const newBooking = await prisma.$transaction(async (tx) => {
            const booking = await tx.booking.create({
                data: {
                    guestName: body.guestName,
                    email: body.email,
                    phone: body.phone,
                    checkInDate: new Date(body.checkInDate),
                    checkOutDate: new Date(body.checkOutDate),
                    specialReq: body.specialReq,
                    totalPrice: roomCategory.price, // Locking in the current price
                    roomUnitId: availableUnit.id    // Linking to the specific physical room!
                }
            })

            await tx.roomUnit.update({
                where: { id: availableUnit.id },
                data : { status: 'BOOKED' }
            })

            return booking
        })

        sendBookingEmails(newBooking, availableUnit.roomNumber, roomCategory.name)

        return NextResponse.json(
            { meassage: "Booking Confirmed!", booking: newBooking },
            { status: 200}
        )

    } catch (error) {
        console.error("Booking Error:", error)
        return NextResponse.json(
            { error: "Inernal Server Error" },
            { status: 500}
        )
    }
}