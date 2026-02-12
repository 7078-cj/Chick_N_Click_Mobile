// app/_layout.tsx
import Tabs from '@/components/Tabs';
import { AuthProvider } from '@/contexts/AuthContext';
import { FoodProvider } from '@/contexts/FoodContext';
import { Stack } from 'expo-router';
import { SafeAreaView } from "react-native-safe-area-context";
import '../global.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {


  return (
    <AuthProvider>
      <FoodProvider>
        <SafeAreaView className="flex-1 bg-white">
          <Stack screenOptions={{ headerShown: false }}/>
          <Tabs/>
        </SafeAreaView>
      </FoodProvider>
    </AuthProvider>
  );
}
