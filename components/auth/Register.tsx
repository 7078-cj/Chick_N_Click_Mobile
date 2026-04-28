import { registerRequest } from "@/api/auth";
import T_A_C_Modal from "@/components/T_A_C_Modal";
import { AppText } from "@/components/typography";
import AuthContext from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import React, { useContext, useState } from "react";
import { TextInput, TouchableOpacity, View } from "react-native";
import LocationSelector from "../LocationSelector";
import MapModal from "../MapModal";

type RegisterProps = {
  onGoToLogin: () => void;
  setVisible?: React.Dispatch<React.SetStateAction<boolean>>;
};

type FieldProps = {
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: any;
  autoCapitalize?: any;
  rightIcon?: React.ReactNode;
  error?: string;
  className?: string;
};

type LocationState = {
  lat: number | null;
  lng: number | null;
  city?: string;
  country?: string;
  full?: string;
};

function Field({
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  rightIcon,
  error,
  className = "",
}: FieldProps) {
  return (
    <View className={`mb-2.5 ${className}`}>
      <View
        className={`flex-row items-center border rounded-xl px-4 py-3 bg-white ${error ? "border-red-400" : "border-gray-200"}`}
      >
        <TextInput
          placeholder={placeholder}
          placeholderTextColor="#ADADAD"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize ?? "sentences"}
          className="flex-1 text-sm text-gray-900"
        />
        {rightIcon}
        {/* meow */}
      </View>
      {error ? (
        <AppText className="mt-1 text-xs text-red-500">{error}</AppText>
      ) : null}
    </View>
  );
}

function EyeToggle({ show, onPress }: { show: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Ionicons
        name={show ? "eye-outline" : "eye-off-outline"}
        size={20}
        color="#ADADAD"
      />
    </TouchableOpacity>
  );
}

