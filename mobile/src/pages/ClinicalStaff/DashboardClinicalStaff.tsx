import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";
import { apiService } from "../../services/api";
import { clinicalStaffTabs } from "../../common/config/navigationsTabs";
import { BottomNavigation } from "../../components/BottomNavigation";
import { useIsMobile } from "../../hooks/use-mobile";
import type { DoctorUser, NurseUser, Patient } from "../../types/medical";
import { Search, Users, LogOut } from "lucide-react-native";
import { EditableClinicalProfile } from "./EditableProfile";

export function DashboardClinicalStaff() {
  const { user, logout } = useAuth();
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState("home");
  const [stats, setStats] = useState({
    totalPatients: 0,
    searchHistory: 0,
    myPatients: 0,
  });

  const isDoctor = user?.role === "doctor";
  const isNurse = user?.role === "nurse";
  const accentColor = isDoctor ? "#3B82F6" : "#00B4D8";
  const roleLabel = isDoctor ? "Doctor/a" : "Enfermera/o";

  useEffect(() => {
    const loadStats = async () => {
      if (!user) return;
      try {
        const allPatients = await apiService.patients.getAll();
        const clinicalUser = user as DoctorUser | NurseUser;
        const myPatients = allPatients.filter((p) =>
          p.careTeam?.some((m) => m.userId === user.id)
        );

        setStats({
          totalPatients: allPatients.length,
          searchHistory: clinicalUser.searchHistory?.length || 0,
          myPatients: myPatients.length,
        });
      } catch (error) {
        console.error("Error cargando estadísticas:", error);
      }
    };
    loadStats();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigation.navigate("Login" as never);
  };

  const renderContent = () => {
    if (activeTab === "profile") {
      return <EditableClinicalProfile />;
    }

    // Tab "home" por defecto
    return (
      <>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: accentColor }]}>
          <View style={styles.headerRow}>
            <View style={styles.avatar}>
              <Text
                style={{
                  color: accentColor,
                  fontSize: 28,
                  fontWeight: "bold",
                }}
              >
                {user?.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={styles.headerName}>{user?.name}</Text>
              <Text style={styles.headerSub}>
                {roleLabel} · {user?.email}
              </Text>
            </View>
          </View>
        </View>

        {/* Estadísticas */}
        <View style={styles.statsSection}>
          <View style={[styles.statCard, { backgroundColor: "#DBEAFE" }]}>
            <Text style={[styles.statLabel, { color: "#1D4ED8" }]}>Mis pacientes</Text>
            <Text style={[styles.statValue, { color: "#1E3A8A" }]}>
              {stats.myPatients}
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: "#D1FAE5" }]}>
            <Text style={[styles.statLabel, { color: "#047857" }]}>Búsquedas</Text>
            <Text style={[styles.statValue, { color: "#064E3B" }]}>
              {stats.searchHistory}
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: "#EDE9FE" }]}>
            <Text style={[styles.statLabel, { color: "#6D28D9" }]}>Total pacientes</Text>
            <Text style={[styles.statValue, { color: "#4C1D95" }]}>
              {stats.totalPatients}
            </Text>
          </View>
        </View>

        {/* Acciones rápidas */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            onPress={() => setActiveTab("search")}
            style={[styles.buttonPrimary, { backgroundColor: "#2563EB" }]}
          >
            <Search color="white" size={22} />
            <Text style={styles.buttonPrimaryText}>Buscar paciente</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab("careTeam")}
            style={styles.buttonOutline}
          >
            <Users color="gray" size={22} />
            <Text style={styles.buttonOutlineText}>Equipo de cuidados</Text>
          </TouchableOpacity>
        </View>

        {/* Logout - Solo en home */}
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <LogOut color="gray" size={20} />
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </>
    );
  };

return (
  <View style={styles.container}>
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      {renderContent()}
    </ScrollView>

    {/* Bottom Navigation */}
    <BottomNavigation
      activeTab={activeTab}
      onTabChange={setActiveTab}
      accentColor={accentColor}
      tabs={clinicalStaffTabs}
    />
  </View>
);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB", // gray-50
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 112, // espacio para bottom nav
  },
  header: {
    borderRadius: 12,
    padding: 20,
    marginTop: 24,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  headerName: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  headerSub: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    marginTop: 4,
  },
  statsSection: {
    marginTop: 24,
  },
  statCard: {
    borderRadius: 10,
    padding: 16,
    marginBottom: 16, // en vez de gap
  },
  statLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
  },
  actionsSection: {
    marginTop: 24,
  },
  buttonPrimary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 10,
    marginBottom: 16, // separación entre botones
  },
  buttonPrimaryText: {
    color: "white",
    fontWeight: "600",
    marginLeft: 8,
  },
  buttonOutline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB", // gray-300
    paddingVertical: 16,
    borderRadius: 10,
  },
  buttonOutlineText: {
    color: "#1F2937", // gray-800
    fontWeight: "600",
    marginLeft: 8,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#9CA3AF", // gray-400
    paddingVertical: 16,
    borderRadius: 10,
    marginTop: 32,
  },
  logoutText: {
    color: "#374151", // gray-700
    fontWeight: "600",
    marginLeft: 8,
  },
});
