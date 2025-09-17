// app/(modals)/_layout.tsx
import { Stack } from "expo-router";

export default function ModalLayout() {
  return (
    <Stack screenOptions={{ presentation: "modal" }}>
      <Stack.Screen name="report" options={{ title: "Report Issue" }} />
    </Stack>
  );
}
