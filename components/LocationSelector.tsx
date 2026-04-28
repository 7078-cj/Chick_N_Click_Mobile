import { AppText } from '@/components/typography'
import React from 'react'
import { TouchableOpacity, View } from 'react-native'

export default function LocationSelector({ location, setOpenedMap }: any) {
    const hasLocation = !!location?.full

    return (
        <TouchableOpacity
        onPress={() => setOpenedMap(true)}
        activeOpacity={0.7}
        className={`flex-row items-center gap-3 px-4 py-3 rounded-2xl border ${
            hasLocation
            ? 'bg-amber-50 border-amber-200'
            : 'bg-amber-50 border-gray-200 border-dashed'
        }`}
        >
        {/* Pin icon */}
        <View
            className={`w-9 h-9 rounded-full items-center justify-center ${
            hasLocation ? 'bg-blue-100' : 'bg-gray-100'
            }`}
        >
            <AppText className="text-base">📍</AppText>
        </View>

        {/* Text content */}
        <View className="flex-1">
            {hasLocation ? (
            <>
                <AppText
                className="text-gray-900 text-sm leading-snug"
                style={{ fontWeight: '600' }}
                numberOfLines={2}
                >
                {location.full}
                </AppText>
                <AppText className="text-blue-500 text-xs mt-0.5" style={{ fontWeight: '500' }}>
                Tap to change location
                </AppText>
            </>
            ) : (
            <>
                <AppText className="text-gray-700 text-sm" style={{ fontWeight: '600' }}>
                Set a location
                </AppText>
                <AppText className="text-gray-400 text-xs mt-0.5">
                Tap to pick from the map
                </AppText>
            </>
            )}
        </View>

        {/* Chevron */}
        <AppText className={`text-xs ${hasLocation ? 'text-blue-400' : 'text-gray-300'}`}>›</AppText>
        </TouchableOpacity>
    )
}