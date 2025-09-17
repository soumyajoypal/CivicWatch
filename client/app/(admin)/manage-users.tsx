import apiRequest from "@/lib/utils/apiRequest";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { MotiView } from "moti";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

const ManageUsers = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [status, setStatus] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showFilter, setShowFilter] = useState(false);

  // Meta
  const [totalPages, setTotalPages] = useState(1);

  const router = useRouter();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await apiRequest.get("/user/all", {
        headers: {
          Authorization: `Bearer ${await SecureStore.getItemAsync("authToken")}`,
        },
        params: { status, search, page, limit: 10 },
      });

      setUsers(res.data.data);
      setTotalPages(res.data.meta.totalPages);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [status, page]);

  const renderUser = ({ item }: { item: any }) => {
    const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=6c3ef4&color=fff`;

    return (
      <View className="m-2 rounded-2xl bg-surface border border-border p-4 shadow-md">
        {/* Top Row: Avatar + text + status pill */}
        <View className="flex-row items-start">
          {/* Circle avatar */}
          <Image
            source={{ uri: avatar }}
            className="w-12 h-12 rounded-full mr-3 border-2"
            style={{ borderColor: "#6c4fe0ff" }} // optional purple ring
          />

          {/* Name + username + email */}
          <View className="flex-1">
            <Text
              className="font-montserratBold text-base text-text-primary"
              numberOfLines={1}
            >
              {item.name}
            </Text>
            <Text
              className="font-montserrat text-xs text-text-secondary"
              numberOfLines={1}
            >
              @{item.username}
            </Text>
            <Text
              className="font-montserrat text-xs text-text-disabled"
              numberOfLines={1}
            >
              {item.email}
            </Text>
          </View>

          {/* Right side: status + info icon */}
          <View className="items-end">
            {/* Status pill */}
            <Text
              className={[
                "px-2 py-0.5 rounded-full font-montserratBold text-[10px] mb-4",
                item.status === "active"
                  ? "bg-green-100 text-success"
                  : item.status === "inactive"
                    ? "bg-yellow-100 text-warning"
                    : "bg-red-100 text-error",
              ].join(" ")}
            >
              {item.status === "active" ? "active" : "unknown"}
            </Text>

            {/* Info icon */}
            <TouchableOpacity
              onPress={() => router.push(`/users/${item._id}`)}
              activeOpacity={0.6}
            >
              <Ionicons
                name="information-circle-outline"
                size={22}
                color="#4B5563" // dark grey
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-background">
      <View
        className="bg-primary-dark px-4 py-5 shadow-lg shadow-primary-dark/40 border-b border-primary-main/30"
        style={{
          zIndex: 10,
          elevation: 10,
        }}
      >
        <View className="flex-row items-center space-x-4">
          <Ionicons name="people-outline" size={24} color="#FFFFFF" />
          <Text className="ml-2 font-montserratBold text-xl text-white tracking-wide">
            Manage Users
          </Text>
        </View>
      </View>
      <View className="px-6 py-4">
        {/* Search Bar */}
        <View className="flex-row items-center bg-white border border-border rounded-xl px-3 mb-4">
          {/* Left search icon */}
          <Ionicons name="search-outline" size={20} color="#9CA3AF" />

          {/* Input */}
          <TextInput
            className="flex-1 px-2 py-4 text-sm font-montserrat text-text-primary"
            placeholder="Search by name, username, or email"
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={() => {
              setPage(1);
              fetchUsers();
            }}
            placeholderTextColor="#9CA3AF"
          />

          {/* Clear button */}
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")} className="ml-2">
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}

          {/* Filter button */}
          <TouchableOpacity
            onPress={() => setShowFilter((prev) => !prev)}
            activeOpacity={0.9}
            className="ml-2 w-9 h-9 rounded-lg bg-gray-100 items-center justify-center border border-gray-300"
          >
            <MotiView
              from={{ rotate: "0deg" }}
              animate={{ rotate: showFilter ? "180deg" : "0deg" }}
              transition={{ type: "timing", duration: 300 }}
            >
              <Ionicons
                name={showFilter ? "close" : "filter-outline"}
                size={20}
                color="#1F2937"
              />
            </MotiView>
          </TouchableOpacity>
        </View>

        {/* Filters */}
        {showFilter && (
          <View className="flex-row mb-4">
            {["all", "active", "inactive", "deleted"].map((s) => {
              const selected = status === s || (s === "all" && !status);
              return (
                <TouchableOpacity
                  key={s}
                  onPress={() => {
                    setStatus(s === "all" ? null : s);
                    setPage(1);
                  }}
                  className={[
                    "flex-1 px-3 py-2 mx-1 rounded-full",
                    selected ? "bg-primary-main" : "bg-gray-200",
                  ].join(" ")}
                >
                  <Text
                    className={[
                      "font-montserratBold text-center text-xs",
                      selected ? "text-white" : "text-text-primary",
                    ].join(" ")}
                  >
                    {s.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* User List */}
        {loading ? (
          <ActivityIndicator size="large" color="#6c3ef4" />
        ) : error ? (
          <Text style={{ color: "red" }}>{error}</Text>
        ) : (
          <FlatList
            data={users}
            keyExtractor={(item) => item._id}
            renderItem={renderUser}
          />
        )}

        {/* Pagination */}
        <View className="mt-4 mb-2 px-2">
          <View className="flex-row items-center justify-center gap-3">
            {/* Prev */}
            <TouchableOpacity
              disabled={page === 1}
              onPress={() => setPage((p) => Math.max(1, p - 1))}
              className={[
                "w-10 h-10 rounded-full items-center justify-center border",
                page === 1
                  ? "bg-white border-border"
                  : "bg-primary-main border-primary-main",
              ].join(" ")}
              activeOpacity={0.85}
            >
              <Ionicons
                name="chevron-back"
                size={18}
                color={page === 1 ? "#9CA3AF" : "#FFFFFF"}
              />
            </TouchableOpacity>

            {/* Page indicator */}
            <Text className="font-montserrat text-sm text-text-secondary">
              Page{" "}
              <Text className="font-montserratBold text-text-secondary">
                {page}
              </Text>{" "}
              / {totalPages}
            </Text>

            {/* Next */}
            <TouchableOpacity
              disabled={page === totalPages}
              onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
              className={[
                "w-10 h-10 rounded-full items-center justify-center border",
                page === totalPages
                  ? "bg-white border-border"
                  : "bg-primary-main border-primary-main",
              ].join(" ")}
              activeOpacity={0.85}
            >
              <Ionicons
                name="chevron-forward"
                size={18}
                color={page === totalPages ? "#9CA3AF" : "#FFFFFF"}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default ManageUsers;
