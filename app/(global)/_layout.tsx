import { Slot } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';




export default function GlobalLayout() {
  return (
    <SafeAreaView className='flex-1 p-2 bg-slate-100'>
      <Slot/>
    </SafeAreaView>
  )
}
