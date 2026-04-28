import { AppText } from '@/components/typography'
import React from 'react'
import {
    Modal,
    Platform,
    StatusBar,
    TouchableOpacity,
    View,
} from 'react-native'
import MapComponent from './MapComponent'

export default function MapModal({
    opened,
    setOpened,
    location,
    handleLocationChange,
    }: any) {
    return (
        <Modal visible={opened} animationType="slide" statusBarTranslucent>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

        <View className="flex-1 bg-white">
            {/* Header */}
                    
            <View
            className="px-5 bg-white border-b border-gray-100"
            style={{ paddingTop: Platform.OS === 'android' ? 48 : 56, paddingBottom: 14 }}
            >
            <View className="flex-row items-center justify-between">
                {/* Close button */}
                <TouchableOpacity
                onPress={() => setOpened(false)}
                activeOpacity={0.7}
                className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
                >
                <AppText className="text-gray-600 text-base leading-none" style={{ marginTop: -1 }}>
                    ✕
                </AppText>
                </TouchableOpacity>

                {/* Title */}
                <View className="items-center justify-center flex flex-col">
                <AppText
                    className="text-base text-gray-900"
                    style={{ fontWeight: '700', letterSpacing: 0.2 }}
                >
                    Choose Location
                </AppText>
                <AppText className="text-xs text-gray-400 mt-0.5" style={{ letterSpacing: 0.1 }}>
                    Tap the map to pin a spot
                </AppText>
                

                </View>

                {/* Confirm button */}
                <TouchableOpacity
                onPress={() => setOpened(false)}
                activeOpacity={0.8}
                className="px-4 h-10 rounded-full bg-amber-900 items-center justify-center"
                >
                <AppText
                    className="text-white text-sm"
                    style={{ fontWeight: '600', letterSpacing: 0.2 }}
                >
                    Confirm
                </AppText>
                </TouchableOpacity>
            </View>
            </View>

            {/* Location pill */}
            {location.full && (
            <View className="flex-row items-center px-5 py-3 bg-amber-50 border-b border-blue-100">
                <View className="w-2 h-2 rounded-full bg-amber-500 mr-2.5" />
                <View className="bg-blue-100 px-2 py-0.5 rounded-full">
                <AppText className="text-blue-500 text-xs" style={{ fontWeight: '600' }}>
                    Selected
                </AppText>
                </View>
                <AppText className="text-md text italic text-center text-gray-600 py-4">
                    {location.full && location.full}
                </AppText>
            </View>
            )}

            {/* Map */}
            <View className="flex-1 overflow-hidden">
            <MapComponent
                setLocation={handleLocationChange}
                location={location}
                editMode={true}
            />
            </View>

            {/* Bottom hint */}
            <View
            className="px-5 py-4 bg-white border-t border-gray-100 flex-row items-center"
            >
            <View className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center mr-3">
                <AppText className="text-sm">📍</AppText>
            </View>
            <AppText className="text-gray-400 text-xs flex-1" style={{ lineHeight: 18 }}>
                Press to place a marker precisely. Drag to adjust.
            </AppText>
            </View>
        </View>
        </Modal>
    )
}