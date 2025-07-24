import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

function ManualTab() {
  return (
    <View style={styles.center}>
      <Text style={styles.title}>Añadir Disco Manualmente</Text>
      {/* Aquí irá el formulario manual */}
    </View>
  );
}

function ScannerTab() {
  return (
    <View style={styles.center}>
      <Text style={styles.title}>Escanear para Añadir Disco</Text>
      {/* Aquí irá el scanner */}
    </View>
  );
}

const Tab = createMaterialTopTabNavigator();

export default function AddDiscoScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      
      <Tab.Navigator
        screenOptions={{
          tabBarLabelStyle: { fontSize: 15, fontWeight: 'bold' },
          tabBarIndicatorStyle: { backgroundColor: '#00b894' },
          tabBarActiveTintColor: '#00b894',
          tabBarInactiveTintColor: '#888',
          tabBarStyle: { backgroundColor: '#fff' },
        }}
      >
        <Tab.Screen name="Manual" component={ManualTab} />
        <Tab.Screen name="Scanner" component={ScannerTab} />
      </Tab.Navigator>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, color: '#222' },
}); 