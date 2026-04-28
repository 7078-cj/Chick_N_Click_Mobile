import { AppText } from "@/components/typography";
import React from "react";
import { View } from "react-native";

// ─── SectionLabel ─────────────────────────────────────────────────────────────

type SectionLabelProps = { label: string };

export function SectionLabel({ label }: SectionLabelProps) {
  return (
    <AppText className="mb-2 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
      {label}
    </AppText>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────

export function Divider() {
  return <View className="my-3 border-t border-gray-100" />;
}

// ─── StatusBadge ──────────────────────────────────────────────────────────────

type StatusBadgeProps = { label: string; bg: string; text: string };

export function StatusBadge({ label, bg, text }: StatusBadgeProps) {
  return (
    <View className={`px-3 py-1 rounded-full ${bg}`}>
      <AppText className={`text-[11px] font-bold ${text}`}>{label}</AppText>
    </View>
  );
}
