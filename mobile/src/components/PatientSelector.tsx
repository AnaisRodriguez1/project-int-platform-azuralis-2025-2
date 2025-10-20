import React from "react";
import { View, Text, StyleSheet,} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { usePatientContext } from "../context/PatientContext";
import type { CancerType } from "../types/medical";

interface Patient {
  patientId: string;
  name: string;
  cancerType: CancerType;
  relationship?: string;
}

interface PatientSelectorProps {
  patients: Patient[];
}

/**
 * Componente para que Guardian/Doctor/Nurse seleccione un paciente
 * Actualiza el contexto global del paciente seleccionado (versión móvil)
 */
export function PatientSelector({ patients }: PatientSelectorProps) {
  const { currentPatient, setCurrentPatient } = usePatientContext();

  const handleSelectPatient = (patientId: string) => {
    const selected = patients.find((p) => p.patientId === patientId);
    if (selected) {
      setCurrentPatient({
        patientId: selected.patientId,
        name: selected.name,
        cancerType: selected.cancerType,
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Seleccionar Paciente</Text>

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={currentPatient?.patientId || ""}
          onValueChange={(value) => handleSelectPatient(value)}
          style={styles.picker}
        >
          <Picker.Item label="-- Seleccione un paciente --" value="" />
          {patients.map((patient) => (
            <Picker.Item
              key={patient.patientId}
              label={
                patient.relationship
                  ? `${patient.name} (${patient.relationship})`
                  : patient.name
              }
              value={patient.patientId}
            />
          ))}
        </Picker>
      </View>

      {currentPatient && (
        <View style={styles.selectedBox}>
          <Text style={styles.selectedText}>
            <Text style={{ fontWeight: "700" }}>Viendo: </Text>
            {currentPatient.name}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 24 },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    overflow: "hidden",
  },
  picker: { color: "#111827", backgroundColor: "#F9FAFB" },
  selectedBox: {
    marginTop: 12,
    backgroundColor: "#EFF6FF",
    borderRadius: 8,
    padding: 12,
  },
  selectedText: { color: "#1E40AF", fontSize: 13 },
});
