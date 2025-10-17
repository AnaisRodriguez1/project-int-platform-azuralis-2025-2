import React, { useState } from 'react';
import {View,Text,TextInput,TouchableOpacity,StyleSheet, Alert,ScrollView,} from 'react-native';
import { Picker } from '@react-native-picker/picker'; 
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

export default function RegisterScreen() {
  const { register } = useAuth();
  const navigation = useNavigation<any>();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'patient' | 'doctor' | 'nurse' | 'guardian'>('patient');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Por favor completa todos los campos.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden.');
      return;
    }

    try {
      setLoading(true);
      const userData = { name, email, password, role };

      // 1️⃣ Registrar usuario
      await register(userData);

      // 3️⃣ Redirigir al dashboard según el rol elegido
      switch (role) {
        case 'doctor':
          navigation.navigate('DashboardDoctor');
          break;
        case 'patient':
          navigation.navigate('DashboardPatient');
          break;
        case 'guardian':
          navigation.navigate('DashboardGuardian');
          break;
        case 'nurse':
          navigation.navigate('DashboardNurse');
          break;
        default:
          navigation.navigate('Login');
      }

      Alert.alert('Registro exitoso', `Bienvenido/a ${name}!`);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Hubo un problema al registrar.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Crear cuenta</Text>

        <TextInput
          style={styles.input}
          placeholder="Nombre completo"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Correo electrónico"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TextInput
          style={styles.input}
          placeholder="Confirmar contraseña"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        {/* 👇 Nuevo selector de rol */}
        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>Selecciona tu rol:</Text>
          <Picker
            selectedValue={role}
            onValueChange={(value) =>
              setRole(value as 'patient' | 'doctor' | 'nurse' | 'guardian')
            }
            style={styles.picker}
          >
            <Picker.Item label="Paciente" value="patient" />
            <Picker.Item label="Doctor/a" value="doctor" />
            <Picker.Item label="Enfermera/o" value="nurse" />
            <Picker.Item label="Guardián" value="guardian" />
          </Picker>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && { backgroundColor: '#aaa' }]}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Registrando...' : 'Registrarse'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.link}>¿Ya tienes cuenta? Inicia sesión</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f9fafb',
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 25,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 25,
    color: '#111827',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  pickerContainer: {
    marginBottom: 15,
  },
  pickerLabel: {
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#374151',
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  button: {
    backgroundColor: '#fa8fb5',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  link: {
    textAlign: 'center',
    color: '#fa8fb5',
    marginTop: 15,
    fontWeight: '500',
  },
});
