import { postCartAdd } from "@/api/cart";
import { COLORS, SHADOW } from "@/constants/theme"; // Using your theme
import AuthContext from "@/contexts/AuthContext";
import { useAddOn } from "@/hooks/useAddOn";
import { useCart } from "@/hooks/useCart";
import { showToast } from "@/utils/toast";
import React, { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const AddToCartModal = ({ food, opened, setOpened }: any) => {
  const authCtx = useContext(AuthContext);
  const cartCtx = useCart()
  const { drinks = [], sides = [], handleRefreshAddOns } = useAddOn();

  const [quantity, setQuantity] = useState(1);
  const [orderSides, setOrderSides] = useState<any[]>([]);
  const [orderDrinks, setOrderDrinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const isSideOrDrink = food.categories?.some((cat: any) =>
    ["Sides", "Drinks"].includes(cat.name)
  );

  const getDrinkTotal = () => orderDrinks.reduce((sum, d) => sum + d.count, 0);
  const getSideTotal = () => orderSides.reduce((sum, s) => sum + s.count, 0);

  const clearAddons = () => {
    setOrderSides([]);
    setOrderDrinks([]);
  };

  const adjustToQuantity = (newQty: number) => {
    const limit = newQty;
    const processItems = (items: any[]) => {
      const flat = items.flatMap((i) =>
        Array.from({ length: i.count }).map(() => ({ ...i }))
      ).slice(0, limit);
      
      const grouped: any[] = [];
      flat.forEach((i) => {
        const found = grouped.find((g) => g.id === i.id);
        if (found) found.count += 1;
        else grouped.push({ ...i, count: 1 });
      });
      return grouped;
    };

    setOrderDrinks(processItems(orderDrinks));
    setOrderSides(processItems(orderSides));
  };

  const changeQty = (val: number) => {
    const newQty = Math.max(1, val);
    setQuantity(newQty);
    adjustToQuantity(newQty);
  };

  const toggleItem = (item: any, type: 'side' | 'drink') => {
    const isDrink = type === 'drink';
    const currentList = isDrink ? orderDrinks : orderSides;
    const setter = isDrink ? setOrderDrinks : setOrderSides;
    const currentTotal = isDrink ? getDrinkTotal() : getSideTotal();
    
    const existing = currentList.find((i) => i.id === item.id);

    if (currentTotal >= quantity && !existing) {
        return showToast(
        "Selection limit",
        `You can only select ${quantity} ${type}(s) for this quantity.`,
        "info",
      );
    }

    if (existing) {
      if (currentTotal >= quantity)
        return showToast("Maximum reached", `You can pick at most ${quantity}.`, "info");
      setter(prev => prev.map(i => i.id === item.id ? { ...i, count: i.count + 1 } : i));
    } else {
      setter(prev => [...prev, { id: item.id, name: item.food_name, price: item.price, count: 1 }]);
    }
  };

  const totalPrice =
    food.price * quantity +
    orderSides.reduce((s, i) => s + i.price * i.count, 0) +
    orderDrinks.reduce((s, i) => s + i.price * i.count, 0);
  const addonsTotal = getSideTotal() + getDrinkTotal();

  const handleAddToCart = async () => {
    if (!authCtx?.token)
      return showToast("Sign in required", "Please log in to add items to your cart.", "info");
    try {
      setLoading(true);
      const res = await postCartAdd(authCtx.token as string, food.id, {
        quantity,
        sides: orderSides.flatMap((s) =>
          Array(s.count).fill({ id: s.id, size: "medium" }),
        ),
        drinks: orderDrinks.flatMap((d) =>
          Array(d.count).fill({ id: d.id, size: "medium" }),
        ),
      });

      if (res.ok) {
        cartCtx.fetchCart();
        setOpened(false);
        setOrderDrinks([]);
        setOrderSides([]);
        setQuantity(1);
        showToast(
          "Added to cart",
          `${food.food_name} × ${quantity}`,
          "success",
        );
      } else {
        showToast("Could not add to cart", "Please try again.", "error");
      }
    } catch {
      showToast("Could not add to cart", "Please check your connection and try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!opened) {
      setOrderDrinks([]);
      setOrderSides([]);
      setQuantity(1);
    }
    handleRefreshAddOns();
  }, [opened]);

  return (
    <Modal visible={opened} animationType="slide" transparent>
      <View className="flex-1 justify-end mt-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <View className="bg-white rounded-t-[40px]" style={{ maxHeight: SCREEN_HEIGHT * 0.9 }}>
          
          {/* Header Bar */}
          <View className="flex-row justify-between items-center px-6 pt-4 pb-2">
            <View>
                <Text style={{ color: COLORS.text }} className="text-2xl font-bold">{food.food_name}</Text>
                <Text style={{ color: COLORS.subtext }}>₱{food.price} per unit</Text>
            </View>
            <TouchableOpacity
                onPress={() => setOpened(false)}
                className="items-center justify-center bg-gray-100 rounded-full w-9 h-9"
            >
                <Text className="font-bold text-lg">✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{ width: "100%", aspectRatio: 1.35, backgroundColor: "#FFF7ED" }}>
              <Image
                source={{ uri: food.thumbnail }}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>

            <View className="p-5">
              {/* QUANTITY SELECTOR */}
              <View className="p-4 mb-4 bg-gray-50 rounded-2xl">
                <View className="flex-row items-center justify-between mb-2">
                <Text className="font-semibold text-lg" style={{ color: COLORS.text }}>Quantity</Text>
                <View className="flex-row items-center bg-white rounded-xl shadow-sm border border-gray-100">
                  <Pressable
                    onPress={() => changeQty(quantity - 1)}
                    className="items-center justify-center w-12 h-12"
                  >
                    <Text className="text-xl font-bold" style={{ color: COLORS.primary }}>-</Text>
                  </Pressable>
                  <Text className="px-4 font-bold text-lg">{quantity}</Text>
                  <Pressable
                    onPress={() => changeQty(quantity + 1)}
                    className="items-center justify-center w-12 h-12"
                  >
                    <Text className="text-xl font-bold" style={{ color: COLORS.primary }}>+</Text>
                  </Pressable>
                </View>
              </View>
                <Text className="text-xs text-gray-500">
                  Add-ons per section can be selected up to your meal quantity.
                </Text>
              </View>

              {!isSideOrDrink && (
                <View className="flex-row gap-2 mb-5">
                  <View className="flex-1 px-3 py-2 rounded-xl bg-orange-50">
                    <Text className="text-[11px] text-gray-500">Sides</Text>
                    <Text className="font-bold text-brand">{getSideTotal()} / {quantity}</Text>
                  </View>
                  <View className="flex-1 px-3 py-2 rounded-xl bg-orange-50">
                    <Text className="text-[11px] text-gray-500">Drinks</Text>
                    <Text className="font-bold text-brand">{getDrinkTotal()} / {quantity}</Text>
                  </View>
                </View>
              )}

              {!isSideOrDrink && (
                <>
                  {/* SIDES SECTION */}
                  <SectionHeader title="Select Sides" current={getSideTotal()} max={quantity} onClear={() => setOrderSides([])} />
                  <View className="flex-row flex-wrap justify-between mb-6">
                    {sides.map((s: any) => (
                      <AddOnCard 
                        key={s.id} 
                        item={s} 
                        count={orderSides.find(i => i.id === s.id)?.count || 0} 
                        onPress={() => toggleItem(s, 'side')}
                      />
                    ))}
                  </View>

                  {/* DRINKS SECTION */}
                  <SectionHeader title="Select Drinks" current={getDrinkTotal()} max={quantity} onClear={() => setOrderDrinks([])} />
                  <View className="flex-row flex-wrap justify-between">
                    {drinks.map((d: any) => (
                      <AddOnCard 
                        key={d.id} 
                        item={d} 
                        count={orderDrinks.find(i => i.id === d.id)?.count || 0} 
                        onPress={() => toggleItem(d, 'drink')}
                      />
                    ))}
                  </View>
                </>
              )}
              <View className="h-4" />
            </View>
          </ScrollView>

          {/* FOOTER */}
          <View className="p-5 border-t border-gray-100 bg-white">
            <View className="flex-row justify-between mb-1">
                <Text className="text-gray-500 font-medium">Subtotal</Text>
                <Text className="font-bold text-base" style={{ color: COLORS.text }}>₱{totalPrice}</Text>
            </View>
            <View className="flex-row justify-between mb-4">
                <Text className="text-xs text-gray-400">Qty {quantity}{addonsTotal > 0 ? ` • ${addonsTotal} add-ons` : ""}</Text>
                <Text className="text-xs text-gray-400">Ready to add</Text>
            </View>
            <TouchableOpacity
              onPress={handleAddToCart}
              disabled={loading}
              activeOpacity={0.9}
              style={{ backgroundColor: COLORS.primary, ...SHADOW }}
              className="py-4 rounded-2xl flex-row justify-center items-center border border-orange-600"
            >
              {loading ? (
                <View className="flex-row items-center gap-2">
                  <ActivityIndicator color="white" />
                  <Text className="text-white text-center font-bold text-base">
                    Adding to Cart...
                  </Text>
                </View>
              ) : (
                <Text className="text-white text-center font-bold text-lg">
                  Add to Cart • ₱{totalPrice}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// --- Sub-components for cleaner UI ---

const SectionHeader = ({ title, current, max, onClear }: any) => (
  <View className="flex-row justify-between items-end mb-4 px-1">
    <View>
        <Text className="font-bold text-lg" style={{ color: COLORS.text }}>{title}</Text>
        <Text className={`text-xs ${current === max ? 'text-green-600' : 'text-gray-400'}`}>
            {current} of {max} selected
        </Text>
    </View>
    <TouchableOpacity onPress={onClear}>
      <Text style={{ color: COLORS.secondary }} className="text-xs font-bold uppercase">Clear</Text>
    </TouchableOpacity>
  </View>
);

const AddOnCard = ({ item, count, onPress }: any) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    className="w-[48%] mb-3 bg-white border rounded-2xl overflow-hidden"
    style={{ borderColor: count > 0 ? COLORS.primary : '#F3F4F6', borderWidth: count > 0 ? 2 : 1 }}
  >
    <Image source={{ uri: item.thumbnail }} className="h-28 w-full bg-gray-50" />
    <View className="p-2">
      <Text numberOfLines={1} className="font-semibold text-sm" style={{ color: COLORS.text }}>{item.food_name}</Text>
      <Text className="text-xs text-gray-500">+₱{item.price}</Text>
    </View>
    {count > 0 && (
      <View 
        className="absolute top-2 right-2 px-2 py-1 rounded-lg"
        style={{ backgroundColor: COLORS.primary }}
      >
        <Text className="text-white font-bold text-xs">x{count}</Text>
      </View>
    )}
  </TouchableOpacity>
);

export default AddToCartModal;