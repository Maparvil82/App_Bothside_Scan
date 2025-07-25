import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, Button, FlatList, ActivityIndicator, TouchableOpacity, Alert, ScrollView, Image } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import axios from 'axios';
import { supabase } from '../supabaseClient';
import { DISCOGS_TOKEN } from './DiscogsAuthConfig';
import { registerRootComponent } from 'expo';
import App from '../App';

registerRootComponent(App);

function ManualTab() {
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [versions, setVersions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedVersion, setSelectedVersion] = useState<any | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [showVersions, setShowVersions] = useState(false);

  React.useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user?.id) setUserId(data.user.id);
    })();
  }, []);

  // Función para normalizar strings (quita espacios, mayúsculas, guiones)
  function normalize(str: string) {
    return str
      .toLowerCase()
      .replace(/[-–—]/g, '-') // unifica guiones
      .replace(/\s+/g, ' ')   // unifica espacios
      .trim();
  }

  // Función para obtener el artista de una versión
  async function fetchArtistForVersion(version: any) {
    if (version.artist) return version.artist;
    if (version.artists && Array.isArray(version.artists) && version.artists[0]?.name) return version.artists[0].name;
    // Si no viene, hacer petición extra
    if (version.id) {
      try {
        const { data } = await axios.get(`https://api.discogs.com/releases/${version.id}`);
        if (data.artists && Array.isArray(data.artists) && data.artists[0]?.name) {
          return data.artists[0].name;
        }
      } catch (e) {
        // ignorar error
      }
    }
    return 'Artista no disponible';
  }

  // Modificar handleSearch para poblar el campo artista en cada versión
  const handleSearch = async () => {
    setError('');
    setVersions([]);
    setSelectedVersion(null);
    setShowVersions(false);
    if (!artist.trim() || !album.trim()) {
      setError('Debes ingresar artista y álbum');
      return;
    }
    setLoading(true);
    try {
      const searchUrl = `https://api.discogs.com/database/search`;
      const params = {
        artist: artist.trim(),
        release_title: album.trim(),
        type: 'release',
        per_page: 10,
        token: DISCOGS_TOKEN
      };
      const { data } = await axios.get(searchUrl, { params });
      const normalizedArtist = normalize(artist);
      const normalizedAlbum = normalize(album);
      const exact = (data.results || []).find((item: any) => {
        const itemTitle = item.title ? normalize(item.title) : '';
        const [titleArtist, titleAlbum] = itemTitle.split(' - ');
        // Coincidencia flexible: el artista buscado debe estar incluido en el artista del resultado
        return (
          titleArtist && titleAlbum &&
          titleArtist.includes(normalizedArtist) &&
          titleAlbum === normalizedAlbum &&
          item.master_id
        );
      });
      if (!exact) {
        // Mostrar el resultado más cercano para depuración
        let closest = '';
        if ((data.results || []).length > 0) {
          const first = data.results[0];
          closest = `¿Quizás quisiste: ${first.title || ''}?`;
        }
        setError('No se encontró coincidencia exacta con master.' + (closest ? `\n${closest}` : ''));
        setLoading(false);
        return;
      }
      const versionsUrl = `https://api.discogs.com/masters/${exact.master_id}/versions`;
      const { data: versionsData } = await axios.get(versionsUrl, { params: { per_page: 50, token: DISCOGS_TOKEN } });
      const VINYL_KEYWORDS = ['vinyl', 'lp', '12"', '7"', '10"'];
      let vinyls = (versionsData.versions || []).filter((v: any) => {
        if (!v.format) return false;
        const formats = Array.isArray(v.format) ? v.format : [v.format];
        return formats.some((f: string) =>
          VINYL_KEYWORDS.some(keyword => f.toLowerCase().includes(keyword))
        );
      });
      // Obtener artista para cada versión
      vinyls = await Promise.all(vinyls.map(async (v: any) => {
        v._artist = await fetchArtistForVersion(v);
        return v;
      }));
      setVersions(vinyls);
      setShowVersions(true);
      if (vinyls.length === 0) setError('No se encontraron ediciones en vinilo.');
    } catch (err) {
      setError('Error al buscar en Discogs. Revisa tu conexión o el token.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectVersion = (version: any) => {
    setSelectedVersion(version);
    setShowVersions(false);
  };

  const handleSave = async () => {
    if (!selectedVersion) return;
    try {
      const { data, error } = await supabase.functions.invoke('save-discogs-release', {
        body: {
          discogsReleaseId: Number(selectedVersion.id),
          userId: userId
        }
      });
      if (error) {
        // ALERT TEMPORAL DE DEPURACIÓN
        Alert.alert('Depuración', `userId: ${userId}\n\ndata: ${JSON.stringify(data)}\n\nerror: ${JSON.stringify(error)}`);
        let errorMsg = error.message || '';
        // Si la función devuelve un body con mensaje de error, mostrarlo
        if (error.details) errorMsg += `\n${error.details}`;
        if (data && typeof data === 'object' && data.error) errorMsg += `\n${data.error}`;
        throw new Error(errorMsg || 'Error desconocido en función Supabase');
      }
      Alert.alert('Éxito', 'Álbum de vinilo añadido a tu colección');
      setSelectedVersion(null);
      setVersions([]);
      setArtist('');
      setAlbum('');
    } catch (err: any) {
      // Mostrar el mensaje de error completo
      Alert.alert('Error', err.message || JSON.stringify(err) || 'No se pudo guardar el álbum');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.center} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Añadir Disco Manualmente</Text>
      <TextInput
        style={styles.input}
        placeholder="Nombre del artista"
        value={artist}
        onChangeText={setArtist}
        autoCapitalize="words"
      />
      <TextInput
        style={styles.input}
        placeholder="Nombre del álbum"
        value={album}
        onChangeText={setAlbum}
        autoCapitalize="words"
      />
      <Button title="Buscar en Discogs" onPress={handleSearch} disabled={loading} />
      {loading && <ActivityIndicator style={{ marginTop: 16 }} />}
      {error ? <Text style={{ color: 'red', marginTop: 10, textAlign: 'center' }}>{error}</Text> : null}
      {/* Previsualización de versión seleccionada */}
      {selectedVersion && !showVersions && (
        <View style={styles.previewCard}>
          <View style={styles.previewHeader}>
            {selectedVersion.thumb && (
              <Image 
                source={{ uri: selectedVersion.thumb }} 
                style={styles.albumCover}
                resizeMode="cover"
              />
            )}
            <View style={styles.previewInfo}>
              <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 6 }}>
                {selectedVersion.title && (selectedVersion.title.includes(' - ') || selectedVersion.title.includes(' / '))
                  ? selectedVersion.title.split(/[-\/]/)[1]?.trim()
                  : selectedVersion.title}
              </Text>
              <Text style={{ color: '#555' }}>
                {selectedVersion._artist || 'Artista no disponible'}
              </Text>
              <Text style={{ color: '#888' }}>
                Año edición: {selectedVersion.released ? selectedVersion.released.substring(0, 4) : (selectedVersion.year || '—')}
              </Text>
              <Text style={{ color: '#888' }}>
                {Array.isArray(selectedVersion.label) ? selectedVersion.label.join(', ') : selectedVersion.label || ''}
              </Text>
              <Text style={{ color: '#888' }}>Catálogo: {selectedVersion.catno}</Text>
              <Text style={{ color: '#888' }}>Formato: {selectedVersion.format}</Text>
            </View>
          </View>
          <Button title="Ver otras versiones" onPress={() => setShowVersions(true)} color="#888" />
          <Button title="Guardar en mi colección" onPress={handleSave} color="#00b894" />
        </View>
      )}
      {/* Lista de versiones para seleccionar */}
      {showVersions && versions.length > 0 && (
        <View style={{ width: '100%', marginTop: 16 }}>
          <Text style={{ fontWeight: 'bold', marginBottom: 8, textAlign: 'center' }}>Selecciona una versión en vinilo:</Text>
          <FlatList
            data={versions}
            keyExtractor={item => item.id?.toString() || item.title}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.resultCard, selectedVersion?.id === item.id && { borderColor: '#00b894', borderWidth: 2 }]}
                onPress={() => handleSelectVersion(item)}
              >
                <View style={styles.resultHeader}>
                  {item.thumb && (
                    <Image 
                      source={{ uri: item.thumb }} 
                      style={styles.resultAlbumCover}
                      resizeMode="cover"
                    />
                  )}
                  <View style={styles.resultInfo}>
                    <Text style={{ fontWeight: 'bold' }}>
                      {item.title && (item.title.includes(' - ') || item.title.includes(' / '))
                        ? item.title.split(/[-\/]/)[1]?.trim()
                        : item.title}
                    </Text>
                    <Text style={{ color: '#555' }}>
                      {item._artist || 'Artista no disponible'}
                    </Text>
                    <Text style={{ color: '#888' }}>
                      Año edición: {item.released ? item.released.substring(0, 4) : (item.year || '—')}
                    </Text>
                    <Text style={{ color: '#888' }}>
                      {Array.isArray(item.label) ? item.label.join(', ') : item.label || ''}
                    </Text>
                    <Text style={{ color: '#888' }}>Catálogo: {item.catno}</Text>
                    <Text style={{ color: '#888' }}>Formato: {item.format}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            style={{ width: '100%' }}
            ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#888', marginTop: 16 }}>No hay versiones en vinilo.</Text>}
          />
        </View>
      )}
    </ScrollView>
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
  center: { flexGrow: 1, justifyContent: 'flex-start', alignItems: 'center', backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, color: '#222', textAlign: 'center' },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  resultCard: {
    width: '100%',
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  previewCard: {
    width: '100%',
    backgroundColor: '#eafaf4',
    borderRadius: 10,
    padding: 16,
    marginTop: 20,
    marginBottom: 10,
    borderColor: '#00b894',
    borderWidth: 1.5,
    alignItems: 'center',
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
    marginBottom: 12,
  },
  albumCover: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  previewInfo: {
    flex: 1,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  resultAlbumCover: {
    width: 60,
    height: 60,
    borderRadius: 6,
    marginRight: 10,
  },
  resultInfo: {
    flex: 1,
  },
}); 