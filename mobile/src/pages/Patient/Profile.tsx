import React from "react";
import { View, StyleSheet } from "react-native";
import { EditableProfile } from "./EditableProfile"; // Asegúrate que la ruta sea correcta

export function ProfilePatient() {
  return (
    <View style={styles.container}>
      <EditableProfile />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    padding: 16,
  },
});
