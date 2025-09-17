import { Ionicons } from "@expo/vector-icons";
import {
  useFonts,
} from "expo-font";
import { useState } from "react";
import {
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  imageUri: string;
}

export default function Report({
  visible,
  onClose,
  imageUri,
}: ReportModalProps) {
  const [issueCategory, setIssueCategory] = useState<string | null>(null);
  const [priority, setPriority] = useState<string>("Medium");
  const [otherText, setOtherText] = useState<string>("");

  const [fontsLoaded] = useFonts({
      "Montserrat": require("../../assets/fonts/Montserrat-Regular.ttf"),
      "Montserrat-Bold":require("../../assets/fonts/Montserrat-Bold.ttf") // adjust path
    });

  if (!fontsLoaded) return null;

  const issueCategories = [
    { id: "vulgar", label: "Vulgar content", icon: "alert-circle" },
    { id: "broken", label: "Billboard broken", icon: "construct" },
    { id: "other", label: "Other", icon: "ellipsis-horizontal" },
  ];

  const priorities = [
    { id: "low", label: "Low", color: "bg-blue-500" },
    { id: "medium", label: "Medium", color: "bg-yellow-500" },
    { id: "high", label: "High", color: "bg-red-500" },
  ];

  const handleSubmit = () => {
    console.log({
      imageUri,
      issueCategory,
      otherText: issueCategory === "other" ? otherText : null,
      priority,
      location: "Baguiati,Kolkata", // example
    });
    alert("Report submitted!");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <GestureHandlerRootView className="flex-1">
        <View className="flex-1 bg-black/50">
          {/* Backdrop */}
          <TouchableOpacity
            className="flex-1"
            activeOpacity={1}
            onPress={onClose}
          />

          {/* Bottom Sheet */}
          <View className="bg-white rounded-t-3xl">
            {/* Handle bar */}
            <View className="items-center py-3">
              <View className="w-12 h-1 bg-gray-300 rounded-full" />
            </View>

            {/* Header */}
            <View className="flex-row items-center justify-between px-6 pb-4">
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="chevron-back" size={24} color="#666" />
              </TouchableOpacity>
              <Text
                className="text-lg text-gray-800 font-montserrat"
              >
                Report an issue
              </Text>
              <View className="w-6" />
            </View>

            <ScrollView
              className="px-6"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 24 }}
            >
              {/* Issue Category */}
              <View className="mb-6">
                <Text
                  className="text-base text-gray-800 mb-4 font-montserratBold"
                >
                  Issue category
                </Text>
                <View className="flex-row gap-3 flex-wrap">
                  {issueCategories.map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      className={`flex-1 p-4 rounded-xl border-2 items-center ${
                        issueCategory === category.id
                          ? "border-purple-500 bg-purple-50"
                          : "border-gray-200 bg-gray-50"
                      }`}
                      onPress={() => setIssueCategory(category.id)}
                    >
                      <View
                        className={`w-8 h-8 rounded-lg items-center justify-center mb-2 ${
                          issueCategory === category.id
                            ? "bg-purple-500"
                            : "bg-gray-300"
                        }`}
                      >
                        <Ionicons
                          name={category.icon as any}
                          size={16}
                          color={issueCategory === category.id ? "white" : "#666"}
                        />
                      </View>
                      <Text
                        className={`text-xs font-montserrat font-medium text-center ${
                          issueCategory === category.id
                            ? "text-purple-600"
                            : "text-gray-600"
                        }`}
                      >
                        {category.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Show TextInput if "Other" selected */}
                {issueCategory === "other" && (
                  <TextInput
                    className="mt-4 border border-gray-300 rounded-xl p-3 text-gray-700 font-montserrat"
                    placeholder="Describe the issue..."
                    value={otherText}
                    onChangeText={setOtherText}
                    multiline
                  />
                )}
              </View>

              {/* Issue Location */}
              <View className="mb-6">
                <Text
                  className="text-base text-gray-800 mb-3 font-montserratBold"
                >
                  Issue location
                </Text>
                <View className="flex-row items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <View className="flex-row items-center gap-3">
                    <View className="w-6 h-6 bg-purple-500 rounded-full items-center justify-center">
                      <View className="w-2 h-2 bg-white rounded-full" />
                    </View>
                    <View>
                      <Text
                        className="text-gray-800 font-montserratBold"
                      >
                        Baguiati, Kolkata
                      </Text>
                      <Text
                        className="text-sm text-gray-500 font-montserrat"
                      >
                        49.048294, 19.164292
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity>
                    <Text
                      className="text-purple-500 font-montserratBold"
                    >
                      Change
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Issue Priority */}
              <View>
                <Text
                  className="text-base text-gray-800 mb-4 font-montserratBold"
                >
                  Issue priority
                </Text>
                <View className="flex-row gap-3">
                  {priorities.map((p) => (
                    <TouchableOpacity
                      key={p.id}
                      className={`flex-1 py-3 px-4 rounded-xl ${
                        priority === p.label ? `${p.color}` : "bg-gray-100"
                      }`}
                      onPress={() => setPriority(p.label)}
                    >
                      <Text
                        className={`text-center font-montserratBold ${
                          priority === p.label ? "text-white" : "text-gray-600"
                        }`}
                      >
                        {p.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            {/* Submit Button */}
            <View className="p-6 border-t border-gray-100">
              <TouchableOpacity
                className="bg-purple-600 py-4 rounded-2xl items-center"
                onPress={handleSubmit}
              >
                <Text
                  className="text-white text-lg font-montserratBold"
                >
                  Submit issue
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}
