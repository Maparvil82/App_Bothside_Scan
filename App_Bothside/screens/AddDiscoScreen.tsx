import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AddDiscoScreen() {
  return (
    <View style={styles.center}>
      <Text style={styles.title}>Añadir Disco</Text>
      {/* Aquí irá el formulario para añadir un nuevo disco */}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, marginBottom: 20 },
}); 