import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT ( 
            request : Request,
            context : { params: Promise<{id: string }>}
) {
    try {
       const resolvedParams = await context.params
       const roomId = resolvedParams.id
       const body = await request.json()

       const updatedRoom = await prisma.room.update({
            where: { id: roomId },
            data: { 
                name: body.name,
                type: body.type,
                image: body.image,
                description: body.description,
                price: parseFloat(body.price),
                amenities: Array.isArray(body.amenities)
                ? body.amenities
                : body.amenities.split(',').map((item: string) => item.trim()),  
            }
       })

       return NextResponse.json(updatedRoom, {status: 200})
    } catch (error) {
        console.log('PRISMA ERROR:', error)
        return NextResponse.json(
            { message: 'Failed to update room' },
            { status: 500 }
        )
    }
}

export async function DELETE (
    request: Request,
    context: { params: Promise<{ id: string }>}
){
    try {
        const resolvedParams = await context.params
        const roomId = resolvedParams.id
        const deletedRoom = await prisma.room.delete({
            where: { id: roomId }
        })

        return NextResponse.json({status : 200})
    } catch (error) {
        console.log('PRISMA ERROR:', error)
        return NextResponse.json(
            { message: 'Failed to delete room' },
            { status: 500 }
        )
    }
}