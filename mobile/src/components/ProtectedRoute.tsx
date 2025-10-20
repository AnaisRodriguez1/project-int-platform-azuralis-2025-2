import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { useAuth } from "../context/AuthContext";
import { useNavigation } from "@react-navigation/native";

/**
 * Componente para proteger pantallas que requieren autenticación (versión móvil)
 */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const navigation = useNavigation();

  // Mostrar loader mientras verifica autenticación
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fa8fb5" />
        <Text style={styles.loadingText}>Verificando sesión...</Text>
      </View>
    );
  }

  // Si no está autenticado, redirige al login
  if (!isAuthenticated) {
    // 👇 reemplazamos Navigate por navegación nativa
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" as never }], // asegúrate que tu screen se llame "Login"
    });
    return null;
  }

  // Si está autenticado, muestra el contenido protegido
  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#F0F4FF",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#6B7280",
    fontSize: 15,
  },
});
