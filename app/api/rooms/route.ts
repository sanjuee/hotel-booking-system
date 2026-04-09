import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'


export async function POST(request: Request) {
  try {

    const body = await request.json()
    const newRoom = await prisma.room.create({
      data: {
        name: body.name,
        type: body.type,
        image: body.image,
        description: body.description,
        price: parseFloat(body.price),
        amenities: Array.isArray(body.amenities)
          ? body.amenities
          : body.amenities.split(',').map((item: string) => item.trim()),
      },
    })

    return NextResponse.json(newRoom, { status: 201 })
  } catch (error: any) {
    console.error('PRISMA ERROR:', error)
    return NextResponse.json(
      { message: 'Failed to save room', error: error.message },
      { status: 500 }
    )
  }
}
