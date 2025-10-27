import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import * as Sharing from "expo-sharing";
import * as Clipboard from "expo-clipboard";
import { Share2, User, StickyNote, FolderOpen, ClipboardList } from "lucide-react-native"; // 🔹 mismos iconos que en web
import { useAuth } from "../../context/AuthContext";
import { apiService } from "../../services/api";
import { cancerColors, type Patient } from "../../types/medical";
import { CompleteProfileForm } from "../../components/CompleteProfileForm";
import * as FileSystem from 'expo-file-system/legacy';



interface HomePatientProps {
  onTabChange?: (tab: string) => void;
}

export function HomePatient({ onTabChange }: HomePatientProps) {
  const { user } = useAuth();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [qrImageUrl, setQrImageUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  

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
          console.log("QR recibido:", apiService.patients.getQRCode(foundPatient.id));
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

  // ✅ Usa selectedColor o cancerType, igual que en web
  const cancerColor = patient
    ? cancerColors[patient.selectedColor || patient.cancerType]
    : cancerColors.other;

  const shareQRCode = async () => {
    if (!patient || !qrImageUrl) return;
    if (isSharing) return; // 🔒 evita que se dispare 2 veces seguidas

    try {
      setIsSharing(true); // 🚫 bloquea mientras comparte

      const fileUri = `${FileSystem.cacheDirectory ?? ''}qr_${patient.id}.png`;
      const downloadResult = await FileSystem.downloadAsync(qrImageUrl, fileUri);

      if (!downloadResult || !downloadResult.uri) {
        Alert.alert('Error', 'No se pudo descargar el código QR.');
        setIsSharing(false);
        return;
      }

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(downloadResult.uri, {
          dialogTitle: 'Compartir QR Médico',
        });
      } else {
        Alert.alert('Compartir no disponible', 'No se puede compartir en este dispositivo.');
      }
    } catch (error) {
      console.error('Error al compartir:', error);
      Alert.alert('Error', 'No se pudo compartir el código QR.');
    } finally {
      setIsSharing(false); // ✅ libera el bloqueo cuando termina
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
      {/* 🟣 QR CODE */}
      <View style={styles.card}>
        <Text style={styles.title}>Mi Código QR Médico</Text>
        <Text style={styles.subtitle}>
          Muestra este código al personal médico para acceso inmediato a tu información
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
          <Share2 color="white" size={18} style={{ marginRight: 6 }} />
          <Text style={styles.shareText}>Compartir / Guardar</Text>
        </TouchableOpacity>
      </View>

      {/* 🟢 FICHA RESUMIDA */}
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <User size={22} color={cancerColor.color} />
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
              <Text style={styles.summaryText}>
                {patient.treatmentSummary || "Sin resumen disponible."}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

// 🧩 Estilos equivalentes al diseño web adaptados a mobile
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
  subtitle: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 4,
  },
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
  shareText: { color: "white", fontWeight: "600" },
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
  quickSubtitle: {
    fontSize: 11,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 2,
  },
});
