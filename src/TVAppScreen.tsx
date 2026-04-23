// src/TVAppScreen.tsx

import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import Card1 from './components/Cards/Card1';
import { useStrapiContext } from './context/StrapiContext';
import { loadFeedData } from './utils/DspUtils';

const CARD_STYLE_ID = 'cirhcy1ed17lk61005cncfhk';
const FEED_URL =
  'https://tbndsp-prod.trilogyapps.com/v1/virtualfeed?playlistid=Mfcir6Mo&page_offset=1&page_limit=100';

const TVAppScreen = ({ navigation }: any) => {
  const { cardStyles } = useStrapiContext();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFeedData(FEED_URL, {
      method: 'GET',
      onResponse: (data: any) => {
        console.log('📡 Feed response received');
        console.log('📋 entry count:', data?.entry?.length ?? 0);

        if (data?.entry?.length > 0) {
          const entryData = data.entry[0];
          console.log('📋 First entry:', JSON.stringify(entryData, null, 2));

          setItem({
            documentId: entryData.id ?? 'entry-0',
            // ❌ Do NOT pass styles here — Card1 looks them up from
            //    StrapiContext using cardStyleId directly
            entryData,
          });
        } else {
          setError('No entries found in feed');
        }
        setLoading(false);
      },
      onError: (err: any) => {
        console.error('❌ Feed fetch failed:', err);
        setError('Network Error');
        setLoading(false);
      },
    });
  }, []); // no cardStyles dependency needed — Card1 reads context itself

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {item && (
        <Card1
          itemContent={item}
          cardStyleId={CARD_STYLE_ID}
          rowHasFocus={true}
          itemHasFocus={true}
          onSelected={(entryData: any) =>
            navigation.push('Detail', { entry: entryData })
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  errorText: {
    color: 'red',
    fontSize: 18,
  },
});

export default TVAppScreen;
