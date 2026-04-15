'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Room } from '@/types'
import { createClient } from '@supabase/supabase-js'
import { Edit2, Trash2, UploadCloud } from 'lucide-react'
import Image from 'next/image'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface RoomFormData {
  id: string
  name: string
  type: string
  price: number | string
  image: string
  description: string
  amenities: string
}

interface RoomUnit {
  id: string
  roomNumber: string
  status: string
  roomId: string
}

export default function ManageRoomInventory() {
  const router = useRouter()
  const [rooms, setRooms] = useState<Room[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [formData, setFormData] = useState<RoomFormData>({
    id: '',
    name: '',
    type: 'Single',
    price: '',
    image: '',
    description: '',
    amenities: '',
  })
  
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null)
  const [roomUnits, setRoomUnits] = useState<RoomUnit[]>([])
  const [newUnitNumber, setNewUnitNumber] = useState('')
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false)

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetch('/api/rooms')
        if (!response.ok) throw new Error('Failed to fetch rooms')
        const data = (await response.json()) as { rooms: Room[] }
        setRooms(data.rooms)
      } catch (error) {
        console.log(error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchRooms()
  }, [])

  const handleSave = async () => {
    setIsSaving(true)

    try {
      let imageUrl = formData.image

      if (file) {
        const fileName = `${Date.now()}-${file.name}`
        const { data, error } = await supabase.storage
          .from('rooms')
          .upload(fileName, file)

        if (error) throw error

        const { data: publicUrlData } = supabase.storage
          .from('rooms')
          .getPublicUrl(fileName)

        imageUrl = publicUrlData.publicUrl
      }

      const payload = {
        ...formData,
        image: imageUrl,
        amenities: formData.amenities
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
      }

      const isUpdate = formData.id !== ''
      const url = isUpdate ? `/api/rooms/${formData.id}` : `/api/rooms`
      const method = isUpdate ? 'PUT' : 'POST'
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        const errorMessage =
          errorData?.message ||
          errorData?.error ||
          `Server Error: ${response.status}`
        throw new Error(errorMessage)
      }
      const savedRoom = await response.json()

      if (isUpdate) {
        setRooms((prevRooms) =>
          prevRooms.map((room) => (room.id === formData.id ? savedRoom : room))
        )
      } else {
        setRooms((prevRooms) => [...prevRooms, savedRoom])
      }

      setIsFormOpen(false)
      setFile(null)
      resetForm()
    } catch (error) {
      console.error(error)
      alert('Something went wrong saving the room. (Check console)')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (roomId: string) => {
    if (!window.confirm('Are you sure you want to delete this room ?')) return

    try {
      const response = await fetch(`/api/rooms/${roomId}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete')
      setRooms((prevRooms) => prevRooms.filter((room) => room.id != roomId))
    } catch (error) {
      console.log('Delete error', error)
      alert('Failed to delete room')
    }
  }

  const fetchUnits = async (roomId: string) => {
    setActiveRoomId(roomId)
    setIsUnitModalOpen(true)
    try {
      const res = await fetch(`/api/room-units?roomId=${roomId}`)
      if (res.ok) {
        const data = await res.json()
        setRoomUnits(data)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleRoomUnitSave = async () => {
      if (!newUnitNumber.trim()) return;
      try {
        const res = await fetch('/api/room-units', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomNumber: newUnitNumber, roomId: activeRoomId, status: 'AVAILABLE' })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        
        setRoomUnits([...roomUnits, data]); 
        setNewUnitNumber(''); 
      } catch (err: any) {
        alert(err.message);
      }
  }

  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      type: 'Single',
      price: '',
      image: '',
      description: '',
      amenities: '',
    })
  }

  const previewUrl = file ? URL.createObjectURL(file) : formData.image

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-12 bg-[#FDFBF7] min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-10 gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900">
            Manage Room Inventory
          </h2>
          <p className="text-sm sm:text-base text-gray-500 mt-1">
            Manage room details, pricing, and amenities.
          </p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setIsFormOpen(true)
          }}
          className="w-full sm:w-auto justify-center bg-[#7A633F] text-white px-5 py-2.5 rounded shadow-sm hover:bg-[#685333] transition-colors font-medium flex items-center gap-2"
        >
          <span>+</span> New Room Entry
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider bg-gray-50/50">
                <th className="p-4 sm:p-5 font-medium whitespace-nowrap">Room Name</th>
                <th className="p-4 sm:p-5 font-medium whitespace-nowrap">Room Type</th>
                <th className="p-4 sm:p-5 font-medium whitespace-nowrap">Price</th>
                <th className="p-4 sm:p-5 font-medium">Amenities</th>
                <th className="p-4 sm:p-5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(4)].map((_, index) => (
                  <tr
                    key={`skeleton-${index}`}
                    className="border-b border-gray-100 animate-pulse"
                  >
                    <td className="p-4 sm:p-5"><div className="h-4 bg-gray-200 rounded w-3/4"></div></td>
                    <td className="p-4 sm:p-5"><div className="h-4 bg-gray-200 rounded w-1/2"></div></td>
                    <td className="p-4 sm:p-5"><div className="h-4 bg-gray-200 rounded w-1/4"></div></td>
                    <td className="p-4 sm:p-5"><div className="h-4 bg-gray-200 rounded w-full"></div></td>
                    <td className="p-4 sm:p-5 flex justify-end gap-2">
                      <div className="h-8 bg-gray-200 rounded w-16"></div>
                      <div className="h-8 bg-gray-200 rounded w-16"></div>
                    </td>
                  </tr>
                ))
              ) : rooms.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="p-8 sm:p-12 text-center text-gray-500"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-4xl mb-3">🛏️</span>
                      <p className="text-lg font-medium text-gray-900">No rooms found</p>
                      <p className="text-sm mt-1">Add a new room entry to get started.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                rooms.map((room) => (
                  <tr
                    key={room.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-4 sm:p-5 font-medium text-gray-900">
                      {room.name}
                    </td>
                    <td className="p-4 sm:p-5 text-gray-600">{room.type}</td>
                    <td className="p-4 sm:p-5 text-gray-600">
                      ₹{Number(room.price).toLocaleString()}
                    </td>
                    <td className="p-4 sm:p-5 text-gray-500 text-sm truncate max-w-[200px]">
                      {Array.isArray(room.amenities)
                        ? room.amenities.join(', ')
                        : 'None'}
                    </td>
                    <td className="p-4 sm:p-5">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-md shadow-sm transition-colors text-xs font-medium hover:bg-blue-100"
                          onClick={() => fetchUnits(room.id)}
                        >
                          Manage Units
                        </button>
                        
                        <div className="flex items-center gap-1 border-l border-gray-200 pl-3">
                          <button
                            onClick={() => {
                              setFormData({
                                id: room.id,
                                name: room.name,
                                type: room.type,
                                price: room.price,
                                image: room.image || '',
                                description: room.description || '',
                                amenities: Array.isArray(room.amenities)
                                  ? room.amenities.join(', ')
                                  : '',
                              })
                              setIsFormOpen(true)
                            }}
                            className="p-1.5 text-gray-400 hover:text-[#8B6E4E] hover:bg-[#8B6E4E]/10 rounded-md transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={16} strokeWidth={2} />
                          </button>

                          <button
                            onClick={() => handleDelete(room.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} strokeWidth={2} />
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-gray-200 flex justify-between items-center text-sm text-gray-500 bg-gray-50/50">
          <span>
            Showing all {rooms.length} room{rooms.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* ADD/EDIT ROOM MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white p-5 sm:p-8 rounded-t-2xl sm:rounded-xl w-full max-w-2xl shadow-2xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:fade-in duration-200">
            <h2 className="text-xl sm:text-2xl font-serif font-bold mb-5 sm:mb-6 text-gray-900">
              {formData.id ? 'Edit Room' : 'New Room Entry'}
            </h2>

            <div className="space-y-4 sm:space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Room Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full border border-gray-300 p-2.5 rounded-md focus:ring-2 focus:ring-[#8B6E4E] focus:border-[#8B6E4E] outline-none transition-all"
                  placeholder="e.g. The Curator's Loft"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
                <div className="w-full sm:w-1/2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Room Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    className="w-full border border-gray-300 p-2.5 rounded-md focus:ring-2 focus:ring-[#8B6E4E] outline-none bg-white"
                  >
                    <option value="Single">Single</option>
                    <option value="Double">Double</option>
                    <option value="Suite">Suite</option>
                    <option value="Penthouse">Penthouse</option>
                  </select>
                </div>
                <div className="w-full sm:w-1/2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Price / Night (₹) *
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    className="w-full border border-gray-300 p-2.5 rounded-md focus:ring-2 focus:ring-[#8B6E4E] outline-none"
                    placeholder="0.00"
                    min={0}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Room Image
                </label>
                <div className="mt-1 flex justify-center rounded-lg border border-dashed border-gray-300 px-4 sm:px-6 py-8 sm:py-10 relative hover:bg-gray-50 transition-colors group">
                  {previewUrl ? (
                    <div className="relative w-full h-40 sm:h-48 rounded-md overflow-hidden">
                      <Image
                        src={previewUrl}
                        alt="Room preview"
                        fill
                        className="object-cover"
                        unoptimized={true}
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex flex-col sm:flex-row items-center justify-center gap-3 active:opacity-100">
                        <label className="cursor-pointer bg-white text-gray-900 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors shadow-sm">
                          Change
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              setFile(e.target.files?.[0] ?? null)
                            }
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setFile(null)
                            setFormData({ ...formData, image: '' })
                          }}
                          className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors shadow-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <UploadCloud
                        className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-300"
                        strokeWidth={1.5}
                      />
                      <div className="mt-4 flex flex-col sm:flex-row text-sm leading-6 text-gray-600 justify-center items-center">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer rounded-md bg-transparent font-semibold text-[#8B6E4E] focus-within:outline-none hover:text-[#685333]"
                        >
                          <span>Upload a file</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={(e) =>
                              setFile(e.target.files?.[0] ?? null)
                            }
                          />
                        </label>
                        <p className="pl-1 hidden sm:block">or drag and drop</p>
                      </div>
                      <p className="text-xs leading-5 text-gray-500 mt-1">
                        PNG, JPG up to 5MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full border border-gray-300 p-2.5 rounded-md focus:ring-2 focus:ring-[#8B6E4E] outline-none min-h-[80px] sm:min-h-[100px]"
                  placeholder="Enter room details..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Amenities (Comma separated)
                </label>
                <input
                  type="text"
                  value={formData.amenities}
                  onChange={(e) =>
                    setFormData({ ...formData, amenities: e.target.value })
                  }
                  className="w-full border border-gray-300 p-2.5 rounded-md focus:ring-2 focus:ring-[#8B6E4E] outline-none"
                  placeholder="Wi-Fi, Mini Bar, Ocean View"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-gray-100 mt-6 pb-2 sm:pb-0">
                <button
                  onClick={() => setIsFormOpen(false)}
                  disabled={isSaving}
                  className="w-full sm:w-auto px-5 py-3 sm:py-2.5 text-gray-600 font-medium rounded-md bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full sm:w-auto bg-[#7A633F] text-white px-6 py-3 sm:py-2.5 rounded-md hover:bg-[#685333] transition-colors font-medium flex items-center justify-center disabled:opacity-70"
                >
                  {isSaving ? 'Saving...' : 'Save Room Entry'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* MANAGE UNITS MODAL */}
      {isUnitModalOpen && activeRoomId && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-xl w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-serif font-bold text-gray-900">Manage Physical Rooms</h2>
              <button onClick={() => { setIsUnitModalOpen(false); setActiveRoomId(null); }} className="text-gray-500 hover:text-gray-800 text-xl font-bold">✕</button>
            </div>

            {/* Add New Unit Form */}
            <div className="flex gap-2 mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
              <input 
                type="text" 
                placeholder="Room No. (e.g. 101)" 
                value={newUnitNumber}
                onChange={(e) => setNewUnitNumber(e.target.value)}
                className="flex-1 p-2 border border-gray-300 rounded outline-none focus:ring-2 focus:ring-[#8B6E4E]"
              />
              <button 
                className="bg-[#7A633F] text-white px-5 py-2 rounded hover:bg-[#685333] transition-colors font-medium"
                onClick={handleRoomUnitSave}
              >
                Add
              </button>
            </div>

            {/* List of Existing Units */}
            <div className="max-h-64 overflow-y-auto">
              {roomUnits.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No physical units added yet.</p>
              ) : (
                <ul className="space-y-2">
                  {roomUnits.map((unit) => (
                    <li key={unit.id} className="flex justify-between items-center p-3 border border-gray-100 rounded-lg bg-white">
                      <span className="font-bold text-gray-800">Room {unit.roomNumber}</span>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium tracking-wide ${
                        unit.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' :
                        unit.status === 'BOOKED' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {unit.status}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}