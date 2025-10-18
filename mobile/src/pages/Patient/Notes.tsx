import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Modal, StyleSheet, Alert, ActivityIndicator,} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import { usePatientData } from '../../hooks/usePatientData';
import type { PatientNote } from '../../types/medical';

export default function NotesPatient() {
  const { user } = useAuth();
  const { patientId, cancerColor } = usePatientData();

  const [notes, setNotes] = useState<PatientNote[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingNote, setEditingNote] = useState<PatientNote | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Cargar notas al iniciar
  useEffect(() => {
    const loadNotes = async () => {
      try {
        const stored = await AsyncStorage.getItem(`notes_${patientId}`);
        const parsed = stored ? JSON.parse(stored) : [];
        setNotes(parsed);
      } catch (err) {
        console.error('Error al cargar notas:', err);
      }
    };
    loadNotes();
  }, [patientId]);

  const saveNotes = async (newNotes: PatientNote[]) => {
    setNotes(newNotes);
    await AsyncStorage.setItem(`notes_${patientId}`, JSON.stringify(newNotes));
  };

  const handleAddNote = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos.');
      return;
    }

    setIsLoading(true);

    const newNote: PatientNote = {
      id: Date.now().toString(),
      title,
      content,
      date: new Date().toISOString(),
      patientId,
      authorId: user?.id || 'local',
      authorName: user?.name || 'Anónimo',
    };

    const updated = [newNote, ...notes];
    await saveNotes(updated);
    resetForm();
    setModalVisible(false);
    setIsLoading(false);
  };

  const handleUpdateNote = async () => {
    if (!editingNote) return;

    const updated = notes.map((n) =>
      n.id === editingNote.id ? { ...n, title, content } : n
    );
    await saveNotes(updated);
    resetForm();
    setModalVisible(false);
  };

  const handleDeleteNote = (id: string) => {
    Alert.alert('Eliminar nota', '¿Seguro que deseas eliminar esta nota?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          const updated = notes.filter((n) => n.id !== id);
          await saveNotes(updated);
        },
      },
    ]);
  };

  const startEditing = (note: PatientNote) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setModalVisible(true);
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setEditingNote(null);
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>🩺 Mis Notas</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: cancerColor.color }]}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addButtonText}>+ Nueva Nota</Text>
        </TouchableOpacity>
      </View>

      {/* LISTA */}
      {notes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📝</Text>
          <Text style={styles.emptyText}>No tienes notas registradas</Text>
          <Text style={styles.emptySub}>Empieza a anotar tus síntomas y observaciones</Text>
        </View>
      ) : (
        notes.map((note) => (
          <View key={note.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{note.title}</Text>
              <View style={styles.actions}>
                <TouchableOpacity onPress={() => startEditing(note)}>
                  <Text style={styles.actionText}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteNote(note.id)}>
                  <Text style={styles.actionText}>🗑</Text>
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.cardContent}>{note.content}</Text>
            <Text style={styles.cardDate}>
              {formatDate(note.date)} • {note.authorName}
            </Text>
          </View>
        ))
      )}

      {/* MODAL NUEVA / EDITAR NOTA */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {editingNote ? 'Editar Nota' : 'Nueva Nota'}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Título"
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              style={[styles.input, { height: 100 }]}
              placeholder="Escribe aquí tus observaciones..."
              multiline
              value={content}
              onChangeText={setContent}
            />

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.cancelBtn]}
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
              >
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: cancerColor.color }]}
                onPress={editingNote ? handleUpdateNote : handleAddNote}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveText}>
                    {editingNote ? 'Actualizar' : 'Guardar'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#f9fafb', flexGrow: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 22, fontWeight: 'bold', color: '#111' },
  addButton: { padding: 10, borderRadius: 8 },
  addButtonText: { color: '#fff', fontWeight: '600' },
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyIcon: { fontSize: 48, color: '#ccc', marginBottom: 10 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#333' },
  emptySub: { fontSize: 14, color: '#777', marginTop: 5, textAlign: 'center' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  cardTitle: { fontWeight: 'bold', fontSize: 16, color: '#222', flex: 1 },
  cardContent: { fontSize: 14, color: '#444', marginVertical: 8 },
  cardDate: { fontSize: 12, color: '#999' },
  actions: { flexDirection: 'row', gap: 8 },
  actionText: { fontSize: 18, color: '#555', marginHorizontal: 4 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#111' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 5,
  },
  cancelText: { color: '#333', fontWeight: '500' },
  saveBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 5,
  },
  saveText: { color: '#fff', fontWeight: '600' },
});
