import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { apiService } from "../services/api";
import type { Patient, DoctorUser, NurseUser, SearchRecord } from "../types/medical";
import { validateRUT } from "../common/helpers/ValidateForm";
import { User, Clock, AlertTriangle, Search } from "lucide-react-native";


interface SearchPatientByRutProps {
  onPatientFound: (patient: Patient) => void;
  onBack: () => void;
}

export function SearchPatientByRut({ onPatientFound, onBack }: SearchPatientByRutProps) {
  const [rut, setRut] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchHistory, setSearchHistory] = useState<SearchRecord[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user && (user.role === "doctor" || user.role === "nurse")) {
      const clinicalUser = user as DoctorUser | NurseUser;
      const history = clinicalUser.searchHistory;
      if (history && history.length > 0) {
        const sortedHistory = [...history]
          .sort(
            (a, b) =>
              new Date(b.searchedAt).getTime() -
              new Date(a.searchedAt).getTime()
          )
          .slice(0, 5);
        Promise.all(
          sortedHistory.map(async (record) => {
            try {
              const name = await apiService.patients.getName(record.patientId);
              return { ...record, patientName: name };
            } catch {
              return { ...record, patientName: "Nombre no disponible" };
            }
          })
        ).then((historyWithNames) => {
          setSearchHistory(historyWithNames);
        });
      }
    }
  }, [user]);

  const handleSearchFromHistory = async (record: SearchRecord) => {
    setLoading(true);
    setError("");
    try {
      const patient = await apiService.patients.findByRut(record.patientRut);
      onPatientFound(patient);
    } catch {
      setError("Error al cargar el paciente del historial.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setError("");
    if (!rut.trim()) return setError("Por favor ingresa un RUT");
    if (!validateRUT(rut)) return setError("El RUT ingresado no es válido");
    setLoading(true);
    try {
      const patient = await apiService.patients.findByRut(rut);
      if (user && (user.role === "doctor" || user.role === "nurse")) {
        await apiService.users.addSearchHistory(user.id, patient.id, patient.rut);
      }
      onPatientFound(patient);
    } catch (err: any) {
      if (err.response?.status === 404)
        setError("No se encontró ningún paciente con ese RUT");
      else
        setError("Error al buscar paciente. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleString("es-CL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
          <Text style={styles.backText}>Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Buscar Paciente</Text>
      </View>

      {/* Card de búsqueda */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Buscar por RUT</Text>
        <Text style={styles.cardSubtitle}>
          Ingresa el RUT del paciente para acceder a su ficha médica
        </Text>

        <View style={styles.inputRow}>
          <TextInput
            placeholder="12345678-9 o 12.345.678-9"
            value={rut}
            onChangeText={(v) => {
              setRut(v);
              if (error) setError("");
            }}
            editable={!loading}
            style={styles.input}
          />
          <TouchableOpacity
            onPress={handleSearch}
            disabled={loading || !rut.trim()}
            style={[styles.searchBtn, loading && { opacity: 0.6 }]}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Search size={16} color="white" />
                <Text style={styles.searchBtnText}>Buscar</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
        <Text style={styles.helperText}>
          Puedes ingresar el RUT con o sin puntos.
        </Text>

        {error ? (
          <View style={styles.errorBox}>
            <AlertTriangle color="#DC2626" size={18} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}
      </View>

      {/* Historial */}
      {searchHistory.length > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Clock size={20} color="#4B5563" />
            <Text style={styles.cardTitle}>Búsquedas recientes</Text>
          </View>
          <Text style={styles.cardSubtitle}>
            Últimas 5 búsquedas (QR móvil + web)
          </Text>

          {searchHistory.map((item, index) => (
            <TouchableOpacity
              key={`${item.patientId}-${index}`}
              onPress={() => handleSearchFromHistory(item)}
              disabled={loading}
              style={[
                styles.historyItem,
                loading && { opacity: 0.5 },
              ]}
            >
              <View style={styles.historyRow}>
                <View style={styles.historyIcon}>
                  <User size={20} color="#2563EB" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.historyName}>
                    {item.patientName || "Cargando..."}
                  </Text>
                  <Text style={styles.historyRut}>RUT: {item.patientRut}</Text>
                  <Text style={styles.historyDate}>
                    {formatDate(item.searchedAt)}
                  </Text>
                </View>
                <Text style={styles.arrow}>›</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Info adicional */}
      <View style={[styles.card, styles.infoCard]}>
        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            <AlertTriangle size={20} color="#2563EB" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>Acceso Rápido</Text>
            <Text style={styles.infoText}>
              Una vez encontrado el paciente, podrás ver y editar su ficha médica completa,
              agregar notas clínicas y subir documentos.
            </Text>
          </View>
        </View>
      </View>
      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#F0F9FF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  backIcon: { fontSize: 20, color: "#1F2937" },
  backText: { color: "#1F2937", fontWeight: "500" },
  headerTitle: { fontSize: 22, fontWeight: "700", color: "#111827" },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 1,
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
  cardSubtitle: { fontSize: 13, color: "#6B7280", marginTop: 4 },
  inputRow: { flexDirection: "row", alignItems: "center", marginTop: 12, gap: 8 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#F9FAFB",
    color: "#111827",
  },
  searchBtn: {
    backgroundColor: "#2563EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  searchBtnText: { color: "white", fontWeight: "600" },
  helperText: { fontSize: 12, color: "#6B7280", marginTop: 6 },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    borderRadius: 8,
    padding: 8,
    marginTop: 10,
    gap: 6,
  },
  errorText: { color: "#991B1B", fontSize: 13 },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  historyItem: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  historyRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },
  historyName: { fontWeight: "600", color: "#111827" },
  historyRut: { fontSize: 13, color: "#4B5563" },
  historyDate: { fontSize: 12, color: "#9CA3AF" },
  arrow: { fontSize: 20, color: "#9CA3AF" },
  infoCard: { backgroundColor: "#EFF6FF", borderColor: "#BFDBFE", borderWidth: 1 },
  infoRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },
  infoTitle: { fontWeight: "600", color: "#1E40AF", marginBottom: 2 },
  infoText: { fontSize: 13, color: "#1E3A8A" },
});
