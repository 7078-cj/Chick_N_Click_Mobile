import { COLORS, SHADOW } from "@/constants/theme"; // Using your theme
import AuthContext from "@/contexts/AuthContext";
import { useAddOn } from "@/hooks/useAddOn";
import { useCart } from "@/hooks/useCart";
import React, { useContext, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const url = process.env.EXPO_PUBLIC_API_URL;

const AddToCartModal = ({ food, opened, setOpened }: any) => {
  const authCtx = useContext(AuthContext);
  const cartCtx = useCart()
  const { drinks = [], sides = [] } = useAddOn();

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
        return alert(`You can only select ${quantity} ${type}(s) for this quantity.`);
    }

    if (existing) {
      if (currentTotal >= quantity) return alert(`Max ${quantity} reached`);
      setter(prev => prev.map(i => i.id === item.id ? { ...i, count: i.count + 1 } : i));
    } else {
      setter(prev => [...prev, { id: item.id, name: item.food_name, price: item.price, count: 1 }]);
    }
  };

  const totalPrice =
    food.price * quantity +
    orderSides.reduce((s, i) => s + i.price * i.count, 0) +
    orderDrinks.reduce((s, i) => s + i.price * i.count, 0);

  const handleAddToCart = async () => {
    if (!authCtx?.token) return alert("Please login first");
    try {
      setLoading(true);
      const res = await fetch(`${url}/api/cart/add/${food.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authCtx.token}`,
        },
        body: JSON.stringify({
          quantity,
          sides: orderSides.flatMap(s => Array(s.count).fill({ id: s.id, size: "medium" })),
          drinks: orderDrinks.flatMap(d => Array(d.count).fill({ id: d.id, size: "medium" })),
        }),
      });

      if (res.ok) {
        cartCtx.fetchCart()
        setOpened(false);
        setOrderDrinks([]);
        setOrderSides([]);
        setQuantity(1);

      }
    } catch (err) {
      alert("Failed to add to cart.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={opened} animationType="slide" transparent>
      <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <View className="bg-white rounded-t-[40px]" style={{ maxHeight: SCREEN_HEIGHT * 0.9 }}>
          
          {/* Header Bar */}
          <View className="flex-row justify-between items-center p-6 pb-2">
            <View>
                <Text style={{ color: COLORS.text }} className="text-2xl font-bold">{food.food_name}</Text>
                <Text style={{ color: COLORS.subtext }}>₱{food.price} per unit</Text>
            </View>
            <TouchableOpacity 
                onPress={() => setOpened(false)}
                className="bg-gray-100 p-2 rounded-full"
            >
                <Text className="font-bold text-lg">✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Image source={{ uri: food.thumbnail }} className="w-full h-72" resizeMode="cover" />

            <View className="p-5">
              {/* QUANTITY SELECTOR */}
              <View className="flex-row items-center justify-between bg-gray-50 p-4 rounded-2xl mb-6">
                <Text className="font-semibold text-lg" style={{ color: COLORS.text }}>Quantity</Text>
                <View className="flex-row items-center bg-white rounded-xl shadow-sm border border-gray-100">
                  <TouchableOpacity onPress={() => changeQty(quantity - 1)} className="p-3 px-5">
                    <Text className="text-xl font-bold" style={{ color: COLORS.primary }}>-</Text>
                  </TouchableOpacity>
                  <Text className="px-4 font-bold text-lg">{quantity}</Text>
                  <TouchableOpacity onPress={() => changeQty(quantity + 1)} className="p-3 px-5">
                    <Text className="text-xl font-bold" style={{ color: COLORS.primary }}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

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
              <View className="h-10" />
            </View>
          </ScrollView>

          {/* FOOTER */}
          <View className="p-6 border-t border-gray-100 bg-white">
            <View className="flex-row justify-between mb-4">
                <Text className="text-gray-500 font-medium">Subtotal</Text>
                <Text className="font-bold text-lg" style={{ color: COLORS.text }}>₱{totalPrice}</Text>
            </View>
            <TouchableOpacity
              onPress={handleAddToCart}
              disabled={loading}
              style={{ backgroundColor: COLORS.primary, ...SHADOW }}
              className="py-4 rounded-2xl flex-row justify-center items-center"
            >
              {loading ? (
                <ActivityIndicator color="white" />
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