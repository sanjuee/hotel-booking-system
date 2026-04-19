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