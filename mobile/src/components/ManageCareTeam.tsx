import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { apiService } from "../services/api";
import type { CareTeamMember, Patient } from "../types/medical";
import { Users, UserPlus, UserMinus } from "lucide-react-native";

interface ManageCareTeamProps {
  patient: Patient;
  onUpdate: () => void;
}

export function ManageCareTeam({ patient, onUpdate }: ManageCareTeamProps) {
  const [careTeam, setCareTeam] = useState<CareTeamMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const [newMember, setNewMember] = useState({
    userId: "",
    name: "",
    role: "",
  });

  useEffect(() => {
    loadCareTeam();
  }, [patient.id]);

  const loadCareTeam = async () => {
    try {
      const team = await apiService.careTeam.getByPatient(patient.id);
      setCareTeam(team.filter((m: CareTeamMember) => m.status === "active"));
    } catch (err) {
      console.error("Error al cargar equipo:", err);
    }
  };

  const handleAddMember = async () => {
    setError("");
    setSuccess("");

    if (!newMember.userId || !newMember.name || !newMember.role) {
      setError("Todos los campos son requeridos");
      return;
    }

    setLoading(true);
    try {
      await apiService.careTeam.addToPatient(
        patient.id,
        newMember.userId,
        newMember.name,
        newMember.role
      );

      setSuccess("Miembro agregado exitosamente");
      setNewMember({ userId: "", name: "", role: "" });
      setShowAddForm(false);
      await loadCareTeam();
      onUpdate();
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al agregar miembro");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = (userId: string) => {
    Alert.alert(
      "Confirmar",
      "¿Estás seguro de remover este miembro del equipo?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              await apiService.careTeam.removeFromPatient(patient.id, userId);
              setSuccess("Miembro removido exitosamente");
              await loadCareTeam();
              onUpdate();
            } catch (err: any) {
              setError(err.response?.data?.message || "Error al remover miembro");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      oncologo_principal: "Oncólogo Principal",
      cirujano: "Cirujano",
      radiologo: "Radiólogo",
      enfermera_jefe: "Enfermera Jefe",
      consultor: "Consultor",
    };
    return labels[role] || role;
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Users color="#2563EB" size={22} />
          <Text style={styles.headerTitle}>Equipo de Cuidados</Text>
        </View>

        <TouchableOpacity
          onPress={() => setShowAddForm(!showAddForm)}
          style={styles.addButton}
        >
          <UserPlus color="white" size={18} />
          <Text style={styles.addButtonText}>
            {showAddForm ? "Cancelar" : "Agregar"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Mensajes */}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {success ? <Text style={styles.successText}>{success}</Text> : null}

      {/* Formulario para agregar miembro */}
      {showAddForm && (
        <View style={styles.formCard}>
          <Text style={styles.label}>ID del Usuario *</Text>
          <TextInput
            style={styles.input}
            value={newMember.userId}
            onChangeText={(v) => setNewMember({ ...newMember, userId: v })}
            placeholder="UUID del usuario"
          />

          <Text style={styles.label}>Nombre Completo *</Text>
          <TextInput
            style={styles.input}
            value={newMember.name}
            onChangeText={(v) => setNewMember({ ...newMember, name: v })}
            placeholder="Dr. Juan Pérez"
          />

          <Text style={styles.label}>Rol en el equipo *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={newMember.role}
              onValueChange={(v: string) => setNewMember({ ...newMember, role: v })}
            >
              <Picker.Item label="Selecciona un rol" value="" />
              <Picker.Item label="Oncólogo Principal" value="oncologo_principal" />
              <Picker.Item label="Cirujano" value="cirujano" />
              <Picker.Item label="Radiólogo" value="radiologo" />
              <Picker.Item label="Enfermera Jefe" value="enfermera_jefe" />
              <Picker.Item label="Consultor" value="consultor" />
            </Picker>
          </View>

          <TouchableOpacity
            onPress={handleAddMember}
            disabled={loading}
            style={[
              styles.primaryButton,
              { backgroundColor: loading ? "#93C5FD" : "#2563EB" },
            ]}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.primaryButtonText}>Agregar miembro</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Lista de miembros */}
      <View style={styles.memberList}>
        {careTeam.length === 0 ? (
          <Text style={styles.emptyText}>
            No hay miembros en el equipo de cuidados.
          </Text>
        ) : (
          careTeam.map((member) => (
            <View key={member.userId} style={styles.memberCard}>
              <View>
                <Text style={styles.memberName}>{member.name}</Text>
                <Text style={styles.memberRole}>{getRoleLabel(member.role)}</Text>
                <Text style={styles.memberDate}>
                  Asignado:{" "}
                  {new Date(member.assignedAt).toLocaleDateString("es-CL")}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => handleRemoveMember(member.userId)}
                style={styles.removeButton}
                disabled={loading}
              >
                <UserMinus color="#DC2626" size={18} />
                <Text style={styles.removeButtonText}>Remover</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

// ---------- ESTILOS ----------
const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#F9FAFB",
    flexGrow: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563EB",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
  },
  addButtonText: {
    color: "white",
    fontWeight: "600",
  },
  errorText: {
    color: "#B91C1C",
    marginBottom: 8,
  },
  successText: {
    color: "#16A34A",
    marginBottom: 8,
  },
  formCard: {
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    backgroundColor: "white",
    marginBottom: 12,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    backgroundColor: "white",
    marginBottom: 16,
  },
  primaryButton: {
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "white",
    fontWeight: "600",
  },
  memberList: {
    marginTop: 8,
  },
  memberCard: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
  },
  memberName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  memberRole: {
    fontSize: 14,
    color: "#4B5563",
  },
  memberDate: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 2,
  },
  removeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  removeButtonText: {
    color: "#DC2626",
    fontWeight: "600",
  },
  emptyText: {
    textAlign: "center",
    color: "#6B7280",
    marginVertical: 20,
  },
});
