import { AddOnContext } from "@/contexts/AddOnContext";
import { useContext } from "react";


export const useAddOn = () => {
  const context = useContext(AddOnContext);

  if (!context) {
    throw new Error("useCart must be used inside AddOnContext");
  }

  return context;
};
