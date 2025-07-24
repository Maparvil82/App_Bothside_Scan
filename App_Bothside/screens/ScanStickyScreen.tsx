import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ScanStickyScreen() {
  return (
    <View style={styles.center}>
      <Text style={styles.title}>Escanear Sticky</Text>
      {/* Aquí irá la funcionalidad de escaneo */}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, marginBottom: 20 },
}); 