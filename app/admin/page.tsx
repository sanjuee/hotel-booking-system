'use client'

import { useState,useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Room } from '@/types' 
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface RoomFormData {
  id: string;
  name: string;
  type: string;
  price: number;
  image: string;
  description: string;
  amenities: string; 
}



export default function AdminDashboard() {
  const router = useRouter()
  const [rooms, setRooms] = useState<Room[]>([]) 
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [formData, setFormData] = useState<RoomFormData>({
    id: '',
    name: '',
    type: 'Single',
    price: 0,
    image: '',
    description: '',
    amenities: '', // Stored as comma-separated string in form, parsed to array on submit
  })

  useEffect( () => {

    const fetchRooms = async() => {
        try{

          const response = await fetch("/api/rooms")

          if (!response.ok) throw new Error("Failed to fetch rooms");

          const data = await response.json() as { rooms: Room[] }
          
          setRooms(data.rooms)

        }
        catch(error) {
          console.log(error)
        }
    }
    fetchRooms()

  }, [])

  const handleSave = async() => {
      setIsSaving(true)

      try {
        let imageUrl= ""

        if (file) {
            
            const fileName = `${Date.now()}-${file.name}`

            const { data, error } = await supabase.storage
              .from('rooms') 
              .upload(fileName, file)

            if (error) throw error;

            const { data: publicUrlData } = supabase.storage
              .from('rooms')
              .getPublicUrl(fileName)

            imageUrl = publicUrlData.publicUrl
        }

        const payload = {
          ...formData,
          image : imageUrl,
          amenities: formData.amenities.split(',').map((item) => item.trim()).filter(Boolean)
        }


        const response = await fetch('/api/rooms', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => null)
          const errorMessage = errorData?.message || errorData?.error || `Server Error: ${response.status}`
          throw new Error(errorMessage)
        }
        const data = await response.json()

        setIsFormOpen(false)
        router.refresh()
        resetForm()
      
    } catch (error) {
      console.error(error)
      alert('Something went wrong saving the room. (Check console)')
    } finally {
      setIsSaving(false)
    
    }
  }

  const handleDelete = async(roomId: string) => {

    if (!window.confirm("Are you sure you want to delete this room ?")) return;

    try {
      const response = await fetch(`/api/rooms/${roomId}`, {
        method : 'DELETE'
      })
      if (!response.ok) throw new Error ("Failed to delete");

      setRooms((prevRooms) => (prevRooms.filter((room) =>(room.id != roomId))))
    }
    catch(error){
      console.log("Delete error", error)
      alert("Falied to delete room")
    }
  }
  

  const resetForm = () => {
    setFormData({
      id: '', name: '', type: 'Single', price: 0, image: '', description: '', amenities: ''
    })
  }

  return (
    
      

      <div className="flex-1 overflow-y-auto p-8 md:p-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-serif font-bold text-gray-900">Rooms Inventory</h2>
            <p className="text-gray-500 mt-1">Manage room details, pricing, and amenities.</p>
          </div>
          <button
            onClick={() => {
              resetForm()
              setIsFormOpen(true)
            }}
            className="bg-secondary text-white px-5 py-2.5 rounded shadow-sm hover:bg-[#685333] 
                      transition-colors font-medium flex items-center gap-2"
          >
            <span>+</span> New Room Entry
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider bg-gray-50/50">
                  <th className="p-5 font-medium">Room Name</th>
                  <th className="p-5 font-medium">Room Type</th>
                  <th className="p-5 font-medium">Price</th>
                  <th className="p-5 font-medium">Amenities</th>
                  <th className="p-5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((room) => (
                  <tr key={room.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="p-5 font-medium text-gray-900">{room.name}</td>
                    <td className="p-5 text-gray-600">{room.type}</td>
                    <td className="p-5 text-gray-600">₹{room.price.toLocaleString()}</td>
                    <td className="p-5 text-gray-500 text-sm truncate max-w-[200px]">
                      {Array.isArray(room.amenities) ? room.amenities.join(', ') : 'None'}
                    </td>
                    <td className="p-5 text-right">
                      <button className=" bg-primary/20 text-red-600 px-2 py-2 rounded shadow-sm 
                                    transition-colors text-xs flex items-center gap-2"
                              onClick={() => handleDelete(room.id)}
                      >
                        DETETE
                      </button>
                    </td>
                  </tr>
                ))}
                {rooms.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">
                      No rooms found. Add a new room entry to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Table Footer / Pagination mock */}
          <div className="p-4 border-t border-gray-200 flex justify-between items-center text-sm 
                      text-gray-500 bg-gray-50/50">
            <span>Showing all {rooms.length} room{rooms.length !== 1 ? 's' : ''}</span>
            
          </div>
        </div>

        {/* ADD/EDIT MODAL */}
        {isFormOpen && (
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-serif font-bold mb-6 text-gray-900">
                {formData.id ? 'Edit Room' : 'New Room Entry'}
              </h2>

              <div className="space-y-5">
                {/* Row 1: Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Room Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-gray-300 p-2.5 rounded-md focus:ring-2 focus:ring-[#8B6E4E] 
                              focus:border-[#8B6E4E] outline-none transition-all"
                    placeholder="e.g. The Curator's Loft"
                  />
                </div>

                {/* Row 2: Type & Price */}
                <div className="flex flex-col sm:flex-row gap-5">
                  <div className="w-full sm:w-1/2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Room Type *</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full border border-gray-300 p-2.5 rounded-md focus:ring-2 focus:ring-[#8B6E4E] 
                                outline-none bg-white"
                    >
                      <option value="Single">Single</option>
                      <option value="Double">Double</option>
                      <option value="Suite">Suite</option>
                      <option value="Penthouse">Penthouse</option>
                    </select>
                  </div>
                  <div className="w-full sm:w-1/2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Price / Night (₹) *</label>
                    <input
                      type="number"
                      // value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      className="w-full border border-gray-300 p-2.5 rounded-md focus:ring-2 focus:ring-[#8B6E4E] 
                                outline-none"
                      placeholder="0.00"
                      min={0}
                    />
                  </div>
                </div>

                {/* Row 3: Image URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Upload Image</label>
                  <input
                    type="file"
                    // value={formData.image}
                    accept='image/*'
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    className="w-full border border-gray-300 p-2.5 rounded-md focus:ring-2 focus:ring-[#8B6E4E] outline-none"
                  />
                </div>

                {/* Row 4: Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full border border-gray-300 p-2.5 rounded-md focus:ring-2 focus:ring-[#8B6E4E] 
                              outline-none min-h-[100px]"
                    placeholder="Enter room details..."
                  />
                </div>

                {/* Row 5: Amenities */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Amenities (Comma separated)</label>
                  <input
                    type="text"
                    value={formData.amenities}
                    onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                    className="w-full border border-gray-300 p-2.5 rounded-md focus:ring-2 focus:ring-[#8B6E4E] outline-none"
                    placeholder="Wi-Fi, Mini Bar, Ocean View"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                  <button
                    onClick={() => setIsFormOpen(false)}
                    disabled={isSaving}
                    className="px-5 py-2.5 text-gray-600 font-medium rounded-md bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-[#7A633F] text-white px-6 py-2.5 rounded-md hover:bg-[#685333] transition-colors 
                                font-medium flex items-center disabled:opacity-70"
                  >
                    {isSaving ? 'Saving...' : 'Save Room Entry'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

  )
}