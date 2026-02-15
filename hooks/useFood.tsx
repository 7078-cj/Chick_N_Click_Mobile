import { FoodContext } from "@/contexts/FoodContext";
import { useContext } from "react";


export const useFood = () => {
  const context = useContext(FoodContext);

  if (!context) {
    throw new Error("useFood must be used inside FoodProvider");
  }

  return context;
};
