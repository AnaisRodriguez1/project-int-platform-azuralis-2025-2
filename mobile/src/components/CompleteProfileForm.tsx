import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert,} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { cancerColors } from '../types/medical';
import { useNavigation } from '@react-navigation/native';

// SE AGREGO ESTAS LINEAS 10-12 VER SI AL MOMENTO DE CONECTAR CON EL BACK NO INTERFIEREN 
interface CompleteProfileFormMobileProps {
  onComplete?: () => void;
}

/*
al CompleteProfilefomr(){ -> asi era antes se le agrego lo que se ve en la linea 18 estar pendiente para que al momento de 
conectar con el back no nos tire error
 */
export default function CompleteProfileForm ({ onComplete }: CompleteProfileFormMobileProps) {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    age: '',
    diagnosis: '',
    stage: '',
    cancerType: '',
    allergies: '',
    currentMedications: '',
    treatmentSummary: '',
    emergencyContactName: '',
    emergencyContactRelationship: '',
    emergencyContactPhone: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    if (!formData.age || !formData.diagnosis || !formData.stage || !formData.cancerType) {
      Alert.alert('Error', 'Por favor completa los campos obligatorios del paso 1.');
      return;
    }

    try {
      setLoading(true);

      const patientProfile = {
        name: user?.name || '',
        rut: (user as any)?.rut || '',
        age: parseInt(formData.age) || 0,
        diagnosis: formData.diagnosis,
        stage: formData.stage,
        cancerType: formData.cancerType,
        allergies: formData.allergies.split(',').map(a => a.trim()).filter(a => a),
        currentMedications: formData.currentMedications.split(',').map(m => m.trim()).filter(m => m),
        treatmentSummary: formData.treatmentSummary,
        emergencyContact: {
          name: formData.emergencyContactName,
          relationship: formData.emergencyContactRelationship,
          phone: formData.emergencyContactPhone,
        },
      };

      // 🧠 Guardar localmente (más adelante se mandará al backend)
      await AsyncStorage.setItem(`patientProfile_${user?.id}`, JSON.stringify(patientProfile));
      
      if (onComplete) onComplete(); // LINEA AGREGADA TAMBIEN ANTES NO ESTABA, VER QUE NO MOLESTA AL MOMENTO DE HACER CONEXION CON BACKEND

      Alert.alert('Perfil guardado', 'Tu información médica fue registrada correctamente.');

      navigation.navigate('DashboardPatient');
    } catch (err: any) {
      Alert.alert('Error', 'No se pudo guardar el perfil. Intenta nuevamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ---------- RENDER DE PASOS ----------
  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Paso 1: Información Básica</Text>

      <TextInput
        style={styles.input}
        placeholder="Edad"
        keyboardType="numeric"
        value={formData.age}
        onChangeText={v => handleChange('age', v)}
      />

      <TextInput
        style={styles.input}
        placeholder="Diagnóstico (Ej: Cáncer de Mama)"
        value={formData.diagnosis}
        onChangeText={v => handleChange('diagnosis', v)}
      />

      <TextInput
        style={styles.input}
        placeholder="Etapa/Estadio (Ej: Etapa II)"
        value={formData.stage}
        onChangeText={v => handleChange('stage', v)}
      />

      <Text style={styles.label}>Tipo de Cáncer</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={formData.cancerType}
          onValueChange={v => handleChange('cancerType', v)}
        >
          <Picker.Item label="Selecciona tipo de cáncer" value="" />
          {Object.entries(cancerColors).map(([type, config]) => (
            <Picker.Item
              key={type}
              label={config.name}
              value={type}
              color={config.color}
            />
          ))}
        </Picker>
      </View>

      <TouchableOpacity style={styles.nextButton} onPress={() => setStep(2)}>
        <Text style={styles.buttonText}>Siguiente</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Paso 2: Tratamiento y Medicación</Text>

      <TextInput
        style={styles.input}
        placeholder="Alergias (separa por comas)"
        value={formData.allergies}
        onChangeText={v => handleChange('allergies', v)}
      />

      <TextInput
        style={[styles.input, { height: 80 }]}
        placeholder="Medicamentos actuales (separa por comas)"
        value={formData.currentMedications}
        onChangeText={v => handleChange('currentMedications', v)}
        multiline
      />

      <TextInput
        style={[styles.input, { height: 100 }]}
        placeholder="Resumen del tratamiento actual..."
        value={formData.treatmentSummary}
        onChangeText={v => handleChange('treatmentSummary', v)}
        multiline
      />

      <View style={styles.navButtons}>
        <TouchableOpacity style={styles.backButton} onPress={() => setStep(1)}>
          <Text style={styles.buttonText}>Atrás</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.nextButton} onPress={() => setStep(3)}>
          <Text style={styles.buttonText}>Siguiente</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Paso 3: Contacto de Emergencia</Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre del contacto"
        value={formData.emergencyContactName}
        onChangeText={v => handleChange('emergencyContactName', v)}
      />

      <TextInput
        style={styles.input}
        placeholder="Relación (Ej: Hermana, Esposo/a)"
        value={formData.emergencyContactRelationship}
        onChangeText={v => handleChange('emergencyContactRelationship', v)}
      />

      <TextInput
        style={styles.input}
        placeholder="Teléfono (+56 9 xxxx xxxx)"
        keyboardType="phone-pad"
        value={formData.emergencyContactPhone}
        onChangeText={v => handleChange('emergencyContactPhone', v)}
      />

      <View style={styles.navButtons}>
        <TouchableOpacity style={styles.backButton} onPress={() => setStep(2)}>
          <Text style={styles.buttonText}>Atrás</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSaveProfile}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Guardando...' : 'Completar Perfil'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f8faff',
    justifyContent: 'center',
  },
  stepContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  label: { fontWeight: '600', marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
  },
  navButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nextButton: {
    backgroundColor: '#fa8fb5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    backgroundColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
