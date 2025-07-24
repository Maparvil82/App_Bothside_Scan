import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, ActivityIndicator, SafeAreaView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../supabaseClient';
import type { User } from '@supabase/supabase-js';

interface Album {
  id: string;
  title: string;
  artist: string | null;
  cover_url: string | null;
  release_year?: string | number | null;
  label?: string | null;
}

export default function ColeccionScreen({ user }: { user: User }) {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchCollection = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: queryError } = await supabase
          .from('user_collection')
          .select(`
            albums!inner (
              id,
              title,
              artist,
              cover_url,
              release_year,
              label
            )
          `)
          .eq('user_id', user.id)
          .order('added_at', { ascending: false });

        if (queryError) throw queryError;

        const processedAlbums = (data || []).map((item: any) => ({
          id: item.albums.id,
          title: item.albums.title,
          artist: item.albums.artist,
          cover_url: item.albums.cover_url,
          release_year: item.albums.release_year,
          label: item.albums.label,
        }));
        setAlbums(processedAlbums);
      } catch (err: any) {
        setError(err.message || 'Error al cargar la colección');
      } finally {
        setLoading(false);
      }
    };
    fetchCollection();
  }, [user]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#00b894" />
        <Text style={{ marginTop: 16 }}>Cargando tu colección...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ color: 'red' }}>{error}</Text>
      </View>
    );
  }

  if (albums.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Mi Colección</Text>
        <Text>Tu colección está vacía. ¡Agrega tu primer álbum!</Text>
      </View>
    );
  }

  // Filtrar álbumes según el texto de búsqueda
  const filteredAlbums = albums.filter(album => {
    const searchLower = search.toLowerCase();
    return (
      album.title.toLowerCase().includes(searchLower) ||
      (album.artist && album.artist.toLowerCase().includes(searchLower)) ||
      (album.label && album.label.toLowerCase().includes(searchLower))
    );
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <Text style={styles.title}>Mi Colección</Text>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={22} color="#aaa" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por título, artista o sello..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor="#aaa"
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
        />
      </View>
      <FlatList
        data={filteredAlbums}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 64 }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 32 }}>
            <Text style={{ color: '#888' }}>No se encontraron discos.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.albumCard}>
            <Image
              source={item.cover_url ? { uri: item.cover_url } : require('../assets/adaptive-icon.png')}
              style={styles.cover}
              resizeMode="cover"
            />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.albumTitle}>{item.title}</Text>
              <Text style={styles.albumArtist}>{item.artist || 'Artista desconocido'}</Text>
              <Text style={styles.albumInfo}>{item.label || 'Sello desconocido'} • {item.release_year || 'Año desconocido'}</Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 24, marginBottom: 20, fontWeight: 'bold', textAlign: 'center' },
  albumCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cover: {
    width: 60,
    height: 60,
    borderRadius: 6,
    backgroundColor: '#e0e0e0',
  },
  albumTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },
  albumArtist: {
    fontSize: 14,
    color: '#555',
    marginTop: 2,
  },
  albumInfo: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    borderColor: '#e0e0e0',
    borderWidth: 1,
    borderRadius: 8,
    marginHorizontal: 12,
    marginBottom: 10,
    height: 50,
    paddingHorizontal: 8,
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#222',
    backgroundColor: 'transparent',
    paddingLeft: 0,
    borderWidth: 0,
  },
}); 