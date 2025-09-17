import { ActivityIndicator, Image, StyleSheet, View } from "react-native";

export default function Splash() {
  return (
    <View style={styles.container}>
      {/* Replace text with logo */}
      <Image
        source={require("../assets/images/billguardLogo.png")}
        style={styles.logo}
        resizeMode="contain"
      />
      {/* Purple activity indicator */}
      <ActivityIndicator size="large" color="#7C3AED" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  logo: { width: 220, height: 220, marginBottom: 20 },
});
