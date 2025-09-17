import { getAllReports } from "@/lib/Slices/reportSlice";
import { AppDispatch } from "@/store/store";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BarChart, PieChart } from "react-native-chart-kit";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch } from "react-redux";
import BillboardMap from "../components/BillboardMap";

const screenWidth = Dimensions.get("window").width;

export default function Dashboard({ role }: { role: string }) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [reports, setReports] = useState<any[]>([]);
  const [status, setStatus] = useState<
    "idle" | "loading" | "succeeded" | "failed"
  >("idle");
  const spinValue = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (status === "loading") {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1200,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      spinValue.stopAnimation();
    }
  }, [status]);
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });
  useEffect(() => {
    setStatus("loading");
    dispatch(getAllReports({})).then((action: any) => {
      if (action.type.endsWith("/fulfilled")) {
        setReports(action.payload.data);
        setStatus("succeeded");
      } else {
        setStatus("failed");
      }
    });
  }, [dispatch]);

  const stats = useMemo(() => {
    const total = reports?.length || 0;

    const pending = reports?.filter((r) => r.status === "pending").length || 0;
    const verified_authorized =
      reports?.filter((r) => r.status === "verified_authorized").length || 0;
    const verified_unauthorized =
      reports?.filter((r) => r.status === "verified_unauthorized").length || 0;
    const rejected =
      reports?.filter((r) => r.status === "rejected").length || 0;
    return {
      total,
      pending,
      verified_authorized,
      verified_unauthorized,
      rejected,
    };
  }, [reports]);

  // Pie Chart Data
  const pieData = [
    {
      name: "Pending",
      count: stats.pending,
      color: "#facc15",
      legendFontColor: "#374151",
      legendFontSize: 13,
    },
    {
      name: "Authorized",
      count: stats.verified_authorized,
      color: "#22c55e",
      legendFontColor: "#374151",
      legendFontSize: 13,
    },
    {
      name: "UnAuthorized",
      count: stats.verified_unauthorized,
      color: "#3b82f6",
      legendFontColor: "#374151",
      legendFontSize: 13,
    },
    {
      name: "Rejected",
      count: stats.rejected,
      color: "#ef4444",
      legendFontColor: "#374151",
      legendFontSize: 13,
    },
  ];

  const barData = {
    labels: ["Pending", "Authorized", "UnAuthorized", "Rejected"],
    datasets: [
      {
        data: [
          stats.pending,
          stats.verified_authorized,
          stats.verified_unauthorized,
          stats.rejected,
        ],
      },
    ],
  };

  return (
    <SafeAreaView edges={["bottom"]} style={{ flex: 1 }}>
      <ScrollView className="flex-1 bg-gray-50 px-4 py-8">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-4">
          {/* Left: Title + Icon */}
          <View className="flex-row items-center">
            <View
              className="h-10 w-10 rounded-2xl items-center justify-center mr-3"
              style={{
                backgroundColor: "#EEF2FF",
                borderColor: "#E5E7EB",
                borderWidth: 1,
              }}
            >
              <Ionicons name="stats-chart-outline" size={20} color="#6C4FE0" />
            </View>

            <View>
              <Text
                className="font-montserratBold text-2xl"
                style={{ color: "#1F2937" }}
              >
                Dashboard
              </Text>
              <Text
                className="font-montserrat text-xs mt-0.5"
                style={{ color: "#6B7280" }}
              >
                Review reports and track citywide violations.
              </Text>
            </View>
          </View>
        </View>

        {status === "loading" && (
          <View className="flex-row items-center justify-center mb-6">
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <Ionicons name="refresh-circle" size={28} color="#6C4FE0" />
            </Animated.View>
            <Text
              className="ml-2 font-montserrat text-sm"
              style={{ color: "#6B7280" }}
            >
              Fetching the latest reports...
            </Text>
          </View>
        )}

        {/* Overview Cards */}
        {/* <View className="flex-row flex-wrap justify-between mb-6">
        {[
          {
            label: "Pending",
            value: stats.pending,
            color: "bg-yellow-100 text-yellow-700",
          },
          {
            label: "Resolved",
            value: stats.resolved,
            color: "bg-green-100 text-green-700",
          },
          {
            label: "Total",
            value: stats.total,
            color: "bg-indigo-100 text-indigo-700",
          },
          { label: "Users", value: 50, color: "bg-pink-100 text-pink-700" },
        ].map((item) => (
          <View
            key={item.label}
            className={`w-[48%] rounded-2xl p-5 mb-4 shadow-md ${item.color.split(" ")[0]}`}
          >
            <Text className={`text-xl font-bold ${item.color.split(" ")[1]}`}>
              {item.value}
            </Text>
            <Text className="text-gray-600 mt-1">{item.label}</Text>
          </View>
        ))}
      </View> */}

        <View className="flex-row flex-wrap justify-between mb-6">
          {[
            {
              label: "Pending",
              value: stats.pending,
              color: "bg-yellow-100 text-yellow-700",
            },
            {
              label: "Resolved",
              value: stats.verified_authorized + stats.verified_unauthorized,
              color: "bg-green-100 text-green-700",
            },
            {
              label: "Total",
              value: stats.total,
              color: "bg-indigo-100 text-indigo-700",
            },
            { label: "Users", value: 50, color: "bg-pink-100 text-pink-700" },
          ].map((item) => {
            const [bgClass, textClass] = item.color.split(" "); // ✅ keep your existing color scheme
            return (
              <View key={item.label} className="w-[48%] mb-4">
                <View className="relative rounded-2xl bg-white border border-border shadow-[0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden p-5">
                  {/* Slim accent bar using the provided bg-* class */}
                  <View
                    className={`absolute top-0 left-0 right-0 h-1 ${bgClass}`}
                  />

                  {/* Value */}
                  <Text className="font-montserratBold text-3xl leading-none text-text-primary mb-2">
                    {item.value}
                  </Text>

                  {/* Label */}
                  <View
                    className={`px-2 py-0.5 rounded-full ${bgClass} self-start`}
                  >
                    <Text className={`font-montserrat text-sm ${textClass}`}>
                      {item.label}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Pie Chart Card */}
        {/* <View className="bg-white rounded-2xl shadow-md p-4 mb-6">
        <Text className="font-semibold text-gray-700 mb-3">
          Reports by Status
        </Text>
        <PieChart
          data={pieData}
          width={screenWidth - 50}
          height={220}
          chartConfig={{
            backgroundColor: "#fff",
            backgroundGradientFrom: "#fff",
            backgroundGradientTo: "#fff",
            color: (opacity = 1) => `rgba(55,65,81,${opacity})`,
          }}
          accessor="count"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      </View> */}

        <View className="rounded-2xl bg-white border border-border shadow-[0_1px_2px_rgba(0,0,0,0.04)] mb-6 overflow-hidden">
          {/* Header */}
          <View className="flex-row items-center justify-between px-4 pt-4 pb-3">
            <View className="flex-row items-center">
              <View
                className="h-9 w-9 rounded-xl items-center justify-center mr-3"
                style={{
                  backgroundColor: "#EEF2FF",
                  borderColor: "#E5E7EB",
                  borderWidth: 1,
                }}
              >
                <Ionicons name="pie-chart-outline" size={18} color="#6C4FE0" />
              </View>
              <View>
                <Text
                  className="font-montserratBold text-base"
                  style={{ color: "#1F2937" }}
                >
                  Reports by Status
                </Text>
                <Text
                  className="font-montserrat text-[11px] mt-0.5"
                  style={{ color: "#6B7280" }}
                >
                  Distribution across all reports
                </Text>
              </View>
            </View>
          </View>

          {/* Divider */}
          <View className="h-px" style={{ backgroundColor: "#E5E7EB" }} />

          {/* Chart */}
          <PieChart
            data={pieData}
            width={screenWidth - 50}
            height={220}
            chartConfig={{
              backgroundColor: "#fff",
              backgroundGradientFrom: "#fff",
              backgroundGradientTo: "#fff",
              color: (opacity = 1) => `rgba(55,65,81,${opacity})`,
              decimalPlaces: 0,
              propsForLabels: {
                fontFamily: "Montserrat_600SemiBold", // 👈 use loaded Montserrat
                fontSize: 11,
              },
            }}
            accessor="count"
            backgroundColor="transparent"
            paddingLeft="20"
            absolute
          />
        </View>

        {/* Bar Chart Card */}
        {/* <View className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-lg p-4 mb-6">
        <Text className="font-semibold text-white mb-3">
          Reports Distribution
        </Text>
        <BarChart
          data={barData}
          width={screenWidth - 50}
          height={220}
          chartConfig={{
            backgroundColor: "#4f46e5",
            backgroundGradientFrom: "#4f46e5",
            backgroundGradientTo: "#7c3aed",
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(255,255,255,${opacity})`,
            labelColor: (opacity = 1) => `rgba(255,255,255,${opacity})`,
          }}
          style={{ borderRadius: 12 }}
          yAxisLabel=""
          yAxisSuffix=""
        />
      </View> */}

        <View className="rounded-2xl bg-white border border-border shadow-[0_1px_2px_rgba(0,0,0,0.04)] mb-6 overflow-hidden">
          {/* Header */}
          <View className="px-4 pt-4 pb-3">
            <Text
              className="font-montserratBold text-base"
              style={{ color: "#1F2937" }}
            >
              Reports Distribution
            </Text>
            <Text
              className="font-montserrat text-[11px] mt-0.5"
              style={{ color: "#6B7280" }}
            >
              Comparison of report categories
            </Text>
          </View>

          {/* Divider */}
          <View className="h-px" style={{ backgroundColor: "#E5E7EB" }} />

          {/* Chart */}
          <View className="px-2 py-4 items-center">
            <BarChart
              data={barData}
              width={screenWidth - 60}
              height={220}
              chartConfig={{
                backgroundColor: "#fff",
                backgroundGradientFrom: "#fff",
                backgroundGradientTo: "#fff",
                decimalPlaces: 0,
                color: () => `rgba(108, 79, 224, 1)`,
                labelColor: () => `rgba(55,65,81,1)`,
                propsForLabels: {
                  fontFamily: "Montserrat_600SemiBold",
                  fontSize: 11,
                },
                propsForBackgroundLines: {
                  stroke: "#E5E7EB", // light grid lines
                  strokeDasharray: "", // solid lines
                },
              }}
              style={{
                borderRadius: 16,
                marginLeft: -30, // 👈 pull chart left to center it better
              }}
              yAxisLabel=""
              yAxisSuffix=""
              fromZero
              showValuesOnTopOfBars
            />
          </View>
        </View>

        {/* Recent Reports */}
        {/* <View className="bg-white rounded-2xl shadow-md p-5 mb-10">
        <Text className="font-semibold text-gray-700 mb-4">Recent Reports</Text>
        {reports?.slice(0, 5).map((r) => (
          <TouchableOpacity
            key={r._id}
            className="border-b border-gray-200 pb-3 mb-3 active:opacity-70"
            onPress={() =>
              router.push({
                pathname: "/reports/[reportId]",
                params: { reportId: r._id },
              })
            }
          >
            <Text className="text-indigo-600 font-medium mb-1">
              {r.violationType?.join(", ") || "Unknown Violation"}
            </Text>
            <Text className="text-sm text-gray-600 mb-1">
              {r.issueDescription}
            </Text>
            <Text className="text-xs text-gray-500">
              {new Date(r.submittedAt).toLocaleDateString()} •{" "}
              <Text className="capitalize">{r.status}</Text>
            </Text>
          </TouchableOpacity>
        ))}
      </View>
       */}
        <View style={{ flex: 1 }}>
          <Text style={{ marginBottom: 10 }}>Billboard distribution</Text>
          <View style={{ flex: 1 }}>
            <BillboardMap />
          </View>
        </View>
        <View className="bg-white rounded-2xl border border-border shadow-[0_1px_2px_rgba(0,0,0,0.04)] p-5 mb-16">
          <Text
            className="font-montserratBold text-base mb-4"
            style={{ color: "#1F2937" }}
          >
            Recent Reports
          </Text>

          {reports?.slice(0, 5).map((r) => (
            <TouchableOpacity
              key={r._id}
              activeOpacity={0.85}
              onPress={() =>
                router.push({
                  pathname: "/reports/[reportId]",
                  params: { reportId: r._id },
                })
              }
              className="mb-4"
            >
              {/* Card */}
              <View
                className="rounded-xl border border-border bg-white shadow-sm p-4"
                style={{
                  shadowColor: "#000",
                  shadowOpacity: 0.06,
                  shadowRadius: 4,
                  shadowOffset: { width: 0, height: 2 },
                }}
              >
                {/* Top row: date + status */}
                <View className="flex-row items-center justify-between mb-2">
                  <Text
                    className="text-xs font-montserrat"
                    style={{ color: "#6B7280" }}
                  >
                    {new Date(r.submittedAt).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </Text>

                  {/* Status pill */}
                  <View
                    className="px-2 py-0.5 rounded-lg border"
                    style={{
                      backgroundColor:
                        r.status === "pending"
                          ? "#FEF3C7" // yellow-100
                          : r.status === "resolved" ||
                              r.status === "verified_unauthorized"
                            ? "#DCFCE7" // green-100
                            : r.status === "verified_authorized"
                              ? "#E0E7FF" // indigo-100
                              : "#F3F4F6", // neutral fallback
                      borderColor:
                        r.status === "pending"
                          ? "#FACC15" // yellow-400
                          : r.status === "resolved" ||
                              r.status === "verified_unauthorized"
                            ? "#22C55E" // green-500
                            : r.status === "verified_authorized"
                              ? "#6366F1" // indigo-500
                              : "#E5E7EB",
                    }}
                  >
                    <Text
                      className="text-[10px] font-montserratBold"
                      style={{
                        color:
                          r.status === "pending"
                            ? "#92400E" // yellow-800
                            : r.status === "resolved" ||
                                r.status === "verified_unauthorized"
                              ? "#166534" // green-800
                              : r.status === "verified_authorized"
                                ? "#4338CA" // indigo-700
                                : "#6B7280", // neutral gray
                      }}
                    >
                      {r.status?.toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* Middle: violation + description */}
                <Text
                  numberOfLines={1}
                  className="font-montserratBold text-sm mb-1"
                  style={{ color: "#1F2937" }}
                >
                  {r.violationType?.length
                    ? r.violationType
                        .map((v: string) =>
                          v
                            .replace(/_/g, " ") // underscores → spaces
                            .toLowerCase() // sentence case
                            .replace(/^\w/, (c) => c.toUpperCase())
                        )
                        .join(", ")
                    : "Unknown Violation"}
                </Text>

                <Text
                  numberOfLines={2}
                  className="font-montserrat text-xs mb-2"
                  style={{ color: "#6B7280" }}
                >
                  {r.issueDescription || "No description provided"}
                </Text>

                {/* Bottom: link */}
                <View className="flex-row justify-end items-center">
                  <Text
                    className="font-montserratBold text-sm mr-1"
                    style={{ color: "#6C4FE0" }}
                  >
                    See details
                  </Text>
                  <Ionicons name="arrow-forward" size={14} color="#6C4FE0" />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
