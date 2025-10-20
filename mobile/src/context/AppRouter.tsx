import React from "react";
import { ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";

import { HomePage } from "../pages/HomePage";
import { RegisterScreen } from "../pages/RegisterScreen";
import { DashboardClinicalStaff } from "../pages/ClinicalStaff/DashboardClinicalStaff";
import { DashboardPatient } from "../pages/Patient/DashboardPatient";
import { DashboardGuardian } from "../pages/Guardian/DashboardGuardian";
import { LoginScreen } from "../pages/LoginScreen";

// 🔹 Definimos los tipos de pantallas del stack
export type RootStackParamList = {
  Home: undefined;
  Register: undefined;
  DashboardClinicalStaff: undefined;
  DashboardPatient: undefined;
  DashboardGuardian: undefined;
};

// 🔹 Stack principal
const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppRouter() {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Mientras carga el estado de autenticación
  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#fa8fb5" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{ headerShown: false }}
      >
        {/* Pantallas públicas */}
        <Stack.Screen name="Home" component={HomePage} />
        <Stack.Screen name="Register" component={RegisterScreen} />

        {/* Dashboards protegidos */}
        {isAuthenticated && user && (
          <>
            {(user.role === "doctor" || user.role === "nurse") && (
              <Stack.Screen
                name="DashboardClinicalStaff"
                component={DashboardClinicalStaff}
              />
            )}
            {user.role === "patient" && (
              <Stack.Screen
                name="DashboardPatient"
                component={DashboardPatient}
              />
            )}
            {user.role === "guardian" && (
              <Stack.Screen
                name="DashboardGuardian"
                component={DashboardGuardian}
              />
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
