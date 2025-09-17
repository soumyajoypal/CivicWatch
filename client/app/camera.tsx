import { setExifData } from "@/lib/Slices/reportSlice";
import { uploadUserImage } from "@/lib/Slices/userSlice";
import { AppDispatch, RootState } from "@/store/store";
import { Ionicons } from "@expo/vector-icons";
import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import { useFonts } from "expo-font";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

export default function Camera() {
  const [fontsLoaded] = useFonts({
    Montserrat: require("../assets/fonts/Montserrat-Regular.ttf"),
    "Montserrat-Bold": require("../assets/fonts/Montserrat-Bold.ttf"),
  });

  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [image, setImage] = useState<string | null>(null);
  const [imageAspectRatio, setImageAspectRatio] = useState<number | null>(null);
  const [showCamera, setShowCamera] = useState(true);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadedImageURL, setUploadedImageURL] = useState<string | null>(null);
  const [cameraRatio, setCameraRatio] = useState<string | undefined>(undefined);

  const cameraRef = useRef<CameraView>(null);
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { status, error } = useSelector(
    (state: RootState) => state.user as { status: string; error?: string }
  );

  // Unlock orientation while camera is open
  useEffect(() => {
    (async () => {
      try {
        await ScreenOrientation.unlockAsync();
      } catch {}
    })();
    return () => {
      ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP
      ).catch(() => {});
    };
  }, []);

  useEffect(() => {
    if (!permission) return;
    if (!permission.granted) requestPermission();
  }, [permission]);

  const toggleCameraFacing = () =>
    setFacing((current) => (current === "back" ? "front" : "back"));

  const onCameraReady = () => {
    if (Platform.OS !== "android") return;

    try {
      const { width, height } = Dimensions.get("window");
      const screenRatio = Math.max(width, height) / Math.min(width, height);

      const desiredRatio =
        Math.abs(16 / 9 - screenRatio) < Math.abs(4 / 3 - screenRatio)
          ? "16:9"
          : "4:3";

      setCameraRatio(desiredRatio as any);
    } catch {
      // no-op
    }
  };

  const normalizeAndSet = async (uri: string) => {
    try {
      const normalized = await ImageManipulator.manipulateAsync(uri, [], {
        compress: 1,
        format: ImageManipulator.SaveFormat.JPEG,
      });
      await new Promise<void>((resolve, reject) => {
        Image.getSize(
          normalized.uri,
          (w, h) => {
            setImageAspectRatio(w / h);
            resolve();
          },
          (e) => reject(e)
        );
      });
      setImage(normalized.uri);
      setShowCamera(false);
    } catch {
      setImage(uri);
      setImageAspectRatio(null);
      setShowCamera(false);
    }
  };

  const takePicture = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1,
        exif: true,
        skipProcessing: false,
      });
      if (photo) {
        await normalizeAndSet(photo.uri);
        dispatch(setExifData(photo.exif || {}));
      }
    } catch {
      Alert.alert("Error", "Failed to take picture");
    }
  };

  const openGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
      exif: true,
    });

    if (!result.canceled) {
      await normalizeAndSet(result.assets[0].uri);
      dispatch(setExifData(result.assets[0].exif || {}));
    }
  };

  const retakePhoto = () => {
    setImage(null);
    setImageAspectRatio(null);
    setShowCamera(true);
  };

  const submitPhoto = async () => {
    if (!image) return;
    const formData = new FormData();
    formData.append("image", {
      uri: image,
      name: `photo${Date.now()}.jpg`,
      type: "image/jpeg",
    } as any);

    try {
      const url = await dispatch(uploadUserImage(formData)).unwrap();
      setUploadedImageURL(url);
      setUploadSuccess(true);
    } catch (err: any) {
      Alert.alert("Upload Failed", err?.message || "Something went wrong");
    }
  };

  if (uploadSuccess) {
    return (
      <View className="flex-1 bg-text-primary">
        {/* Center content vertically */}
        <View className="flex-1 items-center justify-center px-6">
          {/* Card */}
          <View className="w-full bg-white rounded-3xl border border-neutral-200 shadow-lg p-5">
            {/* Success badge */}
            <View className="w-14 h-14 rounded-full bg-emerald-100 items-center justify-center self-center mb-3">
              <Ionicons name="checkmark" size={28} color="#059669" />
            </View>

            {/* Heading + Subtext */}
            <Text className="text-2xl text-neutral-900 text-center font-montserratBold">
              Image uploaded successfully!
            </Text>
            <Text className="text-sm text-neutral-500 text-center mt-1 font-montserrat">
              Your photo is ready. Continue to submit a report or retake the
              image.
            </Text>

            {/* Actions */}
            <View className="mt-5">
              {/* Proceed */}
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Go to Report Submission"
                onPress={() => {
                  setUploadSuccess(false);
                  setImage(null);
                  setShowCamera(true);
                  router.push(
                    `/ReportSubmission?imageUrl=${encodeURIComponent(
                      uploadedImageURL ?? ""
                    )}`
                  );
                }}
                activeOpacity={0.9}
                className="w-full rounded-full bg-primary-main py-4 flex-row items-center justify-center"
              >
                <Ionicons name="document-text-outline" size={20} color="#fff" />
                <Text className="ml-2 text-white text-base tracking-wide font-montserratBold">
                  Go to Report Submission
                </Text>
              </TouchableOpacity>

              {/* Retake */}
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Retake Photo"
                onPress={() => {
                  setUploadSuccess(false);
                  retakePhoto();
                }}
                activeOpacity={0.9}
                className="w-full rounded-full bg-neutral-100 border border-neutral-200 py-4 flex-row items-center justify-center mt-3"
              >
                <Ionicons name="camera-outline" size={20} color="#111827" />
                <Text className="ml-2 text-neutral-900 text-base font-montserratBold">
                  Retake
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  }

  // 📸 Camera view
  if (showCamera) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          facing={facing}
          ref={cameraRef}
          onCameraReady={onCameraReady}
          ratio={Platform.OS === "android" ? (cameraRatio as any) : undefined}
        >
          <View style={styles.bottomControls}>
            <TouchableOpacity
              style={styles.galleryButton}
              onPress={openGallery}
            >
              <Ionicons name="images" size={24} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.captureButton}
              onPress={takePicture}
            >
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.flipButton}
              onPress={toggleCameraFacing}
            >
              <Ionicons name="camera-reverse" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    );
  }

  // 🖼️ Preview with upload
  if (image) {
    return (
      <View style={styles.previewContainer}>
        <Image
          source={{ uri: image }}
          style={[
            styles.preview,
            imageAspectRatio
              ? imageAspectRatio > 1
                ? { width: "95%", aspectRatio: imageAspectRatio }
                : { width: "95%", height: "80%" }
              : { width: "95%", height: "80%" },
          ]}
          resizeMode="contain"
        />
        <View style={styles.previewControls}>
          <TouchableOpacity
            style={styles.retakeButton}
            onPress={retakePhoto}
            activeOpacity={0.8}
          >
            <Ionicons name="camera" size={20} color="#EF4444" />
            <Text
              style={styles.retakeButtonText}
              className="font-montserratBold"
            >
              Retake
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.proceedButton,
              status === "loading" && styles.proceedButtonDisabled,
            ]}
            onPress={submitPhoto}
            disabled={status === "loading"}
            activeOpacity={0.8}
          >
            {status === "loading" ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons name="checkmark" size={20} color="white" />
                <Text
                  style={styles.proceedButtonText}
                  className="font-montserratBold"
                >
                  Submit
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
        {status === "failed" && error && (
          <Text style={styles.errorText}>{error}</Text>
        )}
      </View>
    );
  }

  return (
    <View style={styles.loadingContainer}>
      <Text style={styles.loadingText} className="font-montserrat">
        Camera not available
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cameraContainer: { flex: 1, backgroundColor: "#000" },
  camera: { flex: 1 },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000",
  },
  loadingText: { fontSize: 16, color: "white", fontWeight: "500" },
  successText: {
    fontSize: 18,
    color: "#28a745",
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 24,
  },
  successControls: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 16,
  },
  bottomControls: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingBottom: 50,
    paddingTop: 30,
  },
  galleryButton: {
    width: 50,
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.8)",
  },
  captureButtonInner: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: "white",
  },
  flipButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  previewContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  preview: {
    padding: 30,
    marginBottom: 20,
    // width/height applied inline based on aspect ratio
  },
  previewControls: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    paddingHorizontal: 20,
  },
  retakeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 30,
    backgroundColor: "#FEE2E2", // light red background
    borderWidth: 1,
    borderColor: "#EF4444", // red border
    marginRight: 10,
  },
  retakeButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
    color: "#EF4444", // red text
  },
  proceedButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 30,
    backgroundColor: "#6C4FE0", // your brand purple
    shadowColor: "#6C4FE0",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  proceedButtonDisabled: {
    backgroundColor: "#9CA3AF", // gray when disabled
  },
  proceedButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  errorText: {
    color: "red",
    fontSize: 16,
    marginTop: 16,
    textAlign: "center",
    fontWeight: "500",
  },
});
