import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import type { User } from '@supabase/supabase-js';

export default function HomeScreen({ user, onLogout }: { user: User; onLogout: () => void }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>¡Bienvenido, {user.email}!</Text>
      <Button title="Cerrar sesión" onPress={onLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, marginBottom: 20 },
}); 