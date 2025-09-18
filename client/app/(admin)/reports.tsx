import { getAllCivicIssues } from "@/lib/Slices/civicIssueSlice";
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
  const { issues, status, error } = useSelector(
    (state: RootState) => state.civicIssue
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
      getAllCivicIssues({
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
      ? `${item.crowdConfidence.toFixed(1)}%`
      : "N/A";
    const addressShort = item.location?.address
      ? item.location.address.split(",").slice(0, 2).join(",").trim()
      : "Unknown Location";

    return (
      <View className="mb-4 mx-2">
        <View
          className="flex-row bg-white rounded-xl border border-border overflow-hidden"
          style={{
            shadowColor: "#1A1D23",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.06,
            shadowRadius: 16,
            elevation: 4,
          }}
        >
          {/* IMAGE (left-aligned small thumbnail) */}
          <Image
            source={{
              uri:
                item.imageURL ||
                "https://res.cloudinary.com/dzjbxojvu/image/upload/v1757409898/UserUploads/user-upload-1757409894900.jpg",
            }}
            className="w-32"
            style={{ height: "100%", resizeMode: "cover" }}
            accessibilityLabel={`Image for billboard ${String(item.id).slice(
              -6
            )}`}
          />

          {/* RIGHT: textual content */}
          <View className="flex-1 px-4 py-3 justify-between">
            <View>
              <Text
                className="font-montserratBold text-text-primary text-base"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                Civic Issue #{String(item.id).slice(-6)}
              </Text>

              <Text
                className="text-[12px] font-montserratBold mt-1"
                style={{ color: "#4C1D95" }}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {addressShort}
              </Text>

              <View className="flex-row items-center mt-1">
                <Text className="text-xs font-montserrat text-text-secondary">
                  Crowd Confidence:
                </Text>
                <Text className="text-xs font-montserratBold text-primary-main ml-1">
                  {crowdConfidence}
                </Text>
              </View>

              {/* Status + CTA row */}
              <View className="flex-row items-center mt-2 justify-between">
                {/* Status pill */}
                <View
                  className="px-2 py-1 rounded-full"
                  style={{
                    backgroundColor: "#F5F7FB",
                    borderWidth: 1,
                    borderColor: "#E6EAF0",
                  }}
                >
                  <Text className="text-xs font-montserratBold text-primary-main">
                    {item.verifiedStatus ?? "N/A"}
                  </Text>
                </View>

                {/* CTA button */}
                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: "/billboards/[billboardId]",
                      params: { billboardId: item.id },
                    })
                  }
                  activeOpacity={0.8}
                  className="ml-2 flex-row items-center"
                >
                  <Ionicons
                    name="arrow-forward-circle-outline"
                    size={28}
                    color="#6C4FE0"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
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
            All Civic Issues
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
              backgroundColor: "#FFFFFF", // surface
              borderColor: "#E5E7EB", // border
              borderWidth: 1,
              shadowColor: "#000",
              shadowOpacity: 0.08,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 4 },
            }}
          >
            {/* Header */}
            <View
              className="pb-2 border-b mb-3"
              style={{ borderColor: "#E5E7EB" }}
            >
              <Text
                className="font-montserratBold text-lg"
                style={{ color: "#1F2937" }}
              >
                Filters
              </Text>
            </View>

            {/* STATUS row */}
            <View
              className="mb-2 rounded-xl overflow-hidden"
              style={{
                borderWidth: 1,
                borderColor: "#E5E7EB",
                backgroundColor: "#F9FAFB", // subtle bg
              }}
            >
              <TouchableOpacity
                className="flex-row items-center justify-between px-3 py-3"
                onPress={() =>
                  setOpenKey(openKey === "status" ? null : "status")
                }
                activeOpacity={0.8}
              >
                <Text className="font-montserrat" style={{ color: "#1F2937" }}>
                  {getLabel(STATUS_OPTIONS, tempFilters.status)}
                </Text>
                <Ionicons
                  name={openKey === "status" ? "chevron-up" : "chevron-down"}
                  size={18}
                  color="#6B7280"
                />
              </TouchableOpacity>

              <AnimatePresence>
                {openKey === "status" && (
                  <MotiView
                    key="status-options"
                    from={{ opacity: 0, translateY: -8, scaleY: 0.95 }}
                    animate={{ opacity: 1, translateY: 0, scaleY: 1 }}
                    transition={{ type: "timing", duration: 220 }}
                    style={{
                      overflow: "hidden",
                      backgroundColor: "#FFFFFF",
                    }}
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <TouchableOpacity
                        key={opt.value}
                        className="px-3 py-2 flex-row items-center justify-between"
                        onPress={() => {
                          setTempFilters((f) => ({ ...f, status: opt.value }));
                          setOpenKey(null);
                        }}
                      >
                        <Text
                          className="font-montserrat"
                          style={{
                            color:
                              tempFilters.status === opt.value
                                ? "#6C4FE0"
                                : "#1F2937",
                          }}
                        >
                          {opt.label}
                        </Text>
                        {tempFilters.status === opt.value && (
                          <Ionicons
                            name="checkmark"
                            size={16}
                            color="#6C4FE0"
                          />
                        )}
                      </TouchableOpacity>
                    ))}
                  </MotiView>
                )}
              </AnimatePresence>
            </View>

            {/* Buttons */}
            <View className="flex-row justify-end gap-2 mt-4">
              <TouchableOpacity
                className="rounded-xl px-3 py-2"
                style={{
                  borderColor: "#E5E7EB",
                  borderWidth: 1,
                  backgroundColor: "#F9FAFB",
                }}
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
                <Text className="font-montserrat" style={{ color: "black" }}>
                  Reset
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="rounded-xl px-4 py-2"
                style={{ backgroundColor: "#6C4FE0" }}
                onPress={() => {
                  setFilters(tempFilters);
                  setMenuVisible(false);
                }}
              >
                <Text
                  className="font-montserratBold"
                  style={{ color: "#FFFFFF" }}
                >
                  Apply
                </Text>
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
          <ScrollView className="my-8 mx-6">
            {issues.length === 0 ? (
              <Text className="mt-5 text-center text-sm text-neutral-500">
                No civic issues found.
              </Text>
            ) : (
              <FlatList
                data={issues}
                renderItem={renderBillboardItem}
                keyExtractor={(item) =>
                  item.id?.toString() ?? Math.random().toString()
                }
                scrollEnabled={false}
              />
            )}

            {/* Pagination */}
            {issues.length > 0 && (
              <View className="mt-2 mb-2 px-2">
                <View className="flex-row items-center justify-center gap-3">
                  {/* Prev */}
                  <TouchableOpacity
                    disabled={filters.page === 1}
                    onPress={() =>
                      setFilters((f) => ({
                        ...f,
                        page: Math.max(1, f.page - 1),
                      }))
                    }
                    className={[
                      "w-10 h-10 rounded-full items-center justify-center border",
                      filters.page === 1
                        ? "bg-white border-border"
                        : "bg-primary-main border-primary-main",
                    ].join(" ")}
                    activeOpacity={0.85}
                  >
                    <Ionicons
                      name="chevron-back"
                      size={18}
                      color={filters.page === 1 ? "#9CA3AF" : "#FFFFFF"}
                    />
                  </TouchableOpacity>

                  {/* Page indicator */}
                  <Text className="font-montserrat text-sm text-text-secondary">
                    Page{" "}
                    <Text className="font-montserratBold text-text-secondary">
                      {filters.page}
                    </Text>
                  </Text>

                  {/* Next */}
                  <TouchableOpacity
                    disabled={issues.length < filters.limit}
                    onPress={() =>
                      setFilters((f) => ({ ...f, page: f.page + 1 }))
                    }
                    className={[
                      "w-10 h-10 rounded-full items-center justify-center border",
                      issues.length < filters.limit
                        ? "bg-white border-border"
                        : "bg-primary-main border-primary-main",
                    ].join(" ")}
                    activeOpacity={0.85}
                  >
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={
                        issues.length < filters.limit ? "#9CA3AF" : "#FFFFFF"
                      }
                    />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      )}
    </View>
  );
};

export default Billboards;
