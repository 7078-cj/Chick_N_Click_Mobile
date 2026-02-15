import { Category, Food, FoodContextType, FoodEventMsg, FoodProviderProps } from "@/types/Food";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import AuthContext from "./AuthContext";


export const FoodContext = createContext<FoodContextType | undefined>(undefined);


export const FoodProvider: React.FC<FoodProviderProps> = ({ children }) => {
  const [foods, setFoods] = useState<Food[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { token, user } = useContext(AuthContext) as {
    token: string | null;
    user: { id: number } | null;
  };

  const preUrl = process.env.EXPO_PUBLIC_API_URL as string;
  const wsUrl = process.env.EXPO_PUBLIC_WS_URL as string;

  const wsRef = useRef<WebSocket | null>(null);
  const hasLoadedRef = useRef(false);

 
  useEffect(() => {
    
    setIsLoading(true);

    (async () => {
      try {
       
        const catRes = await fetch(`${preUrl}/api/category`, {
        });
        const catData: { id: number; name: string }[] = await catRes.json();

        setCategories(
          catData.map((cat) => ({
            id: cat.id,
            name: cat.name,
            value: cat.id.toString(),
            label: cat.name,
          }))
        );

        
        const foodRes = await fetch(`${preUrl}/api/foods`, {
        });
        const foodData: Food[] = await foodRes.json();
        setFoods(foodData);
        setIsLoading(false)
      } catch (err) {
        console.error("Failed to load initial data", err);
      }
    })();
  }, [preUrl]);

 
  useEffect(() => {

    const ws = new WebSocket(`${wsUrl}/ws/food`);
    wsRef.current = ws;

    ws.onmessage = (event: MessageEvent) => {
      try {
        const msg: FoodEventMsg = JSON.parse(event.data);
        if (msg.type === "food") handleFoodEvent(msg);
      } catch (err) {
        console.error("WebSocket message error", err);
      }
    };

    ws.onclose = () => console.log("❌ Food WebSocket closed");

    return () => ws.close();
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


  const filteredFoods = foods.filter((food) => {
    const matchesSearch =
      searchQuery === "" ||
      food.food_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      food.description?.toLowerCase().includes(searchQuery.toLowerCase());

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
      }}
    >
      {children}
    </FoodContext.Provider>
  );
};
