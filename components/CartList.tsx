import { CART_LIST_SCROLL_INSET } from '@/constants/theme';
import { useCart } from '@/hooks/useCart';
import React, { useContext, useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
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

    const removeSelected = async () => {
        for (const foodId of selectedItems) {
        CartContext.handleRemove(foodId);
        }
        setSelectedItems([]);
    };

  useEffect(()=>{
    CartContext.fetchCart()
  },[])

  return (
    <View className="flex-1">
      {CartContext.cart.length > 0 ? (
        <>
          {selectedItems.length > 0 && (
            <TouchableOpacity
              onPress={removeSelected}
              className="self-end px-4 py-2 mb-2 bg-red-500 rounded-full"
            >
              <Text className="text-xs font-semibold text-white">
                Remove Selected ({selectedItems.length})
              </Text>
            </TouchableOpacity>
          )}
          <ScrollView
            contentContainerStyle={{ paddingBottom: CART_LIST_SCROLL_INSET }}
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
        </>
      ) : (
        <View className="items-center justify-center flex-1 px-6">
          <Text className="text-lg font-semibold text-gray-700">Cart is empty</Text>
          <Text className="mt-1 text-sm text-center text-gray-500">
            Add food from the menu to start your order.
          </Text>
        </View>
      )}
    </View>
  );
}