export default function Register({ onGoToLogin, setVisible }: RegisterProps) {
  const auth = useContext(AuthContext);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [openedMap, setOpenedMap] = useState(false)

  // ── Location state (mirrors web version) ──────────────────────────────────
  const [location, setLocation] = useState<LocationState>({
    lat: null,
    lng: null,
    city: "",
    country: "",
    full: "",
  });

  // Auto-clear a specific error key after 4 s (mirrors web setTimeout pattern)
  const clearErrorAfterDelay = (key: string) => {
    setTimeout(() => {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }, 4000);
  };

  const validate = () => {
    const e: Record<string, string> = {};

    if (!firstName.trim()) e.firstName = "Required";
    if (!lastName.trim()) e.lastName = "Required";
    if (!username.trim()) e.username = "Required";
    if (!/\S+@\S+\.\S+/.test(email)) e.email = "Invalid email";
    if (password.length < 6) e.password = "Min 6 characters";
    if (password !== confirmPassword)
      e.confirmPassword = "Passwords do not match";

    // ── Phone validation (mirrors web: exactly 10 digits) ──────────────────
    if (!/^\d{10}$/.test(phone)) {
      e.phone = "Please enter a valid 10-digit phone number (digits only).";
    }

    // ── Location validation (mirrors web: button disabled when !location.lat) ─
    if (!location.lat) {
      e.location = "Please select your location on the map.";
    }

    if (!agreedToTerms) e.terms = "You must agree to the terms";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      // ── Build body (mirrors web RegisterUser body) ───────────────────────
      const body = {
        first_name: firstName,
        last_name: lastName,
        name: username,
        email,
        password,
        password_confirmation: confirmPassword,
        phone_number: `+63${phone}`,
        latitude: location.lat,
        longitude: location.lng,
        location: location.full || "",
      };

      const { res, data } = await registerRequest(body);
      if (!res.ok) {
        throw new Error(
          (data as { message?: string })?.message || "Registration failed",
        );
      }

      // ── Auto-login after successful registration (mirrors web) ────────────
      if (!auth) return;
      const loginResult = await auth.loginUser({ email, password });
      if (loginResult === "The credential are wrong") return;
      else setVisible?.(false);

      // Navigation is handled by the parent via loginUser / auth context
    } catch (err: any) {
      setErrors({ general: err?.message || "Registration failed" });
      clearErrorAfterDelay("general");
    } finally {
      setLoading(false);
    }
  };

  // ── Callback passed down to MapComponent so it can update location state ──
  // Mirrors the web's `setLocation` prop on <UserLocationMap>
  const handleLocationChange = (loc: LocationState) => {
    setLocation(loc);
    // Clear location error as soon as user picks a spot
    setErrors((prev) => {
      const next = { ...prev };
      delete next.location;
      return next;
    });
  };

  return (
    <View className="w-full">
      {errors.general ? (
        <View className="px-3 py-2 mb-3 bg-red-100 border border-red-300 rounded-lg">
          <AppText className="text-sm text-center text-red-600">
            {errors.general}
          </AppText>
        </View>
      ) : null}

      {/* First + Last Name */}
      <View className="flex-row gap-2">
        <View className="flex-1">
          <Field
            placeholder="First Name"
            value={firstName}
            onChangeText={setFirstName}
            error={errors.firstName}
          />
        </View>
        <View className="flex-1">
          <Field
            placeholder="Last Name"
            value={lastName}
            onChangeText={setLastName}
            error={errors.lastName}
          />
        </View>
      </View>

      <Field
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        error={errors.username}
      />
      <Field
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        error={errors.email}
      />

      <Field
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={!showPassword}
        autoCapitalize="none"
        error={errors.password}
        rightIcon={
          <EyeToggle
            show={showPassword}
            onPress={() => setShowPassword(!showPassword)}
          />
        }
      />

      <Field
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry={!showConfirmPassword}
        autoCapitalize="none"
        error={errors.confirmPassword}
        rightIcon={
          <EyeToggle
            show={showConfirmPassword}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          />
        }
      />

      {/* Phone — digits only, strip non-numeric on input (mirrors web onInput) */}
      <View className="flex-row gap-2 mb-2.5">
        <View className="justify-center px-3 py-3 bg-white border border-gray-200 rounded-xl">
          <AppText className="text-sm text-gray-900">+63</AppText>
        </View>
        <View className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl">
          <TextInput
            placeholder="Enter your phone number"
            placeholderTextColor="#ADADAD"
            value={phone}
            onChangeText={(t) => setPhone(t.replace(/\D/g, "").slice(0, 10))}
            keyboardType="phone-pad"
            maxLength={10}
            className="text-sm text-gray-900"
          />
        </View>
      </View>
      {errors.phone ? (
        <AppText className="mb-2 -mt-1 text-xs text-red-500">{errors.phone}</AppText>
      ) : null}


      {/* Show selected address (mirrors web's 📍 display) */}
      {/* <TouchableOpacity className="flex flex-col justify-center items-center"
        onPress={() => setOpenedMap(true)}
      >
        <AppText className="mb-2 text-xs italic text-center text-gray-600">
          {location.full ? location.full: "Tap to change Location"}
        </AppText>
        <AppText>
          {
            location.full && "Tap to change Location"
          }
        </AppText>
      </TouchableOpacity> */}
      <LocationSelector
        location = {location}
        setOpenedMap = {setOpenedMap}
      />

      {errors.location ? (
        <AppText className="mb-2 text-xs text-red-500">{errors.location}</AppText>
      ) : (
        <View className="mb-2" />
      )}

      {/* Terms — checkbox only toggles agreement; links open Terms & Conditions */}
      <View className="mb-1 flex-row items-start">
        <TouchableOpacity
          onPress={() => setAgreedToTerms(!agreedToTerms)}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: agreedToTerms }}
          className="mr-2 mt-0.5"
        >
          <View
            className={`h-4 w-4 items-center justify-center rounded border ${agreedToTerms ? "border-orange-400 bg-orange-400" : "border-gray-300 bg-white"}`}
          >
            {agreedToTerms ? (
              <Ionicons name="checkmark" size={11} color="#fff" />
            ) : null}
          </View>
        </TouchableOpacity>
        <AppText className="flex-1 text-xs leading-4 text-gray-500">
          By signing up, you agree to our{" "}
          <AppText
            onPress={() => setTermsOpen(true)}
            className="font-semibold text-orange-400"
          >
            Terms of Services
          </AppText>{" "}
          and{" "}
          <AppText
            onPress={() => setTermsOpen(true)}
            className="font-semibold text-orange-400"
          >
            Privacy Policy
          </AppText>
        </AppText>
      </View>
      {errors.terms ? (
        <AppText className="mb-3 text-xs text-red-500">{errors.terms}</AppText>
      ) : (
        <View className="mb-4" />
      )}

      {/* Sign Up — disabled when loading OR no location selected (mirrors web) */}
      <TouchableOpacity
        onPress={handleRegister}
        disabled={loading || !location.lat}
        className={`rounded-full py-4 items-center mb-5 ${loading || !location.lat ? "bg-orange-300" : "bg-orange-400"}`}
      >
        <AppText className="text-base font-bold text-white">
          {loading ? "Signing up..." : "Sign Up"}
        </AppText>
      </TouchableOpacity>

      {/* Login redirect */}
      <View className="flex-row justify-center">
        <AppText className="text-sm text-gray-500">Already have an account? </AppText>
        <TouchableOpacity onPress={onGoToLogin}>
          <AppText className="text-sm font-semibold text-orange-400">Log In</AppText>
        </TouchableOpacity>
      </View>
      

      <T_A_C_Modal opened={termsOpen} setOpened={setTermsOpen} />

      <MapModal
        opened={openedMap}
        setOpened={setOpenedMap}
        location = {location}
        handleLocationChange = {handleLocationChange}
      />
    </View>
  );
}
