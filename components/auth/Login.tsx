import AuthContext from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import React, { useContext, useEffect, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

type LoginProps = {
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  onGoToSignUp: () => void;
};

export default function Login({ setVisible, onGoToSignUp }: LoginProps) {
  const auth = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [error, setError] = useState("");

  if (!auth) return null;

  const validateEmail = (val: string) => /\S+@\S+\.\S+/.test(val);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email.");
      return;
    }
    setEmailError("");
    setLoading(true);
    try {
      const res = await auth.loginUser({ email, password });
      if (res === "The credential are wrong") setError(res);
      else setVisible(false);
    } catch (err: any) {
      setError(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (error) {
      const t = setTimeout(() => setError(""), 10000);
      return () => clearTimeout(t);
    }
  }, [error]);

  return (
    <View className="w-full">
      {/* Error banner */}
      {error ? (
        <View className="px-3 py-2 mb-3 bg-red-100 border border-red-300 rounded-lg">
          <Text className="text-sm text-center text-red-600">{error}</Text>
        </View>
      ) : null}

      {/* Email */}
      <View
        className={`flex-row items-center border rounded-xl px-4 py-3 mb-3 bg-white ${emailError ? "border-red-400" : "border-gray-200"}`}
      >
        <TextInput
          value={email}
          onChangeText={(t) => {
            setEmail(t);
            setEmailError("");
          }}
          placeholder="Email"
          placeholderTextColor="#ADADAD"
          keyboardType="email-address"
          autoCapitalize="none"
          className="flex-1 text-sm text-gray-900"
        />
      </View>
      {emailError ? (
        <Text className="mb-2 -mt-2 text-xs text-red-500">{emailError}</Text>
      ) : null}

      {/* Password */}
      <View className="flex-row items-center px-4 py-3 mb-3 bg-white border border-gray-200 rounded-xl">
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor="#ADADAD"
          secureTextEntry={!showPassword}
          className="flex-1 text-sm text-gray-900"
        />
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={showPassword ? "eye-outline" : "eye-off-outline"}
            size={20}
            color="#ADADAD"
          />
        </TouchableOpacity>
      </View>

      {/* Remember Me */}
      <TouchableOpacity
        onPress={() => setRememberMe(!rememberMe)}
        className="flex-row items-center mb-5"
      >
        <View
          className={`w-4 h-4 rounded border mr-2 items-center justify-center ${rememberMe ? "bg-orange-400 border-orange-400" : "border-gray-300 bg-white"}`}
        >
          {rememberMe && <Ionicons name="checkmark" size={11} color="#fff" />}
        </View>
        <Text className="text-sm text-gray-500">Remember Me</Text>
      </TouchableOpacity>

      {/* Login Button */}
      <TouchableOpacity
        onPress={handleLogin}
        disabled={loading}
        className={`rounded-full py-4 items-center mb-5 ${loading ? "bg-orange-300" : "bg-orange-400"}`}
      >
        <Text className="text-base font-bold text-white">
          {loading ? "Logging in..." : "Login"}
        </Text>
      </TouchableOpacity>

      {/* Sign Up link */}
      <View className="flex-row justify-center">
        <Text className="text-sm text-gray-500">Don't have an account? </Text>
        <TouchableOpacity onPress={onGoToSignUp}>
          <Text className="text-sm font-semibold text-orange-400">Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
