import { ReactNode } from "react";
import { Food } from "./Food";

export type OrderEventPayload = {
  type: "order";
  event: "update";
  order: Order;
};


export type OrderItem = {
  id: number;
  order_id: number;
  food_id: number;
  quantity: number;
  price: number;
  created_at: string;
  updated_at: string;
  food: Food;
};

export type OrderUser = {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string | null;
  role: string;
  phone?: string | null;
  first_name: string;
  last_name: string;
  longitude: string;
  latitude: string;
  note?: string | null;
  location?: string | null;
  phone_number?: string | null;
  created_at: string;
  updated_at: string;
};

export type Order = {
  id: number;
  user_id: number;
  total_price: number;
  status: string;
  estimated_time_of_completion: string;
  payment_status?: string | null;
  type: string;
  longitude: string;
  latitude: string;
  location: string;
  paid_at?: string | null;
  proof_of_payment?: string | null;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  user: OrderUser;
};

export type OrderContextType = {
  orders: Order[];
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  fetchOrders: () => Promise<void>;
  cancelOrder: (orderId: number) => Promise<void>;
};

export type OrderProviderProps = {
  children: ReactNode;
};