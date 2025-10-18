import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView,} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

// Función para dar formato básico al RUT
const formatRUT = (rut: string) => {
  let clean = rut.replace(/\D/g, ''); // elimina todo excepto dígitos
  if (clean.length <= 1) return clean;
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  let formatted = '';
  for (let i = body.length - 1, j = 1; i >= 0; i--, j++) {
    formatted = body.charAt(i) + formatted;
    if (j % 3 === 0 && i !== 0) formatted = '.' + formatted;
  }
  return `${formatted}-${dv}`;
};

// Validación básica
const validateFields = (
  name: string,
  rut: string,
  email: string,
  password: string,
  confirmPassword: string
) => {
  if (!name || !rut || !email || !password || !confirmPassword)
    return 'Por favor completa todos los campos.';
  if (!/^[0-9]{7,8}-[0-9kK]$/.test(rut.replace(/\./g, '')))
    return 'RUT inválido. Ejemplo: 12.345.678-9';
  if (password.length < 6)
    return 'La contraseña debe tener al menos 6 caracteres.';
  if (password !== confirmPassword)
    return 'Las contraseñas no coinciden.';
  return null;
};

export default function RegisterScreen() {
  const { register } = useAuth();
  const navigation = useNavigation<any>();

  const [name, setName] = useState('');
  const [rut, setRut] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'patient' | 'doctor' | 'nurse' | 'guardian'>('patient');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    const errorMessage = validateFields(name, rut, email, password, confirmPassword);
    if (errorMessage) {
      Alert.alert('Error', errorMessage);
      return;
    }

    try {
      setLoading(true);
      const userData = { name, rut, email, password, role };

      await register(userData);

      Alert.alert('Registro exitoso', `Bienvenido/a ${name}!`);

      // Redirigir al dashboard correspondiente
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
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.message || 'Hubo un problema al registrar. Intenta nuevamente.'
      );
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
          placeholder="RUT (12.345.678-9)"
          value={rut}
          onChangeText={(v) => setRut(formatRUT(v))}
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

        {/* Selector de Rol */}
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
