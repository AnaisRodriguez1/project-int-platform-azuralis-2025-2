import React from "react";
import { ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "./context/AuthContext";
import { LoginScreen } from "./pages/LoginScreen";
import { DashboardClinicalStaff } from "./pages/ClinicalStaff/DashboardClinicalStaff";
import { DashboardPatient } from "./pages/Patient/DashboardPatient";
import { DashboardGuardian } from "./pages/Guardian/DashboardGuardian";
import type { UserRole } from "./types/medical";

// 🔹 Helper para definir la ruta inicial según el rol
const getDashboardRoute = (role: UserRole): keyof RootStackParamList => {
  switch (role) {
    case "doctor":
    case "nurse":
      return "DashboardClinical";
    case "patient":
      return "DashboardPatient";
    case "guardian":
      return "DashboardGuardian";
    default:
      return "Login";
  }
};

export type RootStackParamList = {
  Login: undefined;
  DashboardClinical: undefined;
  DashboardPatient: undefined;
  DashboardGuardian: undefined;
};

// 🔹 Stack Navigator (en lugar de BrowserRouter)
const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const { isAuthenticated, isLoading, user } = useAuth();

  // 🔸 Mientras carga la sesión
  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={isAuthenticated && user ? getDashboardRoute(user.role) : "Login"}
        screenOptions={{ headerShown: false }}
      >
        {/* Ruta pública */}
        <Stack.Screen name="Login" component={LoginScreen} />

        {/* Rutas protegidas */}
        {isAuthenticated && (
          <>
            <Stack.Screen name="DashboardClinical" component={DashboardClinicalStaff} />
            <Stack.Screen name="DashboardPatient" component={DashboardPatient} />
            <Stack.Screen name="DashboardGuardian" component={DashboardGuardian} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
