import {
  increaseRejectedReports,
  increaseVerifiedReports,
} from "@/lib/Slices/userSlice";
import apiRequest from "@/lib/utils/apiRequest";
import { AppDispatch, RootState } from "@/store/store";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import LottieView from "lottie-react-native";
import { AnimatePresence, MotiView } from "moti";
import { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useDispatch, useSelector } from "react-redux";

const ReportDetails = () => {
  const { reportId } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.user);
  const colorScheme = useColorScheme(); // ✅ always called
  const colorMode = colorScheme === "dark" ? "dark" : "light";
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [status, setStatus] = useState(report?.status || "pending");
  const [adminNotes, setAdminNotes] = useState(report?.adminNotes || "");
  const [saving, setSaving] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const STATUS_OPTIONS = [
    { label: "Pending", value: "pending" },
    { label: "Verified Unauthorized", value: "verified_unauthorized" },
    { label: "Verified Authorized", value: "verified_authorized" },
    { label: "Rejected", value: "rejected" },
  ];
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleAdminUpdate = async () => {
    try {
      setSaving(true);
      const token = await SecureStore.getItemAsync("authToken");
      const res = await apiRequest.patch(
        `/report/update/${reportId}`,
        { status, adminNotes },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReport(res.data.data);
      if (
        status === "verified_authorized" ||
        status === "verified_unauthorized"
      ) {
        dispatch(increaseVerifiedReports());
      } else if (status === "rejected") {
        dispatch(increaseRejectedReports());
      }
      goBackByRole();
    } catch (err: any) {
      console.error("Admin update failed", err.message);
    } finally {
      setSaving(false);
    }
  };

  const formatSubmittedAt = (dateLike: string | number | Date) => {
    const d = new Date(dateLike);
    const pad = (n: number) => n.toString().padStart(2, "0");
    const day = pad(d.getDate());
    const month = d.toLocaleString("en-US", { month: "long" });
    const year = d.getFullYear();
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    return `${day} ${month} ${year}, ${hours}:${minutes}`;
  };

  const toSentence = (s: string) => {
    const t = s?.replace(/_/g, " ").toLowerCase() || "";
    return t ? t.charAt(0).toUpperCase() + t.slice(1) : "";
  };

  const formatViolations = (v: string | string[]) => {
    const arr = Array.isArray(v) ? v : v ? [v] : [];
    return arr.map(toSentence).join(", ");
  };

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const token = await SecureStore.getItemAsync("authToken");
        const res = await apiRequest.get<{ data: any }>(
          `/report/details/${reportId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!res) throw new Error("Failed to fetch report");
        setReport(res.data.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [reportId]);

  const goBackByRole = () => {
    if (user?.role === "NormalUser") {
      router.push("/(tabs)/reports");
    } else if (user?.role === "AdminUser") {
      router.push("/(admin)/reports");
    } else {
      router.back();
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <LottieView
          source={require("../../assets/animations/loader.json")} // 👈 put your JSON path here
          autoPlay
          loop
          style={{ width: 150, height: 150 }}
        />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-6">
        <Text className="text-red-600 text-base mb-3">{error}</Text>
        <TouchableOpacity
          onPress={goBackByRole}
          className="bg-sky-600 px-5 py-3 rounded-2xl shadow-sm active:opacity-90"
        >
          <Text className="text-white font-semibold text-base">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const media: { uri: string; caption: string }[] = [];
  if (report?.imageURL)
    media.push({ uri: report.imageURL, caption: "Original Image" });
  if (report?.annotatedURL)
    media.push({ uri: report.annotatedURL, caption: "AI Annotation" });

  return (
    <View className="flex-1 bg-slate-50">
      {/* Top Bar */}
      <View className="bg-primary-dark px-4 py-3 shadow-lg">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={goBackByRole}
            className="h-10 w-10 rounded-full items-center justify-center active:opacity-70 bg-white/20"
            activeOpacity={0.8}
          >
            <FontAwesome name="chevron-left" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <Text className="ml-3 font-montserratBold text-xl text-white tracking-wide">
            Report Details
          </Text>
        </View>
      </View>
      <KeyboardAwareScrollView
        className="flex-1 bg-[#F9FAFB]"
        contentContainerStyle={{ flexGrow: 1 }}
        enableOnAndroid={true}
        extraScrollHeight={user?.role === "NormalUser" ? 180 : 80}
        keyboardShouldPersistTaps="handled"
      >
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 28 }}>
          {/* Report ID */}
          <View className="bg-white rounded-xl px-4 py-3 mb-4 shadow-sm border border-slate-200/60">
            <Text className="text-xs text-slate-500 uppercase font-montserrat tracking-wider">
              Report ID
            </Text>
            <Text className="font-montserratBold text-base text-slate-800 mt-1 select-all">
              {report._id}
            </Text>
          </View>

          {/* Images */}
          <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
            <Text className="font-montserratBold text-xl text-slate-900 mb-2">
              Images
            </Text>
            {media.length === 0 ? (
              <Text className="italic text-slate-500">No images available</Text>
            ) : (
              media.map((m, idx) => (
                <View key={`${m.uri}-${idx}`} className="mb-5">
                  <Image
                    source={{ uri: m.uri }}
                    className="w-full h-52 rounded-2xl bg-slate-200"
                    resizeMode="cover"
                  />
                  <Text className="text-sm text-slate-600 mt-2 text-center font-montserrat">
                    {m.caption}
                  </Text>
                </View>
              ))
            )}
          </View>

          {/* Status + Stats */}
          <View className="bg-white rounded-2xl p-4 shadow-sm mb-5">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <FontAwesome name="flag" size={16} color="#0ea5e9" />
                <Text className="ml-2 font-montserratBold text-lg text-slate-900">
                  Status
                </Text>
              </View>
              <Text
                className={`px-3 py-1 rounded-full text-xs font-montserratBold ${
                  report.status?.toLowerCase() === "resolved"
                    ? "bg-emerald-100 text-emerald-700"
                    : report.status?.toLowerCase() === "pending"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-sky-100 text-sky-700"
                }`}
              >
                {report.status?.toUpperCase()}
              </Text>
            </View>

            {/* Stats */}
            <View className="flex-row gap-3 mt-4">
              <StatCard
                icon={<FontAwesome name="arrow-up" size={14} color="#0ea5e9" />}
                label="Upvotes"
                value={report.upvotes?.length || 0}
                containerClass="bg-sky-50"
              />
              <StatCard
                icon={
                  <FontAwesome name="arrow-down" size={14} color="#f43f5e" />
                }
                label="Downvotes"
                value={report.downvotes?.length || 0}
                containerClass="bg-rose-50"
              />
              <StatCard
                icon={<FontAwesome name="star" size={14} color="#8b5cf6" />}
                label="XP"
                value={report.xpAwarded || 0}
                containerClass="bg-violet-50"
              />
            </View>
          </View>

          {/* Accordion sections */}
          <View className="bg-white p-5 rounded-2xl shadow-sm mb-4">
            <AccordionItem title="Issue Description" defaultOpen>
              <Text className="font-montserrat text-base text-slate-800 leading-6">
                {" "}
                {report.issueDescription}
              </Text>
            </AccordionItem>

            {/* change */}
            <AccordionItem title="Violation Type" defaultOpen>
              <Text className="font-montserrat text-base text-slate-800 leading-6">
                {formatViolations(report.violationType)}
              </Text>
            </AccordionItem>

            <AccordionItem title="Reported By">
              <Text className="font-montserrat text-base text-slate-800">
                {report.reportedBy?.username} ({report.reportedBy?.email})
              </Text>
            </AccordionItem>

            {/* change */}
            <AccordionItem title="Submitted At">
              <Text className="font-montserrat text-base text-slate-800">
                {report?.submittedAt
                  ? formatSubmittedAt(report.submittedAt)
                  : "—"}
              </Text>
            </AccordionItem>

            <AccordionItem title="Location">
              <View>
                <Text className="font-montserrat text-base text-slate-800">
                  {report.location?.address || "N/A"}
                </Text>
                {!!report.location?.coordinates?.length && (
                  <View className="flex-row items-center mt-1">
                    <FontAwesome name="map-marker" size={14} color="#334155" />
                    <Text className="font-montserrat ml-2 text-sm text-slate-600">
                      {report.location?.coordinates?.join(", ")}
                    </Text>
                  </View>
                )}
              </View>
            </AccordionItem>

            <AccordionItem title="Suspected Dimensions">
              <Text className="font-montserrat text-base text-slate-800">
                Height: {report.suspectedDimensions?.height} | Width:
                {report.suspectedDimensions?.width}
              </Text>
            </AccordionItem>

            {/* add qr code detected */}
            <AccordionItem title="QR Code Detected">
              <Text className="font-montserrat text-base text-slate-800">
                {report.qrCodeDetected ? "Yes" : "No"}
              </Text>
            </AccordionItem>

            <AccordionItem title="AI Analysis" defaultOpen>
              {/* Verdict row with icon */}
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center">
                  <FontAwesome
                    name={
                      report.aiAnalysis?.verdict?.toLowerCase() === "violation"
                        ? "exclamation-circle"
                        : "check-circle"
                    }
                    size={18}
                    color={
                      report.aiAnalysis?.verdict?.toLowerCase() === "violation"
                        ? "#ef4444"
                        : "#10b981"
                    }
                  />
                  <Text className="ml-2 font-montserratBold text-base text-slate-900">
                    {report.aiAnalysis?.verdict || "N/A"}
                  </Text>
                </View>
              </View>

              {/* Confidence gradient bar */}
              <View className="mb-4">
                <Text className="font-montserrat text-xs text-slate-500 uppercase tracking-wider mb-1">
                  Confidence
                </Text>
                <View className="h-3 w-full rounded-full bg-slate-200 overflow-hidden">
                  <LinearGradient
                    colors={["#38bdf8", "#8b5cf6"]} // sky → violet
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(0, (report.aiAnalysis?.confidence ?? 0) * 100)
                      )}%`,
                      height: "100%",
                      borderRadius: 999,
                    }}
                  />
                </View>
                <Text className="font-montserrat text-sm text-slate-700 mt-1">
                  {((report.aiAnalysis?.confidence ?? 0) * 100).toFixed(2)}%
                </Text>
              </View>

              {/* Detected objects (subtle chips for readability) */}
              <View className="mt-1">
                <Text className="font-montserrat text-xs text-slate-500 uppercase tracking-wider mb-1">
                  Detected Objects
                </Text>
                {Array.isArray(report.aiAnalysis?.detectedObjects) &&
                report.aiAnalysis.detectedObjects.length > 0 ? (
                  <View className="flex-row flex-wrap gap-2">
                    {report.aiAnalysis.detectedObjects.map(
                      (obj: string, i: number) => (
                        <View
                          key={`${obj}-${i}`}
                          className="px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200"
                        >
                          <Text className="font-montserrat text-xs text-slate-700">
                            {toSentence(obj)}
                          </Text>
                        </View>
                      )
                    )}
                  </View>
                ) : (
                  <Text className="font-montserrat text-base text-slate-800">
                    —
                  </Text>
                )}
              </View>
            </AccordionItem>
          </View>

          {user?.role === "AdminUser" && (
            <View className="bg-white rounded-2xl p-5 mb-4 border border-border">
              <Text className="font-montserratBold text-lg text-slate-900 mb-4">
                Admin Actions
              </Text>

              {/* Status Dropdown */}
              <Text className="text-slate-700 font-montserrat mb-2">
                Change Status
              </Text>
              <View className="mb-4">
                <View>
                  {/* Dropdown control (unchanged logic) */}
                  <TouchableOpacity
                    onPress={() => setDropdownOpen((v) => !v)}
                    activeOpacity={0.85}
                    className="border border-slate-300 rounded-xl px-3 py-2 bg-white flex-row items-center justify-between"
                  >
                    <Text className="text-slate-900 font-montserrat text-base">
                      {STATUS_OPTIONS.find((o) => o.value === status)?.label ??
                        "Select status"}
                    </Text>
                    <FontAwesome
                      name={dropdownOpen ? "chevron-up" : "chevron-down"}
                      size={14}
                      color="#475569"
                    />
                  </TouchableOpacity>

                  {/* Inline dropdown list: part of normal layout so it pushes content down */}
                  <AnimatePresence>
                    {dropdownOpen && (
                      <MotiView
                        key="inline-dropdown"
                        from={{ opacity: 0, translateY: -8, scale: 0.985 }}
                        animate={{ opacity: 1, translateY: 0, scale: 1 }}
                        transition={{ type: "timing", duration: 220 }}
                        className="mt-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
                        style={{ willChange: "transform, opacity" }}
                      >
                        <ScrollView className="max-h-52">
                          {STATUS_OPTIONS.map((opt) => {
                            const active = opt.value === status;
                            return (
                              <TouchableOpacity
                                key={opt.value}
                                onPress={() => {
                                  setStatus(opt.value);
                                  setDropdownOpen(false);
                                }}
                                activeOpacity={0.85}
                                className="flex-row items-center justify-between px-3 py-3"
                              >
                                <Text
                                  className="font-montserrat text-base"
                                  style={{
                                    color: active ? "#6C4FE0" : "#1F2937",
                                  }}
                                >
                                  {opt.label}
                                </Text>

                                {active ? (
                                  <Ionicons
                                    name="checkmark"
                                    size={18}
                                    color="#6C4FE0"
                                  />
                                ) : (
                                  <View style={{ width: 18 }} />
                                )}
                              </TouchableOpacity>
                            );
                          })}
                        </ScrollView>
                      </MotiView>
                    )}
                  </AnimatePresence>
                </View>
              </View>

              {/* Admin Notes */}
              <Text className="text-slate-700 font-montserrat mb-2">
                Admin Notes
              </Text>
              <TextInput
                multiline
                value={adminNotes}
                onChangeText={setAdminNotes}
                placeholder="Write your notes..."
                className="border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-montserrat mb-4 bg-slate-50"
                style={{ minHeight: 80, textAlignVertical: "top" }}
              />

              {/* Save Button */}
              <TouchableOpacity
                onPress={handleAdminUpdate}
                disabled={saving}
                className="bg-primary-dark px-5 py-3 rounded-2xl shadow-sm active:opacity-90"
              >
                <Text className="text-white text-center text-base font-montserrat">
                  {saving ? "Saving..." : "Save Changes"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAwareScrollView>
    </View>
  );
};

export default ReportDetails;

/* ---------- Helpers ---------- */
const AccordionItem = ({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <View className="mb-3">
      <TouchableOpacity
        onPress={() => setOpen((v) => !v)}
        className="flex-row items-center justify-between py-3"
        activeOpacity={0.8}
      >
        <Text className="font-montserratBold text-base text-slate-900">
          {title}
        </Text>
        <FontAwesome
          name="chevron-down"
          size={14}
          color="#475569"
          style={{ transform: [{ rotate: open ? "180deg" : "0deg" }] }}
        />
      </TouchableOpacity>

      <AnimatePresence>
        {open && (
          <MotiView
            from={{ opacity: 0, translateY: -6 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 200 }}
          >
            <View className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              {children}
            </View>
          </MotiView>
        )}
      </AnimatePresence>
    </View>
  );
};

const StatCard = ({
  icon,
  label,
  value,
  containerClass = "",
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  containerClass?: string;
}) => (
  <View className={`flex-1 rounded-xl px-3 py-3 ${containerClass}`}>
    <View className="flex-row items-center justify-center">
      {icon}
      <Text className="ml-2 text-xs font-montserratBold text-slate-600">
        {label}
      </Text>
    </View>
    <Text className="mt-1.5 text-2xl text-center font-montserratBold text-slate-900">
      {value}
    </Text>
  </View>
);
