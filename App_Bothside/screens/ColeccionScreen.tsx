import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ColeccionScreen() {
  return (
    <View style={styles.center}>
      <Text style={styles.title}>Mi Colección</Text>
      {/* Aquí irá la tabla de discos */}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, marginBottom: 20 },
}); 