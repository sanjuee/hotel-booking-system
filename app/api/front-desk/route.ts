import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const allUnits = await prisma.roomUnit.findMany({
            include: {
                room:{
                    select: { name: true, type: true}
                }
            },
            orderBy: { roomNumber: 'asc'}
        })

        return NextResponse.json(allUnits, { status: 200 })

    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch front desk data" }, 
            { status: 500 }
        )
    }
}

export async function PATCH(request: Request){
    try {
        const body = await request.json()
        const { unitId, newStatus } = body

        if (!unitId || !newStatus) {
            return NextResponse.json({ error: "Missing data" }, { status: 400 });
        }

        const updatedUnit = await prisma.roomUnit.update({
            where: { id: unitId },
            data:{ status: newStatus }
        })

        return NextResponse.json(updatedUnit, { status: 200})

    } catch (error) {
        console.error("Status update failed:", error);
        return NextResponse.json({ error: "Failed to update status" }, { status: 500 })
    }
}