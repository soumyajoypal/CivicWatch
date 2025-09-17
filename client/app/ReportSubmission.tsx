import { refreshLocation } from "@/lib/Slices/locationSlice";
import {
  resetReport,
  setEstimatedDistance,
  setIssueDescription,
  setUserOverrideVerdict,
  submitReport,
} from "@/lib/Slices/reportSlice";
import { increaseReportCount } from "@/lib/Slices/userSlice";
import apiRequest from "@/lib/utils/apiRequest";
import { AppDispatch, RootState } from "@/store/store";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useFonts } from "expo-font";
import { useRouter } from "expo-router";
import { useSearchParams } from "expo-router/build/hooks";
import LottieView from "lottie-react-native";
import React, { useState } from "react";
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useDispatch, useSelector } from "react-redux";
import MapPicker from "./components/MapPicker";

export default function ReportSubmissionDemo() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const searchParams = useSearchParams();
  const imageUrl = searchParams.get("imageUrl");
  const decodedImageUrl = imageUrl ? decodeURIComponent(imageUrl) : "";
  const [fontsLoaded] = useFonts({
    Montserrat: require("../assets/fonts/Montserrat-Regular.ttf"),
    "Montserrat-Bold": require("../assets/fonts/Montserrat-Bold.ttf"),
  });

  const { location } = useSelector((s: RootState) => s.location);
  const {
    exifData,
    issueDescription,
    estimatedDistance,
    userOverrideVerdict,
    submitting,
  } = useSelector((s: RootState) => s.report);
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [verdict, setVerdict] = useState<any | null>(null);
  const [coords, setCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>({
    latitude: location?.coords.latitude || 0,
    longitude: location?.coords.longitude || 0,
  });

  const hasExifGPS = exifData?.GPSLatitude && exifData?.GPSLongitude;

  const handleAiAnalysis = async () => {
    try {
      setLoadingAi(true);
      setAiError(null);
      const loc = await dispatch(refreshLocation()).unwrap();
      const res = await apiRequest.post("/model/analyze", {
        url: decodedImageUrl,
        location: loc,
        exifData: exifData,
        estimatedDistance: Number(estimatedDistance) || null,
      });

      if (res.data.status === "success") {
        setVerdict(res.data.verdict);
        if (res.data.verdict?.aiAnalysis?.verdict) {
          dispatch(setUserOverrideVerdict(res.data.verdict.aiAnalysis.verdict));
        }
      } else {
        throw new Error("AI analysis failed");
      }
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || "AI analysis failed");
      Alert.alert("Error", "Failed to analyze hoarding. Try again.");
    } finally {
      setLoadingAi(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        imageURL: decodedImageUrl,
        annotatedURL: verdict?.annotatedImageUrl || "",
        issueDescription,
        violationType: verdict?.violations || null,
        location: location?.coords
          ? {
              type: "Point",
              coordinates: [
                coords?.longitude || location.coords.longitude,
                coords?.latitude || location.coords.latitude,
              ],
            }
          : null,
        suspectedDimensions: verdict?.details
          ? { width: verdict.details.width, height: verdict.details.height }
          : null,
        qrCodeDetected: verdict?.qrCodeDetected || false,
        aiAnalysis: {
          verdict: userOverrideVerdict,
          confidence: verdict?.aiAnalysis?.confidence || 0,
          detectedObjects: verdict?.aiAnalysis?.detectedObjects || [],
        },
      };
      await dispatch(submitReport(payload)).unwrap();
      await dispatch(increaseReportCount());
      Alert.alert("Success", "Your report has been submitted successfully!");
      dispatch(resetReport());
      router.push({
        pathname: "/(tabs)/reports",
        params: { fromSubmission: "true" },
      });
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to submit report");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAwareScrollView
        className="flex-1 bg-[#F9FAFB]"
        contentContainerStyle={{ flexGrow: 1 }}
        enableOnAndroid={true}
        extraScrollHeight={verdict ? 400 : 150}
        keyboardShouldPersistTaps="handled"
      >
        <ScrollView
          className="px-6"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            { paddingBottom: 28 },
            !verdict && { flexGrow: 1, justifyContent: "center" },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          {/* Title */}
          <View className="items-center mt-6 mb-2">
            <Text className="text-xl text-neutral-900 tracking-wide font-montserratBold">
              Submit Report
            </Text>
            <Text className="text-sm text-neutral-500 mt-1 font-montserrat">
              Help us verify and act on violations quickly
            </Text>
          </View>

          {/* Preview + Annotated in the SAME card */}
          {decodedImageUrl ? (
            <View
              className="bg-white rounded-3xl px-4 pt-4 pb-3 mb-3 border border-neutral-200 shadow-lg"
              style={{ elevation: 2 }}
            >
              {/* Original */}
              <Image
                source={{ uri: decodedImageUrl }}
                className="w-full h-52 rounded-2xl"
                resizeMode="cover"
              />
              <Text className="ml-1 text-xs text-neutral-500 mt-2 font-montserrat">
                Uploaded image
              </Text>

              {/* Annotated (after verdict) */}
              {verdict?.annotatedImageUrl ? (
                <>
                  <View className="h-[1px] bg-neutral-200 my-3" />
                  <Image
                    source={{ uri: verdict.annotatedImageUrl }}
                    className="w-full h-52 rounded-2xl"
                    resizeMode="cover"
                  />
                  <Text className="ml-1 text-xs text-neutral-500 mt-2 font-montserrat">
                    Annotated image
                  </Text>
                </>
              ) : null}
            </View>
          ) : null}

          {/* {!hasExifGPS && (
            <MapPicker
              initialLocation={coords ? { coords } : undefined}
              onLocationSelect={setCoords as any}
            />
          )} */}
          {!hasExifGPS && (
            <View
              className="bg-white rounded-3xl px-3 pt-3 pb-4 mb-3 border border-neutral-200 shadow-md"
              style={{ elevation: 2 }}
            >
              {/* Heading */}
              <Text className="text-lg font-montserratBold text-neutral-900 mb-2 ml-2">
                Select Location
              </Text>

              <View className="w-full h-52 rounded-2xl ">
                <MapPicker
                  initialLocation={coords ? { coords } : undefined}
                  onLocationSelect={setCoords as any}
                />
              </View>

              <Text className="ml-1 text-xs text-neutral-500 mt-2 font-montserrat">
                Tap to change your location.
              </Text>
            </View>
          )}

          {/* Distance Input + helper + Run AI (only BEFORE verdict) */}
          {!verdict && (
            <>
              <View className="flex-row items-center bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2 mb-2">
                <MaterialCommunityIcons
                  name="map-marker-distance"
                  size={24}
                  color="#9CA3AF"
                  className="mr-2"
                />
                <TextInput
                  className="flex-1 text-base text-neutral-900 font-montserrat"
                  placeholder="Write the Estimated distance (m)"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  value={
                    estimatedDistance != null ? String(estimatedDistance) : ""
                  }
                  onChangeText={(t) =>
                    dispatch(
                      setEstimatedDistance(Number(t.replace(/[^\d.]/g, "")))
                    )
                  }
                />
              </View>
              <Text className="text-xs text-neutral-500 font-montserrat">
                Please enter the distance between you and the billboard.
              </Text>

              <TouchableOpacity
                onPress={handleAiAnalysis}
                disabled={loadingAi}
                activeOpacity={0.8}
                className={`mt-3 py-3 rounded-full items-center justify-center ${
                  loadingAi ? "bg-primary-light" : "bg-primary-main"
                }`}
              >
                {loadingAi ? (
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <LottieView
                      source={require("../assets/animations/sparkels.json")}
                      autoPlay
                      loop
                      style={{ width: 30, height: 30 }}
                      // Optionally control speed:
                      // speed={1.2}
                    />
                  </View>
                ) : (
                  <Text className="text-white text-base tracking-wide font-montserratBold">
                    Run AI Analysis
                  </Text>
                )}
              </TouchableOpacity>
            </>
          )}

          {aiError && (
            <Text className="text-red-600 text-sm mt-3 font-montserrat">
              {aiError}
            </Text>
          )}

          {/* ===== Post‑Analysis UI ===== */}
          {verdict && (
            <View className="mt-2">
              {/* Details chips */}
              <Text className="text-xl font-montserratBold text-neutral-900 mb-2 tracking-wide">
                Details
              </Text>

              <View className="flex-row gap-2">
                {/* Location */}
                <View className="flex-1 bg-neutral-50 border border-neutral-200 rounded-2xl p-4 items-center justify-center">
                  <MaterialCommunityIcons
                    name="map-marker"
                    size={22}
                    color="#4C1D95" // 👈 primary-main indigo (adjust if you have your own palette)
                  />
                  <Text className="mt-1 text-sm text-primary-main font-montserrat">
                    Location
                  </Text>
                  <Text className="mt-1 text-xs text-neutral-900 font-montserratBold text-center">
                    {verdict.location.latitude}, {verdict.location.longitude}
                  </Text>
                </View>

                {/* Size */}
                <View className="flex-1 bg-neutral-50 border border-neutral-200 rounded-2xl p-4 items-center justify-center">
                  <MaterialCommunityIcons
                    name="ruler-square"
                    size={22}
                    color="#4C1D95" // primary-main
                  />
                  <Text className="mt-1 text-sm text-primary-main font-montserrat">
                    Size
                  </Text>
                  <Text className="mt-1 text-base text-neutral-900 font-montserratBold text-center">
                    {verdict.details.width} × {verdict.details.height}
                  </Text>
                </View>

                {/* Angle */}
                <View className="flex-1 bg-neutral-50 border border-neutral-200 rounded-2xl p-4 items-center justify-center">
                  <MaterialCommunityIcons
                    name="angle-acute"
                    size={22}
                    color="#4C1D95" // primary-main
                  />
                  <Text className="mt-1 text-sm text-primary-main font-montserrat">
                    Angle
                  </Text>
                  <Text className="mt-1 text-base text-neutral-900 font-montserratBold text-center">
                    {verdict.details.angle}°
                  </Text>
                </View>
              </View>

              {/* Violations */}
              <Text className="mt-5 text-xl font-montserratBold text-neutral-900 mb-2 tracking-wide">
                Violations Detected
              </Text>
              {Array.isArray(verdict.violations) &&
              verdict.violations.length > 0 ? (
                <View className="flex-row flex-wrap gap-2">
                  {verdict.violations.map((v: string, i: number) => (
                    <View
                      key={`${v}-${i}`}
                      className="px-3 py-2 rounded-full bg-neutral-100 border border-primary-light"
                    >
                      <Text className="text-[13px] text-neutral-900 font-montserrat">
                        {readable(v)}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text className="text-xs text-neutral-500 mt-2 font-montserrat">
                  No explicit violations found.
                </Text>
              )}

              {/* Verdict Box */}
              <View className="mt-4 bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex-row items-center justify-between">
                {/* Left side */}
                <View className="flex-1">
                  <Text className="text-sm text-neutral-700 font-montserrat mb-1">
                    AI Verdict
                  </Text>
                  <Text className="text-lg capitalize font-montserratBold text-primary-dark">
                    {verdict.aiAnalysis.verdict}
                  </Text>
                  {!!verdict.aiAnalysis?.detectedObjects?.length && (
                    <Text className="text-xs text-neutral-500 mt-1 font-montserrat">
                      Objects: {verdict.aiAnalysis.detectedObjects.join(", ")}
                    </Text>
                  )}
                </View>

                {/* Right side - Confidence */}
                <View className="items-center justify-center">
                  <Text className="text-2xl font-montserratBold text-primary-dark">
                    {(verdict.aiAnalysis.confidence * 100).toFixed(1)}%
                  </Text>
                  <Text className="text-[11px] text-neutral-500 font-montserrat">
                    confidence
                  </Text>
                </View>
              </View>

              {/* Agree / Override */}
              <View className="mt-6">
                <Text className="text-base font-montserratBold text-neutral-900 mb-3">
                  Do you agree with AI’s verdict?
                </Text>
                <View className="flex-row flex-wrap gap-3">
                  {[
                    { key: verdict.aiAnalysis.verdict, label: "Yes" },
                    {
                      key:
                        verdict.aiAnalysis.verdict === "unauthorized"
                          ? "authorized"
                          : "unauthorized",
                      label: "No",
                    },
                    { key: "unsure", label: "Not Sure" },
                  ].map((opt) => {
                    const selected = userOverrideVerdict === opt.key;
                    return (
                      <TouchableOpacity
                        key={opt.key}
                        onPress={() =>
                          dispatch(
                            setUserOverrideVerdict(
                              opt.key as
                                | "unauthorized"
                                | "authorized"
                                | "unsure"
                            )
                          )
                        }
                        activeOpacity={0.9}
                        className={`px-6 py-3 rounded-full border ${
                          selected
                            ? "bg-violet-600 border-violet-600"
                            : "bg-white border-neutral-300"
                        }`}
                      >
                        <Text
                          className={`text-sm font-montserrat ${
                            selected
                              ? "text-white font-montserratBold"
                              : "text-neutral-800"
                          }`}
                        >
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Description */}
              <View className="mt-6">
                <Text className="text-base font-montserratBold text-neutral-900 mb-3">
                  Issue Description
                </Text>
                <TextInput
                  className="bg-neutral-50 border border-neutral-200 rounded-2xl px-4 py-4 text-base text-neutral-900 min-h-[100px] font-montserrat"
                  placeholder="Describe what’s wrong (e.g. oversized, unsafe, near school)"
                  placeholderTextColor="#9CA3AF"
                  multiline
                  value={issueDescription}
                  onChangeText={(t) => dispatch(setIssueDescription(t))}
                />
              </View>

              {/* Submit */}
              <View className="mt-6">
                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={submitting}
                  activeOpacity={0.85}
                  className={`py-4 rounded-full items-center justify-center ${
                    submitting ? "bg-primary-light" : "bg-primary-main"
                  }`}
                >
                  <Text className="text-white text-lg font-montserratBold tracking-wide">
                    {submitting ? "Submitting..." : "Submit Report"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const readable = (s: string) =>
  s.replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
