import React from 'react';
import { FlatList, View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { useHpc } from '../../hooks/useHpc';
import HorizontalList from '../HorizontalList/HorizontalList';

/**
 * Main Home Feed component that renders a vertical list of horizontal rails.
 * Uses the useHpc hook for incremental (lazy) loading of rails.
 */
export default function HomeFeed() {
  const { data, loading, loadingMore, error, loadMore } = useHpc();

  const renderItem = ({ item }: { item: any }) => {
    // Each item from useHpc contains: index, feed_url, preset_name, extensions
    // We wrap this into a config object that HorizontalList expects
    const railConfig = {
      name: item.preset_name || 'Featured',
      feed: {
        feed_url: item.feed_url
      },
      // Essential: HorizontalList needs a card_style to render its items!
      card_style: {
        card_type: 'card_type_1',
        documentId: 'rqs7myf1ootmbki3d4ezk4x4', // Default style ID from your mocks
      },
      enable_title: true,
      cell_gap: 20,
    };

    return (
      <View style={styles.railContainer}>
        <HorizontalList config={railConfig} />
      </View>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#ffffff" />
      </View>
    );
  };

  if (loading && data.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  if (error && data.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Error loading home feed: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={(item) => `rail-${item.index}-${item.preset_name}`}
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={renderFooter}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      // Important for TV focus stability:
      removeClippedSubviews={false}
      windowSize={10}
    /></View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#000000',
  },
  listContent: {
    paddingVertical: 60, // More top/bottom breathing room
    paddingHorizontal: 20,
  },
  railContainer: {
    marginBottom: 60, // Increased gap to prevent vertical focus jumping
    minHeight: 150,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 400,
  },
  footerLoader: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 16,
  }
});
