import OrdersList from '@/components/OrderList'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

export default function orders() {
  return (
    <View className='h-full'>
      <Text>orders</Text>
      <OrdersList/>
    </View>
  )
}

const styles = StyleSheet.create({})