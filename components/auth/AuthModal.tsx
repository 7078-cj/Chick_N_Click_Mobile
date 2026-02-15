import { TabContext } from '@/contexts/TabContext';
import { router } from 'expo-router';
import { useContext, useState } from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import Login from './Login';
import Register from './Register';

type AuthModalProps = {
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function AuthModal({ visible, setVisible }: AuthModalProps) {
  const tab = useContext(TabContext);
  const [page, setPage] = useState<'login' | 'sign-up'>('login');

  const onClose = () => {
    setVisible(false);
    tab?.setActive('Menu');
    router.push('/');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View className="items-center justify-center flex-1 bg-black/50">
        <View className="w-11/12 p-6 bg-white shadow-lg rounded-2xl">
          
          {/* Header */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-bold">{page === 'login' ? 'Login' : 'Sign Up'}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text className="text-2xl text-gray-500">✕</Text>
            </TouchableOpacity>
          </View>

          {/* Toggle */}
          <View className="flex-row mb-4 overflow-hidden border border-gray-300 rounded-xl">
            <TouchableOpacity
              className={`flex-1 py-2 items-center ${page === 'login' ? 'bg-indigo-600' : ''}`}
              onPress={() => setPage('login')}
            >
              <Text className={`${page === 'login' ? 'text-white font-semibold' : 'text-gray-600'}`}>
                Login
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-1 py-2 items-center ${page === 'sign-up' ? 'bg-indigo-600' : ''}`}
              onPress={() => setPage('sign-up')}
            >
              <Text className={`${page === 'sign-up' ? 'text-white font-semibold' : 'text-gray-600'}`}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View className="pt-2">
            {page === 'login' ? <Login setVisible={setVisible} /> : <Register />}
          </View>

        </View>
      </View>
    </Modal>
  );
}
