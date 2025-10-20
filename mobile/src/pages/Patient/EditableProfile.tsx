import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Linking,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { usePatientData } from "../../hooks/usePatientData";
import { apiService } from "../../services/api";
import { cancerColors, PATIENT_PERMISSIONS } from "../../types/medical";
import type { Patient, EmergencyContact, Operation } from "../../types/medical";
import {
  User,
  Palette,
  Lock,
  LogOut,
  Edit3,
  Save,
  AlertCircle,
  Phone,
  Pill,
  Scissors,
  Plus,
  Trash2,
  X,
} from "lucide-react-native";

export function EditableProfile() {
  const { user, logout } = useAuth();
  const { patientId } = usePatientData();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Estados de edición
  const [editingName, setEditingName] = useState(false);
  const [editingMeds, setEditingMeds] = useState(false);
  const [editingAllergies, setEditingAllergies] = useState(false);
  const [editingContacts, setEditingContacts] = useState(false);
  const [editingTreatment, setEditingTreatment] = useState(false);

  // Temporales
  const [tempName, setTempName] = useState("");
  const [tempMeds, setTempMeds] = useState<string[]>([]);
  const [tempAllergies, setTempAllergies] = useState<string[]>([]);
  const [tempContacts, setTempContacts] = useState<EmergencyContact[]>([]);
  const [tempTreatment, setTempTreatment] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!patientId) return;
      try {
        const data = await apiService.patients.getOne(patientId);
        setPatient(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [patientId]);

  const canEdit = (field: keyof Patient) =>
    PATIENT_PERMISSIONS.patientProfile?.editableFields.has(field) ?? false;

  const saveField = async (field: keyof Patient, value: any) => {
    if (!patient) return false;
    setSaving(true);
    try {
      const updated = await apiService.patients.update(patient.id, { [field]: value });
      setPatient(updated);
      Alert.alert("Éxito", "Cambios guardados correctamente");
      return true;
    } catch {
      Alert.alert("Error", "No se pudieron guardar los cambios");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () =>
    Alert.alert("Cerrar sesión", "¿Seguro que deseas salir?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Salir", style: "destructive", onPress: logout },
    ]);

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.gray}>Cargando datos del paciente...</Text>
      </View>
    );

  if (!patient)
    return (
      <View style={styles.center}>
        <Text style={styles.gray}>No se pudo cargar la información</Text>
      </View>
    );

  const color = cancerColors[patient.cancerType];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Mi Ficha Médica</Text>
      <Text style={styles.subtitle}>Información médica y personal</Text>

      {/* Nombre */}
      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <View style={styles.row}>
            <User size={20} color={color.color} />
            <Text style={styles.cardTitle}>Datos Personales</Text>
          </View>
          {canEdit("name") && !editingName && (
            <TouchableOpacity onPress={() => setEditingName(true)}>
              <Edit3 size={18} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>

        {editingName ? (
          <View>
            <TextInput
              style={styles.input}
              value={tempName}
              onChangeText={setTempName}
              placeholder={patient.name}
            />
            <View style={styles.rowRight}>
              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: color.color }]}
                disabled={saving}
                onPress={async () => {
                  if (await saveField("name", tempName)) setEditingName(false);
                }}
              >
                <Save size={16} color="#fff" />
                <Text style={styles.btnText}>Guardar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setEditingName(false)} style={styles.cancelBtn}>
                <X size={16} color="#374151" />
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <Text style={styles.fieldText}>{patient.name}</Text>
        )}
        <Text style={styles.graySmall}>Edad: {patient.age} años</Text>
        <Text style={styles.graySmall}>RUT: {patient.rut}</Text>
        <Text style={styles.graySmall}>Correo: {user?.email}</Text>
      </View>

      {/* Tratamiento */}
      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <View style={styles.row}>
            <AlertCircle size={20} color={color.color} />
            <Text style={styles.cardTitle}>Resumen de Tratamiento</Text>
          </View>
          {canEdit("treatmentSummary") && !editingTreatment && (
            <TouchableOpacity onPress={() => { setTempTreatment(patient.treatmentSummary); setEditingTreatment(true); }}>
              <Edit3 size={18} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>
        {editingTreatment ? (
          <>
            <TextInput
              style={[styles.input, { height: 100, textAlignVertical: "top" }]}
              multiline
              value={tempTreatment}
              onChangeText={setTempTreatment}
            />
            <View style={styles.rowRight}>
              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: color.color }]}
                onPress={async () => {
                  if (await saveField("treatmentSummary", tempTreatment)) setEditingTreatment(false);
                }}
              >
                <Save size={16} color="#fff" />
                <Text style={styles.btnText}>Guardar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setEditingTreatment(false)} style={styles.cancelBtn}>
                <X size={16} color="#374151" />
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <Text style={styles.fieldText}>{patient.treatmentSummary}</Text>
        )}
      </View>

      {/* Alergias */}
      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <View style={styles.row}>
            <AlertCircle size={20} color="#DC2626" />
            <Text style={[styles.cardTitle, { color: "#DC2626" }]}>Alergias</Text>
          </View>
          {canEdit("allergies") && !editingAllergies && (
            <TouchableOpacity onPress={() => { setTempAllergies([...patient.allergies]); setEditingAllergies(true); }}>
              <Edit3 size={18} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>
        {editingAllergies ? (
          <>
            {tempAllergies.map((a, i) => (
              <View key={i} style={styles.row}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={a}
                  onChangeText={(v) => {
                    const arr = [...tempAllergies];
                    arr[i] = v;
                    setTempAllergies(arr);
                  }}
                />
                <TouchableOpacity onPress={() => setTempAllergies(tempAllergies.filter((_, x) => x !== i))}>
                  <Trash2 size={18} color="#DC2626" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity onPress={() => setTempAllergies([...tempAllergies, ""])} style={styles.outlineBtn}>
              <Plus size={16} color={color.color} />
              <Text style={styles.colorText}>Agregar</Text>
            </TouchableOpacity>
            <View style={styles.rowRight}>
              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: color.color }]}
                onPress={async () => {
                  if (await saveField("allergies", tempAllergies)) setEditingAllergies(false);
                }}
              >
                <Save size={16} color="#fff" />
                <Text style={styles.btnText}>Guardar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setEditingAllergies(false)} style={styles.cancelBtn}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : patient.allergies.length ? (
          patient.allergies.map((a, i) => (
            <Text key={i} style={{ color: "#B91C1C", marginTop: 4 }}>
              ⚠️ {a}
            </Text>
          ))
        ) : (
          <Text style={styles.graySmall}>Sin alergias registradas</Text>
        )}
      </View>

      {/* Medicamentos */}
      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <View style={styles.row}>
            <Pill size={20} color={color.color} />
            <Text style={styles.cardTitle}>Medicamentos Actuales</Text>
          </View>
          {canEdit("currentMedications") && !editingMeds && (
            <TouchableOpacity onPress={() => { setTempMeds([...patient.currentMedications]); setEditingMeds(true); }}>
              <Edit3 size={18} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>
        {editingMeds ? (
          <>
            {tempMeds.map((m, i) => (
              <View key={i} style={styles.row}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={m}
                  onChangeText={(v) => {
                    const arr = [...tempMeds];
                    arr[i] = v;
                    setTempMeds(arr);
                  }}
                />
                <TouchableOpacity onPress={() => setTempMeds(tempMeds.filter((_, x) => x !== i))}>
                  <Trash2 size={18} color="#DC2626" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity onPress={() => setTempMeds([...tempMeds, ""])} style={styles.outlineBtn}>
              <Plus size={16} color={color.color} />
              <Text style={styles.colorText}>Agregar</Text>
            </TouchableOpacity>
            <View style={styles.rowRight}>
              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: color.color }]}
                onPress={async () => {
                  if (await saveField("currentMedications", tempMeds)) setEditingMeds(false);
                }}
              >
                <Save size={16} color="#fff" />
                <Text style={styles.btnText}>Guardar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setEditingMeds(false)} style={styles.cancelBtn}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : patient.currentMedications.length ? (
          patient.currentMedications.map((m, i) => (
            <Text key={i} style={styles.graySmall}>
              • {m}
            </Text>
          ))
        ) : (
          <Text style={styles.graySmall}>Sin medicamentos registrados</Text>
        )}
      </View>

      {/* Contactos */}
      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <View style={styles.row}>
            <Phone size={20} color={color.color} />
            <Text style={styles.cardTitle}>Contactos de Emergencia</Text>
          </View>
          {canEdit("emergencyContacts") && !editingContacts && (
            <TouchableOpacity onPress={() => { setTempContacts([...patient.emergencyContacts]); setEditingContacts(true); }}>
              <Edit3 size={18} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>
        {editingContacts ? (
          <>
            {tempContacts.map((c, i) => (
              <View key={i} style={styles.cardSub}>
                <TextInput
                  style={styles.input}
                  placeholder="Nombre"
                  value={c.name}
                  onChangeText={(v) => {
                    const arr = [...tempContacts];
                    arr[i].name = v;
                    setTempContacts(arr);
                  }}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Relación"
                  value={c.relationship}
                  onChangeText={(v) => {
                    const arr = [...tempContacts];
                    arr[i].relationship = v;
                    setTempContacts(arr);
                  }}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Teléfono"
                  keyboardType="phone-pad"
                  value={c.phone}
                  onChangeText={(v) => {
                    const arr = [...tempContacts];
                    arr[i].phone = v;
                    setTempContacts(arr);
                  }}
                />
              </View>
            ))}
            <TouchableOpacity onPress={() => setTempContacts([...tempContacts, { name: "", relationship: "", phone: "" }])} style={styles.outlineBtn}>
              <Plus size={16} color={color.color} />
              <Text style={styles.colorText}>Agregar</Text>
            </TouchableOpacity>
            <View style={styles.rowRight}>
              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: color.color }]}
                onPress={async () => {
                  if (await saveField("emergencyContacts", tempContacts)) setEditingContacts(false);
                }}
              >
                <Save size={16} color="#fff" />
                <Text style={styles.btnText}>Guardar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setEditingContacts(false)} style={styles.cancelBtn}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : patient.emergencyContacts.length ? (
          patient.emergencyContacts.map((c, i) => (
            <View key={i} style={{ marginTop: 6 }}>
              <Text style={styles.fieldText}>{c.name}</Text>
              <Text style={styles.graySmall}>{c.relationship}</Text>
              <Text
                style={[styles.graySmall, { color: color.color }]}
                onPress={() => Linking.openURL(`tel:${c.phone}`)}
              >
                {c.phone}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.graySmall}>Sin contactos registrados</Text>
        )}
      </View>

      {/* Seguridad */}
      <View style={styles.card}>
        <View style={styles.row}>
          <Lock size={20} color={color.color} />
          <Text style={styles.cardTitle}>Seguridad</Text>
        </View>
        <TouchableOpacity
          style={[styles.outlineBtn, { borderColor: "#DC2626", marginTop: 10 }]}
          onPress={handleLogout}
        >
          <LogOut size={18} color="#DC2626" />
          <Text style={{ color: "#DC2626", fontWeight: "600" }}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#F9FAFB" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  gray: { color: "#6B7280" },
  graySmall: { color: "#6B7280", fontSize: 13, marginTop: 2 },
  title: { fontSize: 22, fontWeight: "700", color: "#111827" },
  subtitle: { color: "#6B7280", marginBottom: 10 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    marginBottom: 14,
    elevation: 2,
  },
  cardSub: { backgroundColor: "#F9FAFB", borderRadius: 8, padding: 8, marginTop: 6 },
  cardTitle: { fontWeight: "600", fontSize: 16, marginLeft: 8, color: "#111827" },
  row: { flexDirection: "row", alignItems: "center" },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  rowRight: { flexDirection: "row", justifyContent: "flex-end", gap: 8, marginTop: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 8,
    backgroundColor: "#F9FAFB",
    marginTop: 6,
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  cancelBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#E5E7EB",
  },
  btnText: { color: "#fff", fontWeight: "600" },
  cancelText: { color: "#374151", fontWeight: "600" },
  outlineBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingVertical: 10,
    marginTop: 8,
    gap: 6,
  },
  colorText: { color: "#374151", fontWeight: "600" },
  fieldText: { fontSize: 15, color: "#111827", marginTop: 4 },
});
