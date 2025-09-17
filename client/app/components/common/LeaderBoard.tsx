// import { getLeaderBoard } from "@/lib/Slices/leaderBoardSlice";
// import { AppDispatch } from "@/store/store";
// import { Ionicons } from "@expo/vector-icons";
// import { useNavigation } from "@react-navigation/native";
// import React, { useEffect } from "react";
// import {
//   ActivityIndicator,
//   ScrollView,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { useDispatch, useSelector } from "react-redux";
// import LeaderboardItem from "../../components/leaderBoard/LeaderBoardItem";

// const LeaderBoardPage = () => {
//   const navigation = useNavigation<any>();
//   const dispatch = useDispatch<AppDispatch>();

//   const { status, data, error } = useSelector(
//     (state: any) => state.leaderBoard
//   );

//   useEffect(() => {
//     console.log("Leaderboard fetched");

//     dispatch(getLeaderBoard());
//   }, [dispatch]);

//   if (status === "loading") {
//     return (
//       <View className="flex-1 items-center justify-center bg-background">
//         <ActivityIndicator size="large" color="#6c4fe0ff" />
//       </View>
//     );
//   }

//   if (error) {
//     return (
//       <View className="flex-1 items-center justify-center bg-background">
//         <Text className="font-montserratBold text-2xl text-error">{error}</Text>
//       </View>
//     );
//   }

//   return (
//     <View className="flex-1 bg-background">
//       {/* header */}
//       <View className="flex-row items-center px-5 pt-5 pb-3 border-b border-border bg-surface">
//         <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
//           <Ionicons name="arrow-back-outline" size={24} color={"#1F2937"} />
//         </TouchableOpacity>
//         <Text className="font-montserratBold text-xl text-primary-main">
//           Leaderboard
//         </Text>
//       </View>
//       {/* Container */}
//       <SafeAreaView edges={["bottom"]} style={{ flex: 1 }}>
//         <View className="bg-background p-4 mx-4 mb-4">
//           {/* List */}
//           <ScrollView showsVerticalScrollIndicator={false} className="mt-4">
//             {data?.map((item: any, index: number) => (
//               <LeaderboardItem
//                 key={item?._id || index}
//                 item={item}
//                 rank={index + 1}
//               />
//             ))}
//           </ScrollView>
//         </View>
//       </SafeAreaView>
//     </View>
//   );
// };

// export default LeaderBoardPage;

// LeaderBoardPage.tsx
import { getLeaderBoard } from "@/lib/Slices/leaderBoardSlice";
import { AppDispatch } from "@/store/store";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useFonts } from "expo-font";
import LottieView from "lottie-react-native";
import React, { useEffect } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import LeaderboardItem from "../../components/leaderBoard/LeaderBoardItem";

const PURPLE = "#6C4FE0";
const PURPLE_LIGHT = "#A78BFA";

