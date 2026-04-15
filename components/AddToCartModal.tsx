import { useAddOn } from "@/hooks/useAddOn";
import React from "react";
import { Modal, TouchableOpacity, View } from "react-native";


const AddToCartModal = ({ food, opened, setOpened }:any) => {
  const addOnCtx = useAddOn();
  const drinks = addOnCtx.drinks ? addOnCtx.drinks : null
  const sides = addOnCtx.sides ? addOnCtx.sides : null

  const handleAddToCart = () => {
    
  }
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={opened}
      onRequestClose={() => setOpened(false)}
    >
    <View className="absolute right-0 z-50 top-[1%] p-4">
      <TouchableOpacity
          onPress={() => setOpened(false)}
          activeOpacity={0.7}
          className="items-center justify-center bg-white rounded-full shadow w-9 h-9"
        >
          
          <View style={{ width: 14, height: 14, position: "relative" }}>
            <View
              style={{
                position: "absolute",
                width: 14,
                height: 1.5,
                backgroundColor: "#6b7280",
                borderRadius: 2,
                top: 6,
                right: 1,
                transform: [{ rotate: "45deg" }],
              }}
            />
            <View
              style={{
                position: "absolute",
                width: 14,
                height: 1.5,
                backgroundColor: "#6b7280",
                borderRadius: 2,
                top: 6,
                left: 0,
                transform: [{ rotate: "-45deg" }],
              }}
            />
          </View>
    </TouchableOpacity>
    </View>
    <View className="items-center justify-center flex-1 p-2 bg-slate-400/[0.40] rounded-t-lg">

      
    </View>
      
    </Modal>
  );
};

export default AddToCartModal;
