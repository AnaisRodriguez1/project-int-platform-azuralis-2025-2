import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet,} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { BottomNavigation } from "../../components/BottomNavigation";
import { patientTabs } from "../../common/config/navigationsTabs"; // ✅ corregido nombre del archivo
import { usePatientData } from "../../hooks/usePatientData";

// 👇 Importar pantallas específicas del paciente
import { HomePatient } from "./Home";
import { NotesPatient } from "./Notes";
import { DocumentsPatient } from "./Documents";
import { ProfilePatient } from "./Profile";

export function DashboardPatient() {
  const { user, logout } = useAuth();
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<"home" | "notes" | "documents" | "profile">("home");
  const { cancerColor } = usePatientData();

  const handleLogout = () => {
    logout();
    navigation.replace("Home"); // 🔹 equivalente al navigate('/') de web
  };

  const onTabChange = (tabId: string) => {
    setActiveTab(tabId as any);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <HomePatient onTabChange={onTabChange} />;
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
      {/* Scroll principal */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}></Text>
            <Text style={styles.title}>Bienvenido/a, {user?.name}</Text>
          </View>
        </View>

        {/* Caja blanca con contenido dinámico */}
        <View style={styles.contentBox}>{renderContent()}</View>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavigation
        activeTab={activeTab}
        onTabChange={onTabChange}
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
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#111827",
  },
  subtitle: {
    color: "#6B7280",
    fontSize: 15,
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
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
});
