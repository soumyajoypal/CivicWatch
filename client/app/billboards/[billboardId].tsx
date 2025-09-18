import { fetchCivicIssue, voteReport } from "@/lib/Slices/civicIssueSlice";
import { AppDispatch, RootState } from "@/store/store";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import { ScrollView } from "moti";
import { useEffect } from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";

const BillBoardDetails = () => {
  const { billboardId } = useLocalSearchParams();
  const { status, error, selected } = useSelector(
    (state: RootState) => state.civicIssue
  );
  const { user } = useSelector((state: RootState) => state.user);
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  // helper
  const statusKey = (selected?.verifiedStatus || "").toLowerCase();
  const statusStyles =
    statusKey === "pending"
      ? { bg: "#FEF3C7", border: "#F59E0B", text: "#B45309" }
      : statusKey === "rejected"
        ? { bg: "#FEE2E2", border: "#EF4444", text: "#B91C1C" }
        : { bg: "#DCFCE7", border: "#16A34A", text: "#166534" };

  const handleVote = (reportId: string, voteType: "upvote" | "downvote") => {
    if (user?.role !== "NormalUser") return;
    dispatch(voteReport({ reportId, voteType }));
  };

  useEffect(() => {
    dispatch(fetchCivicIssue(billboardId as string));
  }, [billboardId]);

  const renderReportItem = ({ item, index }: { item: any; index: number }) => {
    const status = (item?.status || "").toLowerCase();
    const statusStyles =
      status === "pending"
        ? { bg: "#FEF3C7", border: "#F59E0B", text: "#B45309" }
        : status === "rejected"
          ? { bg: "#FEE2E2", border: "#EF4444", text: "#B91C1C" }
          : { bg: "#DCFCE7", border: "#16A34A", text: "#166534" };

    const verdictType = item.aiAnalysis?.verdict || "UNSURE";
    const verdictText = verdictType.toUpperCase();

    const confidence =
      typeof item.aiAnalysis?.confidence === "number"
        ? (item.aiAnalysis.confidence * 100).toFixed(2)
        : null;
    const communityTrustScore =
      typeof item.communityTrustScore === "number"
        ? (item.communityTrustScore * 10).toFixed(2)
        : 0;
    const thumb = item.annotatedURL || item.imageURL;
    const isUp = item.userVote === "upvote";
    const isDown = item.userVote === "downvote";

    return (
      <View
        key={item._id}
        className="mb-4 mx-2 rounded-2xl bg-white overflow-hidden shadow-md"
        style={{
          borderWidth: 1,
          borderColor: "#EDEFF3",
          shadowColor: "#000",
          shadowOpacity: 0.04,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
        }}
      >
        {/* Top: billboard image */}
        {thumb ? (
          <Image
            source={{ uri: thumb }}
            className="w-full h-40"
            style={{ borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
            resizeMode="cover"
          />
        ) : (
          <View
            className="w-full h-40 bg-gray-100"
            style={{ borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
          />
        )}

        {index === 0 && user?.role === "AdminUser" && (
          <View className="absolute top-3 left-3 bg-yellow-400 px-2 py-1 rounded-full">
            <Text className="text-xs font-montserratBold text-gray-800">
              ⭐ Most Upvoted
            </Text>
          </View>
        )}

        {/* Body */}
        <View className="p-4">
          {/* Issues pills */}
          <View className="flex-row flex-wrap items-center gap-2 mb-3">
            {item.aiAnalysis?.detectedObjects?.length ? (
              item.aiAnalysis.detectedObjects.map(
                (issue: string, idx: number) => {
                  const formatted = issue
                    .replace(/_/g, " ")
                    .toLowerCase()
                    .replace(/^\w/, (c) => c.toUpperCase());
                  return (
                    <View
                      key={`${item._id}-issue-${idx}`}
                      className="rounded-full px-3 py-1"
                      style={{ backgroundColor: "#A78BFA" }}
                    >
                      <Text className="text-xs font-montserrat text-white">
                        {formatted}
                      </Text>
                    </View>
                  );
                }
              )
            ) : (
              <View
                className="rounded-full px-3 py-1 bg-gray-100"
                style={{ borderWidth: 1, borderColor: "#F1F5F9" }}
              >
                <Text className="text-xs font-montserrat text-gray-500">
                  No issues
                </Text>
              </View>
            )}
          </View>

          {/* Verdict */}
          <Text className="text-lg font-montserratBold text-gray-900 mb-2">
            {verdictText === "ACTION_REQUIRED"
              ? "Action Required"
              : verdictText === "ACTION_NOT_REQUIRED"
                ? "No Action Required"
                : "Unsure"}
          </Text>

          {/* AI Confidence & Community Trust */}
          <View className="mb-3">
            <View className="flex-row items-center mb-1">
              <Ionicons
                name="speedometer-outline"
                size={16}
                color="#6B7280"
                style={{ marginRight: 6 }}
              />
              <Text className="text-sm font-montserrat text-gray-600">
                AI Confidence:{" "}
                <Text className="font-montserratBold text-gray-800">
                  {confidence !== null ? `${confidence}%` : "N/A"}
                </Text>
              </Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons
                name="people-outline"
                size={16}
                color="#6B7280"
                style={{ marginRight: 6 }}
              />
              <Text className="text-sm font-montserrat text-gray-600">
                Community Trust Score:{" "}
                <Text className="font-montserratBold text-gray-800">
                  {communityTrustScore ?? "0.00"}
                </Text>
              </Text>
            </View>
          </View>

          {/* Status pill */}
          <View
            className="self-start rounded-lg px-2 py-0.5 mb-3"
            style={{
              backgroundColor: statusStyles.bg,
              borderColor: statusStyles.border,
              borderWidth: 1,
            }}
          >
            <Text
              className="text-[10px] font-montserratBold"
              style={{ color: statusStyles.text }}
            >
              {item.status?.toUpperCase()}
            </Text>
          </View>

          {/* Action row */}
          <View className="flex-row items-center justify-center gap-4">
            {/* Upvote */}
            <TouchableOpacity
              activeOpacity={0.85}
              disabled={isUp}
              onPress={() => handleVote(item._id, "upvote")}
              className={`flex-row items-center px-4 py-2 rounded-full border ${
                isUp
                  ? "border-green-500 bg-green-50"
                  : "border-gray-200 bg-white"
              }`}
              accessibilityLabel="Upvote"
            >
              <Ionicons
                name={isUp ? "thumbs-up" : "thumbs-up-outline"}
                size={16}
                color={isUp ? "#16A34A" : "#6B7280"}
              />
              <Text
                className={`ml-2 text-sm font-montserrat ${
                  isUp ? "text-green-700 font-semibold" : "text-gray-700"
                }`}
              >
                Upvote
              </Text>
              <Text className="ml-2 text-sm font-montserrat text-gray-700">
                {item.upvotes.length}
              </Text>
            </TouchableOpacity>

            {/* Downvote */}
            <TouchableOpacity
              activeOpacity={0.85}
              disabled={isDown}
              onPress={() => handleVote(item._id, "downvote")}
              className={`flex-row items-center px-4 py-2 rounded-full border ${
                isDown ? "border-red-500 bg-red-50" : "border-gray-200 bg-white"
              }`}
              accessibilityLabel="Downvote"
            >
              <Ionicons
                name={isDown ? "thumbs-down" : "thumbs-down-outline"}
                size={16}
                color={isDown ? "#EF4444" : "#6B7280"}
              />
              <Text
                className={`ml-2 text-sm font-montserrat ${
                  isDown ? "text-red-700 font-semibold" : "text-gray-700"
                }`}
              >
                Downvote
              </Text>
              <Text className="ml-2 text-sm font-montserrat text-gray-700">
                {item.downvotes.length}
              </Text>
            </TouchableOpacity>
            {user?.role === "AdminUser" && (
              <TouchableOpacity
                onPress={() => {
                  router.push({
                    pathname: `/reports/[reportId]`,
                    params: { reportId: item._id },
                  });
                }}
                className="w-9 h-9 rounded-full bg-[#6C4FE0] items-center justify-center"
                activeOpacity={0.8}
              >
                <Ionicons name="eye-outline" size={20} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  if (status === "loading")
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <LottieView
          source={require("../../assets/animations/loader.json")}
          autoPlay
          loop
          style={{ width: 160, height: 160 }}
        />
      </View>
    );

  if (error) return <Text style={{ color: "red", margin: 20 }}>{error}</Text>;
  if (!selected) return <Text>No billboard data found.</Text>;

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="bg-primary-dark px-4 py-3 shadow-lg">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.8}
            className="h-10 w-10 rounded-full items-center justify-center active:opacity-70 bg-white/20"
          >
            <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <Text className="ml-3 font-montserratBold text-xl text-white tracking-widest">
            Civic Issue Details
          </Text>
        </View>
      </View>

      <ScrollView className="mb-2">
        <View className="px-4 py-4">
          {/* Civic Issue summary */}
          <View
            className="rounded-2xl mb-4 overflow-hidden"
            style={{
              backgroundColor: "#F8FAFC", // very light tone instead of strong gradient
              padding: 12,
              // softer shadow for a professional look
              shadowColor: "#0f172a",
              shadowOpacity: 0.06,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 6 },
              elevation: 6,
            }}
          >
            {/* translucent inner card to lift content slightly */}
            <View
              className="rounded-xl"
              style={{
                backgroundColor: "rgba(255,255,255,0.92)",
                padding: 14,
              }}
            >
              {/* Heading */}
              <View className="mb-3">
                <Text className="text-lg font-montserratBold text-gray-900 leading-snug">
                  Civic Issue Details
                </Text>
              </View>

              {/* Coordinates card (contains location card inside) */}
              {/* Location Card */}
              <View
                className="flex-row items-center p-3 rounded-xl mb-3"
                style={{
                  backgroundColor: "#F8FAFC",
                  borderLeftWidth: 3,
                  borderLeftColor: "#6c4fe0ff",
                }}
              >
                <View className="p-2 rounded-full mr-3 bg-primary-main/20">
                  <Ionicons
                    name="location-outline"
                    size={18}
                    color="#6c4fe0ff"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-montserratSemiBold text-gray-500 uppercase tracking-wide mb-1">
                    Location
                  </Text>
                  <Text
                    numberOfLines={3}
                    ellipsizeMode="tail"
                    className="text-sm font-montserrat text-gray-800 font-medium"
                  >
                    {selected.location?.address || "Unknown location"}
                  </Text>
                </View>
              </View>

              {/* Coordinates Card */}
              <View
                className="flex-row items-center p-3 rounded-xl"
                style={{
                  backgroundColor: "#F8FAFC",
                  borderLeftWidth: 3,
                  borderLeftColor: "#10B981", // green accent for distinction
                }}
              >
                <View className="p-2 rounded-full mr-3 bg-green-100">
                  <Ionicons name="navigate-outline" size={18} color="#059669" />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-montserratSemiBold text-gray-500 uppercase tracking-wide mb-1">
                    Coordinates
                  </Text>
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    className="text-sm font-montserrat text-gray-800 font-medium"
                  >
                    {selected.location?.coordinates?.join(", ") || "N/A"}
                  </Text>
                </View>
              </View>

              {/* Row: Confidence pill + Status pill (subtle, compact) */}
              <View className="flex-row items-center gap-3 mt-4">
                {/* status pill */}
                <View
                  className="rounded-xl px-3 py-1.5 flex-row items-center"
                  style={{
                    backgroundColor: statusStyles.bg,
                    borderWidth: 1,
                    borderColor: statusStyles.border,
                  }}
                >
                  <Text
                    className="text-xs font-montserratBold"
                    style={{ color: statusStyles.text }}
                  >
                    {(selected?.verifiedStatus || "UNKNOWN").toUpperCase()}
                  </Text>
                </View>

                {/* confidence pill */}
                <View
                  className="rounded-full px-3 py-1.5 flex-row items-center"
                  style={{
                    backgroundColor: "#F8FAFF",
                    borderWidth: 1,
                    borderColor: "#EEF2FF",
                  }}
                >
                  <Ionicons
                    name="speedometer-outline"
                    size={14}
                    color="#2563EB"
                    style={{ marginRight: 8 }}
                  />
                  <Text className="text-xs font-montserratBold text-gray-700">
                    {typeof selected?.crowdConfidence === "number"
                      ? `${selected.crowdConfidence.toFixed(2)}%`
                      : "N/A"}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Reports header */}
          <View className="flex-row items-center justify-between ">
            <Text className="text-lg font-montserratBold text-gray-800">
              Reports
            </Text>
            <Text className="text-sm font-montserrat text-gray-500">
              {selected.reports?.length ?? 0} found
            </Text>
          </View>

          <View className="bg-transparent rounded-2xl pt-2">
            {selected.reports?.length ? (
              <FlatList
                data={selected.reports}
                keyExtractor={(item) => item._id}
                renderItem={renderReportItem}
                scrollEnabled={false}
                contentContainerStyle={{ paddingBottom: 30 }}
              />
            ) : (
              <View className="items-center py-8">
                <Text className="text-center text-gray-500">
                  No reports found.
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default BillBoardDetails;
