import { registerRequest } from "@/api/auth";
import T_A_C_Modal from "@/components/T_A_C_Modal";
import { AppText } from "@/components/typography";
import AuthContext from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import React, { useContext, useState } from "react";
import { TextInput, TouchableOpacity, View } from "react-native";
import LocationSelector from "../LocationSelector";
import MapModal from "../MapModal";

// ─── Types ────────────────────────────────────────────────────────────────────

type RegisterProps = {
  onGoToLogin: () => void;
  setVisible?: React.Dispatch<React.SetStateAction<boolean>>;
};

type FieldProps = {
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  onBlur?: () => void;
  secureTextEntry?: boolean;
  keyboardType?: any;
  autoCapitalize?: any;
  rightIcon?: React.ReactNode;
  error?: string;
  hint?: string;
  maxLength?: number;
  className?: string;
};

type LocationState = {
  lat: number | null;
  lng: number | null;
  city?: string;
  country?: string;
  full?: string;
};

// ─── Validation rules ─────────────────────────────────────────────────────────

const RULES = {
  firstName:  { min: 2,  max: 30  },
  lastName:   { min: 2,  max: 30  },
  username:   { min: 3,  max: 20  },
  email:      { max: 100 },
  password:   { min: 8,  max: 64  },
  phone:      { digits: 10 },
} as const;

// Only letters + spaces + hyphens (no numbers, symbols)
const NAME_REGEX     = /^[a-zA-Z\s\-']+$/;
// Lowercase letters, digits, underscores, dots — no spaces
const USERNAME_REGEX = /^[a-zA-Z0-9_.]+$/;
// Standard email
const EMAIL_REGEX    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// At least one uppercase, one lowercase, one digit
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;

function validateName(value: string, label: string): string | undefined {
  const v = value.trim();
  if (!v) return `${label} is required`;
  if (v.length < RULES.firstName.min) return `${label} must be at least ${RULES.firstName.min} characters`;
  if (!NAME_REGEX.test(v)) return `${label} can only contain letters, spaces, hyphens`;
}

function validateUsername(value: string): string | undefined {
  const v = value.trim();
  if (!v) return "Username is required";
  if (v.length < RULES.username.min) return `At least ${RULES.username.min} characters required`;
  if (!USERNAME_REGEX.test(v)) return "Only letters, numbers, underscores, and dots";
  if (/^[._]/.test(v) || /[._]$/.test(v)) return "Cannot start or end with . or _";
  if (/[_.]{2}/.test(v)) return "Cannot have consecutive . or _";
}

function validateEmail(value: string): string | undefined {
  if (!value.trim()) return "Email is required";
  if (!EMAIL_REGEX.test(value)) return "Enter a valid email address";
}

function validatePassword(value: string): string | undefined {
  if (!value) return "Password is required";
  if (value.length < RULES.password.min) return `At least ${RULES.password.min} characters required`;
  if (!PASSWORD_REGEX.test(value)) return "Must include uppercase, lowercase, and a number";
}

function validateConfirmPassword(password: string, confirm: string): string | undefined {
  if (!confirm) return "Please confirm your password";
  if (password !== confirm) return "Passwords do not match";
}

function validatePhone(value: string): string | undefined {
  if (!value) return "Phone number is required";
  if (!/^\d{10}$/.test(value)) return "Enter a valid 10-digit number (digits only)";
  if (/^0+$/.test(value)) return "Enter a valid phone number";
}

// ─── Field component ──────────────────────────────────────────────────────────

function Field({
  placeholder,
  value,
  onChangeText,
  onBlur,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  rightIcon,
  error,
  hint,
  maxLength,
  className = "",
}: FieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View className={`mb-2.5 ${className}`}>
      <View
        className={`flex-row items-center border rounded-xl px-4 py-3 bg-white ${
          error
            ? "border-red-400"
            : focused
            ? "border-orange-400"
            : "border-gray-200"
        }`}
      >
        <TextInput
          placeholder={placeholder}
          placeholderTextColor="#ADADAD"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize ?? "sentences"}
          maxLength={maxLength}
          onFocus={() => setFocused(true)}
          onBlur={() => { setFocused(false); onBlur?.(); }}
          className="flex-1 text-sm text-gray-900"
        />
        {rightIcon}
      </View>

      {/* Error OR hint + character counter */}
      <View className="flex-row justify-between items-center mt-0.5 px-1">
        {error ? (
          <View className="flex-row items-center gap-1 flex-1">
            <Ionicons name="alert-circle-outline" size={12} color="#ef4444" />
            <AppText className="text-xs text-red-500 flex-1">{error}</AppText>
          </View>
        ) : hint ? (
          <AppText className="text-xs text-gray-400 flex-1">{hint}</AppText>
        ) : (
          <View />
        )}
        {maxLength ? (
          <AppText
            className={`text-xs ml-2 ${
              value.length >= maxLength ? "text-red-400" : "text-gray-300"
            }`}
          >
            {value.length}/{maxLength}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

// ─── Eye toggle ───────────────────────────────────────────────────────────────

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

// ─── Password strength indicator ──────────────────────────────────────────────

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;

  const checks = [
    { label: "8+ characters",  ok: password.length >= 8          },
    { label: "Uppercase",       ok: /[A-Z]/.test(password)        },
    { label: "Lowercase",       ok: /[a-z]/.test(password)        },
    { label: "Number",          ok: /\d/.test(password)           },
    { label: "Symbol",          ok: /[^a-zA-Z0-9]/.test(password) },
  ];

  const passed = checks.filter((c) => c.ok).length;
  const strengthLabel =
    passed <= 2 ? "Weak" : passed <= 3 ? "Fair" : passed === 4 ? "Good" : "Strong";
  const strengthColor =
    passed <= 2 ? "#ef4444" : passed <= 3 ? "#f97316" : passed === 4 ? "#eab308" : "#22c55e";

  return (
    <View className="mb-2 -mt-1.5 px-1">
      {/* Bar */}
      <View className="flex-row gap-1 mb-1.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <View
            key={i}
            className="flex-1 h-1 rounded-full"
            style={{ backgroundColor: i <= passed ? strengthColor : "#e5e7eb" }}
          />
        ))}
      </View>
      {/* Checks */}
      <View className="flex-row flex-wrap gap-x-3 gap-y-0.5">
        {checks.map((c) => (
          <View key={c.label} className="flex-row items-center gap-0.5">
            <Ionicons
              name={c.ok ? "checkmark-circle" : "ellipse-outline"}
              size={11}
              color={c.ok ? "#22c55e" : "#d1d5db"}
            />
            <AppText
              className={`text-[10px] ${c.ok ? "text-green-600" : "text-gray-400"}`}
            >
              {c.label}
            </AppText>
          </View>
        ))}
      </View>
      <AppText className="text-[10px] font-semibold mt-1" style={{ color: strengthColor }}>
        {strengthLabel}
      </AppText>
    </View>
  );
}

