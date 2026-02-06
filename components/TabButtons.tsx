import { Href, router } from 'expo-router'
import { Pressable, StyleSheet, Text } from 'react-native'

export type TabButtonsProps = {
    label: string
    destination: Href
}

export default function TabButtons({label, destination}:TabButtonsProps) {

    const Press = () => {
        router.push(destination)
    }

  return (
    <Pressable onPress={Press}>
        <Text>{label}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({})