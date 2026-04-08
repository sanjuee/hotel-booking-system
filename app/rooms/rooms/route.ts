import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const createdRoom = await prisma.room.create({ data: body })

    return NextResponse.json(
      { message: 'Room Added', room: body },
      { status: 201 }
    )
  } catch (error) {
    console.error('Interal server error', error)

    return NextResponse.json(
      { error: 'Failed to create room' },
      { status: 500 }
    )
  }
}
