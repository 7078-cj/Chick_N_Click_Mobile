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
  id: string | number;
  reference_id?: string;
  created_at: string;
  total_price?: number | string;
  latitude?: number | string;
  longitude?: number | string;
  location?: string;
  type?: string;
  status?: string;
  payment_status?: string;
  proof_of_payment?: string;
  note?: string;
  estimated_time_of_completion?: number | string;
  items?: OrderItem[];
  user?: OrderUser;
};

export type OrderContextType = {
  orders: Order[];
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  fetchOrders: () => Promise<void>;
  cancelOrder: (orderId: number) => Promise<void>;
  /** Order updates socket connected when logged in; true immediately when logged out */
  orderSocketReady: boolean;
};

export type OrderProviderProps = {
  children: ReactNode;
};
