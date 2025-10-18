import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function DashboardGuardian() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧑‍👩‍👧 Dashboard del Guardián</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: 'bold' },
});
