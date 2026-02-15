import { ReactNode } from "react";

export type FoodEventMsg = { type: "food"; event: "created" | "updated" | "deleted"; food: Food; }

export type FoodCategory = {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
  pivot?: {
    food_id: number;
    category_id: number;
  };
};

export type Food = {
  id: number;
  food_name: string;
  description?: string;
  price?: number;
  size?: string | null;
  thumbnail?: string;
  category_id?: number;
  categories?: FoodCategory[];
  created_at?: string;
  updated_at?: string;
  [key: string]: any; // for any other dynamic fields
};

export type Category = {
  id: number;
  name: string;
  value: string;
  label: string;
};


export type FoodContextType = {
  foods: Food[];
  setFoods: React.Dispatch<React.SetStateAction<Food[]>>;
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  selectedCategory: string | null;
  setSelectedCategory: React.Dispatch<React.SetStateAction<string | null>>;
  filteredFoods: Food[];
  resetFilters: () => void;
  isLoading: boolean;
}

export type FoodProviderProps = {
  children: ReactNode;
}