import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import type { User } from '@supabase/supabase-js';
import ColeccionScreen from './ColeccionScreen';
import AddDiscoScreen from './AddDiscoScreen';
import ScanStickyScreen from './ScanStickyScreen';
import PerfilScreen from './PerfilScreen';

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
      <Tab.Screen name="Colección">
        {() => <ColeccionScreen user={user} />}
      </Tab.Screen>
      <Tab.Screen name="Añadir" component={AddDiscoScreen} />
      <Tab.Screen name="Escanear" component={ScanStickyScreen} />
      <Tab.Screen name="Perfil">
        {() => <PerfilScreen user={user} onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
} 