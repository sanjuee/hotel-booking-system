export interface Room {
  id: string;
  name: string;
  type: string;
  price: number;
  image: string;
  description: string,
  capacity: number,
  amenities: string[];
}

export interface Booking {
  id: string;
  guestName: string;
  email: string;
  phone: string;
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
  status: 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED';
  roomUnit: {
    id: string;
    roomNumber: string;
    room: { name: string };
  };
}

export interface FrontDeskRoomUnit {
  id: string;
  roomNumber: string;
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE'; 
  room: { name: string, price: number };
  bookings?: { 
    guestName: string;
    status: 'CONFIRMED' | 'CHECKED_IN'; 
    checkInDate: string;                 
  }[];
}

export interface DashboardData {
  arrivals: Booking[];
  noShows: Booking[];
  liveRooms: FrontDeskRoomUnit[];
}