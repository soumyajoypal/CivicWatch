import { Slot } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import { store } from "../store/store";
import ThemeProvider from "./context/ThemeContext";
import "./global.css";
export default function RootLayout() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <ThemeProvider>
          <SafeAreaView style={{flex:1}} edges={["top","bottom"]}>
            <Slot></Slot>
        </SafeAreaView>
        </ThemeProvider>
      </SafeAreaProvider>
    </Provider>
  );
}
