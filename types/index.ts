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
  checkInDate: string | Date;
  checkOutDate: string | Date;
  totalPrice: number;
  status: 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED';
  roomUnitId: string;
  roomUnit: FrontDeskRoomUnit; 
  specialReq?: string | null; 
}

export interface FrontDeskRoomUnit {
  id: string;
  roomNumber: string;
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE'; 
  room: { name: string, price: number };
  bookings?: {
    id: string;
    guestName: string;
    status: 'CONFIRMED' | 'CHECKED_IN'; 
    checkInDate: string;                 
    checkOutDate: string;                 
  }[];
}

export interface DashboardData {
  arrivals: Booking[];
  noShows: Booking[];
  departures: Booking[];
  liveRooms: FrontDeskRoomUnit[];
}