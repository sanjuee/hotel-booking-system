// app/admin/page.tsx
"use client"; // This tells Next.js this page has interactive buttons/forms

import { useState } from 'react';
import { dummyRooms } from '@/data/MockRoomData';
import { Room } from '../../types';

export default function AdminDashboard() {
  // 1. Load mock data into React State
  const [rooms, setRooms] = useState<Room[]>(dummyRooms);
  
  // 2. State to control the popup form
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // 3. Temporary state for the room being created/edited
  const [formData, setFormData] = useState<Room>({
    id: "", name: "", type: "Single", price: 0, image: "", description: "", amenities: []
  });

  // Handle saving the room
  const handleSave = () => {
    if (formData.id) {
      // Edit existing room
      setRooms(rooms.map(r => r.id === formData.id ? formData : r));
    } else {
      // Add new room (assign a random ID for the prototype)
      const newRoom = { ...formData, id: Math.random().toString() };
      setRooms([...rooms, newRoom]);
    }
    setIsFormOpen(false); // Close form
  };

  // Open form for editing
  const handleEdit = (room: Room) => {
    setFormData(room);
    setIsFormOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-foreground">Rooms Inventory</h1>
        <button 
          onClick={() => {
            setFormData({ id: "", name: "", type: "Single", price: 0, image: "", description: "", amenities: [] });
            setIsFormOpen(true);
          }}
          className="bg-secondary text-on-secondary px-4 py-2 rounded shadow hover:opacity-90"
        >
          + Add New Room
        </button>
      </div>

      {/* THE DATA TABLE */}
      <div className="bg-background border border-outline rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-700 text-sm uppercase">
              <th className="p-4 border-b">Room Name</th>
              <th className="p-4 border-b">Type</th>
              <th className="p-4 border-b">Price/Night</th>
              <th className="p-4 border-b text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => (
              <tr key={room.id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-medium text-foreground">{room.name}</td>
                <td className="p-4 text-gray-600">{room.type}</td>
                <td className="p-4 text-gray-600">₹{room.price}</td>
                <td className="p-4 text-right">
                  <button 
                    onClick={() => handleEdit(room)}
                    className="text-secondary font-medium hover:underline"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* THE ADD/EDIT MODAL (Pop-up) */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-8 rounded-lg w-full max-w-md shadow-xl">
            <h2 className="text-2xl font-bold mb-6">
              {formData.id ? "Edit Room" : "Add New Room"}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full border border-outline p-2 rounded" 
                  placeholder="e.g. Presidential Suite"
                />
              </div>
              
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select 
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full border border-outline p-2 rounded"
                  >
                    <option>Single</option>
                    <option>Double</option>
                    <option>Suite</option>
                  </select>
                </div>
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                  <input 
                    type="number" 
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                    className="w-full border border-outline p-2 rounded" 
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-8">
                <button 
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-outline text-gray-600 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  className="bg-secondary text-on-secondary px-4 py-2 rounded hover:opacity-90"
                >
                  Save Room
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}