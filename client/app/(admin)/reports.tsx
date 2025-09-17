import { getAllBillboards } from "@/lib/Slices/billBoardSlice";
import { AppDispatch, RootState } from "@/store/store";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { AnimatePresence, MotiView } from "moti";
import { Skeleton } from "moti/skeleton";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

const Billboards = () => {
  const isFocused = useIsFocused();
  const [played, setPlayed] = useState(false);
  useEffect(() => {
    if (isFocused) {
      setPlayed(false);
      requestAnimationFrame(() => setPlayed(true));
    } else setPlayed(false);
  }, [isFocused]);

  const STATUS_OPTIONS = [
    { label: "All Status", value: "" },
    { label: "Pending", value: "pending" },
    { label: "Resolved", value: "resolved" },
    { label: "Rejected", value: "rejected" },
  ];

  const BillboardSkeleton = ({
    colorMode,
  }: {
    colorMode: "light" | "dark";
  }) => {
    return (
      <View
        className="mb-4 mt-8 mx-2 rounded-2xl p-4 border"
        style={{
          backgroundColor: colorMode === "dark" ? "#1F2937" : "#FFFFFF",
          borderColor: "#E5E7EB",
        }}
      >
        <View className="flex-row items-center mb-2">
          <Skeleton
            colorMode={colorMode}
            width={80}
            height={12}
            radius="round"
          />
          <View style={{ width: 8 }} />
          <Skeleton
            colorMode={colorMode}
            width={50}
            height={12}
            radius="round"
          />
        </View>
        <View className="flex-row items-start gap-3 mt-2 border-b border-text-secondary/20 pb-4">
          <Skeleton colorMode={colorMode} width={96} height={96} radius={12} />
          <View className="flex-1">
            <Skeleton colorMode={colorMode} width={70} height={18} radius={8} />
            <View style={{ height: 10 }} />
            <Skeleton
              colorMode={colorMode}
              width={"60%"}
              height={16}
              radius="round"
            />
          </View>
        </View>
      </View>
    );
  };

  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { billboards, status, error } = useSelector(
    (state: RootState) => state.billboard
  );

  const [filters, setFilters] = useState({
    status: "",
    minConfidence: "",
    maxConfidence: "",
    zoneId: "",
    page: 1,
    limit: 10,
  });
  const [menuVisible, setMenuVisible] = useState(false);
  const [tempFilters, setTempFilters] = useState(filters);
  const [openKey, setOpenKey] = useState<null | "status" | "zone">();

  const slideY = useRef(new Animated.Value(-260)).current;
  useEffect(() => {
    Animated.timing(slideY, {
      toValue: menuVisible ? 0 : -260,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [menuVisible]);

  useEffect(() => {
    if (menuVisible) setTempFilters(filters);
  }, [menuVisible]);

  const getLabel = (opts: { label: string; value: string }[], v: string) =>
    opts.find((o) => o.value === v)?.label ?? opts[0].label;

  const fetchBillboards = async () => {
    await dispatch(
      getAllBillboards({
        ...filters,
        minConfidence:
          filters.minConfidence === ""
            ? undefined
            : Number(filters.minConfidence),
        maxConfidence:
          filters.maxConfidence === ""
            ? undefined
            : Number(filters.maxConfidence),
      })
    ).unwrap();
  };

  useEffect(() => {
    fetchBillboards();
  }, [filters]);

  useFocusEffect(
    useCallback(() => {
      return () => {};
    }, [])
  );

  const renderBillboardItem = ({ item }: { item: any }) => {
    const crowdConfidence = item.crowdConfidence
      ? item.crowdConfidence.toFixed(1)
      : "N/A";
    const location = item.location?.address || "Unknown Location";
    const verifiedStatus = item.verifiedStatus ?? "N/A";
    const thumb =
      item.imageURL || "https://via.placeholder.com/150?text=No+Image";

    return (
      <View className="border border-2 border-border flex-row justify-between items-center bg-surface rounded-xl px-3 py-3 mb-4 mx-2 shadow-md shadow-primary-main">
        {/* Left section */}
        <View className="flex-1 mr-3">
          <Text className="font-montserratBold text-text-primary">
            Billboard #{item.id.slice(-6)}
          </Text>
          <Text className="font-montserrat text-text-secondary text-sm">
            {location}
          </Text>
          <Text className="font-montserrat text-text-secondary text-xs mt-1">
            Crowd Confidence:{" "}
            <Text className="text-primary-main font-montserratBold">
              {crowdConfidence}%
            </Text>
          </Text>
          <Text className="font-montserrat text-text-secondary text-xs mt-1">
            Status:{" "}
            <Text className="text-primary-main font-montserratBold">
              {verifiedStatus}
            </Text>
          </Text>
        </View>

        {/* Image */}
        <Image
          source={{ uri: thumb }}
          className="w-16 h-16 rounded-lg border border-border mr-3"
        />

        {/* CTA */}
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/billboards/[billboardId]",
              params: { billboardId: item.id },
            })
          }
        >
          <Text className="text-primary-main font-montserratBold">
            View Details
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-neutral-100">
      {/* Header */}
      <View
        className="bg-primary-dark px-4 py-3 shadow-lg shadow-primary-dark/40 border-b border-primary-main/30"
        style={{ zIndex: 20, elevation: 12 }}
      >
        <View className="flex-row items-center justify-between">
          <Text className="font-montserratBold text-xl text-white tracking-widest">
            All Billboards
          </Text>

          <TouchableOpacity
            className="flex-row items-center gap-2 rounded-xl bg-white/10 border border-white/20 px-3 py-2"
            onPress={() => setMenuVisible((p) => !p)}
            activeOpacity={0.8}
          >
            <Ionicons name="filter-outline" size={20} color="#FFFFFF" />
            <Text className="text-white font-montserrat">Filters</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filters */}
      <AnimatePresence>
        {menuVisible && (
          <MotiView
            key="filters-menu"
            from={{ opacity: 0, scale: 0.8, translateY: -10 }}
            animate={{ opacity: 1, scale: 1, translateY: 0 }}
            exit={{ opacity: 0, scale: 0.8, translateY: -10 }}
            transition={{ type: "spring", damping: 12, stiffness: 200 }}
            className="absolute right-4 top-20 w-72 rounded-2xl border px-4 py-3 z-50"
            style={{
              backgroundColor: "#FFFFFF",
              borderColor: "#E5E7EB",
              borderWidth: 1,
              shadowColor: "#000",
              shadowOpacity: 0.08,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 4 },
            }}
          >
            {/* STATUS row */}
            <View className="mb-2 rounded-xl overflow-hidden">
              <TouchableOpacity
                className="flex-row items-center justify-between px-3 py-3"
                onPress={() =>
                  setOpenKey(openKey === "status" ? null : "status")
                }
                activeOpacity={0.8}
              >
                <Text>{getLabel(STATUS_OPTIONS, tempFilters.status)}</Text>
                <Ionicons
                  name={openKey === "status" ? "chevron-up" : "chevron-down"}
                  size={18}
                />
              </TouchableOpacity>
              <AnimatePresence>
                {openKey === "status" && (
                  <MotiView>
                    {STATUS_OPTIONS.map((opt) => (
                      <TouchableOpacity
                        key={opt.value}
                        onPress={() => {
                          setTempFilters((f) => ({ ...f, status: opt.value }));
                          setOpenKey(null);
                        }}
                      >
                        <Text>{opt.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </MotiView>
                )}
              </AnimatePresence>
            </View>

            {/* Buttons */}
            <View className="flex-row justify-end gap-2">
              <TouchableOpacity
                onPress={() =>
                  setTempFilters({
                    status: "",
                    zoneId: "",
                    minConfidence: "",
                    maxConfidence: "",
                    page: 1,
                    limit: 10,
                  })
                }
              >
                <Text>Reset</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setFilters(tempFilters);
                  setMenuVisible(false);
                }}
              >
                <Text>Apply</Text>
              </TouchableOpacity>
            </View>
          </MotiView>
        )}
      </AnimatePresence>

      {/* Content */}
      {status === "loading" ? (
        <ScrollView className="mb-10 mt-2 mx-6">
          {[...Array(3)].map((_, idx) => (
            <BillboardSkeleton key={idx} colorMode="light" />
          ))}
        </ScrollView>
      ) : (
        <SafeAreaView edges={["bottom"]} style={{ flex: 1 }}>
          <ScrollView className="mb-10 mt-2 mx-6">
            {billboards.length === 0 ? (
              <Text className="mt-5 text-center text-sm text-neutral-500">
                No billboards found.
              </Text>
            ) : (
              <FlatList
                data={billboards}
                renderItem={renderBillboardItem}
                keyExtractor={(item) =>
                  item.id?.toString() ?? Math.random().toString()
                }
                scrollEnabled={false}
              />
            )}

            {/* Pagination */}
            {billboards.length > 0 && (
              <View className="mt-2 mb-2 px-2 flex-row items-center justify-center gap-3">
                <TouchableOpacity
                  disabled={filters.page === 1}
                  onPress={() =>
                    setFilters((f) => ({ ...f, page: Math.max(1, f.page - 1) }))
                  }
                >
                  <Ionicons
                    name="chevron-back"
                    size={18}
                    color={filters.page === 1 ? "#9CA3AF" : "#000"}
                  />
                </TouchableOpacity>
                <Text>Page {filters.page}</Text>
                <TouchableOpacity
                  disabled={billboards.length < filters.limit}
                  onPress={() =>
                    setFilters((f) => ({ ...f, page: f.page + 1 }))
                  }
                >
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={
                      billboards.length < filters.limit ? "#9CA3AF" : "#000"
                    }
                  />
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      )}
    </View>
  );
};

export default Billboards;
