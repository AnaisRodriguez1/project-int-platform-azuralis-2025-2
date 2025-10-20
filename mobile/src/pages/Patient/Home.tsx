import React, { useState, useEffect } from "react";
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, Alert,} from "react-native";
import * as Sharing from "expo-sharing";
import * as Clipboard from "expo-clipboard";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { apiService } from "../../services/api";
import { cancerColors, type Patient } from "../../types/medical";
import { CompleteProfileForm } from "../../components/CompleteProfileForm";

interface HomePatientProps {
  onTabChange?: (tab: string) => void;
}

export function HomePatient({ onTabChange }: HomePatientProps) {
  const { user } = useAuth();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [qrImageUrl, setQrImageUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatient = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const patients = await apiService.patients.getAll();
        const foundPatient = patients.find((p) => p.rut === user.rut);
        if (foundPatient) {
          setPatient(foundPatient);
          setQrImageUrl(apiService.patients.getQRCode(foundPatient.id));
        }
      } catch (error) {
        console.error("Error al obtener paciente:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPatient();
  }, [user]);

  const handleProfileComplete = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const patients = await apiService.patients.getAll();
      const foundPatient = patients.find((p) => p.rut === user.rut);
      if (foundPatient) {
        setPatient(foundPatient);
        setQrImageUrl(apiService.patients.getQRCode(foundPatient.id));
      }
    } catch (error) {
      console.error("Error al recargar paciente:", error);
    } finally {
      setLoading(false);
    }
  };

  const cancerColor = patient
    ? cancerColors[patient.cancerType]
    : cancerColors.other;

  const shareQRCode = async () => {
    if (!qrImageUrl) return;
    try {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(qrImageUrl);
      } else {
        await Clipboard.setStringAsync(qrImageUrl);
        Alert.alert("Copiado", "URL del QR copiado al portapapeles.");
      }
    } catch (error) {
      console.error("Error al compartir:", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.grayText}>Cargando datos del paciente...</Text>
      </View>
    );
  }

  if (!patient) {
    return <CompleteProfileForm onComplete={handleProfileComplete} />;
  }

  return (
    <ScrollView style={styles.container}>
      {/* QR */}
      <View style={styles.card}>
        <Text style={styles.title}>Mi Código QR Médico</Text>
        <Text style={styles.subtitle}>
          Muestra este código al personal médico para acceso inmediato
        </Text>

        <View style={styles.qrContainer}>
          {qrImageUrl ? (
            <Image
              source={{ uri: qrImageUrl }}
              style={styles.qrImage}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.qrPlaceholder}>
              <Text style={styles.grayText}>Cargando QR...</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          onPress={shareQRCode}
          style={[styles.shareBtn, { backgroundColor: cancerColor.color }]}
        >
          <Ionicons name="share-social" size={18} color="white" />
          <Text style={styles.shareText}>Compartir / Guardar</Text>
        </TouchableOpacity>
      </View>

      {/* Ficha resumida */}
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Ionicons
            name="person-circle-outline"
            size={22}
            color={cancerColor.color}
          />
          <Text style={styles.headerTitle}>Mi Ficha Resumida</Text>
        </View>

        <View style={styles.profileRow}>
          <Image
            source={
              patient.photo
                ? { uri: patient.photo }
                : require("../../assets/avatar-default.png")
            }
            style={styles.avatar}
          />
          <View style={styles.infoColumn}>
            <View
              style={[
                styles.badge,
                { backgroundColor: cancerColor.color || "#4B5563" },
              ]}
            >
              <Text style={styles.badgeText}>
                {patient.diagnosis} - {patient.stage}
              </Text>
            </View>
            <Text style={styles.infoText}>
              <Text style={styles.bold}>RUT: </Text>
              {patient.rut}
            </Text>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryText}>{patient.treatmentSummary}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Accesos rápidos */}
      {onTabChange && (
        <View style={styles.quickGrid}>
          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => onTabChange("notes")}
          >
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: `${cancerColor.color}20` },
              ]}
            >
              <Ionicons
                name="document-text"
                size={24}
                color={cancerColor.color}
              />
            </View>
            <Text style={styles.quickTitle}>Mis Notas</Text>
            <Text style={styles.quickSubtitle}>
              Registra tus síntomas y observaciones
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => onTabChange("documents")}
          >
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: `${cancerColor.color}20` },
              ]}
            >
              <Ionicons name="folder-open" size={24} color={cancerColor.color} />
            </View>
            <Text style={styles.quickTitle}>Mis Documentos</Text>
            <Text style={styles.quickSubtitle}>
              Guarda recetas y resultados
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => onTabChange("profile")}
          >
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: `${cancerColor.color}20` },
              ]}
            >
              <Ionicons
                name="clipboard"
                size={24}
                color={cancerColor.color}
              />
            </View>
            <Text style={styles.quickTitle}>Mi Ficha Médica</Text>
            <Text style={styles.quickSubtitle}>
              Información y configuración
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB", padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  grayText: { color: "#6B7280", textAlign: "center" },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  title: { fontSize: 18, fontWeight: "bold", textAlign: "center" },
  subtitle: { fontSize: 13, color: "#6B7280", textAlign: "center", marginTop: 4 },
  qrContainer: { alignItems: "center", marginVertical: 12 },
  qrImage: { width: 200, height: 200, borderRadius: 10 },
  qrPlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  shareBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    paddingVertical: 10,
    marginTop: 8,
  },
  shareText: { color: "white", fontWeight: "600", marginLeft: 6 },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  headerTitle: { fontSize: 16, fontWeight: "600", marginLeft: 6, color: "#111827" },
  profileRow: { flexDirection: "row", alignItems: "flex-start" },
  avatar: { width: 64, height: 64, borderRadius: 32, marginRight: 12 },
  infoColumn: { flex: 1 },
  badge: {
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 8,
    alignSelf: "flex-start",
  },
  badgeText: { color: "white", fontSize: 12, fontWeight: "600" },
  infoText: { fontSize: 13, color: "#374151", marginTop: 6 },
  bold: { fontWeight: "700" },
  summaryBox: {
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    padding: 8,
    marginTop: 6,
  },
  summaryText: { fontSize: 13, color: "#374151" },
  quickGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    marginTop: 8,
  },
  quickCard: {
    backgroundColor: "white",
    borderRadius: 12,
    width: "31%",
    alignItems: "center",
    paddingVertical: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  quickTitle: { fontSize: 13, fontWeight: "600", color: "#111827" },
  quickSubtitle: { fontSize: 11, color: "#6B7280", textAlign: "center", marginTop: 2 },
});
