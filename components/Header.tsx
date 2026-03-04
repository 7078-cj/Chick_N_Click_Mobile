import React from 'react'
import { Text, View } from 'react-native'

export default function Header() {
  return (
    <View className='flex flex-row items-center justify-between p-4'>
      <Text>Header</Text>
      <Text>Notification</Text>
    </View>
  )
}
