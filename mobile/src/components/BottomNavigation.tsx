import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export interface NavTab {
  id: string;
  icon: LucideIcon;
  label: string;
}

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  accentColor: string;
  tabs: NavTab[];
}

/**
 * Bottom navigation adaptado para React Native.
 * Compatible con lucide-react-native.
 */
export function BottomNavigation({
  activeTab,
  onTabChange,
  accentColor,
  tabs,
}: BottomNavigationProps) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navWrapper}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => onTabChange(tab.id)}
              style={[
                styles.tabButton,
                isActive && { backgroundColor: accentColor },
              ]}
              accessibilityLabel={tab.label}
              accessibilityState={{ selected: isActive }}
            >
              <Icon
                size={22}
                color={isActive ? "white" : "#6B7280" /* gray-500 */}
                style={{ marginBottom: 3 }}
              />
              <Text
                style={[
                  styles.tabLabel,
                  { color: isActive ? "white" : "#6B7280" },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderTopWidth: 1,
    borderColor: "#E5E7EB", // gray-200
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  navWrapper: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
});
