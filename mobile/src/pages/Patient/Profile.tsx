import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert,} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import { cancerColors } from '../../types/medical';
import { useNavigation } from '@react-navigation/native';

export default function ProfilePatient() {
  const { user, logout } = useAuth();
  const navigation = useNavigation<any>();
  const [patient, setPatient] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || '');
  const [editedEmail, setEditedEmail] = useState(user?.email || '');

  // Cargar datos del perfil del paciente desde AsyncStorage
  useEffect(() => {
    const loadPatientData = async () => {
      try {
        const data = await AsyncStorage.getItem(`patientProfile_${user?.id}`);
        if (data) setPatient(JSON.parse(data));
      } catch (error) {
        console.error('Error cargando perfil del paciente:', error);
      }
    };
    loadPatientData();
  }, []);

  const cancerColor =
  patient?.cancerType && cancerColors[patient.cancerType as keyof typeof cancerColors]
    ? cancerColors[patient.cancerType as keyof typeof cancerColors].color
    : '#fa8fb5';

  const cancerName =
  patient?.cancerType && cancerColors[patient.cancerType as keyof typeof cancerColors]
    ? cancerColors[patient.cancerType as keyof typeof cancerColors].name
    : 'No especificado';

  const handleSave = async () => {
    try {
      const updatedPatient = {
        ...patient,
        name: editedName,
        email: editedEmail,
      };
      await AsyncStorage.setItem(
        `patientProfile_${user?.id}`,
        JSON.stringify(updatedPatient)
      );
      setPatient(updatedPatient);
      setIsEditing(false);
      Alert.alert('Perfil actualizado', 'Los cambios se guardaron correctamente.');
    } catch (error) {
      Alert.alert('Error', 'No se pudieron guardar los cambios.');
    }
  };

  const handleLogout = () => {
    Alert.alert('Cerrar sesión', '¿Seguro que quieres cerrar sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sí, salir',
        style: 'destructive',
        onPress: () => {
          logout();
          navigation.navigate('Login');
        },
      },
    ]);
  };

  if (!patient) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: '#666' }}>No se encontró información del paciente.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Encabezado */}
      <Text style={styles.title}>Mi Perfil</Text>
      <Text style={styles.subtitle}>Configuración y datos personales</Text>

      {/* Datos personales */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: cancerColor }]}>Datos Personales</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={isEditing ? handleSave : () => setIsEditing(true)}
          >
            <Text style={styles.editButtonText}>
              {isEditing ? 'Guardar' : 'Editar'}
            </Text>
          </TouchableOpacity>
        </View>

        {isEditing ? (
          <>
            <TextInput
              style={styles.input}
              placeholder="Nombre completo"
              value={editedName}
              onChangeText={setEditedName}
            />
            <TextInput
              style={styles.input}
              placeholder="Correo electrónico"
              value={editedEmail}
              onChangeText={setEditedEmail}
            />
          </>
        ) : (
          <>
            <Text style={styles.label}>Nombre completo</Text>
            <Text style={styles.value}>{patient.name}</Text>

            <Text style={styles.label}>Edad</Text>
            <Text style={styles.value}>{patient.age} años</Text>

            <Text style={styles.label}>RUT</Text>
            <Text style={styles.value}>{patient.rut}</Text>

            <Text style={styles.label}>Correo</Text>
            <Text style={styles.value}>{user?.email}</Text>
          </>
        )}
      </View>

      {/* Información médica */}
      <View style={styles.card}>
        <Text style={[styles.cardTitle, { color: cancerColor }]}>Información Médica</Text>

        <Text style={styles.label}>Diagnóstico</Text>
        <Text style={styles.value}>{patient.diagnosis}</Text>

        <Text style={styles.label}>Etapa</Text>
        <Text style={styles.value}>{patient.stage}</Text>

        <Text style={styles.label}>Tipo de cáncer</Text>
        <Text style={styles.value}>{cancerName}</Text>

        <Text style={styles.label}>Resumen del tratamiento</Text>
        <Text style={styles.value}>{patient.treatmentSummary}</Text>
      </View>

      {/* Alergias */}
      {patient.allergies?.length > 0 && (
        <View style={styles.card}>
          <Text style={[styles.cardTitle, { color: '#e74c3c' }]}>Alergias</Text>
          {patient.allergies.map((a: string, i: number) => (
            <Text key={i} style={styles.value}>
              • {a}
            </Text>
          ))}
        </View>
      )}

      {/* Medicamentos */}
      <View style={styles.card}>
        <Text style={[styles.cardTitle, { color: cancerColor }]}>
          Medicamentos Actuales
        </Text>
        {patient.currentMedications?.length > 0 ? (
          patient.currentMedications.map((m: string, i: number) => (
            <Text key={i} style={styles.value}>
              • {m}
            </Text>
          ))
        ) : (
          <Text style={styles.value}>Sin medicamentos registrados</Text>
        )}
      </View>

      {/* Contacto de emergencia */}
      <View style={styles.card}>
        <Text style={[styles.cardTitle, { color: cancerColor }]}>
          Contacto de Emergencia
        </Text>
        {patient.emergencyContact?.name ? (
          <>
            <Text style={styles.label}>Nombre</Text>
            <Text style={styles.value}>{patient.emergencyContact.name}</Text>

            <Text style={styles.label}>Relación</Text>
            <Text style={styles.value}>{patient.emergencyContact.relationship}</Text>

            <Text style={styles.label}>Teléfono</Text>
            <Text style={styles.value}>{patient.emergencyContact.phone}</Text>
          </>
        ) : (
          <Text style={styles.value}>No hay contacto de emergencia registrado</Text>
        )}
      </View>

      {/* Cerrar sesión */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', padding: 20 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#111', marginBottom: 4 },
  subtitle: { color: '#666', marginBottom: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: 'bold' },
  label: { color: '#666', fontSize: 13, marginTop: 6 },
  value: { fontSize: 15, color: '#333', fontWeight: '500' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginTop: 6,
    fontSize: 15,
  },
  editButton: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8, backgroundColor: '#fa8fb5' },
  editButtonText: { color: '#fff', fontWeight: '600' },
  logoutButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#fa8fb5',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  logoutButtonText: { color: '#fa8fb5', fontWeight: '600', fontSize: 15 },
});
