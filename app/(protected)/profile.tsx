import AuthContext from '@/contexts/AuthContext'
import React, { useContext } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

export default function profile() {
  const auth = useContext(AuthContext)
  return (
    <View className='flex-1'>
      <Text>profile</Text>
      <TouchableOpacity onPress={() => auth?.logoutUser()}>
        <Text>Logout</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({})