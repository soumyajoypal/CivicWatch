import { loginUser } from "@/lib/Slices/userSlice";
import { Ionicons } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useFonts } from "expo-font";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store/store";

export default function Login() {
  const [fontsLoaded] = useFonts({
    Montserrat: require("../../assets/fonts/Montserrat-Regular.ttf"),
    "Montserrat-Bold": require("../../assets/fonts/Montserrat-Bold.ttf"),
    "Montserrat-SemiBold": require("../../assets/fonts/Montserrat-SemiBold.ttf"),
  });

  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ username: "", password: "" });
  const { user, status, error } = useSelector((state: RootState) => state.user);
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const handleChange = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!form.username || !form.password) return; // guard clause
    dispatch(loginUser(form));
  };

  // redirect if user is logged in
  useEffect(() => {
    if (status === "succeeded" && user?.role === "NormalUser") {
      router.replace("/(tabs)");
    } else if (status === "succeeded" && user?.role === "AdminUser") {
      router.replace("/(admin)/dashboard");
    }
  }, [status, user, router]);

  return (
    <KeyboardAwareScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ flexGrow: 1 }}
      enableOnAndroid={true}
      extraScrollHeight={10}
      keyboardShouldPersistTaps="handled"
    >
      <View className="flex-1 items-center justify-center bg-white p-8">
        {/* Image */}
        <View className="w-32 h-32 justify-center items-center mb-6">
          <Image
            source={require("../../assets/images/login.png")}
            className="w-72 h-72"
            resizeMode="contain"
          />
        </View>

        {/* Title */}
        <Text className="text-3xl font-montserratBold text-text-primary mb-2">
          Sign In
        </Text>
        <Text className="text-sm text-text-secondary text-center mb-8 font-montserrat">
          Enter valid username and password to continue
        </Text>

        {/* Username Input */}
        <View className="w-full mb-4">
          <View className="flex-row items-center bg-background rounded-xl px-4 py-2 border border-[#E5E7EB]">
            <AntDesign name="user" size={24} color="#6B7280" />
            <TextInput
              value={form.username}
              onChangeText={(text) => handleChange("username", text)}
              placeholder="Username"
              placeholderTextColor="#9CA3AF"
              className="flex-1 text-base text-[#1F2937] font-montserrat ml-2"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Password Input */}
        <View className="w-full mb-4">
          <View className="flex-row items-center bg-[#F9FAFB] rounded-xl px-4 py-2 border border-[#E5E7EB]">
            <AntDesign name="lock" size={24} color="#6B7280" />
            <TextInput
              value={form.password}
              onChangeText={(text) => handleChange("password", text)}
              placeholder="Password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!showPassword}
              className="flex-1 text-base text-[#1F2937] font-montserrat ml-2"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? "eye" : "eye-off"}
                size={22}
                color="#6B7280"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Login Button
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={status === "loading"}
          className={`w-full rounded-full py-4 items-center mb-6 ${
            status === "loading"
              ? "bg-disabled"
              : "bg-primary-main active:bg-primary-dark"
          }`}
        >
          {status === "loading" ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-center text-white font-montserratBold tracking-widest">
              Login
            </Text>
          )}
        </TouchableOpacity> */}
        {/* Login Button */}
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
              Login
            </Text>
          )}
        </TouchableOpacity>

        {/* Create Account */}
        <View className="mt-4 flex-row items-center">
          <Text className="text-sm text-text-secondary font-montserrat">
            Haven&apos;t Any Account?
          </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
            <Text className="text-primary-main text-sm font-montserratSemiBold ml-2">
              Create Account
            </Text>
          </TouchableOpacity>
        </View>

        {/* Error */}
        {status === "failed" && error && (
          <Text className="text-[#EF4444] text-sm text-center mt-4 font-montserrat">
            {error}
          </Text>
        )}
      </View>
    </KeyboardAwareScrollView>
  );
}

// import { loginUser } from "@/lib/Slices/userSlice";
// import AntDesign from '@expo/vector-icons/AntDesign';
// import { useFonts } from "expo-font";
// import { useRouter } from "expo-router";
// import { useEffect, useState } from "react";
// import {
//   ActivityIndicator,
//   Image,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View
// } from "react-native";
// import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
// import { useDispatch, useSelector } from "react-redux";
// import type { AppDispatch, RootState } from "../../store/store";

