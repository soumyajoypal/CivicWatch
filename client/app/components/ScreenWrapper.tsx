import { useFocusEffect } from "@react-navigation/native";
import React, { useRef } from "react";
import { Animated } from "react-native";

interface AnimatedScreenWrapperProps {
  children: React.ReactNode;
}

export default function AnimatedScreenWrapper({ children }: AnimatedScreenWrapperProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const runAnimation = () => {
    fadeAnim.setValue(0);
    slideAnim.setValue(30);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Trigger animation every time the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      runAnimation();
    }, [])
  );

  return (
    <Animated.View
      style={{
        flex: 1,
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      {children}
    </Animated.View>
  );
}
