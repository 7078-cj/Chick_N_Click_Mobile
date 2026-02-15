import { useTab } from '@/hooks/useTab'
import { Href, router } from 'expo-router'
import { Pressable, StyleSheet, Text } from 'react-native'

export type TabButtonsProps = {
    label: string
    destination: Href
}

export default function TabButtons({label, destination}:TabButtonsProps) {
    const tab = useTab();
    const Press = () => {
        tab.setActive(label)
        router.push(destination)
    }

  return (
    <Pressable onPress={Press} className={`p-4 ${tab.active != label ? '': 'bg-slate-300' }`}>
        <Text>{label}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({})