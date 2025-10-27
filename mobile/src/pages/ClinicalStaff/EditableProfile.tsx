import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { useAuth } from "../../context/AuthContext";
import { apiService } from "../../services/api";
import type { DoctorUser, NurseUser } from "../../types/medical";
import {
  User,
  Stethoscope,
  FileText,
  Edit3,
  Save,
  X,
  LogOut,
} from "lucide-react-native";

export function EditableClinicalProfile() {
  const { user, logout, refreshUser } = useAuth();
  const [userPhoto, setUserPhoto] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Estados de edición
  const [editingSpecialization, setEditingSpecialization] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(false);
  const [editingLicense, setEditingLicense] = useState(false);

  // Estados temporales
  const [tempSpecialization, setTempSpecialization] = useState("");
  const [tempDepartment, setTempDepartment] = useState("");
  const [tempLicense, setTempLicense] = useState("");

  const isDoctor = user?.role === "doctor";
  const isNurse = user?.role === "nurse";
  const accentColor = isDoctor ? "#001663" : "#00B4D8";

  // Cargar foto de perfil
  useEffect(() => {
    const loadUserPhoto = async () => {
      if (user?.id) {
        try {
          const photoData = await apiService.users.getProfilePicture(user.id);
          setUserPhoto(photoData);
        } catch (error) {
          console.log("No profile picture found");
        }
      }
    };
    loadUserPhoto();
  }, [user?.id]);

  // Guardar campo
  const saveField = async (field: string, value: any) => {
    if (!user) return false;
    try {
      setSaving(true);
      await apiService.users.update(user.id, { [field]: value });
      
      // Actualizar el usuario en el contexto sin recargar
      await refreshUser();
      
      Alert.alert("✅ Cambios guardados correctamente");
      return true;
    } catch (error) {
      console.error("Error saving field:", error);
      Alert.alert("❌ Error al guardar. Intenta nuevamente.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  // ==== ESPECIALIZACIÓN (Doctor) ====
  const startEditingSpecialization = () => {
    if (!user || !isDoctor) return;
    setTempSpecialization((user as DoctorUser).specialization || "");
    setEditingSpecialization(true);
  };

  const saveSpecialization = async () => {
    if (await saveField("specialization", tempSpecialization)) {
      setEditingSpecialization(false);
    }
  };

  // ==== DEPARTAMENTO (Nurse) ====
  const startEditingDepartment = () => {
    if (!user || !isNurse) return;
    setTempDepartment((user as NurseUser).department || "");
    setEditingDepartment(true);
  };

  const saveDepartment = async () => {
    if (await saveField("department", tempDepartment)) {
      setEditingDepartment(false);
    }
  };

  // ==== LICENCIA ====
  const startEditingLicense = () => {
    if (!user) return;
    const clinicalUser = user as DoctorUser | NurseUser;
    setTempLicense(clinicalUser.license || "");
    setEditingLicense(true);
  };

  const saveLicense = async () => {
    if (await saveField("license", tempLicense)) {
      setEditingLicense(false);
    }
  };

  // ==== FOTO DE PERFIL ====
  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm.status !== "granted") {
      Alert.alert(
        "Permiso requerido",
        "Necesitamos acceso a tus fotos para cambiar la imagen de perfil."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) return;

    const pickedUri = result.assets[0].uri;
    try {
      setSaving(true);

      // Optimizar imagen
      const manipulated = await ImageManipulator.manipulateAsync(
        pickedUri,
        [{ resize: { width: 500, height: 500 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );

      // Subir imagen
      const uploadResult = await apiService.users.uploadProfilePicture(
        user!.id,
        manipulated.uri
      );

      setUserPhoto(uploadResult.url || manipulated.uri);
      Alert.alert("✅ Imagen actualizada correctamente");
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      Alert.alert("❌ Error", "No se pudo actualizar la foto de perfil");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Cerrar sesión", "¿Seguro que deseas salir?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Salir", style: "destructive", onPress: logout },
    ]);
  };

  if (!user) return null;

  const clinicalUser = user as DoctorUser | NurseUser;
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Mi Perfil</Text>
        <Text style={styles.subtitle}>
          Información profesional y datos personales
        </Text>
      </View>

      {/* Datos Personales */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <User size={20} color={accentColor} />
          <Text style={[styles.cardTitle, { color: accentColor }]}>
            Datos Personales
          </Text>
        </View>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View
            style={[
              styles.avatar,
              { backgroundColor: accentColor + "40", borderColor: accentColor },
            ]}
          >
            {userPhoto?.url ? (
              <Image source={{ uri: userPhoto.url }} style={styles.avatarImg} />
            ) : (
              <Text style={[styles.avatarText, { color: accentColor }]}>
                {initials}
              </Text>
            )}
          </View>
          <TouchableOpacity
            style={styles.changePhotoBtn}
            onPress={pickImage}
            disabled={saving}
          >
            <Edit3 size={14} color="#374151" />
            <Text style={styles.changePhotoText}>Cambiar Foto</Text>
          </TouchableOpacity>
        </View>

        {/* Info */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Nombre completo</Text>
            <Text style={styles.value}>{user.name}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{user.email}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>RUT</Text>
            <Text style={styles.value}>{user.rut}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Rol</Text>
            <Text style={styles.value}>
              {isDoctor ? "Doctor" : "Enfermera"}
            </Text>
          </View>
        </View>
      </View>

      {/* Información Profesional */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Stethoscope size={20} color={accentColor} />
          <Text style={[styles.cardTitle, { color: accentColor }]}>
            Información Profesional
          </Text>
        </View>

        {/* Especialización (Solo para doctores) */}
        {isDoctor && (
          <View style={styles.editableField}>
            <View style={styles.fieldHeader}>
              <Text style={styles.label}>Especialización</Text>
              {!editingSpecialization && (
                <TouchableOpacity onPress={startEditingSpecialization}>
                  <Edit3 size={16} color="#6B7280" />
                </TouchableOpacity>
              )}
            </View>
            {editingSpecialization ? (
              <>
                <TextInput
                  style={styles.input}
                  value={tempSpecialization}
                  onChangeText={setTempSpecialization}
                  placeholder="Ej: Oncología, Cirugía Oncológica"
                />
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[styles.saveBtn, { backgroundColor: accentColor }]}
                    onPress={saveSpecialization}
                    disabled={saving}
                  >
                    <Save size={16} color="#fff" />
                    <Text style={styles.btnText}>Guardar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => setEditingSpecialization(false)}
                  >
                    <X size={16} color="#6B7280" />
                    <Text style={styles.cancelText}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <Text style={styles.value}>
                {(clinicalUser as DoctorUser).specialization ||
                  "No especificada"}
              </Text>
            )}
          </View>
        )}

        {/* Departamento (Solo para enfermeras) */}
        {isNurse && (
          <View style={styles.editableField}>
            <View style={styles.fieldHeader}>
              <Text style={styles.label}>Departamento</Text>
              {!editingDepartment && (
                <TouchableOpacity onPress={startEditingDepartment}>
                  <Edit3 size={16} color="#6B7280" />
                </TouchableOpacity>
              )}
            </View>
            {editingDepartment ? (
              <>
                <TextInput
                  style={styles.input}
                  value={tempDepartment}
                  onChangeText={setTempDepartment}
                  placeholder="Ej: Oncología, Cuidados Intensivos"
                />
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[styles.saveBtn, { backgroundColor: accentColor }]}
                    onPress={saveDepartment}
                    disabled={saving}
                  >
                    <Save size={16} color="#fff" />
                    <Text style={styles.btnText}>Guardar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => setEditingDepartment(false)}
                  >
                    <X size={16} color="#6B7280" />
                    <Text style={styles.cancelText}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <Text style={styles.value}>
                {(clinicalUser as NurseUser).department || "No especificado"}
              </Text>
            )}
          </View>
        )}

        {/* Licencia */}
        <View style={styles.editableField}>
          <View style={styles.fieldHeader}>
            <Text style={styles.label}>Número de Licencia</Text>
            {!editingLicense && (
              <TouchableOpacity onPress={startEditingLicense}>
                <Edit3 size={16} color="#6B7280" />
              </TouchableOpacity>
            )}
          </View>
          {editingLicense ? (
            <>
              <TextInput
                style={styles.input}
                value={tempLicense}
                onChangeText={setTempLicense}
                placeholder="Ej: MED-12345"
              />
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.saveBtn, { backgroundColor: accentColor }]}
                  onPress={saveLicense}
                  disabled={saving}
                >
                  <Save size={16} color="#fff" />
                  <Text style={styles.btnText}>Guardar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setEditingLicense(false)}
                >
                  <X size={16} color="#6B7280" />
                  <Text style={styles.cancelText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <Text style={styles.value}>
              {clinicalUser.license || "No especificada"}
            </Text>
          )}
        </View>
      </View>

      {/* Botón Cerrar Sesión */}
      <View style={styles.card}>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <LogOut size={18} color="#DC2626" />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    padding: 20,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  card: {
    backgroundColor: "white",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarImg: {
    width: 76,
    height: 76,
    borderRadius: 38,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "bold",
  },
  changePhotoBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 6,
  },
  changePhotoText: {
    fontSize: 12,
    color: "#374151",
  },
  infoSection: {
    gap: 16,
  },
  infoRow: {
    gap: 4,
  },
  label: {
    fontSize: 12,
    color: "#6B7280",
  },
  value: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
  },
  editableField: {
    marginBottom: 16,
  },
  fieldHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    backgroundColor: "#F9FAFB",
    color: "#111827",
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 8,
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    justifyContent: "center",
  },
  btnText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  cancelBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "white",
    flex: 1,
    justifyContent: "center",
  },
  cancelText: {
    color: "#6B7280",
    fontWeight: "600",
    fontSize: 14,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#FCA5A5",
    borderRadius: 8,
    backgroundColor: "#FEF2F2",
  },
  logoutText: {
    color: "#DC2626",
    fontWeight: "600",
    fontSize: 14,
  },
});
