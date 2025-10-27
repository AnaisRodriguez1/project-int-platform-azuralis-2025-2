import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, StyleSheet,} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { usePatientData } from "../../hooks/usePatientData";
import { apiService } from "../../services/api";
import type { PatientNote } from "../../types/medical";
import { Plus, Calendar, Edit3, Trash2, StickyNote } from "lucide-react-native";

interface NotesPatientProps {
  hideHeader?: boolean;
}

export function NotesPatient({ hideHeader = false }: NotesPatientProps) {
  const { user } = useAuth();
  const { cancerColor, patientId } = usePatientData();
  const [notes, setNotes] = useState<PatientNote[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [editingNote, setEditingNote] = useState<PatientNote | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (patientId) loadNotes();
  }, [patientId]);

  const loadNotes = async () => {
    if (!patientId) return;
    try {
      const patientNotes = await apiService.patients.getNotes(patientId);
      setNotes(patientNotes);
    } catch (error) {
      console.error("❌ Error al cargar notas:", error);
      setNotes([]);
    }
  };

  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return "Fecha no disponible";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Fecha inválida";
      return date.toLocaleDateString("es-CL", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Fecha inválida";
    }
  };

  const handleAddNote = async () => {
    if (!newNoteTitle.trim() || !newNoteContent.trim() || !patientId || !user)
      return;

    setIsLoading(true);
    try {
      const noteData = {
        title: newNoteTitle,
        content: newNoteContent,
        patientId,
        authorId: user.id,
        authorName: user.name,
        createdAt: new Date().toISOString(),
      };
      await apiService.notes.create(noteData);
      loadNotes();
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error al crear nota:", error);
      Alert.alert("Error", "Error al crear la nota.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateNote = async () => {
    if (!editingNote || !newNoteTitle.trim() || !newNoteContent.trim()) return;

    setIsLoading(true);
    try {
      await apiService.notes.update(editingNote.id, {
        title: newNoteTitle,
        content: newNoteContent,
      });
      loadNotes();
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error al actualizar nota:", error);
      Alert.alert("Error", "Error al actualizar la nota.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    Alert.alert("Eliminar nota", "¿Seguro que deseas eliminar esta nota?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          setIsLoading(true);
          try {
            await apiService.notes.delete(noteId);
            loadNotes();
          } catch (error) {
            console.error("Error al eliminar nota:", error);
            Alert.alert("Error", "No se pudo eliminar la nota.");
          } finally {
            setIsLoading(false);
          }
        },
      },
    ]);
  };

  const startEditing = (note: PatientNote) => {
    setEditingNote(note);
    setNewNoteTitle(note.title || "");
    setNewNoteContent(note.content);
    setIsDialogOpen(true);
  };

  const canEditNote = (note: any): boolean => {
    if (!user) return false;
    const nameLower = note.authorName?.toLowerCase() || "";
    const isDoctorOrNurse =
      nameLower.includes("dr.") ||
      nameLower.includes("doctor") ||
      nameLower.includes("enferm");

    if (user.role === "patient") {
      if (isDoctorOrNurse) return false;
      return note.authorId === user.id;
    }
    if (user.role === "guardian") {
      if (isDoctorOrNurse) return false;
      return note.patientId === patientId;
    }
    if (user.role === "doctor" || user.role === "nurse") return true;
    return false;
  };

  const resetForm = () => {
    setEditingNote(null);
    setNewNoteTitle("");
    setNewNoteContent("");
  };

  // ---------------- UI ----------------
  if (isDialogOpen) {
    return (
      <View style={styles.dialogContainer}>
        <Text style={styles.dialogTitle}>
          {editingNote ? "Editar Nota" : "Nueva Nota"}
        </Text>

        <Text style={styles.label}>Título</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Efectos después de quimioterapia"
          value={newNoteTitle}
          onChangeText={setNewNoteTitle}
        />

        <Text style={styles.label}>Contenido</Text>
        <TextInput
          style={[styles.input, { height: 120, textAlignVertical: "top" }]}
          placeholder="Describe síntomas, observaciones..."
          value={newNoteContent}
          onChangeText={setNewNoteContent}
          multiline
        />

        <View style={styles.dialogButtons}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => setIsDialogOpen(false)}
          >
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: cancerColor.color, flex: 1 },
            ]}
            disabled={isLoading}
            onPress={editingNote ? handleUpdateNote : handleAddNote}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveText}>
                {editingNote ? "Actualizar" : "Guardar"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {!hideHeader && (
        <>
          <Text style={styles.headerTitle}>Mis Notas</Text>
          <Text style={styles.headerSubtitle}>
            Registra tus síntomas y observaciones
          </Text>
        </>
      )}

      <TouchableOpacity
        style={[styles.newNoteButton, { backgroundColor: cancerColor.color }]}
        onPress={() => setIsDialogOpen(true)}
      >
        <Plus color="#fff" size={18} />
        <Text style={styles.newNoteText}>Nueva Nota</Text>
      </TouchableOpacity>

      {notes.length === 0 ? (
        <View style={styles.emptyCard}>
          <StickyNote size={48} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>No existen notas aún</Text>
          <Text style={styles.emptySubtitle}>
            Comienza a registrar tus síntomas, estado de ánimo u observaciones
          </Text>
          <TouchableOpacity
            style={[
              styles.newNoteButton,
              { backgroundColor: cancerColor.color, marginTop: 10 },
            ]}
            onPress={() => setIsDialogOpen(true)}
          >
            <Plus color="#fff" size={18} />
            <Text style={styles.newNoteText}>Crear primera nota</Text>
          </TouchableOpacity>
        </View>
      ) : (
        notes.map((note) => (
          <View key={note.id} style={styles.noteCard}>
            <View style={styles.noteHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.noteTitle}>{note.title}</Text>
                <Text style={styles.noteMeta}>
                  <Calendar size={14} color="#6B7280" /> {formatDate(note.createdAt)}{" "}
                  • {note.authorName}
                </Text>
              </View>
              {canEditNote(note) && (
                <View style={styles.noteActions}>
                  <TouchableOpacity
                    onPress={() => startEditing(note)}
                    disabled={isLoading}
                  >
                    <Edit3 size={18} color="#6B7280" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDeleteNote(note.id)}
                    disabled={isLoading}
                  >
                    <Trash2 size={18} color="#DC2626" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
            <Text style={styles.noteContent}>{note.content}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

// ---------------- STYLES ----------------
const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#F9FAFB",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
  },
  headerSubtitle: {
    color: "#6B7280",
    marginBottom: 12,
  },
  newNoteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    paddingVertical: 10,
    marginBottom: 16,
    gap: 6,
  },
  newNoteText: { color: "#fff", fontWeight: "600" },
  noteCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    elevation: 2,
  },
  noteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  noteTitle: {
    fontWeight: "600",
    fontSize: 16,
    color: "#111827",
  },
  noteMeta: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  noteActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  noteContent: {
    fontSize: 14,
    color: "#374151",
    marginTop: 6,
  },
  emptyCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 4,
  },
  dialogContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    backgroundColor: "#F9FAFB",
    color: "#111827",
    marginTop: 4,
  },
  dialogButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
    gap: 10,
  },
  button: {
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#E5E7EB",
    flex: 1,
  },
  cancelText: { color: "#374151", fontWeight: "600" },
  saveText: { color: "#fff", fontWeight: "600" },
});
