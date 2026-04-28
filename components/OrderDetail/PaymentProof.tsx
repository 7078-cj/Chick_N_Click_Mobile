import { AppText } from "@/components/typography";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    Dimensions,
    Image,
    Modal,
    Pressable,
    TouchableOpacity,
    View,
} from "react-native";
import { SectionLabel } from "./ui";

type PaymentProofProps = {
  proofUri: string;
};

export function PaymentProof({ proofUri }: PaymentProofProps) {
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const { width, height } = Dimensions.get("window");

  return (
    <>
      {/* ── Thumbnail ── */}
      <View className="mb-5">
        <SectionLabel label="Payment proof" />
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => setPreviewOpen(true)}
          className="overflow-hidden rounded-2xl"
        >
          <Image
            source={{ uri: proofUri }}
            className="w-full h-40"
            resizeMode="cover"
          />
          {/* Dark scrim */}
          <View className="absolute inset-0 bg-black/15" />

          {/* Tap-to-enlarge pill — centered so it's impossible to miss */}
          <View className="absolute inset-0 items-center justify-center">
            <View className="flex-row items-center gap-2 px-4 py-2 rounded-full bg-black/55">
              <Ionicons name="expand-outline" size={15} color="white" />
              <AppText className="text-xs font-bold text-white tracking-wide">
                Tap to view
              </AppText>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* ── Full-screen preview ── */}
      <Modal
        visible={previewOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewOpen(false)}
        statusBarTranslucent
      >
        {/* Backdrop tap also closes */}
        <Pressable
          className="flex-1 bg-black/95 items-center justify-center"
          onPress={() => setPreviewOpen(false)}
        >
          {/* Stop propagation so tapping the image itself doesn't close */}
          <Pressable onPress={(e) => e.stopPropagation()}>
            <Image
              source={{ uri: proofUri }}
              style={{ width: width * 0.92, height: height * 0.65 }}
              resizeMode="contain"
            />
          </Pressable>

          {/* ── Close button — large, always visible at top-right ── */}
          <TouchableOpacity
            onPress={() => setPreviewOpen(false)}
            className="absolute top-14 right-5 z-20 flex-row items-center gap-1.5 px-3 py-2 rounded-full bg-white/20"
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="close" size={18} color="white" />
            <AppText className="text-sm font-bold text-white">Close</AppText>
          </TouchableOpacity>

          {/* ── Bottom hint ── */}
          <View className="absolute bottom-10 items-center">
            <View className="flex-row items-center gap-1.5 px-4 py-2 rounded-full bg-white/10">
              <Ionicons
                name="hand-left-outline"
                size={13}
                color="rgba(255,255,255,0.6)"
              />
              <AppText className="text-xs text-white/60">
                Tap anywhere outside to close
              </AppText>
            </View>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
