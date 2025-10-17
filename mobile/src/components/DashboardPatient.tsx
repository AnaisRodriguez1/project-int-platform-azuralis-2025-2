import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function DashboardPatient() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏥 Dashboard del Paciente</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: 'bold' },
});
