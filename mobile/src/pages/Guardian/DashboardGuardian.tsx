import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet,} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { guardianTabs } from "../../common/config/navigationsTabs";
import { usePatientData } from "../../hooks/usePatientData";
import { apiService } from "../../services/api";
import type { GuardianUser } from "../../types/medical";
import { PatientSelector } from "../../components/PatientSelector";
import { BottomNavigation } from "../../components/BottomNavigation";

export function DashboardGuardian() {
  const { user, logout } = useAuth();
  const navigation = useNavigation<any>(); // 👈 Hook correcto de React Navigation
  const [activeTab, setActiveTab] = useState("home");
  const { cancerColor, patientName, patientId } = usePatientData();
  const [patients, setPatients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasNoPatients, setHasNoPatients] = useState(false);

  // 🔹 Cargar pacientes asignados al guardian
  useEffect(() => {
    const loadPatients = async () => {
      if (!user || user.role !== "guardian") return;
      try {
        setIsLoading(true);
        const guardianUser = user as GuardianUser;

        if (guardianUser.patientIds && guardianUser.patientIds.length > 0) {
          const allPatients = await apiService.patients.getAll();
          const myPatients = allPatients.filter((p: any) =>
            guardianUser.patientIds.includes(p.id)
          );

          setPatients(
            myPatients.map((p: any) => ({
              patientId: p.id,
              name: p.name,
              cancerType: p.cancerType,
            }))
          );
          setHasNoPatients(myPatients.length === 0);
        } else {
          setHasNoPatients(true);
        }
      } catch (error) {
        console.error("Error al cargar pacientes:", error);
        setPatients([]);
        setHasNoPatients(true);
      } finally {
        setIsLoading(false);
      }
    };
    loadPatients();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigation.replace("Login"); // 👈 Reemplaza "Login" por el nombre de tu pantalla inicial
  };

  // 🔹 Render dinámico según tab activa
  const renderContent = () => {
    if (!patientId) {
      return (
        <View style={styles.centerBox}>
          <Text style={styles.grayText}>
            Por favor, seleccione un paciente para ver su información
          </Text>
        </View>
      );
    }

    switch (activeTab) {
      case "home":
        return (
          <View style={{ marginTop: 16 }}>
            <Text style={styles.sectionTitle}>Resumen de {patientName}</Text>
            <View style={styles.cardGrid}>
              <View style={[styles.infoCard, { backgroundColor: "#CCFBF1" }]}>
                <Text style={styles.cardTitle}>Próxima Consulta</Text>
                <Text style={[styles.cardSubtitle, { color: "#115E59" }]}>
                  No programada
                </Text>
              </View>
              <View style={[styles.infoCard, { backgroundColor: "#FFEDD5" }]}>
                <Text style={styles.cardTitle}>Recordatorios</Text>
                <Text style={[styles.bigNumber, { color: "#9A3412" }]}>0</Text>
              </View>
              <View style={[styles.infoCard, { backgroundColor: "#E0E7FF" }]}>
                <Text style={styles.cardTitle}>Documentos</Text>
                <Text style={[styles.bigNumber, { color: "#3730A3" }]}>0</Text>
              </View>
            </View>
          </View>
        );

      case "appointments":
        return (
          <View style={styles.centerBox}>
            <Text style={styles.sectionTitle}>Citas de {patientName}</Text>
            <Text style={styles.grayText}>Sección en desarrollo...</Text>
          </View>
        );

      case "documents":
        return (
          <View style={styles.centerBox}>
            <Text style={styles.sectionTitle}>Documentos de {patientName}</Text>
            <Text style={styles.grayText}>Sección en desarrollo...</Text>
          </View>
        );

      case "profile":
        return (
          <View style={{ marginTop: 16 }}>
            <Text style={styles.sectionTitle}>Mi Perfil</Text>
            <View style={styles.profileCard}>
              <Text style={styles.profileText}>
                <Text style={styles.bold}>Nombre: </Text> {user?.name}
              </Text>
              <Text style={styles.profileText}>
                <Text style={styles.bold}>Email: </Text> {user?.email}
              </Text>
              <Text style={styles.profileText}>
                <Text style={styles.bold}>Rol: </Text> Guardian/Tutor
              </Text>
              <Text style={styles.profileText}>
                <Text style={styles.bold}>Pacientes a cargo: </Text> {patients.length}
              </Text>
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  // 🔹 Carga
  if (isLoading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.grayText}>Cargando...</Text>
      </View>
    );
  }

  // 🔹 Sin pacientes asignados
  if (hasNoPatients) {
    return (
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.card}>
          <Text style={styles.headerTitle}>Dashboard - Guardian</Text>
          <TouchableOpacity onPress={handleLogout} style={styles.outlineBtn}>
            <Text style={styles.outlineText}>Cerrar Sesión</Text>
          </TouchableOpacity>

          <View style={styles.noPatientsBox}>
            <Text style={styles.noPatientsTitle}>No tienes pacientes asignados</Text>
            <Text style={styles.noPatientsText}>
              Para poder ver información de pacientes, primero deben agregarte como cuidador
              desde su dashboard.
            </Text>

            <View style={styles.instructionsBox}>
              <Text style={styles.instructionsTitle}>📋 Instrucciones:</Text>
              <Text style={styles.instructionItem}>1. Pide al paciente que inicie sesión</Text>
              <Text style={styles.instructionItem}>
                2. El paciente debe ir a “Familiares / Cuidadores”
              </Text>
              <Text style={styles.instructionItem}>
                3. Debe agregarte usando tu email:{" "}
                <Text style={styles.emailText}>{user?.email}</Text>
              </Text>
              <Text style={styles.instructionItem}>
                4. Una vez agregado, podrás ver su información aquí.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  }

  // 🔹 Dashboard principal
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Dashboard - Guardian</Text>
            <Text style={styles.grayText}>Bienvenido/a, {user?.name}</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.outlineBtn}>
            <Text style={styles.outlineText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>

        {/* Selector de Paciente */}
        <PatientSelector patients={patients} />

        {/* Contenido dinámico */}
        {renderContent()}
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        accentColor={cancerColor.color}
        tabs={guardianTabs}
      />
    </View>
  );
}

// 🎨 ESTILOS NATIVOS
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  scrollContainer: { padding: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: { fontSize: 22, fontWeight: "700", color: "#111827" },
  grayText: { color: "#6B7280", fontSize: 14 },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#111827", marginBottom: 8 },
  cardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between",
  },
  infoCard: {
    flex: 1,
    minWidth: "30%",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: { fontSize: 15, fontWeight: "600" },
  cardSubtitle: { fontSize: 13, marginTop: 4 },
  bigNumber: { fontSize: 28, fontWeight: "700", marginTop: 8 },
  profileCard: { backgroundColor: "#F3F4F6", borderRadius: 12, padding: 16 },
  profileText: { fontSize: 14, color: "#374151", marginBottom: 4 },
  bold: { fontWeight: "700" },
  outlineBtn: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  outlineText: { color: "#111827", fontWeight: "600" },
  centerBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
  },
  noPatientsBox: {
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  noPatientsTitle: { fontSize: 18, fontWeight: "700", color: "#1E3A8A", marginBottom: 8 },
  noPatientsText: { color: "#1E40AF", fontSize: 14, marginBottom: 12 },
  instructionsBox: {
    backgroundColor: "white",
    borderColor: "#BFDBFE",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  instructionsTitle: { fontWeight: "700", color: "#1E40AF", marginBottom: 6 },
  instructionItem: { color: "#1E3A8A", fontSize: 13, marginBottom: 4 },
  emailText: { color: "#2563EB", fontWeight: "600" },
  loadingScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#F9FAFB",
  },
});
