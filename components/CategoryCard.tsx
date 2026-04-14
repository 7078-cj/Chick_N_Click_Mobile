import { MaterialIcons } from "@expo/vector-icons"; // or react-native-vector-icons
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface CategoryCardProps {
  label: string;
  title: string;
  description?: string;
  iconName?: keyof typeof MaterialIcons.glyphMap;
  bgColor?: string;
  onPress?: () => void;
}

export function CategoryCard({
  label,
  title,
  description,
  iconName = "category",
  bgColor = "#F5C842",
  onPress,
}: CategoryCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={{
        borderRadius: 18,
        overflow: "hidden",
        backgroundColor: "#fff",
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
      }}
    >
      {/* Top colored section */}
      <View
        style={{
          backgroundColor: bgColor,
          paddingHorizontal: 14,
          paddingTop: 12,
          paddingBottom: 16,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          minHeight: 100,
        }}
      >
        {/* Text content */}
        <View style={{ flex: 1, paddingRight: 8 }}>
          {/* Badge label */}
          <View
            style={{
              alignSelf: "flex-start",
              backgroundColor: "#E07B1A",
              borderRadius: 6,
              paddingHorizontal: 10,
              paddingVertical: 3,
              marginBottom: 8,
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontSize: 11,
                fontWeight: "800",
                letterSpacing: 0.6,
              }}
            >
              {label}
            </Text>
          </View>

          <Text
            style={{
              fontSize: 18,
              fontWeight: "900",
              color: "#1A1A1A",
              marginBottom: 4,
            }}
          >
            {title}
          </Text>

          {description ? (
            <Text
              style={{ fontSize: 12, color: "#444", lineHeight: 17 }}
              numberOfLines={2}
            >
              {description}
            </Text>
          ) : null}
        </View>

        {/* Icon instead of image */}
        <View
          style={{
            width: 110,
            height: 90,
            borderRadius: 10,
            backgroundColor: "rgba(255,255,255,0.35)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MaterialIcons name={iconName} size={42} color="#1A1A1A" />
        </View>
      </View>

      {/* Footer */}
      <View
        style={{
          backgroundColor: "#fff",
          paddingVertical: 12,
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 14, color: "#333", fontWeight: "500" }}>
          Click to view category
        </Text>
      </View>
    </TouchableOpacity>
  );
}
