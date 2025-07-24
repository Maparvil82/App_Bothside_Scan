import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import type { User } from '@supabase/supabase-js';
import { View, Text, Button, StyleSheet } from 'react-native';

function ColeccionScreen() {
  return (
    <View style={styles.center}>
      <Text style={styles.title}>Mi Colección</Text>
      {/* Aquí irá la tabla de discos */}
    </View>
  );
}

function AddDiscoScreen() {
  return (
    <View style={styles.center}>
      <Text style={styles.title}>Añadir Disco</Text>
      {/* Aquí irá el formulario para añadir un nuevo disco */}
    </View>
  );
}

function ScanStickyScreen() {
  return (
    <View style={styles.center}>
      <Text style={styles.title}>Escanear Sticky</Text>
      {/* Aquí irá la funcionalidad de escaneo */}
    </View>
  );
}

function PerfilScreen({ user, onLogout }: { user: User; onLogout: () => void }) {
  return (
    <View style={styles.center}>
      <Text style={styles.title}>Perfil</Text>
      <Text>{user.email}</Text>
      <Button title="Cerrar sesión" onPress={onLogout} />
      {/* Aquí irá la configuración y el avatar */}
    </View>
  );
}

const Tab = createBottomTabNavigator();

export default function HomeScreen({ user, onLogout }: { user: User; onLogout: () => void }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName = '';
          if (route.name === 'Colección') iconName = 'albums-outline';
          if (route.name === 'Añadir') iconName = 'add-circle-outline';
          if (route.name === 'Escanear') iconName = 'qr-code-outline';
          if (route.name === 'Perfil') iconName = 'person-circle-outline';
          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Colección" component={ColeccionScreen} />
      <Tab.Screen name="Añadir" component={AddDiscoScreen} />
      <Tab.Screen name="Escanear" component={ScanStickyScreen} />
      <Tab.Screen name="Perfil">
        {() => <PerfilScreen user={user} onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, marginBottom: 20 },
}); 