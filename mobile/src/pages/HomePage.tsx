import React, { useEffect } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { getDashboardRoute } from "../common/helpers/GetDashboardRoute";
import { LoginScreen } from "./LoginScreen";

export function HomePage() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      const route = getDashboardRoute(user.role);
      // 🔄 Reemplazamos el navigate de react-router-dom
      // por navegación nativa
      navigation.reset({
        index: 0,
        routes: [{ name: route as never }],
      });
    }
  }, [isAuthenticated, user, isLoading]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#fa8fb5" />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  // Si no está autenticado, renderiza el login nativo
  return <LoginScreen />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F9FF",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "#6B7280",
    marginTop: 12,
    fontSize: 16,
  },
});
