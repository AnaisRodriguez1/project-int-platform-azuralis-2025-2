import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function DashboardPatient() {
  const { user, logout } = useAuth();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Mi Ficha Médica</Text>
            <Text style={styles.subtitle}>Bienvenido/a, {user?.name}</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <Text style={styles.logoutText}>Cerrar sesión</Text>
          </TouchableOpacity>
        </View>

        {/* Tarjetas resumen */}
        <View style={styles.grid}>
          <View style={[styles.infoCard, { backgroundColor: '#ffe4e6' }]}>
            <Text style={[styles.infoTitle, { color: '#9d174d' }]}>Próxima Consulta</Text>
            <Text style={[styles.infoValue, { color: '#be185d' }]}>No programada</Text>
          </View>

          <View style={[styles.infoCard, { backgroundColor: '#eff6ff' }]}>
            <Text style={[styles.infoTitle, { color: '#1e3a8a' }]}>Medicamentos Actuales</Text>
            <Text style={[styles.infoNumber, { color: '#1e40af' }]}>0</Text>
          </View>

          <View style={[styles.infoCard, { backgroundColor: '#f5f3ff' }]}>
            <Text style={[styles.infoTitle, { color: '#5b21b6' }]}>Documentos</Text>
            <Text style={[styles.infoNumber, { color: '#6d28d9' }]}>0</Text>
          </View>
        </View>

        {/* Contenido en desarrollo */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Contenido del dashboard en desarrollo...</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 15,
    color: '#6b7280',
    marginTop: 4,
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: '#fa8fb5',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  logoutText: {
    color: '#fa8fb5',
    fontWeight: 'bold',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoCard: {
    width: '30%',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  infoValue: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  infoNumber: {
    marginTop: 8,
    fontSize: 28,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 30,
    alignItems: 'center',
  },
  footerText: {
    color: '#6b7280',
    fontSize: 14,
    fontStyle: 'italic',
  },
});
