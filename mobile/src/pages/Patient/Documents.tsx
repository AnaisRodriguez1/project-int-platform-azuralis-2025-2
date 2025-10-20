import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator, Modal, TextInput, StyleSheet,} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { usePatientData } from "../../hooks/usePatientData";
import { apiService } from "../../services/api";
import {
  type PatientDocument,
  type DocumentType,
  getDocumentTypeColor,
  getDocumentTypeLabel,
} from "../../types/medical";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";


interface DocumentsPatientProps {
  hideHeader?: boolean;
}

export function DocumentsPatient({ hideHeader = false }: DocumentsPatientProps = {}) {
  const { user } = useAuth();
  const { patientId, cancerColor } = usePatientData();

  const [documents, setDocuments] = useState<PatientDocument[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<DocumentType | "todos">("todos");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState("");
  const [newDocType, setNewDocType] = useState<DocumentType>("examen");
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<PatientDocument | null>(null);

  useEffect(() => {
    if (patientId) loadDocuments();
  }, [patientId]);

  const loadDocuments = async () => {
    try {
      const docs = await apiService.patients.getDocuments(patientId);
      setDocuments(docs);
    } catch (err) {
      console.error("Error cargando documentos:", err);
      setDocuments([]);
    }
  };

  const handleAddDocument = async () => {
    if (!newDocTitle.trim() || !selectedFile) {
      Alert.alert("Campos incompletos", "Por favor ingresa un título y selecciona un archivo.");
      return;
    }
    setIsLoading(true);
    try {
      await apiService.documents.create(
        {
          title: newDocTitle,
          type: newDocType,
          patientId,
          uploaderId: user?.id,
          uploadDate: new Date().toISOString(),
        },
        selectedFile
      );
      await loadDocuments();
      resetForm();
      setIsModalVisible(false);
    } catch (error) {
      Alert.alert("Error", "No se pudo subir el documento. Intenta nuevamente.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setNewDocTitle("");
    setNewDocType("examen");
    setSelectedFile(null);
  };

  const handleDeleteDocument = async (docId: string) => {
    Alert.alert("Eliminar documento", "¿Estás seguro de eliminar este documento?", [
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
            console.error(err);
          }
        },
      },
    ]);
  };

  const handleSelectFile = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      setSelectedFile({
        uri: asset.uri,
        name: asset.fileName || "document.jpg",
        type: asset.type || "image/jpeg",
      });
      if (!newDocTitle.trim()) setNewDocTitle(asset.fileName || "Nuevo Documento");
    }
  };

  const handleTakePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      setSelectedFile({
        uri: asset.uri,
        name: asset.fileName || "foto.jpg",
        type: "image/jpeg",
      });
      if (!newDocTitle.trim()) setNewDocTitle("Foto " + new Date().toLocaleTimeString());
    }
  };

  const filteredDocs =
    selectedFilter === "todos"
      ? documents
      : documents.filter((doc) => doc.type === selectedFilter);

  return (
    <View style={styles.container}>
      {!hideHeader && (
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Mis Documentos</Text>
            <Text style={styles.headerSubtitle}>
              Guarda tus recetas, resultados y documentos médicos
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: cancerColor.color }]}
            onPress={() => setIsModalVisible(true)}
          >
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={styles.primaryBtnText}>Nuevo</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Filtros */}
      {documents.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterRow}
        >
          {["todos", "examen", "cirugia", "receta", "radioterapia", "otro"].map((type) => (
            <TouchableOpacity
              key={type}
              onPress={() => setSelectedFilter(type as any)}
              style={[
                styles.filterBtn,
                selectedFilter === type && {
                  backgroundColor: cancerColor.color,
                },
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === type && { color: "white" },
                ]}
              >
                {type === "todos" ? "Todos" : getDocumentTypeLabel(type as DocumentType)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Lista de documentos */}
      <ScrollView contentContainerStyle={styles.docList}>
        {filteredDocs.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="folder-open" size={48} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>Sin documentos</Text>
            <Text style={styles.emptyText}>
              Guarda tus exámenes, recetas o informes médicos aquí.
            </Text>
          </View>
        ) : (
          filteredDocs.map((doc) => (
            <View key={doc.id} style={styles.docCard}>
              {doc.url ? (
                <Image source={{ uri: doc.url }} style={styles.docImage} />
              ) : (
                <View style={styles.docPlaceholder}>
                  <Ionicons name="document-text" size={36} color="#9CA3AF" />
                </View>
              )}
              <View style={styles.docInfo}>
                <Text style={styles.docTitle} numberOfLines={1}>
                  {doc.title}
                </Text>
                <Text style={styles.docDate}>
                  {new Date(doc.uploadDate).toLocaleDateString("es-CL")}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => handleDeleteDocument(doc.id)}
                style={styles.deleteBtn}
              >
                <Ionicons name="trash" size={18} color="#DC2626" />
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      {/* Modal para nuevo documento */}
      <Modal visible={isModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Nuevo Documento</Text>
            <TextInput
              placeholder="Título"
              style={styles.input}
              value={newDocTitle}
              onChangeText={setNewDocTitle}
            />
            <Text style={styles.label}>Tipo de documento</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {[
                "examen",
                "cirugia",
                "receta",
                "radioterapia",
                "informe_medico",
                "otro",
              ].map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => setNewDocType(type as DocumentType)}
                  style={[
                    styles.filterBtn,
                    newDocType === type && {
                      backgroundColor: cancerColor.color,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.filterText,
                      newDocType === type && { color: "white" },
                    ]}
                  >
                    {getDocumentTypeLabel(type as DocumentType)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.uploadRow}>
              <TouchableOpacity style={styles.uploadBtn} onPress={handleSelectFile}>
                <Ionicons name="cloud-upload" size={20} color="#2563EB" />
                <Text style={styles.uploadText}>Subir archivo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.uploadBtn} onPress={handleTakePhoto}>
                <Ionicons name="camera" size={20} color="#2563EB" />
                <Text style={styles.uploadText}>Tomar foto</Text>
              </TouchableOpacity>
            </View>

            {selectedFile && (
              <View style={styles.selectedFileBox}>
                <Ionicons name="document" size={20} color="#2563EB" />
                <Text style={styles.selectedFileName}>{selectedFile.name}</Text>
              </View>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.outlineBtn, { flex: 1 }]}
                onPress={() => {
                  resetForm();
                  setIsModalVisible(false);
                }}
              >
                <Text style={styles.outlineText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.primaryBtn,
                  { flex: 1, backgroundColor: cancerColor.color },
                ]}
                onPress={handleAddDocument}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.primaryBtnText}>Guardar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de documento (vista previa simple) */}
      {selectedDocument && (
        <Modal visible onRequestClose={() => setSelectedDocument(null)} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>{selectedDocument.title}</Text>
              {selectedDocument.url ? (
                <Image source={{ uri: selectedDocument.url }} style={styles.previewImage} />
              ) : (
                <Ionicons name="document-text" size={48} color="#9CA3AF" />
              )}
              <TouchableOpacity
                style={[styles.primaryBtn, { backgroundColor: cancerColor.color }]}
                onPress={() => setSelectedDocument(null)}
              >
                <Text style={styles.primaryBtnText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

// 🎨 Estilos nativos
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#F9FAFB" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: { fontSize: 22, fontWeight: "700", color: "#111827" },
  headerSubtitle: { color: "#6B7280", fontSize: 13 },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  primaryBtnText: { color: "white", fontWeight: "600", marginLeft: 6 },
  outlineBtn: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  outlineText: { color: "#111827", fontWeight: "600" },
  filterRow: { marginBottom: 16 },
  filterBtn: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
  },
  filterText: { color: "#374151", fontWeight: "500", fontSize: 13 },
  docList: { gap: 12 },
  docCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 10,
    borderRadius: 10,
    elevation: 1,
    marginBottom: 10,
  },
  docImage: { width: 60, height: 60, borderRadius: 8 },
  docPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  docInfo: { flex: 1, marginLeft: 10 },
  docTitle: { fontWeight: "600", color: "#111827" },
  docDate: { color: "#6B7280", fontSize: 12 },
  deleteBtn: { padding: 8 },
  emptyBox: { alignItems: "center", marginTop: 40 },
  emptyTitle: { fontSize: 16, fontWeight: "600", marginTop: 8, color: "#374151" },
  emptyText: { color: "#6B7280", fontSize: 13, textAlign: "center", marginTop: 4 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  modalBox: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    width: "100%",
  },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12, color: "#111827" },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  label: { fontWeight: "600", color: "#374151", marginBottom: 6 },
  uploadRow: { flexDirection: "row", justifyContent: "space-between", marginVertical: 8 },
  uploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  uploadText: { marginLeft: 6, color: "#2563EB", fontWeight: "500" },
  selectedFileBox: {
    backgroundColor: "#EFF6FF",
    borderRadius: 8,
    padding: 8,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  selectedFileName: { marginLeft: 8, color: "#1E3A8A", fontWeight: "500" },
  modalActions: { flexDirection: "row", justifyContent: "space-between", marginTop: 16 },
  previewImage: {
    width: "100%",
    height: 300,
    borderRadius: 8,
    marginBottom: 16,
    resizeMode: "contain",
  },
});
