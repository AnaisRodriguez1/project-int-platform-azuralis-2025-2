import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { BottomNavigation } from "../../components/BottomNavigation";
import { patientTabs } from "../../common/config/navigationsTabs";
import { usePatientData } from "../../hooks/usePatientData";

// 👇 Importar las pantallas específicas del paciente
import { HomePatient } from "./Home";
import { NotesPatient } from "./Notes";
import { DocumentsPatient } from "./Documents";
import { ProfilePatient } from "./Profile";

export function DashboardPatient() {
  const { user, logout } = useAuth();
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState("home");
  const { cancerColor } = usePatientData();

  const handleLogout = () => {
    logout();
    navigation.replace("Login"); // 👈 o el nombre de tu pantalla inicial
  };

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <HomePatient onTabChange={setActiveTab} />;
      case "notes":
        return <NotesPatient />;
      case "documents":
        return <DocumentsPatient />;
      case "profile":
        return <ProfilePatient />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Mi Ficha Médica</Text>
            <Text style={styles.subtitle}>Bienvenido/a, {user?.name}</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.outlineBtn}>
            <Text style={styles.outlineText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>

        {/* Contenido dinámico */}
        <View style={styles.contentBox}>{renderContent()}</View>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        accentColor={cancerColor.color}
        tabs={patientTabs}
      />
    </View>
  );
}

// 🎨 Estilos equivalentes al diseño web
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  subtitle: {
    color: "#6B7280",
    fontSize: 14,
    marginTop: 2,
  },
  outlineBtn: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  outlineText: {
    color: "#111827",
    fontWeight: "600",
  },
  contentBox: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    elevation: 2,
  },
});
