import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Modal, TextInput, Alert, StyleSheet, ActivityIndicator,} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import { usePatientData } from '../../hooks/usePatientData';
import type { PatientDocument } from '../../types/medical';

export default function DocumentsPatient() {
  const { user } = useAuth();
  const { patientId, cancerColor } = usePatientData();

  const [documents, setDocuments] = useState<PatientDocument[]>([]);
  const [filteredDocs, setFilteredDocs] = useState<PatientDocument[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'todos' | 'prescription' | 'test_result' | 'image' | 'other'>('todos');
  const [modalVisible, setModalVisible] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<PatientDocument | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Campos del nuevo documento
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'prescription' | 'test_result' | 'image' | 'other'>('prescription');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);

  // --- Cargar documentos almacenados
  useEffect(() => {
    const loadDocs = async () => {
      try {
        const stored = await AsyncStorage.getItem(`documents_${patientId}`);
        const parsed = stored ? JSON.parse(stored) : [];
        setDocuments(parsed);
        setFilteredDocs(parsed);
      } catch (err) {
        console.error('Error al cargar documentos:', err);
      }
    };
    loadDocs();
  }, [patientId]);

  // --- Filtrar
  useEffect(() => {
    if (selectedFilter === 'todos') {
      setFilteredDocs(documents);
    } else {
      setFilteredDocs(documents.filter((doc) => doc.type === selectedFilter));
    }
  }, [selectedFilter, documents]);

  // --- Guardar documentos localmente
  const saveDocuments = async (newDocs: PatientDocument[]) => {
    await AsyncStorage.setItem(`documents_${patientId}`, JSON.stringify(newDocs));
  };

  // --- Añadir documento
  const handleAddDocument = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Debes ingresar un título.');
      return;
    }
    setIsLoading(true);

    const newDoc: PatientDocument = {
      id: Date.now().toString(),
      title,
      type,
      description,
      url: imageUri || 'https://via.placeholder.com/150',
      uploadDate: new Date().toISOString(),
      patientId,
      uploaderId: user?.id || 'local',
    };

    const updated = [newDoc, ...documents];
    setDocuments(updated);
    saveDocuments(updated);
    resetForm();
    setModalVisible(false);
    setIsLoading(false);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setImageUri(null);
    setType('prescription');
  };

  // --- Eliminar
  const handleDelete = (id: string) => {
    Alert.alert('Eliminar documento', '¿Seguro que deseas eliminarlo?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          const updated = documents.filter((d) => d.id !== id);
          setDocuments(updated);
          saveDocuments(updated);
        },
      },
    ]);
  };

  // --- Subir imagen (galería o cámara)
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tus imágenes.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a la cámara.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>📄 Mis Documentos</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: cancerColor.color }]}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addButtonText}>+ Nuevo</Text>
        </TouchableOpacity>
      </View>

      {/* FILTROS */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
        {['todos', 'prescription', 'test_result', 'image', 'other'].map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setSelectedFilter(f as any)}
            style={[
              styles.filterButton,
              selectedFilter === f && { backgroundColor: cancerColor.color },
            ]}
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === f && { color: '#fff' },
              ]}
            >
              {f === 'todos' ? 'Todos' :
               f === 'prescription' ? 'Recetas' :
               f === 'test_result' ? 'Resultados' :
               f === 'image' ? 'Imágenes' : 'Otros'}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* LISTADO */}
      {filteredDocs.length === 0 ? (
        <Text style={styles.empty}>No hay documentos disponibles.</Text>
      ) : (
        filteredDocs.map((doc) => (
          <TouchableOpacity
            key={doc.id}
            style={styles.card}
            onPress={() => setPreviewDoc(doc)}
          >
            <Image source={{ uri: doc.url }} style={styles.image} />
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>{doc.title}</Text>
              {doc.description ? (
                <Text style={styles.cardDesc}>{doc.description}</Text>
              ) : null}
              <Text style={styles.cardDate}>
                {new Date(doc.uploadDate).toLocaleDateString('es-CL')}
              </Text>
            </View>
            <TouchableOpacity onPress={() => handleDelete(doc.id)}>
              <Text style={styles.deleteText}>🗑</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))
      )}

      {/* MODAL NUEVO DOCUMENTO */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Nuevo Documento</Text>

            <TextInput
              placeholder="Título"
              style={styles.input}
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              placeholder="Descripción (opcional)"
              style={[styles.input, { height: 60 }]}
              value={description}
              onChangeText={setDescription}
              multiline
            />

            <View style={styles.imagePreview}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.previewImage} />
              ) : (
                <Text style={styles.previewText}>Sin imagen seleccionada</Text>
              )}
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.secondaryBtn} onPress={pickImage}>
                <Text style={styles.secondaryText}>Subir</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryBtn} onPress={takePhoto}>
                <Text style={styles.secondaryText}>Cámara</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.cancelBtn]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: cancerColor.color }]}
                onPress={handleAddDocument}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveText}>Guardar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL PREVISUALIZACIÓN */}
      <Modal visible={!!previewDoc} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {previewDoc && (
              <>
                <Image
                  source={{ uri: previewDoc.url }}
                  style={styles.previewLarge}
                  resizeMode="contain"
                />
                <Text style={styles.modalTitle}>{previewDoc.title}</Text>
                {previewDoc.description ? (
                  <Text style={styles.previewText}>{previewDoc.description}</Text>
                ) : null}
                <TouchableOpacity
                  style={[styles.saveBtn, { backgroundColor: cancerColor.color }]}
                  onPress={() => setPreviewDoc(null)}
                >
                  <Text style={styles.saveText}>Cerrar</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#f9fafb' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#111' },
  addButton: { padding: 10, borderRadius: 8 },
  addButtonText: { color: '#fff', fontWeight: '600' },
  filters: { marginBottom: 15 },
  filterButton: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 16, backgroundColor: '#eee', marginRight: 8 },
  filterText: { fontSize: 13, color: '#333' },
  empty: { textAlign: 'center', color: '#777', marginTop: 50 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, padding: 10, marginBottom: 10, elevation: 2 },
  image: { width: 60, height: 60, borderRadius: 6, marginRight: 10 },
  cardInfo: { flex: 1 },
  cardTitle: { fontWeight: '600', fontSize: 15, color: '#222' },
  cardDesc: { fontSize: 12, color: '#666', marginVertical: 2 },
  cardDate: { fontSize: 11, color: '#999' },
  deleteText: { fontSize: 18, color: '#e63946', paddingHorizontal: 6 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { width: '100%', backgroundColor: '#fff', borderRadius: 12, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#111' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginBottom: 10 },
  imagePreview: { alignItems: 'center', marginVertical: 10 },
  previewImage: { width: 100, height: 100, borderRadius: 8 },
  previewText: { color: '#777', fontSize: 13 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  secondaryBtn: { flex: 1, backgroundColor: '#eee', padding: 10, borderRadius: 8, alignItems: 'center', marginHorizontal: 5 },
  secondaryText: { color: '#333', fontWeight: '500' },
  cancelBtn: { flex: 1, backgroundColor: '#ccc', padding: 10, borderRadius: 8, alignItems: 'center', marginRight: 5 },
  cancelText: { color: '#333', fontWeight: '500' },
  saveBtn: { flex: 1, padding: 10, borderRadius: 8, alignItems: 'center', marginLeft: 5 },
  saveText: { color: '#fff', fontWeight: '600' },
  previewLarge: { width: 280, height: 280, marginBottom: 10, borderRadius: 10 },
});
