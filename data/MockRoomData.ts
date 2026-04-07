// src/data/mockRooms.ts
import { Room } from "../types";

export const dummyRooms: Room[] = [
  {
    id: "1",
    name: "Suite Room",
    type: "Suite",
    price: 4500,
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800", // Placeholder image
    description: "A well-furnished, luxurious space designed to bring the best out of your stay. Features a private balcony, premium bedding, and ample living space to relax and unwind.",
    amenities: ["WiFi", "AC", "Balcony"]
  },
  {
    id: "2",
    name: "Standard Deluxe AC",
    type: "Double",
    price: 2500,
    image: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800",
    description: "A comfortable and spacious room equipped with modern air conditioning and elegant decor. Perfect for couples seeking a relaxing getaway with all the essential amenities.",
    amenities: ["WiFi", "AC"]
  },
  {
    id: "3",
    name: "Non-AC Deluxe",
    type: "Double",
    price: 2000,
    image: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800",
    description: "A naturally well-ventilated, budget-friendly option that doesn't compromise on space. Enjoy comfortable bedding and a cozy atmosphere ideal for a restful night's sleep.",
    amenities: ["WiFi","Non-AC"]
  },
  {
    id: "4",
    name: "Single Room AC",
    type: "Single",
    price: 1500,
    image: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800",
    description: "A compact, climate-controlled space tailored specifically for the solo traveler. Offers a comfortable bed, a dedicated workspace, and a quiet environment for rest.",
    amenities: ["WiFi", "AC"]
  },
  {
    id: "5",
    name: "Single Room Non-AC",
    type: "Single",
    price: 1000,
    image: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800",
    description: "Our most economical option for solo adventurers. A cozy, straightforward room providing a comfortable bed, clean surroundings, and essential amenities for a highly practical stay.",
    amenities: ["WiFi", "Non-AC"]
  },
];