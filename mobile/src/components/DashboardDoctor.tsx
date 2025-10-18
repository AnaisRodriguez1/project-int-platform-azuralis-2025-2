import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext'; // 👈 Importamos el contexto

export default function DashboardDoctor() {
  const { user, logout } = useAuth(); // 👈 obtenemos el usuario y la función de logout

  return (
    <View style={styles.container}>
      <Text style={styles.text}> Dashboard del Doctor</Text>
      <Text style={styles.subtext}>Bienvenido, {user?.name}</Text>

      {/* Botón para cerrar sesión */}
      <TouchableOpacity style={styles.button} onPress={logout}>
        <Text style={styles.buttonText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  text: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  subtext: { fontSize: 16, color: '#555', marginBottom: 30 },
  button: {
    backgroundColor: '#fa8fb5',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
