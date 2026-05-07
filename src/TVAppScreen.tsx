import React, { useEffect, useState } from 'react';
import { Text, View, ActivityIndicator, StyleSheet, ScrollView, TouchableOpacity, Pressable } from 'react-native';
import CardType1 from './components/Cards/CardType1';
import CardType2 from './components/Cards/CardType2';
import HorizontalList from './components/HorizontalList/HorizontalList';
import { MOCK_HLIST_CONFIG, MOCK_GRID_CONFIG } from './mockData';


export default function TVAppScreen({ navigation }: any) {
  const [item1, setItem1] = useState<any>(null);
  const [item2, setItem2] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [r1, r2] = await Promise.all([
          fetch("https://tbndsp-prod.trilogyapps.com/v1/virtualfeed?playlistid=Mfcir6Mo&page_offset=1&page_limit=100"),
          fetch("https://tbndsp-prod.trilogyapps.com/v1/virtualfeed?playlistid=njwQwB2k&page_offset=1&page_limit=100")
        ]);
        const d1 = await r1.json();
        const d2 = await r2.json();
        setItem1(d1.entry);
        setItem2(d2.entry);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={{ flexDirection: 'row', gap: 20, width: '100%', paddingHorizontal: 20 }}>
        <Text style={styles.title}>TVApp</Text>
        
        <Pressable 
          onPress={() => (navigation as any).navigate('HomeFeed')}
          style={({ focused }) => [
            styles.navButton,
            { 
              backgroundColor: focused ? '#FF9500' : '#333',
              borderColor: focused ? '#ffffff' : 'transparent',
              transform: [{ scale: focused ? 1.1 : 1 }]
            }
          ]}
        >
          <Text style={styles.navButtonText}>Go to Home Feed →</Text>
        </Pressable>

        <Pressable 
          onPress={() => (navigation as any).navigate('Grid')}
          style={({ focused }) => [
            styles.navButton,
            { 
              backgroundColor: focused ? '#007AFF' : '#333',
              borderColor: focused ? '#ffffff' : 'transparent',
              transform: [{ scale: focused ? 1.1 : 1 }]
            }
          ]}
        >
          <Text style={styles.navButtonText}>Go to Grid →</Text>
        </Pressable>
      </View>
      
      <View style={styles.cardSection}>
        <Text style={styles.sectionHeader}>Card Type 1</Text>
        {item1 && item1.length > 0 ? (
          <CardType1 item={item1[0]} cardStyleId="rqs7myf1ootmbki3d4ezk4x4" />
        ) : (
          <Text style={{ color: '#fff' }}>No items for Card 1</Text>
        )}
      </View>

      <View style={styles.cardSection}>
        <Text style={styles.sectionHeader}>Card Type 2</Text>
        {item2 && item2.length > 0 ? (
          <CardType2 item={item2[0]} cardStyleId="juialinao8mcig0kzqdykdx3" />
        ) : (
          <Text style={{ color: '#fff' }}>No items for Card 2</Text>
        )}
      </View>

      <View style={[styles.cardSection, { width: '100%', alignItems: 'flex-start' }]}>
        <Text style={[styles.sectionHeader, { paddingHorizontal: 20 }]}>Horizontal List Component</Text>
        <HorizontalList config={MOCK_HLIST_CONFIG} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingVertical: 40,
    backgroundColor: '#000',
    alignItems: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  navButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 2,
    height: 50,
    justifyContent: 'center',
  },
  navButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionHeader: {
    color: '#aaa',
    fontSize: 18,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  cardSection: {
    marginBottom: 50,
    alignItems: 'center',
  }
});