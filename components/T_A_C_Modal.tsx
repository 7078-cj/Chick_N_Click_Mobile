import React from 'react'
import { Modal, Text, TouchableOpacity, View } from 'react-native'

export default function T_A_C_Modal({opened, setOpened}:any) {
    return (
        <Modal visible={opened} >
            <View>
                <View className="flex-row justify-between items-center px-6 pt-4 pb-2">
                    <TouchableOpacity
                        onPress={() => setOpened(false)}
                        className="items-center justify-center bg-gray-100 rounded-full w-9 h-9"
                    >
                        <Text className="font-bold text-lg">✕</Text>
                    </TouchableOpacity>
                </View>
            </View>

            
            
        </Modal>
    )
}