const LeaderBoardPage = () => {
  const [fontsLoaded] = useFonts({
    Montserrat: require("../../../assets/fonts/Montserrat-Regular.ttf"),
    "Montserrat-Bold": require("../../../assets/fonts/Montserrat-Bold.ttf"),
    "Montserrat-SemiBold": require("../../../assets/fonts/Montserrat-SemiBold.ttf"),
  });
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();

  const { status, data, error } = useSelector(
    (state: any) => state.leaderBoard
  );

  useEffect(() => {
    dispatch(getLeaderBoard());
  }, [dispatch]);

  if (status === "loading") {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <LottieView
          source={require("../../../assets/animations/loader2.json")}
          autoPlay
          loop
          style={{ width: 160, height: 160 }}
        />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="font-montserratBold text-2xl text-error">{error}</Text>
      </View>
    );
  }

  // prepare top 3 and remaining list
  const list = Array.isArray(data) ? data : [];
  const top3 = list.slice(0, 3);
  const rest = list.slice(3);

  // helper to pick a numeric value to show as "points"
  const getPoints = (item: any) =>
    item?.points ??
    item?.xp ?? // <-- prefer xp if backend returns xp
    item?.amount ??
    item?.score ??
    item?.value ??
    0;

  return (
    <View className="flex-1 bg-background">
      {/* header */}
      <View className="flex-row items-center px-5 pt-5 pb-3 border-b border-border bg-surface">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
          <Ionicons name="arrow-back-outline" size={24} color={"#1F2937"} />
        </TouchableOpacity>
        <Text className="font-montserratBold text-xl" style={{ color: PURPLE }}>
          Leaderboard
        </Text>
      </View>

      {/* Top cards (top 3) */}
      <SafeAreaView edges={["bottom"]} style={{ flex: 1 }}>
        {/* TOP-3 — Tailwind version (uses className) */}
        <View className="px-4 pt-4 pb-2 items-center">
          <View
            className="w-full flex-row justify-center items-end"
            style={{ gap: 8 }}
          >
            {(() => {
              return (
                <>
                  {/* THIRD PLACE (left) */}
                  <View className="items-center">
                    {top3[2] && (
                      <>
                        {/* Avatar */}
                        <View className="w-[60px] h-[60px] rounded-full border-4 overflow-hidden bg-white mb-2 border-[#A78BFA]">
                          <Image
                            source={{ uri: top3[2].avatar || top3[2].imageURL }}
                            className="w-full h-full"
                          />
                        </View>

                        {/* Card */}
                        <View className="w-[100px] h-[120px] rounded-[20px] items-center justify-center py-4 shadow-md elevation-3 border border-[#A78BFA] bg-[#A78BFA]">
                          <Text className="text-[14px] font-[Montserrat-Bold] text-white mb-1">
                            {top3[2].name ?? top3[2].username}
                          </Text>
                          <View className="relative mb-2">
                            <Ionicons name="trophy" size={44} color="#CD7F32" />
                            <Text className="absolute inset-1 text-center text-[16px] font-montserratBold text-white">
                              3
                            </Text>
                          </View>

                          <View className="bg-white rounded-[15px] px-3 py-1">
                            <Text className="text-[#A78BFA] font-montserratSemiBold text-[12px]">
                              {getPoints(top3[2])} pts
                            </Text>
                          </View>
                        </View>
                      </>
                    )}
                  </View>

                  {/* FIRST PLACE (center) */}
                  <View className="items-center mx-1.5 z-10">
                    {top3[0] && (
                      <>
                        {/* Avatar */}
                        <View className="w-[70px] h-[70px] rounded-full border-4 overflow-hidden bg-white mb-2 border-[#4C1D95]">
                          <Image
                            source={{ uri: top3[0].avatar || top3[0].imageURL }}
                            className="w-full h-full"
                          />
                        </View>

                        {/* Card */}
                        <View className="w-[120px] h-[160px] rounded-[24px] items-center justify-center py-5 shadow-lg elevation-6 border border-[#4C1D95] bg-[#4C1D95]">
                          <Text className="text-[16px] font-[Montserrat-Bold] text-white mb-2">
                            {top3[0].name ?? top3[0].username}
                          </Text>
                          <View className="relative mb-3">
                            <Ionicons
                              name="trophy"
                              size={56}
                              color="#ffbb00ff"
                            />
                            <Text className="absolute inset-1 text-center text-[20px] font-montserratBold text-white">
                              1
                            </Text>
                          </View>

                          <View className="bg-white rounded-[18px] px-4 py-2">
                            <Text className="text-[#6C4FE0] font-montserratSemiBold text-[14px]">
                              {getPoints(top3[0])} pts
                            </Text>
                          </View>
                        </View>
                      </>
                    )}
                  </View>

                  {/* SECOND PLACE (right) */}
                  <View className="items-center">
                    {top3[1] && (
                      <>
                        {/* Avatar */}
                        <View className="w-[60px] h-[60px] rounded-full border-4 overflow-hidden bg-white mb-2 border-[#6c4fe0ff]">
                          <Image
                            source={{ uri: top3[1].avatar || top3[1].imageURL }}
                            className="w-full h-full"
                          />
                        </View>

                        {/* Card */}
                        <View className="w-[100px] h-[140px] rounded-[20px] items-center justify-center py-4 shadow-md elevation-4 border border-[#6c4fe0ff] bg-[#6c4fe0ff]">
                          <Text className="text-[14px] font-[Montserrat-Bold] text-white mb-1">
                            {top3[1].name ?? top3[1].username}
                          </Text>
                          <View className="relative mb-2">
                            <Ionicons
                              name="trophy"
                              size={48}
                              color="#9a9a9aff"
                            />
                            <Text className="absolute inset-1 text-center text-[20px] font-montserratBold text-white">
                              2
                            </Text>
                          </View>

                          <View className="bg-white rounded-[15px] px-3 py-1">
                            <Text className="text-[#6c4fe0ff] font-montserratSemiBold text-[12px]">
                              {getPoints(top3[1])} pts
                            </Text>
                          </View>
                        </View>
                      </>
                    )}
                  </View>
                </>
              );
            })()}
          </View>
        </View>

        {/* List of remaining leaderboard items */}
        <View className="bg-background px-4 mb-4 rounded-xl mt-3">
          <ScrollView showsVerticalScrollIndicator={false} className="mt-1">
            {rest.length === 0 && list.length === 0 ? (
              <Text className="text-center text-text-secondary">
                No leaderboard data.
              </Text>
            ) : (
              <>
                {rest.map((item: any, index: number) => (
                  <LeaderboardItem
                    key={item?._id || index}
                    item={item}
                    rank={index + 4} // because top 3 are shown above
                    // pass displayValue in case child component can use it
                    displayValue={`${getPoints(item)} pts`}
                    unit="pts"
                  />
                ))}
              </>
            )}
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default LeaderBoardPage;
