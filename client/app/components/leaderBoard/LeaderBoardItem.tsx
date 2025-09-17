// import { Ionicons } from "@expo/vector-icons";
// import React from "react";
// import { Image, Text, View } from "react-native";

// interface LeaderboardItemProps {
//   item: {
//     avatar: string;
//     username: string;
//     xp: number;
//   };
//   rank: number;
// }

// const LeaderboardItem: React.FC<LeaderboardItemProps> = ({ item, rank }) => {
//   const getRankColor = (rank: number) => {
//     if (rank === 1) return "#FBBF24"; // Gold
//     if (rank === 2) return "#D1D5DB"; // Silver
//     if (rank === 3) return "#CD7F32"; // Bronze
//     return "#4B5563"; // Dark Gray
//   };

//   return (
//     <View className="flex-row items-center p-3 mb-3 rounded-2xl bg-primary-main/5 border border-border">
//       {/* Rank */}
//       <Text
//         className="w-9 text-center text-sm font-montserratBold"
//         style={{ color: getRankColor(rank) }}
//       >
//         #{rank}
//       </Text>

//       {/* Avatar */}
//       <Image
//         source={{ uri: item.avatar }}
//         className="w-12 h-12 mx-3 rounded-full border-2"
//         style={{ borderColor: getRankColor(rank) }}
//       />

//       {/* Main Content */}
//       <View className="flex-1 flex-col">
//         {/* Username + Score */}
//         <View className="flex-row items-center justify-between">
//           <Text
//             className="font-montserratBold text-text-primary text-[15px]"
//             numberOfLines={1}
//           >
//             {item.username}
//           </Text>

//           <View className="px-3 py-1 rounded-full bg-primary-main/20">
//             <Text className="font-montserratBold text-[13px] text-primary-dark">
//               {item.xp} pts
//             </Text>
//           </View>
//         </View>

//         {/* Level info */}
//         <View className="flex-row items-center mt-1">
//           <Ionicons
//             name="medal-outline"
//             size={14}
//             color={getRankColor(rank)}
//             style={{ marginRight: 4 }}
//           />
//           <Text className="font-montserrat text-xs text-text-secondary">
//             Level 1
//           </Text>
//         </View>
//       </View>
//     </View>
//   );
// };

// export default LeaderboardItem;

import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Text, View } from "react-native";

interface LeaderboardItemProps {
  item: {
    avatar: string;
    username: string;
    xp: number;
  };
  rank: number;
  // optional props so parent can override the displayed value/unit
  displayValue?: string;
  unit?: string;
}

const LeaderboardItem: React.FC<LeaderboardItemProps> = ({
  item,
  rank,
  displayValue,
  unit,
}) => {
  const getRankColor = (rank: number) => {
    if (rank === 1) return "#FBBF24"; // Gold
    if (rank === 2) return "#D1D5DB"; // Silver
    if (rank === 3) return "#CD7F32"; // Bronze
    return "#4B5563"; // Dark Gray
  };

  // Prefer displayValue from parent, otherwise use item.xp + unit (or default "pts")
  const valueToShow = displayValue ?? `${item.xp} ${unit ?? "pts"}`;

  return (
    <View className="flex-row items-center p-3 mb-3 rounded-2xl bg-primary-main/5 border border-border">
      {/* Rank */}
      <Text
        className="w-9 text-center text-sm font-montserratBold"
        style={{ color: getRankColor(rank) }}
      >
        #{rank}
      </Text>

      {/* Avatar */}
      <Image
        source={{ uri: item.avatar }}
        className="w-12 h-12 mx-3 rounded-full border-2"
        style={{ borderColor: getRankColor(rank) }}
      />

      {/* Main Content */}
      <View className="flex-1 flex-col">
        {/* Username + Score */}
        <View className="flex-row items-center justify-between">
          <Text
            className="font-montserratBold text-text-primary text-[15px]"
            numberOfLines={1}
          >
            {item.username}
          </Text>

          <View className="px-3 py-1 rounded-full bg-primary-main/20">
            <Text className="font-montserratBold text-[13px] text-primary-dark">
              {valueToShow}
            </Text>
          </View>
        </View>

        {/* Level info */}
        <View className="flex-row items-center mt-1">
          <Ionicons
            name="medal-outline"
            size={14}
            color={getRankColor(rank)}
            style={{ marginRight: 4 }}
          />
          <Text className="font-montserrat text-xs text-text-secondary">
            Level 1
          </Text>
        </View>
      </View>
    </View>
  );
};

export default LeaderboardItem;
