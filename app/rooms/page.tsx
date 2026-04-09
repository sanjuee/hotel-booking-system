"use client"

import RoomDetailCard from "@/components/RoomDetailCard"
import { dummyRooms } from "@/data/MockRoomData"
import Header from "@/components/layout/Header"
import { useEffect, useState } from "react"
import { Room } from "@/types"



export default function RoomDetails() {

    const [rooms, setRooms] = useState <Room[]>([])

    useEffect( () => {
        const fetchRoom = async() => {
            try {
                const response = await fetch("/api/rooms")
                if (!response.ok) throw Error("Error fething rooms");
                const data = await response.json() as { rooms : Room[] }
                setRooms(data.rooms)

            } catch (error) {
                console.log(error)
            }
        }
        fetchRoom()
    }, [])

    return (
        <div>
            <Header/>
            <main className="pt-25 ">
                <section className="flex flex-col gap-4">
                    {rooms.map((room) => (
                        <RoomDetailCard key={room.id} room={room} />
                    ))}
                </section>
            </main>
        </div>
    )
}