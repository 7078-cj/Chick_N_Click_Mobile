import { useTab } from '@/hooks/useTab';
import React from 'react';
import { View } from 'react-native';
import TabButtons, { TabButtonsProps } from './TabButtons';

export default function Tabs() {
    type TabButtonWithoutActiveAnsSetActive = Omit<TabButtonsProps, 'active' | 'setActive'>;

    const paths: TabButtonWithoutActiveAnsSetActive[] = [
    { label: 'Menu', destination: '/' },
    { label: 'Cart', destination: '/(protected)/cart' },
    { label: 'Profile', destination: '/(protected)/profile' },
    { label: 'Orders', destination: '/(protected)/orders' }
    ];

  return (
    <View className='h-[10%] flex flex-row justify-evenly items-center px-4'>
      {paths.map((path, index) => (
        <TabButtons key={index} label={path.label} destination={path.destination}/>
      ))}
    </View>
  )
}

