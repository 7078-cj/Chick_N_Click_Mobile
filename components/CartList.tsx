import { CART_LIST_SCROLL_INSET } from '@/constants/theme';
import { AppText } from '@/components/typography';
import { useCart } from '@/hooks/useCart';
import { getAddonParentFoodId } from '@/utils/cartLineage';
import React, { useState } from 'react';
import {
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
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

  const cart = CartContext.cart as CartItemType[];

  // Build addon map keyed by parent food_id
  const addonMap = new Map<number, CartItemType[]>();
  for (const item of cart) {
    if (item.is_addon) {
      const parentId = getAddonParentFoodId(item);
      if (parentId != null) {
        if (!addonMap.has(parentId)) addonMap.set(parentId, []);
        addonMap.get(parentId)!.push(item);
      }
    }
  }

  // Collect parent food_ids that actually exist in cart
  const parentFoodIds = new Set(
    cart.filter((i) => !i.is_addon).map((i) => i.food_id)
  );

  const grouped: GroupedItem[] = [];

  // Add main items with their addons
  for (const item of cart) {
    if (!item.is_addon) {
      grouped.push({ parent: item, addons: addonMap.get(item.food_id) ?? [] });
    }
  }

  // ✅ Add orphaned addons (drinks/sides with no matching parent in cart) as standalone
  for (const item of cart) {
    if (item.is_addon) {
      const parentId = getAddonParentFoodId(item);
      if (parentId == null || !parentFoodIds.has(parentId)) {
        grouped.push({ parent: { ...item, is_addon: false }, addons: [] });
      }
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
              <AppText className="text-xs font-semibold text-white">
                Remove Selected ({selectedItems.length})
              </AppText>
            </TouchableOpacity>
          )}

          <ScrollView
            contentContainerStyle={{ paddingBottom: CART_LIST_SCROLL_INSET }}
            showsVerticalScrollIndicator={false}
          >
            {grouped.map(({ parent, addons }) => {
              const isCollapsed = collapsedGroups.has(parent.food_id);
              const updatingId = CartContext.updatingFoodId;
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
                      onRemove={CartContext.handleRemove}
                    />
                  </Pressable>

                  {/* Addon dropdown toggle */}
                  {addons.length > 0 && (
                    <Pressable
                      onPress={() => toggleCollapse(parent.food_id)}
                      className="flex-row items-center gap-1 ml-4 mb-1 self-start"
                    >
                      <View
                        style={{
                          transform: [{ rotate: isCollapsed ? '0deg' : '90deg' }],
                        }}
                      >
                        <AppText className="text-orange-500 text-xs font-bold">›</AppText>
                      </View>
                      <AppText className="text-xs text-gray-500 font-medium">
                        {addons.length} add-on{addons.length > 1 ? 's' : ''}
                      </AppText>
                    </Pressable>
                  )}

                  {/* Addon rows (collapsible) */}
                  {!isCollapsed && addons.length > 0 && (
                    <View className="ml-6 pl-3 border-l-2 border-orange-200">
                      {addons.map((addon) => {
                        const isAddonUpdating =
                          updatingId != null && addon.food_id === updatingId;
                        return (
                          <CartCard
                            key={addon.food_id}
                            item={addon}
                            onUpdate={CartContext.handleUpdate}
                            selectedItems={selectedItems}
                            isUpdating={isAddonUpdating}
                            onRemove={CartContext.handleRemove}
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
          <AppText className="text-lg font-semibold text-gray-700">Cart is empty</AppText>
          <AppText className="mt-1 text-sm text-center text-gray-500">
            Add food from the menu to start your order.
          </AppText>
        </View>
      )}
    </View>
  );
}