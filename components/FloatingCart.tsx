import { COLORS } from "@/constants/theme";
import { useCart } from "@/hooks/useCart";
import React from "react";
import { Text, TouchableOpacity } from "react-native";

const FloatingCart = ({ onPress }: any) => {
    const CartContext = useCart();
    const count = CartContext?.cart?.length || 0;

    return (
        <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        style={[
            {
            position: "absolute",
            bottom: 25,
            right: 20,
            backgroundColor: COLORS.secondary,
            borderRadius: 40,
            paddingVertical: 14,
            paddingHorizontal: 18,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            minWidth: 70,
            justifyContent: "center",
            },
            {
            shadowColor: "#000",
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 8,
            },
        ]}
        >
        {/* ICON */}
        <Text style={{ fontSize: 18 }}>🛒</Text>

        {/* COUNT */}
        <Text
            style={{
            color: "#fff",
            fontWeight: "bold",
            fontSize: 16,
            }}
        >
            {count}
        </Text>
        </TouchableOpacity>
    );
};

export default FloatingCart;