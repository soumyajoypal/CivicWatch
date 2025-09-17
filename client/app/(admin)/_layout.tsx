import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

const AdminTabIcon = ({
  name,
  color,
  size,
  focused,
}: {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
  size: number;
  focused: boolean;
}) => (
  <View style={[styles.iconWrapper, focused && styles.iconWrapperActive]}>
    <Ionicons name={name} size={size} color={color} />
  </View>
);

const _layout = () => {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          marginHorizontal: 20,
          marginBottom: 10,
          height: 55,
          position: "absolute",
          borderRadius: 30,
          backgroundColor: "#6C4FE0",
        },
        tabBarActiveTintColor: "#FFFFFF",
        tabBarInactiveTintColor: "#A78BFA",
        tabBarIconStyle: { margin: 8 },
        // 👇 disable Android ripple
        tabBarButton: (props) => (
          <TouchableOpacity {...(props as any)} activeOpacity={1} />
        ),
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <AdminTabIcon
              name="grid-outline"
              color={color}
              size={size}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <AdminTabIcon
              name="document-text-outline"
              color={color}
              size={size}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="manage-users"
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <AdminTabIcon
              name="people-outline"
              color={color}
              size={size}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <View
              style={[styles.iconWrapper, focused && styles.iconWrapperActive]}
            >
              <MaterialIcons name="leaderboard" size={size} color={color} />
            </View>
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <AdminTabIcon
              name="person-outline"
              color={color}
              size={size}
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  );
};

export default _layout;

const styles = StyleSheet.create({
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 50,
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  iconWrapperActive: {
    backgroundColor: "#A78BFA",
  },
});
