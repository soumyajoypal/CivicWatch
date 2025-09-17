// import apiRequest from "@/lib/utils/apiRequest";
// import { Ionicons } from "@expo/vector-icons";
// import { router } from "expo-router";
// import * as SecureStore from "expo-secure-store";
// import React, { useContext, useEffect, useState } from "react";
// import {
//   ActivityIndicator,
//   ScrollView,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import { ThemeContext, colors } from "../context/ThemeContext";

// // Badge metadata (unchanged)
// const BADGE_METADATA: Record<
//   string,
//   {
//     icon: keyof typeof Ionicons.glyphMap;
//     description: string;
//     color: string;
//     iconColor: string;
//   }
// > = {
//   "Rookie Reporter": {
//     icon: "person-add-outline",
//     description: "Submitted your first report!",
//     color: "#FBBF24",
//     iconColor: "#D97706",
//   },
//   "Persistent Eye": {
//     icon: "eye-outline",
//     description: "Submitted 5 reports!",
//     color: "#34D399",
//     iconColor: "#047857",
//   },
//   "Community Favorite": {
//     icon: "thumbs-up-outline",
//     description: "One of your reports got 10+ upvotes!",
//     color: "#60A5FA",
//     iconColor: "#1E40AF",
//   },
//   "Zone Expert": {
//     icon: "location-outline",
//     description: "Reported in 3 different zones.",
//     color: "#F472B6",
//     iconColor: "#9D174D",
//   },
//   "AI Challenger": {
//     icon: "hardware-chip-outline",
//     description: "Correctly overrode AI verdict 3 times.",
//     color: "#A78BFA",
//     iconColor: "#4C1D95",
//   },
//   "Social Critic": {
//     icon: "chatbubbles-outline",
//     description: "Commented on 5 reports.",
//     color: "#F87171",
//     iconColor: "#B91C1C",
//   },
// };

// type BadgeItem = { name: string; dateEarned: string };

// const BadgePage = () => {
//   const { currentTheme } = useContext(ThemeContext);
//   const themeColors = colors[currentTheme as keyof typeof colors];

//   const [badges, setBadges] = useState<BadgeItem[]>([]);
//   const [status, setStatus] = useState<
//     "idle" | "loading" | "succeeded" | "failed"
//   >("idle");
//   const [error, setError] = useState<string | null>(null);

//   // Fetch badges from API
//   useEffect(() => {
//     const fetchBadges = async () => {
//       try {
//         setStatus("loading");
//         setError(null);

//         const response = await apiRequest.get("/user/badges", {
//           headers: {
//             Authorization: `Bearer ${await SecureStore.getItemAsync("authToken")}`,
//           },
//         });

//         if (!response) throw new Error("Failed to fetch badges");

//         const data: BadgeItem[] = response.data.data;
//         setBadges(data);
//         setStatus("succeeded");
//       } catch (err: any) {
//         console.error(err);
//         setError(err.message || "Something went wrong");
//         setStatus("failed");
//       }
//     };

//     fetchBadges();
//   }, []);

//   if (status === "loading") {
//     return (
//       <View
//         style={{
//           flex: 1,
//           justifyContent: "center",
//           alignItems: "center",
//           backgroundColor: themeColors.background,
//         }}
//       >
//         <ActivityIndicator size="large" color={themeColors.accent} />
//         <Text style={{ color: themeColors.textSecondary, marginTop: 12 }}>
//           Loading badges...
//         </Text>
//       </View>
//     );
//   }

//   if (status === "failed" || error) {
//     return (
//       <View
//         style={{
//           flex: 1,
//           justifyContent: "center",
//           alignItems: "center",
//           backgroundColor: themeColors.background,
//           paddingHorizontal: 24,
//         }}
//       >
//         <Text
//           style={{
//             color: "#EF4444",
//             fontSize: 18,
//             fontWeight: "bold",
//             textAlign: "center",
//           }}
//         >
//           {error}
//         </Text>
//         <TouchableOpacity
//           style={{
//             marginTop: 16,
//             backgroundColor: themeColors.accent,
//             paddingHorizontal: 20,
//             paddingVertical: 12,
//             borderRadius: 24,
//           }}
//           onPress={() => setStatus("idle")} // retry triggers fetch again
//         >
//           <Text style={{ color: "#FFFFFF", fontWeight: "bold" }}>Retry</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   return (
//     <View
//       style={{
//         flex: 1,
//         backgroundColor: themeColors.background,
//         paddingTop: 16,
//         paddingHorizontal: 16,
//       }}
//     >
//       {/* Header */}
//       <View className="mb-6">
//         <TouchableOpacity
//           onPress={() => router.push("/(tabs)/profile")}
//           className="absolute left-0 top-0 p-2"
//         >
//           <Ionicons name="chevron-back" size={24} color="#6c4fe0ff" />
//         </TouchableOpacity>
//         <Text className="text-3xl font-montserratBold tracking-wide text-primary-main ml-10">
//           My Badges
//         </Text>
//         <Text className="mt-1 text-base text-gray-400 font-montserrat ml-10">
//           Earned by your contributions in reporting
//         </Text>
//       </View>

