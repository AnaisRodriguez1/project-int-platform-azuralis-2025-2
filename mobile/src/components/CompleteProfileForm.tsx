import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, ScrollView,} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useAuth } from "../context/AuthContext";
import { apiService } from "../services/api";
import { cancerColors, type CancerType } from "../types/medical";
import { User, AlertCircle, FileText, Phone } from "lucide-react-native";

interface CompleteProfileFormProps {
  onComplete: () => void;
}

export function CompleteProfileForm({ onComplete }: CompleteProfileFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    age: "",
    diagnosis: "",
    stage: "",
    cancerType: "" as CancerType,
    allergies: "",
    currentMedications: "",
    treatmentSummary: "",
    emergencyContactName: "",
    emergencyContactRelationship: "",
    emergencyContactPhone: "",
  });

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      const allergiesArray = formData.allergies
        ? formData.allergies.split(",").map((a) => a.trim()).filter((a) => a)
        : [];

      const medicationsArray = formData.currentMedications
        ? formData.currentMedications.split(",").map((m) => m.trim()).filter((m) => m)
        : [];

      const patientData = {
        name: user?.name || "",
        rut: user?.rut || "",
        age: parseInt(formData.age) || 0,
        diagnosis: formData.diagnosis,
        stage: formData.stage,
        cancerType: formData.cancerType,
        allergies: allergiesArray,
        currentMedications: medicationsArray,
        treatmentSummary: formData.treatmentSummary,
        emergencyContact: {
          name: formData.emergencyContactName,
          relationship: formData.emergencyContactRelationship,
          phone: formData.emergencyContactPhone,
        },
      };

      await apiService.patients.create(patientData);
      onComplete();
    } catch (err: any) {
      console.error("Error al crear perfil:", err);
      setError(
        err.response?.data?.message ||
          "Error al guardar los datos. Por favor intenta nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  // ---------- PANTALLAS ----------
  const Step1 = () => (
    <View>
      <Text style={styles.label}>Edad *</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={formData.age}
        onChangeText={(v) => handleChange("age", v)}
        placeholder="Ej: 45"
      />

      <Text style={styles.label}>Diagnóstico *</Text>
      <TextInput
        style={styles.input}
        value={formData.diagnosis}
        onChangeText={(v) => handleChange("diagnosis", v)}
        placeholder="Ej: Cáncer de mama"
      />

      <Text style={styles.label}>Etapa / Estadio *</Text>
      <TextInput
        style={styles.input}
        value={formData.stage}
        onChangeText={(v) => handleChange("stage", v)}
        placeholder="Ej: Etapa II"
      />

      <Text style={styles.label}>Tipo de cáncer *</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={formData.cancerType}
          onValueChange={(v) => handleChange("cancerType", v)}
        >
          <Picker.Item label="Selecciona el tipo de cáncer" value="" />
          {Object.entries(cancerColors).map(([key, config]) => (
            <Picker.Item key={key} label={config.name} value={key} />
          ))}
        </Picker>
      </View>

      <TouchableOpacity
        style={[
          styles.nextButton,
          {
            backgroundColor:
              !formData.age || !formData.diagnosis || !formData.stage || !formData.cancerType
                ? "#93C5FD"
                : "#7C3AED",
          },
        ]}
        disabled={
          !formData.age || !formData.diagnosis || !formData.stage || !formData.cancerType
        }
        onPress={() => setStep(2)}
      >
        <Text style={styles.nextButtonText}>Siguiente</Text>
      </TouchableOpacity>
    </View>
  );

  const Step2 = () => (
    <View>
      <Text style={styles.label}>Alergias</Text>
      <TextInput
        style={styles.input}
        value={formData.allergies}
        onChangeText={(v) => handleChange("allergies", v)}
        placeholder="Ej: Penicilina, Ibuprofeno"
      />
      <Text style={styles.helper}>Separa múltiples alergias con comas</Text>

      <Text style={styles.label}>Medicamentos actuales</Text>
      <TextInput
        style={[styles.input, { height: 80, textAlignVertical: "top" }]}
        multiline
        value={formData.currentMedications}
        onChangeText={(v) => handleChange("currentMedications", v)}
        placeholder="Ej: Tamoxifeno 20mg - cada 12h"
      />

      <Text style={styles.label}>Resumen de tratamiento</Text>
      <TextInput
        style={[styles.input, { height: 100, textAlignVertical: "top" }]}
        multiline
        value={formData.treatmentSummary}
        onChangeText={(v) => handleChange("treatmentSummary", v)}
        placeholder="Describe brevemente tu tratamiento..."
      />

      <View style={styles.stepButtons}>
        <TouchableOpacity style={styles.backButton} onPress={() => setStep(1)}>
          <Text style={styles.backButtonText}>Atrás</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.nextButton} onPress={() => setStep(3)}>
          <Text style={styles.nextButtonText}>Siguiente</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const Step3 = () => (
    <View>
      <View style={styles.infoBox}>
        <Text style={styles.infoBoxText}>
          <Text style={{ fontWeight: "bold" }}>Contacto de emergencia</Text> — Opcional pero
          recomendado
        </Text>
      </View>

      <Text style={styles.label}>Nombre del contacto</Text>
      <TextInput
        style={styles.input}
        value={formData.emergencyContactName}
        onChangeText={(v) => handleChange("emergencyContactName", v)}
        placeholder="Ej: María García"
      />

      <Text style={styles.label}>Relación</Text>
      <TextInput
        style={styles.input}
        value={formData.emergencyContactRelationship}
        onChangeText={(v) => handleChange("emergencyContactRelationship", v)}
        placeholder="Ej: Hermana, Esposo/a"
      />

      <Text style={styles.label}>Teléfono</Text>
      <TextInput
        style={styles.input}
        keyboardType="phone-pad"
        value={formData.emergencyContactPhone}
        onChangeText={(v) => handleChange("emergencyContactPhone", v)}
        placeholder="Ej: +56 9 1234 5678"
      />

      {error && <Text style={styles.errorText}>{error}</Text>}

      <View style={styles.stepButtons}>
        <TouchableOpacity style={styles.backButton} onPress={() => setStep(2)}>
          <Text style={styles.backButtonText}>Atrás</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.nextButtonText}>Completar Perfil</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.headerCard}>
        <View style={styles.headerTitleRow}>
          <User color="#7C3AED" size={24} />
          <Text style={styles.headerTitle}>Completa tu Perfil Médico</Text>
        </View>
        <Text style={styles.headerSubtitle}>
          Para poder usar todas las funcionalidades de la aplicación, necesitamos algunos
          datos sobre tu condición médica.
        </Text>
      </View>

      {/* Indicador de pasos */}
      <View style={styles.stepIndicator}>
        {[1, 2, 3].map((num) => (
          <View key={num} style={styles.stepItem}>
            <View
              style={[
                styles.stepCircle,
                step === num
                  ? styles.stepActive
                  : step > num
                  ? styles.stepDone
                  : styles.stepPending,
              ]}
            >
              <Text style={styles.stepText}>
                {step > num ? "✓" : num.toString()}
              </Text>
            </View>
            {num < 3 && (
              <View
                style={[
                  styles.stepLine,
                  step > num ? styles.stepLineActive : styles.stepLinePending,
                ]}
              />
            )}
          </View>
        ))}
      </View>

      {/* Contenido dinámico */}
      <View style={styles.formCard}>
        {step === 1 && <Step1 />}
        {step === 2 && <Step2 />}
        {step === 3 && <Step3 />}
      </View>

      {/* Info boxes */}
      <View style={styles.infoCards}>
        <View style={[styles.infoCard, { backgroundColor: "#EFF6FF" }]}>
          <AlertCircle color="#2563EB" size={28} />
          <Text style={styles.infoCardText}>
            Tus datos están protegidos y solo los verá tu equipo médico
          </Text>
        </View>

        <View style={[styles.infoCard, { backgroundColor: "#DCFCE7" }]}>
          <FileText color="#16A34A" size={28} />
          <Text style={styles.infoCardText}>
            Podrás editar esta información desde tu perfil
          </Text>
        </View>

        <View style={[styles.infoCard, { backgroundColor: "#F3E8FF" }]}>
          <Phone color="#7C3AED" size={28} />
          <Text style={styles.infoCardText}>
            Se generará tu código QR único para emergencias
          </Text>
        </View>
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
  headerCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#4B5563",
    marginTop: 6,
  },
  formCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
    marginBottom: 4,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    backgroundColor: "#F9FAFB",
    color: "#111827",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    backgroundColor: "#F9FAFB",
    marginBottom: 10,
  },
  helper: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  stepButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  nextButton: {
    flex: 1,
    backgroundColor: "#7C3AED",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  backButton: {
    flex: 1,
    backgroundColor: "#E5E7EB",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginRight: 8,
  },
  submitButton: {
    flex: 1,
    backgroundColor: "#7C3AED",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  nextButtonText: {
    color: "white",
    fontWeight: "600",
  },
  backButtonText: {
    color: "#374151",
    fontWeight: "600",
  },
  errorText: {
    color: "#B91C1C",
    marginTop: 8,
  },
  infoBox: {
    backgroundColor: "#DBEAFE",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  infoBoxText: {
    fontSize: 13,
    color: "#1E3A8A",
  },
  stepIndicator: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 16,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  stepActive: { backgroundColor: "#7C3AED" },
  stepDone: { backgroundColor: "#16A34A" },
  stepPending: { backgroundColor: "#E5E7EB" },
  stepText: { color: "white", fontWeight: "600" },
  stepLine: { width: 32, height: 3, marginHorizontal: 4 },
  stepLineActive: { backgroundColor: "#16A34A" },
  stepLinePending: { backgroundColor: "#E5E7EB" },
  infoCards: {
    marginTop: 24,
    gap: 12,
  },
  infoCard: {
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  infoCardText: {
    textAlign: "center",
    fontSize: 12,
    color: "#374151",
    marginTop: 6,
  },
});
