import { AppText } from "@/components/typography";
import { COLORS } from "@/constants/theme";
import React from "react";
import {
  Dimensions,
  Modal,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type TACModalProps = {
  opened: boolean;
  setOpened: (open: boolean) => void;
};

function SectionTitle({ children }: { children: string }) {
  return (
    <AppText className="mt-4 mb-2 text-sm font-bold text-gray-900">{children}</AppText>
  );
}

function Paragraph({ children }: { children: string }) {
  return (
    <AppText className="mb-3 text-sm leading-6 text-gray-600">{children}</AppText>
  );
}

/**
 * Full-screen sheet with Chick N Click terms and privacy. Open from register (or elsewhere) via `opened` / `setOpened`.
 */
const { height: WINDOW_HEIGHT } = Dimensions.get("window");

export default function T_A_C_Modal({ opened, setOpened }: TACModalProps) {
  const insets = useSafeAreaInsets();
  const sheetHeight = Math.min(WINDOW_HEIGHT * 0.88, 640);

  return (
    <Modal
      visible={opened}
      animationType="slide"
      transparent
      onRequestClose={() => setOpened(false)}
    >
      <View className="flex-1 justify-end bg-black/50">
        <View
          className="overflow-hidden rounded-t-[28px] bg-white"
          style={{
            height: sheetHeight,
            paddingBottom: Math.max(insets.bottom, 12),
            flexDirection: "column",
          }}
        >
          <View className="flex-row items-center justify-between border-b border-gray-100 px-5 pb-3 pt-4">
            <AppText className="pr-2 text-lg font-bold text-gray-900">
              Terms & privacy
            </AppText>
            <TouchableOpacity
              onPress={() => setOpened(false)}
              accessibilityLabel="Close terms"
              className="h-10 w-10 items-center justify-center rounded-full bg-gray-100"
              hitSlop={12}
            >
              <AppText className="text-lg font-bold text-gray-600">✕</AppText>
            </TouchableOpacity>
          </View>

          <ScrollView
            className="px-5 pt-2"
            style={{ flex: 1 }}
            showsVerticalScrollIndicator
            contentContainerStyle={{ paddingBottom: 16 }}
          >
            <AppText className="mb-4 text-xs text-gray-400">
              Last updated: April 2026. By using Chick N Click, you accept the terms below and our
              approach to your data as described in the Privacy policy section.
            </AppText>

            <SectionTitle>1. The service</SectionTitle>
            <Paragraph>
              Chick N Click is a mobile ordering platform that lets you browse our menu, build a cart,
              pay as directed, and request delivery or pickup. Features depend on store availability and
              your account status.
            </Paragraph>

            <SectionTitle>2. Accounts & security</SectionTitle>
            <Paragraph>
              You are responsible for keeping your login credentials confidential and for all activity
              under your account. Notify us promptly if you suspect unauthorized use.
            </Paragraph>

            <SectionTitle>3. Orders & payments</SectionTitle>
            <Paragraph>
              When you place an order, you offer to buy the items shown at the prices and fees displayed.
              We may decline or cancel orders for fraud prevention, stock issues, or operational reasons.
              Payment proof and reference details you submit must be accurate. Prices and fees can change
              before checkout confirmation.
            </Paragraph>

            <SectionTitle>4. Delivery & pickup</SectionTitle>
            <Paragraph>
              Delivery times are estimates. You must provide a valid delivery location when required.
              Pickup orders should be collected according to store instructions. Risk of loss passes as
              stated by the store or carrier where applicable.
            </Paragraph>

            <SectionTitle>5. Cancellations & refunds</SectionTitle>
            <Paragraph>
              Cancellation and refund rules follow store policy and applicable law. Approved refunds, if
              any, are processed through the same channels we specify.
            </Paragraph>

            <SectionTitle>6. Acceptable use</SectionTitle>
            <Paragraph>
              Do not misuse the app, interfere with other users, scrape data without permission, or
              submit false information. We may suspend access for violations.
            </Paragraph>

            <SectionTitle>7. Limitation of liability</SectionTitle>
            <Paragraph>
              To the fullest extent permitted by law, Chick N Click and its operators are not liable for
              indirect or consequential damages arising from use of the service. Some jurisdictions do
              not allow certain limitations; in those cases, our liability is limited to the maximum
              allowed.
            </Paragraph>

            <SectionTitle>8. Changes</SectionTitle>
            <Paragraph>
              We may update these terms from time to time. Continued use after changes means you accept
              the updated terms. Material changes may be highlighted in the app when reasonable.
            </Paragraph>

            <SectionTitle>9. Contact</SectionTitle>
            <Paragraph>
              For questions about these terms or your orders, contact us through the support channels
              provided in the app or on our official pages.
            </Paragraph>

            <SectionTitle>10. Privacy policy</SectionTitle>
            <Paragraph>
              We collect information you provide (such as name, email, phone, delivery location, and order
              details) to operate accounts, process orders, and communicate with you. We use reasonable
              safeguards to protect data and share it only with service providers and partners needed to
              run the app, or when required by law. You may request access or corrections where applicable.
              Notifications and marketing follow your preferences and applicable rules.
            </Paragraph>
          </ScrollView>

          <View className="border-t border-gray-100 px-5 pt-3">
            <TouchableOpacity
              onPress={() => setOpened(false)}
              activeOpacity={0.9}
              className="items-center rounded-2xl py-4"
              style={{ backgroundColor: COLORS.primary }}
            >
              <AppText className="text-base font-bold text-white">I understand</AppText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
