import { clearError, registerUser } from "@/lib/Slices/userSlice";
import { AppDispatch, RootState } from "@/store/store";
import { Ionicons } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import Fontisto from "@expo/vector-icons/Fontisto";
import { useFonts } from "expo-font";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useDispatch, useSelector } from "react-redux";

type FormField =
  | "name"
  | "username"
  | "email"
  | "password"
  | "role"
  | "adminCode";

const RegisterScreen = () => {
  const [fontsLoaded] = useFonts({
    Montserrat: require("../../assets/fonts/Montserrat-Regular.ttf"),
    "Montserrat-Bold": require("../../assets/fonts/Montserrat-Bold.ttf"),
    "Montserrat-SemiBold": require("../../assets/fonts/Montserrat-SemiBold.ttf"),
  });
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    role: "NormalUser",
    adminCode: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const { status, error } = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const handleChange = (field: FormField, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      await dispatch(registerUser(form)).unwrap();
      router.replace("/login");
    } catch (err) {
      console.log("Registration failed:", err);
    }
  };

  const fieldIcons = {
    name: <AntDesign name="user" size={24} color="#6B7280" />,
    username: <Feather name="user-plus" size={24} color="#6B7280" />,
    email: <Fontisto name="email" size={24} color="#6B7280" />,
    password: <AntDesign name="lock" size={24} color="#6B7280" />,
    adminCode: <Ionicons name="key" size={24} color="#6B7280" />,
  };

  const [containerWidth, setContainerWidth] = useState(0);
  const slideAnim = useRef(
    new Animated.Value(form.role === "AdminUser" ? 1 : 0)
  ).current;

  const toggleRole = (role: "NormalUser" | "AdminUser") => {
    if (status === "loading") return;
    handleChange("role", role);
    Animated.timing(slideAnim, {
      toValue: role === "AdminUser" ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const translateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, containerWidth / 2],
  });

  return (
    <KeyboardAwareScrollView
      className="flex-1 bg-[#F9FAFB]"
      contentContainerStyle={{ flexGrow: 1 }}
      enableOnAndroid={true}
      extraScrollHeight={70}
      keyboardShouldPersistTaps="handled"
    >
      <View className="flex-1 items-center justify-center bg-[#FFFFFF] p-10">
        {/* Image */}
        <View className="w-32 h-32 justify-center items-center mt-4 mb-6">
          <Image
            source={require("../../assets/images/register.png")}
            className="w-52 h-52"
            resizeMode="contain"
          />
        </View>

        {/* Title */}
        <Text className="text-3xl text-[#1F2937] mb-2 font-montserratBold">
          Sign Up
        </Text>
        <Text className="text-sm text-[#6B7280] text-center mb-8 font-montserrat">
          Create your account to continue
        </Text>

        {/* Input Fields */}
        <View className="w-full">
          {(form.role === "AdminUser"
            ? ["name", "username", "email", "password", "adminCode"]
            : ["name", "username", "email", "password"]
          ).map((field) => {
            const typedField = field as FormField;
            return (
              <View
                key={typedField}
                className="flex-row items-center bg-[#F9FAFB] rounded-2xl px-4 py-1 border border-[#E5E7EB] mb-4"
              >
                <Text className="mr-3 text-lg">
                  {fieldIcons[typedField as keyof typeof fieldIcons]}
                </Text>
                <TextInput
                  style={[
                    status === "loading" && { backgroundColor: "#f3f4f6" },
                  ]}
                  className="flex-1 text-base text-[#1F2937] font-montserrat"
                  placeholder={`Enter your ${typedField.toLowerCase()}`}
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={
                    typedField === "password" ? !showPassword : false
                  }
                  keyboardType={
                    typedField === "email" ? "email-address" : "default"
                  }
                  autoCapitalize="none"
                  editable={status !== "loading"}
                  value={form[typedField]}
                  onChangeText={(val) => handleChange(typedField, val)}
                />
                {/* 👁 Eye toggle only for password */}
                {typedField === "password" && (
                  <TouchableOpacity
                    onPress={() => setShowPassword((prev) => !prev)}
                  >
                    <Ionicons
                      name={showPassword ? "eye" : "eye-off"}
                      size={22}
                      color="#6B7280"
                    />
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>

        {/* Role Toggle */}
        <View
          className="w-full h-12 bg-[#F9FAFB] rounded-3xl p-1 relative mb-4 border border-[#E5E7EB]"
          onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
        >
          {/* Sliding indicator */}
          <Animated.View
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: containerWidth / 2,
              backgroundColor: "#A78BFA",
              borderRadius: 999,
              transform: [{ translateX }],
            }}
          />

          {/* Normal User */}
          <TouchableOpacity
            className="absolute left-0 top-0 bottom-0 flex-1 items-center justify-center"
            style={{ width: containerWidth / 2 }}
            onPress={() => toggleRole("NormalUser")}
          >
            <Text
              className={`font-montserratSemiBold ${
                form.role === "NormalUser" ? "text-white" : "text-[#1F2937]"
              }`}
            >
              Normal User
            </Text>
          </TouchableOpacity>

          {/* Admin */}
          <TouchableOpacity
            className="absolute right-0 top-0 bottom-0 flex-1 items-center justify-center"
            style={{ width: containerWidth / 2 }}
            onPress={() => toggleRole("AdminUser")}
          >
            <Text
              className={`font-montserratSemiBold ${
                form.role === "AdminUser" ? "text-white" : "text-[#1F2937]"
              }`}
            >
              Admin
            </Text>
          </TouchableOpacity>
        </View>

        {/* Submit Button */}
        {/* <TouchableOpacity
          className={`w-full rounded-full py-4 items-center mb-2 ${
            status === "loading"
              ? "bg-[#9CA3AF]"
              : "bg-[#6C4FE0] active:bg-[#4C1D95]"
          }`}
          disabled={status === "loading"}
          onPress={handleSubmit}
        >
          {status === "loading" ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-center text-white font-montserratBold tracking-widest">
              Sign Up
            </Text>
          )}
        </TouchableOpacity> */}

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={status === "loading"}
          className={`w-full rounded-full py-4 items-center mb-6 ${
            status === "loading"
              ? "bg-gray-400"
              : "bg-primary-main active:bg-primary-main"
          }`}
        >
          {status === "loading" ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-center text-white font-montserratBold tracking-widest">
              Sign Up
            </Text>
          )}
        </TouchableOpacity>

        {/* Error Message */}
        {status === "failed" && error && (
          <Text className="text-[#EF4444] text-sm text-center mt-2 font-montserrat">
            {error}
          </Text>
        )}

        {/* Back to Login */}
        <View className="mt-4 flex-row items-center">
          <Text className="text-sm text-[#6B7280] font-montserrat">
            Already have an account?
          </Text>
          <TouchableOpacity
            disabled={status === "loading"}
            onPress={() => {
              dispatch(clearError());
              router.replace("/login");
            }}
          >
            <Text className="text-[#6C4FE0] text-sm font-montserratSemiBold ml-2">
              Back to Login
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
};

export default RegisterScreen;
