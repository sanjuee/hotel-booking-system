// import { prisma } from "@/lib/prisma";
// import { NextResponse } from "next/server";

// export async function POST(request: Request) {
//     try {
//         const { checkIn, checkOut, guests } = await request.json()
//         const requestedStart = new Date(checkIn)
//         const requestedEnd = new Date(checkOut)

//         const availableCategories = await prisma.room.findMany({
//             where: {
//                 capacity: { gte: parseInt(guests) } // Must hold at least this many guests
//             },
//             include: {
//                 // Get all physical units for this category that aren't broken
//                 units: { where: { status: 'AVAILABLE' } },
//                 // Look for any bookings that overlap with our requested dates
//                 bookings: {
//                 where: {
//                     AND: [
//                     { checkIn: { lt: requestedEnd } },
//                     { checkOut: { gt: requestedStart } },
//                     { status: 'CONFIRMED' } // Only count actual bookings, not cancelled ones
//                     ]
//                 }
//                 }
//             }
//         })

//     } catch (error) {
        
//     }
// } 