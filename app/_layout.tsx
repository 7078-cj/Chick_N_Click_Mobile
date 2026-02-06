// app/_layout.tsx
import { AuthProvider } from '@/contexts/AuthContext';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native';
import '../global.css';

export default function RootLayout() {
  return (
    <AuthProvider>
      <SafeAreaView className="flex-1 bg-white">
        <Stack screenOptions={{ headerShown: false }} />
      </SafeAreaView>
    </AuthProvider>
  );
}