// export default function Login() {
//   const [fontsLoaded] = useFonts({
//       "Montserrat": require("../../assets/fonts/Montserrat-Regular.ttf"),
//       "Montserrat-Bold":require("../../assets/fonts/Montserrat-Bold.ttf"),
//       "Montserrat-SemiBold":require("../../assets/fonts/Montserrat-SemiBold.ttf")
//     });
//   const [form, setForm] = useState({ username: "", password: "" });
//   const { user, status, error } = useSelector((state: RootState) => state.user);
//   const router = useRouter();
//   const dispatch = useDispatch<AppDispatch>();

//   const handleChange = (name: string, value: string) => {
//     setForm((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = () => {
//     if (!form.username || !form.password) return; // guard clause
//     dispatch(loginUser(form));
//   };

//   // redirect if user is logged in
//   useEffect(() => {
//     if (status === "succeeded" && user) {
//       router.replace("/(tabs)"); // go to main app
//     }
//   }, [status, user, router]);

//   return (
//     <KeyboardAwareScrollView
//       className="flex-1 bg-gray-100"
//       contentContainerStyle={{ flexGrow: 1 }}
//       enableOnAndroid={true}
//       extraScrollHeight={10}   // push inputs above keyboard
//       keyboardShouldPersistTaps="handled"
//     >
//     <View className="flex-1 items-center justify-center bg-white p-8 ">
//         {/* Image */}
//         <View className="w-32 h-32 justify-center items-center mb-6">
//           <Image
//             source={require("../../assets/images/login.png")}
//             className="w-72 h-72"
//             resizeMode="contain"
//           />
//         </View>

//         {/* Title */}
//         <Text className="text-3xl font-montserratBold text-gray-800 mb-2"> Sign In</Text>
//         <Text className="text-sm text-gray-400 text-center mb-8 font-montserrat"> Enter valid username and password to continue</Text>

//         {/* Username Input */}
//         <View className="w-full mb-4">
//           <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-2 border border-gray-200">
//             <AntDesign name="user" size={24} color="black" className="mr-3"/>
//             {/* <Text className="mr-3 text-base">👤</Text> */}
//             <TextInput
//               value={form.username}
//               onChangeText={(text) => handleChange("username", text)}
//               placeholder="Username"
//               placeholderTextColor="#9CA3AF"
//               className="flex-1 text-base text-gray-800 font-montserrat"
//               autoCapitalize="none"
//             />
//           </View>
//         </View>

//         {/* Password Input */}
//         <View className="w-full mb-4">
//           <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-2 border border-gray-200">
//             <AntDesign name="lock" size={24} color="black" className="mr-3"/>
//             <TextInput
//               value={form.password}
//               onChangeText={(text) => handleChange("password", text)}
//               placeholder="Password"
//               placeholderTextColor="#9CA3AF"
//               secureTextEntry
//               className="flex-1 text-base text-gray-800 font-montserrat"
//             />
//           </View>
//         </View>

//         {/* Login Button */}
//         <TouchableOpacity
//           onPress={handleSubmit}
//           disabled={status === "loading"}
//           className={`w-full rounded-full py-4 items-center mb-6 ${
//             status === "loading"
//               ? "bg-gray-400"
//               : "bg-blue-500 active:bg-blue-800"
//           }`}
//         >
//           {status === "loading" ? (
//             <ActivityIndicator color="#fff" />
//           ) : (
//             <Text className="text-center text-white font-montserratBold tracking-widest">
//               Login
//             </Text>
//           )}
//         </TouchableOpacity>

//         <View className="mt-4 flex-row items-center">
//           <Text className="text-sm text-gray-400 font-montserrat">Haven&apos;t Any Account?</Text>
//           <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
//             <Text className="text-blue-500 text-sm font-montserratSemiBold ml-2">
//               Create Account
//             </Text>
//           </TouchableOpacity>
//         </View>

//         {/* Error */}
//         {status === "failed" && error && (
//           <Text className="text-red-500 text-sm text-center mt-4 font-medium">
//             {error}
//           </Text>
//         )}

//     </View>
//     </KeyboardAwareScrollView>
//   );
// }
