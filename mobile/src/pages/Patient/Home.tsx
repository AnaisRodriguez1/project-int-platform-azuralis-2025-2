import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Image, TouchableOpacity, ScrollView, StyleSheet, Alert,} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import CompleteProfileForm from '../../components/CompleteProfileForm';
import { cancerColors } from '../../types/medical';
import { useNavigation } from '@react-navigation/native';

export default function HomePatient() {
  const { user } = useAuth();
  const navigation = useNavigation<any>();

  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState<any | null>(null);

  // --- Cargar datos del paciente (local o del backend más adelante)
  const fetchPatientData = async () => {
    try {
      setLoading(true);
      const savedData = await AsyncStorage.getItem(`patientProfile_${user?.id}`);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        setPatient(parsed);
      } else {
        setPatient(null);
      }
    } catch (err) {
      console.error('Error al cargar perfil:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientData();
  }, []);

  // --- Callback para cuando se completa el formulario
  const handleProfileComplete = async () => {
    await fetchPatientData();
    Alert.alert('Perfil completado', 'Tu ficha médica fue registrada correctamente.');
  };

  // --- Pantalla de carga
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#fa8fb5" />
      </View>
    );
  }

// --- Si no hay perfil, mostrar formulario
if (!patient) {
  return (
    <View style={{ flex: 1 }}>
      <CompleteProfileForm onComplete={handleProfileComplete} />
    </View>
  );
}

// --- Obtener color del tipo de cáncer
const cancerColor =
  patient && patient.cancerType && cancerColors?.[patient.cancerType as keyof typeof cancerColors]
    ? cancerColors[patient.cancerType as keyof typeof cancerColors].color
    : '#999';


  // --- Render principal si ya tiene perfil
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={[styles.title, { color: cancerColor }]}>🏥 Mi Ficha Médica</Text>
        <Text style={styles.subtitle}>Bienvenido/a, {patient.name}</Text>

        <View style={styles.qrContainer}>
          <View style={styles.qrPlaceholder}>
            <Text style={{ color: '#777' }}>QR próximamente</Text>
          </View>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: cancerColor }]}
            onPress={() => Alert.alert('QR', 'Funcionalidad de QR aún en desarrollo')}
          >
            <Text style={styles.buttonText}>Compartir / Guardar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Resumen 
       EN LA LINEA 97 ARREGLAMOS ESO, ESTAR PENDIENTE AL MOMENTO DE CONECTAR PARA VER SI NOS TIRA ERROR*/}
      <View style={styles.card}>
        <Text style={[styles.sectionTitle, { color: cancerColor }]}>
          {patient.diagnosis} - {patient.stage}
        </Text>
        <Text style={styles.detail}>RUT: {patient.rut}</Text>
        <Text style={styles.detail}>Edad: {patient.age} años</Text>
        <Text style={styles.detail}> Tipo: {cancerColors[patient?.cancerType as keyof typeof cancerColors]?.name || 'No especificado'}</Text> 
        <View style={styles.summaryBox}>
          <Text style={styles.summaryText}>
            {patient.treatmentSummary || 'Sin resumen de tratamiento registrado'}
          </Text>
        </View>
      </View>

      {/* Acciones rápidas */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: `${cancerColor}22` }]}
          onPress={() => navigation.navigate('Notes')}
        >
          <Text style={[styles.actionTitle, { color: cancerColor }]}>🗒 Mis Notas</Text>
          <Text style={styles.actionText}>Registra tus síntomas y observaciones</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: `${cancerColor}22` }]}
          onPress={() => navigation.navigate('Documents')}
        >
          <Text style={[styles.actionTitle, { color: cancerColor }]}>📂 Mis Documentos</Text>
          <Text style={styles.actionText}>Guarda recetas y resultados médicos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: `${cancerColor}22` }]}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={[styles.actionTitle, { color: cancerColor }]}>⚙️ Mi Perfil</Text>
          <Text style={styles.actionText}>Configuración y datos personales</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// --- ESTILOS
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f8faff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    marginBottom: 20,
  },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 5 },
  subtitle: { color: '#555', marginBottom: 10 },
  qrContainer: { alignItems: 'center', marginVertical: 10 },
  qrPlaceholder: {
    width: 180,
    height: 180,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 10 },
  detail: { color: '#444', marginBottom: 4 },
  summaryBox: {
    backgroundColor: '#f3f3f3',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  summaryText: { color: '#555', fontSize: 14 },
  actionsContainer: {
    marginTop: 10,
    flexDirection: 'column',
    gap: 12,
  },
  actionCard: {
    borderRadius: 12,
    padding: 16,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  actionText: {
    fontSize: 13,
    color: '#555',
    marginTop: 4,
  },
});
