import React, { useState, useEffect, useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Modal, TextInput, StyleSheet, Linking,} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy"; // ✅ legacy para getInfoAsync
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../../context/AuthContext";
import { usePatientData } from "../../hooks/usePatientData";
import { apiService } from "../../services/api";
import {type PatientDocument, type DocumentType, getDocumentTypeLabel,} from "../../types/medical";
import { Plus, FileText, Trash2, FolderOpen, Upload, Camera, Calendar,} from "lucide-react-native";

type MobileFile = { uri: string; name: string; type: string };

// 🎨 Colores por tipo (igual al web)
const TYPE_COLORS: Record<DocumentType, string> = {
  examen: "#2563EB", // blue-600
  cirugia: "#DC2626", // red-600
  quimioterapia: "#7C3AED", // purple-600
  radioterapia: "#EA580C", // orange-600
  receta: "#16A34A", // green-600
  informe_medico: "#4F46E5", // indigo-600
  consentimiento: "#CA8A04", // yellow-600
  otro: "#4B5563", // gray-600
};

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB

export function DocumentsPatient({ hideHeader = false }: { hideHeader?: boolean }) {
  const { user } = useAuth();
  const { patientId, cancerColor } = usePatientData();

  const [documents, setDocuments] = useState<PatientDocument[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<PatientDocument[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<DocumentType | "todos">("todos");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState("");
  const [newDocType, setNewDocType] = useState<DocumentType>("examen");
  const [selectedFile, setSelectedFile] = useState<MobileFile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // ====== Carga y filtro ======
  useEffect(() => {
    if (patientId) loadDocuments();
  }, [patientId]);

  useEffect(() => {
    filterDocuments();
  }, [documents, selectedFilter]);

  const loadDocuments = async () => {
    try {
      const docs = await apiService.patients.getDocuments(patientId);
      setDocuments(docs ?? []);
    } catch (err) {
      console.error("Error cargando documentos:", err);
      setDocuments([]);
    }
  };

  // Agrupa Comité Oncológico usando el campo isComiteOncologico y aplica filtro por tipo
  const filterDocuments = () => {
    const base =
      selectedFilter === "todos"
        ? documents
        : documents.filter((d) => d.type === selectedFilter);

    const comiteDocs = base.filter((d) => d.isComiteOncologico === true);
    const otherDocs = base.filter((d) => d.isComiteOncologico !== true);
    setFilteredDocuments([...comiteDocs, ...otherDocs]);
  };

  // Conteo por tipo para chips
  const getDocumentCountByType = (type: DocumentType | "todos") => {
    if (type === "todos") return documents.length;
    return documents.filter((d) => d.type === type).length;
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("es-CL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  // Permisos para borrar (igual al web)
  const canDeleteDocument = (document: PatientDocument): boolean => {
    if (!user) return false;
    if (document.uploaderId === user.id) return true;
    if (["doctor", "nurse"].includes(user.role)) return true;
    if (user.role === "guardian") return document.patientId === patientId;
    if (user.role === "patient")
      return document.patientId === patientId && document.uploaderId === user.id;
    return false;
  };

  // ====== Helpers de archivos ======
  const ensureMaxSize = async (uri: string, fallbackSize?: number) => {
    // si tenemos tamaño del picker y pasa, no pedimos info
    if (typeof fallbackSize === "number" && fallbackSize <= MAX_FILE_BYTES) return true;

    const info = await FileSystem.getInfoAsync(uri);
    if (info.exists && "size" in info && typeof info.size === "number") {
      if (info.size > MAX_FILE_BYTES) {
        Alert.alert("Archivo demasiado grande", "Máximo 10 MB");
        return false;
      }
    }
    return true;
  };

  const validateMime = (mime: string) => {
    const allowed = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "application/pdf",
    ];
    // algunos Android devuelven application/octet-stream, lo dejamos pasar y validamos por extensión en backend si es necesario
    if (mime === "application/octet-stream") return true;
    if (!allowed.includes(mime)) {
      Alert.alert("Tipo no permitido", "Solo imágenes o PDFs.");
      return false;
    }
    return true;
  };

  // ====== Acciones generales ======
  const handleDeleteDocument = async (docId: string) => {
    Alert.alert("Eliminar documento", "¿Deseas eliminar este documento?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await apiService.documents.delete(docId);
            loadDocuments();
          } catch (err) {
            Alert.alert("Error", "No se pudo eliminar el documento.");
          }
        },
      },
    ]);
  };

  const downloadDocument = async (docId: string) => {
    try {
      const { url } = await apiService.documents.getDownloadUrl(docId);
      if (url) Linking.openURL(url);
      else Alert.alert("Error", "No se encontró la URL del documento.");
    } catch (error) {
      Alert.alert("Error", "No se pudo abrir el documento.");
    }
  };

  // 🧩 agregar estos nuevos estados cerca del resto:
