import AuthContext from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import React, { useContext, useEffect, useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

type LoginProps = {
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function Login({ setVisible }: LoginProps) {
  const auth = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [error, setError] = useState('');

  if (!auth) return null; // Context not ready

  const validateEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter both email and password.');
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
      const res = await auth.loginUser({ email, password });
      if (res === 'The credential are wrong') {
        setError(res);
      } else {
        setVisible(false);
      }
    } catch (err: any) {
      setError(err?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 10000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <View className="justify-center px-6">
      <Text className="mb-8 text-3xl font-bold text-center text-gray-800">Welcome Back</Text>

      {/* Error Message */}
      {error ? (
        <View className="p-3 mb-4 bg-red-100 border border-red-400 rounded-lg">
          <Text className="font-medium text-center text-red-700">{error}</Text>
        </View>
      ) : null}

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
          <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={24} color="gray" />
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
    </View>
  );
}
