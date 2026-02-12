import AuthContext from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import React, { useContext, useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';


export default function LoginScreen() {
  const auth = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');

  if (!auth) return null; // Context not ready

  // Email validation regex
  const validateEmail = (email: string) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  const handleLogin = async () => {
    // Check email
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email.');
      return;
    } else {
      setEmailError('');
    }

    setLoading(true);
    try {
      await auth.loginUser({ email, password });
      Alert.alert('Success', 'You are logged in!');
    } catch (err: any) {
      Alert.alert('Login Failed', err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="justify-center flex-1 px-6 bg-gray-100">
      <Text className="mb-8 text-3xl font-bold text-center text-gray-800">Welcome Back</Text>

      {/* Email Input */}
      <View className="mb-4">
        <Text className="mb-2 text-gray-600">Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
          className={`bg-white px-4 py-3 rounded-lg shadow-sm border ${
            emailError ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {emailError ? <Text className="mt-1 text-red-500">{emailError}</Text> : null}
      </View>

      {/* Password Input */}
      <View className="relative mb-6">
        <Text className="mb-2 text-gray-600">Password</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your password"
          secureTextEntry={!showPassword}
          className="px-4 py-3 pr-12 bg-white border border-gray-300 rounded-lg shadow-sm"
        />
        <TouchableOpacity
          className="absolute right-3 top-10"
          onPress={() => setShowPassword(!showPassword)}
        >
          <Ionicons
            name={showPassword ? 'eye-off' : 'eye'}
            size={24}
            color="gray"
          />
        </TouchableOpacity>
      </View>

      {/* Login Button */}
      <TouchableOpacity
        onPress={handleLogin}
        className={`bg-blue-600 py-3 rounded-lg ${loading ? 'opacity-50' : 'opacity-100'}`}
        disabled={loading}
      >
        <Text className="text-lg font-semibold text-center text-white">
          {loading ? 'Logging in...' : 'Login'}
        </Text>
      </TouchableOpacity>

      {/* Sign Up Link */}
      <View className="flex-row justify-center mt-4">
        <Text className="text-gray-600">Don't have an account? </Text>
        <TouchableOpacity onPress={() => Alert.alert('Redirect', 'Go to Sign Up')}>
          <Text className="font-semibold text-blue-600">Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
