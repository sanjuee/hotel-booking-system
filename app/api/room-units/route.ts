import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request){
    try{
        const { searchParams } = new URL(request.url)
        const roomId = searchParams.get('roomId')

        if (!roomId){
            return NextResponse.json({ error: "Room ID is required"}, {status: 400})
        }

        const units = await prisma.roomUnit.findMany({
            where: {roomId: roomId},
            orderBy: { roomNumber: "asc"}
        })

        return NextResponse.json(units, { status: 200})
    }
    catch(error){
        return NextResponse.json({ error: "Failed to fetch units" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const newUnit = await prisma.roomUnit.create({
            data: {
                roomNumber: body.roomNumber,
                status: body.status || 'AVAILABLE',
                roomId: body.roomId,
            }
        })

        return NextResponse.json(newUnit, { status: 201 })
    }
    catch (error: any) {
    // roomNumber is @unique in schema.prisma, Prisma throws code 'P2002' if we duplicate it.
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "This Room Number already exists in the hotel!" }, { status: 400 });
    }
    console.error("Failed to create unit:", error);
    return NextResponse.json({ error: "Failed to create unit" }, { status: 500 });
  }
}