import { TabContext } from "@/contexts/TabContext";
import { useContext } from "react";


export const useTab = () => {
  const context = useContext(TabContext);

  if (!context) {
    throw new Error("useTab must be used inside TabProvider");
  }

  return context;
};