const [showComiteTitleModal, setShowComiteTitleModal] = useState(false);
const [pendingComiteFile, setPendingComiteFile] = useState<MobileFile | null>(null);
const [pendingComiteMime, setPendingComiteMime] = useState<string>("");
const [pendingIsPhoto, setPendingIsPhoto] = useState(false);
const [pendingComiteTitle, setPendingComiteTitle] = useState("Comité Oncológico");

// ====== Subida: Comité Oncológico (archivo) ======
const handleAddComiteFile = async () => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["image/*", "application/pdf"],
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (result.canceled) return;
    const asset = result.assets?.[0];
    if (!asset?.uri) return;

    if (!(await ensureMaxSize(asset.uri, (asset as any)?.size))) return;
    const mime = asset.mimeType || "application/octet-stream";
    if (!validateMime(mime)) return;

    // 🔹 Guardar archivo pendiente y abrir modal para pedir título
    setPendingComiteFile({
      uri: asset.uri,
      name: asset.name || "documento.pdf",
      type: mime,
    });
    setPendingComiteMime(mime);
    setPendingIsPhoto(false);
    setPendingComiteTitle("Comité Oncológico");
    setShowComiteTitleModal(true);
  } catch (error) {
    console.error("Error seleccionando archivo Comité Oncológico:", error);
  }
};

// ====== Subida: Comité Oncológico (foto) ======
const handleAddComitePhoto = async () => {
  const perm = await ImagePicker.requestCameraPermissionsAsync();
  if (perm.status !== "granted") {
    Alert.alert("Permiso requerido", "Necesitamos acceso a la cámara.");
    return;
  }
  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    quality: 0.9,
  });
  if (result.canceled) return;
  const asset = result.assets?.[0];
  if (!asset?.uri) return;

  if (!(await ensureMaxSize(asset.uri))) return;
  const mime = "image/jpeg";
  if (!validateMime(mime)) return;

  // 🔹 Guardar foto pendiente y abrir modal para pedir título
  setPendingComiteFile({
    uri: asset.uri,
    name: asset.fileName || "foto.jpg",
    type: mime,
  });
  setPendingComiteMime(mime);
  setPendingIsPhoto(true);
  setPendingComiteTitle("Comité Oncológico");
  setShowComiteTitleModal(true);
};

