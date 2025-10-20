import React, { useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert, ActivityIndicator, Linking,} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { ArrowLeft, Phone, AlertTriangle, Calendar, User as UserIcon, Pill, Scissors, FileText, StickyNote, Activity as ActivityIcon, Edit2, Save, X, Plus, Trash2,} from "lucide-react-native";
import type { Patient, EmergencyContact, Operation } from "../types/medical";
import {
  cancerColors,
  DOCTOR_PERMISSIONS,
  NURSE_PERMISSIONS,
  type User,
} from "../types/medical";
import { useAuth } from "../context/AuthContext";
import { apiService } from "../services/api";
import { ManageCareTeam } from "./ManageCareTeam"; // versión móvil que ya hicimos

interface EditablePatientRecordProps {
  patient: Patient;
  onBack: () => void;
}

type TabKey = "general" | "notes" | "documents" | "team";

export function EditablePatientRecord({
  patient: initialPatient,
  onBack,
}: EditablePatientRecordProps) {
  const [patient, setPatient] = useState<Patient>(initialPatient);
  const { user } = useAuth();
  const cancerColor = useMemo(() => cancerColors[patient.cancerType], [patient]);
  const isDoctor = user?.role === "doctor";
  const isNurse = user?.role === "nurse";
  const isStaff = isDoctor || isNurse;

  // Tabs
  const [activeTab, setActiveTab] = useState<TabKey>("general");

  // Estados edición
  const [editingMeds, setEditingMeds] = useState(false);
  const [editingAllergies, setEditingAllergies] = useState(false);
  const [editingContacts, setEditingContacts] = useState(false);
  const [editingOperations, setEditingOperations] = useState(false);
  const [editingTreatment, setEditingTreatment] = useState(false);

  // Temporales
  const [tempMeds, setTempMeds] = useState<string[]>([]);
  const [tempAllergies, setTempAllergies] = useState<string[]>([]);
  const [tempContacts, setTempContacts] = useState<EmergencyContact[]>([]);
  const [tempOperations, setTempOperations] = useState<Operation[]>([]);
  const [tempTreatment, setTempTreatment] = useState("");

  // Notas
  const [notes, setNotes] = useState<any[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [creatingNote, setCreatingNote] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteContent, setEditingNoteContent] = useState("");

  // Documentos
  const [documents, setDocuments] = useState<any[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(true);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState("");
  const [newDocType, setNewDocType] = useState<string>("examen");
  const [selectedFile, setSelectedFile] = useState<{
    uri: string;
    name: string;
    mimeType: string | null;
    size?: number | null;
  } | null>(null);
  const [newDocDescription, setNewDocDescription] = useState("");

  const [saving, setSaving] = useState(false);

  // Permisos de edición por campo
  const canEdit = (field: keyof Patient): boolean => {
    if (!isStaff) return false;
    const perms = isDoctor ? DOCTOR_PERMISSIONS : NURSE_PERMISSIONS;
    return perms.patientProfile?.editableFields.has(field) || false;
    // Si quieres que el paciente edite algunos campos, integra PATIENT_PERMISSIONS aquí.
  };

  // ====== CARGAS ======
  useEffect(() => {
    const loadNotes = async () => {
      try {
        setLoadingNotes(true);
        const patientNotes = await apiService.patients.getNotes(patient.id);
        setNotes(patientNotes);
      } catch (e) {
        setNotes([]);
      } finally {
        setLoadingNotes(false);
      }
    };
    loadNotes();
  }, [patient.id]);

  useEffect(() => {
    const loadDocs = async () => {
      try {
        setLoadingDocuments(true);
        const patientDocs = await apiService.patients.getDocuments(patient.id);
        setDocuments(patientDocs);
      } catch (e) {
        setDocuments([]);
      } finally {
        setLoadingDocuments(false);
      }
    };
    loadDocs();
  }, [patient.id]);

  // ===== Helpers =====
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("es-CL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const callEmergencyContact = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const getDocumentBadgeColor = (type: string): string => {
    const colors: Record<string, string> = {
      examen: "#3b82f6",
      cirugia: "#ef4444",
      quimioterapia: "#8b5cf6",
      radioterapia: "#f59e0b",
      receta: "#10b981",
      informe_medico: "#6366f1",
      consentimiento: "#f59e0b",
      otro: "#6b7280",
    };
    return colors[type] || "#6b7280";
  };

  const getRoleName = (role: string): string => {
    const roleNames: Record<string, string> = {
      oncologo_principal: "Oncólogo Principal",
      enfermera_jefe: "Enfermera Jefe",
      cirujano: "Cirujano",
      radiologo: "Radiólogo",
      consultor: "Consultor",
    };
    return roleNames[role] || role;
  };

  // ===== Guardar campo =====
  const saveField = async (field: keyof Patient, value: any) => {
    try {
      setSaving(true);
      const updatedPatient = await apiService.patients.update(patient.id, {
        [field]: value,
      });
      setPatient(updatedPatient);
      Alert.alert("Éxito", "Cambios guardados correctamente");
      return true;
    } catch (error) {
      Alert.alert("Error", "No se pudo guardar. Intenta nuevamente.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  // ===== Medicamentos =====
  const startEditingMeds = () => {
    setTempMeds([...patient.currentMedications]);
    setEditingMeds(true);
  };
  const saveMeds = async () => {
    const ok = await saveField("currentMedications", tempMeds);
    if (ok) setEditingMeds(false);
  };
  const cancelEditingMeds = () => {
    setTempMeds([]);
    setEditingMeds(false);
  };
  const addMed = () => setTempMeds((prev) => [...prev, ""]);
  const removeMed = (index: number) =>
    setTempMeds((prev) => prev.filter((_, i) => i !== index));
  const updateMed = (index: number, value: string) => {
    const copy = [...tempMeds];
    copy[index] = value;
    setTempMeds(copy);
  };

  // ===== Alergias =====
  const startEditingAllergies = () => {
    setTempAllergies([...patient.allergies]);
    setEditingAllergies(true);
  };
  const saveAllergies = async () => {
    const ok = await saveField("allergies", tempAllergies);
    if (ok) setEditingAllergies(false);
  };
  const cancelEditingAllergies = () => {
    setTempAllergies([]);
    setEditingAllergies(false);
  };
  const addAllergy = () => setTempAllergies((prev) => [...prev, ""]);
  const removeAllergy = (index: number) =>
    setTempAllergies((prev) => prev.filter((_, i) => i !== index));
  const updateAllergy = (index: number, value: string) => {
    const copy = [...tempAllergies];
    copy[index] = value;
    setTempAllergies(copy);
  };

  // ===== Contactos =====
  const startEditingContacts = () => {
    setTempContacts([...patient.emergencyContacts]);
    setEditingContacts(true);
  };
  const saveContacts = async () => {
    const ok = await saveField("emergencyContacts", tempContacts);
    if (ok) setEditingContacts(false);
  };
  const cancelEditingContacts = () => {
    setTempContacts([]);
    setEditingContacts(false);
  };
  const addContact = () =>
    setTempContacts((prev) => [
      ...prev,
      { name: "", relationship: "", phone: "" },
    ]);
  const removeContact = (index: number) =>
    setTempContacts((prev) => prev.filter((_, i) => i !== index));
  const updateContact = (
    index: number,
    field: keyof EmergencyContact,
    value: string
  ) => {
    const copy = [...tempContacts];
    copy[index] = { ...copy[index], [field]: value };
    setTempContacts(copy);
  };

  // ===== Operaciones =====
  const startEditingOperations = () => {
    setTempOperations([...patient.operations]);
    setEditingOperations(true);
  };
  const saveOperations = async () => {
    const ok = await saveField("operations", tempOperations);
    if (ok) setEditingOperations(false);
  };
  const cancelEditingOperations = () => {
    setTempOperations([]);
    setEditingOperations(false);
  };
  const addOperation = () =>
    setTempOperations((prev) => [
      ...prev,
      { date: "", procedure: "", hospital: "" },
    ]);
  const removeOperation = (index: number) =>
    setTempOperations((prev) => prev.filter((_, i) => i !== index));
  const updateOperation = (
    index: number,
    field: keyof Operation,
    value: string
  ) => {
    const copy = [...tempOperations];
    copy[index] = { ...copy[index], [field]: value };
    setTempOperations(copy);
  };

  // ===== Tratamiento =====
  const startEditingTreatment = () => {
    setTempTreatment(patient.treatmentSummary);
    setEditingTreatment(true);
  };
  const saveTreatment = async () => {
    const ok = await saveField("treatmentSummary", tempTreatment);
    if (ok) setEditingTreatment(false);
  };
  const cancelEditingTreatment = () => {
    setTempTreatment("");
    setEditingTreatment(false);
  };

  // ===== Notas =====
  const permsNotes = isDoctor ? DOCTOR_PERMISSIONS : NURSE_PERMISSIONS;
  const canCreateNote = () => !!permsNotes.notes?.create;
  const canEditNote = (note: any) => {
    if (!user) return false;
    if (!permsNotes.notes?.update) return false;
    if (permsNotes.notes.scope === "all") return true;
    return note.authorId === user.id;
  };
  const canDeleteNote = (note: any) => {
    if (!user) return false;
    if (!permsNotes.notes?.delete) return false;
    if (permsNotes.notes.scope === "all") return true;
    return note.authorId === user.id;
  };

  const createNote = async () => {
    if (!newNoteContent.trim() || !user) {
      Alert.alert("Atención", "Escribe el contenido de la nota");
      return;
    }
    try {
      setSaving(true);
      const newNote = await apiService.notes.create({
        patientId: patient.id,
        authorId: (user as User).id,
        authorName: (user as User).name,
        content: newNoteContent,
        title: `Nota de ${(user as User).name}`,
        date: new Date().toISOString(),
      });
      setNotes((prev) => [newNote, ...prev]);
      setNewNoteContent("");
      setCreatingNote(false);
      Alert.alert("Éxito", "Nota creada exitosamente");
    } catch (e) {
      Alert.alert("Error", "No se pudo crear la nota");
    } finally {
      setSaving(false);
    }
  };

  const startEditingNote = (note: any) => {
    setEditingNoteId(note.id);
    setEditingNoteContent(note.content);
  };
  const cancelEditingNote = () => {
    setEditingNoteId(null);
    setEditingNoteContent("");
  };
  const saveEditedNote = async (noteId: string) => {
    if (!editingNoteContent.trim()) {
      Alert.alert("Atención", "El contenido no puede estar vacío");
      return;
    }
    try {
      setSaving(true);
      await apiService.notes.update(noteId, { content: editingNoteContent });
      setNotes((prev) =>
        prev.map((n) => (n.id === noteId ? { ...n, content: editingNoteContent } : n))
      );
      setEditingNoteId(null);
      setEditingNoteContent("");
      Alert.alert("Éxito", "Nota actualizada");
    } catch {
      Alert.alert("Error", "No se pudo actualizar la nota");
    } finally {
      setSaving(false);
    }
  };
  const deleteNote = (noteId: string) => {
    Alert.alert("Confirmar", "¿Eliminar esta nota?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            setSaving(true);
            await apiService.notes.delete(noteId);
            setNotes((prev) => prev.filter((n) => n.id !== noteId));
            Alert.alert("Éxito", "Nota eliminada");
          } catch {
            Alert.alert("Error", "No se pudo eliminar la nota");
          } finally {
            setSaving(false);
          }
        },
      },
    ]);
  };

  // ===== Documentos =====
  const permsDocs = isDoctor ? DOCTOR_PERMISSIONS : NURSE_PERMISSIONS;
  const canUploadDocument = () => !!permsDocs.documents?.create;
  const canDeleteDocument = (doc: any) => {
    if (!user) return false;
    if (!permsDocs.documents?.delete) return false;
    if (permsDocs.documents.scope === "all") return true;
    return doc.uploaderId === (user as User).id;
  };

  const pickFile = async () => {
    const res = await DocumentPicker.getDocumentAsync({
      type: ["image/*", "application/pdf"],
      multiple: false,
      copyToCacheDirectory: true,
    });
    if (res.canceled) return;
    const file = res.assets[0];
    setSelectedFile({
      uri: file.uri,
      name: file.name ?? "documento",
      mimeType: file.mimeType ?? "application/octet-stream",
      size: file.size,
    });
    if (!newDocTitle.trim() && file.name) {
      setNewDocTitle(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const uploadDocument = async () => {
    if (!newDocTitle.trim() || !selectedFile || !user) {
      Alert.alert("Atención", "Completa el título y selecciona un archivo");
      return;
    }

    try {
      setSaving(true);
      // RN FormData file: { uri, name, type }
      const rnFile: any = {
        uri: selectedFile.uri,
        name: selectedFile.name,
        type: selectedFile.mimeType || "application/octet-stream",
      };

      const newDoc = await apiService.documents.create(
        {
          patientId: patient.id,
          uploaderId: (user as User).id,
          title: newDocTitle,
          type: newDocType as any,
          description: newDocDescription,
          uploadDate: new Date().toISOString(),
        },
        rnFile
      );

      setDocuments((prev) => [newDoc, ...prev]);
      setNewDocTitle("");
      setNewDocDescription("");
      setSelectedFile(null);
      setUploadingDoc(false);
      Alert.alert("Éxito", "Documento subido");
    } catch (e) {
      Alert.alert("Error", "No se pudo subir el documento");
    } finally {
      setSaving(false);
    }
  };

  const deleteDocument = (docId: string) => {
    Alert.alert("Confirmar", "¿Eliminar este documento?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            setSaving(true);
            await apiService.documents.delete(docId);
            setDocuments((prev) => prev.filter((d) => d.id !== docId));
            Alert.alert("Éxito", "Documento eliminado");
          } catch {
            Alert.alert("Error", "No se pudo eliminar");
          } finally {
            setSaving(false);
          }
        },
      },
    ]);
  };

  const handleOpenDocument = async (docId: string) => {
    try {
      const { url } = await apiService.documents.getDownloadUrl(docId);
      const ok = await Linking.openURL(url);
      if (!ok) Alert.alert("Info", "No se pudo abrir el documento.");
    } catch {
      Alert.alert("Error", "No se pudo abrir el documento.");
    }
  };

  // ===== UI =====
  const TabButton = ({
    value,
    icon,
    label,
    count,
  }: {
    value: TabKey;
    icon: React.ReactNode;
    label: string;
    count?: number;
  }) => {
    const active = activeTab === value;
    return (
      <TouchableOpacity
        onPress={() => setActiveTab(value)}
        style={[
          styles.tabButton,
          active ? styles.tabButtonActive : styles.tabButtonInactive,
        ]}
      >
        <View style={styles.tabButtonRow}>
          {icon}
          <Text style={[styles.tabButtonText, active && { color: "white" }]}>
            {label}
            {typeof count === "number" ? ` (${count})` : ""}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <ArrowLeft color="#374151" size={18} />
          <Text style={styles.backBtnText}>Volver</Text>
        </TouchableOpacity>

        <View style={styles.headerPatient}>
          <View
            style={[
              styles.avatar,
              { backgroundColor: cancerColor.color + "40" },
            ]}
          >
            <Text style={styles.avatarText}>
              {patient.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.patientName}>{patient.name}</Text>
            <View style={styles.patientMeta}>
              <Text style={styles.patientMetaText}>{patient.age} años</Text>
              <Text style={styles.dot}>•</Text>
              <Text style={styles.patientMetaText}>RUT: {patient.rut}</Text>
            </View>
            <View style={styles.badgesRow}>
              <View
                style={[
                  styles.badgeSolid,
                  { backgroundColor: cancerColor.color },
                ]}
              >
                <Text style={styles.badgeSolidText}>{cancerColor.name}</Text>
              </View>
              <View style={styles.badgeOutline}>
                <Text style={styles.badgeOutlineText}>
                  {patient.diagnosis} — {patient.stage}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {patient.allergies.length > 0 && (
          <View style={styles.alertBox}>
            <AlertTriangle color="#DC2626" size={18} />
            <Text style={styles.alertText}>
              <Text style={{ fontWeight: "700" }}>ALERGIAS:</Text>{" "}
              {patient.allergies.join(", ")}
            </Text>
          </View>
        )}
      </View>

      {/* Tabs header */}
      <View style={styles.tabsHeader}>
        <TabButton
          value="general"
          icon={<ActivityIcon size={16} color={activeTab === "general" ? "white" : "#374151"} />}
          label="General"
        />
        <TabButton
          value="notes"
          icon={<StickyNote size={16} color={activeTab === "notes" ? "white" : "#374151"} />}
          label="Notas"
          count={notes.length}
        />
        <TabButton
          value="documents"
          icon={<FileText size={16} color={activeTab === "documents" ? "white" : "#374151"} />}
          label="Documentos"
          count={documents.length}
        />
        <TabButton
          value="team"
          icon={<UserIcon size={16} color={activeTab === "team" ? "white" : "#374151"} />}
          label="Equipo"
        />
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.content}>
        {/* GENERAL */}
        {activeTab === "general" && (
          <View style={{ gap: 16 }}>
            {/* Medicamentos */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleRow}>
                  <Pill color={cancerColor.color} size={18} />
                  <Text style={styles.cardTitle}>Medicamentos actuales</Text>
                </View>
                {canEdit("currentMedications") && !editingMeds && (
                  <TouchableOpacity onPress={startEditingMeds} style={styles.iconBtn}>
                    <Edit2 color="#374151" size={18} />
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.cardBody}>
                {editingMeds ? (
                  <View style={{ gap: 8 }}>
                    {tempMeds.map((med, idx) => (
                      <View key={idx} style={styles.row}>
                        <TextInput
                          value={med}
                          onChangeText={(v) => updateMed(idx, v)}
                          placeholder="Nombre del medicamento"
                          style={[styles.input, { flex: 1 }]}
                        />
                        <TouchableOpacity
                          onPress={() => removeMed(idx)}
                          style={styles.iconBtn}
                        >
                          <Trash2 color="#DC2626" size={18} />
                        </TouchableOpacity>
                      </View>
                    ))}
                    <TouchableOpacity onPress={addMed} style={styles.outlineBtn}>
                      <Plus size={16} color="#374151" />
                      <Text style={styles.outlineBtnText}>Agregar medicamento</Text>
                    </TouchableOpacity>
                    <View style={styles.actionsRow}>
                      <TouchableOpacity
                        onPress={saveMeds}
                        disabled={saving}
                        style={[styles.primaryBtn, { flex: 1 }]}
                      >
                        <Save color="white" size={16} />
                        <Text style={styles.primaryBtnText}>Guardar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={cancelEditingMeds}
                        style={styles.secondaryBtn}
                      >
                        <X color="#374151" size={16} />
                        <Text style={styles.secondaryBtnText}>Cancelar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : patient.currentMedications.length > 0 ? (
                  <View style={{ gap: 6 }}>
                    {patient.currentMedications.map((med, idx) => (
                      <View key={idx} style={styles.bulletItem}>
                        <View
                          style={[
                            styles.bulletDot,
                            { backgroundColor: cancerColor.color },
                          ]}
                        />
                        <Text style={styles.bodyText}>{med}</Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.mutedText}>Sin medicamentos registrados</Text>
                )}
              </View>
            </View>

            {/* Contactos emergencia */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleRow}>
                  <Phone color="#16A34A" size={18} />
                  <Text style={styles.cardTitle}>Contactos de emergencia</Text>
                </View>
                {canEdit("emergencyContacts") && !editingContacts && (
                  <TouchableOpacity onPress={startEditingContacts} style={styles.iconBtn}>
                    <Edit2 color="#374151" size={18} />
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.cardBody}>
                {editingContacts ? (
                  <View style={{ gap: 8 }}>
                    {tempContacts.map((c, idx) => (
                      <View key={idx} style={styles.editBlock}>
                        <View style={styles.rowBetween}>
                          <Text style={styles.smallLabel}>Contacto {idx + 1}</Text>
                          <TouchableOpacity
                            onPress={() => removeContact(idx)}
                            style={styles.iconBtn}
                          >
                            <Trash2 color="#DC2626" size={18} />
                          </TouchableOpacity>
                        </View>
                        <TextInput
                          value={c.name}
                          onChangeText={(v) => updateContact(idx, "name", v)}
                          placeholder="Nombre"
                          style={styles.input}
                        />
                        <TextInput
                          value={c.relationship}
                          onChangeText={(v) =>
                            updateContact(idx, "relationship", v)
                          }
                          placeholder="Relación (ej: Madre, Esposo)"
                          style={styles.input}
                        />
                        <TextInput
                          value={c.phone}
                          onChangeText={(v) => updateContact(idx, "phone", v)}
                          placeholder="Teléfono"
                          keyboardType="phone-pad"
                          style={styles.input}
                        />
                      </View>
                    ))}
                    <TouchableOpacity onPress={addContact} style={styles.outlineBtn}>
                      <Plus size={16} color="#374151" />
                      <Text style={styles.outlineBtnText}>Agregar contacto</Text>
                    </TouchableOpacity>
                    <View style={styles.actionsRow}>
                      <TouchableOpacity
                        onPress={saveContacts}
                        disabled={saving}
                        style={[styles.primaryBtn, { flex: 1 }]}
                      >
                        <Save color="white" size={16} />
                        <Text style={styles.primaryBtnText}>Guardar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={cancelEditingContacts}
                        style={styles.secondaryBtn}
                      >
                        <X color="#374151" size={16} />
                        <Text style={styles.secondaryBtnText}>Cancelar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <View style={{ gap: 8 }}>
                    {patient.emergencyContacts.map((c, idx) => (
                      <View key={idx} style={styles.contactRow}>
                        <View>
                          <Text style={styles.boldSmall}>{c.name}</Text>
                          <Text style={styles.mutedSmall}>{c.relationship}</Text>
                          <Text style={[styles.mutedSmall, { marginTop: 2 }]}>
                            {c.phone}
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => callEmergencyContact(c.phone)}
                          style={[styles.primaryBtn, { paddingHorizontal: 12 }]}
                        >
                          <Phone color="white" size={16} />
                          <Text style={styles.primaryBtnText}>Llamar</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                    {patient.emergencyContacts.length === 0 && (
                      <Text style={styles.mutedText}>Sin contactos registrados</Text>
                    )}
                  </View>
                )}
              </View>
            </View>

            {/* Alergias */}
            {(patient.allergies.length > 0 || canEdit("allergies")) && (
              <View style={[styles.card, { borderColor: "#FECACA", borderWidth: 1 }]}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleRow}>
                    <AlertTriangle color="#DC2626" size={18} />
                    <Text style={[styles.cardTitle, { color: "#DC2626" }]}>
                      Alergias
                    </Text>
                  </View>
                  {canEdit("allergies") && !editingAllergies && (
                    <TouchableOpacity
                      onPress={startEditingAllergies}
                      style={styles.iconBtn}
                    >
                      <Edit2 color="#374151" size={18} />
                    </TouchableOpacity>
                  )}
                </View>
                <View style={styles.cardBody}>
                  {editingAllergies ? (
                    <View style={{ gap: 8 }}>
                      {tempAllergies.map((al, idx) => (
                        <View key={idx} style={styles.row}>
                          <TextInput
                            value={al}
                            onChangeText={(v) => updateAllergy(idx, v)}
                            placeholder="Nombre de la alergia"
                            style={[styles.input, { flex: 1 }]}
                          />
                          <TouchableOpacity
                            onPress={() => removeAllergy(idx)}
                            style={styles.iconBtn}
                          >
                            <Trash2 color="#DC2626" size={18} />
                          </TouchableOpacity>
                        </View>
                      ))}
                      <TouchableOpacity onPress={addAllergy} style={styles.outlineBtn}>
                        <Plus size={16} color="#374151" />
                        <Text style={styles.outlineBtnText}>Agregar alergia</Text>
                      </TouchableOpacity>
                      <View style={styles.actionsRow}>
                        <TouchableOpacity
                          onPress={saveAllergies}
                          disabled={saving}
                          style={[styles.primaryBtn, { flex: 1 }]}
                        >
                          <Save color="white" size={16} />
                          <Text style={styles.primaryBtnText}>Guardar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={cancelEditingAllergies}
                          style={styles.secondaryBtn}
                        >
                          <X color="#374151" size={16} />
                          <Text style={styles.secondaryBtnText}>Cancelar</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : patient.allergies.length > 0 ? (
                    <View style={{ gap: 6 }}>
                      {patient.allergies.map((al, idx) => (
                        <Text
                          key={idx}
                          style={styles.allergyItem}
                        >
                          ⚠️ {al}
                        </Text>
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.mutedText}>Sin alergias registradas</Text>
                  )}
                </View>
              </View>
            )}

            {/* Operaciones */}
            {(patient.operations.length > 0 || canEdit("operations")) && (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleRow}>
                    <Scissors color={cancerColor.color} size={18} />
                    <Text style={styles.cardTitle}>Operaciones relevantes</Text>
                  </View>
                  {canEdit("operations") && !editingOperations && (
                    <TouchableOpacity
                      onPress={startEditingOperations}
                      style={styles.iconBtn}
                    >
                      <Edit2 color="#374151" size={18} />
                    </TouchableOpacity>
                  )}
                </View>
                <View style={styles.cardBody}>
                  {editingOperations ? (
                    <View style={{ gap: 8 }}>
                      {tempOperations.map((op, idx) => (
                        <View key={idx} style={styles.editBlock}>
                          <View style={styles.rowBetween}>
                            <Text style={styles.smallLabel}>Operación {idx + 1}</Text>
                            <TouchableOpacity
                              onPress={() => removeOperation(idx)}
                              style={styles.iconBtn}
                            >
                              <Trash2 color="#DC2626" size={18} />
                            </TouchableOpacity>
                          </View>
                          <TextInput
                            value={op.procedure}
                            onChangeText={(v) =>
                              updateOperation(idx, "procedure", v)
                            }
                            placeholder="Procedimiento"
                            style={styles.input}
                          />
                          <TextInput
                            value={op.date}
                            onChangeText={(v) => updateOperation(idx, "date", v)}
                            placeholder="Fecha (YYYY-MM-DD)"
                            style={styles.input}
                          />
                          <TextInput
                            value={op.hospital}
                            onChangeText={(v) =>
                              updateOperation(idx, "hospital", v)
                            }
                            placeholder="Hospital"
                            style={styles.input}
                          />
                        </View>
                      ))}
                      <TouchableOpacity onPress={addOperation} style={styles.outlineBtn}>
                        <Plus size={16} color="#374151" />
                        <Text style={styles.outlineBtnText}>Agregar operación</Text>
                      </TouchableOpacity>
                      <View style={styles.actionsRow}>
                        <TouchableOpacity
                          onPress={saveOperations}
                          disabled={saving}
                          style={[styles.primaryBtn, { flex: 1 }]}
                        >
                          <Save color="white" size={16} />
                          <Text style={styles.primaryBtnText}>Guardar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={cancelEditingOperations}
                          style={styles.secondaryBtn}
                        >
                          <X color="#374151" size={16} />
                          <Text style={styles.secondaryBtnText}>Cancelar</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : patient.operations.length > 0 ? (
                    <View style={{ gap: 8 }}>
                      {patient.operations.map((op, idx) => (
                        <View
                          key={idx}
                          style={[
                            styles.opItem,
                            { borderLeftColor: cancerColor.color },
                          ]}
                        >
                          <Text style={styles.boldSmall}>{op.procedure}</Text>
                          <Text style={styles.mutedSmall}>{formatDate(op.date)}</Text>
                          <Text style={styles.mutedSmall}>{op.hospital}</Text>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.mutedText}>Sin operaciones registradas</Text>
                  )}
                </View>
              </View>
            )}

            {/* Tratamiento */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleRow}>
                  <ActivityIcon color={cancerColor.color} size={18} />
                  <Text style={styles.cardTitle}>Estado del tratamiento</Text>
                </View>
                {canEdit("treatmentSummary") && !editingTreatment && (
                  <TouchableOpacity
                    onPress={startEditingTreatment}
                    style={styles.iconBtn}
                  >
                    <Edit2 color="#374151" size={18} />
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.cardBody}>
                {editingTreatment ? (
                  <View style={{ gap: 8 }}>
                    <TextInput
                      value={tempTreatment}
                      onChangeText={setTempTreatment}
                      placeholder="Resumen del tratamiento"
                      style={[styles.input, { height: 120, textAlignVertical: "top" }]}
                      multiline
                    />
                    <View style={styles.actionsRow}>
                      <TouchableOpacity
                        onPress={saveTreatment}
                        disabled={saving}
                        style={[styles.primaryBtn, { flex: 1 }]}
                      >
                        <Save color="white" size={16} />
                        <Text style={styles.primaryBtnText}>Guardar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={cancelEditingTreatment}
                        style={styles.secondaryBtn}
                      >
                        <X color="#374151" size={16} />
                        <Text style={styles.secondaryBtnText}>Cancelar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <>
                    <Text style={styles.bodyText}>{patient.treatmentSummary}</Text>
                    <View
                      style={[
                        styles.highlightBox,
                        { backgroundColor: cancerColor.color + "20" },
                      ]}
                    >
                      <Text style={styles.smallLabel}>
                        Diagnóstico: {patient.diagnosis} • {patient.stage}
                      </Text>
                    </View>
                  </>
                )}
              </View>
            </View>

            {/* Info de ficha */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleRow}>
                  <Calendar color={cancerColor.color} size={18} />
                  <Text style={styles.cardTitle}>Información de Ficha</Text>
                </View>
              </View>
              <View style={styles.cardBody}>
                <View style={styles.infoBox}>
                  <Text style={styles.smallLabel}>ID de Ficha Médica</Text>
                  <Text style={styles.monoText}>{patient.qrCode}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* NOTAS */}
        {activeTab === "notes" && (
          <View style={{ gap: 12 }}>
            {canCreateNote() && (
              <View style={[styles.card, { backgroundColor: "#EFF6FF", borderColor: "#BFDBFE", borderWidth: 1 }]}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleRow}>
                    <Plus color="#374151" size={18} />
                    <Text style={styles.cardTitle}>Agregar nueva nota</Text>
                  </View>
                </View>
                <View style={styles.cardBody}>
                  {creatingNote ? (
                    <View style={{ gap: 8 }}>
                      <TextInput
                        value={newNoteContent}
                        onChangeText={setNewNoteContent}
                        placeholder="Escribe aquí la nota médica..."
                        style={[styles.input, { height: 140, textAlignVertical: "top", backgroundColor: "white" }]}
                        multiline
                      />
                      <View style={styles.actionsRow}>
                        <TouchableOpacity
                          onPress={createNote}
                          disabled={saving}
                          style={[styles.primaryBtn, { flex: 1 }]}
                        >
                          <Save color="white" size={16} />
                          <Text style={styles.primaryBtnText}>Guardar Nota</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => {
                            setCreatingNote(false);
                            setNewNoteContent("");
                          }}
                          style={styles.secondaryBtn}
                        >
                          <X color="#374151" size={16} />
                          <Text style={styles.secondaryBtnText}>Cancelar</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <TouchableOpacity
                      onPress={() => setCreatingNote(true)}
                      style={[styles.primaryBtn, { backgroundColor: "#3B82F6" }]}
                    >
                      <Plus color="white" size={16} />
                      <Text style={styles.primaryBtnText}>Nueva Nota</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

            {loadingNotes ? (
              <View style={[styles.card, { alignItems: "center", paddingVertical: 24 }]}>
                <ActivityIndicator />
                <Text style={{ marginTop: 8, color: "#6B7280" }}>Cargando notas...</Text>
              </View>
            ) : notes.length === 0 ? (
              <View style={[styles.card, { alignItems: "center", paddingVertical: 24 }]}>
                <StickyNote size={48} color="#D1D5DB" />
                <Text style={{ marginTop: 8, color: "#6B7280" }}>
                  No hay notas médicas registradas
                </Text>
              </View>
            ) : (
              notes.map((note) => {
                const allowEdit = canEditNote(note);
                const allowDelete = canDeleteNote(note);

                return (
                  <View key={note.id} style={styles.card}>
                    <View style={styles.cardHeader}>
                      <View>
                        <Text style={styles.boldSmall}>{note.authorName}</Text>
                        <Text style={styles.mutedSmall}>
                          {formatDate(note.createdAt ?? note.date ?? new Date().toISOString())}
                        </Text>
                      </View>
                      <View style={styles.row}>
                        <View style={styles.badgeOutline}>
                          <View style={{ marginRight: 4 }}>
                            <StickyNote size={12} color="#374151" />
                          </View>
                          <Text style={styles.badgeOutlineText}>Nota Médica</Text>
                        </View>
                        {allowEdit && editingNoteId !== note.id && (
                          <TouchableOpacity
                            onPress={() => startEditingNote(note)}
                            style={styles.iconBtn}
                          >
                            <Edit2 color="#374151" size={18} />
                          </TouchableOpacity>
                        )}
                        {allowDelete && (
                          <TouchableOpacity
                            onPress={() => deleteNote(note.id)}
                            style={styles.iconBtn}
                          >
                            <Trash2 color="#DC2626" size={18} />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                    <View style={styles.cardBody}>
                      {editingNoteId === note.id ? (
                        <View style={{ gap: 8 }}>
                          <TextInput
                            value={editingNoteContent}
                            onChangeText={setEditingNoteContent}
                            style={[styles.input, { height: 120, textAlignVertical: "top" }]}
                            multiline
                          />
                          <View style={styles.actionsRow}>
                            <TouchableOpacity
                              onPress={() => saveEditedNote(note.id)}
                              disabled={saving}
                              style={[styles.primaryBtn, { flex: 1 }]}
                            >
                              <Save color="white" size={16} />
                              <Text style={styles.primaryBtnText}>Guardar cambios</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={cancelEditingNote}
                              style={styles.secondaryBtn}
                            >
                              <X color="#374151" size={16} />
                              <Text style={styles.secondaryBtnText}>Cancelar</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      ) : (
                        <Text style={styles.bodyText}>{note.content}</Text>
                      )}
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* DOCUMENTOS */}
        {activeTab === "documents" && (
          <View style={{ gap: 12 }}>
            {canUploadDocument() && (
              <View style={[styles.card, { backgroundColor: "#ECFDF5", borderColor: "#BBF7D0", borderWidth: 1 }]}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleRow}>
                    <Plus color="#374151" size={18} />
                    <Text style={styles.cardTitle}>Subir nuevo documento</Text>
                  </View>
                </View>
                <View style={styles.cardBody}>
                  {uploadingDoc ? (
                    <View style={{ gap: 8 }}>
                      <TextInput
                        value={newDocTitle}
                        onChangeText={setNewDocTitle}
                        placeholder="Título del documento"
                        style={[styles.input, { backgroundColor: "white" }]}
                      />
                      <View style={styles.selectRow}>
                        <Text style={styles.smallLabel}>Tipo</Text>
                        {/* Selector simple por ahora (puedes reemplazar por Picker si quieres) */}
                        <View style={styles.tagRow}>
                          {[
                            "examen",
                            "cirugia",
                            "quimioterapia",
                            "radioterapia",
                            "receta",
                            "informe_medico",
                            "consentimiento",
                            "otro",
                          ].map((t) => (
                            <TouchableOpacity
                              key={t}
                              onPress={() => setNewDocType(t)}
                              style={[
                                styles.tag,
                                {
                                  backgroundColor:
                                    newDocType === t ? "#111827" : "#E5E7EB",
                                },
                              ]}
                            >
                              <Text
                                style={{
                                  color: newDocType === t ? "white" : "#111827",
                                  fontSize: 12,
                                  fontWeight: "600",
                                }}
                              >
                                {t}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>

                      <TouchableOpacity onPress={pickFile} style={styles.outlineBtn}>
                        <Plus size={16} color="#374151" />
                        <Text style={styles.outlineBtnText}>
                          {selectedFile
                            ? `Archivo: ${selectedFile.name}`
                            : "Seleccionar archivo"}
                        </Text>
                      </TouchableOpacity>
                      {selectedFile?.size ? (
                        <Text style={styles.mutedSmall}>
                          Tamaño: {(selectedFile.size / 1024).toFixed(1)} KB
                        </Text>
                      ) : null}

                      <TextInput
                        value={newDocDescription}
                        onChangeText={setNewDocDescription}
                        placeholder="Descripción (opcional)"
                        style={[styles.input, { height: 90, textAlignVertical: "top", backgroundColor: "white" }]}
                        multiline
                      />

                      <View style={styles.actionsRow}>
                        <TouchableOpacity
                          onPress={uploadDocument}
                          disabled={saving || !selectedFile}
                          style={[styles.primaryBtn, { flex: 1 }]}
                        >
                          <Save color="white" size={16} />
                          <Text style={styles.primaryBtnText}>
                            {saving ? "Subiendo..." : "Guardar documento"}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => {
                            setUploadingDoc(false);
                            setNewDocTitle("");
                            setNewDocDescription("");
                            setSelectedFile(null);
                          }}
                          style={styles.secondaryBtn}
                        >
                          <X color="#374151" size={16} />
                          <Text style={styles.secondaryBtnText}>Cancelar</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <TouchableOpacity
                      onPress={() => setUploadingDoc(true)}
                      style={[styles.primaryBtn, { backgroundColor: "#10B981" }]}
                    >
                      <Plus color="white" size={16} />
                      <Text style={styles.primaryBtnText}>Subir documento</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

            {loadingDocuments ? (
              <View style={[styles.card, { alignItems: "center", paddingVertical: 24 }]}>
                <ActivityIndicator />
                <Text style={{ marginTop: 8, color: "#6B7280" }}>
                  Cargando documentos...
                </Text>
              </View>
            ) : documents.length === 0 ? (
              <View style={[styles.card, { alignItems: "center", paddingVertical: 24 }]}>
                <FileText size={48} color="#D1D5DB" />
                <Text style={{ marginTop: 8, color: "#6B7280" }}>
                  No hay documentos registrados
                </Text>
              </View>
            ) : (
              <View style={{ gap: 12 }}>
                {documents.map((doc) => (
                  <View key={doc.id} style={styles.card}>
                    <View style={styles.cardHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.boldSmall}>{doc.title}</Text>
                        <Text style={styles.mutedSmall}>
                          {formatDate(doc.uploadDate)}
                        </Text>
                        {doc.description ? (
                          <Text style={[styles.mutedSmall, { marginTop: 4 }]}>
                            {doc.description}
                          </Text>
                        ) : null}
                      </View>
                      <View
                        style={[
                          styles.badgeSolid,
                          { backgroundColor: getDocumentBadgeColor(doc.type) },
                        ]}
                      >
                        <Text style={styles.badgeSolidText}>{doc.type}</Text>
                      </View>
                    </View>
                    <View style={styles.cardBody}>
                      <TouchableOpacity
                        onPress={() => handleOpenDocument(doc.id)}
                        style={styles.outlineBtn}
                      >
                        <FileText size={16} color="#374151" />
                        <Text style={styles.outlineBtnText}>Ver documento</Text>
                      </TouchableOpacity>
                      {canDeleteDocument(doc) && (
                        <TouchableOpacity
                          onPress={() => deleteDocument(doc.id)}
                          style={[
                            styles.outlineBtn,
                            { borderColor: "#FECACA", backgroundColor: "#FEF2F2" },
                          ]}
                        >
                          <Trash2 size={16} color="#DC2626" />
                          <Text style={[styles.outlineBtnText, { color: "#DC2626" }]}>
                            Eliminar
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* EQUIPO */}
        {activeTab === "team" && (
          <View style={{ gap: 12 }}>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleRow}>
                  <UserIcon color={cancerColor.color} size={18} />
                  <Text style={styles.cardTitle}>Equipo de Cuidados</Text>
                </View>
              </View>
              <View style={styles.cardBody}>
                <View style={{ gap: 8, marginBottom: 16 }}>
                  {patient.careTeam.map((member, idx) => (
                    <View key={idx} style={styles.memberRow}>
                      <View
                        style={[
                          styles.memberAvatar,
                          { backgroundColor: cancerColor.color },
                        ]}
                      >
                        <Text style={styles.memberAvatarText}>
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.boldSmall}>{member.name}</Text>
                        <Text style={styles.mutedSmall}>
                          {getRoleName(member.role)}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.badgeOutline,
                          member.status === "active" && {
                            borderColor: "#10B981",
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.badgeOutlineText,
                            member.status === "active" && { color: "#10B981" },
                          ]}
                        >
                          {member.status === "active" ? "Activo" : "Inactivo"}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>

                {isStaff && (
                  <ManageCareTeam
                    patient={patient}
                    onUpdate={async () => {
                      // refrescar ficha después de cambios
                      try {
                        const refreshed = await apiService.patients.getOne(patient.id);
                        setPatient(refreshed);
                      } catch {
                        // noop
                      }
                    }}
                  />
                )}
              </View>
            </View>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>

      {saving && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="white" />
          <Text style={styles.loadingText}>Guardando...</Text>
        </View>
      )}
    </View>
  );
}

// ======== STYLES ========
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F9FAFB" },
  header: {
    backgroundColor: "white",
    borderBottomColor: "#E5E7EB",
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 4 },
  backBtnText: { color: "#374151", fontSize: 14 },
  headerPatient: { flexDirection: "row", gap: 12, paddingVertical: 8, alignItems: "center" },
  avatar: {
    width: 64, height: 64, borderRadius: 32,
    alignItems: "center", justifyContent: "center",
  },
  avatarText: { color: "#111827", fontSize: 18, fontWeight: "700" },
  patientName: { fontSize: 18, fontWeight: "700", color: "#111827" },
  patientMeta: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 2 },
  patientMetaText: { color: "#6B7280", fontSize: 12 },
  dot: { color: "#9CA3AF", fontSize: 12 },
  badgesRow: { flexDirection: "row", gap: 8, marginTop: 8, flexWrap: "wrap" },
  badgeSolid: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  badgeSolidText: { color: "white", fontWeight: "600", fontSize: 12 },
  badgeOutline: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999,
    borderColor: "#E5E7EB", borderWidth: 1, flexDirection: "row", alignItems: "center",
  },
  badgeOutlineText: { color: "#374151", fontWeight: "600", fontSize: 12 },

  alertBox: {
    backgroundColor: "#FEE2E2",
    borderColor: "#FCA5A5",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
    marginBottom: 8,
  },
  alertText: { color: "#991B1B", fontSize: 13 },

  tabsHeader: {
    flexDirection: "row",
    padding: 8,
    backgroundColor: "white",
    borderBottomColor: "#E5E7EB",
    borderBottomWidth: 1,
    gap: 8,
  },
  tabButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 10,
  },
  tabButtonActive: { backgroundColor: "#111827" },
  tabButtonInactive: { backgroundColor: "#F3F4F6" },
  tabButtonRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  tabButtonText: { color: "#374151", fontWeight: "600", fontSize: 12 },

  content: { padding: 16, gap: 12 },

  card: {
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
  cardBody: { gap: 8 },

  iconBtn: { padding: 8, borderRadius: 8, backgroundColor: "#F3F4F6" },

  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    backgroundColor: "#F9FAFB",
    color: "#111827",
  },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },

  outlineBtn: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "white",
  },
  outlineBtnText: { color: "#111827", fontWeight: "600" },

  primaryBtn: {
    backgroundColor: "#111827",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  primaryBtnText: { color: "white", fontWeight: "700" },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 12,
  },
  secondaryBtnText: {
    color: "#374151",        // gris oscuro
    fontWeight: "500",
    marginLeft: 6,
  },
  actionsRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 },

  bulletItem: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  bulletDot: { width: 6, height: 6, borderRadius: 3, marginTop: 6 },

  bodyText: { color: "#374151", fontSize: 14 },
  mutedText: { color: "#6B7280", fontSize: 14 },
  smallLabel: { color: "#6B7280", fontSize: 12, fontWeight: "600" },
  mutedSmall: { color: "#6B7280", fontSize: 12 },
  boldSmall: { color: "#111827", fontSize: 13, fontWeight: "600" },

  editBlock: { borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 8, padding: 10, gap: 8 },

  allergyItem: {
    backgroundColor: "#FEE2E2",
    color: "#991B1B",
    padding: 10,
    borderRadius: 8,
    fontWeight: "600",
    fontSize: 13,
  },

  opItem: {
    borderLeftWidth: 4,
    paddingLeft: 8,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: "#F9FAFB",
  },

  highlightBox: { padding: 10, borderRadius: 8, marginTop: 8 },

  infoBox: { backgroundColor: "#F3F4F6", padding: 12, borderRadius: 8 },
  monoText: { fontFamily: "Courier", fontSize: 16 },

  selectRow: { gap: 6 },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: { borderRadius: 9999, paddingHorizontal: 10, paddingVertical: 6 },

  memberRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "#F9FAFB", padding: 10, borderRadius: 10,
  },
  memberAvatar: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: "center", justifyContent: "center",
  },
  memberAvatarText: { color: "white", fontWeight: "700" },

  contactRow: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F9FAFB",
    padding: 10, borderRadius: 10,
  },

  loadingOverlay: {
    position: "absolute", left: 0, right: 0, bottom: 0, top: 0,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center", justifyContent: "center",
    gap: 8,
  },
  loadingText: { color: "white", fontWeight: "600" },
});
