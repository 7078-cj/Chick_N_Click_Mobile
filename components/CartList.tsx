import { CART_LIST_SCROLL_INSET } from '@/constants/theme';
import { useCart } from '@/hooks/useCart';
import { getAddonParentFoodId } from '@/utils/cartLineage';
import React, { useState } from 'react';
import {
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  UIManager,
  View
} from 'react-native';
import CartCard from './CartCard';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

type CartItemType = {
  food_id: number;
  is_addon?: boolean;
  [key: string]: any;
};

type GroupedItem = {
  parent: CartItemType;
  addons: CartItemType[];
};

export default function CartList() {
  const CartContext = useCart();
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<number>>(new Set());

  const toggleSelect = (foodId: number) => {
    setSelectedItems((prev) =>
      prev.includes(foodId) ? prev.filter((id) => id !== foodId) : [...prev, foodId]
    );
  };

  const removeSelected = async () => {
    for (const foodId of selectedItems) {
      CartContext.handleRemove(foodId);
    }
    setSelectedItems([]);
  };

  const toggleCollapse = (parentFoodId: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      next.has(parentFoodId) ? next.delete(parentFoodId) : next.add(parentFoodId);
      return next;
    });
  };

  // Group: parents first, then attach addons beneath their parent
  const grouped: GroupedItem[] = [];
  const addonMap = new Map<number, CartItemType[]>();

  for (const item of CartContext.cart as CartItemType[]) {
    if (item.is_addon) {
      const parentId = getAddonParentFoodId(item);
      if (parentId != null) {
        if (!addonMap.has(parentId)) addonMap.set(parentId, []);
        addonMap.get(parentId)!.push(item);
      }
    }
  }

  for (const item of CartContext.cart as CartItemType[]) {
    if (!item.is_addon) {
      grouped.push({ parent: item, addons: addonMap.get(item.food_id) ?? [] });
    }
  }

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
            {grouped.map(({ parent, addons }) => {
              const isCollapsed = collapsedGroups.has(parent.food_id);
              const updatingId = CartContext.updatingMainFoodId;
              const isParentUpdating =
                updatingId != null && parent.food_id === updatingId;

              return (
                <View key={parent.food_id}>
                  {/* Parent row */}
                  <Pressable onPress={() => toggleSelect(parent.food_id)}>
                    <CartCard
                      item={parent}
                      onUpdate={CartContext.handleUpdate}
                      onToggleSelect={toggleSelect}
                      selectedItems={selectedItems}
                      isUpdating={isParentUpdating}
                      selected={selectedItems.includes(parent.food_id)}
                    />
                  </Pressable>

                  {/* Addon dropdown toggle */}
                  {addons.length > 0 && (
                    <Pressable
                      onPress={() => toggleCollapse(parent.food_id)}
                      className="flex-row items-center gap-1 ml-4 mb-1 self-start"
                    >
                      {/* Chevron */}
                      <View
                        style={{
                          transform: [{ rotate: isCollapsed ? '0deg' : '90deg' }],
                        }}
                      >
                        <Text className="text-orange-500 text-xs font-bold">›</Text>
                      </View>
                      <Text className="text-xs text-gray-500 font-medium">
                        {addons.length} add-on{addons.length > 1 ? 's' : ''}
                        {isCollapsed ? '' : ''}
                      </Text>
                    </Pressable>
                  )}

                  {/* Addon rows (collapsible) */}
                  {!isCollapsed && addons.length > 0 && (
                    <View className="ml-6 pl-3 border-l-2 border-orange-200">
                      {addons.map((addon) => {
                        const isAddonUpdating =
                          updatingId != null && getAddonParentFoodId(addon) === updatingId;
                        return (
                          <CartCard
                            key={addon.food_id}
                            item={addon}
                            onUpdate={CartContext.handleUpdate}
                            selectedItems={selectedItems}
                            isUpdating={isAddonUpdating}
                          />
                        );
                      })}
                    </View>
                  )}
                </View>
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