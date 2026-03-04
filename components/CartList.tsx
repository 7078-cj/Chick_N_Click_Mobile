import { useCart } from '@/hooks/useCart';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import CartCard from './CartCard';

type CartItemType = {
  food_id: number;
  [key: string]: any; // other properties
};

export default function CartList() {
  const CartContext = useCart();
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const toggleSelect = (foodId: number) => {
    setSelectedItems((prev) =>
      prev.includes(foodId)
        ? prev.filter((id) => id !== foodId)
        : [...prev, foodId]
    );
  };

  useEffect(()=>{
    CartContext.fetchCart()
  },[])

  return (
    <View className="flex-1">
      <Text className="px-6 mt-6 text-lg font-bold">CartList</Text>

      {CartContext.cart.length > 0 ? (
        <ScrollView
          className="flex-1 px-6 mt-4"
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {CartContext.cart.map((item: CartItemType) => {
            const isSelected = selectedItems.includes(item.food_id);

            return (
              <Pressable
                key={item.food_id}
                className={`relative ${
                  isSelected
                    ? 'border-2 border-orange-500 rounded-xl'
                    : ''
                }`}
                onPress={() => toggleSelect(item.food_id)}
              >
                <CartCard
                  item={item}
                  onToggleSelect={toggleSelect}
                  selectedItems={selectedItems}
                />
              </Pressable>
            );
          })}
        </ScrollView>
      ) : (
        <View className="items-center justify-center flex-1">
          <Text className="text-gray-500">No items in cart</Text>
        </View>
      )}
    </View>
  );
}