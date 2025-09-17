import apiRequest from "@/lib/utils/apiRequest";
import { RootState } from "@/store/store";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";

const UserDetails = () => {
  const { userId } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.user);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await apiRequest.get<{ data: any }>(
          `/user/details/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${await SecureStore.getItemAsync("token")}`,
            },
          }
        );
        if (!res) throw new Error("Failed to fetch user info");
        setUserInfo(res.data.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId]);

  const handleDeleteUser = async () => {
    Alert.alert("Delete User", "Are you sure you want to delete this user?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            setLoading(true);
            await apiRequest.delete(`/user/delete/${userId}`, {
              headers: {
                Authorization: `Bearer ${await SecureStore.getItemAsync("token")}`,
              },
            });
            Alert.alert("Success", "User deleted successfully");
            router.back();
          } catch (error) {
            Alert.alert("Error", "Failed to delete user");
            console.error(error);
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#6c4fe0ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-6">
        <Text className="font-montserrat text-error text-base mb-3">
          {error}
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-primary-main px-4 py-3 rounded-xl"
        >
          <Text className="font-montserratBold text-white">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background">
      {/* Top bar */}
      <View
        className="flex-row items-center p-3 border-b border-gray-200 bg-white"
        style={{
          shadowColor: "#000",
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-3"
        >
          <Ionicons name="chevron-back" size={20} color="#1F2937" />
        </TouchableOpacity>
        <Text className="font-montserratBold text-lg text-gray-900">
          User Details
        </Text>
      </View>

      {/* Avatar + name */}
      {/* Avatar Section */}
      <View className="items-center mt-6 mb-6 relative">
        <Image
          source={{ uri: userInfo.avatar }}
          className="w-28 h-28 rounded-full"
          style={{
            borderWidth: 3,
            borderColor: "#6c4fe0ff",
            shadowColor: "#6c4fe0",
            shadowOpacity: 0.25,
            shadowRadius: 8,
          }}
        />

        {/* Delete button (Admin only) */}
        {user?.role === "AdminUser" && (
          <TouchableOpacity
            onPress={handleDeleteUser}
            className="absolute top-0 right-4"
            activeOpacity={0.6}
            style={{ transform: [{ translateY: -10 }] }} // adjust vertical alignment
          >
            <FontAwesome name="trash" size={22} color="#DC2626" />
          </TouchableOpacity>
        )}
      </View>

      {/* Personal Information Card */}
      <View className="bg-white rounded-2xl px-5 py-6 mx-4 mb-3 border border-gray-200 shadow-sm">
        <Text className="font-montserratBold text-lg text-primary-main mb-3">
          Personal Information
        </Text>

        <InfoRow
          icon={<Ionicons name="id-card-outline" size={16} color="#1F2937" />}
          label="User ID"
          value={userInfo._id}
        />
        <Divider />

        <InfoRow
          icon={<Ionicons name="person-outline" size={16} color="#1F2937" />}
          label="Username"
          value={`@${userInfo.username}`}
        />
        <Divider />

        <InfoRow
          icon={
            <Ionicons name="person-circle-outline" size={16} color="#1F2937" />
          }
          label="Name"
          value={userInfo.name}
        />
        <Divider />

        <InfoRow
          icon={<Ionicons name="mail-outline" size={16} color="#1F2937" />}
          label="Email address"
          value={userInfo.email}
        />
      </View>

      {/* Profile Info Card */}
      <View className="bg-white rounded-2xl px-5 py-6 mx-4 mb-3 border border-gray-200 shadow-sm">
        <Text className="font-montserratBold text-lg text-primary-main mb-3">
          Account Statistics
        </Text>

        <InfoRow
          icon={<Ionicons name="star-outline" size={16} color="#1F2937" />}
          label="XP"
          value={String(userInfo.xp || 0)}
        />
        <Divider />

        <InfoRow
          icon={
            <Ionicons name="document-text-outline" size={16} color="#1F2937" />
          }
          label="Reports Verified"
          value={String(userInfo.reportsVerified || 0)}
        />
        <Divider />

        <InfoRow
          icon={
            <Ionicons
              name="shield-checkmark-outline"
              size={16}
              color="#1F2937"
            />
          }
          label="Status"
          value={userInfo.status === "active" ? "active" : "unknown"}
        />
      </View>
      {/* Badges Card */}
      <View className="bg-white rounded-2xl px-5 py-6 mx-4 border border-gray-200 shadow-sm">
        <Text className="font-montserratBold text-lg text-primary-main mb-2">
          Badges
        </Text>
        {userInfo.badges?.length > 0 ? (
          <View className="flex-row flex-wrap">
            {userInfo.badges.map((badge: any, idx: number) => (
              <View
                key={badge._id || idx}
                className="flex-row items-center bg-primary-main px-3 py-1.5 rounded-full mr-2 mb-2"
              >
                <FontAwesome name="trophy" size={14} color="#FFFFFF" />
                <Text className="font-montserratBold text-white text-xs ml-2">
                  {badge.name} {/* <-- instead of whole object */}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <Text className="font-montserrat text-gray-500 text-sm italic">
            No badges earned by the user yet
          </Text>
        )}
      </View>
    </ScrollView>
  );
};

const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <View className="flex-row items-center justify-between py-2">
    {/* Left side: Icon + Label */}
    <View className="flex-row items-center">
      {icon}
      <Text className="ml-2 font-montserratBold text-sm text-text-primary">
        {label}
      </Text>
    </View>

    {/* Right side: Value */}
    <Text
      className="font-montserrat text-sm text-gray-500 max-w-[60%] text-right"
      numberOfLines={1}
    >
      {value}
    </Text>
  </View>
);

const Divider = () => <View className="h-px bg-gray-200 my-1" />;

export default UserDetails;
