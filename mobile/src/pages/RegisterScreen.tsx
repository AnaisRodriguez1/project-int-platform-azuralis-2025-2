import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { CancerRibbon } from "../components/CancerRibbon";
import LogoUCN from "@/assets/icons/logo_ucn.svg";
import {
  validateRegistrationForm,
  formatRUT,
} from "../common/helpers/ValidateForm";
import type { RegisterFormData, UserRole } from "../types/medical";
import type { FieldErrors } from "../common/helpers/ValidateForm";

export function RegisterScreen() {
  const navigation = useNavigation();
  const { register: registerUser } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<RegisterFormData>({
    name: "",
    email: "",
    rut: "",
    password: "",
    confirmPassword: "",
    role: "patient",
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [successMessage, setSuccessMessage] = useState("");

  const handleInputChange = (field: keyof RegisterFormData, value: string) => {
    const processedValue = field === "rut" ? formatRUT(value) : value;
    setFormData((prev) => ({ ...prev, [field]: processedValue }));

    if (fieldErrors[field]) {
      const newErrors = { ...fieldErrors };
      delete newErrors[field];
      setFieldErrors(newErrors);
    }
  };

  const handleSubmit = async () => {
    setSuccessMessage("");
    setFieldErrors({});

    const { isValid, errors } = validateRegistrationForm(formData);
    if (!isValid) {
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);
    try {
      await registerUser({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        rut: formData.rut,
        password: formData.password,
        role: formData.role,
      });

      setSuccessMessage("✅ ¡Cuenta creada exitosamente! Redirigiendo...");
      setTimeout(() => {
        navigation.reset({ index: 0, routes: [{ name: "HomePage" as never }] });
      }, 2000);
    } catch (err: any) {
      if (err.response) {
        const status = err.response.status;
        const message = err.response.data?.message;
        const errorData = err.response.data;

        if (
          status === 409 ||
          message?.includes("already exists") ||
          message?.includes("duplicate")
        ) {
          if (message?.includes("email")) {
            setFieldErrors({
              email: "Este correo ya está registrado. ¿Quieres iniciar sesión?",
            });
          } else if (message?.includes("rut")) {
            setFieldErrors({ rut: "Este RUT ya está registrado en el sistema." });
          } else {
            setFieldErrors({
              general: "El usuario ya existe. Usa otros datos o inicia sesión.",
            });
          }
        } else if (status === 400) {
          if (errorData?.errors && Array.isArray(errorData.errors)) {
            const backendErrors: FieldErrors = {};
            errorData.errors.forEach((e: any) => {
              if (e.field) backendErrors[e.field] = e.message;
            });
            setFieldErrors(backendErrors);
          } else {
            setFieldErrors({
              general: message || "Datos inválidos. Verifica el formulario.",
            });
          }
        } else {
          setFieldErrors({
            general: message || "Error al crear la cuenta. Intenta nuevamente.",
          });
        }
      } else {
        setFieldErrors({
          general: "No se pudo conectar al servidor. Verifica tu conexión.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#F9FAFB" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <CancerRibbon color="#ff6299" size="lg" />
            <LogoUCN width={32} height={32} />
          </View>
          <Text style={styles.title}>Ficha Médica Portátil</Text>
          <Text style={styles.subtitle}>Universidad Católica del Norte</Text>
        </View>

        {/* Formulario */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Crear Cuenta</Text>
          <Text style={styles.cardSubtitle}>Únete a nuestra plataforma médica</Text>

          {/* Campos */}
          <View style={styles.field}>
            <Text style={styles.label}>Nombre completo</Text>
            <TextInput
              style={[styles.input, fieldErrors.name && styles.inputError]}
              placeholder="Ingresa tu nombre"
              value={formData.name}
              onChangeText={(text) => handleInputChange("name", text)}
            />
            {fieldErrors.name && <Text style={styles.error}>{fieldErrors.name}</Text>}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>RUT</Text>
            <TextInput
              style={[styles.input, fieldErrors.rut && styles.inputError]}
              placeholder="12.345.678-9"
              value={formData.rut}
              onChangeText={(text) => handleInputChange("rut", text)}
            />
            {fieldErrors.rut && <Text style={styles.error}>{fieldErrors.rut}</Text>}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Correo electrónico</Text>
            <TextInput
              style={[styles.input, fieldErrors.email && styles.inputError]}
              placeholder="ejemplo@correo.com"
              keyboardType="email-address"
              value={formData.email}
              onChangeText={(text) => handleInputChange("email", text)}
            />
            {fieldErrors.email && <Text style={styles.error}>{fieldErrors.email}</Text>}
          </View>

          {/* Rol */}
          <View style={styles.field}>
            <Text style={styles.label}>Tipo de usuario</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.role}
                onValueChange={(value) =>
                  handleInputChange("role", value as UserRole)
                }
              >
                <Picker.Item label="Paciente" value="patient" />
                <Picker.Item label="Doctor" value="doctor" />
                <Picker.Item label="Enfermera/o" value="nurse" />
                <Picker.Item label="Cuidador/a" value="guardian" />
              </Picker>
            </View>
            {fieldErrors.role && <Text style={styles.error}>{fieldErrors.role}</Text>}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              style={[styles.input, fieldErrors.password && styles.inputError]}
              placeholder="Mínimo 6 caracteres"
              secureTextEntry
              value={formData.password}
              onChangeText={(text) => handleInputChange("password", text)}
            />
            {fieldErrors.password && (
              <Text style={styles.error}>{fieldErrors.password}</Text>
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Confirmar contraseña</Text>
            <TextInput
              style={[
                styles.input,
                fieldErrors.confirmPassword && styles.inputError,
              ]}
              placeholder="Repite tu contraseña"
              secureTextEntry
              value={formData.confirmPassword}
              onChangeText={(text) => handleInputChange("confirmPassword", text)}
            />
            {fieldErrors.confirmPassword && (
              <Text style={styles.error}>{fieldErrors.confirmPassword}</Text>
            )}
          </View>

          {/* Mensajes */}
          {fieldErrors.general && (
            <Text style={[styles.error, { marginTop: 6 }]}>
              ⚠️ {fieldErrors.general}
            </Text>
          )}
          {successMessage && (
            <Text style={[styles.success, { marginTop: 6 }]}>
              {successMessage}
            </Text>
          )}

          {/* Botón */}
          <TouchableOpacity
            style={[styles.button, isLoading && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Registrarse</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => navigation.navigate("LoginScreen" as never)}
            disabled={isLoading}
          >
            <Text style={styles.loginText}>
              ¿Ya tienes cuenta?{" "}
              <Text style={styles.loginBold}>Inicia sesión</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Sistema desarrollado para mejorar la atención oncológica.
          </Text>
          <Text style={styles.footerText}>© 2025 Azuralis</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, backgroundColor: "#F9FAFB" },
  header: { alignItems: "center", marginBottom: 20 },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { fontSize: 22, fontWeight: "700", color: "#111827", marginTop: 8 },
  subtitle: { fontSize: 13, color: "#6B7280", marginTop: 2 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    elevation: 3,
    marginBottom: 20,
  },
  cardTitle: { fontSize: 18, fontWeight: "600", textAlign: "center" },
  cardSubtitle: { textAlign: "center", fontSize: 13, color: "#6B7280" },
  field: { marginTop: 10 },
  label: { fontSize: 14, fontWeight: "500", color: "#111827", marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#F9FAFB",
  },
  inputError: { borderColor: "#F87171" },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    backgroundColor: "#F9FAFB",
  },
  error: { color: "#B91C1C", fontSize: 13 },
  success: { color: "#15803D", fontSize: 13 },
  button: {
    backgroundColor: "#fa8fb5",
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 16,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  loginLink: { marginTop: 12, alignItems: "center" },
  loginText: { color: "#6B7280", fontSize: 13 },
  loginBold: {
    color: "#fa8fb5",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  footer: { alignItems: "center", marginTop: 10 },
  footerText: { color: "#6B7280", fontSize: 12 },
});
