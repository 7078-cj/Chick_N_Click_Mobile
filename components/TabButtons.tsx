import { Href, router } from 'expo-router'
import { Pressable, StyleSheet, Text } from 'react-native'

export type TabButtonsProps = {
    label: string
    destination: Href
    active:string
}

export default function TabButtons({label, destination, active}:TabButtonsProps) {

    const Press = () => {
        router.push(destination)
    }

  return (
    <Pressable onPress={Press} className={`p-4 ${active == label ? 'bg-slate-300': '' }`}>
        <Text>{label}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({})