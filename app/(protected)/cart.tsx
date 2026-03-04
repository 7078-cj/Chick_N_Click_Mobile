import CartList from '@/components/CartList'
import { useCart } from '@/hooks/useCart'
import { router } from 'expo-router'
import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

export default function cart() {
  const CartContext = useCart()
  return (
    <View className='flex-col justify-between h-full'>
      <CartList/>
      <TouchableOpacity
        disabled={CartContext.cart.length < 1}
        onPress={() => router.push('/(protected)/checkout')}
        className='py-4 text-base text-white bg-orange-400 rounded-lg w- w-px-6 hover:bg-orange-600'
      >
        <Text className='text-center'>{CartContext.placingOrder ? "Placing Order..." : "Place Order"}</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({})