//       <ScrollView className="mx-4" showsVerticalScrollIndicator={false}>
//         {badges.map((badge, idx) => {
//           const meta = BADGE_METADATA[badge.name];
//           if (!meta) return null;

//           return (
//             <View
//               key={idx}
//               className="flex-row items-center bg-white rounded-2xl px-4 py-3 mb-3 shadow-sm"
//               style={{
//                 shadowColor: "#000",
//                 shadowOpacity: 0.04,
//                 shadowRadius: 4,
//                 shadowOffset: { width: 0, height: 2 },
//               }}
//             >
//               <View
//                 className="w-12 h-12 rounded-full items-center justify-center mr-3"
//                 style={{ backgroundColor: `${meta.color}20` }}
//               >
//                 <Ionicons name={meta.icon} size={24} color={meta.iconColor} />
//               </View>
//               <View className="flex-1">
//                 <Text
//                   className="font-semibold text-base"
//                   style={{ fontFamily: "Montserrat-Bold", color: meta.color }}
//                 >
//                   {badge.name}
//                 </Text>
//                 <Text
//                   className="text-xs mt-0.5"
//                   style={{ fontFamily: "Montserrat", color: "#6B7280" }}
//                 >
//                   {meta.description}
//                 </Text>
//               </View>
//               <Text
//                 className="text-xs"
//                 style={{ fontFamily: "Montserrat", color: "#9CA3AF" }}
//               >
//                 {new Date(badge.dateEarned).toLocaleDateString("en-GB", {
//                   day: "2-digit",
//                   month: "short",
//                 })}
//               </Text>
//             </View>
//           );
//         })}
//       </ScrollView>
//     </View>
//   );
// };

// export default BadgePage;

