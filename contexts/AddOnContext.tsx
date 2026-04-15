import { useFood } from "@/hooks/useFood";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import AuthContext from "./AuthContext";

/* ================= TYPES ================= */

interface Side {
  id: number;
  name: string;
  price: number;
}

interface Drink {
  id: number;
  name: string;
  price: number;
}

interface AddOnContextType {
  sides: Side[];
  drinks: Drink[];
}

/* =============== CONTEXT =============== */

export const AddOnContext = createContext<AddOnContextType | undefined>(
  undefined,
);

/* =============== PROVIDER =============== */

interface AddOnProviderProps {
  children: ReactNode;
}

export const AddOnProvider: React.FC<AddOnProviderProps> = ({ children }) => {
  const foodCtx = useFood();
  const auth = useContext(AuthContext);

  const [sides, setSides] = useState<Side[]>([]);
  const [drinks, setDrinks] = useState<Drink[]>([]);

  const url = process.env.EXPO_PUBLIC_API_URL;

  /* =============== FETCH SIDES =============== */

  const fetchSides = async (): Promise<void> => {
    try {
      const res = await fetch(`${url}/api/sides`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch sides");

      const data: Side[] = await res.json();
      setSides(data ?? []);
    } catch (err) {
      console.error(err);
    }
  };

  /* =============== FETCH DRINKS =============== */

  const fetchDrinks = async (): Promise<void> => {
    try {
      const res = await fetch(`${url}/api/drinks`, {
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to fetch drinks");

      const data: Drink[] = await res.json();
      setDrinks(data ?? []);
    } catch (err) {
      console.error(err);
    }
  };

  /* =============== EFFECT =============== */

  useEffect(() => {
    fetchSides();
    fetchDrinks();
  }, [foodCtx.foods]);

  const context: AddOnContextType = {
    sides,
    drinks,
  };

  return (
    <AddOnContext.Provider value={context}>{children}</AddOnContext.Provider>
  );
};
