import { AppText } from "@/components/typography";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";

type CustomerNoteProps = { note: string };

export function CustomerNote({ note }: CustomerNoteProps) {
  return (
    <View className="p-4 mb-5 rounded-2xl border border-dashed border-amber-200 bg-amber-50">
      <View className="flex-row items-center gap-1.5 mb-1.5">
        <Ionicons name="document-text-outline" size={13} color="#92400e" />
        <AppText className="text-[10px] font-bold tracking-widest text-amber-700 uppercase">
          Customer note
        </AppText>
      </View>
      <AppText className="text-sm text-amber-900 leading-relaxed">
        {note}
      </AppText>
    </View>
  );
}
