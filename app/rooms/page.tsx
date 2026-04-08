import RoomDetailCard from "@/components/RoomDetailCard"
import { dummyRooms } from "@/data/MockRoomData"
import Header from "@/components/layout/Header"

export default function RoomDetails() {
    return (
        <div>
            <Header/>
            <main className="pt-25 ">
                <section className="flex flex-col gap-4">
                    {dummyRooms.map((room) => (
                        <RoomDetailCard key={room.id} room={room} />
                    ))}
                </section>
            </main>
        </div>
    )
}