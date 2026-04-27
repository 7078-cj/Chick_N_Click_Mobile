import Toast from "react-native-toast-message";

export type ToastVariant = "success" | "error" | "info";

/** App-wide toast helper (requires `<ToastRoot />` in `app/_layout.tsx`). */
export function showToast(
  title: string,
  message?: string,
  type: ToastVariant = "info",
) {
  Toast.show({
    type,
    text1: title,
    ...(message ? { text2: message } : {}),
    visibilityTime: type === "error" ? 4200 : 2800,
    position: "top",
  });
}