// ====== Confirmar subida (comité) ======
const confirmUploadComite = async () => {
  if (!pendingComiteFile || !pendingComiteMime) return;
  if (!pendingComiteTitle.trim()) {
    Alert.alert("Falta título", "Ingresa un título para el documento.");
    return;
  }

  try {
    setIsLoading(true);
    await apiService.documents.create(
      {
        title: pendingComiteTitle.trim(),
        type: "informe_medico",
        patientId,
        uploaderId: user?.id,
        uploadDate: new Date().toISOString(),
        isComiteOncologico: true, // Marcar como documento del Comité Oncológico
      },
      pendingComiteFile
    );
    await loadDocuments();
    Alert.alert(
      "✅ Documento subido", 
      "El documento del Comité Oncológico se subió exitosamente. Puedes subir más archivos."
    );
  } catch (error) {
    Alert.alert("❌ Error", "No se pudo subir el documento.");
  } finally {
    setIsLoading(false);
    setShowComiteTitleModal(false);
    setPendingComiteFile(null);
    setPendingComiteMime("");
    setPendingComiteTitle("Comité Oncológico");
    setPendingIsPhoto(false);
  }
};


  // ====== Subida general (modal) ======
  const handlePickFile = async () => {
    const res = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      multiple: false,
      type: "*/*", // abre todo; filtramos luego
    });
    if (res.canceled) return;
    const asset = res.assets?.[0];
    if (!asset?.uri) return;

    // Validaciones
    if (!(await ensureMaxSize(asset.uri, (asset as any)?.size))) return;
    const mime = asset.mimeType || "application/octet-stream";
    if (!validateMime(mime)) return;

    setSelectedFile({
      uri: asset.uri,
      name: asset.name || "documento",
      type: mime,
    });
    if (!newDocTitle.trim())
      setNewDocTitle((asset.name || "Nuevo Documento").split(".")[0]);
  };

  const handleTakePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (perm.status !== "granted") {
      Alert.alert("Permiso requerido", "Necesitamos acceso a la cámara.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.9,
    });
    if (result.canceled) return;
    const asset = result.assets?.[0];
    if (!asset?.uri) return;

    if (!(await ensureMaxSize(asset.uri))) return;
    const mime = "image/jpeg";
    if (!validateMime(mime)) return;

    setSelectedFile({
      uri: asset.uri,
      name: asset.fileName || "foto.jpg",
      type: mime,
    });
    if (!newDocTitle.trim())
      setNewDocTitle("Foto " + new Date().toLocaleTimeString());
  };

  const handleAddDocument = async () => {
    if (!newDocTitle.trim() || !selectedFile) {
      Alert.alert("Campos incompletos", "Ingresa un título y selecciona un archivo.");
      return;
    }
    if (!user || !patientId) {
      Alert.alert("Error", "Faltan datos de usuario o paciente.");
      return;
    }
    setIsLoading(true);
    try {
      await apiService.documents.create(
        {
          title: newDocTitle,
          type: newDocType,
          patientId,
          uploaderId: user.id,
          uploadDate: new Date().toISOString(),
        },
        selectedFile
      );
      await loadDocuments();
      setNewDocTitle("");
      setNewDocType("examen");
      setSelectedFile(null);
      setIsModalVisible(false);
    } catch (error) {
      Alert.alert("Error", "No se pudo subir el documento.");
    } finally {
      setIsLoading(false);
    }
  };

  // ====== Derivaciones de lista ======
  const comiteDocs = useMemo(
    () => filteredDocuments.filter((d) => d.isComiteOncologico === true),
    [filteredDocuments]
  );
  const otherDocs = useMemo(
    () => filteredDocuments.filter((d) => d.isComiteOncologico !== true),
    [filteredDocuments]
  );

  if (!patientId) {
    return (
      <View style={{ marginTop: 24 }}>
        <Text style={{ color: "#6B7280", textAlign: "center" }}>
          No se pudo cargar la información del paciente
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      {!hideHeader ? (
        <View style={{ marginBottom: 16 }}>
        <Text style={styles.title}>Mis Documentos</Text>
        <Text style={styles.subtitle}>
          Guarda tus recetas, resultados y documentos médicos
        </Text>

        <TouchableOpacity
          onPress={() => setIsModalVisible(true)}
          style={[styles.newDocBtn, { backgroundColor: cancerColor.color }]}
        >
          <Plus size={18} color="#fff" />
          <Text style={styles.newDocText}>Nuevo Documento</Text>
        </TouchableOpacity>
      </View>

      ) : (
        <View style={{ alignItems: "flex-end" }}>
          <TouchableOpacity
            onPress={() => setIsModalVisible(true)}
            style={[styles.primaryBtn, { backgroundColor: cancerColor.color }]}
          >
            <Plus size={16} color="#fff" />
            <Text style={styles.primaryBtnText}>Nuevo Documento</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Filtros por tipo (igual web, con colores por tipo) */}
      {documents.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 10, marginBottom: 8 }}
        >
          {(
            [
              "todos",
              "examen",
              "cirugia",
              "quimioterapia",
              "radioterapia",
              "receta",
              "informe_medico",
              "consentimiento",
              "otro",
            ] as (DocumentType | "todos")[]
          ).map((type) => {
            const active = selectedFilter === type;
            const color =
              type === "todos" ? cancerColor.color : TYPE_COLORS[type as DocumentType];
            return (
              <TouchableOpacity
                key={type}
                onPress={() => setSelectedFilter(type)}
                style={[
                  styles.filterChip,
                  active && { backgroundColor: color, borderColor: color },
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    active && { color: "#fff", fontWeight: "700" },
                  ]}
                >
                  {getDocumentTypeLabel(type as DocumentType)} (
                  {getDocumentCountByType(type)})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

     {/* 🟣 Sección fija: Comité Oncológico */}
    <View style={styles.comiteBox}>
      <View style={styles.comiteHeader}>
        <Text style={styles.comiteTitle}>Comité Oncológico</Text>
        <Text style={styles.comiteCount}>
          {comiteDocs.length} {comiteDocs.length === 1 ? 'documento' : 'documentos'}
        </Text>
      </View>

      <View style={styles.comiteButtonsRow}>
        <TouchableOpacity style={styles.comiteAddBtn} onPress={handleAddComiteFile}>
          <Upload color="#fff" size={18} />
          <Text style={styles.comiteAddText}>Subir Archivo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.comiteAddBtn} onPress={handleAddComitePhoto}>
          <Camera color="#fff" size={18} />
          <Text style={styles.comiteAddText}>Tomar Foto</Text>
        </TouchableOpacity>
      </View>

      {comiteDocs.length === 0 ? (
        <View style={styles.emptyComite}>
          <FolderOpen color="#7C3AED" size={36} />
          <Text style={styles.emptyComiteText}>Sin documentos del comité aún</Text>
          <Text style={styles.emptyComiteSubtext}>
            Puedes subir múltiples archivos
          </Text>
        </View>
      ) : (
        comiteDocs.map((doc) => (
          <View key={doc.id} style={styles.comiteDocCard}>
            <FileText color="#7C3AED" size={20} />
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={{ fontWeight: "600", color: "#111827" }}>
                {doc.title}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Calendar size={12} color="#6B7280" />
                <Text style={{ color: "#6B7280", fontSize: 12 }}>
                  {formatDate(doc.uploadDate)}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => downloadDocument(doc.id)}
              style={styles.actionBtn}
            >
              <FileText color="#5B21B6" size={16} />
            </TouchableOpacity>
            {canDeleteDocument(doc) && (
              <TouchableOpacity
                onPress={() => handleDeleteDocument(doc.id)}
                style={styles.actionBtnRed}
              >
                <Trash2 color="#DC2626" size={16} />
              </TouchableOpacity>
            )}
          </View>
        ))
      )}
    </View>

      {/* 📚 Otros documentos */}
      <Text style={[styles.title, { marginTop: 10 }]}>Otros documentos</Text>
      {otherDocs.length === 0 ? (
        <View style={styles.emptyBox}>
          <FolderOpen color="#9CA3AF" size={48} />
          <Text style={styles.emptyTitle}>Sin documentos</Text>
          <Text style={styles.emptyText}>
            Guarda tus exámenes, recetas o informes médicos aquí.
          </Text>
        </View>
      ) : (
        otherDocs.map((doc) => (
          <View key={doc.id} style={styles.cardRow}>
            <View style={styles.thumb}>
              <FileText size={26} color="#9CA3AF" />
              <View
                style={[
                  styles.badge,
                  { backgroundColor: TYPE_COLORS[doc.type] },
                ]}
              >
                <Text style={styles.badgeText}>{getDocumentTypeLabel(doc.type)}</Text>
              </View>
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={{ fontWeight: "600", color: "#111827" }}>
                {doc.title}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Calendar size={12} color="#6B7280" />
                <Text style={{ color: "#6B7280", fontSize: 12 }}>
                  {formatDate(doc.uploadDate)}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => downloadDocument(doc.id)}
              style={styles.actionBtn}
            >
              <FileText color="#111827" size={16} />
            </TouchableOpacity>
            {canDeleteDocument(doc) && (
              <TouchableOpacity
                onPress={() => handleDeleteDocument(doc.id)}
                style={styles.actionBtnRed}
              >
                <Trash2 color="#DC2626" size={16} />
              </TouchableOpacity>
            )}
          </View>
        ))
      )}

      {/* ➕ Modal de nuevo documento (general) */}
      <Modal visible={isModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Nuevo Documento</Text>

            <Text style={styles.label}>Título</Text>
            <TextInput
              placeholder="Ej: Receta Tamoxifeno"
              style={styles.input}
              value={newDocTitle}
              onChangeText={setNewDocTitle}
            />

            <Text style={styles.label}>Tipo de documento</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
              {(
                [
                  "examen",
                  "cirugia",
                  "quimioterapia",
                  "radioterapia",
                  "receta",
                  "informe_medico",
                  "consentimiento",
                  "otro",
                ] as DocumentType[]
              ).map((type) => {
                const active = newDocType === type;
                return (
                  <TouchableOpacity
                    key={type}
                    onPress={() => setNewDocType(type)}
                    style={[
                      styles.typeChip,
                      active && {
                        backgroundColor: TYPE_COLORS[type],
                        borderColor: TYPE_COLORS[type],
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.typeChipText,
                        active && { color: "#fff", fontWeight: "700" },
                      ]}
                    >
                      {getDocumentTypeLabel(type)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={styles.uploadRow}>
              <TouchableOpacity style={styles.uploadBtn} onPress={handlePickFile}>
                <Upload size={16} color="#2563EB" />
                <Text style={styles.uploadText}>
                  {selectedFile ? selectedFile.name : "Subir archivo"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.uploadBtn} onPress={handleTakePhoto}>
                <Camera size={16} color="#2563EB" />
                <Text style={styles.uploadText}>Tomar foto</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.outlineBtn}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.outlineText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.primaryBtn, { backgroundColor: cancerColor.color }]}
                onPress={handleAddDocument}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryBtnText}>Guardar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
            {/* 🟣 Modal para título del Comité Oncológico */}
      <Modal visible={showComiteTitleModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Título del documento</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Informe Comité Oncológico 12/10"
              value={pendingComiteTitle}
              onChangeText={setPendingComiteTitle}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.outlineBtn}
                onPress={() => {
                  setShowComiteTitleModal(false);
                  setPendingComiteFile(null);
                }}
              >
                <Text style={styles.outlineText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.primaryBtn, { backgroundColor: "#7C3AED" }]}
                onPress={confirmUploadComite}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryBtnText}>Subir</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

// 🎨 Estilos
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB", padding: 16 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 20, fontWeight: "700", color: "#111827" },
  subtitle: { color: "#6B7280", fontSize: 13, marginTop: 2 },

  primaryBtn: { flexDirection: "row", alignItems: "center", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  primaryBtnText: { color: "#fff", fontWeight: "600", marginLeft: 6 },

  filterChip: { borderWidth: 1, borderColor: "#D1D5DB", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, marginRight: 8 },
  filterChipText: { color: "#374151", fontWeight: "500", fontSize: 13 },

  // Comité
  comiteBox: { backgroundColor: "#F5F3FF", borderWidth: 1, borderColor: "#7C3AED", borderRadius: 12, padding: 12, marginTop: 14, marginBottom: 16 },
  comiteHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  comiteTitle: { color: "#5B21B6", fontWeight: "700", fontSize: 18 },
  comiteCount: { color: "#7C3AED", fontWeight: "600", fontSize: 14 },
  comiteButtonsRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  comiteAddBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#7C3AED", paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8 },
  comiteAddText: { color: "#fff", fontWeight: "600", marginLeft: 6, fontSize: 14 },
  emptyComite: { alignItems: "center", padding: 20 },
  emptyComiteText: { color: "#6B21A8", fontWeight: "600", marginTop: 6, fontSize: 15 },
  emptyComiteSubtext: { color: "#7C3AED", fontSize: 13, marginTop: 4 },
  comiteDocCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 8, padding: 10, marginBottom: 8 },

  // Otros documentos
  cardRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 10, padding: 10, marginBottom: 10, elevation: 1 },
  thumb: { width: 56, height: 56, borderRadius: 8, backgroundColor: "#F3F4F6", alignItems: "center", justifyContent: "center", position: "relative" },
  badge: { position: "absolute", top: 4, left: 4, paddingVertical: 2, paddingHorizontal: 6, borderRadius: 6 },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },

  emptyBox: { alignItems: "center", marginTop: 24 },
  emptyTitle: { fontSize: 16, fontWeight: "600", marginTop: 8, color: "#374151" },
  emptyText: { color: "#6B7280", fontSize: 13, textAlign: "center", marginTop: 4 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center", padding: 20 },
  modalBox: { backgroundColor: "#fff", borderRadius: 12, padding: 16, width: "100%" },
  modalTitle: { fontWeight: "700", fontSize: 18, marginBottom: 10, color: "#111827" },
  label: { fontWeight: "600", color: "#374151", marginBottom: 6, marginTop: 6 },
  input: { borderWidth: 1, borderColor: "#D1D5DB", borderRadius: 8, padding: 10 },
  uploadRow: { flexDirection: "row", justifyContent: "space-between", gap: 10, marginTop: 10, marginBottom: 10 },
  uploadBtn: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#2563EB", borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12 },
  uploadText: { marginLeft: 8, color: "#2563EB", fontWeight: "500" },

  modalActions: { flexDirection: "row", justifyContent: "flex-end", gap: 8 },
  outlineBtn: { borderWidth: 1, borderColor: "#D1D5DB", borderRadius: 8, paddingVertical: 10, paddingHorizontal: 12 },
  outlineText: { color: "#111827", fontWeight: "600" },

    actionBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
  },
  actionBtnRed: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
  },
  typeChip: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
  },
  typeChipText: {
    color: "#374151",
    fontWeight: "500",
    fontSize: 13,
  },

  newDocBtn: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  marginTop: 12,
  paddingVertical: 10,
  borderRadius: 10,
},
newDocText: {
  color: "#fff",
  fontWeight: "600",
  marginLeft: 6,
  fontSize: 15,
  },
});
