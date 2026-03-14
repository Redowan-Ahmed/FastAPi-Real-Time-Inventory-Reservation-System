export interface User {
  id: string;
  email: string;
  is_admin: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  total_inventory: number;
  available_inventory: number;
  created_at: string;
  image?: string;
  description?: string;
}

export interface Reservation {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  status: 'reserved' | 'completed' | 'expired';
  expires_at: string;
  created_at: string;
  product_name?: string;
  product_price?: number;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface ReservationJobResponse {
  job_id: string;
  status: string;
  message: string;
}

export interface CheckoutResponse {
  message: string;
  reservation: Reservation;
}