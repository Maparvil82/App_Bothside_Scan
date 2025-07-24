import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import type { User } from '@supabase/supabase-js';

export default function PerfilScreen({ user, onLogout }: { user: User; onLogout: () => void }) {
  return (
    <View style={styles.center}>
      <Text style={styles.title}>Perfil</Text>
      <Text>{user.email}</Text>
      <Button title="Cerrar sesión" onPress={onLogout} />
      {/* Aquí irá la configuración y el avatar */}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, marginBottom: 20 },
}); 