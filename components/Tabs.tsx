import React from 'react'
import { View } from 'react-native'
import TabButtons, { TabButtonsProps } from './TabButtons'

export default function Tabs() {
    const paths: TabButtonsProps[] = [
        {label: 'Menu', destination: '/home'},
        {label: 'Cart', destination: '/(protected)/cart'},
        {label: 'Profile', destination: '/(protected)/profile'},
        {label: 'Orders', destination: '/(protected)/orders'}
    ]
  return (
    <View className='h-[10%] flex flex-row justify-evenly items-center px-4'>
      {paths.map((path, index) => (
        <TabButtons key={index} label={path.label} destination={path.destination}/>
      ))}
    </View>
  )
}