// ─── Register ─────────────────────────────────────────────────────────────────

export default function Register({ onGoToLogin, setVisible }: RegisterProps) {
  const auth = useContext(AuthContext);

  const [firstName, setFirstName]               = useState("");
  const [lastName, setLastName]                 = useState("");
  const [username, setUsername]                 = useState("");
  const [email, setEmail]                       = useState("");
  const [password, setPassword]                 = useState("");
  const [confirmPassword, setConfirmPassword]   = useState("");
  const [phone, setPhone]                       = useState("");
  const [showPassword, setShowPassword]         = useState(false);
  const [showConfirmPw, setShowConfirmPw]       = useState(false);
  const [agreedToTerms, setAgreedToTerms]       = useState(false);
  const [termsOpen, setTermsOpen]               = useState(false);
  const [loading, setLoading]                   = useState(false);
  const [errors, setErrors]                     = useState<Record<string, string>>({});
  const [openedMap, setOpenedMap]               = useState(false);
  const [touched, setTouched]                   = useState<Record<string, boolean>>({});

  const [location, setLocation] = useState<LocationState>({
    lat: null,
    lng: null,
    city: "",
    country: "",
    full: "",
  });

  // ── Inline sanitizers ──────────────────────────────────────────────────────

  function handleFirstNameChange(t: string) {
    // Strip digits and most symbols — allow letters, spaces, hyphens, apostrophes
    setFirstName(t.replace(/[^a-zA-Z\s\-']/g, "").slice(0, RULES.firstName.max));
  }

  function handleLastNameChange(t: string) {
    setLastName(t.replace(/[^a-zA-Z\s\-']/g, "").slice(0, RULES.lastName.max));
  }

  function handleUsernameChange(t: string) {
    // Lowercase, strip disallowed chars, no leading spaces
    setUsername(
      t
        .toLowerCase()
        .replace(/[^a-zA-Z0-9_.]/g, "")
        .slice(0, RULES.username.max),
    );
  }

  function handleEmailChange(t: string) {
    // Strip spaces; limit length
    setEmail(t.replace(/\s/g, "").slice(0, RULES.email.max));
  }

  function handlePasswordChange(t: string) {
    setPassword(t.slice(0, RULES.password.max));
  }

  function handleConfirmPasswordChange(t: string) {
    setConfirmPassword(t.slice(0, RULES.password.max));
  }

  function handlePhoneChange(t: string) {
    setPhone(t.replace(/\D/g, "").slice(0, RULES.phone.digits));
  }

  // ── Inline (on-blur) validation ────────────────────────────────────────────

  function blurValidate(field: string) {
    setTouched((prev) => ({ ...prev, [field]: true }));
    let error: string | undefined;
    switch (field) {
      case "firstName":       error = validateName(firstName, "First name"); break;
      case "lastName":        error = validateName(lastName, "Last name"); break;
      case "username":        error = validateUsername(username); break;
      case "email":           error = validateEmail(email); break;
      case "password":        error = validatePassword(password); break;
      case "confirmPassword": error = validateConfirmPassword(password, confirmPassword); break;
      case "phone":           error = validatePhone(phone); break;
    }
    setErrors((prev) => {
      const next = { ...prev };
      if (error) next[field] = error;
      else delete next[field];
      return next;
    });
  }

  // ── Full validation on submit ──────────────────────────────────────────────

  function validate(): boolean {
    const e: Record<string, string> = {};

    const fn = validateName(firstName, "First name");
    const ln = validateName(lastName, "Last name");
    const un = validateUsername(username);
    const em = validateEmail(email);
    const pw = validatePassword(password);
    const cp = validateConfirmPassword(password, confirmPassword);
    const ph = validatePhone(phone);

    if (fn) e.firstName = fn;
    if (ln) e.lastName = ln;
    if (un) e.username = un;
    if (em) e.email = em;
    if (pw) e.password = pw;
    if (cp) e.confirmPassword = cp;
    if (ph) e.phone = ph;
    if (!location.lat) e.location = "Please select your location on the map.";
    if (!agreedToTerms) e.terms = "You must agree to the terms to continue";

    setErrors(e);
    // Mark all as touched so errors show
    setTouched({
      firstName: true, lastName: true, username: true,
      email: true, password: true, confirmPassword: true, phone: true,
    });
    return Object.keys(e).length === 0;
  }

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleRegister = async () => {
    if (!validate()) return;

    setLoading(true);
    setErrors({});
    try {
      const body = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        name: username,
        email: email.trim(),
        password,
        password_confirmation: confirmPassword,
        phone_number: `+63${phone}`,
        latitude: location.lat,
        longitude: location.lng,
        location: location.full || "",
      };

      const { res, data } = await registerRequest(body);
      if (!res.ok) {
        throw new Error((data as { message?: string })?.message || "Registration failed");
      }

      if (!auth) return;
      const loginResult = await auth.loginUser({ email: email.trim(), password });
      if (loginResult === "The credential are wrong") return;
      else setVisible?.(false);
    } catch (err: any) {
      setErrors({ general: err?.message || "Registration failed. Please try again." });
      setTimeout(() => setErrors((p) => { const n = { ...p }; delete n.general; return n; }), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationChange = (loc: LocationState) => {
    setLocation(loc);
    setErrors((prev) => { const next = { ...prev }; delete next.location; return next; });
  };

  // ── Derived ────────────────────────────────────────────────────────────────

  const canSubmit = !loading && Boolean(location.lat);

  return (
    <View className="w-full">
      {/* General error */}
      {errors.general ? (
        <View className="flex-row items-center gap-2 px-3 py-2.5 mb-3 bg-red-50 border border-red-200 rounded-xl">
          <Ionicons name="warning-outline" size={16} color="#ef4444" />
          <AppText className="text-sm text-red-600 flex-1">{errors.general}</AppText>
        </View>
      ) : null}

      {/* First + Last Name */}
      <View className="flex-row gap-2">
        <View className="flex-1">
          <Field
            placeholder="First Name"
            value={firstName}
            onChangeText={handleFirstNameChange}
            onBlur={() => blurValidate("firstName")}
            error={touched.firstName ? errors.firstName : undefined}
            hint="Letters only"
            maxLength={RULES.firstName.max}
          />
        </View>
        <View className="flex-1">
          <Field
            placeholder="Last Name"
            value={lastName}
            onChangeText={handleLastNameChange}
            onBlur={() => blurValidate("lastName")}
            error={touched.lastName ? errors.lastName : undefined}
            maxLength={RULES.lastName.max}
          />
        </View>
      </View>

      <Field
        placeholder="Username"
        value={username}
        onChangeText={handleUsernameChange}
        onBlur={() => blurValidate("username")}
        autoCapitalize="none"
        error={touched.username ? errors.username : undefined}
        hint="Letters, numbers, _ and . only"
        maxLength={RULES.username.max}
      />

      <Field
        placeholder="Email"
        value={email}
        onChangeText={handleEmailChange}
        onBlur={() => blurValidate("email")}
        keyboardType="email-address"
        autoCapitalize="none"
        error={touched.email ? errors.email : undefined}
        maxLength={RULES.email.max}
      />

      <Field
        placeholder="Password"
        value={password}
        onChangeText={handlePasswordChange}
        onBlur={() => blurValidate("password")}
        secureTextEntry={!showPassword}
        autoCapitalize="none"
        error={touched.password ? errors.password : undefined}
        maxLength={RULES.password.max}
        rightIcon={
          <EyeToggle show={showPassword} onPress={() => setShowPassword((p) => !p)} />
        }
      />

      {/* Strength meter — only show while actively setting password */}
      {password.length > 0 ? <PasswordStrength password={password} /> : null}

      <Field
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={handleConfirmPasswordChange}
        onBlur={() => blurValidate("confirmPassword")}
        secureTextEntry={!showConfirmPw}
        autoCapitalize="none"
        error={touched.confirmPassword ? errors.confirmPassword : undefined}
        maxLength={RULES.password.max}
        rightIcon={
          <EyeToggle show={showConfirmPw} onPress={() => setShowConfirmPw((p) => !p)} />
        }
      />

      {/* Phone */}
      <View
        className={`flex-row gap-2 mb-0.5 border rounded-xl overflow-hidden bg-white ${
          errors.phone && touched.phone ? "border-red-400" : "border-gray-200"
        }`}
      >
        {/* Country code prefix — not editable */}
        <View className="justify-center px-3 py-3 bg-gray-50 border-r border-gray-200">
          <AppText className="text-sm font-semibold text-gray-700">+63</AppText>
        </View>
        <TextInput
          placeholder="10-digit phone number"
          placeholderTextColor="#ADADAD"
          value={phone}
          onChangeText={handlePhoneChange}
          onBlur={() => blurValidate("phone")}
          keyboardType="phone-pad"
          maxLength={RULES.phone.digits}
          className="flex-1 px-3 py-3 text-sm text-gray-900"
        />
        {/* Live digit counter */}
        <View className="justify-center pr-3">
          <AppText
            className={`text-xs ${phone.length === RULES.phone.digits ? "text-green-500" : "text-gray-300"}`}
          >
            {phone.length}/{RULES.phone.digits}
          </AppText>
        </View>
      </View>
      {errors.phone && touched.phone ? (
        <View className="flex-row items-center gap-1 mb-2 px-1">
          <Ionicons name="alert-circle-outline" size={12} color="#ef4444" />
          <AppText className="text-xs text-red-500">{errors.phone}</AppText>
        </View>
      ) : (
        <View className="mb-2" />
      )}

      {/* Location picker */}
      <LocationSelector location={location} setOpenedMap={setOpenedMap} />
      {errors.location ? (
        <View className="flex-row items-center gap-1 mb-2 mt-0.5 px-1">
          <Ionicons name="location-outline" size={12} color="#ef4444" />
          <AppText className="text-xs text-red-500">{errors.location}</AppText>
        </View>
      ) : (
        <View className="mb-2" />
      )}

      {/* Terms */}
      <View className="mb-1 flex-row items-start">
        <TouchableOpacity
          onPress={() => {
            setAgreedToTerms((p) => !p);
            if (errors.terms)
              setErrors((prev) => { const next = { ...prev }; delete next.terms; return next; });
          }}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: agreedToTerms }}
          className="mr-2 mt-0.5"
        >
          <View
            className={`h-4 w-4 items-center justify-center rounded border ${
              agreedToTerms ? "border-orange-400 bg-orange-400" : "border-gray-300 bg-white"
            }`}
          >
            {agreedToTerms ? <Ionicons name="checkmark" size={11} color="#fff" /> : null}
          </View>
        </TouchableOpacity>
        <AppText className="flex-1 text-xs leading-4 text-gray-500">
          By signing up, you agree to our{" "}
          <AppText onPress={() => setTermsOpen(true)} className="font-semibold text-orange-400">
            Terms of Service
          </AppText>{" "}
          and{" "}
          <AppText onPress={() => setTermsOpen(true)} className="font-semibold text-orange-400">
            Privacy Policy
          </AppText>
        </AppText>
      </View>
      {errors.terms ? (
        <View className="flex-row items-center gap-1 mb-3 px-1">
          <Ionicons name="alert-circle-outline" size={12} color="#ef4444" />
          <AppText className="text-xs text-red-500">{errors.terms}</AppText>
        </View>
      ) : (
        <View className="mb-4" />
      )}

      {/* Submit */}
      <TouchableOpacity
        onPress={handleRegister}
        disabled={!canSubmit}
        activeOpacity={0.8}
        className={`rounded-full py-4 items-center mb-5 ${
          canSubmit ? "bg-orange-400" : "bg-orange-200"
        }`}
      >
        <AppText className="text-base font-bold text-white">
          {loading ? "Creating account…" : "Sign Up"}
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
        location={location}
        handleLocationChange={handleLocationChange}
      />
    </View>
  );
}