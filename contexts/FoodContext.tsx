import {
  Category,
  Food,
  FoodContextType,
  FoodEventMsg,
  FoodProviderProps,
} from "@/types/Food";
import { fetchCategories, fetchFoods } from "@/api/menu";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import AuthContext from "./AuthContext";

export const FoodContext = createContext<FoodContextType | undefined>(
  undefined,
);

export const FoodProvider: React.FC<FoodProviderProps> = ({ children }) => {
  const [foods, setFoods] = useState<Food[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [foodSocketReady, setFoodSocketReady] = useState(false);

  const { token, user } = useContext(AuthContext) as {
    token: string | null;
    user: { id: number } | null;
  };

  const wsUrl = process.env.EXPO_PUBLIC_WS_URL as string;

  const wsRef = useRef<WebSocket | null>(null);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    setIsLoading(true);

    (async () => {
      try {
        const catRes = await fetchCategories();
        const catData: { id: number; name: string }[] = await catRes.json();

        setCategories(
          catData.map((cat) => ({
            id: cat.id,
            name: cat.name,
            value: cat.id.toString(),
            label: cat.name,
          })),
        );

        const foodRes = await fetchFoods();
        const foodData: Food[] = await foodRes.json();
        setFoods(foodData);
        setIsLoading(false);
      } catch (err) {
        console.error("Failed to load initial data", err);
        setIsLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const fallback = setTimeout(() => {
      if (!cancelled) setFoodSocketReady(true);
    }, 5000);

    const ws = new WebSocket(`${wsUrl}/ws/food`);
    wsRef.current = ws;

    ws.onopen = () => {
      clearTimeout(fallback);
      if (!cancelled) setFoodSocketReady(true);
    };

    ws.onmessage = (event: MessageEvent) => {
      try {
        const msg: FoodEventMsg = JSON.parse(event.data);
        if (msg.type === "food") handleFoodEvent(msg);
      } catch (err) {
        console.error("WebSocket message error", err);
      }
    };

    ws.onerror = () => {
      clearTimeout(fallback);
      if (!cancelled) setFoodSocketReady(true);
    };

    ws.onclose = () => console.log("❌ Food WebSocket closed");

    return () => {
      cancelled = true;
      clearTimeout(fallback);
      ws.close();
    };
  }, [user, token, wsUrl]);

  const handleFoodEvent = (msg: FoodEventMsg) => {
    const { event, food } = msg;

    setFoods((prevFoods) => {
      switch (event) {
        case "created":
          return [...prevFoods, food];
        case "updated":
          return prevFoods.map((f) => (f.id === food.id ? food : f));
        case "deleted":
          return prevFoods.filter((f) => f.id !== food.id);
        default:
          return prevFoods;
      }
    });
  };

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredFoods = foods.filter((food) => {
    const matchesSearch =
      normalizedQuery === "" ||
      food.food_name?.toLowerCase().includes(normalizedQuery) ||
      food.description?.toLowerCase().includes(normalizedQuery) ||
      food.categories?.some((cat) =>
        cat.name?.toLowerCase().includes(normalizedQuery),
      );

    const matchesCategory =
      !selectedCategory ||
      food.categories?.some((cat) => cat.id.toString() === selectedCategory) ||
      food.category_id?.toString() === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory(null);
  };

  return (
    <FoodContext.Provider
      value={{
        foods,
        setFoods,
        categories,
        setCategories,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        filteredFoods,
        resetFilters,
        isLoading,
        foodSocketReady,
      }}
    >
      {children}
    </FoodContext.Provider>
  );
};