import apiRequest from "@/lib/utils/apiRequest";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import LottieView from "lottie-react-native";
import React, { useContext, useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { ThemeContext, colors } from "../context/ThemeContext";

// Badge metadata (unchanged)
const BADGE_METADATA: Record<
  string,
  {
    icon: keyof typeof Ionicons.glyphMap;
    description: string;
    color: string;
    iconColor: string;
  }
> = {
  "Rookie Reporter": {
    icon: "mic",
    description: "Submitted your first report!",
    color: "#FBBF24",
    iconColor: "#D97706",
  },
  "Persistent Eye": {
    icon: "eye-outline",
    description: "Submitted 5 reports!",
    color: "#34D399",
    iconColor: "#047857",
  },
  "Community Favorite": {
    icon: "thumbs-up-outline",
    description: "One of your reports got 10+ upvotes!",
    color: "#60A5FA",
    iconColor: "#1E40AF",
  },
  "Zone Expert": {
    icon: "location-outline",
    description: "Reported in 3 different zones.",
    color: "#F472B6",
    iconColor: "#9D174D",
  },
  "AI Challenger": {
    icon: "hardware-chip-outline",
    description: "Correctly overrode AI verdict 3 times.",
    color: "#A78BFA",
    iconColor: "#4C1D95",
  },
  "Social Critic": {
    icon: "chatbubbles-outline",
    description: "Commented on 5 reports.",
    color: "#F87171",
    iconColor: "#B91C1C",
  },
};

type BadgeItem = { name: string; dateEarned: string };

const BadgePage = () => {
  const { currentTheme } = useContext(ThemeContext);
  const themeColors = colors[currentTheme as keyof typeof colors];

  const [badges, setBadges] = useState<BadgeItem[]>([]);
  const [status, setStatus] = useState<
    "idle" | "loading" | "succeeded" | "failed"
  >("idle");
  const [error, setError] = useState<string | null>(null);

  // Fetch badges from API
  useEffect(() => {
    const fetchBadges = async () => {
      try {
        setStatus("loading");
        setError(null);

        const response = await apiRequest.get("/user/badges", {
          headers: {
            Authorization: `Bearer ${await SecureStore.getItemAsync(
              "authToken"
            )}`,
          },
        });

        if (!response) throw new Error("Failed to fetch badges");

        const data: BadgeItem[] = response.data.data;
        setBadges(data);
        setStatus("succeeded");
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Something went wrong");
        setStatus("failed");
      }
    };

    fetchBadges();
  }, []);

  if (status === "loading") {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <LottieView
          source={require("../../assets/animations/loader2.json")}
          autoPlay
          loop
          style={{ width: 160, height: 160 }}
        />
      </View>
    );
  }

  if (status === "failed" || error) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: themeColors.background,
          paddingHorizontal: 24,
        }}
      >
        <Text
          style={{
            color: "#EF4444",
            fontSize: 18,
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          {error}
        </Text>
        <TouchableOpacity
          style={{
            marginTop: 16,
            backgroundColor: themeColors.accent,
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderRadius: 24,
          }}
          onPress={() => setStatus("idle")} // retry triggers fetch again
        >
          <Text style={{ color: "#FFFFFF", fontWeight: "bold" }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Build a quick lookup of earned badges (by name)
  const earnedSet = new Set(badges.map((b) => b.name));

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: themeColors.background,
        paddingTop: 16,
        paddingHorizontal: 16,
      }}
    >
      {/* Header */}
      <View className="mb-6">
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/profile")}
          className="absolute left-0 top-0 p-2"
        >
          <Ionicons name="chevron-back" size={24} color="#6c4fe0ff" />
        </TouchableOpacity>
        <Text className="text-3xl font-montserratBold tracking-wide text-primary-main ml-10">
          My Badges
        </Text>
        <Text className="mt-1 text-base text-gray-400 font-montserrat ml-10">
          Earned by your contributions in reporting
        </Text>
      </View>

      {/* Grid: two items per row, squarish cards */}
      <ScrollView
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row flex-wrap gap-2">
          {Object.entries(BADGE_METADATA).map(([name, meta], idx) => {
            const earned = earnedSet.has(name);
            // Find earned item for date display if available
            const earnedItem = badges.find((b) => b.name === name);

            return (
              <View key={name} style={{ width: "48%" }} className="px-2 mb-3">
                <View
                  // square card: using aspectRatio to ensure squarish
                  style={{
                    aspectRatio: 1,
                    borderRadius: 14,
                    overflow: "hidden",
                    backgroundColor: earned ? "#FFFFFF" : "#F3F4F6",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: 12,
                    position: "relative",
                  }}
                  className="shadow-md"
                >
                  {/* Colored circle with icon */}
                  <View
                    className="w-16 h-16 rounded-full items-center justify-center mb-3"
                    style={{
                      backgroundColor: earned
                        ? `${meta.color}20`
                        : "rgba(107,114,128,0.12)",
                    }}
                  >
                    <Ionicons
                      name={meta.icon}
                      size={26}
                      color={earned ? meta.iconColor : "#9CA3AF"}
                    />
                  </View>

                  <Text
                    className="text-sm font-semibold text-center px-1"
                    style={{
                      fontFamily: "Montserrat-Bold",
                      color: earned ? meta.color : "#6B7280",
                    }}
                  >
                    {name}
                  </Text>

                  <Text
                    className="text-xs mt-1 text-center"
                    style={{
                      fontFamily: "Montserrat",
                      color: "#9CA3AF",
                    }}
                  >
                    {meta.description}
                  </Text>

                  {/* Date (only when earned) */}
                  {earned && earnedItem ? (
                    <Text
                      className="text-xs mt-2"
                      style={{ fontFamily: "Montserrat", color: "#9CA3AF" }}
                    >
                      {new Date(earnedItem.dateEarned).toLocaleDateString(
                        "en-GB",
                        {
                          day: "2-digit",
                          month: "short",
                        }
                      )}
                    </Text>
                  ) : null}

                  {/* Lock overlay for unearned */}
                  {!earned ? (
                    <View
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        backgroundColor: "rgba(0,0,0,0.06)",
                        padding: 6,
                        borderRadius: 999,
                      }}
                    >
                      <Ionicons name="lock-closed" size={16} color="#6B7280" />
                    </View>
                  ) : null}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

export default BadgePage;
