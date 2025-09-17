import { getAllReports, getReportsByUser } from "@/lib/Slices/reportSlice";
import { AppDispatch, RootState } from "@/store/store";
import { Ionicons } from "@expo/vector-icons";
import {
  useFocusEffect,
  useIsFocused,
  useRoute,
} from "@react-navigation/native";
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
const Reports = () => {
  const isFocused = useIsFocused();
  const [played, setPlayed] = useState(false);
  useEffect(() => {
    if (isFocused) {
      setPlayed(false);
      requestAnimationFrame(() => setPlayed(true));
    } else {
      setPlayed(false);
    }
  }, [isFocused]);
  const STATUS_OPTIONS = [
    { label: "All Status", value: "" },
    { label: "Pending", value: "pending" },
    { label: "Resolved", value: "resolved" },
    { label: "Rejected", value: "rejected" },
  ];
  const VIOLATION_OPTIONS = [
    { label: "All Violation Types", value: "" },
    { label: "Size Violation", value: "size_violation" },
    { label: "Unauthorized", value: "unauthorized" },
    { label: "Other", value: "other" },
  ];

  const VERDICT_OPTIONS = [
    { label: "All Verdicts", value: "" },
    { label: "Authorized", value: "authorized" },
    { label: "Unauthorized", value: "unauthorized" },
    { label: "Unsure", value: "unsure" },
  ];

  const ReportSkeleton = ({ colorMode }: { colorMode: "light" | "dark" }) => {
    return (
      <View
        className="mb-4 mt-8 mx-2 rounded-2xl p-4 border"
        style={{
          backgroundColor: colorMode === "dark" ? "#1F2937" : "#FFFFFF",
          borderColor: "#E5E7EB",
        }}
      >
        {/* Top row: date & time */}
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

        {/* Middle row */}
        <View className="flex-row items-start gap-3 mt-2 border-b border-text-secondary/20 pb-4">
          {/* Thumbnail */}
          <Skeleton colorMode={colorMode} width={96} height={96} radius={12} />

          {/* Right side */}
          <View className="flex-1">
            {/* Status pill */}
            <Skeleton colorMode={colorMode} width={70} height={18} radius={8} />
            <View style={{ height: 10 }} />

            {/* Verdict */}
            <Skeleton
              colorMode={colorMode}
              width={"60%"}
              height={16}
              radius="round"
            />
            <View style={{ height: 8 }} />

            {/* Issues (chips) */}
            <View className="flex-row gap-2 flex-wrap mt-1">
              <Skeleton
                colorMode={colorMode}
                width={60}
                height={14}
                radius={8}
              />
              <Skeleton
                colorMode={colorMode}
                width={80}
                height={14}
                radius={8}
              />
            </View>
          </View>
        </View>

        {/* Bottom row */}
        <View className="mt-4 flex-row justify-end">
          <Skeleton
            colorMode={colorMode}
            width={100}
            height={14}
            radius="round"
          />
        </View>
      </View>
    );
  };
  const [openKey, setOpenKey] = useState<
    null | "status" | "violationType" | "verdict"
  >(null);

  // util to get label for current value
  const getLabel = (opts: { label: string; value: string }[], v: string) =>
    opts.find((o) => o.value === v)?.label ?? opts[0].label;
  const dispatch = useDispatch<AppDispatch>();
  const route = useRoute<any>();
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.user);
  const { reports, status } = useSelector((state: RootState) => state.report);

  const [filters, setFilters] = useState({
    status: "",
    violationType: "",
    verdict: "",
    page: 1,
    limit: 10,
  });
  // inside Reports component (add new state)
  const [menuVisible, setMenuVisible] = useState(false);
  const [tempFilters, setTempFilters] = useState(filters);

  // prepare slide animation
  const slideY = useRef(new Animated.Value(-260)).current; // hidden above
  useEffect(() => {
    Animated.timing(slideY, {
      toValue: menuVisible ? 0 : -260,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [menuVisible]);

  // when opening, copy current filters into temp
  useEffect(() => {
    if (menuVisible) setTempFilters(filters);
  }, [menuVisible]);

  const [recentReports, setRecentReports] = useState<any[]>([]);
  const [showRecent, setShowRecent] = useState(false);

  const fetchReports = async () => {
    let data: any;
    if (user?.role === "AdminUser") {
      data = await dispatch(
        getAllReports({
          status: filters.status,
          violationType: filters.violationType,
          verdict: filters.verdict,
          page: filters.page,
          limit: filters.limit,
        })
      ).unwrap();
    } else if (user?.role === "NormalUser") {
      data = await dispatch(
        getReportsByUser({
          status: filters.status,
          violationType: filters.violationType,
          verdict: filters.verdict,
          page: filters.page,
          limit: filters.limit,
        })
      ).unwrap();
    }
    if (route.params?.fromSubmission) {
      setShowRecent(true);
      setRecentReports(data.data.slice(0, 1));
    } else {
      setShowRecent(false);
      setRecentReports([]);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [filters, route.params?.fromSubmission]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        setShowRecent(false);
        setRecentReports([]);
      };
    }, [])
  );
  const renderReportItem = ({ item }: { item: any }) => {
    const status = (item?.status || "").toLowerCase();

    const statusStyles =
      status === "pending"
        ? { bg: "#FEF3C7", border: "#F59E0B", text: "#B45309" } // warning (soft)
        : status === "rejected"
          ? { bg: "#FEE2E2", border: "#EF4444", text: "#B91C1C" } // error (soft)
          : { bg: "#DCFCE7", border: "#16A34A", text: "#166534" }; // success (soft)

    const verdict = (item.aiAnalysis?.verdict || "N/A").toUpperCase();
    const thumb = item.annotatedURL || item.imageURL; // use AI image first

    return (
      <View
        className="mb-4 mx-2 rounded-2xl p-4 shadow-md border border-border"
        style={{
          backgroundColor: "#FFFFFF", // surface
          borderColor: "#E5E7EB", // border
          shadowColor: "#000",
          shadowOpacity: 0.06,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 2 },
        }}
      >
        {/* Top row: date & time + status pill */}
        <View className="flex-row items-center justify-between ">
          <View className="flex-row items-center">
            <Text
              className="text-sm font-montserrat"
              style={{ color: "#6B7280" }} // text.secondary
            >
              {new Date(item.submittedAt).toLocaleDateString("en-US", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </Text>

            <Ionicons
              name="ellipse"
              size={4}
              color="#9CA3AF" // text.disabled
              style={{ marginHorizontal: 6 }}
            />

            <Text
              className="text-sm font-montserrat"
              style={{ color: "#6B7280" }} // text.secondary
            >
              {new Date(item.submittedAt).toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              })}
            </Text>
          </View>
        </View>

        {/* Middle row: thumbnail + title (verdict) */}
        <View className="flex-row items-start gap-3 mt-4 border-b border-text-secondary/20 pb-4">
          {/* Thumbnail */}
          {item.imageURL ? (
            <Image
              source={{ uri: item.imageURL }}
              className="h-24 w-24 rounded-xl"
            />
          ) : (
            <View
              className="h-20 w-20 rounded-xl"
              style={{ backgroundColor: "#F3F4F6" }}
            />
          )}

          {/* Right side content */}
          <View className="flex-1 flex-col justify-start">
            {/* Status pill */}
            <View
              className="self-start rounded-lg px-2 py-0.5"
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

            {/* Verdict */}
            <Text
              numberOfLines={1}
              className="mt-1 text-base font-montserratBold"
              style={{ color: "#1F2937" }} // text.primary
            >
              {verdict === "AUTHORIZED"
                ? "Authorized"
                : verdict === "UNAUTHORIZED"
                  ? "Unauthorized"
                  : verdict}
            </Text>

            {/* Issues list */}
            <View className="mt-1 flex-row flex-wrap gap-2">
              {item.violationType?.length ? (
                item.violationType.map((issue: string, idx: number) => {
                  // format: "size_violation" -> "Size violation"
                  const formatted = issue
                    .replace(/_/g, " ") // replace underscores with spaces
                    .toLowerCase() // make everything lowercase
                    .replace(/^\w/, (c) => c.toUpperCase()); // capitalize first letter

                  return (
                    <View
                      key={idx}
                      className="rounded-full px-2 py-0.5"
                      style={{ backgroundColor: "#F3F4F6" }}
                    >
                      <Text
                        className="text-[11px] font-montserrat"
                        style={{ color: "#374151" }}
                      >
                        {formatted}
                      </Text>
                    </View>
                  );
                })
              ) : (
                <Text
                  className="text-[11px] font-montserrat"
                  style={{ color: "#9CA3AF" }} // text.disabled
                >
                  No issues
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Bottom row: (left empty per request) + See details link on right */}
        <View className="mt-4 flex-row items-center justify-between">
          <View />
          {/* intentionally empty (was "Total" in the reference) */}

          <TouchableOpacity
            className="flex-row items-center gap-1"
            onPress={() =>
              router.push({
                pathname: "/reports/[reportId]",
                params: { reportId: item._id },
              })
            }
            activeOpacity={0.8}
          >
            <Text
              className="text-sm font-montserratBold"
              style={{ color: "#6C4FE0" }} // primary.main
            >
              See details
            </Text>
            <Ionicons name="arrow-forward" size={16} color="#6C4FE0" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-neutral-100">
      <View
        className="bg-primary-dark px-4 py-3 shadow-lg shadow-primary-dark/40 border-b border-primary-main/30"
        style={{ zIndex: 20, elevation: 12 }}
      >
        <View className="flex-row items-center justify-between">
          <Text className="font-montserratBold text-xl text-white tracking-widest">
            {user?.role === "NormalUser" ? "My Reports" : "All Reports"}
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

      {/* Backdrop */}
      <AnimatePresence>
        {menuVisible && (
          <MotiView
            key="filters-menu"
            from={{ opacity: 0, scale: 0.8, translateY: -10 }}
            animate={{ opacity: 1, scale: 1, translateY: 0 }}
            exit={{ opacity: 0, scale: 0.8, translateY: -10 }}
            transition={{
              type: "spring",
              damping: 12,
              stiffness: 200,
            }}
            className="absolute right-4 top-20 w-72 rounded-2xl border px-4 py-3 z-50"
            style={{
              backgroundColor: "#FFFFFF", // surface
              borderColor: "#E5E7EB", // border
              borderWidth: 1,
              shadowColor: "#000", // subtle neutral shadow
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
                backgroundColor: "#F9FAFB", // subtle background
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
                    transition={{
                      type: "timing",
                      duration: 220,
                    }}
                    style={{
                      overflow: "hidden", // important to clip during scaleY transform
                      transformOrigin: "top", // harmless on RN (kept for clarity)
                      backgroundColor: "#FFFFFF",
                    }}
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <TouchableOpacity
                        key={opt.value}
                        className="px-3 py-2 flex-row items-center justify-between"
                        onPress={() => {
                          setTempFilters((f) => ({
                            ...f,
                            status: opt.value,
                          }));
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

            {/* VIOLATION TYPE row */}
            <View
              className="mb-2 rounded-xl overflow-hidden"
              style={{
                borderWidth: 1,
                borderColor: "#E5E7EB",
                backgroundColor: "#F9FAFB", // subtle background
              }}
            >
              <TouchableOpacity
                className="flex-row items-center justify-between px-3 py-3"
                onPress={() =>
                  setOpenKey(
                    openKey === "violationType" ? null : "violationType"
                  )
                }
                activeOpacity={0.8}
              >
                <Text className="font-montserrat" style={{ color: "#1F2937" }}>
                  {getLabel(VIOLATION_OPTIONS, tempFilters.violationType)}
                </Text>
                <Ionicons
                  name={
                    openKey === "violationType" ? "chevron-up" : "chevron-down"
                  }
                  size={18}
                  color="#6B7280"
                />
              </TouchableOpacity>
              <AnimatePresence>
                {openKey === "violationType" && (
                  <MotiView
                    key="violationType-options"
                    from={{ opacity: 0, translateY: -8, scaleY: 0.95 }}
                    animate={{ opacity: 1, translateY: 0, scaleY: 1 }}
                    transition={{ type: "timing", duration: 220 }}
                    style={{ overflow: "hidden", backgroundColor: "#FFFFFF" }}
                  >
                    {VIOLATION_OPTIONS.map((opt) => (
                      <TouchableOpacity
                        key={opt.value}
                        className="px-3 py-2 flex-row items-center justify-between"
                        onPress={() => {
                          // ✅ FIX: update violationType (not status)
                          setTempFilters((f) => ({
                            ...f,
                            violationType: opt.value,
                          }));
                          setOpenKey(null);
                        }}
                      >
                        <Text
                          className="font-montserrat"
                          style={{
                            color:
                              tempFilters.violationType === opt.value
                                ? "#6C4FE0" // highlight active with brand purple
                                : "#1F2937",
                          }}
                        >
                          {opt.label}
                        </Text>
                        {tempFilters.violationType === opt.value && (
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

            {/* VERDICT row */}
            <View
              className="mb-2 rounded-xl overflow-hidden"
              style={{
                borderWidth: 1,
                borderColor: "#E5E7EB",
                backgroundColor: "#F9FAFB", // subtle background
              }}
            >
              <TouchableOpacity
                className="flex-row items-center justify-between px-3 py-3"
                onPress={() =>
                  setOpenKey(openKey === "verdict" ? null : "verdict")
                }
                activeOpacity={0.8}
              >
                <Text className="font-montserrat" style={{ color: "#1F2937" }}>
                  {getLabel(VERDICT_OPTIONS, tempFilters.verdict)}
                </Text>
                <Ionicons
                  name={openKey === "verdict" ? "chevron-up" : "chevron-down"}
                  size={18}
                  color="#6B7280"
                />
              </TouchableOpacity>
              <AnimatePresence>
                {openKey === "verdict" && (
                  <MotiView
                    key="verdict-options"
                    from={{ opacity: 0, translateY: -8, scaleY: 0.95 }}
                    animate={{ opacity: 1, translateY: 0, scaleY: 1 }}
                    transition={{ type: "timing", duration: 220 }}
                    style={{ overflow: "hidden", backgroundColor: "#FFFFFF" }}
                  >
                    {VERDICT_OPTIONS.map((opt) => (
                      <TouchableOpacity
                        key={opt.value}
                        className="px-3 py-2 flex-row items-center justify-between"
                        onPress={() => {
                          // ✅ FIX: update verdict (not status)
                          setTempFilters((f) => ({
                            ...f,
                            verdict: opt.value,
                          }));
                          setOpenKey(null);
                        }}
                      >
                        <Text
                          className="font-montserrat"
                          style={{
                            color:
                              tempFilters.verdict === opt.value
                                ? "#6C4FE0" // highlight active with brand purple
                                : "#1F2937",
                          }}
                        >
                          {opt.label}
                        </Text>
                        {tempFilters.verdict === opt.value && (
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
            {/* Buttons */}
            <View className="flex-row justify-end gap-2">
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
                    violationType: "",
                    verdict: "",
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
                  setFilters(tempFilters); // <-- triggers fetch via your useEffect
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

      {status === "loading" ? (
        <ScrollView
          className="mb-10 mt-2 mx-6"
          showsVerticalScrollIndicator={false}
        >
          {[...Array(3)].map((_, idx) => (
            <ReportSkeleton key={idx} colorMode="light" />
          ))}
        </ScrollView>
      ) : (
        <SafeAreaView edges={["bottom"]} style={{ flex: 1 }}>
          <ScrollView
            className="mb-10 mt-2 mx-6"
            showsVerticalScrollIndicator={false}
          >
            {/* Recently Submitted */}
            {showRecent && recentReports.length > 0 && (
              <>
                <Text className="my-3 text-md font-montserratBold text-text-primary tracking-wide">
                  RECENTLY SUBMITTED
                </Text>
                <FlatList
                  data={recentReports}
                  renderItem={renderReportItem}
                  keyExtractor={(item) => item._id}
                  scrollEnabled={false}
                  contentContainerStyle={{}}
                />
              </>
            )}

            {/* Report History */}
            {reports.length > 0 && (
              <Text className="my-3 text-MD font-montserratBold text-text-primary tracking-wide">
                REPORT HISTORY
              </Text>
            )}

            {/* {reports.length === 0 ? (
              <Text className="mt-5 text-center text-sm text-neutral-500">
                No reports found.
              </Text>
            ) : (
              <FlatList
                data={reports}
                renderItem={renderReportItem}
                keyExtractor={(item) => item._id}
                scrollEnabled={false}
                contentContainerStyle={{}}
              />
            )} */}
            {reports.length === 0 ? (
              <View
                className="min-h-[90%]"
                // center the empty state vertically and horizontally
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  paddingVertical: 28,
                }}
              >
                {/* smaller illustration */}
                <Image
                  source={require("../../../assets/images/noreports.png")}
                  style={{
                    width: 130, // reduced size
                    height: 100, // reduced size
                    resizeMode: "contain",
                    marginBottom: 14,
                  }}
                />

                {/* Professional headline */}
                <Text
                  className="text-lg font-montserratBold"
                  style={{ color: "#1F2937" }}
                >
                  No reports found.
                </Text>

                {/* Professional subline */}
                <Text
                  className="text-sm mt-1 text-center px-8 font-montserrat"
                  style={{ color: "#6B7280", lineHeight: 20 }}
                >
                  Report by taking a photo and earn more points.
                </Text>
              </View>
            ) : (
              <FlatList
                data={reports}
                renderItem={renderReportItem}
                keyExtractor={(item) => item._id}
                scrollEnabled={false}
                contentContainerStyle={{}}
              />
            )}

            {reports.length > 0 && (
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
                    disabled={reports.length < filters.limit}
                    onPress={() => {
                      if (showRecent) setShowRecent(false);
                      setFilters((f) => ({ ...f, page: f.page + 1 }));
                    }}
                    className={[
                      "w-10 h-10 rounded-full items-center justify-center border",
                      reports.length < filters.limit
                        ? "bg-white border-border"
                        : "bg-primary-main border-primary-main",
                    ].join(" ")}
                    activeOpacity={0.85}
                  >
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={
                        reports.length < filters.limit ? "#9CA3AF" : "#FFFFFF"
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

export default Reports;
