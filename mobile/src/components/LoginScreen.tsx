import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, Alert, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getMockUsers } from '../services/mockApi';
import { useNavigation } from '@react-navigation/native';

export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirección según rol
  const getDashboardRoute = (role: string) => {
    switch (role) {
      case 'doctor': return 'DashboardDoctor';
      case 'patient': return 'DashboardPatient';
      case 'guardian': return 'DashboardGuardian';
      case 'nurse': return 'DashboardNurse';
      default: return 'Login';
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Por favor ingresa tu correo y contraseña');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const user = await login(email, password);
      const route = getDashboardRoute(user.role);
      navigation.navigate(route, { user });
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>🎗 Ficha Médica Portátil</Text>
        <Text style={styles.subtitle}>Universidad Católica del Norte</Text>
      </View>

      {/* Formulario */}
      <View style={styles.card}>
        <Text style={styles.title}>Iniciar Sesión</Text>

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
          onSubmitEditing={handleLogin}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.button, isLoading && { backgroundColor: '#aaa' }]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Iniciar Sesión</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Usuarios de prueba */}
      <View style={styles.mockBox}>
        <Text style={styles.mockTitle}>👥 Usuarios de prueba:</Text>
        {getMockUsers().map((user) => (
          <View key={user.id} style={styles.mockRow}>
            <Text style={styles.mockRole}>{user.role}:</Text>
            <Text style={styles.mockEmail}>{user.email}</Text>
          </View>
        ))}
        <Text style={styles.mockHint}>💡 Contraseña: cualquiera funciona</Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Sistema desarrollado para mejorar la atención oncológica.</Text>
        <Text style={styles.footerText}>© 2025 Azuralis</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#f8faff', alignItems: 'center', justifyContent: 'center', padding: 20 },
  header: { alignItems: 'center', marginBottom: 30 },
  logo: { fontSize: 22, fontWeight: 'bold', color: '#ff6299' },
  subtitle: { fontSize: 14, color: '#555' },
  card: { width: '100%', backgroundColor: '#fff', borderRadius: 12, padding: 20, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
  title: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginBottom: 15 },
  button: { backgroundColor: '#fa8fb5', padding: 14, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  error: { color: 'red', textAlign: 'center', marginBottom: 10 },
  mockBox: { marginTop: 20, backgroundColor: '#e8f0ff', padding: 15, borderRadius: 10, width: '100%' },
  mockTitle: { fontWeight: 'bold', color: '#0033a0', marginBottom: 5 },
  mockRow: { flexDirection: 'row', justifyContent: 'space-between' },
  mockRole: { fontWeight: '500', color: '#0033a0' },
  mockEmail: { color: '#0033a0' },
  mockHint: { marginTop: 5, fontStyle: 'italic', fontSize: 12, color: '#0033a0' },
  footer: { marginTop: 25, alignItems: 'center' },
  footerText: { fontSize: 12, color: '#777', textAlign: 'center' },
});
