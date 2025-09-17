import { Ionicons } from "@expo/vector-icons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Tabs, router } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

const _layout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarStyle: {
          marginHorizontal: 20,
          marginBottom: 10,
          height: 55,
          position: "absolute",
          borderRadius: 30,
          backgroundColor: "#6C4FE0",
        },
        tabBarActiveTintColor: "#FFFFFF", // active icon color white
        tabBarInactiveTintColor: "#A78BFA", // inactive icon gray
        tabBarIconStyle: {
          margin: 8,
        },
        // 👇 disable Android ripple
        tabBarButton: (props) => (
          <TouchableOpacity {...(props as any)} activeOpacity={1} />
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <View
              style={[styles.iconWrapper, focused && styles.iconWrapperActive]}
            >
              <Ionicons name="home-outline" size={size} color={color} />
            </View>
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <View
              style={[styles.iconWrapper, focused && styles.iconWrapperActive]}
            >
              <Ionicons
                name="document-text-outline"
                size={size}
                color={color}
              />
            </View>
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="camera-launcher"
        options={{
          title: "Camera",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="camera-outline" size={size} color={"#FFFFFF"} />
          ),
          // Custom floating button
          tabBarButton: ({ children }) => (
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={() => router.push("/camera")}
            >
              {children}
            </TouchableOpacity>
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
          tabBarIcon: ({ focused, color, size }) => (
            <View
              style={[styles.iconWrapper, focused && styles.iconWrapperActive]}
            >
              <Ionicons name="person-outline" size={size} color={color} />
            </View>
          ),
          headerShown: false,
        }}
      />
    </Tabs>
  );
};

export default _layout;

const styles = StyleSheet.create({
  cameraButton: {
    top: -25, // lift the button above tab bar
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: "#A78BFA", // purple
    justifyContent: "center",
    alignItems: "center",
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 50,
    padding: 8,
  },
  iconWrapperActive: {
    backgroundColor: "#A78BFA", // lighter gray highlight for active tab
  },
});
