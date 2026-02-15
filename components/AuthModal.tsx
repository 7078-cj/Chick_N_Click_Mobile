
import { TabContext } from '@/contexts/TabContext';
import { router } from 'expo-router';
import { useContext, useState } from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';

type AuthModalProps = {
    visible: boolean
    setVisible: React.Dispatch<React.SetStateAction<boolean>>
}

export default function AuthModal({visible, setVisible}:AuthModalProps) {
    const tab = useContext(TabContext)
    const [page, setPage] = useState<'login' | 'sign-up'>('login')

    const onClose = () => {
        setVisible(false)
        tab?.setActive('Menu')
        router.push('/')
    }

  return (
     <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
      >
        <View>
          <View>
            <Text>This is a modal!</Text>
            <TouchableOpacity onPress={onClose}>
                <Text>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
  )
}


