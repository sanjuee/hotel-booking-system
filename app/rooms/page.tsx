import RoomDetailCard from "@/components/RoomDetailCard"
import { dummyRooms } from "@/data/MockRoomData"

export default function RoomDetails() {
    return (
        <main className="pt-25">
                {dummyRooms.map((room) => (
                    <RoomDetailCard key={room.id} room={room} />
                ))}
        </main>
    )
}